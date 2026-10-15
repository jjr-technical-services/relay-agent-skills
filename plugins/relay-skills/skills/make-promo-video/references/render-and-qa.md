# Render and QA

## Renderer

`render.mjs` opens `scripts/compositor.html` in Chromium at the output size and, for every frame,
calls `__frame(t)` and takes a JPEG screenshot that is piped to ffmpeg (libx264, CRF 17, yuv420p,
AAC 192k, faststart). Everything is a function of `t`, so renders are deterministic and any range
can be re-rendered (`--from`, `--to`, `--half` for quick previews, `--stills` for review frames).
A 68 s video renders in about a minute per ratio on an Apple-silicon laptop.

- No Remotion and no ffmpeg text filters: titles, captions, cursor and camera are HTML/CSS in the
  compositor, so the kit runs with any ffmpeg build (Homebrew's lacks libass and drawtext). A
  production image should ship an LGPL-only ffmpeg; the compositor does not need GPL filters.
- `__frame` waits two animation frames before returning. Without that, a screenshot taken straight
  after a DOM change can miss it (it hid the end card's subtitle on the first run).
- Fonts are fetched once from Google Fonts (OFL) into `~/.cache/make-promo-video/fonts` and loaded
  from disk; rendering never touches the network.

## Layouts

| Ratio | Size | Product pixels | Text |
| --- | --- | --- | --- |
| 16:9 | 1920×1080 | full frame, 1280 CSS px across at zoom 1 | caption pill at the bottom |
| 9:16 | 1080×1920 | card 1000×860 under a headline, 820 CSS px across | brand row, headline, captions below |
| 1:1 | 1080×1080 | card 984×560, 1100 CSS px across | brand row, headline, captions below |

Camera zoom is clamped so a target element always fits across the layout, and targets wider than
the view are read from their left edge. Scroll-position keyframes borrow their horizontal position
from the nearest element keyframe, so narrow layouts stay on the content column.

## QA (`qa.mjs`)

Errors fail the run; warnings need a decision:

- claims: unknown ids, missing evidence, factual lines without a claim, testimonial-like lines
- generated shots not marked `depictsUi: false`; generated shots that fell back to title cards
- capture: too few frames; blocked hosts and writes listed for the reviewer
- timeline warnings (trimmed captures, unused lines)
- renders: size, audio track, duration against the timeline
- loudness within 1 LU of -14 LUFS, true peak at or under -1 dBTP
- AI voice without a disclosure label; draft `say` voice
- `--verify-voice`: transcript against script, per line

`provenance.json` records captured URLs and times (pixels not altered), claims and evidence, voice
provider and model, music source and licence, generated clips with provider, model, prompt and
cost, the disclosure label, total spend and tool versions. It is the input for C2PA content
credentials when the production pipeline adds them.

## Gate G2

QA never approves publication. A person checks the claims against the product as it is today,
the music licence against the channel, the disclosure label, and watches the whole video once with
sound before anything is posted.
