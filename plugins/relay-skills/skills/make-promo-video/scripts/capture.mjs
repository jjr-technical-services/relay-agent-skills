#!/usr/bin/env node
// Stage: capture. Records every storyboard shot whose source is "live" or "still".
//
//   node capture.mjs --project <dir> [--only shotId,shotId]
//
// live  : a CDP screencast of the shot's steps (sharp frames at captureScale), plus an action log
//         (click/type/hover/scroll with timestamps and element boxes) that the renderer uses to draw the
//         cursor and to zoom. The recorded pixels are never edited.
// still : a full-page screenshot; the renderer pans and zooms over it (smoother than a recorded scroll).
//
// Output per shot: capture/<shotId>/{frames/*.jpg, capture.json} or capture/<shotId>/{still.png, capture.json}
import fs from 'node:fs';
import path from 'node:path';
import { assertAuthAllowed } from './auth.mjs';
import { argValue, launchCapture, loadProject, log, newCaptureContext, projectPath, writeJson } from './lib.mjs';

const config = loadProject();
const only = argValue('only') ? String(argValue('only')).split(',') : null;
const STILL_LIKE = ['still', 'hero3d', 'lift', 'scroll'];
const shots = (config.storyboard?.shots || []).filter((shot) => ['live', ...STILL_LIKE].includes(shot.source))
  .filter((shot) => !only || only.includes(shot.id));
if (!shots.length) {
  log('capture', 'No live or still shots to capture.');
  process.exit(0);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Shots record signed in when promo.json has an auth block, unless the shot sets "auth": false.
assertAuthAllowed(config.auth);
function sessionFor(shot) {
  if (!config.auth || shot.auth === false) return {};
  if (!fs.existsSync(config.auth.statePath)) throw new Error(`${shot.id} needs a signed-in session. Run: node scripts/login.mjs --project ${config.root} --headed`);
  const ageHours = (Date.now() - fs.statSync(config.auth.statePath).mtimeMs) / 3600000;
  if (ageHours > (config.auth.maxAgeHours ?? 12)) log('capture', `warning: saved session is ${ageHours.toFixed(0)}h old; rerun login.mjs if pages show the login screen`);
  return { storageState: config.auth.statePath };
}
const now = () => Date.now() / 1000;

function absolute(url) {
  return new URL(url || '/', `${config.origin}/`).toString();
}

async function settle(page, ms = 900) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await sleep(ms);
}

async function boxOf(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  const box = await locator.boundingBox();
  if (!box) throw new Error(`No box for selector ${selector}`);
  return box;
}

