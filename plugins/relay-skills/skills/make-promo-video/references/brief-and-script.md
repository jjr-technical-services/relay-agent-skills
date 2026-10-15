# Brief, script and storyboard

## Product understanding

Read the product the way a buyer would, through the kit's capture context (egress blocked,
read-only). Record for the brief:

- **What it is** in one sentence, in the product's own words where possible.
- **Who it is for**: one primary audience. Use a `develop-icp-and-uvp` handoff when one exists.
- **The one message** the video must leave behind.
- **Claims**: 3–7 statements the video will make, each quoted from a page with its URL and the date
  you read it. Label them Observed (you saw it on the page), Reported (a source you can cite says
  so) or Inferred. Only Observed and Reported claims may be spoken.
- **Flows**: 2–4 short paths that show the product doing its job, reachable without signing in (or
  in a demo workspace the owner provided).

## Choosing the video

| Type | Length | Lead ratio | Shape |
| --- | --- | --- | --- |
| Explainer | 45–75 s | 16:9 | problem → what it is → 2–3 proof shots → price or path → CTA |
| Demo walkthrough | 60–90 s | 16:9 | one flow end to end, narrated step by step |
| Teaser | 15–30 s | 9:16 | hook → one striking shot → CTA |
| Social cut | 15–30 s | 9:16 | cut down from an approved master (creative-adapt-localize) |
| Launch | 30–60 s | 16:9 | what's new → show it → who it's for → CTA |

Speech runs at about 150–165 words a minute; budget 2.5 words per second of voiceover.

## script.json (relay.promo_script.v1)

```json
{
  "schema": "relay.promo_script.v1",
  "product": "Northwind",
  "type": "explainer",
  "targetSeconds": 60,
  "audience": "…",
  "message": "…",
  "claims": [
    { "id": "C1", "text": "…", "evidence": { "url": "https://…", "quote": "exact words from the page", "label": "Observed", "observedAt": "2026-09-25" } }
  ],
  "lines": [
    { "id": "L1", "vo": "What the voice says.", "caption": "Optional written form (URLs, prices).", "claimIds": ["C1"] }
  ],
  "cta": { "text": "Start free", "url": "https://…" }
}
```

Rules `qa.mjs` enforces: every cited claim exists and has a URL and quote; a line with numbers,
prices, percentages or comparative words ("faster", "trusted by", "best") must cite a claim; no line
may read as a quote or testimonial. Write numbers and URLs the way they should be **spoken** in `vo`
("twenty-five dollar", "relay dot example dot com") and the way they should be **read** in `caption`.

## storyboard.json (relay.promo_storyboard.v1)

Each shot covers one or more consecutive lines. Its length is set by those lines' audio.

```json
{ "id": "S3-catalog", "lineIds": ["L3", "L4"], "source": "live", "url": "/catalog", "zoom": "auto",
  "headline": "One library, not forty tabs.",
  "steps": [
    { "do": "type", "selector": "input[placeholder^='Search']", "text": "onboarding", "delayMs": 90 },
    { "do": "click", "selector": "button:text-is('Search')", "waitForNavigation": true },
    { "do": "scroll", "to": 330, "durationMs": 1300 },
    { "do": "hover", "selector": "h3:text-is('Customer Onboarding Coordinator')", "holdMs": 900 }
  ] }
```

```json
{ "id": "S4-receipts", "lineIds": ["L5"], "source": "still", "url": "/",
  "camera": [
    { "at": 0, "selector": "text=Enterprise control", "zoom": 1.0 },
    { "at": 0.5, "selector": "text=Work receipt", "offset": { "x": 170, "y": 70 }, "zoom": 1.35 }
  ] }
```

Other fields: `headline` (shown above the screen in 9:16 and 1:1), `captions: false` (hide burned-in
captions on a card that already shows the words; the SRT keeps them), `minDuration`, `lead`, `tail`,
`setup` (steps run before recording starts), `tailMs`, `maxHeight` (still capture).

Title cards: `{ "source": "title", "title": { "style": "statement" | "end", "kicker", "heading", "sub", "cta" } }`.

Generated shots: see `generation.md`.

## Gate G1

Before recording or spending, show the user the claims with their evidence, the script and the
shot list, and the spend estimate (voice ≈ $0.02 per minute; generated b-roll by provider). Change
direction here; it is the cheapest point.
