// Shared helpers for a promo-video project.
//
// A project is one folder holding promo.json (settings), script.json (relay.promo_script.v1) and
// storyboard.json (relay.promo_storyboard.v1). Every stage script takes --project <dir> (default: the
// working directory) and writes its outputs inside that folder, so a run is resumable stage by stage.
//
// Playwright is the only npm dependency. It resolves from the kit's own location first, then from the
// working directory. ffmpeg and ffprobe must be on PATH.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { writeAllowed } from './auth.mjs';

export const RATIOS = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
};

export function argValue(name, fallback = undefined) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const next = process.argv[index + 1];
  return next === undefined || next.startsWith('--') ? true : next;
}

export function readJson(file, fallback = null) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

// Loads the project and applies defaults. Capture settings mirror map-site-for-redesign's pack config
// (origin, allowHosts) so the same egress boundary applies.
export function loadProject(dir = argValue('project') || process.cwd()) {
  const root = path.resolve(dir);
  const promo = readJson(path.join(root, 'promo.json'));
  if (!promo) throw new Error(`No promo.json in ${root}. Copy promo.example.json from the skill and edit it.`);
  const config = {
    root,
    product: promo.product || 'Product',
    origin: String(promo.origin || '').replace(/\/$/, ''),
    allowHosts: promo.allowHosts || [],
    readOnly: promo.readOnly !== false,
    viewport: promo.viewport || { width: 1280, height: 720 },
    captureScale: promo.captureScale || 2,
    colorScheme: promo.colorScheme || 'light',
    fps: promo.fps || 30,
    ratios: promo.ratios || ['16:9', '9:16', '1:1'],
    voice: { provider: 'openai', model: 'gpt-4o-mini-tts', voice: 'ash', format: 'wav', ...(promo.voice || {}) },
    music: { source: 'none', gainDb: -20, ...(promo.music || {}) },
    broll: { provider: 'none', maxSpendUsd: 5, ...(promo.broll || {}) },
    brand: {
      ink: '#020617', paper: '#f8fafc', muted: '#64748b', accent: '#020617',
      fontSans: 'Public Sans', fontMono: 'IBM Plex Mono', logo: null, url: '', ...(promo.brand || {}),
    },
    disclosure: promo.disclosure ?? 'AI voice',
    auth: promo.auth || null,
    raw: promo,
  };
  if (!config.origin) throw new Error('promo.json needs "origin", the product URL to capture.');
  config.brand.logo = config.brand.logo ? path.resolve(root, config.brand.logo) : null;
  if (config.auth) config.auth.statePath = path.join(root, '.auth', 'state.json');
  config.script = readJson(path.join(root, 'script.json'));
  config.storyboard = readJson(path.join(root, 'storyboard.json'));
  // Shot and line ids become file and folder names (capture/<shot>, audio/<line>.wav), so they are
  // restricted before any stage builds a path from them.
  for (const item of [...(config.storyboard?.shots || []), ...(config.script?.lines || [])]) assertSafeId(item.id);
  return config;
}

export const SAFE_ID = /^[A-Za-z0-9_-]{1,40}$/;
export function assertSafeId(id) {
  if (!SAFE_ID.test(String(id ?? ''))) throw new Error(`Invalid id ${JSON.stringify(id)}: use 1-40 letters, digits, "-" or "_".`);
  return id;
}

export function projectPath(config, ...parts) {
  const file = path.join(config.root, ...parts);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}

