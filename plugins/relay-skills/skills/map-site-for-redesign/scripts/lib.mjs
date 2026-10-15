// Shared capture helpers for a redesign capture pack.
//
// Every script reads one pack config (see pack.config.example.json). Resolution order:
// --config <file>, then $PACK_CONFIG, then ./pack.config.json in the working directory.
// Paths inside the config resolve relative to the config file.
//
// Playwright is the only dependency. It resolves from the kit's own location first, then from the
// working directory, so the kit can live anywhere (for example ~/.claude/skills) as long as you run it
// from a folder with playwright or @playwright/test installed (the app repo, or the pack folder).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULT_VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

export function argValue(name, fallback = undefined) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const next = process.argv[index + 1];
  return next === undefined || next.startsWith('--') ? true : next;
}

export function loadConfig(configPath = argValue('config') || process.env.PACK_CONFIG || 'pack.config.json') {
  const file = path.resolve(configPath);
  if (!fs.existsSync(file)) {
    throw new Error(`Pack config not found at ${file}. Copy pack.config.example.json and edit it.`);
  }
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const base = path.dirname(file);
  const resolve = (value) => (value ? path.resolve(base, value) : value);
  const config = {
    product: raw.product || 'Product',
    origin: String(raw.origin || 'http://localhost:3000').replace(/\/$/, ''),
    packDir: resolve(raw.packDir || '.'),
    appRoot: resolve(raw.appRoot || null),
    viewports: raw.viewports || DEFAULT_VIEWPORTS,
    deviceScaleFactor: raw.deviceScaleFactor || 2,
    colorScheme: raw.colorScheme || 'light',
    personas: raw.personas || [{ id: 'anon' }],
    defaultPersonas: raw.defaultPersonas || [raw.personas?.[0]?.id || 'anon'],
    routeRules: raw.routeRules || [],
    navSources: (raw.navSources || []).map(resolve),
    sourceDirs: (raw.sourceDirs || []).map(resolve),
    ignoreRoutes: raw.ignoreRoutes || [],
    dynamicSamples: raw.dynamicSamples || {},
    serverFlags: raw.serverFlags || {},
    allowHosts: raw.allowHosts || [],
    uploadLimitMiB: raw.uploadLimitMiB || 19,
    signedOutSelector: raw.signedOutSelector || '',
    scrollRootSelector: raw.scrollRootSelector || '',
    maxShotHeight: raw.maxShotHeight || 7000,
    adapter: raw.adapter || null,
    adapterOptions: raw.adapterOptions || {},
    configFile: file,
  };
  fs.mkdirSync(config.packDir, { recursive: true });
  return config;
}

export function personaById(config, id) {
  const persona = config.personas.find((item) => item.id === id);
  if (!persona) throw new Error(`Unknown persona "${id}". Declare it in the pack config.`);
  return persona;
}

export function storageStatePath(config, personaId) {
  return path.join(config.packDir, 'state', `${personaId}.json`);
}

// Personas that apply to a route: the first matching routeRule wins, else defaultPersonas.
export function personasForRoute(config, route) {
  for (const rule of config.routeRules) {
    if (new RegExp(rule.match).test(route)) return rule.personas;
  }
  return config.defaultPersonas;
}

let playwrightModule;
export async function loadPlaywright() {
  if (playwrightModule) return playwrightModule;
  // A CommonJS Playwright imported from ESM (for example from the app's node_modules) exposes only
  // { default }, so chromium and request would be undefined without this unwrap.
  const unwrap = (mod) => (mod?.chromium ? mod : mod?.default ?? mod);
  try {
    playwrightModule = unwrap(await import('playwright'));
    return playwrightModule;
  } catch {}
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  for (const name of ['playwright', '@playwright/test']) {
    try {
      playwrightModule = unwrap(await import(pathToFileURL(require.resolve(name)).href));
      return playwrightModule;
    } catch {}
  }
  throw new Error('Playwright not found. Run from a folder where playwright or @playwright/test is installed.');
}

// A request is inside the capture boundary when it targets the capture origin's host and port, or a
// host listed in config.allowHosts. Works for http(s) and ws(s) URLs alike.
export function isCaptureUrl(value, config) {
  try {
    const url = new URL(String(value));
    if (['data:', 'blob:', 'about:'].includes(url.protocol)) return true;
    return url.host === new URL(config.origin).host || (config.allowHosts || []).includes(url.hostname);
  } catch {
    return false;
  }
}

