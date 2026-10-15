# Layout archetypes for app surfaces

Eight archetypes. Nearly every enterprise surface is one of these or two of them composed.
For each: **when to reach for it**, the **skeleton**, and the **failure mode** — the way it goes
wrong when it was the wrong choice.

The first decision is almost always this one:

```
how many attributes does the user compare across items?
  ≤3  and each item is a "thing you look at"     → card grid
  >3  or any attribute is sortable/comparable    → TABLE
  1   and it is a status you scan                → list with a status column (still a table)
```
Cards lose to tables the moment a user wants "sorted by last activity" — free-flowing metadata
cannot be scanned down a column (`anti-patterns.md` § 5).

---

## 1. List / table

**When.** The default. A homogeneous collection the user filters, sorts, scans and acts on.
Polaris draws the useful line between two kinds of table: an *index table* displays a collection
of objects to act on or navigate into; a *data table* displays a whole data set to compare and
analyse ([Polaris](https://polaris-react.shopify.com/components/tables/index-table)). Most
enterprise surfaces are the first kind and get built as the second.

**Skeleton**
```
[ nav 48 ]
[ toolbar 40 ── title · count · view-tabs · search · primary ]   ← band 1
[ chips 36 ── active filters · clear all · sort ]  (conditional)  ← band 2
[ thead 36 sticky ]
[ row 40 ] × n                                    data-first-row
[ footer 44 ── 21–40 of 142 · ‹ › ]
[ bulk bar — floats bottom, only while selected ]
```
Assets: `Toolbar` · `FilterChipBar` · `DataTable` · `BulkActionBar` · `EmptyState` · `SkeletonRows`.

**Failure mode.** The toolbar accretes bands (see the chrome budget) and the table is given the
narrow half of a split layout. Carbon's placement rule: give the table the *most* width on the
page and avoid nesting it in a smaller container where it has to truncate
([Carbon](https://carbondesignsystem.com/components/data-table/usage/)).

---

## 2. Master–detail (route-based)

**When.** The detail view is a workspace — it has its own tabs, its own actions, more than a
viewport of content — and the user goes deep on one record at a time. An issue, a deal, a
customer, a deployment.

**Skeleton**
```
[ sidebar 240 ]  [ main: the record, full width, own toolbar ]
                 ▸ the list becomes a back-link + prev/next, not a visible list
```
Route shape: `/orders` (list) → `/orders/[id]` (detail). Keep list state (filters, sort, page,
scroll) in the URL so the back-link returns the user exactly where they were.

**Failure mode.** Losing list state on return. The user filters to 12 rows, opens row 4, comes
back to an unfiltered list at the top, and has to redo the query. This is the single most common
master–detail defect and it is a URL-state bug, not a design one.

---

## 3. Split view (list + inspector)

**When.** Triage. The user works *through* a list, spends 5–30 seconds per record, and needs the
list as context the whole time. Inbox, alert queue, review queue, search results.

**Skeleton**
```
[ toolbar 40 spanning both panes ]
[ list 320–420 ][ inspector 360–560, non-modal, prev/next on j/k ]
```
Asset: `assets/DetailPanel.tsx`. Width rule: ≥360px (below it, label/value pairs wrap into orphans),
480px default, never more than 40% of the viewport.

**Why non-modal, not a dialog.** NN/g's table guidance is explicit: open a single record in a
non-modal side panel or separate window, because a modal obscures the data the user is comparing
against ([NN/g](https://www.nngroup.com/articles/data-tables/)).

**Failure mode.** The inspector grows until the list is 280px of truncated names. At that point
the list has stopped being scannable and you have a bad master–detail; promote it to archetype 2.

---

## 4. Dashboard

**When.** The user's job on this surface is to **notice**, not to do. Answer for each tile:
"what decision changes if this number moves?" If there is no answer, the tile is decoration.

**Skeleton**
```
[ toolbar 40 ── title · date range · refresh ]
[ 2–4 headline tiles ]                    ← the numbers someone is accountable for
[ 1–2 charts, full width or halves ]      ← the trend behind the headline
[ one table: "needs attention" ]          ← the way OUT of the dashboard into work
```
Every dashboard needs that last row. A dashboard with no route into the work it describes is a
report, and a report should be a scheduled export.

**Failure mode.** Big numbers that are really filters — "87 Open / 12 Overdue" as a stats band
that the user instinctively clicks and nothing happens. Those belong in the toolbar as count-tabs
(`anti-patterns.md` § 2).

---

## 5. Settings

**When.** Configuration the user visits rarely and reads carefully.

**Skeleton**
```
[ toolbar 40 ── "Settings" · section nav as tabs or a 200px rail ]
[ single column, max-width 640px ]
   ── section (24px gap between sections) ──
   label            control
   help text        (prose-ui, ≤68ch)
[ sticky save bar 48, appears only when dirty ]
```
- **Single column, 640px.** Two-column settings forms make users guess which label belongs to
  which control, and the guess is wrong about half the time on wide screens.
- **Save model — pick one per surface**: save-on-blur with an inline "Saved" status, *or* one
  sticky save bar that appears when the form is dirty. Never both, and never a Save button per
  field.
- **No tabs inside tabs.** If a settings area needs two levels, the second level is routes.

**Failure mode.** Dangerous settings adjacent to benign ones. Keep "Delete workspace" in its own
section at the bottom, visually separated — NN/g's point about consequential options sitting
close to benign ones is a real source of accidental destruction.

---

## 6. Multi-step wizard

**When.** Both must hold ([NN/g](https://www.nngroup.com/articles/wizards/)):
1. the steps have a genuine **order dependency** — the system needs step 2's answer to know what
   step 3 should ask; and
2. the user is a **novice at this task or does it rarely** — setup, migration, onboarding.

If neither holds, one long form with labelled sections is better: an expert doing this weekly
wants to see the whole shape and tab through it.

**Skeleton**
```
[ progress: named outcomes, current marked aria-current="step" ]
[ heading (focus target on step change) + one-line hint ]
[ the step's fields — ≤7 ]
[ Cancel ]                              [ Back ] [ Continue / <named submit> ]
```
Asset: `MultiStepFlow`. Rules it encodes: ≤5 steps; steps named by outcome, never "Step 2";
forward locked until the step validates but back always free and lossless; save-and-resume; a
review step whenever the submit is irreversible or costly; focus moves to the new step's heading.

**Failure mode.** A wizard used for a task experts repeat — it turns a 20-second form into five
page loads, and the experts start automating around it. The tell is a support request asking for
a CSV import of the thing the wizard creates.

---

## 7. Command palette

**When it earns its place.**
```
destinations > ~30, or they are user-created objects (projects, docs, customers)
   that a sidebar cannot enumerate                          → palette replaces navigation
the useful verbs act on the current selection               → palette, selection-scoped first
a fixed nav of 6 sections                                   → it does not. Skip it.
```
A palette over a small fixed nav is a second way to do what the sidebar already does, and it
will rot: new features get added to the nav and not to the palette.

**Skeleton.** `⌘K` → dialog → input keeps focus → grouped listbox → each row shows its own
shortcut in the right rail. Asset: `assets/CommandPalette.tsx`.

**The accessibility shape.** ARIA APG combobox: `role="combobox"` on the input, `aria-expanded`,
`aria-controls`, and `aria-activedescendant` pointing at the active option. **Focus never leaves
the input** — options are pointed at, not focused. Moving DOM focus into the list breaks typing,
which is the only input method this control has.

**Failure mode.** Undiscoverable. A palette nobody knows about is a feature for its author. Fix:
every shortcut appears in the tooltip of the control that duplicates it, plus a `?` sheet, plus
the palette row's right rail — three places, so it is learned incidentally
(`accessibility.md` § Shortcuts).

---

## 8. Inspector panel

**When.** Metadata and quick edits on a selected object, alongside a canvas or board — not a
list. Notion's page properties, a design tool's right rail, a board card's detail.

**Skeleton**
```
[ canvas / board ]  [ inspector 320–400 ]
                      ▸ FieldGroup: label 120px | value 1fr
                      ▸ collapsed groups for rarely-touched fields
```
Assets: `assets/DetailPanel.tsx` (`Field`, `FieldGroup`), `assets/MultiStepFlow.tsx` (`Disclosure`).

**The rule that makes an inspector work:** it belongs to the **current selection**, and shows the
empty-selection state when nothing is selected. A rail occupied by a permanently open form —
"create new", "add filter" — is competing with the content beside it for the same attention, and
it wins, wrongly, because it is full of inputs. Make it a button; give the rail to the selected
item (`anti-patterns.md` § 3).

**Failure mode.** Progressive disclosure that hides required fields. If a collapsed group can
hold a validation error it must open itself and take focus, or the user is told the form is
invalid and cannot see where. `Disclosure` does this.

---

## Composing them

| composition | use |
|---|---|
| list + inspector | triage queues (archetype 1 + 3) |
| list → route detail | records with their own workspace (1 + 2) |
| dashboard → list | "notice, then act" (4 + 1) |
| wizard → list | first-run setup that ends at the surface it populated (6 + 1) |
| any + palette | once destinations exceed a sidebar (any + 7) |

Two rules for composing:
- **One primary action per surface.** If both panes have a primary button, neither is primary.
- **One scroll container per pane, and declare which.** Two nested scroll containers is the bug
  where the user's wheel scrolls the wrong thing; it always traces back to a pane that was
  never given `min-h-0 overflow-y-auto` explicitly.

## Sources

- [Shopify Polaris — index table vs data table](https://polaris-react.shopify.com/components/tables/index-table)
- [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/) (non-modal side panel for a single record)
- [NN/g — Wizards](https://www.nngroup.com/articles/wizards/) (when, sequencing, save-and-resume)
- [IBM Carbon — data table usage](https://carbondesignsystem.com/components/data-table/usage/) (placement, width)
- [ARIA APG — combobox / grid patterns](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

**Extrapolated:** the >30-destinations palette threshold, the panel width bands, and the ≤3/>3
card-vs-table rule are judgement calls consistent with the sources, not quoted from them.
