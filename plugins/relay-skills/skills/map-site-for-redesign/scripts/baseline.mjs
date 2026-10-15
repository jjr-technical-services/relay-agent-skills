#!/usr/bin/env node
// Baseline crawl: every route x persona x viewport. One full-page shot and one record each.
// Run it once before deep capture and hand baseline.json to every area agent. Budget roughly
// 40 minutes for ~140 routes x personas x 2 viewports at 2x serially; --concurrency divides that.
//
//   node baseline.mjs [--config pack.config.json] [--routes routes.json] [--filter /settings] [--concurrency 3]
//
// Static routes come from routes.json. Dynamic routes are visited only through config.dynamicSamples
// ({ "/agents/[id]": ["/agents/seed-1"] }); unresolved dynamic routes are listed as coverage gaps.
// Writes baseline.json with status, final URL after redirects, title, h1, page and console errors,
// bodyNotFound (a 200 that renders a not-found page), and the same-origin links on the page (find-orphans.mjs uses them as the crawled inbound graph).
import path from 'node:path';
import {
  argValue, launch, loadConfig, looksNotFound, newPage, personasForRoute, readJson, reveal,
  sameOriginPath, settle, shot, slugOf, writeJson,
} from './lib.mjs';

const config = loadConfig();
const routesFile = path.resolve(config.packDir, argValue('routes', 'routes.json'));
const filter = argValue('filter', '');
const concurrency = Number(argValue('concurrency', 3));
const ignore = config.ignoreRoutes.map((pattern) => new RegExp(pattern));

const listed = readJson(routesFile, null);
if (!listed) throw new Error(`Missing ${routesFile}. Run discover-routes.mjs or crawl-links.mjs first.`);
const entries = Array.isArray(listed) ? listed : listed.routes;

const targets = [];
const unresolved = [];
for (const entry of entries) {
  if (ignore.some((pattern) => pattern.test(entry.route))) continue;
  if (filter && !entry.route.includes(filter)) continue;
  const samples = entry.dynamic ? (config.dynamicSamples[entry.route] || (entry.sample ? [entry.sample] : [])) : [entry.route];
  if (!samples.length) { unresolved.push(entry.route); continue; }
  for (const url of samples) targets.push({ pattern: entry.route, url });
}

const jobs = [];
for (const target of targets) {
  for (const persona of personasForRoute(config, target.pattern)) {
    for (const viewport of Object.keys(config.viewports)) jobs.push({ ...target, persona, viewport });
  }
}

const browser = await launch(config);
const results = [];
async function runJob(job) {
  const { context, page } = await newPage(browser, config, { persona: job.persona, viewport: job.viewport });
  let status = null;
  try {
    const response = await page.goto(config.origin + job.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    status = response?.status() ?? null;
    await settle(page);
    await reveal(page, config);
  } catch (error) {
    status = `ERR ${String(error.message).slice(0, 80)}`;
  }
  const finalUrl = page.url().replace(config.origin, '');
  const name = `${slugOf(job.url)}__${job.persona}__${job.viewport}`;
  let file;
  try { file = await shot(page, config, 'baseline', name); } catch (error) { file = `SHOT_ERR ${String(error.message).slice(0, 80)}`; }
  const hrefs = await page.$$eval('a[href]', (anchors) => anchors.map((anchor) => anchor.getAttribute('href'))).catch(() => []);
  const record = {
    route: job.pattern,
    url: job.url,
    persona: job.persona,
    viewport: job.viewport,
    status,
    finalUrl,
    redirected: sameOriginPath(finalUrl, config.origin) !== sameOriginPath(job.url, config.origin),
    bodyNotFound: await looksNotFound(page),
    title: await page.title().catch(() => ''),
    h1: await page.locator('h1').first().innerText({ timeout: 1000 }).catch(() => ''),
    errors: page.__errors,
    consoleErrors: page.__consoleErrors.slice(0, 10),
    links: [...new Set(hrefs.map((href) => sameOriginPath(href, config.origin)).filter(Boolean))],
    blockedHosts: [...(context.__blocked || [])].sort(),
    rateLimitedResponses: page.__rateLimited,
    file,
  };
  results.push(record);
  console.log(status, job.url, job.persona, job.viewport, '->', finalUrl);
  await context.close();
}

const pending = [...jobs];
await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
  while (pending.length) await runJob(pending.shift());
}));
await browser.close();

results.sort((a, b) => `${a.route}${a.persona}${a.viewport}`.localeCompare(`${b.route}${b.persona}${b.viewport}`));
const blockedHosts = [...new Set(results.flatMap((record) => record.blockedHosts))].sort();
writeJson(path.join(config.packDir, 'baseline.json'), { generatedAt: new Date().toISOString(), origin: config.origin, unresolvedDynamicRoutes: unresolved, blockedHosts, results });
console.log(`blocked third-party hosts: ${blockedHosts.join(', ') || 'none'}`);
const failures = results.filter((record) => typeof record.status !== 'number' || record.status >= 400 || record.errors.length);
const hiddenNotFound = results.filter((record) => record.status === 200 && record.bodyNotFound);
console.log(`${results.length} captures, ${failures.length} with errors or >=400, ${hiddenNotFound.length} answered 200 with a not-found page, ${unresolved.length} dynamic routes without samples`);
