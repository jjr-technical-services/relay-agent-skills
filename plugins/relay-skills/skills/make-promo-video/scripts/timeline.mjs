#!/usr/bin/env node
// Stage: timeline. Lays the shots end to end from the voice durations and the captures, and writes
// timeline.json (relay.promo_timeline.v1), which render.mjs and mix.mjs both read.
//
//   node timeline.mjs --project <dir>
//
// Shot length = lead + its lines (with a short gap between lines) + tail, never below minDuration.
// A live capture is fitted to its shot: when the capture is shorter, the extra time is spread as holds
// right after hovers and clicks (the camera stays on the element); when it is longer it plays faster,
// up to 1.6x, and past that the tail is trimmed and reported.
import fs from 'node:fs';
import path from 'node:path';
import { loadProject, log, readJson, writeJson } from './lib.mjs';

const LEAD = 0.35;
const GAP = 0.3;
const TAIL = 0.5;
const MAX_SPEED = 1.6;

// Sources rendered from a full-page still capture.
export const STILL_SOURCES = ['still', 'hero3d', 'lift', 'scroll'];

function stillEntry(config, shot, entry) {
  const capture = readJson(path.join(config.root, 'capture', shot.id, 'capture.json'));
  if (!capture) throw new Error(`${shot.id}: no capture; run capture.mjs`);
  entry.capture = { viewport: capture.viewport, scale: capture.scale };
  entry.image = path.join('capture', shot.id, 'still.png');
  entry.pageHeight = capture.pageHeight;
  const box = (ref) => (typeof ref === 'string' ? capture.anchors[ref] || null : null);
  if (shot.source === 'still') {
    entry.camera = (shot.camera || [{ at: 0, y: 0, zoom: 1 }]).map((key) => ({
      at: key.at, zoom: key.zoom ?? 1, offset: key.offset || null,
      ...(key.selector ? { box: capture.anchors[key.selector] } : { y: key.y ?? 0 }),
    }));
  } else {
    entry.fx = {
      focusBox: box(shot.focus), selectorBox: box(shot.selector), fromBox: box(shot.from), toBox: box(shot.to),
      fromY: typeof shot.from === 'number' ? shot.from : null, toY: typeof shot.to === 'number' ? shot.to : null,
      focusY: typeof shot.focus === 'number' ? shot.focus : null,
      rotateY: shot.rotateY || [-18, -8], rotateX: shot.rotateX || [10, 4], scale: shot.scale || [0.92, 1.0],
      pad: shot.pad ?? 16, theme: shot.theme || 'ink',
    };
  }
}

// Inverse of the output-to-capture time map: the first output time that shows capture time c.
export function outputTimeFor(map, c) {
  for (let i = 1; i < map.length; i += 1) {
    const [o0, c0] = map[i - 1];
    const [o1, c1] = map[i];
    if (c >= c0 && c <= c1) return c1 === c0 ? o0 : o0 + (o1 - o0) * ((c - c0) / (c1 - c0));
  }
  return null;
}

