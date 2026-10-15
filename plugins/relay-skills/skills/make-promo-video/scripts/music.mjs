#!/usr/bin/env node
// Stage: music. Produces the music bed before the timeline and, for beat-mode storyboards, its beat
// grid (audio/music.json), so every cut and text entrance can land on a beat.
//
//   node music.mjs --project <dir>
//
// Length: a beat-mode storyboard asks for its total beats at the requested BPM plus a bar of tail;
// a narrated storyboard asks for the voice-driven timeline length plus one second.
// Sources: promo.json music.source = "elevenlabs" (music.prompt, cached by prompt and length),
// "synth" (original procedural bed), "file" (a licensed track at music.file) or "none".
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { detectBeats } from './beats.mjs';
import { synthMusic } from './synth.mjs';
import { buildTimeline } from './timeline.mjs';
import { elevenMusic, elevenMusicCost } from './tts.mjs';
import { loadProject, log, logSpend, probeDuration, projectPath, secret, writeJson } from './lib.mjs';

const config = loadProject();
const board = config.storyboard || {};
const beatMode = board.mode === 'beat';
const bpm = board.bpm || config.music.bpm || 112;

function targetSeconds() {
  if (beatMode) {
    const beats = (board.shots || []).reduce((sum, shot) => sum + (shot.beats || 4), 0);
    return Math.ceil(((beats + 4) * 60) / bpm + 1);
  }
  return Math.ceil(buildTimeline(config).duration + 1);
}

const seconds = targetSeconds();
let file = null;
if (config.music.source === 'elevenlabs') {
  const prompt = config.music.prompt || `Modern, confident tech product launch instrumental at ${bpm} BPM, clean electronic pulse, warm synth chords, polished and minimal, no vocals`;
  const hash = crypto.createHash('sha256').update(JSON.stringify([prompt, seconds, config.music.model || 'music_v2_5'])).digest('hex').slice(0, 12);
  file = projectPath(config, 'audio', `music-elevenlabs-${hash}.mp3`);
  if (!fs.existsSync(file)) {
    const key = secret('ELEVENLABS_API_KEY', config) || secret('ELEVEN_AI_API_KEY', config);
    if (!key) throw new Error('music.source is "elevenlabs" but ELEVENLABS_API_KEY (or ELEVEN_AI_API_KEY) is not set.');
    fs.writeFileSync(file, await elevenMusic(key, { prompt, seconds, model: config.music.model }));
    logSpend(config, { stage: 'music', provider: 'elevenlabs', model: config.music.model || 'music_v2_5', unit: 'music_second', quantity: seconds, usd: elevenMusicCost(seconds), estimate: true });
    log('music', `generated ${seconds}s ElevenLabs bed (~$${elevenMusicCost(seconds).toFixed(2)})`);
  }
} else if (config.music.source === 'synth') {
  file = projectPath(config, 'audio', 'music-synth.wav');
  synthMusic(file, seconds, { bpm });
} else if (config.music.source === 'file') {
  file = path.resolve(config.root, config.music.file);
  if (!fs.existsSync(file)) throw new Error(`music.file not found: ${file}`);
}

const record = { schema: 'relay.promo_music.v1', source: config.music.source, file: file ? path.relative(config.root, file) : null, requestedSeconds: seconds };
if (file) {
  record.duration = probeDuration(file);
  if (beatMode) {
    Object.assign(record, detectBeats(file, { expectedBpm: bpm }));
    log('music', `beat grid: ${record.bpm} BPM, ${record.beats.length} beats, downbeat index ${record.downbeatIndex}, lock ${record.confidence}`);
    if (record.confidence < 2) log('music', 'warning: weak beat lock; cuts may drift from the music');
  }
}
writeJson(projectPath(config, 'audio', 'music.json'), record);
log('music', `${record.source}${file ? ` ${record.duration.toFixed(1)}s` : ''}`);
