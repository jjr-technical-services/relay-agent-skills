#!/usr/bin/env node
// Stage: mix. Places each voice line at its timeline position over the music bed from music.mjs,
// ducks the music under speech, adds sound effects, and normalises to -14 LUFS integrated,
// -1.5 dBTP (two-pass loudnorm) for social and web delivery.
//
//   node mix.mjs --project <dir>
//
// Narrated storyboards keep the music as a bed (music.bedOffsetDb, default -16 dB under the voice).
// Beat-mode storyboards put the music forward (default -5 dB under the voice), start it on the first
// downbeat, drop it for a beat before shots marked "silenceBefore", and add a soft click on every
// recorded click and a low hit on shots marked "hit". The effects are synthesised here, not sampled.
import fs from 'node:fs';
import path from 'node:path';
import { loadProject, log, projectPath, readJson, requireBinary, run, writeJson } from './lib.mjs';

const config = loadProject();
requireBinary('ffmpeg');
const timeline = readJson(path.join(config.root, 'timeline.json'));
if (!timeline) throw new Error('Run timeline.mjs first.');
const music = readJson(path.join(config.root, 'audio', 'music.json'), { source: 'none', file: null });
const duration = timeline.duration;
const beatMode = timeline.mode === 'beat';
const musicFile = music.file ? path.resolve(config.root, music.file) : null;

const integrated = (file) => {
  const out = run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'ebur128', '-f', 'null', '-']).stderr;
  return Number(out.slice(out.lastIndexOf('Integrated loudness')).match(/I:\s+(-?[\d.]+)/)[1]);
};

// Level: an explicit music.gainDb wins; otherwise the bed is placed relative to the voice.
const explicitGain = config.raw.music?.gainDb;
let musicGain = explicitGain ?? 0;
if (musicFile && (explicitGain == null || explicitGain === 'auto')) {
  const offset = config.music.bedOffsetDb ?? (beatMode ? -5 : -16);
  const reference = timeline.voice.length ? integrated(path.resolve(config.root, timeline.voice[0].file)) : -16;
  musicGain = Number((reference + offset - integrated(musicFile)).toFixed(1));
  log('mix', `music level auto: ${musicGain} dB (${offset} dB relative to the voice)`);
}

// Sound effects, synthesised once per project.
function sfx(name, filter) {
  const file = projectPath(config, 'audio', 'sfx', `${name}.wav`);
  if (!fs.existsSync(file)) run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', filter, '-ar', '48000', '-ac', '2', file]);
  return file;
}
const effects = [];
for (const event of timeline.sfx || []) {
  if (event.type === 'click') effects.push({ file: sfx('click', 'anoisesrc=d=0.03:c=white:a=0.5,highpass=f=2500,lowpass=f=7000,afade=t=out:d=0.03,volume=-14dB'), at: event.t });
  if (event.type === 'hit') effects.push({ file: sfx('hit', "aevalsrc='0.9*sin(2*PI*(55-15*t)*t)*exp(-3.2*t)|0.9*sin(2*PI*(55-15*t)*t)*exp(-3.2*t)':d=1.4,volume=-4dB"), at: event.t });
}

const inputs = [];
const filters = [];
let n = 0;
const voiceLabels = [];
for (const clip of timeline.voice) {
  inputs.push('-i', path.resolve(config.root, clip.file));
  const ms = Math.round(clip.start * 1000);
  filters.push(`[${n}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${ms}|${ms}[v${n}]`);
  voiceLabels.push(`[v${n}]`);
  n += 1;
}
const fxLabels = [];
for (const effect of effects) {
  inputs.push('-i', effect.file);
  const ms = Math.max(0, Math.round(effect.at * 1000));
  filters.push(`[${n}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${ms}|${ms}[x${n}]`);
  fxLabels.push(`[x${n}]`);
  n += 1;
}
const end = duration.toFixed(3);
const silentVoice = !voiceLabels.length;
if (silentVoice) filters.push(`anullsrc=r=48000:cl=stereo,atrim=0:${end}[vo]`);
else filters.push(`${voiceLabels.join('')}amix=inputs=${voiceLabels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${end}[vo]`);

if (musicFile) {
  const startAt = Number(timeline.musicStart || 0).toFixed(3);
  const gates = (timeline.silences || []).map((s) => `between(t,${s.start.toFixed(3)},${s.end.toFixed(3)})`);
  const gate = gates.length ? `,volume='if(${gates.join('+')},0.06,1)':eval=frame` : '';
  const fadeOut = `afade=t=out:st=${Math.max(0, duration - 1.6).toFixed(3)}:d=1.6`;
  inputs.push('-i', musicFile);
  filters.push(`[${n}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=start=${startAt},asetpts=PTS-STARTPTS,apad,atrim=0:${end},volume=${musicGain}dB${gate},${fadeOut}[mus]`);
  n += 1;
  if (silentVoice) filters.push('[mus]anull[bed]');
  else {
    filters.push('[vo]asplit=2[vo1][vo2]');
    filters.push(`[mus][vo2]sidechaincompress=threshold=0.015:ratio=${beatMode ? 8 : 5}:attack=20:release=${beatMode ? 350 : 450}[bed]`);
  }
  const voiceIn = silentVoice ? '[vo]' : '[vo1]';
  filters.push(`${voiceIn}[bed]${fxLabels.join('')}amix=inputs=${2 + fxLabels.length}:normalize=0:dropout_transition=0[pre]`);
} else if (fxLabels.length) {
  filters.push(`[vo]${fxLabels.join('')}amix=inputs=${1 + fxLabels.length}:normalize=0:dropout_transition=0[pre]`);
} else {
  filters.push('[vo]anull[pre]');
}
const premix = projectPath(config, 'audio', 'premix.wav');
run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filters.join(';'), '-map', '[pre]', '-ar', '48000', premix]);

// Two-pass loudness normalisation.
const loudnormJson = (text) => JSON.parse(text.match(/\{[^{}]*"target_offset"[^{}]*\}/)[0]);
const measure = run('ffmpeg', ['-hide_banner', '-i', premix, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
const stats = loudnormJson(measure.stderr);
const out = projectPath(config, 'audio', 'mix.wav');
run('ffmpeg', ['-y', '-v', 'error', '-i', premix, '-af',
  `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true`,
  '-ar', '48000', out]);
const check = run('ffmpeg', ['-hide_banner', '-i', out, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
const final = loudnormJson(check.stderr);
writeJson(projectPath(config, 'audio', 'mix.json'), {
  schema: 'relay.promo_mix.v1', duration, music: music.source, musicFile: music.file, musicGainDb: musicGain,
  effects: effects.length, integratedLufs: Number(final.input_i), truePeakDb: Number(final.input_tp), lra: Number(final.input_lra),
});
log('mix', `mix.wav ${duration.toFixed(1)}s, ${Number(final.input_i).toFixed(1)} LUFS, peak ${Number(final.input_tp).toFixed(1)} dBTP, music: ${music.source}, ${effects.length} effects`);
