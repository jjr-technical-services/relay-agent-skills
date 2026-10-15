# Packaging for design tools

AI design tools (Claude Design, Figma Make and similar) work best with one area at a time: a short
prompt, the area spec, and a handful of images. A single upload of hundreds of screenshots gets
downscaled, truncated or ignored.

## Pack layout

```
<pack>/
  pack.config.json  routes.json  baseline.json  orphans.json  orphans.md  logs/truncated.json
  shots/baseline/   shots/<area>/              # 2x PNG masters (Figma, close inspection)
  docs/00-master-brief.md  docs/<area>.md  docs/flows.md  docs/findings.md   # what you write
  handoff/                                     # what you hand over; generated, do not edit
    START-HERE.md  KICKOFF-PROMPT.md  00-MASTER-BRIEF.md  FINDINGS.md  flows.md  manifest.json
    prompts/NN-<area>.md                       # area spec wrapped in load-and-wait instructions
    sheets/<area>-NN.png                       # contact sheets
    upload/shots/<area>/*.jpg                  # 1x JPEG q80 upload copy
  <product>-design-pack.zip                    # handoff/ only; --with-masters adds shots/
  <product>-design-pack-lite.zip               # docs, prompts, sheets; under uploadLimitMiB
  <product>-design-pack-parts/NN-*.zip         # default: self-contained parts under uploadLimitMiB
```

Scale reference from the Relay run: 136 routes, 1,324 shots, 490 MB of 2x masters, 248 MB upload
copy, 47 sheets totalling 15 MB, a 200 MB full zip, a 14 MB lite zip, and area specs of 33–57 KB each.
Online design tools, Claude Design among them, reject single uploads over 20 MB, and files sent to
the user through the app are capped at 30 MiB on phone and web. The full zip (200 MB on Relay) only
works as a desktop transfer. Hand the user the part zips plus the lite zip.

### Upload limit and part zips

`uploadLimitMiB` in the pack config (default 19) is the size every upload-bound file must fit: the
lite zip, every part zip, every contact sheet and every upload JPEG. `--strict` fails on any file
over it and names the file. If a sheet is over, lower `--per-sheet`; if a JPEG is over, lower
`maxShotHeight` or the JPEG quality.

`build-pack.mjs` writes the part zips by default to `<product>-design-pack-parts/`
(`--parts <MiB>` overrides the limit for one run, `--no-parts` skips them). They are self-contained
zips, not a binary split:

- `00-docs.zip`: START-HERE, kickoff, brief, findings, flows, prompts and sheets (split into
  `00-docs-1.zip`, `00-docs-2.zip` if the sheets push it over the limit).
- `NN-<area>-<k>.zip`: that area's upload JPEGs, packed greedily in capture order up to the limit,
  stored uncompressed (JPEGs do not compress further). `NN` runs across all parts, so they sort in
  upload order.
- Internal paths are kept, so unzipping every part into one folder rebuilds `handoff/`.
- The build checks that the image count across parts equals the upload copy and that no part is over
  the limit. The Relay pack came to 16 parts (245 MB, 1,324 images).

## Kickoff prompt (`handoff/KICKOFF-PROMPT.md`)

The first thing the user pastes into the design tool, and the first thing they will ask for.
`build-pack.mjs` generates it from the master brief and `docs/kickoff-goals.md`:

- what the product is, and each attached file with what it holds;
- the fixture and stubbed caveat;
- 4–5 redesign goals taken from FINDINGS (findable navigation, merged duplicates, retired legacy
  pages, distinct empty and error states, the visual system to keep), **labelled as the capturing
  agent's inference for the user to edit**;
- a staged workflow: (1) read, summarize, list problems and questions, no design yet; (2) propose the
  IA as a sitemap plus an old-route → new-location table; (3) the app shell, then Home; (4) one area
  per turn, covering every state and flow;
- an instruction to ask for full-resolution screenshots on demand.

## Master brief (`docs/00-master-brief.md`)

Pasted first, once per design session. Open it with a plain product summary paragraph: the
kickoff prompt uses the first paragraph that is not a heading, quote or paste instruction.

- **Product:** what it is, who pays, the one job it does best. Revision captured (commit) and date.
- **Personas:** each in a line, with what they come to do.
- **Current information architecture:** the navigation tree exactly as shipped (header, sidebar
  groups, avatar menu, footer), and the **known IA problems** the redesign should solve (duplicates,
  orphans, dead ends, items in the wrong group), with route counts by reachability class.
- **Global chrome:** header, sidebar, workspace switcher, notifications, toasts, footer, and how they
  change between personas and at mobile width.
- **Tokens to keep:** colours, type families and scale, radius, spacing, motion, quoted from the
  design token source (CSS variables, Tailwind theme, token JSON). Quote values; do not describe them.
- **Constraints:** what the redesign must keep (product name, marks, legal pages, accessibility
  target, supported viewports) and what is explicitly open.
- **Pack layout:** areas in order, file naming, stubbed and truncated conventions, where flows and
  findings live.

## Area prompts (`handoff/prompts/NN-<area>.md`)

`build-pack.mjs` generates one per area, in `areas` order from the config. Each is a short header
plus the full area spec: paste it after the master brief, attach the area's sheets for an overview
and full shots from `upload/` for detail, confirm what arrived, list questions, and **do not design
until the user says "all areas loaded"**. Loading everything first stops the tool from designing
area one before it has seen the IA problems in area six. Edit `docs/<area>.md`, never the prompt.

If the tool truncates a long prompt, paste the area overview and flows first and the route specs
in a second message.

## Contact sheets

`contact-sheet.mjs --area <area>` renders an HTML grid in Playwright and screenshots it; no image
library is needed. Defaults are what stayed legible after upload: 24 desktop tiles per sheet, 4
columns, 1600 px wide, top-cropped, captioned with route, state and file name, in capture order. Run
`--viewport mobile` separately when mobile matters for an area. Sheets are for orientation; attach
full shots for the flows the design tool must match closely.

## Size and height limits

- Upload the 1x JPEG copy (`make-upload-copy.mjs`), never the 2x PNG masters.
- Full-page shots are capped at 7,000 CSS px (`maxShotHeight`). Taller images are useless once a design
  tool downsamples them. Capped shots are logged to `logs/truncated.json`; list each in its area's
  Coverage gaps (the strict build checks).
- Upload limits were not verified for Claude Design and change over time. Check the tool's current
  limits before a session and plan on sheets first, then a few selected full shots per message.

## Findings (`docs/findings.md` → `FINDINGS.md`)

Aggregate every area agent's list into one file with three sections: **Broken or misleading**,
**Structure and navigation**, and **Local environment only, not product bugs** (flags that could not
be enabled, missing keys, stubbed services). The strict build fails without the last section; write
"None" if it is empty.

## Figma

For Figma, import the full-resolution shots (not sheets) into one page per area, one frame per
route, states left to right in `nn` order, with the spec section pasted as a text layer beside each
frame. Keep the file names as layer names so frames trace back to the pack.

## Before handing it over

- `node scripts/build-pack.mjs --strict` passes: no missing or uncited shots, no incomplete page
  sections, every area has a sheet, the upload copy exists, capped pages are in Coverage gaps, and
  findings separate local-environment effects.
- If the harness changed during the run, every area captured before the change has been re-captured.
- A human has skimmed every contact sheet for blank, logged-out or duplicate captures.
- Findings are reviewed with the product owner; bugs go to the backlog separately from the redesign.
- The zip contains no real customer data, credentials or storageState files (they live in `state/`,
  outside `handoff/`).
