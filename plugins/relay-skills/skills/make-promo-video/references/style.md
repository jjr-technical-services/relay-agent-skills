# House style: music-driven promos

Default to a **music-driven teaser**, not a narrated explainer. Research on 20 widely praised SaaS
launch videos (Linear, Arc, Cursor, Attio, Notion 3.0, Raycast, Claude Design; measured 2026-09-25
from YouTube metadata and captions) found almost none use a continuous narrator. They run 30–80 s,
are carried by music and 3–4-word text cards, and cut every 1.5–3 s. A calm narrator over 6–20 s
shots reads as slow and generic. Use the narrated explainer (`mode` omitted) only for tutorials or
when the user asks for one.

## Beat mode

`storyboard.json` with `"mode": "beat"` and `"bpm"`: every shot lasts `beats` beats. `music.mjs`
generates the bed first (ElevenLabs Music with the BPM in the prompt, or a licensed file), detects its
beat grid, and `timeline.mjs` starts the video on the first downbeat and puts every cut on a beat.

| Field | Effect |
| --- | --- |
| `beats` | Shot length in beats (at 112 BPM one beat is 0.54 s) |
| `lineIds`, `voOffsetBeats` | A voice line starts this many beats into the shot (default 0.5) and may run across the next cut |
| `hit: true` | Low hit on the shot's first frame (the reveal, the end card) |
| `silenceBefore: true` | Music drops for the beat before this shot: a breath before the reveal |
| `captions` | Voice captions show on every shot except text cards, unless set |

## Shape of a 30–45 s teaser

1. **Hook, 0–3 s:** a kinetic text card with the pain or outcome, 3–5 words, on the first downbeat.
2. **Problem, 3–8 s:** two or three 3-beat text cards, quoted from the product's own site.
3. **Reveal:** `silenceBefore` + `hit`, a tilted hero of the product, the first voice line.
4. **Proof, three beats of 6–10 s each:** a 3-beat text card naming the benefit, then one or two
   real-UI shots (lift, scroll, live flow).
5. **Montage:** four 2-beat hero shots.
6. **End card, 4–6 s:** logo, one line, CTA and URL; optional generated b-roll behind it.

Voice: a character, not a narrator. At most three short lines (about 1–1.5 words per second overall),
placed on the reveal, the strongest proof beat and the end card. Text on screen must stand alone
muted: most feed video plays without sound.

## Shot catalogue (all from real captures)

| `source` | What it is | Typical beats |
| --- | --- | --- |
| `text` | Kinetic card: words enter on half-beats; `sub`, `theme: ink | paper`, `align` | 3–4 |
| `hero3d` | The page region around `focus` (selector or y) on a tilted 3D window over a blurred backdrop; `rotateY`, `rotateX`, `scale` as [from, to] | 2–8 |
| `lift` | One real element (`selector`, `pad`) lifted off its page with a shadow; the page dims and blurs behind | 6–10 |
| `scroll` | Speed-ramped pan over the full page from `from` to `to` (selectors or y), motion blur at speed | 4 |
| `live` | Recorded flow with cursor, click ripples, zoom to action, click sounds | 6–8 |
| `still` | Camera move over a full-page screenshot | 4–8 |
| `generated` | Mood b-roll (no UI, no people, under 10% of runtime) with an optional title | 8–10 |
| `title` | Statement or end card | 6–10 |

Pixels are only cropped, scaled, tilted, dimmed or blurred, never redrawn. Lift a card only if it
reads on its own (a receipt, a settings panel, a result), and use it for one idea at a time.

## Avoid

Shots over 5 s; logo openers; a slow push-in on a dense dashboard; more than one message; a whoosh on
every cut; continuous voice over 2 words per second; AI b-roll over 10% of the runtime or showing
people; cropping 16:9 for vertical when a layout exists; any generated or faked UI.
