---
name: make-promo-video
description: >-
  Turn a product URL into a finished marketing promo video. Reads the product
  and its site, picks the audience, message and video type, writes a
  claim-cited voiceover script and a storyboard, records real product flows
  in an egress-blocked read-only browser (sharp screencast plus an action log
  for cursor and zoom), signed in to a demo account when the app is behind a
  login, synthesizes the voice, adds an original or licensed
  music bed and burned-in captions, optionally generates mood b-roll (Veo or
  fal, never product UI), renders 16:9, 9:16 and 1:1 masters with SRT/VTT,
  and runs QA (claims, transcript check, loudness, disclosure) with a
  provenance record. Use when asked for a product demo video, explainer,
  launch or social promo video from a website or app. Do not use for
  screenshot packs, full-site redesign capture, avatar or talking-head
  videos, or for publishing to ad channels.
license: MIT
metadata:
  owner: rose
---

# Make a promo video from a product URL

Produce a short promo that shows the **real product**. Every frame of product UI comes from a
recording of the product itself; the renderer only moves a camera over those pixels and draws a
cursor, captions and titles on top. Generated video is limited to mood b-roll that shows no UI.

## Protect the boundary

- **Record read-only, behind the egress block.** The kit launches Chromium with resolver rules that
  fail every host except the product origin (plus `allowHosts`), blocks service workers and
  WebSockets, and aborts any request leaving the origin. In read-only mode (the default) it also
  aborts every POST, PUT, PATCH and DELETE to the product. These functions are byte-identical to
  map-site-for-redesign's kit; change both together.
