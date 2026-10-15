# Anti-pattern catalog

Each entry: **symptom** (what you observe), **why** (the mechanism), **fix** (what to change).
Numbers 1–7 were all found in shipped code, not invented for this document.

---

## 1. Element typography declared outside `@layer base` in Tailwind v4

**Symptom.** You write `<h2 className="text-ui">` and it renders at 30px. Every `text-*` and
`leading-*` utility on a heading is silently ignored. DevTools shows your utility in the rule list,
not crossed out by specificity — it just loses.

**Why.** Cascade layers outrank specificity, and **unlayered CSS beats layered CSS**. MDN states it
normatively: *"Styles that are not defined in a layer always override styles declared in named and
anonymous layers"*, and within layers *"specificity becomes irrelevant"* — the later layer wins
regardless of selector weight ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)).
Tailwind v4 emits everything into `theme` → `base` → `components` → `utilities`, so an *unlayered*
`h2 { font-size: 1.875rem }` in your global stylesheet sits above all four and cannot be overridden
by any utility. This is why the symptom is so confusing: nothing about specificity explains it.

Real impact measured in one app: **529 of 599 headings rendered at a size no component asked for.**

**Reproduced, so you can trust the mechanism.** Compiling `assets/foundation.css` with Tailwind
v4.1.16 and measuring computed styles in a browser: an `<h2 class="text-micro">` renders at
**11.5px** — the utility correctly beats the `@layer base` rule. Inject a single *unlayered*
`h2 { font-size: 30px }` into the same document and the same element renders at **30px**. The
utility is still there, still more specific in the traditional sense, and still loses.

**Fix.** Every element-level rule goes inside a layer:
```css
@import "tailwindcss";

@layer base {                /* ← the whole fix */
  h1 { font-size: var(--text-head); line-height: var(--lh-head); }
  h2 { font-size: var(--text-title); line-height: var(--lh-title); }
}
```
**How to detect it across a codebase:** search your global CSS for element selectors and check each
is inside a layer.
```bash
# element selectors in global CSS, with the 5 preceding lines so you can see the layer
grep -rn -B5 -E '^\s*(h1|h2|h3|h4|h5|h6|p|table|th|td|body|a)\s*(,|\{)' \
  app/**/*.css src/**/*.css styles/**/*.css
```
Anything not inside an `@layer` block is outranking your whole utility system.

---

## 2. A "stats" band that is really a filter wearing a disguise

**Symptom.** A row of large numbers above the list — `1,204 Total · 87 Open · 12 Overdue`. Users
click them. Nothing happens. Then they scroll past the band every visit forever.

**Why.** The numbers are *segment counts*, i.e. filter values. Presenting a filter as a display
element makes a promise the surface does not keep (users click affordances that look like segments),
and it spends a 72–96px band on information that is one muted word wide. On a 40px-row table that
band costs two rows of data, permanently.

**Fix.** Collapse it into the toolbar as **count-tabs** — same numbers, now clickable, in 0 extra
bands:
```
[ Orders 1,204 ]  [ All 1204 · Open 87 · Overdue 12 ]      [ Filter… ]  [+ New order ]
```
`Toolbar`'s `views` prop is this. Keep a real stats band only on a dashboard, where noticing *is*
the job (`layouts.md` § 4) — and even there, make the numbers navigate.

---

## 3. A permanently open form occupying a side rail

**Symptom.** The right rail holds an always-visible "Add item" / "New filter" / "Quick create"
form. The list beside it feels cramped. The form is used maybe twice a session.

**Why.** Inputs are the highest-attention elements on a surface — an empty text field is an
unanswered question, and the eye returns to it. A permanently open form therefore competes with,
and wins against, the content it sits next to, in inverse proportion to how often it is used. It
also spends 320–400px of width that the selected item needs.

**Fix.** Make it a button. `[+ New]` in the toolbar opens the form in the rail, a dialog, or a
route — and **give the rail to the selected item** (`DetailPanel`). The rail then shows something
that changes as the user works, which is what makes a split view worth its width
(`layouts.md` § 3, § 8).

---

## 4. Marketing patterns misapplied to product surfaces

**Symptom.** A product page with a hero block, an eyebrow label (`WORKSPACE · ORDERS`), a
page-description paragraph, centred section headers, and `py-20` section rhythm.

