# Capture playbook

## Order of work

1. Baseline first (`baseline.mjs`), all routes, all applicable personas, desktop and mobile.
   Review `baseline.json` for status >= 400, page errors, unexpected redirects and permission leaks
   before planning deep capture. Fix nothing; record findings.
2. Deep capture per area, one subagent per area, in parallel.
3. The orchestrator reviews each area's folder and doc, re-dispatches gaps, aggregates findings,
   then packages.
4. If the harness changes mid-run (a capture bug is found and fixed), tell every agent and re-run
   capture for every area that finished before the fix. In the Relay run two areas were redone after
   the inner-scroll fix.

## Area agent brief (paste into each subagent, filled in)

```
Area: <area>   Routes: <list with personas>   Pack: <pack dir>   Origin: <origin>
App source (read-only): <appRoot>   Config: <pack>/pack.config.json

Goal: screenshots of every page, substate and user flow in this area, and a written spec per page,
for a redesign in an AI design tool.

Environment: already running. Do not restart, rebuild or modify it. You may create data through the
app's UI or APIs as a persona, or through the app's seed helpers, in the throwaway database only.
Prefix ids you create with a short area prefix (kn-, adm-, work-). Do destructive flows (delete,
cancel, reset) only on users and rows you created with that prefix; on shared personas, intercept
writes with page.route. Use ### headings only for routes in your doc. Never touch production, shared services or other areas' data.
Never kill processes you did not start.

Harness: copy scripts/capture-area.template.mjs to <pack>/harness/<area>.mjs. Shots go to
shots/<area>/<route-slug>__<nn>-<state>__<desktop|mobile>.png. Reuse baseline shots for plain
default views unless you seeded data that changes them.

Capture, for each route: default populated state (desktop, plus mobile for primary pages); empty,
loading and error (force with request interception); permission denied and logged out; every tab,
filter mode and view toggle that changes layout; every modal, drawer, popover, menu and confirm
dialog; forms blank, invalid, filled, submitting, success; multi-step flows one shot per step in order.
Resolve dynamic routes with real ids from seeded data.

Write docs/<area>.md in the shape of references/page-spec-template.md. If a state cannot be reached,
say so and why. Do not fake it.

Return: route count, screenshot count, coverage gaps (including pages cut at the height cap),
broken pages, and a findings list split into product bugs and local-environment-only effects.
```

## What to capture and how

| State | How to reach it |
|---|---|
| Populated | Seeded fixtures; the default for every page |
| Empty | A persona or workspace with no records, or `forceBody()` returning an empty list |
| Loading | `holdRequests()` on the page's data requests, shoot the viewport after ~800 ms, then release |
| Error | `forceStatus(page, pattern, 500)` on the page's data requests; also 404 for a bad dynamic id |
| Permission denied | A persona without the role; record whether it is a message, a redirect or a silent empty page |
| Identity in the URL | Open the page with another user's identifier in the query string or path (`?email=`, `?user=`, `/users/<id>`). Pages that trust an identifier in the URL are serious findings |
| Logged out | anon persona on a protected route; record the redirect target and whether it returns after sign-in |
| Validation | Submit the blank form, then an invalid value per field type |
| Submitting / success | Slow the submit request with `holdRequests()`, then release it and capture the success view |
| Overlay | Open it, then capture the viewport (`fullPage: false`) so the overlay is in frame |
| Mobile | Every primary page, the navigation drawer open, and any table or wide layout (show the overflow) |

| Stubbed | `rewriteJson(page, pattern, (body) => ({ ...body, status: 'ready' }))` for states the isolated build cannot reach (readiness without an AI key, confirm-cost, paywall, a third-party result). Name the shot `...-stubbed` and say what was rewritten |
| Native browser UI | `<select>` menus, `window.confirm`/`prompt` and HTML validation bubbles are drawn outside the page and never appear in screenshots. Record their exact text in the spec (`page.on('dialog')` gives dialog text), or inject a labelled overlay and say so |

