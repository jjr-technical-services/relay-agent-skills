#!/usr/bin/env node
// Make the upload copy: every 2x PNG master as a 1x JPEG (quality 80) under handoff/upload/shots/.
//
//   node make-upload-copy.mjs [--config pack.config.json] [--quality 80] [--include-baseline]
//
// 2x PNG masters are for Figma and close inspection; they are far too heavy to upload (the Relay run:
// 490 MB of masters became 248 MB of upload JPEGs). Uses Playwright to resample, so it runs anywhere
// the kit runs. Skips files whose JPEG is already newer than the PNG, so re-runs are cheap.
import fs from 'node:fs';
import path from 'node:path';
import { argValue, launch, loadConfig } from './lib.mjs';

const config = loadConfig();
const quality = Number(argValue('quality', 80));
const includeBaseline = process.argv.includes('--include-baseline');
const shotsDir = path.join(config.packDir, 'shots');
const outRoot = path.join(config.packDir, 'handoff', 'upload', 'shots');

// Width and height live at bytes 16-23 of a PNG's IHDR chunk.
function pngSize(file) {
  const header = Buffer.alloc(24);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, header, 0, 24, 0);
  fs.closeSync(fd);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const files = fs.readdirSync(shotsDir, { recursive: true }).map(String)
  .filter((name) => name.endsWith('.png') && (includeBaseline || !name.startsWith('baseline')));
const browser = await launch(config);
const page = await browser.newPage({ deviceScaleFactor: 1 });
let written = 0;
for (const relative of files) {
  const source = path.join(shotsDir, relative);
  const target = path.join(outRoot, relative.replace(/\.png$/, '.jpg'));
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs > fs.statSync(source).mtimeMs) continue;
  const { width, height } = pngSize(source);
  const scale = config.deviceScaleFactor || 2;
  const outWidth = Math.round(width / scale);
  const outHeight = Math.round(height / scale);
  await page.setViewportSize({ width: outWidth, height: Math.min(outHeight, 4000) });
  const data = fs.readFileSync(source).toString('base64');
  await page.setContent(`<body style="margin:0"><img style="display:block;width:${outWidth}px;height:${outHeight}px" src="data:image/png;base64,${data}"></body>`);
  await page.waitForFunction(() => document.images[0]?.complete);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await page.locator('img').screenshot({ path: target, type: 'jpeg', quality });
  written += 1;
}
await browser.close();
const bytes = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).map(String)
  .reduce((sum, name) => { const full = path.join(dir, name); return sum + (fs.statSync(full).isFile() ? fs.statSync(full).size : 0); }, 0) : 0);
console.log(`${written} written, ${files.length} total; masters ${(bytes(shotsDir) / 1e6).toFixed(1)} MB, upload copy ${(bytes(outRoot) / 1e6).toFixed(1)} MB`);
