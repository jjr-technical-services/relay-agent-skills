#!/usr/bin/env node
// Stage: voice. Synthesizes one audio file per script line, so each line's exact duration drives the
// timeline and its captions (no transcription pass needed).
//
//   node voice.mjs --project <dir> [--provider openai|say] [--force]
//
// Providers:
//   openai : OpenAI speech API (promo.json voice.model / voice / instructions). Needs OPENAI_API_KEY in
//            the environment or in .env.local next to the project. Paid; every call goes to spend.jsonl.
//            OpenAI's usage policy requires telling listeners the voice is AI-generated, so the renderer
//            shows the promo.json "disclosure" label.
//   say    : macOS system voice. Free, for drafts and timing only; not cleared for published work.
// A line is re-synthesized only when its text or voice settings change (hash in audio/voice.json).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { elevenCost, elevenSpeech, openaiSpeech, ttsCost } from './tts.mjs';
import { argValue, loadProject, log, logSpend, probeDuration, projectPath, readJson, requireBinary, run, secret, writeJson } from './lib.mjs';

const config = loadProject();
requireBinary('ffmpeg');
const provider = argValue('provider') || config.voice.provider;
const force = Boolean(argValue('force'));
const only = argValue('only') ? String(argValue('only')).split(',') : null;
const lines = config.script?.lines || [];
if (!lines.length) throw new Error('script.json has no lines.');

const manifestFile = projectPath(config, 'audio', 'voice.json');
const manifest = readJson(manifestFile, { schema: 'relay.promo_voice.v1', lines: {} });

// A line may override the project voice (for example a second speaker): line.voice merges over
// promo.json voice, or names a preset in promo.json voices.
function voiceFor(line) {
  const preset = typeof line.voice === 'string' ? config.raw.voices?.[line.voice] : line.voice;
  if (typeof line.voice === 'string' && !preset) throw new Error(`${line.id}: unknown voice preset "${line.voice}"`);
  return { ...config.voice, ...(preset || {}) };
}

function hashOf(line) {
  return crypto.createHash('sha256').update(JSON.stringify([provider, voiceFor(line), line.vo])).digest('hex').slice(0, 16);
}

async function synthOpenAI(text, outFile, voice) {
  const key = secret('OPENAI_API_KEY', config);
  if (!key) throw new Error('OPENAI_API_KEY is not set (environment or .env.local). Use --provider say for a draft.');
  fs.writeFileSync(outFile, await openaiSpeech(key, voice, text));
}

async function synthEleven(text, outFile, voice) {
  const key = secret('ELEVENLABS_API_KEY', config) || secret('ELEVEN_AI_API_KEY', config);
  if (!key) throw new Error('ELEVENLABS_API_KEY (or ELEVEN_AI_API_KEY) is not set.');
  fs.writeFileSync(outFile, await elevenSpeech(key, voice, text));
}

function synthSay(text, outFile) {
  const aiff = outFile.replace(/\.wav$/, '.aiff');
  run('say', ['-v', config.voice.sayVoice || 'Samantha', '-o', aiff, '--', text]);
  run('ffmpeg', ['-y', '-v', 'error', '-i', aiff, '-ar', '48000', outFile]);
  fs.rmSync(aiff);
}

// Normalises every line to 48 kHz mono and trims leading/trailing silence so gaps are set by the
// timeline, not by the provider.
function clean(rawFile, outFile) {
  run('ffmpeg', ['-y', '-v', 'error', '-i', rawFile, '-af',
    'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse',
    '-ar', '48000', '-ac', '1', outFile]);
}

let spent = 0;
for (const line of lines) {
  const hash = hashOf(line);
  const outFile = projectPath(config, 'audio', `${line.id}.wav`);
  const existing = manifest.lines[line.id];
  if (only && !only.includes(line.id)) continue;
  if (!force && existing?.hash === hash && fs.existsSync(outFile)) continue;
  const voice = voiceFor(line);
  const lineProvider = voice.provider || provider;
  const rawFile = projectPath(config, 'audio', 'raw', `${line.id}.${lineProvider === 'elevenlabs' ? 'mp3' : 'wav'}`);
  if (lineProvider === 'openai') await synthOpenAI(line.vo, rawFile, voice);
  else if (lineProvider === 'elevenlabs') await synthEleven(line.vo, rawFile, voice);
  else if (lineProvider === 'say') synthSay(line.vo, rawFile);
  else throw new Error(`Unknown voice provider "${lineProvider}"`);
  clean(rawFile, outFile);
  const duration = probeDuration(outFile);
  manifest.lines[line.id] = { file: path.relative(config.root, outFile), duration, hash, provider: lineProvider, voice: voice.voice || voice.voiceId, voiceName: voice.name || null, model: voice.model };
  if (lineProvider === 'elevenlabs') {
    const usd = elevenCost(line.vo.length, voice.model);
    spent += usd;
    logSpend(config, { stage: 'voice', provider: 'elevenlabs', model: voice.model || 'eleven_v3', unit: 'tts_character', quantity: line.vo.length, audioSeconds: duration, usd, estimate: true, lineId: line.id });
  }
  if (lineProvider === 'openai') {
    const usd = ttsCost(line.vo.length, duration);
    spent += usd;
    logSpend(config, { stage: 'voice', provider: 'openai', model: voice.model, unit: 'tts_character', quantity: line.vo.length, audioSeconds: duration, usd, estimate: true, lineId: line.id });
  }
  log('voice', `${line.id}: ${duration.toFixed(2)}s (${provider})`);
}
manifest.provider = provider;
manifest.totalSeconds = lines.reduce((sum, line) => sum + (manifest.lines[line.id]?.duration || 0), 0);
writeJson(manifestFile, manifest);
log('voice', `total voice ${manifest.totalSeconds.toFixed(1)}s${spent ? `, spent ~$${spent.toFixed(3)}` : ''}`);
