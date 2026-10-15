# Filters and search

Filter UI is where list surfaces accumulate chrome, because every new filter dimension arrives
with a request for "just one more dropdown". The decision rule below is what stops that.

Runtime: `assets/FilterChipBar.tsx`, search input in `assets/Toolbar.tsx`.

---

## 1. Which mechanism — the decision rule

```
≤2 dimensions, each with ≤7 fixed options       → inline selects in the toolbar
3–6 dimensions, or values are user-created       → chip bar + "Add filter" popover
                 (labels, assignees, tags, segments)
>6 dimensions WITH facet counts, on a
  search-first surface                           → left sidebar (240px)
```

**Why the boundaries fall there.**

- **Inline selects** are the cheapest to use (one click to open, one to choose) and the most
  expensive in chrome (each one occupies toolbar width permanently). At two dimensions they fit
  alongside a title, a count and a primary action. At three they push search off the band.
- **Chip bar** costs one conditional band but scales: ten active filters is ten chips, and the
  band only exists while filters do. It is also the only mechanism that handles *user-created*
  values, because you cannot enumerate "every label this workspace has ever made" in a select.
- **Sidebar** only earns 240px of permanent width when the filters *are* the interface — search
  results, catalogues, reports — and when facet counts let the user see the shape of the data
  before committing to a click. A sidebar with no counts is six selects stacked vertically,
  paying 240px for the privilege.

**Do not mix mechanisms on one surface.** Two inline selects plus a chip bar means filter state
lives in two places and the user has to check both to understand why the list is short.

---

## 2. Chips carry their own label *and* value

```
Status: Active          Owner: 3 selected          Created: Last 30 days
```
Never a bare value (`Active`, `3 selected`, `Last 30 days`).

**Why.** With one dimension a bare value is unambiguous. With two or more it is not: "Active"
could be the record's status or the owner's account status, and the user cannot tell which chip to
remove to widen the result. The failure is not cosmetic — it is that the user removes the wrong
chip, sees the list get *longer in the wrong direction*, and loses confidence in the filter.

**Multi-select values collapse to a count**, not a comma list. `Owner: 3 selected` beats
`Owner: Dana Reyes, Priya Raman, J. Okonk…` — a truncated list of names tells the user nothing
about *which* names, so it is strictly worse than the count, which at least is honest. Put the
names in the chip's popover and in its `aria-label`.

**Each chip has two targets**: the body (opens the editor) and the remove button. The remove
button needs a ≥24px box and ≥4px clear of the body's target, or the WCAG 2.2 SC 2.5.8 spacing
exception fails for both (`foundations.md` § 4).

---

## 3. Filter state must be visible at rest, and in the URL

- **At rest** means without opening anything. A filter icon with a dot on it is not visible state:
  the user knows *something* is filtered and not *what*, so their only recovery is to open the
  panel and audit it. This is the commonest cause of "the data is missing" support tickets.
- **In the URL** — filters, sort, page, and the selected record. Three payoffs: a colleague can be
  sent the exact view; the back button works after opening a record; and a reload does not reset
  the query the user spent a minute building.

---

## 4. Clear-all appears only when filters are active

A permanently rendered, disabled "Clear" is a control that has never once been useful and is
always occupying space. Render it conditionally on `filters.length > 0`.

Same logic scaled up: the **whole chip band** renders only when a filter is active, unless the
surface is filter-first. A persistently empty 36px filter band is 36px of chrome — roughly one
row of data — bought for nothing (`foundations.md` § 1).

---

## 5. Apply timing: instant vs Apply button

NN/g's finding is that sites should **err toward batch filtering with an Apply button**, because
interactive filtering fires a query per click, risks landing on zero results with no feedback, and
is only comfortable when results return in under a second
([NN/g](https://www.nngroup.com/articles/applying-filters/)).

**Decision rule:**
```
single-select dimension, query <1s      → instant. Cost of a wrong click is one click.
multi-select facets                     → Apply button. Otherwise every checkbox is a query.
query ≥1s, or expensive server-side     → Apply button.
```
The 1s boundary is Nielsen's second response-time limit: under it the user's thought process is
uninterrupted, so an instant filter feels like direct manipulation. Over it, instant filtering
means the user waits N times to express one intent
([NN/g](https://www.nngroup.com/articles/response-times-3-important-limits/)).

**While results update:** dim the whole result area and show one progress affordance. Do not
re-render rows individually — NN/g specifically calls out the flicker of items changing one by one.
And **do not scroll to top** while the user is still in the filter zone; it disorients them and
causes accidental clicks.

---

## 6. Zero results is its own state

A filtered-to-nothing list is **not** the first-run empty state. It needs:
- the query named back to the user (`Nothing matches "acme" with Status: Archived`);
- a **Clear filters** action, and if one filter is obviously the culprit, offer to drop just that
  one;
- the filter chips still visible above it. Removing the chips at zero results strands the user with
  no way to see what excluded everything.

`assets/EmptyState.tsx` separates these as `no-results` vs `first-run`, because conflating them is
the bug where a user with an over-narrow filter is told to "create your first order".

---

## 7. Where search lives, and the three different searches

| control | scope | key | placement |
|---|---|---|---|
| **local filter** | the current collection | `/` | in the toolbar, 200–280px |
| **global search** | everything in the workspace | `⌘K` | command palette |
| **faceted search** | a corpus, with relevance ranking | its own route | search-first surface + sidebar |

These are not substitutes, and labelling matters: a toolbar input placeholdered "Search" that only
filters the loaded page teaches users the app's search is broken. Use **"Filter…"** for the local
one. `Toolbar` binds `/` to it and shows the key as a `kbd` hint, guarded so it never steals a
keystroke from a text field.

**When a command palette replaces navigation** — the threshold, repeated from `layouts.md` § 7:
destinations exceed ~30, or the destinations are user-created objects a sidebar cannot enumerate.
A palette does **not** replace the table's own filter: the palette answers "take me somewhere / do
something", the filter answers "narrow what I am looking at". Products that merge them end up with
a palette that returns 400 rows and no way to sort them.

---

## 8. Sort belongs with the filters, not with the title

Sort is a query parameter, the same as a filter, and it belongs in the band that shows query state
— the right end of the chip bar. Putting it next to the page title implies it is part of the page's
identity, and it separates it from the state it modifies, so the user has to look in two places to
understand why the list looks the way it does.

---

## Sources

- [NN/g — Applying Filters: Design Recommendations](https://www.nngroup.com/articles/applying-filters/)
- [NN/g — Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/) (filters discoverable, transparent, clearly indicated when active)
- [Material 3 — Chips](https://m3.material.io/components/chips/guidelines) (filter chips: succinct labels, icons only when functional)
- [IBM Carbon — data table usage](https://carbondesignsystem.com/components/data-table/usage/) (toolbar contents, ≤5 actions then overflow)

**Extrapolated:** the ≤2 / 3–6 / >6 dimension thresholds, the 200–280px search width, and the
"name the label in the chip" rule. The reasoning is given above; no source states these numbers.