// Resolver-level block: every host except the capture host (and allowHosts) fails to resolve,
// IP-literal URLs included (verified for 192.0.2.1 and [::1]). This closes what request interception
// cannot see: redirects to a third party (fetch and navigation), WebSockets, and service-worker
// traffic. It does not cover requests Node sends itself, which is why rewriteJson() never lets
// route.fetch() follow a redirect.
export function egressLaunchArgs(config) {
  const hosts = [...new Set([new URL(config.origin).hostname, ...(config.allowHosts || [])])];
  return [
    `--host-resolver-rules=MAP * ~NOTFOUND, ${hosts.map((host) => `EXCLUDE ${host}`).join(', ')}`,
    // WebRTC STUN/TURN to an IP literal sends UDP without resolving a name or passing request routing.
    // Only the force- form of this flag takes effect.
    '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
  ];
}

export async function launch(config, options = {}) {
  if (!config?.origin) throw new Error('launch(config) needs the pack config so egress is blocked at the resolver.');
  const { chromium } = await loadPlaywright();
  return chromium.launch({ ...options, args: [...(options.args || []), ...egressLaunchArgs(config)] });
}

// Block every request that leaves the capture origin, on by default. Apps hard-code production analytics
// and ad pixels (some root layouts load GTM, Meta, TikTok and Reddit with production ids whatever the env), so an
// unblocked capture sends real page views from localhost to production accounts. config.allowHosts is the
// escape hatch (for example a local asset CDN); blocked hosts are recorded on context.__blocked.
// Call this on EVERY context that loads app pages, including adapters that drive a login form.
// Pair it with launch(config), which blocks at the resolver, and newContext({ serviceWorkers: 'block' }).
export async function blockEgress(context, config) {
  context.__blocked = new Set();
  await context.route((url) => !isCaptureUrl(url, config), (route) => {
    context.__blocked.add(new URL(route.request().url()).hostname);
    return route.abort('blockedbyclient');
  });
  await context.routeWebSocket((url) => !isCaptureUrl(url, config), (socket) => {
    context.__blocked.add(new URL(socket.url()).hostname);
    socket.close();
  });
  return context;
}

// Adapters seed only local throwaway databases. The host must be local, no query parameter may redirect
// the connection, and the database name must start with capture_, design_ or throwaway_, so a local copy
// of production data is refused too.
export function assertThrowawayDatabase(connectionString = process.env.DATABASE_URL || '') {
  let url = null;
  try { url = new URL(connectionString); } catch {}
  const host = url?.hostname || '';
  const database = url ? decodeURIComponent(url.pathname.slice(1)) : '';
  if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
    throw new Error(`Refusing to seed: DATABASE_URL host "${host || 'unset'}" is not a local throwaway database.`);
  }
  // libpq honours host/hostaddr query parameters over the URL host, so a local-looking URL could still
  // connect elsewhere.
  for (const key of url.searchParams.keys()) {
    if (/^(host|hostaddr)$/i.test(key)) throw new Error(`Refusing to seed: DATABASE_URL sets the "${key}" query parameter.`);
  }
  if (!/^(capture|design|throwaway)[_-]/i.test(database)) {
    throw new Error(`Refusing to seed: database "${database}" must be named as a capture database (start with capture_, design_ or throwaway_).`);
  }
}

// Retry 429s with a fixed back-off. Auth libraries rate-limit per IP (Better Auth allows 3 sign-ins per
// 10 s in production builds), and parallel area agents share one IP.
export async function with429Retry(send, { attempts = 5, waitMs = 11000 } = {}) {
  let response;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    response = await send();
    if (response.status() !== 429) return response;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  return response;
}

// reducedMotion stays 'no-preference' on purpose. Under 'reduce', many apps skip the
// animation that fades content in, and the capture shows blank sections.
export async function newPage(browser, config, { persona = 'anon', viewport = 'desktop' } = {}) {
  const options = {
    viewport: config.viewports[viewport],
    deviceScaleFactor: config.deviceScaleFactor,
    colorScheme: config.colorScheme,
    reducedMotion: 'no-preference',
    serviceWorkers: 'block', // a service worker's own requests bypass context routing
  };
  if (persona !== 'anon') {
    const state = storageStatePath(config, persona);
    if (!fs.existsSync(state)) throw new Error(`Missing storageState for persona "${persona}" at ${state}. Run make-personas.mjs first.`);
    options.storageState = state;
  }
  const context = await browser.newContext(options);
  await blockEgress(context, config);
  const page = await context.newPage();
  page.__persona = persona;
  page.__config = config;
  page.__errors = [];
  page.__consoleErrors = [];
  page.__rateLimited = 0;
  page.on('response', (response) => { if (response.status() === 429) page.__rateLimited += 1; });
  page.on('pageerror', (error) => page.__errors.push(String(error.message).slice(0, 240)));
  page.on('console', (message) => {
    if (message.type() === 'error') page.__consoleErrors.push(message.text().slice(0, 240));
  });
  return { context, page };
}

