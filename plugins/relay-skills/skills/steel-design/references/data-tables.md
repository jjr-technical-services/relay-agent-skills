# Data tables

The surface that carries most enterprise value and gets the least design attention. Every rule
here has a *why* and a failure mode, because a table rule without a reason gets overridden by the
first PM who wants one more column.

Runtime: `assets/DataTable.tsx`.

---

## 1. Column order and alignment

**Order.**
```
1. identifier (human-readable)   2. the attributes people filter/sort by
3. status                        4. dates            5. actions (last, fixed width)
```
The first column is the row's name, and it must be **human-readable, not an auto-generated ID** —
NN/g calls the alternative "mystery meat" and it defeats scanning, because the user has to read
column 2 to find out what row they are on. Default column order should otherwise reflect
importance, with related columns adjacent ([NN/g](https://www.nngroup.com/articles/data-tables/)).

**Alignment — Spectrum states this most precisely** ([Spectrum](https://spectrum.adobe.com/page/table/)):

| content | alignment | why |
|---|---|---|
| text | **left, always. never centred** | ragged-right edges give the eye a start position |
| numbers you compare or sum | **right + tabular figures** | the ones digit lines up, so magnitude is readable as width |
| *nominal* numbers — zip, IP, phone, order number | **left** | they are identifiers, not quantities; you never sum them |
| headers | follow the alignment of their data | a right-aligned column under a left-aligned header reads as two columns |
| everything, vertically | centred in the row | "the right visual balance"; a top-aligned 40px row looks broken |

Put this in `meta` on the column def: `{ align: "num" | "nominal" | "text" }`.

**Failure mode of centring text:** with no consistent left edge the eye has to re-acquire the
start of every cell, so scanning a 20-row column takes roughly twice as long. It is the single
most damaging alignment mistake and it usually arrives via a "looks tidier" review comment.

---

## 2. Row height and density

| tier | height | when |
|---|---|---|
| dense | 32px | power surface, single line, no in-row control taller than 28px |
| **default** | **40px** | 13px/18px text + 11px padding; a 28px action clears by 6px |
| comfortable | 48px | avatar, or a badge plus a long name |
| two-line | 56px | primary line + meta line |

Carbon ships five: 24 / 32 / 40 / 48 / 64px, with the column-header row **always matching the
body row size**, and only recommends the 64px tier when data is expected to wrap to two lines
([Carbon](https://carbondesignsystem.com/components/data-table/style/)).

**Two rules that follow:**
- **Header matches body.** A 48px header over 32px rows reads as a second toolbar.
- **24px rows carry no in-row controls.** At 24px there is no room for a 24px target with padding,
  so a 24px row may have a whole-row click target and nothing else (see `foundations.md` § 4).

---

## 3. Sticky headers

```css
thead th { position: sticky; top: <sum of the bands above the table>; z-index: 10; }
```
The `top` value is the sum of the declared band heights — this is one of the payoffs of declaring
them. `DataTable` takes it as `stickyHeaderTop`.

**And the accessibility half nobody implements:** a sticky header will hide a focused row as the
user tabs down the table. WCAG 2.2 **SC 2.4.11 Focus Not Obscured (Minimum), Level AA** requires
that a focused component not be *entirely* hidden by author content, and sticky headers/footers
are the named failure ([WCAG](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)).
Fix in one line:

```css
tr { scroll-margin-top: calc(var(--band-nav) + var(--band-toolbar) + var(--band-thead)); }
```
`foundation.css` ships this as `.scroll-clear-header`.

---

## 4. Row hover, zebra, and selection — three backgrounds competing

**Row hover is always on**, even when the row is not interactive: Carbon's rule is that hover
helps the user scan across a row regardless. Cheapest legibility win in the table.

**Zebra striping — the sources genuinely disagree:**

| source | position |
|---|---|
| [NN/g](https://www.nngroup.com/articles/data-tables/) | use alternating row colours to help horizontal scanning |
| [Spectrum](https://spectrum.adobe.com/page/table/) | **"Don't use zebra stripes"** — row dividers already do that job |
| [Carbon](https://carbondesignsystem.com/components/data-table/usage/) | optional modifier |

**Decision rule** (`zebraIsWorthIt()` in the asset):
```
selection tints the row background  → NO zebra. Always. This is the real constraint.
>6 columns, or no row dividers      → zebra earns its keep
≤6 columns with 1px dividers + hover→ skip it
```
**Why selection wins the argument:** with zebra, hover *and* selected all painting the row
background at similar lightness, a user cannot tell a selected row from an odd row from a hovered
row. That is not an aesthetic complaint — it makes bulk actions unsafe, because the user cannot
verify what they are about to act on.

---

## 5. Row actions

**Reserve the column; reveal with opacity.**
```tsx
<td className="w-[76px]">
  <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                  [@media(pointer:coarse)]:opacity-100">
```
Three things, each fixing a specific bug:
- **Fixed-width column** — the space is always occupied, so revealing actions never reflows the
  row. Without it, the row's other columns shift on hover and the user's aim breaks.
- **`group-focus-within`** — `group-hover` alone means the actions do not exist for a keyboard
  user. This is an accessibility defect, not a polish item.
- **`pointer: coarse` → always visible** — a touch device has no hover. Carbon does the same
  thing: it detects whether the user agent supports hover and keeps row menus persistent if not.

**How many actions inline vs in a menu.** Carbon's rule: **fewer than three → keep them inline as
icon buttons** (saves a click, and the available actions are visible at a glance); three or more →
one overflow menu. Carbon also notes that persistent overflow menus signal "rows are actionable",
while hover-only reduces clutter — both are supported, so choose by whether users know the rows
are actionable yet.

---

## 6. Truncation

```
exactly ONE column truncates: the name.
numbers, dates, status: never. Resize or drop the column instead.
```
In a table cell, `truncate` needs `min-w-0 max-w-0` to work at all — without it the cell grows and
the table overflows instead of ellipsing.

**Why only one.** With ellipsis on three columns, every row ends in "…" three times and the user
cannot tell which rows differ. The information a truncated number conveys is *zero* — "1,2…" is
worse than an empty cell because it looks like data.

**Column headers** are the exception that has its own rule: Carbon wraps a long header to two
lines, then truncates, with the full text in a hover tooltip. One or two words is the target.

**Missing values.** One glyph, everywhere: an **en dash (–)**. Spectrum: use an en dash for null
or N/A. Geist: render `—` and *never* substitute "N/A", `null`, or an empty string
([Geist](https://vercel.com/geist/table)). The two differ on the dash; pick one and be consistent.
This skill uses the en dash (`EMPTY_CELL` in `utils.ts`). **Why not an empty cell:** you cannot
distinguish "no value" from "render failed", and the second one is a bug you will never see.

**Zeros go muted.** A column of `0`s at full text colour has the same visual weight as the
numbers that matter, so the eye stops on nothing. `NumCell` renders `0` at `--text-subtle`.

---

## 7. Selection model

- **Checkbox column, 40px, first.** Radio instead when only one row can be chosen (Carbon).
- **Header checkbox is tri-state**: checked / unchecked / **indeterminate**, and indeterminate
  must be `aria-checked="mixed"` — a visually dashed box says nothing to a screen reader.
- **Shift-click extends a range** from the last clicked row. Users expect it from every file
  manager they have used; without it, selecting 40 of 50 rows is 40 clicks.
- **Row click ≠ row select.** Clicking a row opens it; clicking the checkbox selects it. Merging
  them makes bulk selection impossible to perform without opening records.
- **"Select all" means the page, not the query.** Then offer *"Select all 1,204 matching"* as an
  explicit second step. Implicit select-all-across-pagination is a known defect class in real
  design systems, and the blast radius is a bulk delete the user did not intend.
- Selection must survive re-sorting, which is why `getRowId` is required rather than using indices.

---

## 8. Where the bulk-action bar docks

**Two legal placements, and only two:**

1. **Float at the bottom**, centred, 48px, over the list (`assets/BulkActionBar.tsx`).
2. **Overlay the existing toolbar band in place, at the same height.** This is Carbon's model —
   the batch action bar appears "at the top of the table" and pairs to the same 48px/32px height
   as the toolbar it replaces — and it is legal precisely *because the layout height does not
   change*.

**Illegal: inserting a new band above the list.** At the moment of selection every row shifts
down by the bar's height. The user has just aimed at a row; their next click lands on a different
record. **The bar moves the thing you are acting on.** This is the reason for the rule, and it is
why Carbon's top placement is fine and a naive top placement is not.

The bar should carry: the count (live-announced), up to three verbs, an overflow for the rest,
"Select all N matching" when it applies, and a Clear with `esc` bound. Carbon also disables
per-row actions while batch mode is active, so the user cannot mix scopes.

---

## 9. Sorting

- The header is a **button** (Geist). Its accessible name announces the action; the arrow is
  decorative.
- `aria-sort` goes on the `<th>`, not the button: `ascending` | `descending` | absent.
- **One sort at a time** by default. Multi-column sort is a power feature that needs a visible
  indicator of precedence (1, 2, 3) — without it users cannot tell why the order looks wrong.
- **Arrow visibility**: shown on the sorted column at rest; unsorted columns show theirs on hover
  only (Carbon). Showing every arrow all the time adds 12 pieces of chrome to the header band.
- **Sort must be in the URL**, with filters and page. A sorted table you cannot link to is a
  table two people cannot discuss.

---

## 10. Pagination vs virtualised infinite scroll

**Decide by task, then by count.**

Task first, because NN/g is unambiguous: infinite scroll suits homogeneous browsing with no
particular goal, and is **inappropriate when users need to find something specific, compare items
across a long list, or inspect only top-ranked results**. Its named costs: you cannot re-find an
item's position, the footer becomes unreachable, and keyboard/screen-reader users struggle
([NN/g](https://www.nngroup.com/articles/infinite-scrolling-tips/)).

```
goal-directed finding / comparison / bulk action   → pagination
a feed the user browses                            → infinite or "Load more"
```

Then by count:

| rows | approach |
|---|---|
| ≤100 | render all; client sort/filter |
| 100 – 10,000 | server pagination, 25 / 50 / 100 per page |
| >10,000, or live-updating | virtualise (windowing) + a URL-addressable cursor |

**Never infinite scroll on a surface that has bulk actions or a footer.** Selection state across
an unbounded list has no meaning, and the footer is unreachable by construction.

**Pagination placement and copy.** Always at the bottom of the table (Carbon). Copy: `Previous` /
`Next`, and `21–40 of 142` with an **en dash inside the range** (Geist). Advanced pagination adds
a per-page selector and jump-to-page.

---

## 11. Column resize, reorder, visibility

- Hiding and reordering should have **low interaction cost and a clear visual state** showing what
  is hidden (NN/g). A column menu that does not indicate "3 hidden" leaves users hunting for a
  column they hid last week.
- **Persist per user per table.** A column layout that resets on reload is worse than no
  customisation, because the user has to redo it every session.
- **Resize:** an 8px hit strip on the header's right edge, `cursor: col-resize`, and a minimum
  width per column so a column cannot be dragged to zero and lost.
- **Reorder must be keyboard-operable too.** Drag-only reorder excludes anyone not using a mouse;
  give the column menu "Move left / Move right".

---

## 12. Responsive strategy when columns exceed the width

In priority order:

1. **Priority columns.** Tag each column 1 / 2 / 3; drop 3 below `xl`, 2 below `lg`. Put the
   dropped ones in the column menu so they are recoverable, not gone. (`meta.priority`.)
2. **Horizontal scroll with the first column sticky.** Acceptable for genuinely wide data —
   financial tables, logs — but only with the identifier frozen, or a user scrolled right has no
   idea which row they are reading. NN/g recommends freezing header rows *and* columns in large
   tables for exactly this.
3. **Two-line rows below 768px.** Collapse to `primary line / meta line` inside a 56px row rather
   than shrinking type. This keeps the list scannable on a phone, and it is the one place where a
   card-like row is right.
4. **Never shrink the type to fit.** 11px table cells on a phone fail contrast in practice
   (thin strokes at small sizes) and fail the 16px input rule on any inline edit.

**Failure mode of a plain horizontal scrollbar with no sticky column:** users scroll right, lose
the row identity, scroll back to check, and give up — usually by exporting to a spreadsheet, which
is the signal your table has failed.

---

## Loading, empty and error — inside a table specifically

- **Skeletons, not spinners**, when a load is expected to take time (Carbon says this outright).
  The skeleton row must be *exactly* the real row height or the content jumps when it swaps, at
  the precise moment the user finally has something to click. See `motion.md` § 4.
- **The empty state replaces the table, including the column headers.** Carbon's rationale is
  specific and worth repeating: otherwise a screen reader reads the entire empty table before
  reaching the message saying there is nothing in it. Geist says the same structurally: render the
  empty state *outside* the table rather than as an empty `<tbody>`.
- **"No results" ≠ "no data".** They need different copy and different actions — clear-filters vs
  create-the-first-record. See `assets/EmptyState.tsx`.

---

## Sources

- [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/)
- [NN/g — Infinite Scrolling](https://www.nngroup.com/articles/infinite-scrolling-tips/)
- [IBM Carbon — data table usage](https://carbondesignsystem.com/components/data-table/usage/) · [style](https://carbondesignsystem.com/components/data-table/style/)
- [Adobe Spectrum — Table](https://spectrum.adobe.com/page/table/)
- [Vercel Geist — Table](https://vercel.com/geist/table)
- [Shopify Polaris — index table](https://polaris-react.shopify.com/components/tables/index-table)
- [WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [ARIA APG — Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

**Extrapolated:** the row-count thresholds (100 / 10,000), the one-truncating-column rule, the
76px actions column, the 8px resize strip, and the priority-column breakpoints. All are
consistent with the sources; none is quoted from them.
