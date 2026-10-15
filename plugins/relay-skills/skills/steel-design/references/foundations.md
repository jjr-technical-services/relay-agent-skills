# Foundations — chrome budget, type, spacing, control sizing

The four things that decide whether a product surface reads as designed. All four are
arithmetic, not taste, which is why they transfer between products and between people.

Runtime: `assets/foundation.css`. Every number below is a token in that file.

---

## 1. The chrome budget

**The measurement.** Count the horizontal bands of persistent chrome between the bottom of the
global nav and the first row of real content. Then measure the pixel distance to that first row.

```
target:  ≤ 2 bands, ≤ 96px (dense) / ≤ 120px (default)
```

Bands that accumulate without anyone deciding to add them: breadcrumb · page title · page
description paragraph · a "stats" band of big numbers · tab bar · filter bar · toolbar · column
header. Seven bands is a real number in real apps; at 40–48px each that is 300px of chrome.

**Why it is the highest-leverage principle here.** Chrome is paid on every visit by every user.
A page description costs a first-time user one read and a fortieth-visit user forty. Linear's
own framing for their 2024 refresh is the cleanest statement of it: *"Don't compete for
attention you haven't earned"*, and structure should be *"felt not seen"*
([Linear](https://linear.app/now/behind-the-latest-design-refresh)).

**The arithmetic of the cost.** At the default 40px row, every 40px of chrome is exactly one row
of data the user cannot see. On a 900px viewport with a 48px nav: 3 bands + header = 180px → 16
rows visible. 2 bands + header = 124px → 18 rows. That is a 12% difference in how much of the
list is answerable without scrolling, permanently.

**The collapse recipe.** One toolbar, one flex row, 40px:

```
[ Page title  1,204 ]  [ All 1204 · Open 87 · Mine 12 ]        [ Filter… / ]  [⚙][↓]  [+ New ]
 └── identity ──────┘   └── count-tabs (the stats band) ──┘     └─ search ─┘  └ 2nd ┘  └ 1st ┘
```

- Title is 20px, weight 600. It is chrome, not a headline.
- Count is a **muted sibling of the title**, not its own element and never a big number.
- View/count tabs are where a stats band belongs: those numbers are filters, so make them
  behave like filters (see `anti-patterns.md` § 2).
- Exactly one primary action. A second is a split button or a menu.
- Band 2 is the filter chip bar, and it renders **only when filters are active** or the surface
  is filter-first (`assets/FilterChipBar.tsx`).
- Band 3 is the column header — that is content, not chrome, and it does not count.

**What does not go in chrome at all:** a page description, an eyebrow label, a hero, an
onboarding callout that has already been read. Put first-run guidance in the empty state, where
it is seen exactly by the people who need it (`assets/EmptyState.tsx`).

**Failure mode if you ignore this:** the surface still "works" and nobody files a bug, because
the cost is distributed across every session. It surfaces as "the app feels slow" and as users
zooming out their browser.

**How to audit an existing surface,** in the running app at 1440×900:

```js
// distance from the bottom of the nav to the first row of real content
const nav = document.querySelector('[data-band="nav"]').getBoundingClientRect().bottom
const row = document.querySelector('[data-first-row]').getBoundingClientRect().top
row - nav   // want ≤ 96 dense, ≤ 120 default
```

---

## 2. Typography: app chrome vs reading copy

Two different jobs, two different sets of numbers. Mixing them is the single most common reason
a competent app looks amateur.

### The app scale — fixed px, 8 steps, integer line-heights

| token | size | line-height | tracking | job |
|---|---|---|---|---|
| `text-micro` | 11.5px | 16px (1.39) | +0.003em | uppercase group labels, `kbd` hints, row meta |
| `text-mini` | 12px | 16px (1.33) | 0 | badges, chip values, timestamps |
| `text-sm` | 13px | 18px (1.38) | −0.003em | **table cells**, dense controls, secondary chrome |
| `text-ui` | 14px | 20px (1.43) | −0.006em | **default**: control labels, form inputs, body of UI |
| `text-lg` | 16px | 24px (1.50) | −0.011em | emphasised values; **all inputs at touch widths** |
| `text-title` | 18px | 24px (1.33) | −0.014em | panel titles, dialog titles |
| `text-head` | 20px | 28px (1.40) | −0.017em | page title in the toolbar |
| `text-display` | 24px | 32px (1.33) | −0.020em | the one big number; onboarding headline |

**Why line-heights are integer px, not ratios.** A control's height is driven by its line box.
14px × 1.6 = 22.4px — a fractional line box inside a 32px control leaves 4.8px of padding per
side, so the control is no longer on the 4px grid and its text is no longer optically centred.
Integer line-heights keep every band height derivable by addition.

**Why 1.5–1.6 is a reading measure and wrong for controls.** Leading exists so the eye can find
the start of the next line after a wrap. A control label never wraps. On a single line the extra
leading buys nothing and spends vertical rhythm — and it is what makes dense UI look like a
web page with small text rather than an application. Refactoring UI's rule is the general form:
line-height and font size are *inversely* proportional — taller for small text, tighter for
large ([Refactoring UI](https://refactoringui.com/previews/line-height-is-proportional)).
Atlassian implements the same thing as a formula: headings ≈ 1.2×, body ≈ 1.5×, both rounded to
a multiple of 4 ([Atlassian](https://atlassian.design/foundations/typography/product-typefaces-and-scale)).

**Reading copy gets its own treatment** — and only in the places that are actually prose: help
text, empty-state bodies, docs panels, changelog entries, long field descriptions.

```
font-size 14px (or 16px) · line-height 1.55 · tracking 0 · max-width 68ch
```
The `.prose-ui` utility in `foundation.css` is this, and nothing else in the app should use it.
The measure matters as much as the leading: 68ch keeps a paragraph at 8–12 words per line.

**Tabular numerals in any aligned column.** `foundation.css` sets `font-variant-numeric:
tabular-nums` on `html`, i.e. tabular is the *default* in a product surface and proportional is
the opt-out (`.pnum`). Rationale: in an app most digits live in columns, and proportional
figures make a right-aligned column of numbers jitter horizontally so the eye cannot compare
magnitudes by width. Both Spectrum and Geist state the rule for tables explicitly — Spectrum:
use tabular *and lining* (not old-style) figures when users compare values
([Spectrum](https://spectrum.adobe.com/page/table/)); Geist: apply `tabular-nums` to numeric
columns ([Geist](https://vercel.com/geist/table)).

**Tracking, and a real disagreement.** Print convention says loosen small type. Screen UI faces
say the opposite above ~12px, and the numbers above come from Inter's own dynamic-metrics
curve, `tracking = −0.0223 + 0.185·e^(−0.1745·size)` em
([Inter](https://d.rsms.me/inter-website/v3/dynmetrics/)). That curve crosses zero at ≈12.3px:
positive below it, negative above, converging on −0.0223em. So *slight negative tracking at
small UI sizes is correct for Inter/Geist* (−0.003em at 13px, −0.006em at 14px) and it is not a
contradiction of the print rule — it is the same rule measured on a face designed for screens.
**Decision rule:** if your UI face publishes a tracking curve, use it. If it does not, use 0 at
11–14px and −0.01 to −0.02em at ≥18px, and never hand-tune per component.

### Two scales, and how to scope them

An app and its marketing site need **two different type scales**, and merging them is where the
529-of-599-headings bug comes from (`anti-patterns.md` § 1):

| | marketing | app |
|---|---|---|
| sizing | fluid `clamp()` | fixed px |
| range | 14 → 96px | 11.5 → 24px |
| `h1` default | 56–96px | **20px** |
| line-height | 1.0–1.2 on display, 1.6 on prose | 1.3–1.45 |
| goal | impression on visit 1 | legibility on visit 400 |

**Scoping in Next.js App Router — two root layouts.** Route groups may each own an `<html>`,
which is the only clean way to keep one `:root` per surface:

```
app/(marketing)/layout.tsx   → <html data-surface="marketing"> + marketing.css
app/(app)/layout.tsx         → <html data-surface="app">       + foundation.css
```

**If you cannot split the root layout**, scope by the root element, not by a wrapper div —
because Radix portals render into `document.body`, outside any wrapper:

```css
/* tokens still land on :root, so portalled dialogs/menus inherit them */
:root:has([data-surface="app"]) { --text-ui: 14px; /* … */ }
```

The wrong version — `.app-scope { --text-ui: … }` — leaves every dialog, select, dropdown and
tooltip on the marketing scale. That is `anti-patterns.md` § 7, and it is invisible until
someone opens a modal.

---

## 3. Spacing: one 4px unit, a closed set of gaps

```
unit 4px
permitted gaps: 0 · 2 (optical only) · 4 · 6 · 8 · 12 · 16 · 24 · 32 · 48
```

If a spacing value is not in that list it is a bug, not a decision. 10, 14, 18, 20, 28, 36 and
40 are banned as gaps — they exist only as *heights*, which are declared separately.

**What each gap is for** (naming them is what makes the set self-enforcing):

| gap | use |
|---|---|
| 2px | optical nudge only: an icon's baseline against its label |
| 4px | icon ↔ label inside a control |
| 6px | the one half-step — internals of a 28px dense control |
| 8px | control ↔ control inside a toolbar group |
| 12px | group ↔ group in a toolbar; row gap between form fields |
| 16px | band inline padding; card padding; **table column padding** |
| 24px | section ↔ section inside a panel |
| 32px | page gutter on desktop |
| 48px | the largest gap an app surface may use |

**Lay out with `gap`, not per-element margins.** One `flex gap-2` on the parent replaces eight
`mr-2`s and one forgotten last-child override. The failure mode of margins is not ugliness, it
is *drift*: the eighth item gets `mr-3` because someone eyeballed it once, and now the row has
two rhythms. `gap` makes spacing a property of the container, so there is exactly one place to
change it and exactly one value to read.

**Every band height is declared, never incidental.**

| band | height | note |
|---|---|---|
| global nav | 48px | |
| page toolbar | 40px | 48px if it carries a 40px primary button |
| filter chip bar | 36px | conditional |
| tab bar | 36px | |
| table header | 36px | |
| table row | 40px | default tier |
| bulk action bar | 48px | floats, adds no band |
| pagination footer | 44px | |

A band with no declared height is a band whose height is the tallest thing that happened to land
in it — which is how a toolbar becomes 56px because someone put a 40px button in it.

**The disagreement on the base unit.** Atlassian uses an **8px** base with a 4px half-step
(`space.050` = 4px, `space.100` = 8px) ([Atlassian](https://atlassian.design/foundations/spacing)).
Carbon's table spacing is a 16px-dominant scale. **Decision rule:** for dense app chrome use a
4px unit with the closed set above — at 8px granularity you cannot express the 28px control tier
or a 6px dense inset without half-steps everywhere, at which point the "8px system" is a 4px
system with extra vocabulary. For a low-density, document-shaped product, 8px base + 4px
half-step is equivalent in practice. **Pick one and never mix**: a surface with both reads as
two products stitched together, which is exactly what it usually is.

---

## 4. Control sizing and hit targets

**Three desktop tiers, one touch promotion.**

| tier | height | inline padding | where |
|---|---|---|---|
| `sm` | 28px | 8px | dense toolbar icon buttons, chips, inline row actions |
| `md` | **32px** | 10px | default — buttons, inputs, selects in app chrome |
| `lg` | 40px | 14px | primary action in a dialog or form; search in an empty state |
| touch | 44px | 14px | auto-promoted below 768px / on coarse pointers |

**Reconciling dense desktop UI with WCAG 2.2.** The numbers genuinely disagree, so here is each
source and then the rule:

| source | minimum pointer target | level |
|---|---|---|
| [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | **24 × 24 CSS px** | AA |
| WCAG 2.2 SC 2.5.5 | 44 × 44 CSS px | AAA |
| [Material 3](https://m3.material.io/foundations/designing/structure) | 48 × 48 dp touch, **44 × 44 dp pointer**, 8dp spacing | — |
| Apple HIG | 44 × 44 pt (touch) | — |

**The rule:**

1. **24px is the floor, and it is the padded box, not the glyph.** A 16px icon centred in a 28px
   button is a 28px target. M3 states this directly: an icon may look 24dp while its padding
   makes the target 48dp. So the `sm` tier passes AA outright.
2. **Below 24px, use the spacing exception, and know the arithmetic.** SC 2.5.8 passes an
   undersized target if a 24px-diameter circle centred on it does not intersect another
   target's circle. Two adjacent 20px buttons have centres 20 + *g* apart, so you need
   **g ≥ 4px**. That is why the gap scale has 4px in it and why `IconButton` leaves it.
3. **Any layout that also ships to touch promotes to 44px.** `foundation.css` does this in one
   media query on `(pointer: coarse), (max-width: 767px)` — the control tiers, the row height
   and the input type size all move together. Promoting only the buttons is how you get a 44px
   button in a 32px toolbar.
4. **Inputs go to ≥16px at touch widths.** Below 16px, iOS Safari zooms the viewport on focus
   and the user is left in a zoomed layout they did not ask for. This is a layout bug that
   looks like a typography choice.
5. **24px rows are legal only when the row itself is the sole target.** Carbon offers an
   extra-small 24px row ([Carbon](https://carbondesignsystem.com/components/data-table/style/));
   at that height there is no room for a compliant in-row control, so a 24px row may carry a
   whole-row click target and nothing else.

**Row height tiers**, reconciled with Carbon's five (24/32/40/48/64):

| tier | height | when |
|---|---|---|
| dense | 32px | power surface, one line, no in-row controls beyond a 28px icon button |
| **default** | **40px** | 13px/18px text + 11px padding = 40, and a 28px action clears by 6px |
| comfortable | 48px | rows carry an avatar or a two-line label |
| two-line | 56px | primary line + meta line; Carbon's 64px xl is the same idea with more air |

**Failure mode of mixing tiers:** a 32px row with a 32px button in it has zero padding, so the
control's focus ring is clipped by the row divider — the row looks fine until someone tabs to it.

---

## Sources

- [Linear — behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh) (chrome, hierarchy)
- [Refactoring UI — line-height is proportional](https://refactoringui.com/previews/line-height-is-proportional)
- [Atlassian — product typefaces and scale](https://atlassian.design/foundations/typography/product-typefaces-and-scale) · [spacing](https://atlassian.design/foundations/spacing)
- [Inter — dynamic metrics](https://d.rsms.me/inter-website/v3/dynmetrics/) (tracking curve)
- [Adobe Spectrum — Table](https://spectrum.adobe.com/page/table/) (tabular + lining figures)
- [Vercel Geist — Table](https://vercel.com/geist/table) (tabular-nums in numeric columns)
- [IBM Carbon — data table style](https://carbondesignsystem.com/components/data-table/style/) (row/toolbar heights)
- [WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Material 3 — structure & target sizes](https://m3.material.io/foundations/designing/structure)

**Extrapolated, not cited:** the specific 8-step app scale, the ≤2-band / ≤96px chrome target,
the closed gap set, and the 28/32/40 tier boundaries. Each is consistent with the sources above
but none states these exact values.
