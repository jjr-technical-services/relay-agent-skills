// OpenAI speech call shared by voice.mjs and audition.mjs. Returns WAV bytes.
export async function openaiSpeech(key, { model, voice, instructions }, text) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, voice, input: text, instructions, response_format: 'wav' }),
  });
  if (!response.ok) throw new Error(`OpenAI speech failed: ${response.status} ${(await response.text()).slice(0, 300)}`);
  return Buffer.from(await response.arrayBuffer());
}

// Per-unit rates for the spend log, USD per single unit (Relay ledger convention). gpt-4o-mini-tts:
// $0.60 per 1M input characters (OpenAI pricing page, 2026-09-25); the audio-token component is
// estimated at $0.015 per output minute until verified.
export const TTS_RATES = { character: 0.0000006, audioMinuteEstimate: 0.015 };
export const ttsCost = (chars, seconds) => chars * TTS_RATES.character + (seconds / 60) * TTS_RATES.audioMinuteEstimate;

// ElevenLabs text to speech. voice.voiceId is required; voice.model defaults to eleven_v3 (the most
// expressive; understands audio tags such as [excited] or [whispers]). Returns MP3 bytes.
// Price: $0.10 per 1K characters for v3 and Multilingual v2, $0.05 for Flash (elevenlabs.io/pricing/api,
// 2026-09-25). Commercial use needs a paid plan.
export const ELEVEN_HOST = 'https://api.elevenlabs.io';
export const ELEVEN_KEY_HEADER = 'xi-api-key';
export async function elevenSpeech(credential, { voiceId, model = 'eleven_v3', stability, similarity, style, speed }, text) {
  if (!voiceId) throw new Error('ElevenLabs voice needs voiceId.');
  const voiceSettings = Object.fromEntries(Object.entries({ stability, similarity_boost: similarity, style, speed }).filter(([, v]) => v != null));
  const response = await fetch(`${ELEVEN_HOST}/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { [ELEVEN_KEY_HEADER]: credential, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: model, ...(Object.keys(voiceSettings).length ? { voice_settings: voiceSettings } : {}) }),
  });
  if (!response.ok) throw new Error(`ElevenLabs speech failed: ${response.status} ${(await response.text()).slice(0, 300)}`);
  return Buffer.from(await response.arrayBuffer());
}
export const elevenCost = (chars, model = 'eleven_v3') => chars * (/flash|turbo/.test(model) ? 0.00005 : 0.0001);

// ElevenLabs Music: an instrumental bed of exactly `seconds`. $0.15 per minute estimate (2026-09-25).
export async function elevenMusic(credential, { prompt, seconds, model = 'music_v2_5' }) {
  const response = await fetch(`${ELEVEN_HOST}/v1/music?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { [ELEVEN_KEY_HEADER]: credential, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ prompt, music_length_ms: Math.round(seconds * 1000), model_id: model, force_instrumental: true }),
  });
  if (!response.ok) throw new Error(`ElevenLabs music failed: ${response.status} ${(await response.text()).slice(0, 300)}`);
  return Buffer.from(await response.arrayBuffer());
}
export const elevenMusicCost = (seconds) => (seconds / 60) * 0.15;
