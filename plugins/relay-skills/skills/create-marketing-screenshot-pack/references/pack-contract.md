# Screenshot Pack Contract

The pack is a portable folder. All internal references are relative to the pack root.

## Folder structure

```text
<slug>-screenshot-pack/
|-- pack.md
|-- manifest.json
|-- raw/
|   |-- desktop/
|   |-- tablet/
|   `-- mobile/
|-- selected/
|-- crops/
|-- framed/
|   |-- laptop/
|   `-- phone/
`-- evidence/
    |-- capture-log.jsonl
    `-- source-notes.md
```

Keep raw images immutable. `selected/` may contain copies of the narrative sequence, while `crops/` and `framed/` contain derivatives. Do not mix traces, browser logs, or source notes into presentation-ready folders.

## Naming

Use:

```text
<sequence>-<flow>-<state>--<breakpoint>--<variant>.png
```

Examples:

```text
01-intake-submit--desktop-1440x1000--raw.png
03-review-approve--mobile-390x844--crop.png
05-results-summary--desktop-1440x1000--laptop.png
```

Keep the same sequence number for derivatives of the same narrative moment.

## `pack.md`

Include these sections:

1. **Pack summary:** product, audience, intended use, environment, capture date, revision, and data mode.
2. **Narrative:** the buyer problem, product mechanism, outcome, and trust/control story.
3. **Use-flow map:** ordered steps with entry state, action, system response, result, and evidence status.
4. **Selected screenshots:** one subsection or table row per image with functionality shown, why selected, supported claim, limitations, breakpoint choice, and links to raw/crop/frame files.
5. **Recommended sequences:** hero, short case study, long case study, social or sales collateral when applicable.
6. **Asset locations:** links to each screenshot folder and `manifest.json`.
7. **Caveats:** source-inferred states, unexercised mutations, inaccessible flows, redactions, capture failures, or environment drift.

## `manifest.json`

Use this shape. Additional fields are allowed when they remain portable and do not contain secrets.

```json
{
  "schemaVersion": 2,
  "pack": {
    "title": "Example product case study",
    "product": "Example",
    "audience": "Operations leaders",
    "intendedUse": ["case study", "sales deck"],
    "baseUrl": "https://example.com",
    "environment": "staging",
    "capturedAt": "2026-08-27T15:00:00Z",
    "revision": "abc1234",
    "dataMode": "synthetic demo",
    "harmlessConsoleErrors": [
      { "pattern": "401 .*\\/api\\/auth\\/get-session", "reason": "Public pages probe the session and expect 401 when signed out" }
    ]
  },
  "folders": {
    "rawDesktop": "raw/desktop",
    "rawTablet": "raw/tablet",
    "rawMobile": "raw/mobile",
    "selected": "selected",
    "crops": "crops",
    "framedLaptop": "framed/laptop",
    "framedPhone": "framed/phone",
    "evidence": "evidence"
  },
  "flows": [
    {
      "id": "review-and-approve",
      "name": "Review and approve",
      "buyerJob": "Confirm quality without losing control",
      "evidenceStatus": "successfully-exercised",
      "steps": ["Open review", "Inspect evidence", "Approve"]
    }
  ],
  "screenshots": [
    {
      "id": "03-review-approve-mobile",
      "flowId": "review-and-approve",
      "sequence": 3,
      "state": "Approval controls visible",
      "route": "/reviews/123",
      "breakpoint": "mobile",
      "viewport": { "width": 390, "height": 844 },
      "functionalityShown": "Human review and approval controls",
      "whySelected": "Makes the product's human-control boundary immediately visible",
      "claimSupported": "A reviewer can inspect and approve the output",
      "limitations": "Does not prove downstream delivery",
      "evidenceStatus": "successfully-exercised",
      "selected": true,
      "pageRole": "proof",
      "altText": "Mobile review screen with the approve and request-changes controls visible",
      "files": {
        "raw": "raw/mobile/03-review-approve--mobile-390x844--raw.png",
        "crop": "crops/03-review-approve--mobile-390x844--crop.png",
        "framed": "framed/phone/03-review-approve--mobile-390x844--phone.png"
      },
      "dimensions": {
        "raw": { "width": 780, "height": 1688 },
        "crop": { "width": 390, "height": 650 },
        "framed": { "width": 1600, "height": 2000 }
      },
      "derivative": {
        "cropPixels": { "x": 0, "y": 120, "width": 390, "height": 650 },
        "frame": "phone",
        "canvasRatio": "4:5"
      }
    }
  ]
}
```

Allowed evidence statuses are `source-inferred`, `observed`, `successfully-exercised`, and `blocked`. A blocked image cannot be selected as marketing proof.

Schema 2 fields, required on every screenshot so a landing page can place it without manual edits:

- `selected`: `true` for images in the narrative sequence, `false` for supporting raw evidence.
- `pageRole`: one of `hero`, `feature`, `workflow`, `proof`, `detail`, `mobile`, `archive`.
- `altText`: 10 to 250 characters describing what the image shows, not what it claims.
- `dimensions`: the pixel width and height of every file listed in `files`, keyed by the same variant. The validator checks each against the image.

`pack.harmlessConsoleErrors` lists console errors that are expected and do not invalidate a capture, each with a regular expression `pattern` and a `reason`. For example, a public page that probes the session gets an expected 401. Keep the list short and specific. The validator fails a selected screenshot whose capture logged any console error the list does not cover.

`schemaVersion` 1 packs still validate, with a warning to upgrade.

## Capture log

Write one JSON object per observed capture event to `evidence/capture-log.jsonl`. Record `screenshotId` and `consoleErrors` (an array of the console error messages; empty when there were none) so the validator can check them against the allowlist. Other useful fields are timestamp, URL or route, viewport, readiness check, failed request count, environment, revision, and notes. Never include cookies, authorization headers, tokens, passwords, raw storage state, or sensitive user content.

