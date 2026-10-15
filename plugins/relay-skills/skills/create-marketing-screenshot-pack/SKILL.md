---
name: create-marketing-screenshot-pack
description: Create source-grounded marketing and case-study screenshot packs from a product codebase, an authenticated Playwright crawl, or both. Use when selecting high-value product flows, capturing responsive screenshots, making crops or neutral device-framed derivatives, and delivering a narrative with an asset manifest.
---

# Create Marketing Screenshot Pack

Build a reusable evidence pack, not a loose screenshot dump. The result must show what the product does, why the selected moments matter to the intended audience, and where every raw and edited asset lives.

When scripts are needed, set `SCREENSHOT_SKILL_ROOT` to the directory that contains this `SKILL.md`. Install the script dependency once with `python3 -m pip install -r "$SCREENSHOT_SKILL_ROOT/scripts/requirements.txt"`. `render_frame.py` needs Pillow; `validate_pack.py` needs it only for non-PNG images.

## Establish the brief

Record the product, audience, intended claim, destination channels, environment, permitted account/data, and requested aspect ratios. If the user has not specified a marketing angle, infer a provisional one from product evidence and label it as an assumption.

Choose the evidence mode:

- **Source-led:** inspect routes, navigation, feature code, tests, stories, fixtures, and product copy. Use when code is available but authenticated browsing is unavailable. Label functionality as source-inferred until observed.
- **Crawl-led:** use Playwright to inspect the actual rendered product and authenticated flows. Use when the site is available and the session can be established safely.
- **Hybrid:** map flows from source, then verify and capture them in the browser. Prefer this when both are available.

Do not claim that a source-inferred flow works in the target environment without browser evidence. Distinguish implemented, observed, and successfully exercised states.

## Preserve authorization and data boundaries

Treat an authenticated crawl as read-only unless the user authorizes specific mutations. Navigation, tabs, filters, and reversible view controls are normally safe. Submissions, uploads, invitations, payments, deletes, messages, and production data changes require explicit scope or a safe demo fixture.

Prefer synthetic, staged, or approved demo data. Do not include credentials, session state, tokens, private customer data, secrets, or unnecessary personal information in screenshots, logs, manifests, or source notes. If authentic content is sensitive, use an approved demo state or redact a derivative while retaining an access-restricted raw capture only when authorized.

For login, prefer an existing repository auth fixture, then a named headed Playwright session in which the user can sign in interactively. Never write passwords or MFA codes into committed scripts. Do not copy browser storage state into the pack.

## Discover and select the story

1. Inventory candidate flows and the observable states within each flow.
2. Identify the buyer job, visible proof, product differentiation, outcome, and trust/control moment for each candidate.
3. Rank candidates with the criteria in [references/flow-selection.md](references/flow-selection.md). Use judgment rather than a score alone.
4. Choose the smallest set of screenshots that tells a coherent progression. Capture additional raw evidence when useful, but keep the selected narrative disciplined.
5. Record why each selected image earns its place and what claim it supports.

When source analysis is part of the task, inspect the real route and test architecture before crawling. Search route definitions, navigation, Playwright specs, fixture/seed commands, Storybook stories, feature flags, and audience-facing copy with `rg` and `rg --files`. Do not create parallel demo infrastructure when a safe fixture already exists.

## Capture with Playwright

Use Playwright for the rendered evidence. Prefer the repository's existing Playwright setup when it already owns authentication or deterministic fixtures; otherwise use the user-scoped Playwright CLI wrapper and a named session. Read [references/capture-playbook.md](references/capture-playbook.md) before authenticated or multi-breakpoint capture.

Unless the user or brand system specifies otherwise, begin with these review surfaces and adjust to the product:

- desktop: `1440x1000`
- tablet: `834x1112`
- mobile: `390x844`

Capture the same meaningful state at every requested breakpoint, not merely the same URL. Re-snapshot after responsive navigation or major DOM changes. Wait for the app's actual readiness signal and `document.fonts.ready`; do not rely only on arbitrary delays or `networkidle` when long polling exists.

Keep raw captures unchanged. For each selected state, retain a viewport capture that is suitable for framing. Add a full-page archival capture only when the complete page is evidence; do not place a tall full-page image inside a device frame.

Record the route, viewport, observed state, environment, revision when known, data mode, and any console/page/request failure. Log each capture's console errors in `evidence/capture-log.jsonl`. When an error is expected and harmless (for example, a signed-out public page probing the session and getting 401), add it to `pack.harmlessConsoleErrors` with a pattern and a reason instead of ignoring it silently. Do not present a failed or partially loaded state as product proof.

## Create derivatives

Crop only to improve emphasis or fit a known channel. Preserve the labels and surrounding context required to understand the feature. Record crop coordinates or the semantic element boundary and explain the crop's purpose.

Use neutral phone or laptop frames only for selected hero or channel-ready assets. Frames must not obscure product UI or imply unsupported hardware. Preserve the raw image alongside every crop or framed derivative. The bundled helper creates local, neutral frames without hotlinked assets:

```bash
python3 "$SCREENSHOT_SKILL_ROOT/scripts/render_frame.py" raw/mobile/03-review--mobile-390x844--raw.png \
  framed/phone/03-review--mobile-390x844--phone.png --frame phone --canvas-ratio 4:5
```

Use `--crop x,y,width,height` for a pixel crop. The helper prints a JSON record suitable for the manifest. It requires Pillow and exits with installation guidance when Pillow is unavailable.

## Assemble the pack

Initialize a portable pack with:

```bash
python3 "$SCREENSHOT_SKILL_ROOT/scripts/init_pack.py" <output-directory> \
  --title "Product case study" --product "Product name" --base-url "https://example.com"
```

Use the exact structure and manifest contract in [references/pack-contract.md](references/pack-contract.md). Every completed pack must include:

- `pack.md`: audience, narrative, flow explanation, functionality shown, selection rationale, recommended sequence, caveats, and links to named assets and folders
- `manifest.json` (schema 2): machine-readable flows, screenshots, viewport data, evidence status, crop/frame lineage, relative paths, and for every screenshot `selected`, `pageRole`, `altText`, and the pixel `dimensions` of each file
- untouched raw captures organized by breakpoint
- selected, cropped, and framed derivatives where they add value
- an evidence capture log without secrets

Use stable, ordered filenames: `<sequence>-<flow>-<state>--<breakpoint>--<variant>.png`. Keep paths relative inside `pack.md` and `manifest.json` so the pack remains portable. In the final handoff, also provide the absolute path to `pack.md` and the screenshot pack root.

## Verify before handoff

Run:

```bash
python3 "$SCREENSHOT_SKILL_ROOT/scripts/validate_pack.py" <output-directory>
```

Then visually inspect the selected images at full size. Confirm that each image is legible, materially distinct, correctly ordered, free of accidental sensitive data, and supported by the narrative. Verify that every path in the report and manifest resolves. Do not call source-only inspection, a successful login, or a green page load a completed functional flow.
