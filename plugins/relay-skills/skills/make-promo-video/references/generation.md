# Generated b-roll

Generated video is for **mood shots only**: abstract motion, textures, places, objects. It is never
used for anything that depicts the product, its interface, text, logos or brands, and avoid people
entirely (generated performers in ads trigger disclosure laws such as New York GBL §396-b, in force
2026-06-09). Captured footage always wins for UI accuracy: generators invent labels, drift between
frames and blur small text.

## Shot fields

```json
{ "id": "S7-end", "lineIds": ["L8"], "source": "generated", "provider": "veo", "depictsUi": false,
  "seconds": 8, "resolution": "1080p", "aspectRatio": "16:9",
  "prompt": "Slow cinematic macro drift across a deep navy surface … No text, no logos, no people, no screens.",
  "negativePrompt": "text, letters, logos, watermark, people, faces, hands, screens, user interface",
  "title": { "style": "end", "heading": "…", "cta": "…" },
  "fallbackTitle": { "style": "end", "heading": "…", "cta": "…" } }
```

The clip fills the frame in every ratio (cropped to cover) with a slow push-in; a `title` renders
over it on a dark scrim. If generation fails, is refused or is over budget, the shot renders
`fallbackTitle` and QA reports the fallback. `--strict` makes a failure fatal instead.

## Providers (both first-class)

| Provider | Setting | Key | Notes (prices read 2026-09-25) |
| --- | --- | --- | --- |
| Google Veo 3.1 via the Gemini API | `"provider": "veo"`, `broll.model` default `veo-3.1-fast-generate-preview` | `GEMINI_API_KEY` | Fast $0.10–0.12/s, Standard $0.40/s, Lite $0.05–0.08/s; 4, 6 or 8 s; 16:9 or 9:16 (no 1:1); SynthID watermark. Needs a billing-enabled project: a free-tier key returns 429 RESOURCE_EXHAUSTED. |
| fal.ai | `"provider": "fal"`, `broll.model` a fal model id, `broll.rateUsdPerSecond` from its page | `FAL_KEY` | One adapter for MiniMax Hailuo, Wan, Kling, Seedance and Veo. Cheaper and supports 1:1, but no indemnity. Not yet exercised end to end: confirm the model's input fields and set `falInput` if they differ. |

Spend: every call is estimated first and refused if `spend.jsonl` would pass `broll.maxSpendUsd`.
The estimate uses a deliberately high rate so the cap errs safe; actual cost is on the provider's
bill. OpenAI's Sora API was shut down on 2026-09-24 and Amazon Nova Reel reaches end of life on
2026-09-30; do not add either.