- **Public pages, demo tenants or isolated builds only.** Record a public site logged out, a demo
  workspace the owner provides with no real customer data, or a local isolated build with fixture
  data (map-site-for-redesign's environment). Never record a production tenant or real people's data.
- **The user must own or be authorised for the URL.** Ask before recording a site that is not theirs.
- **Never generate product UI.** A generated shot must set `"depictsUi": false`; `broll.mjs` refuses
  prompts about screens, apps, text or brands. Logos and text go on as overlays, never in prompts.
- **No invented claims or endorsements.** Every factual line in the script cites a claim with
  evidence (URL, quote, date). No made-up testimonials, metrics, customer logos or "trusted by".
- **Label AI.** An AI voice is disclosed on screen (`disclosure`, default "AI voice"); generated
  footage is recorded in `provenance.json`. Avoid generated people entirely (synthetic-performer
  disclosure laws), and never clone a real voice without that person's recorded consent.
- **Stop before publishing.** The skill delivers files, QA and provenance. A person approves claims,
  rights and disclosure before anything is posted (gate G2).

## Compose with neighbouring skills

- `develop-icp-and-uvp`, `research-competitive-positioning`, `develop-marketing-strategy`: use their
  handoffs for audience, message and channel when they exist; otherwise do the short version below.
- `creative-director`: direction and brand kit for a campaign-grade piece.
- `creative-story-video`: beats and shot grammar; this skill's storyboard is compatible with its
  `relay.creative_sequence.v1` thinking but adds a `source` per shot.
- `map-site-for-redesign`: the isolated environment and personas when recording an app, not a site.
- `creative-adapt-localize`: cutdowns and translations after the master is approved.
- `creative-qa`: the human-facing review after `qa.mjs` passes.

## Workflow

Needs Node 20+, Playwright (with Chromium) and ffmpeg on PATH. Keep the project folder outside the
product repo. `node scripts/make.mjs init --project <dir> --url <product URL>` scaffolds it.

### 0. Sign in, when the app is behind a login

Only for a demo or staging account with no real customer data. `node scripts/make.mjs login
--project <dir> --headed` lets the person sign in in a visible browser; credentials never pass
through the agent. See `references/auth.md`.

### 1. Understand the product (G0)

Run `node scripts/discover.mjs --project <dir>`: it walks the site's navigation inside the capture
boundary and lists candidate features (heading, the site's own wording, thumbnail, camera selector) in
`features.json`. Then `node scripts/make.mjs classify --project <dir>` has Jev (TypeSafe, `ZEV_API_KEY`)
put each feature in a category and score how essential it is to a first-time viewer, with confidence;
key and recommended features lead the preview. Then read the
home, pricing, product and docs pages, and write down: what it is, who it is for, the one message,
3–7 claims **quoted from the site** with URL and date, and the flows that show the product working
(search, create, run, review). Label each claim Observed, Reported or Inferred; only Observed and
Reported claims may be spoken. See `references/brief-and-script.md`.

### 2. Choose the video

Default to a **music-driven teaser of 30–45 s** in beat mode: kinetic text cards, real UI shots cut on
the beat, a character voice for at most three short lines, 16:9, 9:16 and 1:1 masters. Read
`references/style.md` first: it has the shape, the shot catalogue and what to avoid. Use a narrated
explainer (45–75 s) or demo walkthrough (60–90 s) only for tutorials or when asked.

Voice: users rarely have a preference. Default to an ElevenLabs stock voice on `eleven_v3` (the Relay
teaser uses "Chris", `iP95p4xoKVk53GoZ742B`) and offer `audition.mjs` only if they want to choose.

### 3. Script and storyboard (G1)

Write `script.json` (`relay.promo_script.v1`): lines of voiceover of 5–10 s each, every factual line
citing claim ids, optional `caption` when the spoken form differs from the written one (URLs, prices).
Write `storyboard.json` (`relay.promo_storyboard.v1`): shots mapped to lines, each with a `source`:

- `live`: recorded steps (`goto`, `type`, `click`, `hover`, `scroll`, `press`, `wait`, `waitFor`) with
  Playwright selectors. Hovers and clicks become zoom targets automatically.
- `still`: a full-page screenshot with camera keyframes (`at` 0–1, `selector` or `y`, `zoom`,
  optional `offset`). Smoother than a recorded scroll for "tour the page" shots.
- `title`: statement or end card drawn in brand type.
- `generated`: mood b-roll with `prompt`, `depictsUi: false`, a `title` overlay if wanted, and a
  `fallbackTitle` used when generation is unavailable.
- Beat mode adds `text` (kinetic card), `hero3d` (tilted page), `lift` (one real element lifted off
  its page) and `scroll` (speed-ramped pan), each sized in `beats`. See `references/style.md`.

`node scripts/make.mjs draft --project <dir>` writes both files from the recommended (or chosen)
features with a model, in the house style. Code checks what the model may not do: every claim must
quote the captured site text word for word, shots can only target discovered features (selectors come
from `discover.mjs`), recorded flows can only be kept from an earlier plan, and generated shots must be
mood-only. A failing draft is retried once and otherwise refused; earlier versions stay in `drafts/`.
You can also write the files yourself.

**Review and edit loop (G1).** `node scripts/make.mjs preview --project <dir>` builds `preview.html`:
the script, the storyboard with thumbnails, evidence and a cost estimate, and every discovered feature
grouped and scored. The user can untick, reorder and resize shots, change the feature selection, and
write one clarification ("punchier hook", "lead with the catalog"). **Save changes** downloads
`changes.json`; run `node scripts/make.mjs draft --project <dir> --changes changes.json`. Shot edits
alone are applied directly; a clarification or a new feature set regenerates the script and plan as a
whole (scripts are not edited line by line). Repeat until the user approves. Nothing is recorded,
voiced, generated or rendered before that.

Voice: `node scripts/make.mjs audition --project <dir>` reads the first lines in several voices and
delivery styles (founder, energetic, cinematic, documentary, calm; add your own in
`promo.json voiceStyles`) and writes one reel to listen to. Put the pick in `promo.json voice`. A line
can use another voice (`"voice": "<preset>"` naming a `promo.json voices` entry) for two speakers.
Schemas and a worked example: `references/brief-and-script.md`, `assets/*.example.json`.

### 4. Produce

`node scripts/make.mjs --project <dir> --verify-voice` runs every stage and stops at QA:

| Stage | Script | Output |
| --- | --- | --- |
| capture | `capture.mjs` | `capture/<shot>/` frames or still, action log, blocked hosts and writes |
| voice | `voice.mjs` | one file per line, exact durations (`openai`, `elevenlabs`, or free `say` for drafts) |
| broll | `broll.mjs` | generated clips (`veo` or `fal`), spend-capped; failures fall back to title cards |
| music | `music.mjs` | the bed (`elevenlabs`, `synth` or a licensed `file`) and, in beat mode, its beat grid |
| timeline | `timeline.mjs` | `timeline.json`: shots on the beat grid (beat mode) or laid on the voice, captures fitted |
| mix | `mix.mjs` | voice + ducked music (auto-levelled), click and hit effects, music drops, two-pass loudnorm to -14 LUFS / -1.5 dBTP |
| render | `render.mjs` | `renders/<slug>-16x9.mp4`, `-9x16`, `-1x1`, plus `.srt` and `.vtt` |
| qa | `qa.mjs` | `qa.json` (pass / pass_with_findings / fail) and `provenance.json` |

Resume any stage with `--from <stage>`. Review cheaply with
`node scripts/render.mjs --project <dir> --stills 3,20,41` before a full render. Details:
`references/capture.md`, `references/audio.md`, `references/render-and-qa.md`,
`references/generation.md`.

### 5. Review and hand off (G2)

Look at stills from every ratio, read `qa.json`, fix every error and decide on each warning. Then
hand the user the renders, captions, `qa.json`, `provenance.json` and the spend total from
`spend.jsonl`, and list what still needs a person: claims, rights (music licence scope for the
channel), disclosure, and any fallback that replaced a planned generated shot.

## Output

Return: paths to the three masters and caption files, duration, the script, QA status with every
finding, spend by provider, and what was not verified (for example: nobody has listened to the
mix; generated b-roll fell back to a title card). The video is ready for a person to approve, not
published.
