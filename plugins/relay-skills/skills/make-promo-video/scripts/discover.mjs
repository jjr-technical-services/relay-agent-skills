#!/usr/bin/env node
// Stage: discover. Finds the product's features so the user can choose what the promo covers.
//
//   node discover.mjs --project <dir> [--pages 12] [--signed-in]
//
// Walks the origin's own navigation (same boundary as capture: egress blocked, read-only), and for each
// page records its sections (h1/h2/h3 with the first paragraph under them) as candidate features, each
// with a thumbnail and a selector the storyboard can use as a camera target. Output: features.json and
// features/*.jpg. --signed-in walks with the saved login session (run login.mjs first).
import fs from 'node:fs';
import path from 'node:path';
import { argValue, launchCapture, loadProject, log, newCaptureContext, projectPath, readJson, writeJson } from './lib.mjs';

const config = loadProject();
const maxPages = Number(argValue('pages', 12));
const signedIn = Boolean(argValue('signed-in'));
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'home';

const browser = await launchCapture(config);
const features = [];
try {
  const extra = { deviceScaleFactor: 1, ...(signedIn && config.auth ? { storageState: config.auth.statePath } : {}) };
  const context = await newCaptureContext(browser, config, extra);
  const page = await context.newPage();
  await page.goto(`${config.origin}/`, { waitUntil: 'networkidle' });
  const origin = new URL(config.origin);
  const nav = await page.$$eval('header a[href], nav a[href]', (links) => links.map((a) => a.href));
  const pages = [...new Set([`${config.origin}/`, ...nav.filter((href) => {
    try { const url = new URL(href); return url.host === origin.host && !/login|sign|register|logout|auth|privacy|terms/i.test(url.pathname); } catch { return false; }
  }).map((href) => href.split('#')[0])])].slice(0, maxPages);

  for (const url of pages) {
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(700);
    // Skip chrome (footer, nav, sidebars, forms) and label-like headings ("Filters", "ORGANIZATIONS").
    const sections = await page.$$eval('main h1, main h2, main h3, body > div h1, body > div h2', (all) => all
      .filter((h) => !h.closest('footer, nav, aside, form, [role="dialog"]'))
      .filter((h) => { const t = h.innerText.trim(); return t.length > 3 && !(t === t.toUpperCase() && t.length < 30) && !/^(filters?|results?|menu|search)$/i.test(t); })
      .slice(0, 14).map((h, i) => {
      h.setAttribute('data-promo-feature', String(i));
      // The card or section around the heading: the nearest ancestor that is card-sized. Recorded as a
      // structural CSS path so a lift shot can pull the whole card, not just its heading.
      const cssPath = (el) => {
        const parts = [];
        for (let node = el; node && node !== document.body; node = node.parentElement) {
          const tag = node.tagName.toLowerCase();
          const same = [...(node.parentElement?.children || [])].filter((c) => c.tagName === node.tagName);
          parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag);
        }
        return `body > ${parts.join(' > ')}`;
      };
      const hr = h.getBoundingClientRect();
      let container = null;
      for (let node = h.parentElement; node && node !== document.body; node = node.parentElement) {
        const r = node.getBoundingClientRect();
        // Card-shaped: tall enough to hold more than a line, not a thin full-width strip.
        if (r.height >= Math.max(120, hr.height + 40) && r.height <= 700 && r.width >= 200 && r.width <= 1180 && r.width / r.height <= 5) { container = node; break; }
        if (r.height > 700) break;
      }
      let text = '';
      for (let el = h.nextElementSibling, n = 0; el && n < 4 && !text; el = el.nextElementSibling, n += 1) text = (el.innerText || '').trim().split('\n')[0];
      if (!text) text = (h.parentElement?.innerText || '').replace(h.innerText, '').trim().split('\n').find((line) => line.length > 30) || '';
      return { index: i, tag: h.tagName.toLowerCase(), heading: h.innerText.trim().replace(/\s+/g, ' '), summary: text.slice(0, 220), container: container ? cssPath(container) : null };
    }));
    const pagePath = new URL(url).pathname;
    for (const section of sections) {
      if (!section.heading || section.heading.length < 3 || section.heading.length > 120) continue;
      if (features.some((f) => f.heading === section.heading)) continue;
      const id = `F${features.length + 1}`;
      const thumb = projectPath(config, 'features', `${id}-${slug(section.heading)}.jpg`);
      const handle = await page.$(`[data-promo-feature="${section.index}"]`);
      await handle?.scrollIntoViewIfNeeded().catch(() => {});
      const box = await handle?.boundingBox();
      if (box) {
        const top = Math.max(0, box.y - 40);
        await page.screenshot({ path: thumb, type: 'jpeg', quality: 70, clip: { x: 0, y: top, width: config.viewport.width, height: Math.min(560, config.viewport.height - top) } }).catch(() => {});
      }
      features.push({
        id, page: pagePath, heading: section.heading, summary: section.summary, level: section.tag,
        selector: `${section.tag}:text-is(${JSON.stringify(section.heading)})`,
        container: section.container,
        thumb: fs.existsSync(thumb) ? path.relative(config.root, thumb) : null,
      });
    }
    log('discover', `${pagePath}: ${sections.length} sections`);
  }
  // Keep earlier classifications (classify.mjs) for features found again, so re-discovery is free.
  const earlier = readJson(path.join(config.root, 'features.json'), { features: [] }).features;
  const CLASSIFIED = ['category', 'keyScore', 'keyLevel', 'showable', 'promoWorthy', 'key', 'uncertain', 'classifiedBy'];
  for (const feature of features) {
    const match = earlier.find((f) => f.page === feature.page && f.heading === feature.heading && f.category);
    if (match) for (const field of CLASSIFIED) if (match[field] !== undefined) feature[field] = match[field];
  }
  writeJson(path.join(config.root, 'features.json'), {
    schema: 'relay.promo_features.v1', origin: config.origin, signedIn, discoveredAt: new Date().toISOString(),
    blockedHosts: [...(context.__blocked || [])], blockedWrites: context.__writesBlocked || [], features,
  });
  log('discover', `${features.length} candidate features from ${pages.length} pages -> features.json`);
} finally {
  await browser.close();
}
