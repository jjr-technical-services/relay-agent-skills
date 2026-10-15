#!/usr/bin/env node
// Signs in once so capture can record pages behind an auth wall. The login itself is never recorded.
//
//   node login.mjs --project <dir> [--headed] [--check]
//
// --headed (recommended): opens a visible browser at auth.loginUrl; you sign in yourself (SSO, MFA and
//   captchas work because a person does them), and the session is saved once auth.successSelector or
//   auth.successUrl appears. The kit never sees a password.
// scripted (no flag): runs auth.steps with ${secret:NAME} placeholders filled from the environment or
//   .env.local, for demo accounts without MFA. Secrets are typed with fill(), never logged.
// --check: only verifies the saved session still reaches a signed-in page.
//
// The session is saved to <project>/.auth/state.json (owner-only permissions; delete it when done).
// Recording while signed in requires auth.demoAccountConfirmed: true: use a demo or staging account
// with no real customer or personal data. Identity-provider hosts go in auth.allowHosts; they are
// reachable during login only, never during recording.
import fs from 'node:fs';
import path from 'node:path';
import { assertAuthAllowed, describeStep, resolveSecretSteps, writeAllowed } from './auth.mjs';
import { argValue, blockEgress, egressLaunchArgs, loadPlaywright, loadProject, log, secret } from './lib.mjs';

const config = loadProject();
const auth = config.auth;
if (!auth) throw new Error('promo.json has no "auth" block. See references/auth.md.');
assertAuthAllowed(auth);
const headed = Boolean(argValue('headed'));
const checkOnly = Boolean(argValue('check'));
const loginConfig = { ...config, allowHosts: [...config.allowHosts, ...(auth.allowHosts || [])] };
const absolute = (url) => new URL(url || '/', `${config.origin}/`).toString();

async function signedIn(page, timeout) {
  const checks = [];
  if (auth.successSelector) checks.push(page.locator(auth.successSelector).first().waitFor({ state: 'visible', timeout }));
  if (auth.successUrl) checks.push(page.waitForURL(new RegExp(auth.successUrl), { timeout }));
  if (!checks.length) throw new Error('Set auth.successSelector or auth.successUrl so the kit can tell you are signed in.');
  try { await Promise.any(checks); return true; } catch { return false; }
}

// Even while signing in, the product only receives the writes the project allows (the sign-in POST
// itself); anything else the post-login page fires is aborted and reported. Identity-provider hosts
// are separate origins and handle their own form posts.
const DEFAULT_AUTH_WRITES = ['/api/auth/*', '/auth/*', '/login', '/signin', '/sign-in', '/session', '/sessions'];
const allowedWrites = auth.allowWrites || DEFAULT_AUTH_WRITES;
async function guardWrites(context) {
  const blocked = [];
  const host = new URL(config.origin).host;
  await context.route((url) => new URL(url).host === host, (route) => {
    const request = route.request();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.fallback();
    const { pathname } = new URL(request.url());
    if (!checkOnly && writeAllowed(pathname, allowedWrites)) return route.fallback();
    blocked.push(`${request.method()} ${pathname}`);
    return route.abort('blockedbyclient');
  });
  return blocked;
}

const { chromium } = await loadPlaywright();

if (checkOnly) {
  if (!fs.existsSync(auth.statePath)) throw new Error('No saved session. Run login.mjs first.');
  const browser = await chromium.launch({ args: egressLaunchArgs(config) });
  const context = await browser.newContext({ storageState: auth.statePath, serviceWorkers: 'block' });
  await blockEgress(context, config);
  await guardWrites(context);
  const page = await context.newPage();
  await page.goto(absolute(auth.checkUrl || auth.loginUrl), { waitUntil: 'domcontentloaded' });
  const ok = await signedIn(page, 20000);
  await browser.close();
  log('login', ok ? 'session is valid' : 'session is NOT valid; run login.mjs again');
  process.exit(ok ? 0 : 1);
}

const browser = await chromium.launch({ headless: !headed, args: egressLaunchArgs(loginConfig) });
try {
  const context = await browser.newContext({ viewport: config.viewport, serviceWorkers: 'block' });
  await blockEgress(context, loginConfig);
  const blockedWrites = await guardWrites(context);
  const page = await context.newPage();
  await page.goto(absolute(auth.loginUrl), { waitUntil: 'domcontentloaded' });
  if (headed) {
    log('login', 'Sign in in the browser window. Waiting up to 10 minutes…');
    if (!(await signedIn(page, 10 * 60 * 1000))) throw new Error('Did not reach a signed-in page within 10 minutes.');
  } else {
    const { steps } = resolveSecretSteps(auth.steps, (name) => secret(name, config));
    for (const step of steps) {
      log('login', describeStep(step));
      if (step.do === 'goto') await page.goto(absolute(step.url), { waitUntil: 'domcontentloaded' });
      else if (step.do === 'type') await page.locator(step.selector).first().fill(step.text);
      else if (step.do === 'click') await page.locator(step.selector).first().click();
      else if (step.do === 'press') await page.keyboard.press(step.key);
      else if (step.do === 'wait') await page.waitForTimeout(step.ms ?? 800);
      else if (step.do === 'waitFor') await page.locator(step.selector).first().waitFor({ state: 'visible', timeout: step.timeoutMs ?? 15000 });
      else throw new Error(`Unsupported login step "${step.do}"`);
    }
    if (!(await signedIn(page, 30000))) {
      throw new Error(`Login steps ran but no signed-in page appeared. Check the selectors, or use --headed.${blockedWrites.length ? ` Blocked writes (add the sign-in one to auth.allowWrites): ${blockedWrites.join(', ')}` : ''}`);
    }
  }
  fs.mkdirSync(path.dirname(auth.statePath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(path.join(path.dirname(auth.statePath), '.gitignore'), '*\n');
  await context.storageState({ path: auth.statePath });
  fs.chmodSync(auth.statePath, 0o600);
  if (blockedWrites.length) log('login', `blocked writes during sign-in: ${blockedWrites.join(', ')}`);
  log('login', `session saved to ${path.relative(config.root, auth.statePath)} (owner-only). Delete it when the video is done.`);
} finally {
  await browser.close();
}