// Beat mode: every shot lasts a whole number of beats on the music's detected grid, starting on the
// first downbeat. Voice lines start voOffsetBeats (default 0.5) into their shot and may run across
// the next cut; captions live on one global track.
function buildBeatTimeline(config, voice) {
  const music = readJson(path.join(config.root, 'audio', 'music.json'));
  const board = config.storyboard;
  const bpm = music?.bpm || board.bpm || 112;
  const period = 60 / bpm;
  const grid = music?.beats?.length ? music.beats : Array.from({ length: 400 }, (_, i) => i * period);
  const first = music?.downbeatIndex ?? 0;
  const origin = grid[first];
  const beatAt = (k) => {
    const i = first + k;
    return (i < grid.length ? grid[i] : grid.at(-1) + (i - grid.length + 1) * period) - origin;
  };
  const lineById = Object.fromEntries((config.script?.lines || []).map((line) => [line.id, line]));
  const shots = [];
  const voiceClips = [];
  const captions = [];
  const silences = [];
  const sfx = [];
  const warnings = [];
  let beat = 0;
  for (const shot of board.shots || []) {
    const beats = shot.beats || 4;
    const start = beatAt(beat);
    const duration = beatAt(beat + beats) - start;
    beat += beats;
    const entry = { id: shot.id, source: shot.source, start, duration, beats, lines: [], headline: shot.headline || null, captions: shot.captions ?? shot.source !== 'text' };
    const offset = (shot.voOffsetBeats ?? 0.5) * period;
    for (const id of shot.lineIds || []) {
      const line = lineById[id];
      if (!line || !voice?.lines[id]) throw new Error(`${shot.id}: line ${id} missing from script or voice`);
      const at = start + offset + entry.lines.reduce((sum, l) => sum + l.end - l.start + 0.25, 0);
      const placed = { id, start: at - start, end: at - start + voice.lines[id].duration, text: line.caption || line.vo, file: voice.lines[id].file };
      entry.lines.push(placed);
      voiceClips.push({ id, file: placed.file, start: at });
      captions.push({ start: at, end: at + voice.lines[id].duration, text: placed.text, shotId: shot.id });
    }
    if (shot.silenceBefore) silences.push({ start: Math.max(0, start - period), end: start });
    if (shot.hit) sfx.push({ type: 'hit', t: start });
    if (shot.source === 'text') entry.text = { text: shot.text, sub: shot.sub || null, theme: shot.theme || 'ink', align: shot.align || 'center' };
    if (shot.source === 'title') entry.title = shot.title;
    if (shot.source === 'generated') {
      const file = shot.file ? path.resolve(config.root, shot.file) : path.join(config.root, 'broll', `${shot.id}.mp4`);
      if (fs.existsSync(file)) { entry.clip = path.relative(config.root, file); entry.title = shot.title || null; }
      else { warnings.push(`${shot.id}: generated clip missing, rendering its fallback title card`); entry.source = 'title'; entry.title = shot.fallbackTitle || shot.title; }
    }
    if (STILL_SOURCES.includes(shot.source)) stillEntry(config, shot, entry);
    if (shot.source === 'live') {
      const capture = readJson(path.join(config.root, 'capture', shot.id, 'capture.json'));
      if (!capture) throw new Error(`${shot.id}: no capture; run capture.mjs`);
      entry.capture = { viewport: capture.viewport, scale: capture.scale };
      entry.frames = capture.frames.map((frame) => ({ file: path.join('capture', shot.id, 'frames', frame.file), t: frame.t }));
      entry.actions = capture.actions;
      entry.cursorStart = capture.cursorStart;
      entry.zoom = shot.zoom || 'auto';
      entry.timeMap = fitCapture(capture, duration, shot, warnings);
      for (const action of capture.actions.filter((a) => a.type === 'click')) {
        const o = outputTimeFor(entry.timeMap, action.t);
        if (o != null && o < duration) sfx.push({ type: 'click', t: start + o });
      }
    }
    shots.push(entry);
  }
  for (let i = 1; i < voiceClips.length; i += 1) {
    const previous = voiceClips[i - 1];
    if (previous.start + voice.lines[previous.id].duration > voiceClips[i].start) warnings.push(`voice ${previous.id} overlaps ${voiceClips[i].id}; give its shot more beats`);
  }
  const duration = beatAt(beat);
  return { schema: 'relay.promo_timeline.v1', mode: 'beat', fps: config.fps, bpm, musicStart: origin, duration, shots, voice: voiceClips, captions, silences, sfx, warnings, builtAt: new Date().toISOString() };
}

