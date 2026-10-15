# Accessibility for app surfaces

Not a compliance appendix. Every item here is a defect that shows up in ordinary use — a keyboard
user who cannot reach a row action, a dark theme whose muted text is unreadable, a filter that
silently removes 900 rows with no announcement.

Target: **WCAG 2.2 Level AA**, plus two AAA criteria that are cheap and worth taking (2.4.13).

---

## 1. Focus order and visible focus

- **Focus order follows the DOM.** If the visual order and the DOM order disagree, fix the DOM, not
  the tab order. Positive `tabindex` values are always the wrong tool.
- **One focus treatment, defined once:** 2px ring, 2px offset, on `:focus-visible` (not `:focus`,
  or every mouse click leaves a ring). `foundation.css` puts it in `@layer base`.
- **The contrast the ring must clear.** WCAG 2.2 **SC 2.4.13 Focus Appearance (AAA)** asks for an
  indicator at least as large as a **2px-thick perimeter** of the component with a **3:1 contrast
  ratio between the focused and unfocused states**
  ([WCAG](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)). At AA, **SC 1.4.11
  Non-text Contrast** already requires 3:1 for the visual information needed to identify a control
  and its state ([WCAG](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)). The
  2px + 2px-offset ring satisfies both, and the offset is what makes it visible against a filled
  button.
- **`outline: none` without a replacement is a bug**, full stop. If a design needs a different
  indicator, it needs a different indicator — not none.
- **SC 2.4.11 Focus Not Obscured (Minimum), AA:** a focused component must not be *entirely* hidden
  by author content, and sticky headers and footers are the named failure. Fix:
  `scroll-margin-top` on rows equal to the sum of the sticky bands (`.scroll-clear-header`).

---

## 2. Tables

**Default to a real `<table>`.**
```html
<table>
  <caption class="sr-only">Orders, 142 results, sorted by created date descending</caption>
  <thead><tr><th scope="col" aria-sort="descending">Created</th>…
```
- A **caption or `aria-label` is the table's accessible name.** Without one, a screen reader
  announces "table" and the user has no idea which of the page's tables they landed in.
- `scope="col"` on header cells; `aria-sort` on the `<th>` (not on the sort button inside it), one
  of `ascending` / `descending` / absent.
- `aria-rowcount` / `aria-rowindex` when rows are virtualised or paginated, so "row 34 of 142" is
  true rather than "row 4 of 25" ([ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)).

**`role="grid"` is a promise — keep it or don't make it.** The APG grid pattern means **only one of
the grid's focusable elements is in the page tab sequence**, with arrow keys moving cell to cell,
Home/End to row edges, Ctrl+Home/End to the grid's corners, and Enter/F2 to enter an editable cell.
Half-implementing it is *worse than a plain table*: you have removed the tab stops the user had and
not delivered the arrow keys you implied. Use `role="grid"` for editable, spreadsheet-like tables.
For a list, `DataTable`'s `rowNav` gives up/down row focus — a smaller promise, kept.

---

## 3. Checkboxes and selection

- **Row checkbox `aria-label` names the row**: `Select Acme Inc`, never `Select row 4`. Row numbers
  change on sort; names do not.
- **Header checkbox is tri-state** and indeterminate must be `aria-checked="mixed"`. A visually
  dashed box conveys nothing without it. Carbon spells out the three states: checked, unchecked,
  indeterminate.
- **`aria-selected` on `<tr>`** when the table supports selection, so the selected set is
  discoverable without walking every checkbox.
- The count in the bulk bar lives in an `aria-live="polite"` region, so "12 selected" is announced
  without yanking focus out of the list the user is still working through.

---

## 4. Comboboxes, filters, and the command palette

APG combobox pattern, and the one rule teams break:

```html
<input role="combobox" aria-expanded="true" aria-controls="list"
       aria-activedescendant="opt-3" aria-autocomplete="list">
<div id="list" role="listbox">
  <div id="opt-3" role="option" aria-selected="true">…
```
**Focus never leaves the input.** Options are *pointed at* with `aria-activedescendant`, not
focused. Moving DOM focus into the list breaks typing — which is the only input method the control
has. `CommandPalette` implements exactly this.

- Group headings inside the list use `role="group"` + `aria-label`, so "Actions" is not read as an
  option.
- Result counts belong in a live region: `142 commands` / `No commands match "xyz"`.

---

## 5. Dialogs and panels