**Why.** Marketing patterns are optimised for **visit one**: establish context, create feeling,
earn a scroll. Product surfaces are optimised for **visit four hundred**: the user already has the
context and wants the data. Each pattern inverts:

| marketing pattern | on a product surface |
|---|---|
| hero block | 200px+ of chrome above the work |
| page description paragraph | read once, skipped 399 times, costs a band forever |
| eyebrow label | duplicates the nav and the breadcrumb |
| centred section headers | breaks the left scan edge the list depends on |
| `py-20` section rhythm | 160px of vertical air per section in a surface measured in rows |
| fluid `clamp()` display type | a 56px `h1` in a 40px toolbar |

**Fix.** Put first-run guidance in the **empty state**, where it is seen by exactly the people who
need it and disappears for everyone else (`assets/EmptyState.tsx`). Replace `py-20` with the
declared band heights. Use the app type scale, scoped separately from marketing
(`foundations.md` § 2).

**This is also where marketing motion craft must not be applied.** See `motion.md` for the inverse.

---

## 5. A card list where a table belongs

**Symptom.** A grid or stack of cards, each holding 5–8 pieces of metadata in free-flowing
label/value pairs. Users ask "can I sort this by last activity?" and you cannot easily add it.

**Why.** Scanning works by holding position in a column: the eye fixates once per row and reads
down a fixed x-position. Cards put every attribute at a different x-position in every card, so
comparing "last activity" across 12 cards requires 12 separate visual searches. Cards also cannot
carry the operations a list needs — sort, bulk selection, column choice — because there is nothing
for a sort to act on.

**Fix — the decision rule:**
```
≤3 attributes, and the item is something you LOOK AT (an image, a chart, a preview) → cards
>3 attributes, or any attribute is sortable / comparable                            → TABLE
```
Below 768px a table may collapse to two-line rows, which look card-ish but keep the column
contract (`data-tables.md` § 12).

---

## 6. Dead tokens, and duplicate declarations that shadow each other

**Symptom.** The token file has 60 custom properties. Changing one has no effect. Two
`--text-muted` declarations exist and the second wins, so the documented value is not the rendered
value.

**Why.** Dead tokens are worse than no tokens: they make the token file untrustworthy, so the next
person hardcodes a hex instead of reading it. Duplicates are worse still, because the file *looks*
authoritative while lying — the fix someone made three months ago was applied to the shadowed
declaration and quietly did nothing.

**Fix — two checks, both cheap enough to run in CI:**
```bash
# 1. duplicate declarations of the same custom property within one :root block
grep -oE '^\s*--[a-z0-9-]+' app/globals.css | sort | uniq -d

# 2. tokens nothing consumes
for t in $(grep -oE '^\s*--[a-z0-9-]+' app/globals.css | tr -d ' ' | sort -u); do
  n=$(grep -rF "var($t)" app src --include='*.{ts,tsx,css}' | wc -l)
  [ "$n" -eq 0 ] && echo "unused: $t"
done
```
Delete anything unused. Keep the count small on purpose: `foundation.css` is ~20 colour roles, one
`--radius`, one motion pair. A token you cannot name the job of does not have one.

---

## 7. Scoping a design change to a wrapper class while Radix portals escape it

**Symptom.** The new type scale and colours look right everywhere — until someone opens a dialog, a
select, a dropdown menu, or a tooltip. Those render on the old scale, with the old colours, and
often in the wrong theme.

**Why.** Radix primitives render through a **portal into `document.body`**, outside your React tree
and therefore outside `.app-scope`. CSS custom properties inherit down the *DOM*, so a portalled
dialog inherits from `:root` / `body`, not from the wrapper you scoped your tokens to. Nothing is
broken in the wrapper; the portal was simply never inside it.

**Fix.** Put tokens on `:root`, and if you must distinguish surfaces, key off the root element:
```css
/* ✅ portalled content inherits */
:root { --text-ui: 14px; }
:root[data-surface="marketing"] { --text-ui: 16px; }
:root:has([data-surface="app"]) { /* … when you cannot set the attribute on <html> */ }

/* ❌ every dialog, select, dropdown and tooltip keeps the old values */
.app-scope { --text-ui: 14px; }
```
Best structure in App Router: **two root layouts** via route groups, each rendering its own
`<html>` with its own token file (`foundations.md` § 2). **Always verify a token change by opening
a dialog** — that is the one-click test for this class of bug.