export function buildTimeline(config) {
  const voice = readJson(path.join(config.root, 'audio', 'voice.json'));
  if (config.storyboard?.mode === 'beat') return buildBeatTimeline(config, voice || { lines: {} });
  if (!voice) throw new Error('Run voice.mjs first (audio/voice.json is missing).');
  const lineById = Object.fromEntries((config.script?.lines || []).map((line) => [line.id, line]));
  const warnings = [];
  const shots = [];
  const voiceClips = [];
  let cursor = 0;
  const usedLines = new Set();

  for (const shot of config.storyboard?.shots || []) {
    const lines = (shot.lineIds || []).map((id) => {
      if (!lineById[id]) throw new Error(`${shot.id}: unknown line ${id}`);
      if (!voice.lines[id]) throw new Error(`${shot.id}: no voice for line ${id}; rerun voice.mjs`);
      usedLines.add(id);
      return { ...lineById[id], duration: voice.lines[id].duration, file: voice.lines[id].file };
    });
    const lead = shot.lead ?? (shots.length === 0 ? 0.6 : LEAD);
    let t = lead;
    const placed = lines.map((line, index) => {
      const start = t;
      t += line.duration + (index < lines.length - 1 ? GAP : 0);
      return { id: line.id, start, end: start + line.duration, text: line.caption || line.vo, file: line.file };
    });
    const duration = Math.max(t + (shot.tail ?? TAIL), shot.minDuration || 0, lines.length ? 0 : shot.duration || 3);
    const entry = { id: shot.id, source: shot.source, start: cursor, duration, lines: placed, headline: shot.headline || null, captions: shot.captions !== false };
    for (const line of placed) voiceClips.push({ id: line.id, file: line.file, start: cursor + line.start });

    if (shot.source === 'title') entry.title = shot.title;
    if (shot.source === 'generated') {
      const file = shot.file ? path.resolve(config.root, shot.file) : path.join(config.root, 'broll', `${shot.id}.mp4`);
      if (fs.existsSync(file)) {
        entry.clip = path.relative(config.root, file);
        entry.title = shot.title || null;
      }
      else {
        warnings.push(`${shot.id}: generated clip missing, rendering its fallback title card`);
        entry.source = 'title';
        entry.title = shot.fallbackTitle || shot.title || { style: 'statement', heading: shot.headline || '' };
      }
    }
    if (shot.source === 'live' || shot.source === 'still') {
      const capture = readJson(path.join(config.root, 'capture', shot.id, 'capture.json'));
      if (!capture) throw new Error(`${shot.id}: no capture; run capture.mjs`);
      entry.capture = { viewport: capture.viewport, scale: capture.scale };
      if (shot.source === 'still') {
        entry.image = path.join('capture', shot.id, 'still.png');
        entry.pageHeight = capture.pageHeight;
        entry.camera = (shot.camera || [{ at: 0, y: 0, zoom: 1 }]).map((key) => ({
          at: key.at, zoom: key.zoom ?? 1, offset: key.offset || null,
          ...(key.selector ? { box: capture.anchors[key.selector] } : { y: key.y ?? 0 }),
        }));
      } else {
        entry.frames = capture.frames.map((frame) => ({ file: path.join('capture', shot.id, 'frames', frame.file), t: frame.t }));
        entry.actions = capture.actions;
        entry.cursorStart = capture.cursorStart;
        entry.zoom = shot.zoom || 'auto';
        entry.timeMap = fitCapture(capture, duration, shot, warnings);
      }
    }
    shots.push(entry);
    cursor += duration;
  }
  for (const id of Object.keys(lineById)) if (!usedLines.has(id)) warnings.push(`line ${id} is not used by any shot`);
  const captions = shots.flatMap((shot) => shot.lines.map((line) => ({ start: shot.start + line.start, end: shot.start + line.end, text: line.text, shotId: shot.id })));
  return { schema: 'relay.promo_timeline.v1', mode: 'narrated', fps: config.fps, duration: cursor, shots, voice: voiceClips, captions, warnings, builtAt: new Date().toISOString() };
}

