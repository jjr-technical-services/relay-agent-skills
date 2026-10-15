#!/usr/bin/env node
// Classify every route as nav / linked / redirect / orphan / legacy-candidate.
//
//   node find-orphans.mjs [--config pack.config.json] [--routes routes.json] [--legacy-days 120]
//
// Evidence, strongest first:
//   nav      the route appears in a nav source file (config.navSources)
//   source   another source file references the route as a string literal (config.sourceDirs)
//   crawled  a captured page links to it (baseline.json links, routes.crawl.json edges)
//   redirect every baseline capture of the route ended somewhere else
// A route with none of these is an orphan; an orphan whose file has not changed for
// --legacy-days (git history from discover-routes.mjs --git) is a legacy candidate.
// Writes orphans.json and orphans.md. Treat the result as leads to verify, not verdicts.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_EXT = /\.(js|jsx|ts|tsx|mjs|cjs|vue|svelte|astro|md|mdx|html|rb|py|php)$/;

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A string literal that starts with the route: '/billing', "/billing?tab=x", `/agents/${id}`.
export function routeReferencePattern(route) {
  if (route === '/') return /["'`]\/["'`?#]/;
  const bracket = route.indexOf('[');
  if (bracket !== -1) {
    const base = route.slice(0, bracket);
    return new RegExp(`["'\`]${escape(base)}(\\$\\{|["'\`]\\s*\\+)`);
  }
  return new RegExp(`["'\`]${escape(route)}(["'\`?#]|/\\$\\{)`);
}

export function classifyRoutes({ routes, navText = '', sources = {}, baseline = [], crawlEdges = [], legacyDays = 120, now = new Date() }) {
  const inboundFromCrawl = new Map();
  const addInbound = (from, to) => {
    if (!to || from === to) return;
    if (!inboundFromCrawl.has(to)) inboundFromCrawl.set(to, new Set());
    inboundFromCrawl.get(to).add(from);
  };
  for (const record of baseline) for (const link of record.links || []) addInbound(record.url || record.route, link);
  for (const [from, to] of crawlEdges) addInbound(from, to);

  return routes.map((entry) => {
    const pattern = routeReferencePattern(entry.route);
    const ownFile = entry.file ? entry.file.replace(/\\/g, '/') : null;
    const inNav = pattern.test(navText);
    const sourceRefs = Object.entries(sources)
      .filter(([file, text]) => !(ownFile && file.endsWith(ownFile)) && pattern.test(text))
      .map(([file]) => file);
    const matcher = entry.dynamic ? new RegExp(`^${escape(entry.route).replace(/\\\[[^/]+?\\\]/g, '[^/]+')}$`) : null;
    const crawled = [...inboundFromCrawl.entries()]
      .filter(([target]) => (matcher ? matcher.test(target) : target === entry.route))
      .flatMap(([, from]) => [...from]);
    const captures = baseline.filter((record) => record.route === entry.route);
    const redirectTargets = [...new Set(captures.filter((record) => record.redirected).map((record) => record.finalUrl))];
    const allRedirect = captures.length > 0 && captures.every((record) => record.redirected);
    const lastDate = entry.lastCommit?.date ? new Date(entry.lastCommit.date) : null;
    const ageDays = lastDate ? Math.round((now - lastDate) / 86400000) : null;

    let classification;
    if (inNav) classification = 'nav';
    else if (allRedirect) classification = 'redirect';
    else if (sourceRefs.length || crawled.length) classification = 'linked';
    else if (ageDays !== null && ageDays >= legacyDays) classification = 'legacy-candidate';
    else classification = 'orphan';

    return {
      route: entry.route,
      classification,
      inNav,
      sourceRefCount: sourceRefs.length,
      sourceRefs: sourceRefs.slice(0, 5),
      crawledInbound: [...new Set(crawled)].slice(0, 5),
      redirectTargets,
      lastCommit: entry.lastCommit || null,
      ageDays,
    };
  });
}

function readSources(dirs) {
  const sources = {};
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (SOURCE_EXT.test(entry.name)) sources[full] = fs.readFileSync(full, 'utf8');
    }
  };
  dirs.forEach(walk);
  return sources;
}

function toMarkdown(rows) {
  const order = ['orphan', 'legacy-candidate', 'redirect', 'linked', 'nav'];
  const lines = ['# Route reachability', '', '| Route | Class | Nav | Source refs | Crawled inbound | Redirects to | Last change |', '|---|---|---|---|---|---|---|'];
  for (const row of [...rows].sort((a, b) => order.indexOf(a.classification) - order.indexOf(b.classification) || a.route.localeCompare(b.route))) {
    lines.push(`| \`${row.route}\` | ${row.classification} | ${row.inNav ? 'yes' : ''} | ${row.sourceRefCount} | ${row.crawledInbound.length} | ${row.redirectTargets.join(', ')} | ${row.lastCommit ? `${row.lastCommit.date} ${row.lastCommit.sha}` : ''} |`);
  }
  return `${lines.join('\n')}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { argValue, loadConfig, readJson, writeJson } = await import('./lib.mjs');
  const config = loadConfig();
  const routesJson = readJson(path.resolve(config.packDir, argValue('routes', 'routes.json')), []);
  const routes = Array.isArray(routesJson) ? routesJson : routesJson.routes;
  const baseline = readJson(path.join(config.packDir, 'baseline.json'), { results: [] }).results;
  const crawl = readJson(path.join(config.packDir, 'routes.crawl.json'), { edges: [] });
  const navText = config.navSources.filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  const rows = classifyRoutes({
    routes,
    navText,
    sources: readSources(config.sourceDirs),
    baseline,
    crawlEdges: crawl.edges || [],
    legacyDays: Number(argValue('legacy-days', 120)),
  });
  writeJson(path.join(config.packDir, 'orphans.json'), rows);
  fs.writeFileSync(path.join(config.packDir, 'orphans.md'), toMarkdown(rows));
  const counts = rows.reduce((acc, row) => ({ ...acc, [row.classification]: (acc[row.classification] || 0) + 1 }), {});
  console.log(JSON.stringify(counts));
}