---

## 8. Hover-only affordances

**Symptom.** Row actions, a column menu, or a delete button that appears on `:hover`. Keyboard
users cannot reach them. On touch they do not exist.

**Why.** `group-hover:` has no keyboard or touch equivalent. The control is in the DOM and
focusable, so a keyboard user tabs *into an invisible button* — which is worse than absent, because
focus disappears.

**Fix.** Three selectors, always together:
```tsx
className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
           [@media(pointer:coarse)]:opacity-100"
```
And reserve the space so revealing never reflows the row (`data-tables.md` § 5). Carbon does the
same: it detects whether the user agent supports hover and keeps row menus persistent if not.

---

## 9. A bulk-action bar inserted above the list

**Symptom.** Selecting a row pushes the whole list down ~48px. The user's second click lands on the
wrong record.

**Why.** The bar appears at the moment the user has aimed at a row, and it **moves the thing they
are acting on**. The mis-click is silent, and on a destructive action it is expensive.

**Fix.** Two legal placements only: float it at the bottom (`BulkActionBar`), or overlay the
existing toolbar band **in place at the same height** (Carbon's model). Never insert a new band
(`data-tables.md` § 8).

---

## 10. Two sources of density in one component

**Symptom.** `h-10` on a control with `text-sm` inside; 14px text in a 28px chip; a 48px header
over 32px rows; `p-5` in a system whose gaps are 16 and 24.

**Why.** Height, type size and padding are one decision, not three. When they are set
independently, the control's text is no longer optically centred, the focus ring clips against a
neighbour, and the component reads as belonging to a different system — which it does.

**Fix.** Controls come from the tier table: `sm` 28px / 13px / 8px, `md` 32px / 13–14px / 10px,
`lg` 40px / 14–16px / 14px. The table header row always matches the body row height. Any spacing
value outside the closed gap set is a bug (`foundations.md` § 3–4).

---

## 11. A modal for a task that needs the list as reference

**Symptom.** Clicking a row opens a modal showing that record. Users close it, check a neighbouring
row, reopen it. Comparing two records is impossible.

**Why.** A modal blocks the data the user is comparing against, and traps focus so they cannot even
tab back to the list. NN/g's table guidance is explicit that a single record should open in a
**non-modal side panel or a separate window** rather than a modal, for exactly this reason
([NN/g](https://www.nngroup.com/articles/data-tables/)).

**Fix.** `DetailPanel` — non-modal, `role="complementary"`, no focus trap, `j`/`k` to move through
the list without closing. Reserve modals for a **decision that must block**: a destructive confirm,
an authentication step, an unsaved-changes prompt.

---

## 12. Inputs under 16px at touch widths

**Symptom.** Tapping a search field on iOS zooms the whole page in, and the user is left in a
zoomed layout they did not ask for and cannot easily undo.

**Why.** iOS Safari zooms to fit a focused input whose computed font-size is below 16px. It reads
as a layout bug and is filed as one; the cause is a type token.

**Fix.** Promote the input type size at touch widths — one media query, alongside the control-tier
promotion:
```css
@media (pointer: coarse), (max-width: 767px) {
  :root { --text-ui: 16px; --lh-ui: 24px; --ctl-md: 44px; }
}
```
Never `maximum-scale=1` in the viewport meta to suppress it — that disables pinch-zoom for
everyone and fails WCAG 1.4.4.

---

## Sources

- [MDN — `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) (unlayered beats layered; specificity irrelevant within layers)
- [Tailwind CSS — adding custom styles](https://tailwindcss.com/docs/adding-custom-styles) (v4 layer order; `@layer base` for element defaults)
- [NN/g — Data Tables](https://www.nngroup.com/articles/data-tables/) (non-modal side panel; filter state visible)
- [IBM Carbon — data table usage](https://carbondesignsystem.com/components/data-table/usage/) (hover persistence on non-hover agents; batch bar placement)
- [Linear — behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh) (chrome reduction, earned attention)

**Extrapolated:** the 529/599 figure is an observation from one codebase, not a published
statistic. The grep recipes, the density-tier table, and the ≤3/>3 card rule are this skill's.
