#!/usr/bin/env node
// Stage: broll. Generates the storyboard's "generated" shots: mood b-roll only, never product UI.
//
//   node broll.mjs --project <dir> [--provider veo|fal] [--only shotId] [--dry-run]
//
// Providers (both first-class; choose per project in promo.json broll.provider or per shot):
//   veo : Google Veo 3.1 through the Gemini API (GEMINI_API_KEY). Model broll.model, default
//         veo-3.1-fast-generate-preview. Priced per second of output; SynthID watermark.
//   fal : fal.ai queue API (FAL_KEY), any fal video model id in broll.model, for example
//         fal-ai/minimax/hailuo-02/standard/text-to-video or fal-ai/veo3.1/fast. Priced per second or clip.
// Every call is estimated first and refused if it would push spend.jsonl past broll.maxSpendUsd.
// Clip audio is discarded; the mix stage owns the soundtrack.
import fs from 'node:fs';
import path from 'node:path';
import { assertMoodShot } from './rules.mjs';
import { argValue, loadProject, log, logSpend, projectPath, secret, totalSpend, writeJson } from './lib.mjs';

// The Gemini API takes its key in this request header.
const GOOGLE_KEY_HEADER = 'x-goog-api-key';

const config = loadProject();
const only = argValue('only') ? String(argValue('only')).split(',') : null;
const dryRun = Boolean(argValue('dry-run'));
const shots = (config.storyboard?.shots || []).filter((shot) => shot.source === 'generated' && (!only || only.includes(shot.id)));

// USD per second of output, from ai.google.dev/gemini-api/docs/pricing read 2026-09-25 (Fast lists
// $0.10-0.12/s; 0.15 is a deliberate over-estimate so the cap errs safe). Update when prices change.
const RATES = {
  'veo-3.1-fast-generate-preview': 0.15,
  'veo-3.1-generate-preview': 0.40,
  'veo-3.1-lite-generate-preview': 0.08,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Credentials only ever go to the provider's own hosts. Download and status URLs come back inside
// provider responses, so every one is checked before a key is attached to it.
const PROVIDER_HOSTS = { google: ['generativelanguage.googleapis.com'], fal: ['queue.fal.run', 'fal.run', 'rest.alpha.fal.ai'] };
function providerUrl(url, provider) {
  const host = new URL(url).hostname;
  if (!PROVIDER_HOSTS[provider].includes(host)) throw new Error(`Refusing to send ${provider} credentials to ${host}`);
  return url;
}
const googleAuth = (credential) => ({ [GOOGLE_KEY_HEADER]: credential });
const falAuth = (credential) => ({ Authorization: `Key ${credential}`, 'Content-Type': 'application/json' });


async function veo(shot, outFile) {
  const key = secret('GEMINI_API_KEY', config);
  if (!key) throw new Error('GEMINI_API_KEY is not set.');
  const model = shot.model || config.broll.model || 'veo-3.1-fast-generate-preview';
  const seconds = shot.seconds || 8;
  const rate = RATES[model];
  if (rate == null) throw new Error(`No rate on file for ${model}; add it to RATES before spending.`);
  const estimate = seconds * rate;
  if (totalSpend(config) + estimate > config.broll.maxSpendUsd) throw new Error(`${shot.id}: estimate $${estimate.toFixed(2)} would pass maxSpendUsd $${config.broll.maxSpendUsd}.`);
  if (dryRun) { log('broll', `${shot.id}: would spend ~$${estimate.toFixed(2)} on ${model}`); return null; }
  const base = 'https://generativelanguage.googleapis.com/v1beta';
  const submit = await fetch(`${base}/models/${model}:predictLongRunning`, {
    method: 'POST',
    headers: { ...googleAuth(key), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: shot.prompt }],
      parameters: { aspectRatio: shot.aspectRatio || '16:9', negativePrompt: shot.negativePrompt || 'text, letters, logos, watermark, people, faces, hands, screens, user interface', resolution: shot.resolution || '1080p', durationSeconds: seconds },
    }),
  });
  if (!submit.ok) throw new Error(`Veo submit failed: ${submit.status} ${(await submit.text()).slice(0, 400)}`);
  const operation = await submit.json();
  log('broll', `${shot.id}: submitted ${operation.name}`);
  const began = Date.now();
  let done = null;
  while (!done) {
    await sleep(10000);
    const poll = await fetch(providerUrl(`${base}/${operation.name}`, 'google'), { headers: googleAuth(key) });
    const body = await poll.json();
    if (body.error) throw new Error(`Veo failed: ${JSON.stringify(body.error).slice(0, 400)}`);
    if (body.done) done = body;
    if (Date.now() - began > 12 * 60 * 1000) throw new Error('Veo timed out after 12 minutes.');
  }
  const sample = done.response?.generateVideoResponse?.generatedSamples?.[0];
  const filtered = done.response?.generateVideoResponse?.raiMediaFilteredReasons;
  if (!sample?.video?.uri) throw new Error(`Veo returned no video${filtered ? `: ${filtered.join('; ')}` : ''}`);
  const video = await fetch(providerUrl(sample.video.uri, 'google'), { headers: googleAuth(key) });
  if (!video.ok) throw new Error(`Veo download failed: ${video.status}`);
  fs.writeFileSync(outFile, Buffer.from(await video.arrayBuffer()));
  logSpend(config, { stage: 'broll', provider: 'google-gemini', model, unit: 'video_second', quantity: seconds, rate, usd: estimate, estimate: true, shotId: shot.id });
  return { provider: 'google-gemini', model, seconds, usd: estimate, operation: operation.name, latencySeconds: (Date.now() - began) / 1000 };
}

