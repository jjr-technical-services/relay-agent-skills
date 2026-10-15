#!/usr/bin/env node
// Stage: qa. Automated checks before a person reviews the cut. Writes qa.json (shape compatible with
// relay.creative_qa.v1: status pass | pass_with_findings | fail) and provenance.json.
//
//   node qa.mjs --project <dir> [--verify-voice]
//
// --verify-voice transcribes each voice line (OpenAI gpt-4o-mini-transcribe, about $0.003/min) and
// compares it with the script, which catches mispronounced, skipped or invented words.
// QA never approves publication: a person still signs off on claims, rights and disclosure (gate G2).
import fs from 'node:fs';
import path from 'node:path';
import { spokenSimilarity } from './rules.mjs';
import { RATIOS, argValue, loadProject, log, logSpend, probeDuration, readJson, run, secret, totalSpend, writeJson } from './lib.mjs';

const config = loadProject();
const findings = [];
const add = (severity, check, message) => findings.push({ severity, check, message });
const script = config.script || {};
const storyboard = config.storyboard || {};
const timeline = readJson(path.join(config.root, 'timeline.json'));
const claims = Object.fromEntries((script.claims || []).map((claim) => [claim.id, claim]));

// 1. Claims: every cited claim exists and carries evidence; factual-looking lines must cite one.
for (const claim of script.claims || []) {
  if (!claim.evidence?.url || !claim.evidence?.quote) add('error', 'claims', `${claim.id} has no evidence url and quote`);
}
for (const line of script.lines || []) {
  for (const id of line.claimIds || []) if (!claims[id]) add('error', 'claims', `${line.id} cites unknown claim ${id}`);
  const factual = /\d|%|\$|\b(faster|cheaper|save[sd]?|increase[sd]?|reduce[sd]?|trusted by|customers|leading|best|#1|number one|guarantee[sd]?)\b/i;
  if (factual.test(line.vo) && !(line.claimIds || []).length) add('error', 'claims', `${line.id} states something factual ("${line.vo.slice(0, 60)}…") without a claimId`);
  if (/[“”"]/.test(line.vo) || /\b(says|said)\b/i.test(line.vo)) add('error', 'testimonial', `${line.id} reads like a quote or testimonial; invented endorsements are not allowed (FTC 16 CFR 465)`);
}

// Text cards state claims too: a factual card must cite one.
for (const shot of storyboard.shots || []) {
  if (shot.source !== 'text') continue;
  for (const id of shot.claimIds || []) if (!claims[id]) add('error', 'claims', `${shot.id} cites unknown claim ${id}`);
  const factual = /\d|%|\$|\b(faster|cheaper|save[sd]?|increase[sd]?|reduce[sd]?|trusted by|customers|leading|best|#1|number one|guarantee[sd]?)\b/i;
  if (factual.test(`${shot.text} ${shot.sub || ''}`) && !(shot.claimIds || []).length) add('error', 'claims', `${shot.id} card "${shot.text}" states something factual without a claimId`);
}

// 2. Generated footage never depicts product UI.
for (const shot of storyboard.shots || []) {
  if (shot.source === 'generated' && shot.depictsUi !== false) add('error', 'generated-ui', `${shot.id} is generated but not marked depictsUi:false`);
}

const brollManifest = readJson(path.join(config.root, 'broll', 'broll.json'), { clips: {} });
for (const [shotId, clip] of Object.entries(brollManifest.clips || {})) {
  if (clip.error) add('warning', 'generated', `${shotId} fell back to its title card: ${clip.error.split('\n')[0].slice(0, 160)}`);
}

// 3. Capture boundary: report what was blocked so a reviewer can see egress and writes were contained.
const blockedHosts = new Set();
const blockedWrites = new Set();
for (const shot of storyboard.shots || []) {
  const capture = readJson(path.join(config.root, 'capture', shot.id, 'capture.json'));
  if (!capture) continue;
  (capture.blockedHosts || []).forEach((host) => blockedHosts.add(host));
  (capture.blockedWrites || []).forEach((write) => blockedWrites.add(write));
  if (capture.source === 'live' && capture.frames.length < 10) add('error', 'capture', `${shot.id} has only ${capture.frames.length} frames`);
}
if (blockedHosts.size) add('info', 'egress', `blocked third-party hosts during capture: ${[...blockedHosts].join(', ')}`);
if (blockedWrites.size) add('info', 'read-only', `blocked writes to the product during capture: ${[...blockedWrites].join(', ')}`);

// 4. Timeline warnings.
if (!timeline) add('error', 'timeline', 'timeline.json missing');
for (const warning of timeline?.warnings || []) add('warning', 'timeline', warning);

// 5. Renders: duration, size, audio, loudness.
const render = readJson(path.join(config.root, 'renders', 'render.json'));
const mix = readJson(path.join(config.root, 'audio', 'mix.json'));
if (!render?.outputs?.length) add('error', 'render', 'no renders found');
for (const rel of render?.outputs || []) {
  const file = path.join(config.root, rel);
  if (!fs.existsSync(file) || !file.endsWith('.mp4')) continue;
  const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height', '-of', 'json', file]).stdout);
  const video = probe.streams.find((s) => s.codec_type === 'video');
  const audio = probe.streams.find((s) => s.codec_type === 'audio');
  const ratio = Object.entries(RATIOS).find(([, size]) => size.width === video.width && size.height === video.height)?.[0];
  if (!ratio) add('warning', 'render', `${rel} is ${video.width}x${video.height}, not a standard delivery size`);
  if (!audio) add('error', 'render', `${rel} has no audio track`);
  const duration = probeDuration(file);
  if (timeline && Math.abs(duration - timeline.duration) > 0.25) add('error', 'render', `${rel} is ${duration.toFixed(2)}s; timeline is ${timeline.duration.toFixed(2)}s`);
}
if (mix) {
  if (Math.abs(mix.integratedLufs + 14) > 1) add('warning', 'loudness', `mix is ${mix.integratedLufs} LUFS (target -14)`);
  if (mix.truePeakDb > -1) add('warning', 'loudness', `true peak ${mix.truePeakDb} dBTP (target ≤ -1.5)`);
} else add('error', 'loudness', 'audio/mix.json missing');

// 6. Disclosure: an AI voice must be labelled.
const voice = readJson(path.join(config.root, 'audio', 'voice.json'));
if (voice?.provider && voice.provider !== 'human' && !config.disclosure) add('error', 'disclosure', 'AI voice used but promo.json disclosure is empty');
if (voice?.provider === 'say') add('warning', 'voice', 'draft macOS voice used; re-run voice.mjs with a licensed provider before publishing');

// 7. Optional: transcribe each voice line and compare with the script.
const transcripts = {};
if (argValue('verify-voice') && voice) {
  const key = secret('OPENAI_API_KEY', config);
  if (!key) add('warning', 'voice', '--verify-voice needs OPENAI_API_KEY');
  else {
    for (const line of script.lines || []) {
      const entry = voice.lines[line.id];
      if (!entry) continue;
      const form = new FormData();
      form.append('model', 'gpt-4o-mini-transcribe');
      form.append('file', new Blob([fs.readFileSync(path.join(config.root, entry.file))], { type: 'audio/wav' }), `${line.id}.wav`);
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
      if (!response.ok) { add('warning', 'voice', `transcription failed for ${line.id}: ${response.status}`); continue; }
      const text = (await response.json()).text || '';
      transcripts[line.id] = text;
      logSpend(config, { stage: 'qa', provider: 'openai', model: 'gpt-4o-mini-transcribe', unit: 'audio_minute', quantity: entry.duration / 60, rate: 0.003, usd: (entry.duration / 60) * 0.003, lineId: line.id });
      const score = spokenSimilarity(line.vo, text);
      if (score < 0.97) add('warning', 'voice', `${line.id} transcript differs from script (${(score * 100).toFixed(0)}% match): "${text}"`);
    }
  }
}

const status = findings.some((f) => f.severity === 'error') ? 'fail' : findings.some((f) => f.severity === 'warning') ? 'pass_with_findings' : 'pass';
writeJson(path.join(config.root, 'qa.json'), { schema: 'relay.creative_qa.v1', status, findings, transcripts, checkedAt: new Date().toISOString(), humanApproval: 'required (G2): claims, rights, disclosure' });

// Provenance: what went into the video, for the reviewer and for C2PA-style disclosure later.
const broll = readJson(path.join(config.root, 'broll', 'broll.json'), { clips: {} });
const playwrightVersion = (() => { try { return readJson(path.join(path.dirname(new URL(import.meta.resolve('playwright')).pathname), 'package.json'))?.version; } catch { return null; } })();
writeJson(path.join(config.root, 'provenance.json'), {
  schema: 'relay.promo_provenance.v1', product: config.product, origin: config.origin,
  captured: (storyboard.shots || []).filter((s) => ['live', 'still'].includes(s.source)).map((s) => {
    const capture = readJson(path.join(config.root, 'capture', s.id, 'capture.json')) || {};
    return { shotId: s.id, source: s.source, url: capture.url, capturedAt: capture.capturedAt, pixelsAltered: false };
  }),
  claims: script.claims || [],
  voice: voice ? { provider: voice.provider, model: Object.values(voice.lines)[0]?.model, voice: Object.values(voice.lines)[0]?.voice, aiGenerated: voice.provider !== 'human' } : null,
  music: mix ? { source: mix.music, file: mix.musicFile, licence: config.music.licence || (mix.music === 'synth' ? 'Original procedural composition generated by make-promo-video; no third-party material.' : null) } : null,
  generated: Object.entries(broll.clips || {}).filter(([, clip]) => !clip.error).map(([shotId, clip]) => ({ shotId, ...clip })),
  disclosure: config.disclosure,
  spendUsd: Number(totalSpend(config).toFixed(4)),
  tools: { ffmpeg: run('ffmpeg', ['-version']).stdout.split('\n')[0], playwright: playwrightVersion },
});
log('qa', `${status}: ${findings.filter((f) => f.severity === 'error').length} errors, ${findings.filter((f) => f.severity === 'warning').length} warnings, ${findings.filter((f) => f.severity === 'info').length} info`);
for (const finding of findings) log('qa', `${finding.severity}: [${finding.check}] ${finding.message}`);