// Returns [[outputTime, captureTime], ...] breakpoints for a piecewise-linear map (flat = hold).
// Page loads after a click are cut down to LOAD_SECONDS (an editor's cut: nothing is faked, the wait
// is shortened). Then, if the capture is still shorter than the shot, the spare time becomes holds
// after hovers, typing and settled navigations; if longer, the capture plays faster, up to MAX_SPEED.
const LOAD_SECONDS = 0.3;

export function fitCapture(capture, duration, shot, warnings = []) {
  const actions = capture.actions || [];
  const end = capture.duration;
  const loads = [];
  actions.forEach((action, index) => {
    if (action.type !== 'navigate' || !action.afterClick) return;
    const click = [...actions.slice(0, index)].reverse().find((a) => a.type === 'click');
    if (click && action.t - click.t > LOAD_SECONDS + 0.15) loads.push([click.t + 0.15, action.t]);
  });
  // Base map: real time everywhere except shortened loads.
  let map = [[0, 0]];
  let out = 0;
  let at = 0;
  for (const [a, b] of loads) {
    out += a - at; map.push([out, a]);
    out += LOAD_SECONDS; map.push([out, b]);
    at = b;
  }
  out += end - at; map.push([out, end]);
  const length = out;

  if (length >= duration) {
    const speed = length / duration;
    if (speed > MAX_SPEED) warnings.push(`${shot.id}: capture is ${length.toFixed(1)}s for a ${duration.toFixed(1)}s shot; trimmed at ${MAX_SPEED}x`);
    const k = Math.min(speed, MAX_SPEED);
    map = map.map(([o, c]) => [o / k, c]);
    if (speed > MAX_SPEED) {
      // Cut the map at the shot's end.
      const cut = [];
      for (let i = 0; i < map.length; i += 1) {
        if (map[i][0] <= duration) { cut.push(map[i]); continue; }
        const [o0, c0] = map[i - 1]; const [o1, c1] = map[i];
        cut.push([duration, c0 + (c1 - c0) * ((duration - o0) / (o1 - o0))]);
        break;
      }
      map = cut;
    }
    return round(map);
  }

  // Hold after a hover, after typing ends, after a settled click-navigation, and after a click that
  // neither starts typing nor navigates.
  const holdAt = actions.filter((action, index) => {
    if (action.type === 'hover' || action.type === 'type-end') return true;
    if (action.type === 'navigate') return Boolean(action.afterClick);
    if (action.type !== 'click') return false;
    const next = actions[index + 1];
    if (next && next.type === 'type' && next.t - action.t < 0.3) return false;
    return !(next && next.type === 'navigate' && next.afterClick);
  }).map((action) => Math.min(end, action.t + (action.type === 'navigate' ? 0.3 : 0.45)));
  if (!holdAt.length) return round([...map, [duration, end]]);
  const each = (duration - length) / holdAt.length;
  const outAt = (c) => {
    for (let i = 1; i < map.length; i += 1) {
      const [o0, c0] = map[i - 1]; const [o1, c1] = map[i];
      if (c <= c1) return c1 === c0 ? o0 : o0 + (o1 - o0) * ((c - c0) / (c1 - c0));
    }
    return map.at(-1)[0];
  };
  const points = [...map.map(([o, c]) => ({ o, c, hold: 0 })), ...holdAt.map((c) => ({ o: outAt(c), c, hold: each }))]
    .sort((x, y) => x.c - y.c || x.hold - y.hold);
  const result = [];
  let shift = 0;
  for (const point of points) {
    result.push([point.o + shift, point.c]);
    if (point.hold) { shift += point.hold; result.push([point.o + shift, point.c]); }
  }
  return round(result);
}

function round(map) {
  return map.map(([o, c]) => [Math.round(o * 1000) / 1000, Math.round(c * 1000) / 1000]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadProject();
  const timeline = buildTimeline(config);
  writeJson(path.join(config.root, 'timeline.json'), timeline);
  log('timeline', `${timeline.shots.length} shots, ${timeline.duration.toFixed(1)}s`);
  for (const warning of timeline.warnings) log('timeline', `warning: ${warning}`);
}