let playwrightModule;
export async function loadPlaywright() {
  if (playwrightModule) return playwrightModule;
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

// ---- Egress boundary --------------------------------------------------------------------------------
// The three functions below are copied byte-for-byte from skills/map-site-for-redesign/scripts/lib.mjs.
// tests/make-promo-video.test.mjs fails if they drift apart; change both together.

export function isCaptureUrl(value, config) {
  try {
    const url = new URL(String(value));
    if (['data:', 'blob:', 'about:'].includes(url.protocol)) return true;
    return url.host === new URL(config.origin).host || (config.allowHosts || []).includes(url.hostname);
  } catch {
    return false;
  }
}

export function egressLaunchArgs(config) {
  const hosts = [...new Set([new URL(config.origin).hostname, ...(config.allowHosts || [])])];
  return [
    `--host-resolver-rules=MAP * ~NOTFOUND, ${hosts.map((host) => `EXCLUDE ${host}`).join(', ')}`,
    // WebRTC STUN/TURN to an IP literal sends UDP without resolving a name or passing request routing.
    // Only the force- form of this flag takes effect.
    '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
  ];
}

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

// Launches the capture browser with the resolver-level block and a forced device scale factor.
// Headless Chromium's screencast ignores the context deviceScaleFactor, but honours the launch flag,
// so this is what makes captured frames sharp enough to zoom into.
export async function launchCapture(config, options = {}) {
  const { chromium } = await loadPlaywright();
  return chromium.launch({
    ...options,
    args: [...(options.args || []), ...egressLaunchArgs(config), `--force-device-scale-factor=${config.captureScale}`],
  });
}

// Every capture context: service workers blocked (their requests bypass routing), egress blocked, and
// in read-only mode any write to the product (POST, PUT, PATCH, DELETE) is aborted before it leaves.
export async function newCaptureContext(browser, config, extra = {}) {
  const context = await browser.newContext({
    viewport: config.viewport,
    colorScheme: config.colorScheme,
    reducedMotion: 'no-preference',
    serviceWorkers: 'block',
    ...extra,
  });
  await blockEgress(context, config);
  if (config.readOnly) {
    context.__writesBlocked = [];
    const allowedWrites = config.auth?.allowWrites || [];
    await context.route(
      (url) => isCaptureUrl(url, config),
      (route) => {
        const method = route.request().method();
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return route.fallback();
        // Session refresh and sign-in endpoints the project explicitly allows (auth.allowWrites).
        if (writeAllowed(new URL(route.request().url()).pathname, allowedWrites)) return route.fallback();
        context.__writesBlocked.push(`${method} ${new URL(route.request().url()).pathname}`);
        return route.abort('blockedbyclient');
      },
    );
  }
  return context;
}

// ---- Media helpers ------------------------------------------------------------------------------------

export function requireBinary(name) {
  const result = spawnSync(name, ['-version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(`${name} not found on PATH.`);
}

export function run(cmd, args, { quiet = true } = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.slice(0, 6).join(' ')} … failed:\n${(result.stderr || '').slice(-2000)}`);
  }
  if (!quiet) process.stdout.write(result.stdout || '');
  return result;
}

export function probeDuration(file) {
  const result = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Number.parseFloat(result.stdout.trim());
}

// Spawns ffmpeg with stdin open for piped frames; resolves when it exits cleanly.
export function spawnFfmpeg(args) {
  const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { stdio: ['pipe', 'inherit', 'pipe'] });
  // One error handler for the whole stream; a failed write surfaces through `done` below.
  child.stdin.on('error', () => {});
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const done = new Promise((resolve, reject) => {
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-2000)}`))));
  });
  return { child, done };
}

export function writeFrame(child, buffer) {
  if (child.stdin.destroyed) return Promise.reject(new Error('ffmpeg closed its input early.'));
  return new Promise((resolve) => {
    if (child.stdin.write(buffer)) resolve();
    else child.stdin.once('drain', resolve);
  });
}

// Appends one line to the project's spend log. Every paid provider call is recorded here with its unit,
// quantity and rate, which is what Relay's ledger would rate (USD per single unit).
export function logSpend(config, entry) {
  const file = projectPath(config, 'spend.jsonl');
  fs.appendFileSync(file, `${JSON.stringify({ at: new Date().toISOString(), ...entry })}\n`);
}

export function totalSpend(config) {
  const file = path.join(config.root, 'spend.jsonl');
  if (!fs.existsSync(file)) return 0;
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean)
    .reduce((sum, line) => sum + (JSON.parse(line).usd || 0), 0);
}

// Reads KEY=value pairs from the environment first, then from --env-file or ./.env.local / ./.env.
// Values are never printed.
export function secret(name, config) {
  if (process.env[name]) return process.env[name];
  const candidates = [argValue('env-file'), path.join(config?.root || '.', '.env.local'), '.env.local', '.env'].filter(Boolean);
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const match = fs.readFileSync(file, 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'));
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

export function log(stage, message) {
  console.log(`[promo:${stage}] ${message}`);
}