export async function settle(page, ms = 1200) {
  try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch {}
  await page.waitForTimeout(ms);
}

// App shells often scroll inside an element (<main>, a pane) instead of the document. Those are the
// "scroll roots": vertically scrollable, overflowing elements at least half the viewport tall. Small
// scroll boxes (menus, code blocks) are ignored. config.scrollRootSelector adds app-specific candidates.
// Marks each root with data-capture-scroll-root and returns the largest hidden height in CSS pixels.
export async function markScrollRoots(page, config = {}) {
  return page.evaluate((selector) => {
    const scrollable = (el) => {
      const { overflowY } = getComputedStyle(el);
      return overflowY === 'auto' || overflowY === 'scroll';
    };
    const candidates = new Set([...document.body.querySelectorAll('*')].filter(scrollable));
    if (selector) document.querySelectorAll(selector).forEach((el) => candidates.add(el));
    let hidden = 0;
    for (const el of document.querySelectorAll('[data-capture-scroll-root]')) el.removeAttribute('data-capture-scroll-root');
    for (const el of candidates) {
      if (!scrollable(el) || el.scrollHeight <= el.clientHeight + 4 || el.clientHeight < window.innerHeight * 0.5) continue;
      el.setAttribute('data-capture-scroll-root', '');
      hidden = Math.max(hidden, el.scrollHeight - el.clientHeight);
    }
    return hidden;
  }, config.scrollRootSelector || '').catch(() => 0);
}

// Scroll the document and every scroll root so IntersectionObserver / whileInView / lazy content
// renders before a full-page shot.
export async function reveal(page, config = {}) {
  await markScrollRoots(page, config);
  try {
    await page.evaluate(async () => {
      const wait = () => new Promise((resolve) => setTimeout(resolve, 60));
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await wait(); }
      window.scrollTo(0, 0);
      for (const root of document.querySelectorAll('[data-capture-scroll-root]')) {
        for (let y = 0; y < root.scrollHeight; y += 500) { root.scrollTop = y; await wait(); }
        root.scrollTop = 0;
      }
    });
  } catch {}
  await page.waitForTimeout(400);
}

