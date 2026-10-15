#!/usr/bin/env node
// Voice audition: reads the same lines in several voice + delivery-style pairings so a person can pick
// by ear before the full voiceover is made. Cheap (about $0.005 per take for two short lines).
//
//   node audition.mjs --project <dir> [--lines L1,L2] [--cast "ash:founder,coral:energetic,el:Roger=CwhRBWXzGAHq8TQ4Fs17"]
//
// OpenAI entries are voice:style. ElevenLabs entries are el:Name=voiceId (model eleven_v3; list voices
// with GET https://api.elevenlabs.io/v2/voices).
//
// Styles are delivery instructions; add your own in promo.json "voiceStyles": { name: "instructions" }.
// Output: audio/audition/NN-<voice>-<style>.wav, audio/audition/reel.mp3 (all takes, in order, with a
// short tone between them) and audition.json listing the order. Put the winner in promo.json voice.
import fs from 'node:fs';
import path from 'node:path';
import { elevenCost, elevenSpeech, openaiSpeech, ttsCost } from './tts.mjs';
import { argValue, loadProject, log, logSpend, probeDuration, projectPath, run, secret, writeJson } from './lib.mjs';

export const STYLES = {
  founder: 'You are the founder explaining your product to a smart peer over coffee: relaxed, confident, a little wry. Natural rhythm with varied pitch, quick conversational pace, no announcer voice, no hype.',
  energetic: 'Upbeat launch-video energy: punchy, crisp consonants, brisk pace, a lift on the key phrase of each sentence, a smile in the voice. Confident, never salesy or shouty.',
  cinematic: 'Low, close-mic cinematic trailer read: short deliberate phrases, a beat of silence before the key words, restrained intensity. Premium and calm, not dramatic parody.',
  documentary: 'Warm documentary narrator: curious and human, gently paced but never slow, clear emphasis, plain American English.',
  calm: 'Warm, confident product narrator at a natural, lightly brisk conversational pace. Plain American English. No hype. Keep pauses short.',
};

const config = loadProject();
const key = secret('OPENAI_API_KEY', config);
const elevenKey = secret('ELEVENLABS_API_KEY', config) || secret('ELEVEN_AI_API_KEY', config);
const styles = { ...STYLES, ...(config.raw.voiceStyles || {}) };
const lineIds = String(argValue('lines', 'L1,L2')).split(',');
const lines = (config.script?.lines || []).filter((line) => lineIds.includes(line.id));
if (!lines.length) throw new Error('No matching script lines to audition.');
const text = lines.map((line) => line.vo).join(' ');
const cast = String(argValue('cast', 'ash:founder,cedar:founder,marin:energetic,coral:energetic,verse:energetic,onyx:cinematic,sage:documentary,ballad:cinematic'))
  .split(',').map((entry) => {
    if (entry.startsWith('el:')) { const [name, voiceId] = entry.slice(3).split('='); return { provider: 'elevenlabs', voice: name, voiceId, style: 'eleven_v3' }; }
    const [voice, style] = entry.split(':');
    return { provider: 'openai', voice, style };
  });

const dir = path.dirname(projectPath(config, 'audio', 'audition', '.keep'));
const tone = path.join(dir, 'tone.wav');
run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=880:duration=0.18', '-af', 'volume=0.25,apad=pad_dur=0.6', '-ar', '48000', '-ac', '1', tone]);
const takes = [];
let index = 0;
for (const { provider, voice, voiceId, style } of cast) {
  if (provider === 'openai' && !styles[style]) { log('audition', `skipping ${voice}:${style}, unknown style`); continue; }
  if (provider === 'openai' && !key) { log('audition', 'skipping OpenAI voices: OPENAI_API_KEY is not set'); continue; }
  if (provider === 'elevenlabs' && !elevenKey) { log('audition', 'skipping ElevenLabs voices: ELEVENLABS_API_KEY is not set'); continue; }
  index += 1;
  const file = path.join(dir, `${String(index).padStart(2, '0')}-${voice.replace(/\W+/g, '')}-${style}.${provider === 'elevenlabs' ? 'mp3' : 'wav'}`);
  try {
    const audio = provider === 'elevenlabs'
      ? await elevenSpeech(elevenKey, { voiceId, model: 'eleven_v3' }, text)
      : await openaiSpeech(key, { model: config.voice.model, voice, instructions: styles[style] }, text);
    fs.writeFileSync(file, audio);
  } catch (error) {
    log('audition', `${voice}:${style} failed: ${error.message.slice(0, 160)}`);
    index -= 1;
    continue;
  }
  const seconds = probeDuration(file);
  const usd = provider === 'elevenlabs' ? elevenCost(text.length) : ttsCost(text.length, seconds);
  logSpend(config, { stage: 'audition', provider, model: provider === 'elevenlabs' ? 'eleven_v3' : config.voice.model, unit: 'tts_character', quantity: text.length, audioSeconds: seconds, usd, estimate: true, voice, style });
  takes.push({ n: index, provider, voice, voiceId: voiceId || null, style, seconds: Number(seconds.toFixed(2)), file: path.relative(config.root, file) });
  log('audition', `${index}. ${voice} / ${style}: ${seconds.toFixed(1)}s`);
}
if (!takes.length) throw new Error('No audition takes succeeded; see the errors above.');
for (const take of takes) {
  const wav = path.join(config.root, take.file).replace(/\.\w+$/, '.norm.wav');
  run('ffmpeg', ['-y', '-v', 'error', '-i', path.join(config.root, take.file), '-ar', '48000', '-ac', '1', wav]);
  take.norm = wav;
}
const list = path.join(dir, 'concat.txt');
fs.writeFileSync(list, takes.flatMap((take) => [`file '${tone}'`, `file '${take.norm}'`]).join('\n'));
const reel = path.join(dir, 'reel.mp3');
run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ar', '48000', '-ac', '1', '-b:a', '160k', reel]);
writeJson(path.join(dir, 'audition.json'), { schema: 'relay.promo_voice_audition.v1', text, takes, styles, reel: path.relative(config.root, reel) });
log('audition', `reel: ${reel}`);
