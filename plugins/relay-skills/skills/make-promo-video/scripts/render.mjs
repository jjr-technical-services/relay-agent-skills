#!/usr/bin/env node
// Stage: render. Draws every frame in Chromium (compositor.html) and encodes H.264 + AAC with ffmpeg.
//
//   node render.mjs --project <dir> [--ratios 16:9,9:16] [--stills 3.5,20,41] [--from 10 --to 20] [--half]
//
//   --stills  write PNG frames at those times to renders/stills/ instead of encoding (fast review)
//   --from/--to render only part of the timeline (preview)
//   --half    half resolution (preview)
// Output: renders/<slug>-<ratio>.mp4, renders/<slug>.srt and .vtt (captions from the script text).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ensureFonts } from './fonts.mjs';
import { RATIOS, argValue, loadPlaywright, loadProject, log, probeDuration, projectPath, readJson, requireBinary, run, spawnFfmpeg, writeFrame, writeJson } from './lib.mjs';

const config = loadProject();
requireBinary('ffmpeg');
const timeline = readJson(path.join(config.root, 'timeline.json'));
if (!timeline) throw new Error('Run timeline.mjs first.');
const ratios = argValue('ratios') ? String(argValue('ratios')).split(',') : config.ratios;
const stills = argValue('stills') ? String(argValue('stills')).split(',').map(Number) : null;
const from = Number(argValue('from', 0));
const to = Number(argValue('to', timeline.duration));
const half = Boolean(argValue('half'));
const slug = (config.raw.slug || `${config.product}-promo`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const fileUrl = (rel) => pathToFileURL(path.resolve(config.root, rel)).href;

// Generated clips are decoded to JPEG frames first: Playwright's Chromium has no H.264 decoder, and
// frame-exact seeking in a <video> element is not reliable anyway.
function prepareGenerated(shot) {
  const dir = projectPath(config, 'broll', shot.id, 'frames', '.keep');
  const frameDir = path.dirname(dir);
  if (!fs.readdirSync(frameDir).some((f) => f.endsWith('.jpg'))) {
    run('ffmpeg', ['-y', '-v', 'error', '-i', path.resolve(config.root, shot.clip), '-vf', `fps=${timeline.fps}`, '-q:v', '3', path.join(frameDir, 'g%05d.jpg')]);
  }
  shot.clipFrames = fs.readdirSync(frameDir).filter((f) => f.endsWith('.jpg')).sort().map((f) => path.relative(config.root, path.join(frameDir, f)));
  const probe = run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.resolve(config.root, shot.clip)]).stdout.trim().split(',');
  shot.clipSize = { w: Number(probe[0]), h: Number(probe[1]) };
}

function fileMap() {
  const files = {};
  for (const shot of timeline.shots) {
    if (shot.image) files[shot.image] = fileUrl(shot.image);
    for (const frame of shot.frames || []) files[frame.file] = fileUrl(frame.file);
    for (const file of shot.clipFrames || []) files[file] = fileUrl(file);
  }
  return files;
}