export function slugOf(route) {
  const clean = String(route || '/').split(/[?#]/)[0];
  if (clean === '' || clean === '/') return 'home';
  return clean.replace(/^\//, '').replace(/[/[\]]+/g, '_').replace(/_+$/, '');
}

// Canonical name: <route-slug>__<nn>-<state>__<viewport>
export function shotName(route, index, state, viewport) {
  return `${slugOf(route)}__${String(index).padStart(2, '0')}-${state}__${viewport}`;
}

// Full-page screenshot that also works for app shells that scroll inside <main> or a pane. Playwright's
// fullPage only measures the document, so an inner-scrolling page stops at the viewport height
// (900px on desktop) and everything below is silently cut off. When a scroll root overflows, grow the
// viewport by the hidden height (capped at config.maxShotHeight, default 7000px), shoot, restore.
// Taller pages are cut at the cap (design tools downsample anything taller into illegibility anyway)
// and logged to logs/truncated.json; build-pack.mjs requires each one in a Coverage gaps list.
export async function shot(page, config, dir, name, { fullPage = true } = {}) {
  const directory = path.join(config.packDir, 'shots', dir);
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, `${name}.png`);
  const viewport = page.viewportSize();
  await auditSignedIn(page, config, dir, name);
  const hidden = fullPage && viewport ? await markScrollRoots(page, config) : 0;
  if (fullPage && viewport) {
    const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
    const needed = Math.max(documentHeight, viewport.height + hidden);
    if (needed > (config.maxShotHeight || 7000)) recordTruncation(config, dir, name, needed);
  }
  if (hidden > 0) {
    const height = Math.min(viewport.height + hidden, config.maxShotHeight || 7000);
    await page.setViewportSize({ width: viewport.width, height });
    await page.waitForTimeout(500);
  }
  try {
    await page.screenshot({
    path: file,
    fullPage,
    animations: 'disabled',
    // Cap document-scrolling pages too; `clip` with fullPage limits the captured height.
    ...(fullPage && viewport ? { clip: { x: 0, y: 0, width: viewport.width, height: config.maxShotHeight || 7000 } } : {}),
  });
  } finally {
    if (hidden > 0) await page.setViewportSize(viewport);
  }
  return path.relative(config.packDir, file);
}

// A signed-in shot that rendered signed out is the most common silent failure: a 429 on the session
// check (parallel agents share one IP) makes the header fall back to "Log in". When the page saw a 429,
// or config.signedOutSelector is visible for a signed-in persona, log it; build-pack.mjs fails on it.
async function auditSignedIn(page, config, dir, name) {
  if (!page.__persona || page.__persona === 'anon') return;
  const signedOut = config.signedOutSelector
    ? await page.locator(config.signedOutSelector).first().isVisible().catch(() => false)
    : false;
  if (!signedOut && !page.__rateLimited) return;
  const file = path.join(config.packDir, 'logs', 'signed-out.json');
  const rows = readJson(file, []).filter((row) => !(row.dir === dir && row.name === `${name}.png`));
  rows.push({ dir, name: `${name}.png`, persona: page.__persona, signedOutSelectorVisible: signedOut, rateLimitedResponses: page.__rateLimited });
  writeJson(file, rows);
  console.warn(`WARN ${dir}/${name}.png: ${signedOut ? 'signed-out UI visible' : ''}${page.__rateLimited ? ` ${page.__rateLimited} x 429` : ''}; re-capture it`);
}

function recordTruncation(config, dir, name, neededHeight) {
  const file = path.join(config.packDir, 'logs', 'truncated.json');
  const rows = readJson(file, []).filter((row) => !(row.dir === dir && row.name === `${name}.png`));
  rows.push({ dir, name: `${name}.png`, neededHeight, cappedAt: config.maxShotHeight || 7000 });
  writeJson(file, rows);
}

// Force an error state: every request matching `pattern` answers with `status`.
export async function forceStatus(page, pattern, status = 500, body = '{"error":"Forced by capture"}') {
  await page.route(pattern, (route) => route.fulfill({ status, contentType: 'application/json', body }));
}

// Force an empty state: matching requests answer 200 with `body` (for example '[]' or '{"items":[]}').
export async function forceBody(page, pattern, body) {
  await page.route(pattern, (route) => route.fulfill({ status: 200, contentType: 'application/json', body }));
}

// Hold matching requests open so a loading skeleton stays on screen. Returns a release function.
export async function holdRequests(page, pattern) {
  const held = [];
  await page.route(pattern, (route) => {
    // Never hold (and later continue) a request outside the capture boundary: fall back to the block.
    if (!isCaptureUrl(route.request().url(), page.__config)) return route.fallback();
    held.push(route);
    return undefined;
  });
  return async () => {
    await page.unroute(pattern);
    for (const route of held.splice(0)) await route.continue().catch(() => {});
  };
}

// Reach a state the isolated environment cannot produce (an AI readiness check that needs a model key,
// a paywall, a confirm-cost step) by letting the real request through and rewriting its JSON body.
// Every shot taken this way is stubbed: put "stubbed" in its state name and say what was rewritten
// in the page spec. `rewrite` receives the parsed body and returns the body to serve.
export async function rewriteJson(page, pattern, rewrite) {
  page.__stubbed = true;
  await page.route(pattern, async (route) => {
    // route.fetch() sends from Node, outside the browser's blocks, so only ever do it for capture URLs,
    // and never let Node follow a redirect: a same-origin URL can 302/303 to a third party (a paywall
    // to a payment provider). maxRedirects: 0 hands the 3xx back to the browser, where the resolver
    // block stops the follow-up request.
    if (!isCaptureUrl(route.request().url(), page.__config)) return route.fallback();
    const response = await route.fetch({ maxRedirects: 0 });
    if (response.status() >= 300 && response.status() < 400) return route.fulfill({ response });
    const body = await response.json().catch(() => ({}));
    await route.fulfill({ response, json: await rewrite(body) });
  });
}

// Status codes lie: streaming and catch-all routes can answer 200 with a not-found body. Treat a page
// as not found when its heading or title says so, whatever the status.
export async function looksNotFound(page) {
  const text = [
    await page.title().catch(() => ''),
    await page.locator('h1, h2').first().innerText({ timeout: 1000 }).catch(() => ''),
  ].join(' ');
  return /\b(404|not found|page (?:does not|doesn't) exist|could not be found)\b/i.test(text);
}

export function sameOriginPath(href, origin) {
  try {
    const url = new URL(href, origin);
    if (url.origin !== new URL(origin).origin) return null;
    return url.pathname.replace(/\/$/, '') || '/';
  } catch {
    return null;
  }
}

export function readJson(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
