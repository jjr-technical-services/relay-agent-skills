# Voice, music and loudness

## Voice

- `voice.mjs` synthesizes one file per line, trims silence, and records the exact duration. The
  timeline is built from those durations, so captions line up without a transcription pass.
- `elevenlabs`: set `voice.provider` to `elevenlabs` and `voice.voiceId` (list voices with
  `GET /v2/voices`); model `eleven_v3` by default, the most expressive. Key `ELEVENLABS_API_KEY` or
  `ELEVEN_AI_API_KEY`. $0.10 per 1K characters (Flash $0.05). Output is MP3 at 128 kbps: the 192 kbps
  format needs a higher ElevenLabs plan and returns 403 on pay-as-you-go. Commercial rights depend on
  the plan; confirm before publishing.
- Providers: `openai` (`gpt-4o-mini-tts`, voice and `instructions` in promo.json; about $0.015–0.02
  per finished minute, 2026-09-25) and `say` (macOS voice, free, drafts only: not cleared for
  published work). Lines are cached by a hash of text and voice settings, so re-runs only pay for
  changed lines. Re-voice one line with `--only L3 --force`.
- OpenAI requires that listeners are told the voice is AI-generated: keep `disclosure` set.
- Never clone a real person's voice without their recorded consent through the provider's own flow.
- `qa.mjs --verify-voice` transcribes each line (about $0.003 per minute) and compares it with the
  script after normalising spoken numbers, prices and URLs. It caught "prompts" read as "probs" on
  the first Relay run; nobody had to listen for it. It does not judge tone or pacing: a person still
  listens once before publishing.

## Music

`music.source`:

- `elevenlabs`: `music.prompt` (genre, BPM, mood, "no vocals"), `music.model` (default `music_v2_5`);
  the bed is generated at the video's length, cached by prompt and length, about $0.15 per minute.
  It is levelled automatically `music.bedOffsetDb` (default -16) under the voice unless `gainDb` is set.
- `synth` (default for drafts): `music.mjs` generates an original ambient progression (pad,
  arpeggio, bass) sample by sample. No third-party material, so no licence question, but it is plain.
- `file`: a licensed track at `music.file`; put the licence scope in `music.licence` (it lands in
  `provenance.json`). Check the licence covers the channel: paid social and TV often need a higher tier.
- `none`.

Do not use tracks whose licence you cannot show, AI music services without an API and clear
commercial terms, or stock libraries that license only the account holder (for example Epidemic
Sound requires each end user to hold their own subscription).

## Mix

`mix.mjs` places each line at its timeline position, applies `music.gainDb` (default -20; the Relay
project uses -13, about 11 dB under the voice between lines), ducks the music under speech with a
sidechain compressor, and runs two-pass `loudnorm` to -14 LUFS integrated, -1.5 dBTP, which suits
YouTube, LinkedIn and the major social platforms.