// Smooth scroll inside the page so the screencast sees real motion (the page's own sticky header and
// scroll-linked effects stay truthful).
async function smoothScroll(page, to, durationMs) {
  await page.evaluate(async ({ to, durationMs }) => {
    const target = typeof to === 'number' ? to
      : (document.querySelector(to)?.getBoundingClientRect().top ?? 0) + window.scrollY - 80;
    const start = window.scrollY;
    const t0 = performance.now();
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
    await new Promise((resolve) => {
      const step = (t) => {
        const k = Math.min(1, (t - t0) / durationMs);
        window.scrollTo(0, start + (target - start) * ease(k));
        if (k < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
  }, { to, durationMs });
}

// Runs one step. Every visible action is appended to `actions` with the time it happened and the
// element's viewport box, so the renderer can zoom to it and draw the cursor arriving there.
async function runStep(page, step, actions, cursor) {
  const record = (type, extra) => actions.push({ t: now(), type, ...extra });
  const moveTo = async (box, type) => {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    record('move-start', { from: { ...cursor } });
    await page.mouse.move(x, y, { steps: 24 });
    cursor.x = x; cursor.y = y;
    record(type, { point: { x, y }, box });
  };
  switch (step.do) {
    case 'goto':
      await page.goto(absolute(step.url), { waitUntil: 'domcontentloaded' });
      await settle(page, step.settleMs ?? 900);
      record('navigate', { url: page.url() });
      break;
    case 'wait':
      await sleep(step.ms ?? 800);
      break;
    case 'waitFor':
      await page.locator(step.selector).first().waitFor({ state: 'visible', timeout: step.timeoutMs ?? 15000 });
      break;
    case 'settle':
      await settle(page, step.ms ?? 600);
      break;
    case 'scroll': {
      const before = await page.evaluate(() => window.scrollY);
      await smoothScroll(page, step.to ?? step.y ?? 0, step.durationMs ?? 1400);
      const after = await page.evaluate(() => window.scrollY);
      record('scroll', { from: before, to: after, durationMs: step.durationMs ?? 1400 });
      break;
    }
    case 'hover':
      await moveTo(await boxOf(page, step.selector), 'hover');
      await sleep(step.holdMs ?? 500);
      break;
    case 'click':
      await moveTo(await boxOf(page, step.selector), 'click');
      await sleep(120);
      await page.mouse.down(); await sleep(70); await page.mouse.up();
      if (step.waitForNavigation) {
        await settle(page, step.settleMs ?? 900);
        record('navigate', { url: page.url(), afterClick: true });
      } else await sleep(step.holdMs ?? 700);
      break;
    case 'type': {
      const box = await boxOf(page, step.selector);
      await moveTo(box, 'click');
      await page.mouse.down(); await page.mouse.up();
      record('type', { box, text: step.text });
      await page.keyboard.type(step.text, { delay: step.delayMs ?? 75 });
      record('type-end', { box });
      await sleep(step.holdMs ?? 500);
      break;
    }
    case 'press':
      await page.keyboard.press(step.key);
      record('press', { key: step.key });
      await settle(page, step.settleMs ?? 700);
      break;
    default:
      throw new Error(`Unknown step "${step.do}"`);
  }
}

async function captureLive(browser, shot) {
  const dir = projectPath(config, 'capture', shot.id, 'frames', '.keep');
  const frameDir = path.dirname(dir);
  for (const file of fs.readdirSync(frameDir)) fs.rmSync(path.join(frameDir, file));
  const context = await newCaptureContext(browser, config, sessionFor(shot));
  const page = await context.newPage();
  const actions = [];
  const cursor = { x: config.viewport.width * 0.62, y: config.viewport.height * 0.72 };
  await page.mouse.move(cursor.x, cursor.y);
  await page.goto(absolute(shot.url), { waitUntil: 'domcontentloaded' });
  await settle(page, 1200);
  for (const step of shot.setup || []) await runStep(page, step, [], cursor);

  const cdp = await context.newCDPSession(page);
  const frames = [];
  let index = 0;
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const file = `f${String(index++).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(frameDir, file), Buffer.from(data, 'base64'));
    frames.push({ file, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  const { width, height } = config.viewport;
  await cdp.send('Page.startScreencast', {
    format: 'jpeg', quality: 92, maxWidth: width * config.captureScale, maxHeight: height * config.captureScale,
  });
  // Nudge a repaint so the first frame exists even on a static page.
  await page.evaluate(() => { document.body.style.outline = '0px solid transparent'; });
  await sleep(300);
  const start = now();
  for (const step of shot.steps || []) await runStep(page, step, actions, cursor);
  await sleep(shot.tailMs ?? 900);
  const end = now();
  await cdp.send('Page.stopScreencast');
  await sleep(200);
  const record = {
    schema: 'relay.promo_capture.v1', shotId: shot.id, source: 'live', url: page.url(), signedIn: Boolean(sessionFor(shot).storageState),
    viewport: config.viewport, scale: config.captureScale, start, end, duration: end - start,
    cursorStart: { x: config.viewport.width * 0.62, y: config.viewport.height * 0.72 },
    frames: frames.map((frame) => ({ ...frame, t: frame.t - start })),
    actions: actions.map((action) => ({ ...action, t: action.t - start })),
    blockedHosts: [...(context.__blocked || [])], blockedWrites: context.__writesBlocked || [],
    capturedAt: new Date().toISOString(),
  };
  writeJson(projectPath(config, 'capture', shot.id, 'capture.json'), record);
  await context.close();
  log('capture', `${shot.id}: live ${record.duration.toFixed(1)}s, ${frames.length} frames, ${actions.length} actions`);
}

async function captureStill(browser, shot) {
  // Screenshots follow the context's deviceScaleFactor (the launch flag only affects the screencast).
  const context = await newCaptureContext(browser, config, { deviceScaleFactor: config.captureScale, ...sessionFor(shot) });
  const page = await context.newPage();
  await page.goto(absolute(shot.url), { waitUntil: 'domcontentloaded' });
  await settle(page, 1200);
  for (const step of shot.setup || []) await runStep(page, step, [], { x: 0, y: 0 });
  // Scroll the whole page once so lazy and on-scroll content renders, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await settle(page, 800);
  const pageHeight = await page.evaluate(() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
  const clipHeight = Math.min(pageHeight, shot.maxHeight || 9000);
  // Page-coordinate boxes for every selector the renderer will aim at: camera keys, and the focus,
  // selector, from and to fields of hero3d, lift and scroll shots.
  const anchors = {};
  const selectors = [...(shot.camera || []).map((key) => key.selector), shot.focus, shot.selector, shot.from, shot.to]
    .filter((value) => typeof value === 'string');
  for (const selector of selectors) {
    if (anchors[selector]) continue;
    const locator = page.locator(selector).first();
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    const box = await locator.boundingBox().catch(() => null);
    if (!box) throw new Error(`${shot.id}: selector not found: ${selector}`);
    const scrollY = await page.evaluate(() => window.scrollY);
    anchors[selector] = { ...box, y: box.y + scrollY };
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  const file = projectPath(config, 'capture', shot.id, 'still.png');
  await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width: config.viewport.width, height: clipHeight } });
  writeJson(projectPath(config, 'capture', shot.id, 'capture.json'), {
    schema: 'relay.promo_capture.v1', shotId: shot.id, source: shot.source, url: page.url(), signedIn: Boolean(sessionFor(shot).storageState),
    viewport: config.viewport, scale: config.captureScale, pageHeight: clipHeight, anchors,
    blockedHosts: [...(context.__blocked || [])], blockedWrites: context.__writesBlocked || [],
    capturedAt: new Date().toISOString(),
  });
  await context.close();
  log('capture', `${shot.id}: still ${config.viewport.width}x${clipHeight} css px`);
}

const browser = await launchCapture(config);
try {
  for (const shot of shots) {
    if (shot.source === 'live') await captureLive(browser, shot);
    else await captureStill(browser, shot);
  }
} finally {
  await browser.close();
}