**Dialog** (Radix `Dialog` handles the mechanics):
- focus trapped while open, restored to the trigger on close, `Escape` closes;
- `aria-labelledby` pointing at a real title (a `sr-only` title is fine, absent is not);
- **initial focus on the least destructive control.** Radix focuses the first focusable element;
  override it (`onOpenAutoFocus`) so a stray Enter cannot delete something.

**Non-modal panel** (`DetailPanel`): `role="complementary"` with a label, **no focus trap, no
`aria-modal`**. The panel is beside the list, not instead of it, and trapping focus in it strands
the user. This is the accessibility expression of the same reason NN/g gives for preferring a
non-modal side panel over a modal for a single record.

---

## 6. Keyboard shortcuts and discoverability

Baseline set for a list surface:

| key | action |
|---|---|
| `⌘K` / `Ctrl K` | command palette |
| `/` | focus the local filter |
| `↑ ↓` or `j k` | move between rows |
| `Enter` | open the focused row |
| `x` or `Space` | toggle selection on the focused row |
| `Shift`+click | extend selection from the last clicked row |
| `Escape` | clear selection, close the panel, close the palette |
| `?` | shortcut sheet |

**Two hard rules:**
1. **Never intercept a keystroke while a text input has focus.** Guard every global handler on
   `INPUT` / `TEXTAREA` / `isContentEditable` — `Toolbar` and `DetailPanel` both do. The bug this
   prevents: typing "j" in a search box jumps the user to the next row.
2. **Discoverability is three places, not one.** A shortcut appears (a) in the tooltip of the
   control that duplicates it, (b) in the `?` sheet, and (c) in the command palette row's right
   rail. Learned incidentally in three places, a shortcut gets used; documented in one, it is a
   feature for its author.

Also: do not bind single letters to destructive actions, and do not override browser or
screen-reader keys (`⌘W`, `⌘L`, `Ctrl+Option+arrows`).

---

## 7. Contrast, in both themes

**The AA numbers** ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)):

| what | ratio |
|---|---|
| body text | **4.5:1** |
| "large scale" text — ≥18pt (≈24px), or ≥14pt bold (≈18.5px) | **3:1** |
| UI component boundaries and states, meaningful graphics | **3:1** |
| decorative dividers, disabled controls, logotypes | exempt |

**Where dark themes fail, and it is always the same two places.**

1. **Muted text expressed as opacity.** `text-white/60` over a mid-grey surface can land near 3:1;
   it passes on the page background and fails on the hovered row. Declare muted text as its own
   *colour* token and measure it against **every** background it can sit on — page, subtle, card,
   row-hover, selected-row. `foundation.css` documents the measured ratio per token, and the worst
   case for `--text-muted` is 6.8:1 on `--row-hover` in both themes.
2. **Input borders.** A 1px `#d1d1d6` border is ~1.5:1 — it is the visual information that
   identifies the control, so SC 1.4.11 applies and it fails. That is why the system has a separate
   `--border-control` (3.42:1 light / 3.92:1 dark) distinct from the decorative `--border`.

**Status must never be colour alone** (SC 1.4.1). `StatusBadge` pairs a 3:1 dot with the word, so
red/green status survives both a colour-vision difference and a greyscale print.

---

## 8. Announcing async state changes

Sighted users get motion and layout. Everyone else needs a live region, and this is the most
commonly missing item on an otherwise well-built app surface.

**One `aria-live="polite"` status region per surface.** Announce the outcomes, not the mechanics:

| event | announcement |
|---|---|
| query returns | `142 results` |
| filter applied | `Filters applied. 12 results.` |
| sort changed | `Sorted by created date, descending` |
| selection changed | `12 orders selected` |
| save completes | `Saved` |
| destructive action | `12 members removed. Undo available.` |
| load fails | use `role="alert"` on the error region, not the polite one |

**Rules:** `assertive` only for a genuine interruption (a failed save the user will act on) —
routine updates on assertive interrupt whatever the user is reading. Never announce per keystroke.
Debounce the results announcement by ~500ms so a typed filter announces once, not per character.

---

## Sources

- [WCAG 2.2 SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [WCAG 2.2 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [WCAG 2.2 SC 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [ARIA APG — Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [IBM Carbon — data table usage](https://carbondesignsystem.com/components/data-table/usage/) (tri-state header checkbox)
- [Material 3 — structure, landmarks & headings](https://m3.material.io/foundations/designing/structure)
- [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/) (non-modal side panel)

**Extrapolated:** the baseline shortcut table, the three-places discoverability rule, the 500ms
announcement debounce, and the specific token ratios (computed with the WCAG relative-luminance
formula against this system's palette, not quoted).
