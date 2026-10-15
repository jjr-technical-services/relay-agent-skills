#!/usr/bin/env node
// Per-area deep capture template. Copy to <pack>/harness/<area>.mjs, fill in the steps, run:
//   node harness/<area>.mjs [--config pack.config.json] [--only <label substring>]
//
// One area agent owns one script and one shots/<area>/ folder. Name every shot
//   <route-slug>__<nn>-<state>__<desktop|mobile>.png
// with nn counting up per route in the order a user meets the states, so a sorted folder reads as a flow.
// Read the route's source first: source is the truth for which tabs, dialogs and states exist.
// Do destructive flows (delete, cancel, reset) on users and rows you created with your area prefix;
// on shared personas, intercept writes with page.route so other agents' state is untouched.
import path from 'node:path';
import {
  argValue, forceBody, forceStatus, holdRequests, launch, loadConfig, newPage,
  reveal, rewriteJson, settle, shot, shotName, writeJson,
} from '../scripts/lib.mjs'; // adjust to where the kit's scripts folder lives

const AREA = 'example-area';
const config = loadConfig();
const only = argValue('only', '');
const log = [];
const browser = await launch(config);

// Run one capture job in a fresh context so state never leaks between shots.
async function job(label, { persona = config.defaultPersonas[0], viewport = 'desktop' } = {}, fn) {
  if (only && !label.includes(only)) return;
  const { context, page } = await newPage(browser, config, { persona, viewport });
  try {
    const files = await fn(page, viewport);
    log.push({ label, persona, viewport, ok: true, url: page.url().replace(config.origin, ''), files, errors: page.__errors });
  } catch (error) {
    log.push({ label, persona, viewport, ok: false, error: String(error.message).slice(0, 300), url: page.url().replace(config.origin, '') });
    console.error('FAIL', label, viewport, String(error.message).slice(0, 200));
  } finally {
    await context.close();
  }
}

// Parallel agents share one IP, so session checks can hit a 429 and a signed-in page renders signed
// out. Retry the load once after a back-off; shot() still logs anything that stays rate-limited.
async function go(page, route) {
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    page.__rateLimited = 0;
    response = await page.goto(config.origin + route, { waitUntil: 'domcontentloaded' });
    await settle(page);
    if (response?.status() !== 429 && !page.__rateLimited) break;
    await page.waitForTimeout(11000);
  }
  await reveal(page, config);
  return response?.status();
}

const snap = (page, route, n, state, viewport, options) => shot(page, config, AREA, shotName(route, n, state, viewport), options);

// ---- 1. Default populated state, both viewports -------------------------------------------
for (const viewport of ['desktop', 'mobile']) {
  await job('/example default', { viewport }, async (page) => {
    await go(page, '/example');
    return [await snap(page, '/example', 1, 'default', viewport)];
  });
}

// ---- 2. Tabs and view toggles that change layout ------------------------------------------
await job('/example tabs', {}, async (page) => {
  await go(page, '/example');
  const files = [];
  for (const [n, tab] of [[2, 'Activity'], [3, 'Settings']]) {
    await page.getByRole('tab', { name: tab }).click();
    await settle(page, 600);
    files.push(await snap(page, '/example', n, `tab-${tab.toLowerCase()}`, 'desktop'));
  }
  return files;
});

// ---- 3. Overlays: open, then capture the viewport (not full page) --------------------------
await job('/example create dialog + validation', {}, async (page) => {
  await go(page, '/example');
  await page.getByRole('button', { name: /new|create/i }).first().click();
  await page.getByRole('dialog').waitFor();
  const files = [await snap(page, '/example', 4, 'create-dialog', 'desktop', { fullPage: false })];
  await page.getByRole('dialog').getByRole('button', { name: /save|create/i }).click();
  await page.waitForTimeout(400);
  files.push(await snap(page, '/example', 5, 'create-dialog-validation', 'desktop', { fullPage: false }));
  return files;
});

// ---- 4. Forced states: empty, loading, error ------------------------------------------------
await job('/example empty', {}, async (page) => {
  await forceBody(page, '**/api/example**', '{"items":[]}');
  await go(page, '/example');
  return [await snap(page, '/example', 6, 'empty', 'desktop')];
});
await job('/example loading', {}, async (page) => {
  const release = await holdRequests(page, '**/api/example**');
  await page.goto(config.origin + '/example', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const files = [await snap(page, '/example', 7, 'loading', 'desktop', { fullPage: false })];
  await release();
  return files;
});
await job('/example error', {}, async (page) => {
  await forceStatus(page, '**/api/example**', 500);
  await go(page, '/example');
  return [await snap(page, '/example', 8, 'error-500', 'desktop')];
});

// ---- 4b. Stubbed state: rewrite a real response for a state the isolated build cannot reach ----
await job('/example ready (stubbed)', {}, async (page) => {
  await rewriteJson(page, '**/api/example**', (body) => ({ ...body, items: ['Ready to run'] }));
  await go(page, '/example');
  return [await snap(page, '/example', 10, 'ready-stubbed', 'desktop')];
});

// ---- 4c. Native dialogs never appear in screenshots: record their text for the spec ---------
// page.on('dialog', async (dialog) => { dialogText.push(dialog.message()); await dialog.dismiss(); });

// ---- 5. Permission: a persona without access, and logged out --------------------------------
await job('/example member denied', { persona: 'member' }, async (page) => {
  await go(page, '/example/admin');
  return [await snap(page, '/example_admin', 1, 'member-denied', 'desktop')];
});
await job('/example anon redirect', { persona: 'anon' }, async (page) => {
  await go(page, '/example');
  return [await snap(page, '/example', 9, 'anon-redirect', 'desktop', { fullPage: false })];
});

// ---- 6. Multi-step flow: one shot per step, numbered in order -------------------------------
await job('/example wizard flow', {}, async (page) => {
  await go(page, '/example/new');
  const files = [await snap(page, '/example_new', 1, 'step-1-details', 'desktop')];
  await page.getByLabel(/name/i).fill('Northwind spring campaign');
  await page.getByRole('button', { name: /continue|next/i }).click();
  await settle(page, 600);
  files.push(await snap(page, '/example_new', 2, 'step-2-options', 'desktop'));
  return files;
});

await browser.close();
writeJson(path.join(config.packDir, 'logs', `${AREA}.json`), log);
console.log(`${log.filter((row) => row.ok).length}/${log.length} jobs ok`);
