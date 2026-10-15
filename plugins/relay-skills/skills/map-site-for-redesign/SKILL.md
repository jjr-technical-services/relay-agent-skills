---
name: map-site-for-redesign
description: >-
  Screenshot an entire existing web app and organize it by user flow into a
  design-handoff pack for redesign or UX optimization work. Discovers every
  route from source files or a link crawl, runs the app in an isolated
  environment with seeded fixture data and personas, captures every route per
  persona and desktop/mobile viewport, deep-captures tabs, modals, empty,
  loading, error and permission states and multi-step flows, writes a spec per
  page and end-to-end flow docs with screenshot references, and packages a
  master brief, per-area prompts, contact sheets and a findings list (bugs,
  dead links, orphan and legacy pages) for AI design tools such as Claude
  Design or Figma. Use when asked to document, audit or screenshot every page
  of a product before a redesign. Do not use for marketing screenshot packs,
  for deriving views from a PRD with no running app, or for producing the
  redesigned screens themselves.
license: MIT
metadata:
  owner: rose
---

# Map a site for redesign

Turn a running product into a design-handoff pack: every page and state captured, organized by
area and user flow, described precisely enough that a designer or an AI design tool can redesign it
without opening the app. The pack documents what exists today. It does not propose the new design.

## Protect the boundary

- **Isolated environment only.** Capture a local build against a throwaway database. Never seed,
  sign up, submit forms or trigger jobs against production or any shared environment. Reading a
  public production page anonymously is fine; writing anything there is not.
- **Block egress before the first page load.** Apps hard-code production analytics and ad pixels,
  so an unblocked capture sends real page views from localhost to production accounts. The kit
  blocks in layers: `launch(config)` makes every other hostname fail to resolve (closing redirects,
  WebSockets and service-worker traffic), `newPage()` blocks service workers and aborts every
  request and WebSocket outside the capture origin, and `holdRequests()` / `rewriteJson()` never
  send an outside request themselves (`rewriteJson()` fetches with `maxRedirects: 0`, so a
  same-origin redirect to a third party goes back to the browser and is blocked there). `allowHosts` is the escape hatch. Any browser you open
  yourself, including an adapter's login browser, must use `egressLaunchArgs(config)`,
  `serviceWorkers: 'block'` and `blockEgress()`. The persona probe counts as a page load.
- **Fixture data is labelled.** Seed a realistic but obviously fictional company, `*.test` email
  domains and `seed-` id prefixes. Never copy real customer data into fixtures or screenshots.
- **Source is the truth for states.** Read each route's code to learn which tabs, dialogs, empty,
  error and permission states exist. Screenshots prove them; they do not discover them.
- **Never fake a state.** If a state cannot be reached, list it under Coverage gaps with the reason.
- **Report, don't fix.** Bugs found while capturing go into the findings list. Fixing them is separate work.

## Compose with neighbouring skills

- `map-application-views` derives the surface inventory from a PRD. When a PRD exists, reconcile
  its inventory with the discovered routes and flag views that exist in one but not the other.
- `create-wireframe-prompts` turns requirements into wireframe prompts; use it after this pack when
  the next step is new wireframes rather than a redesign of existing screens.
- `steel-design` (app surfaces) is the rulebook for the redesign that follows. Cite its rules in
  design notes when a page breaks one (chrome budget, table anatomy, state coverage).
- `create-marketing-screenshot-pack` selects a few flattering hero shots for marketing. This skill
  captures everything, including the ugly states, for design and UX audit.

## Workflow

Keep a pack folder outside the app repo. Copy `scripts/pack.config.example.json` into it as
`pack.config.json` and edit it. Every script reads that config. The kit needs Node 20+ and Playwright.

### 1. Discover routes

- With source: `node scripts/discover-routes.mjs --source <app> --git --out <pack>/routes.json`.
  It reads Next (app and pages routers), SvelteKit, Remix, Nuxt and Astro route files and records each
  file's last commit.
- Without source, or to cross-check: `node scripts/crawl-links.mjs --persona owner` does a
  same-origin link crawl and writes the inbound link graph.
- List dynamic routes and pick real sample URLs for each in `dynamicSamples` once data is seeded.
- Group routes into **areas** that match the product's navigation groups. An area is the unit of
  parallel work and of design-tool upload. See `references/route-discovery.md`.

### 2. Stand up the isolated environment

- Build the app from a clean checkout of the exact revision under review and serve it on its own
  port with a throwaway database. Never reuse the main checkout or a port other work depends on.
- Before starting the server, list every feature flag that hides a route or panel and turn them on
  (`serverFlags` in the config). Area agents cannot restart a shared server mid-run, so a flag
  missed here becomes a 404 in every area.
- Set the app's own API gate keys (keys the app checks on its own routes, not third-party
  credentials) to dummy values before the build, or those routes fail before any product logic runs.
- Seed personas that map to the product's **real access model**: typically **anon**, **new user**,
  **member**, **owner/admin** and **superadmin**, but a product without workspaces that grants
  access per purchase needs states like "lapsed checkout" and "paying customer" instead. Keep member
  and owner separate from superadmin: a superadmin sees past the gating a designer most needs to
  see. If the product has workspaces, give the owner a second one so switchers render.
  Seed enough records that every list, detail and dashboard has a populated state.
- Run `node scripts/make-personas.mjs`. It calls the app adapter to seed and sign in, saves one
  Playwright storageState per persona, and fails unless each persona reaches a protected probe route.
