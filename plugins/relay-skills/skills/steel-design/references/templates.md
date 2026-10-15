# Reference compositions

15 worked app-surface compositions. Pull one up as a starting point: an archetype, an information
hierarchy, a band budget, and the pattern set that already hangs together.

Pull one up by naming it ("Reference7") or by describing the surface ("the triage inbox one", "a
deployments list"). A number resolves directly; a description resolves against each row's opening
line and archetype.

## The contract — reference, don't clone

A referenced composition is a **wireframe + pattern set, not a source file**.

- **Take:** the archetype, the band budget, the information hierarchy, the pattern set, the
  keyboard model.
- **Take loosely:** the column list, as a starting set to trim against the real data.
- **Off-limits:** copy, brand, specific column names, and any 1:1 layout. The surface has its own
  subject and its own data shape.

The foundations always apply underneath: the chrome budget, the app type scale, the closed gap set,
the control tiers, the one motion config, and the full state set. See `SKILL.md`.

## Grounding — read this before quoting any row

Each row carries a tag, because the honesty matters more than the completeness:

- **[documented]** — the pattern is described in a public primary source, cited on the row.
- **[public surface]** — observable on publicly reachable pages of that product (docs, product
  pages, design-system site), but not specified in a design doc.
- **[composite]** — an archetype assembled from the rules in this skill and from patterns common
  across several of the products named. **Not** a claim about any one product's private UI.

Products' authenticated application UIs were **not** inspected for this document. Where a row names
a product, it names the product whose public material or widely-described approach the pattern
follows — it is not a screenshot transcription.

---

## Lists and queues

**`Reference1`** — the keyboard-first issue list. Dense, quiet chrome, everything reachable without
the mouse. **[public surface / documented]**
Archetype: list + inspector. Bands: **2** (toolbar 40 · chips 36, conditional) + header 36.
Hierarchy: the row's title dominates; status, assignee and date are muted satellites; navigation is
dimmed so the content area wins — Linear's stated principle, *"don't compete for attention you
haven't earned"*, and structure *"felt not seen"* ([Linear](https://linear.app/now/behind-the-latest-design-refresh)).
Patterns: 32px dense rows · chip filters with label+value · `⌘K` palette replacing navigation ·
`j`/`k` row movement · inspector on select, not a modal · optimistic status changes.
Signature: no page description, no stats band, no breadcrumb. The toolbar is the only chrome.

**`Reference2`** — the deployments list. Status-led, time-dominant, one truncating column. **[documented]**
Archetype: list → route detail. Bands: **1** (toolbar 40) + header 36.
Hierarchy: status badge first, then the commit message (the one truncating column), then relative
time. Columns: Status · Source (truncates) · Environment · Duration (num) · Created (relative <7d,
absolute after).
Patterns: sortable header buttons · en dash for missing values · `tabular-nums` on duration ·
skeleton rows past 1s · `21–40 of 142` pagination copy. All five are Geist's stated rules
([Geist Table](https://vercel.com/geist/table)).
Signature: the whole surface answers one question — "did it ship?" — so status is column 1.

**`Reference3`** — the triage inbox. Three panes, keyboard-driven, one record at a time. **[composite]**
Archetype: split view (list + inspector), nav rail collapsed to icons.
Bands: **1** toolbar spanning both panes.
Hierarchy: the conversation list is scannable at 56px two-line rows (who · last message · time);
the inspector carries the thread plus a reply composer pinned to its bottom.
Patterns: unread as weight, not colour · inspector `prev`/`next` on `j`/`k` so the queue is worked
without returning to the list · assignment via the palette while a row is selected · optimistic
send with a visible failure toast.
Signature: the list never scrolls out from under the user — selection moves, the viewport follows.
Common to Intercom-style inbox products; the pane widths and keys here are this skill's.

**`Reference4`** — the outbound contact list. Bulk-action-first: the point of the surface is doing
something to 500 rows. **[composite]**
Archetype: list. Bands: **2** (toolbar 40 · chips 36).
Hierarchy: checkbox, name, company, then engagement counts (all right-aligned, tabular), then last
touch. Zero values muted so the engaged rows stand out of the column.
Patterns: shift-click range selection · header tri-state checkbox · **"Select all 12,480 matching"**
as an explicit second step after select-all-page · floating bulk bar with ≤3 verbs + overflow ·
undo toast on every bulk mutation · saved views as count-tabs.
Signature: selection is the primary interaction, so nothing may shift the rows once a selection
exists (`anti-patterns.md` § 9).

**`Reference5`** — the payments / transactions table. Money, so alignment and figures are the whole
design. **[composite / documented on alignment]**
Archetype: list + inspector. Bands: **2**.
Hierarchy: amount is the most-read column and is right-aligned with tabular lining figures; the
customer is the one truncating column; status is a badge with a 3:1 dot.
Columns: Amount (num) · Status · Customer (truncates) · Method · Created.
Patterns: nominal numbers (last-4, invoice no.) **left**-aligned even though they are digits ·
en dash for null · date-range filter as a chip · export as a secondary icon action ·
non-modal inspector so two transactions can be compared. Alignment rules per
[Spectrum](https://spectrum.adobe.com/page/table/).
Signature: no zebra — selection tints the row, and three competing row backgrounds would make a
bulk refund unsafe (`data-tables.md` § 4).

**`Reference6`** — the audit log / event stream. Append-only, time-first, filter-heavy. **[composite]**
Archetype: list, virtualised. Bands: **2**.
Hierarchy: timestamp (absolute, monospace, tabular) · actor · action · target. Time is column 1
because every question asked of this surface starts with "when".
Patterns: virtualised rows with a URL-addressable cursor (never infinite scroll — this is a
goal-directed finding surface, [NN/g](https://www.nngroup.com/articles/infinite-scrolling-tips/)) ·
expandable rows for the payload · monospace for identifiers · live-tail toggle that pauses on scroll.
Signature: two-column expansion instead of an inspector, because the payload is machine data and
wants full width.

**`Reference7`** — the observability log view. Dense, monospace, one line per event. **[composite]**
Archetype: list, 32px dense rows, no selection.
Hierarchy: severity as a 3px left border + word; then time; then the message, full width, no
truncation (wrap on demand instead).
Patterns: no checkbox column (nothing here is acted on in bulk) · severity filter as chips ·
`/` to filter, `⌘K` to jump between services · skeleton only on the first load, inline refresh
after · reduced-motion respected on the live-tail scroll.
Signature: the only surface in this catalogue where a monospace face is the *body* face.

---

## Detail, dashboard and settings

**`Reference8`** — the record detail workspace. A full route, tabs, its own toolbar. **[composite]**
Archetype: master–detail (route). Bands: **2** (record toolbar 48 · tab bar 36).
Hierarchy: record name + status in the toolbar with prev/next and the primary verb; tabs for
Overview / Activity / Settings; a 320px metadata rail that is *read-mostly*.
Patterns: list state preserved in the URL so back returns to the filtered, sorted, scrolled list ·
`FieldGroup` label/value pairs in the rail · destructive action isolated at the bottom of Settings ·
save-on-blur with an inline "Saved" status.
Signature: the back-link is the only breadcrumb. One level, not four.

**`Reference9`** — the overview dashboard that leads into work. **[composite]**
Archetype: dashboard → list. Bands: **1** (toolbar 40 with a date-range chip).
Hierarchy: 3 headline tiles (the numbers someone is accountable for) → 1 full-width trend →
**a "needs attention" table**, which is the route out of the dashboard into the work.
Patterns: every tile navigates to the filtered list behind it · no counting-up animation · partial
state per tile, so one failed query does not error the page · `role="status"` on each tile's value.
Signature: the table at the bottom is mandatory. Without it this is a report, and a report should
be a scheduled export (`layouts.md` § 4).

**`Reference10`** — team members and roles. The settings surface everyone gets wrong. **[composite]**
Archetype: list inside settings. Bands: **1** (toolbar 40 with Invite as the primary).
Hierarchy: member (avatar + name + email, two-line 56px rows) · role (inline select, 32px) ·
last active · row actions on hover+focus.
Patterns: role change is optimistic with a visible failure path · removal is **undo**, not confirm —
it is reversible, so a dialog would be the tax without the benefit · "Remove owner" *is* confirmed,
because it affects other people before the actor could undo · pending invites as a separate
count-tab, not a separate page.
Signature: two different destructive treatments on one surface, chosen by `needsConfirm()`
(`flows.md` § 5).

**`Reference11`** — project settings, single column. **[composite]**
Archetype: settings. Bands: **1** + a 200px section rail.
Hierarchy: 640px measure, one concept per section, 24px between sections, help text as
`prose-ui` at ≤68ch.
Patterns: progressive disclosure for advanced blocks, with a summary at rest and auto-expand on
validation error · one sticky 48px save bar that appears only when dirty · the danger zone in its
own section at the bottom, with type-to-confirm on the resource-level action only.
Signature: never two columns, never tabs inside tabs.

**`Reference12`** — billing and usage. Numbers that must be trusted. **[composite]**
Archetype: dashboard + table. Bands: **1**.
Hierarchy: current-period total (the one `text-display` in the app) · a usage bar against the limit ·
a per-line-item table where every number is right-aligned tabular and the totals row is `font-medium`.
Patterns: en dash for not-yet-metered lines · absolute dates only (no relative time — nobody wants
"3d ago" on an invoice) · export as the primary action · no optimistic UI anywhere on this surface,
because the user will act on the number before the server confirms (`motion.md` § 5).
Signature: the only surface where relative time is banned outright.

---

## Flows and overlays

**`Reference13`** — the import / connect wizard. **[documented on the wizard test]**
Archetype: multi-step flow, 4 steps + review. Bands: progress list only.
Hierarchy: one question per step, ≤7 fields, heading takes focus on step change.
Steps (named by outcome): Choose a source → Map the fields → Set the schedule → Review and import.
Patterns: forward locked until the step validates, back always free and lossless · save-and-resume ·
the review step restates the user's own values and the row count · the final button is named
("Import 1,204 rows"), never "Finish". Wizard criteria and sequencing per
[NN/g](https://www.nngroup.com/articles/wizards/).
Signature: step 2 exists *because* step 1's answer decides what it asks — that order dependency is
the whole justification for the wizard.

**`Reference14`** — the command-palette-first surface. Navigation is search. **[public surface]**
Archetype: command palette + whatever list it lands on.
Hierarchy: selection-scoped verbs first while rows are selected; then Go-to; then Recent; then
Actions. Each row: icon · label · muted detail · shortcut in the right rail.
Patterns: APG combobox — input keeps focus, options pointed at with `aria-activedescendant` ·
prefix matches ranked above mid-string ("del" surfaces Delete above Undelete) · ≤50 results, no
pagination · every shortcut mirrored in its control's tooltip and in the `?` sheet.
Signature: the palette is a *second* route to everything, which is why it is only worth building
past ~30 destinations (`layouts.md` § 7).

**`Reference15`** — the first-run surface. Everything empty, on purpose. **[documented]**
Archetype: list, in its `first-run` state.
Hierarchy: the toolbar renders normally (so the user learns where things will be); the table and
its **column headers are replaced entirely** by the empty state — Carbon's rule, so a screen reader
is not walked through an empty table before hearing that it is empty
([Carbon](https://carbondesignsystem.com/patterns/empty-states-pattern/)).
Patterns: left-aligned block · positive title ("Start by connecting a source") · **one** primary
action · a docs link as a link, not a second button · where several regions are empty at once, drop
to tertiary buttons and text-only states.
Signature: this is where the page description you removed from the toolbar goes. It is read by
exactly the people who need it, and it disappears for everyone else (`anti-patterns.md` § 4).

---

## Picking one

| the surface is… | start from |
|---|---|
| a list someone works through, one record at a time | `Reference1`, `Reference3` |
| a list where the point is acting on many rows | `Reference4` |
| a list where the point is comparing numbers | `Reference5`, `Reference12` |
| a list of events, append-only | `Reference6`, `Reference7` |
| a record with its own workspace | `Reference8` |
| "notice, then act" | `Reference9` |
| configuration | `Reference10`, `Reference11` |
| setup with real order dependency | `Reference13` |
| navigation that outgrew a sidebar | `Reference14` |
| the state you forgot to design | `Reference15` |

## Sources and grounding

Rows tagged **[documented]** cite their source inline — principally
[Linear](https://linear.app/now/behind-the-latest-design-refresh),
[Vercel Geist](https://vercel.com/geist/table),
[Adobe Spectrum](https://spectrum.adobe.com/page/table/),
[IBM Carbon](https://carbondesignsystem.com/patterns/empty-states-pattern/) and
[NN/g](https://www.nngroup.com/articles/infinite-scrolling-tips/).

**Extrapolated:** every row's band budget, pane width, row-height tier and column list is this
skill's judgement applied to a recognisable surface shape — not a transcription of any product's
UI. Rows tagged **[composite]** are archetypes assembled from the rules in this skill; they are not
claims about a specific product's private interface. No authenticated application UI was inspected.
