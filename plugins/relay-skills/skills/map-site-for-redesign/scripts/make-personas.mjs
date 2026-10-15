#!/usr/bin/env node
// Seed personas and fixture data through an app adapter, sign each persona in, and save its
// Playwright storageState to state/<persona>.json. Then prove each state is actually signed in.
//
//   node make-personas.mjs [--config pack.config.json] [--adapter adapters/relay.mjs] [--skip-seed]
//
// The adapter is the only app-specific code in the kit. See references/adapters.md for the interface
// and adapters/template.mjs for a starting point. Adapter paths resolve relative to the config file
// first, then to this scripts folder.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { argValue, launch, loadConfig, newPage, settle, storageStatePath, writeJson } from './lib.mjs';

const config = loadConfig();
const adapterArg = argValue('adapter', config.adapter);
if (!adapterArg || adapterArg === true) throw new Error('Set "adapter" in the pack config or pass --adapter.');
const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const adapterPath = [path.resolve(path.dirname(config.configFile), adapterArg), path.resolve(scriptsDir, adapterArg)]
  .find((candidate) => fs.existsSync(candidate));
if (!adapterPath) throw new Error(`Adapter not found: ${adapterArg}`);
const adapter = await import(pathToFileURL(adapterPath).href);
for (const required of ['seed', 'signIn']) {
  if (typeof adapter[required] !== 'function') throw new Error(`Adapter ${adapterPath} must export async ${required}().`);
}

// Adapters get kit helpers through ctx.kit instead of importing lib.mjs, so a copied adapter works from
// any folder (for example <pack>/adapters/).
const kit = await import('./lib.mjs');
const ctx = { config, origin: config.origin, appRoot: config.appRoot, options: config.adapterOptions, kit };
if (!process.argv.includes('--skip-seed')) {
  console.log(`seeding with ${adapter.name || path.basename(adapterPath)}`);
  await adapter.seed(ctx);
}

const loginPattern = new RegExp(config.adapterOptions.loginPathPattern || '/(login|signin|sign-in|auth)(/|$|\\?)');
const signedIn = config.personas.filter((persona) => persona.id !== 'anon');
for (const persona of signedIn) {
  const state = await adapter.signIn(persona, ctx);
  if (!state?.cookies?.length && !state?.origins?.length) throw new Error(`Adapter returned an empty storageState for ${persona.id}.`);
  writeJson(storageStatePath(config, persona.id), state);
  console.log(`${persona.id}: saved ${state.cookies?.length || 0} cookies`);
}

// Proof: a protected probe route must not bounce each persona to the login page.
const probe = config.adapterOptions.probeRoute || '/';
const browser = await launch(config);
const report = [];
for (const persona of signedIn) {
  const { context, page } = await newPage(browser, config, { persona: persona.id });
  await page.goto(config.origin + probe, { waitUntil: 'domcontentloaded' });
  await settle(page, 500);
  const finalPath = new URL(page.url()).pathname;
  const ok = !loginPattern.test(finalPath);
  report.push({ persona: persona.id, probe, finalPath, ok });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${persona.id} ${probe} -> ${finalPath}`);
  await context.close();
}
await browser.close();
writeJson(path.join(config.packDir, 'state', 'personas-report.json'), report);
if (report.some((row) => !row.ok)) {
  console.error('At least one persona is not signed in. Fix the adapter before capturing; logged-out captures are useless.');
  process.exit(1);
}
