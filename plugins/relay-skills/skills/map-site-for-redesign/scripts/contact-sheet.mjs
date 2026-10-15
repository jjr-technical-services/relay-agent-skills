#!/usr/bin/env node
// Build labelled contact-sheet PNGs for one area so a design tool gets the whole area in a few uploads.
//
//   node contact-sheet.mjs --area billing [--config pack.config.json] [--per-sheet 24] [--cols 4] [--viewport desktop|mobile|all]
//
// Reads shots/<area>/*.png, keeps capture order (file names sort by route then step number),
// scales each shot to the tile width and crops only the bottom, and writes handoff/sheets/<area>-<nn>.png.
// Defaults (24 desktop tiles, 4 columns, 1600 px wide) are what stayed legible in the Relay run:
// 1,324 shots became 47 sheets totalling 15 MB. Desktop only by default; run --viewport mobile separately.
import fs from 'node:fs';
import path from 'node:path';
import { argValue, launch, loadConfig } from './lib.mjs';

const config = loadConfig();
const area = argValue('area');
if (!area || area === true) throw new Error('Pass --area <shots subfolder>.');
const perSheet = Number(argValue('per-sheet', 24));
const cols = Number(argValue('cols', 4));
const viewportArg = argValue('viewport', 'desktop');
const viewportFilter = viewportArg === 'all' ? '' : viewportArg;
const sheetWidth = 1600;
const gap = 16;
const tileWidth = Math.floor((sheetWidth - 48 - gap * (cols - 1)) / cols);
const tileHeight = viewportFilter === 'mobile' ? Math.round(tileWidth * 1.6) : Math.round(tileWidth * 0.62);

const dir = path.join(config.packDir, 'shots', area);
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.png'))
  .filter((name) => !viewportFilter || name.endsWith(`__${viewportFilter}.png`))
  .sort();
if (!files.length) throw new Error(`No PNGs in ${dir}${viewportFilter ? ` for ${viewportFilter}` : ''}.`);

const outDir = path.join(config.packDir, 'handoff', 'sheets');
fs.mkdirSync(outDir, { recursive: true });
// Drop this area's sheets from earlier runs so a shorter run never leaves stale sheets in the pack.
const sheetPrefix = `${area}${viewportFilter && viewportFilter !== 'desktop' ? `-${viewportFilter}` : ''}-`;
for (const name of fs.readdirSync(outDir)) {
  if (name.startsWith(sheetPrefix) && /^\d+\.png$/.test(name.slice(sheetPrefix.length))) fs.unlinkSync(path.join(outDir, name));
}

function caption(name) {
  const [route, state, viewport] = name.replace(/\.png$/, '').split('__');
  return `<b>${route}</b> · ${state || ''} · ${viewport || ''}`;
}

const browser = await launch(config);
const page = await browser.newPage({ viewport: { width: sheetWidth, height: 1000 }, deviceScaleFactor: 1 });
const written = [];
for (let start = 0, sheet = 1; start < files.length; start += perSheet, sheet += 1) {
  const chunk = files.slice(start, start + perSheet);
  const tiles = chunk.map((name) => {
    const data = fs.readFileSync(path.join(dir, name)).toString('base64');
    return `<figure><div class="frame"><img src="data:image/png;base64,${data}"></div><figcaption>${caption(name)}<br><span>${name}</span></figcaption></figure>`;
  }).join('');
  await page.setContent(`<!doctype html><html><head><style>
    body{margin:0;padding:24px;background:#f4f4f5;font:14px/1.35 -apple-system,system-ui,sans-serif;color:#18181b}
    h1{font-size:18px;margin:0 0 16px}
    .grid{display:grid;grid-template-columns:repeat(${cols},${tileWidth}px);gap:${gap}px}
    figure{margin:0;background:#fff;border:1px solid #d4d4d8;border-radius:6px;overflow:hidden}
    .frame{height:${tileHeight}px;overflow:hidden;border-bottom:1px solid #e4e4e7;background:#fff}
    img{display:block;width:${tileWidth}px;height:auto}
    figcaption{padding:8px 10px;font-size:13px}
    figcaption span{color:#71717a;font:11px ui-monospace,monospace;word-break:break-all}
  </style></head><body><h1>${config.product} · ${area} · sheet ${sheet} (${start + 1}–${start + chunk.length} of ${files.length})</h1><div class="grid">${tiles}</div></body></html>`);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  const file = path.join(outDir, `${sheetPrefix}${String(sheet).padStart(2, '0')}.png`);
  await page.screenshot({ path: file, fullPage: true });
  written.push(path.relative(config.packDir, file));
}
await browser.close();
console.log(`${files.length} shots -> ${written.length} sheet(s):\n${written.join('\n')}`);
