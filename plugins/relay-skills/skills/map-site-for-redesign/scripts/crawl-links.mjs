#!/usr/bin/env node
// Breadth-first same-origin link crawl, for sites without source or to cross-check source discovery.
//
//   node crawl-links.mjs [--config pack.config.json] [--persona owner] [--start /] [--max 300] [--out routes.crawl.json]
//
// Writes routes in the discover-routes.mjs shape plus the inbound link graph:
//   { routes: [{ route, dynamic:false, source:'crawl', status, inbound:[...] }], edges: [[from, to], ...] }
// Numeric and uuid-like path segments are collapsed to [id] so one list page does not explode into
// hundreds of detail routes; the first concrete URL is kept as a sample.
import path from 'node:path';
import { argValue, launch, loadConfig, newPage, sameOriginPath, settle, writeJson } from './lib.mjs';

const ID_SEGMENT = /^(\d+|[0-9a-f]{8}-[0-9a-f-]{27,}|[0-9a-z]{20,}|c[a-z0-9]{24})$/i;

export function patternOf(pathname) {
  return pathname.split('/').map((segment) => (ID_SEGMENT.test(segment) ? '[id]' : segment)).join('/') || '/';
}

async function main() {
  const config = loadConfig();
  const persona = argValue('persona', config.defaultPersonas[0]);
  const max = Number(argValue('max', 300));
  const ignore = config.ignoreRoutes.map((pattern) => new RegExp(pattern));
  const queue = [argValue('start', '/')];
  const seen = new Set(queue);
  const patterns = new Map();
  const edges = [];
  const browser = await launch(config);
  const { context, page } = await newPage(browser, config, { persona, viewport: 'desktop' });

  while (queue.length && patterns.size < max) {
    const route = queue.shift();
    let status = null;
    try {
      const response = await page.goto(config.origin + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
      status = response?.status() ?? null;
      await settle(page, 600);
    } catch (error) {
      status = `ERR ${String(error.message).slice(0, 80)}`;
    }
    const finalPath = sameOriginPath(page.url(), config.origin);
    const pattern = patternOf(route);
    if (!patterns.has(pattern)) {
      patterns.set(pattern, { route: pattern, dynamic: pattern.includes('['), sample: route, source: 'crawl', status, finalUrl: finalPath, inbound: [] });
    }
    const hrefs = await page.$$eval('a[href]', (anchors) => anchors.map((anchor) => anchor.getAttribute('href'))).catch(() => []);
    for (const href of hrefs) {
      const target = sameOriginPath(href, config.origin);
      if (!target || ignore.some((pattern) => pattern.test(target))) continue;
      edges.push([route, target]);
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
    console.log(status, route, '->', finalPath);
  }

  for (const [from, to] of edges) {
    const entry = patterns.get(patternOf(to));
    if (entry && !entry.inbound.includes(from) && patternOf(from) !== entry.route) entry.inbound.push(from);
  }
  const out = path.resolve(config.packDir, argValue('out', 'routes.crawl.json'));
  writeJson(out, { persona, routes: [...patterns.values()].sort((a, b) => a.route.localeCompare(b.route)), edges });
  console.log(`${patterns.size} route patterns, ${edges.length} links -> ${out}`);
  await context.close();
  await browser.close();
}

if (process.argv[1]?.endsWith('crawl-links.mjs')) await main();
