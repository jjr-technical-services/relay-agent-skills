#!/usr/bin/env node
// Discover every page route from framework route files, with optional git history per route.
//
//   node discover-routes.mjs --source <app repo> [--framework auto] [--out routes.json] [--git]
//
// Frameworks: next-app, next-pages, sveltekit, remix, nuxt, astro (auto-detected by folder layout).
// Output: [{ route, dynamic, file, framework, lastCommit?, commitCount? }] sorted by route.
// Sites without source: use crawl-links.mjs instead; the output shape is the same.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CODE = '(js|jsx|ts|tsx|mdx|md)';

const FRAMEWORKS = {
  'next-app': {
    roots: ['src/app', 'app'],
    detect: (dir) => walk(dir).some((file) => /(^|\/)page\.(js|jsx|ts|tsx|mdx)$/.test(file)),
    toRoute(relative) {
      const match = relative.match(new RegExp(`^(.*?)(?:^|/)page\\.${CODE}$`));
      if (!match) return null;
      const segments = match[1].split('/').filter(Boolean);
      if (segments.some((segment) => segment.startsWith('_'))) return null; // private folders
      if (segments.some((segment) => /^\(\.{1,3}\)|^\(\.\.\)/.test(segment))) return null; // intercepting routes
      const kept = segments.filter((segment) => !/^\(.*\)$/.test(segment) && !segment.startsWith('@'));
      return `/${kept.join('/')}`;
    },
  },
  'next-pages': {
    roots: ['src/pages', 'pages'],
    detect: (dir) => walk(dir).some((file) => new RegExp(`\\.${CODE}$`).test(file)),
    toRoute(relative) {
      if (!new RegExp(`\\.${CODE}$`).test(relative)) return null;
      if (/^api\//.test(relative) || /(^|\/)_(app|document|error)\./.test(relative) || /^(404|500)\./.test(relative)) return null;
      const route = relative.replace(new RegExp(`\\.${CODE}$`), '').replace(/(^|\/)index$/, '');
      return `/${route}`;
    },
  },
  sveltekit: {
    roots: ['src/routes'],
    detect: (dir) => walk(dir).some((file) => /\+page\.svelte$/.test(file)),
    toRoute(relative) {
      const match = relative.match(/^(.*?)(?:^|\/)\+page\.svelte$/);
      if (!match) return null;
      const kept = match[1].split('/').filter((segment) => segment && !/^\(.*\)$/.test(segment));
      return `/${kept.join('/')}`;
    },
  },
  remix: {
    roots: ['app/routes'],
    detect: (dir) => walk(dir).length > 0,
    toRoute(relative) {
      if (!/\.(jsx|tsx|js|ts|mdx)$/.test(relative)) return null;
      let name = relative.replace(/\/route\.(jsx|tsx|js|ts|mdx)$/, '').replace(/\.(jsx|tsx|js|ts|mdx)$/, '');
      if (/(^|\.)_?resource/.test(name)) return null;
      const segments = name.split(/[./]/).filter((segment) => segment && segment !== '_index' && !/^_/.test(segment))
        .map((segment) => segment.replace(/_$/, ''))
        .map((segment) => (segment === '$' ? '[...splat]' : segment.startsWith('$') ? `[${segment.slice(1)}]` : segment));
      return `/${segments.join('/')}`;
    },
  },
  nuxt: {
    roots: ['pages', 'src/pages'],
    detect: (dir) => walk(dir).some((file) => file.endsWith('.vue')),
    toRoute(relative) {
      if (!relative.endsWith('.vue')) return null;
      return `/${relative.replace(/\.vue$/, '').replace(/(^|\/)index$/, '')}`;
    },
  },
  astro: {
    roots: ['src/pages'],
    detect: (dir) => walk(dir).some((file) => /\.(astro|md|mdx)$/.test(file)),
    toRoute(relative) {
      if (!/\.(astro|md|mdx)$/.test(relative)) return null;
      return `/${relative.replace(/\.(astro|md|mdx)$/, '').replace(/(^|\/)index$/, '')}`;
    },
  },
};

function walk(dir, prefix = '') {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) return [];
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return walk(path.join(dir, entry.name), relative);
    return entry.isFile() ? [relative] : [];
  });
}

function normalizeRoute(route) {
  const clean = route.replace(/\/+/g, '/').replace(/(.)\/$/, '$1');
  return clean || '/';
}

export function detectFramework(source) {
  const order = ['next-app', 'sveltekit', 'remix', 'astro', 'nuxt', 'next-pages'];
  for (const name of order) {
    for (const root of FRAMEWORKS[name].roots) {
      const dir = path.join(source, root);
      if (fs.existsSync(dir) && FRAMEWORKS[name].detect(dir)) return { name, root: dir };
    }
  }
  return null;
}

export function discoverRoutes(source, { framework = 'auto' } = {}) {
  const detected = framework === 'auto'
    ? detectFramework(source)
    : { name: framework, root: FRAMEWORKS[framework].roots.map((root) => path.join(source, root)).find((dir) => fs.existsSync(dir)) };
  if (!detected?.root) throw new Error(`No route files found under ${source}. Pass --framework or use crawl-links.mjs.`);
  const spec = FRAMEWORKS[detected.name];
  const byRoute = new Map();
  for (const relative of walk(detected.root)) {
    const route = spec.toRoute(relative);
    if (route === null) continue;
    const normalized = normalizeRoute(route);
    if (!byRoute.has(normalized)) {
      byRoute.set(normalized, {
        route: normalized,
        dynamic: /\[|:\w|\$/.test(normalized),
        file: path.relative(source, path.join(detected.root, relative)),
        framework: detected.name,
      });
    }
  }
  return [...byRoute.values()].sort((left, right) => left.route.localeCompare(right.route));
}

// Last commit and commit count per route file. Old, rarely touched, unlinked routes are legacy candidates.
export function addGitHistory(source, routes) {
  for (const entry of routes) {
    try {
      const last = execFileSync('git', ['log', '-1', '--format=%cs|%h|%s', '--', entry.file], { cwd: source, encoding: 'utf8' }).trim();
      const count = execFileSync('git', ['rev-list', '--count', 'HEAD', '--', entry.file], { cwd: source, encoding: 'utf8' }).trim();
      const [date, sha, ...subject] = last.split('|');
      entry.lastCommit = last ? { date, sha, subject: subject.join('|') } : null;
      entry.commitCount = Number(count) || 0;
    } catch {
      entry.lastCommit = null;
    }
  }
  return routes;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const arg = (name, fallback) => {
    const index = process.argv.indexOf(`--${name}`);
    return index === -1 ? fallback : (process.argv[index + 1] ?? true);
  };
  const source = path.resolve(arg('source', '.'));
  const routes = discoverRoutes(source, { framework: arg('framework', 'auto') });
  if (process.argv.includes('--git')) addGitHistory(source, routes);
  const out = path.resolve(arg('out', 'routes.json'));
  fs.writeFileSync(out, `${JSON.stringify(routes, null, 2)}\n`);
  const dynamic = routes.filter((entry) => entry.dynamic).length;
  console.log(`${routes.length} routes (${dynamic} dynamic) from ${routes[0]?.framework || 'none'} -> ${out}`);
}