- The adapter is the only app-specific code. `scripts/adapters/relay.mjs` is the reference;
  `scripts/adapters/ui-login.mjs` drives a login form; `scripts/adapters/template.mjs` is the
  interface. Adapters receive kit helpers as `ctx.kit`, so a copied adapter works from any folder. See `references/isolated-environment.md` and `references/adapters.md`.

### 3. Baseline crawl

`node scripts/baseline.mjs` captures every route × persona × viewport (desktop 1440, mobile 390, 2x)
and writes `baseline.json`: status, final URL after redirects, title, h1, page errors, console
errors and the links on the page. Then `node scripts/find-orphans.mjs` classifies each route as
nav, linked, redirect, orphan or legacy candidate. Read the baseline before deep capture: it shows
broken pages, surprise redirects and permission leaks early.

### 4. Deep capture per area, in parallel

Hand every agent `baseline.json` so it skips redirects and broken routes and spends its time on
substates. Dispatch one subagent per area with the brief in `references/capture-playbook.md`. Each copies
`scripts/capture-area.template.mjs`, owns one `shots/<area>/` folder and one doc, and captures:
tabs and view toggles, every modal, drawer, menu and confirm dialog, empty, loading and error states
(forced with request interception), permission-denied and logged-out behaviour, form validation,
and multi-step flows numbered per step. Shot names follow
`<route-slug>__<nn>-<state>__<desktop|mobile>.png`.

Three capture rules that silently ruin a pack:

- Keep `reducedMotion: 'no-preference'`. With `reduce`, fade-in content often never appears and
  full-page shots come out blank.
- Most signed-in app shells scroll inside `<main>` or a pane, not the document, and Playwright's
  full-page option then stops at the viewport height. The kit's `shot()` finds overflowing inner
  scroll areas and grows the viewport to fit before shooting. Never call `page.screenshot` directly
  for a full-page capture, and spot-check that long pages show their footer or last row.
- Scroll the page and its inner scroll areas before a full-page shot (`reveal()` in the kit) so lazy
  and in-view content renders.

Parallel agents share one IP, so auth libraries rate-limit session checks and a signed-in page can
render signed out with no error. Set `signedOutSelector` in the config (for example the header's
"Log in" link): `shot()` then logs any signed-in shot that shows it or saw a 429, and the strict
build fails until those are re-captured.

States the isolated build cannot produce (AI readiness without a model key, paywalls, third-party
results) are reached by rewriting the real response (`rewriteJson()`). Label every such shot
`stubbed` in its name and spec. Native browser UI (select menus, `confirm()` dialogs, validation
bubbles) never appears in screenshots, so write its text into the spec.

### 5. Write the specs

Each area doc opens with an overview and the area's end-to-end flows as numbered steps with
screenshot references, then one section per route in the fixed shape in
`references/page-spec-template.md`: Status, Audience & access, Nav entry, Purpose, Layout & content,
Actions, Substates, Flows, Design notes, and a closing Coverage gaps list. Write `docs/flows.md`
for journeys that cross areas (sign-up to first value, invite to first contribution, upgrade).

### 6. Package for the design tool

Write `docs/00-master-brief.md` (product, personas, current IA and its known problems, tokens to
keep, pack layout). Run `node scripts/contact-sheet.mjs --area <area>` for each area,
`node scripts/make-upload-copy.mjs` for the 1x JPEG upload copy (2x PNG masters are far too heavy
to upload), write `docs/kickoff-goals.md` (4–5 redesign goals you infer from the findings: findable
navigation, merged duplicates, retired legacy pages, distinct empty and error states, the visual
system to keep), then `node scripts/build-pack.mjs --strict`. It writes a short KICKOFF-PROMPT for
the user to edit and paste first, wraps each area spec in a numbered
prompt that tells the design tool to confirm and wait until "all areas loaded", writes START-HERE,
checks every cited screenshot exists, every page section has all fields, every height-capped page
is admitted in Coverage gaps and findings separate local-environment effects. It then writes, by
default, self-contained part zips that each fit the upload limit (`uploadLimitMiB` in the config,
default 19, because online design tools reject single uploads over 20 MB) and unzip into one
folder to rebuild the pack, plus a lite zip (docs, prompts, sheets) and a full zip for desktop
transfer only. Every upload-bound file (lite zip, parts, sheets, upload JPEGs) is checked against
the limit and strict mode names any file over it. Details in `references/design-tool-packaging.md`.

After any harness fix (a capture bug found mid-run), re-capture every area shot before the fix.

### 7. Findings

`docs/findings.md` aggregates every area agent's findings into one list of what the capture proved is wrong, each with route, persona, evidence
screenshot and severity: broken pages and page errors, dead links, orphan and legacy routes,
redirect loops, permission leaks, errors swallowed into empty states, not-found pages served with
200, inconsistent patterns between areas, and missing states. Effects of the capture environment
(flags that could not be enabled, services without keys) go in a separate "Local environment only"
section so nobody files them as product bugs.

## Output

Return: the pack path and what to hand the user: the part zips (every one under `uploadLimitMiB`)
plus the lite zip; the full zip is for desktop transfer only. Then route count by class (nav, linked, redirect, orphan, legacy),
screenshot count, areas, the findings summary, and every coverage gap with its reason. State what
was not verified. The pack is ready for a human to review before it goes to a design tool.