function srtTime(seconds, sep = ',') {
  const ms = Math.round(seconds * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s}${sep}${String(ms % 1000).padStart(3, '0')}`;
}

function writeCaptionFiles() {
  const cues = timeline.shots.flatMap((shot) => shot.lines.map((line) => ({ start: shot.start + line.start, end: shot.start + line.end, text: line.text })));
  fs.writeFileSync(projectPath(config, 'renders', `${slug}.srt`), cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join('\n'));
  fs.writeFileSync(projectPath(config, 'renders', `${slug}.vtt`), `WEBVTT\n\n${cues.map((c) => `${srtTime(c.start, '.')} --> ${srtTime(c.end, '.')}\n${c.text}\n`).join('\n')}`);
}

for (const shot of timeline.shots) if (shot.source === 'generated' && shot.clip) prepareGenerated(shot);
const fontCss = await ensureFonts([
  { family: config.brand.fontSans, weights: [400, 500, 600, 700, 800] },
  { family: config.brand.fontMono, weights: [500] },
]);
if (!fontCss) log('render', 'warning: brand fonts unavailable, falling back to system-ui');
const logo = config.brand.logo ? pathToFileURL(config.brand.logo).href : '';
const mix = path.join(config.root, 'audio', 'mix.wav');
const { chromium } = await loadPlaywright();
// The compositor only reads local files: block the network entirely, including WebRTC UDP (which does
// not go through the resolver), and grant no file-access flags; images load as plain file: URLs.
const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP * ~NOTFOUND', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'] });
const outputs = [];
try {
  for (const ratio of ratios) {
    const size = RATIOS[ratio];
    if (!size) throw new Error(`Unknown ratio ${ratio}`);
    const W = half ? size.width / 2 : size.width;
    const H = half ? size.height / 2 : size.height;
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: half ? 0.5 : 1 });
    page.on('pageerror', (error) => log('render', `compositor error: ${error.message}`));
    await page.goto(pathToFileURL(path.join(import.meta.dirname, 'compositor.html')).href);
    const loadedFonts = await page.evaluate((options) => window.__setup(options), {
      W: size.width, H: size.height, timeline, files: fileMap(), fontCss, logo, product: config.product, disclosure: config.disclosure,
    });
    if (fontCss && !loadedFonts) log('render', 'warning: fonts declared but none loaded');
    const cdp = await page.context().newCDPSession(page);
    const grab = async (format) => Buffer.from((await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 92 : undefined, optimizeForSpeed: true })).data, 'base64');

    if (stills) {
      for (const t of stills) {
        await page.evaluate((time) => window.__frame(time), t);
        const file = projectPath(config, 'renders', 'stills', `${ratio.replace(':', 'x')}-${t.toFixed(2)}s.png`);
        fs.writeFileSync(file, await grab('png'));
        outputs.push(file);
      }
      await page.close();
      continue;
    }

    const suffix = from > 0 || to < timeline.duration || half ? '-preview' : '';
    const out = projectPath(config, 'renders', `${slug}-${ratio.replace(':', 'x')}${suffix}.mp4`);
    const hasAudio = fs.existsSync(mix);
    if (!hasAudio) log('render', 'warning: audio/mix.wav missing (run mix.mjs); rendering silent video');
    const args = ['-y', '-f', 'image2pipe', '-framerate', String(timeline.fps), '-c:v', 'mjpeg', '-i', '-'];
    if (hasAudio) args.push('-ss', String(from), '-t', String(to - from), '-i', mix);
    args.push('-map', '0:v', ...(hasAudio ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '192k'] : []),
      '-c:v', 'libx264', '-preset', half ? 'veryfast' : 'slow', '-crf', half ? '24' : '17', '-pix_fmt', 'yuv420p',
      '-r', String(timeline.fps), '-movflags', '+faststart', '-shortest', out);
    const { child, done } = spawnFfmpeg(args);
    const first = Math.round(from * timeline.fps);
    const last = Math.round(to * timeline.fps);
    const began = Date.now();
    for (let i = first; i < last; i += 1) {
      await page.evaluate((time) => window.__frame(time), i / timeline.fps);
      await writeFrame(child, await grab('jpeg'));
      if ((i - first) % (timeline.fps * 10) === 0 && i > first) log('render', `${ratio} ${(i / timeline.fps).toFixed(0)}s / ${to.toFixed(0)}s`);
    }
    child.stdin.end();
    await done;
    // Poster frame for thumbnails (the first frame is usually an empty title card): promo.json
    // posterAt in seconds, else two thirds into the second shot.
    const second = timeline.shots[1] || timeline.shots[0];
    const posterAt = config.raw.posterAt ?? second.start + second.duration * 0.66;
    await page.evaluate((time) => window.__frame(time), posterAt);
    fs.writeFileSync(out.replace(/\.mp4$/, '-poster.jpg'), await grab('jpeg'));
    log('render', `${ratio} -> ${path.relative(config.root, out)} (${probeDuration(out).toFixed(1)}s, ${((Date.now() - began) / 1000).toFixed(0)}s to render, ${W}x${H})`);
    outputs.push(out);
    await page.close();
  }
} finally {
  await browser.close();
}
// Review stills and partial previews never replace the record of the full renders that QA reads.
const isFullRender = !stills && !half && from === 0 && to === timeline.duration;
if (isFullRender) {
  writeCaptionFiles();
  const previous = readJson(path.join(config.root, 'renders', 'render.json'), { outputs: [] });
  const rendered = outputs.map((f) => path.relative(config.root, f));
  const kept = previous.outputs.filter((f) => !rendered.includes(f) && fs.existsSync(path.join(config.root, f)) && f.endsWith('.mp4'));
  writeJson(projectPath(config, 'renders', 'render.json'), { schema: 'relay.promo_render.v1', outputs: [...kept, ...rendered], renderedAt: new Date().toISOString(), timelineBuiltAt: timeline.builtAt });
}
for (const file of outputs) console.log(file);
