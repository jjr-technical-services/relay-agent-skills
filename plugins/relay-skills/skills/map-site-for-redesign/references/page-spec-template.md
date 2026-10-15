# Page spec template

Each area doc (`docs/<area>.md`) has three parts. `build-pack.mjs` checks the field labels, so keep
them exactly as written.

## 1. Area overview

- Who uses this area and why, in two or three sentences.
- How the pages connect: entry points, the main path through, exits to other areas.
- The main end-to-end flows as numbered steps, each step citing its screenshot:

```
Flow: invite a teammate
1. Owner opens Settings > Team (settings_team__01-default__desktop.png)
2. Clicks Invite, enters an email and role (settings_team__02-invite-dialog__desktop.png)
3. Submits; the pending invite appears in the list (settings_team__04-invite-pending__desktop.png)
```

## 2. One section per route

Use `###` headings only for route sections, always with the route in backticks. The strict build
treats every such heading as a page spec. Put flows, notes and bug lists under `##` or `####`.

```
### <Page name> — `<route>`
- **Status:** live / redirect → <target> / legacy-orphan (not linked from nav) / admin-only / broken (<reason>)
- **Audience & access:** who sees it (anon / new / member / owner / superadmin) and what happens to everyone else
- **Nav entry:** where it is reached from (sidebar group > item, avatar menu, CTA on page X, email link, deep link only)
- **Purpose:** one or two sentences on the job the user is doing here
- **Layout & content:** regions top to bottom and the data in each (fields, columns, cards, metrics, counts)
- **Actions:** every button, link and control, and what it does or where it goes
- **Substates:**
  - Populated — <file>.png
  - Empty — <file>.png
  - Error (forced 500) — <file>.png
  - Member denied — <file>.png
- **Flows:** entry → steps → exit, with screenshot references
- **Design notes:** friction, inconsistency, dead ends, clutter, broken rules; factual and brief
```

Writing rules:

- Describe what is on screen, not what the code intends. If they differ, say both and put the
  difference in findings.
- Name controls by their visible label, in quotes: "New agent", "Save changes".
- Label every stubbed substate: "Ready to run (stubbed: readiness response rewritten, no AI key
  locally) — agents_id__04-ready-stubbed__desktop.png". A designer must never mistake a rewritten
  state for real behaviour.
- Write out what screenshots cannot show: native select options, confirm and prompt dialog text,
  browser validation messages.
- Give numbers where they matter to layout: column count, card count per row, items per page,
  character limits, how many primary buttons are visible.
- Design notes are observations a designer can act on: "two primary buttons in the header",
  "empty state has no call to action", "table overflows at 390 px with no horizontal scroll cue".
  No redesign proposals here; the design tool does that.
- Status is evidence-based: `legacy-orphan` needs the reachability class from `find-orphans.mjs`
  and a checked explanation; `broken` needs the error or status and a screenshot.

## 3. Coverage gaps

A final `## Coverage gaps` list: every state that exists in source but was not captured, and why
(needs a live payment provider, needs a second workspace, flag off in this build), plus every page
cut at the height cap (`logs/truncated.json`). An empty list must say "None".

## Cross-area docs

- `docs/flows.md`: journeys that cross areas (sign-up to first value, invite to first contribution,
  upgrade, recovery from an error), same numbered-step format.
- `docs/findings.md`: every area's findings in one file, one row per finding: id, severity
  (blocker, major, minor, polish), route, persona, viewport, what happens, evidence screenshot, and
  the class (bug, dead link, orphan, legacy, redirect, permission, inconsistency, missing state).
  Sections: `## Broken or misleading`, `## Structure and navigation`, and
  `## Local environment only, not product bugs` for flags that could not be enabled, missing keys
  and stubbed services.
- `docs/00-master-brief.md`: see `design-tool-packaging.md`.