// fal.ai queue API. Not exercised on the build machine (no FAL_KEY); see references/generation.md.
async function fal(shot, outFile) {
  const key = secret('FAL_KEY', config);
  if (!key) throw new Error('FAL_KEY is not set.');
  const model = shot.model || config.broll.model;
  if (!model) throw new Error('Set broll.model (a fal model id) for the fal provider.');
  const rate = shot.rateUsdPerSecond ?? config.broll.rateUsdPerSecond;
  if (rate == null) throw new Error('Set broll.rateUsdPerSecond from the model page before spending on fal.');
  const seconds = shot.seconds || 6;
  const estimate = seconds * rate;
  if (totalSpend(config) + estimate > config.broll.maxSpendUsd) throw new Error(`${shot.id}: estimate $${estimate.toFixed(2)} would pass maxSpendUsd.`);
  if (dryRun) { log('broll', `${shot.id}: would spend ~$${estimate.toFixed(2)} on fal ${model}`); return null; }
  const headers = falAuth(key);
  const submit = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers, body: JSON.stringify({ prompt: shot.prompt, duration: String(seconds), aspect_ratio: shot.aspectRatio || '16:9', ...(shot.falInput || {}) }) });
  if (!submit.ok) throw new Error(`fal submit failed: ${submit.status} ${(await submit.text()).slice(0, 400)}`);
  const job = await submit.json();
  const began = Date.now();
  for (;;) {
    await sleep(5000);
    const status = await (await fetch(providerUrl(job.status_url, 'fal'), { headers })).json();
    if (status.status === 'COMPLETED') break;
    if (['FAILED', 'ERROR'].includes(status.status)) throw new Error(`fal job failed: ${JSON.stringify(status).slice(0, 400)}`);
    if (Date.now() - began > 12 * 60 * 1000) throw new Error('fal timed out after 12 minutes.');
  }
  const result = await (await fetch(providerUrl(job.response_url, 'fal'), { headers })).json();
  const url = result.video?.url || result.videos?.[0]?.url;
  if (!url) throw new Error('fal returned no video url.');
  fs.writeFileSync(outFile, Buffer.from(await (await fetch(url)).arrayBuffer()));
  logSpend(config, { stage: 'broll', provider: 'fal', model, unit: 'video_second', quantity: seconds, rate, usd: estimate, estimate: true, shotId: shot.id });
  return { provider: 'fal', model, seconds, usd: estimate, requestId: job.request_id, latencySeconds: (Date.now() - began) / 1000 };
}

if (!shots.length) log('broll', 'No generated shots in the storyboard.');
const manifestFile = projectPath(config, 'broll', 'broll.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : { schema: 'relay.promo_broll.v1', clips: {} };
for (const shot of shots) {
  assertMoodShot(shot);
  const outFile = projectPath(config, 'broll', `${shot.id}.mp4`);
  if (fs.existsSync(outFile) && !argValue('force')) { log('broll', `${shot.id}: exists, skipping (use --force to regenerate and pay again)`); continue; }
  const provider = shot.provider || config.broll.provider;
  if (provider === 'none') { log('broll', `${shot.id}: broll.provider is "none"; the fallback title card will render`); continue; }
  if (!['veo', 'fal'].includes(provider)) throw new Error(`Unknown broll provider "${provider}"`);
  let meta;
  try {
    meta = provider === 'veo' ? await veo(shot, outFile) : await fal(shot, outFile);
  } catch (error) {
    // A failed or refused generation must not sink the video: the timeline renders the shot's
    // fallback title card, and qa.mjs reports the fallback. --strict makes it fatal instead.
    if (argValue('strict')) throw error;
    manifest.clips[shot.id] = { error: error.message.slice(0, 500), provider, failedAt: new Date().toISOString() };
    log('broll', `${shot.id}: generation failed, the fallback title card will render. ${error.message.split('\n')[0].slice(0, 200)}`);
    continue;
  }
  if (meta) {
    manifest.clips[shot.id] = { file: path.relative(config.root, outFile), prompt: shot.prompt, ...meta, generatedAt: new Date().toISOString(), aiGenerated: true, depictsUi: false };
    log('broll', `${shot.id}: ${meta.seconds}s from ${meta.model}, ~$${meta.usd.toFixed(2)}, ${meta.latencySeconds.toFixed(0)}s`);
  }
}
writeJson(manifestFile, manifest);