Find the request patterns in the page's source or in the browser's network log. Use the narrowest
pattern that hits only that page's data, or the error lands on shared chrome instead.

## Traps that look like success

- **Leaking to production.** A page load without egress blocking fires the app's real analytics and
  ad pixels. Always launch with `launch(config)` and capture through the kit's `newPage()`, and check
  `baseline.json` `blockedHosts`: every tracker the app loads should be listed there. Request
  interception alone is not enough: redirects to a third party, WebSockets and service workers
  bypass it, which is why the kit also blocks at the browser's resolver (hostnames and IP literals
  alike). Requests Node sends itself are outside the browser, so the resolver cannot see them:
  `rewriteJson()` calls `route.fetch({ maxRedirects: 0 })` and hands any redirect back to the
  browser, where the resolver stops it. Never call `route.fetch()` without `maxRedirects: 0`.
- **Signed out mid-run.** Session checks rate-limited by a shared IP make signed-in pages render signed
  out. Set `signedOutSelector`, run fewer agents at once if 429s persist, and re-capture every shot in
  `logs/signed-out.json`. The template's `go()` retries a rate-limited load after a back-off.

- **Swallowed errors.** Many pages catch a 403 or 500 and render the normal empty state. Always
  capture forced error and forced empty separately; if they look identical, that is a finding.
- **Status codes lie.** Streaming and catch-all routes return 200 with a not-found body. Trust the
  rendered page: `baseline.json` records `bodyNotFound`, and `looksNotFound(page)` checks a page.
- **Hidden by a flag.** A route that 404s locally may be flag-gated, not dead. Check the flag list
  before calling it broken or orphaned.

## Stability rules

- `reducedMotion: 'no-preference'`. Under `reduce` many apps never run the fade-in that makes content
  visible, so full-page shots come out blank. The kit's `newPage()` sets this; do not override it.
  If content stays invisible under `reduce`, that is also an accessibility bug: record it in findings.
- Inner scroll areas. App shells usually pin the header and sidebar and scroll `<main>` (or a pane)
  instead of the document. Playwright's `fullPage` measures only the document, so those shots stop
  at the viewport height (900 px on desktop) and cut the page off with no error. The kit's `shot()`
  marks every overflowing scroll area at least half the viewport tall, grows the viewport by the
  hidden height (up to `maxShotHeight`, default 7000 px; taller pages are cut and logged), shoots and restores the viewport. If the
  app scrolls somewhere detection misses, set `scrollRootSelector` in the pack config. Always capture
  through `shot()`, and check a few long pages for their last row or footer before trusting a run.
- Call `reveal()` before full-page shots so lazy and in-view sections render.
- `animations: 'disabled'` on screenshots freezes CSS animations at their end state.
- Wait for network idle plus a short settle, not a fixed long sleep. Polling pages never go idle;
  the kit caps the wait at 15 s.
- Fresh browser context per job. State from one shot (an open menu, a dismissed banner, a toast)
  must not leak into the next.
- Freeze time-dependent content where it matters (relative dates, countdowns) with Playwright's
  clock API, or say in the doc that the values are capture-time.
- Hide or note cookie banners, dev overlays and support widgets that are not part of the design.

## Naming

`<route-slug>__<nn>-<state>__<viewport>.png`, for example
`settings_billing__03-cancel-confirm__desktop.png`. The slug is the route with `/` and brackets as
`_` (`/runs/[runId]` is `runs_runId`). `nn` counts up per route in the order a user meets the
states, so a sorted folder reads as a flow. Shared chrome goes under a `chrome_<name>` slug.

## Review before packaging

- Open every area folder as a contact sheet and look. Blank shots, login pages where a signed-in
  page belongs, pages cut off at exactly the viewport height, and the same shot under different
  names are the common failures.
- Every shot is cited by a doc and every doc citation exists (`build-pack.mjs` checks both).
- Every route in the area has a section, and every section has all fields.
