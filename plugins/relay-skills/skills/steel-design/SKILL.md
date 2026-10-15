---
name: steel-design
description: >-
  Build enterprise SaaS application surfaces — data tables, list views,
  dashboards, settings, admin panels, detail/inspector panels, multi-step flows,
  command palettes — that read as designed rather than assembled. Use when
  building or redesigning any in-app product surface, CRUD screen, internal
  tool or admin UI; when a table needs columns, sorting, filters, bulk actions,
  pagination or empty states; when a form needs validation timing, progressive
  disclosure or a destructive-action pattern; when an app screen feels cluttered,
  cramped, "too much chrome", inconsistent, or like a marketing page wearing an
  app costume. A capability catalog of grounded UX/UI decision rules with real
  numbers — chrome budget, app type scale, 4px spacing, control tiers and hit
  targets, table anatomy, product-UI motion, WCAG 2.2 AA — plus drop-in React +
  Tailwind v4 reference implementations. Do not use for marketing pages,
  landing pages, or visual-style exploration.
license: MIT
metadata:
  owner: rose
---

# steel — your app-surface toolbox

A reminder of what you already know how to do, with the numbers attached. Product surfaces are not
harder than marketing pages; they are judged by a different scoring function. A landing page is
scored on **visit one**. An app surface is scored on **visit four hundred**, by someone who already
knows what it does and wants the data.

The rule: **count the bands of chrome before the first row of real content.** Two is the target.
Everything else in this skill is downstream of that.

## Turn the references into a surface decision

The toolbox map is an index, not the complete specification. Before recommending a pattern,
read the reference sections that govern the requested decisions:

- **Restructuring or density:** `references/foundations.md` § 1 and the matching archetype in
  `references/layouts.md`. For redundant summaries or descriptions, also read
  `references/anti-patterns.md` §§ 2 and 4.
- **Tables or selection:** `references/data-tables.md`, including alignment, row sizing,
  truncation, missing values and the bulk-action placement rule.
- **Forms, state coverage or destructive actions:** `references/flows.md`. Include the
  destructive-action default and every exception, not just the first exception that fits.

Make the resulting decisions inspectable. For a layout, report its **chrome budget** with the
remaining bands, each band's height, and the measured distance to the first data row; name the
measurement origin and account for table headers. Explain where displaced content goes:
filter-like summaries become **count-tabs** in the toolbar, while introductory descriptions
belong in the first-run empty state. Give the control tier and **row height** separately.
For a destructive action, compare undo with the full confirmation criteria from the reference,
then state which conditions actually apply. Do not assume that re-creating a deleted object
restores its permissions, sessions or external effects.

Use a consistent handoff structure so another engineer can implement the decisions:

- **Sizing:** give separate `Control height` and `Row height` fields, each with its tier,
  pixel value and applicable input mode. Keep table-header and toolbar heights separate.
- **State coverage:** use a `State ID | Trigger | UI and recovery` table. Preserve the state
  IDs from the flows reference verbatim; put any friendlier display wording in the UI column.
- **Confirmation copy:** provide the proposed title, consequence, destructive action and safe
  action. Describe rejected patterns as rules rather than quoting unusable dialog copy into
  the implementation handoff, where it could be mistaken for approved content.

Check every requested decision against its reference. Supply implementable values and reasoning,
not labels alone. Disclose unreadable references rather than presenting recollection as evidence.

## Stack this assumes
React + **Next.js App Router** + **Tailwind v4** + **`motion`** (Framer Motion, `motion/react`) +
**Radix** primitives (shadcn-style: dialog, select, dropdown-menu, popover, tooltip) +
**TanStack Table**. `cls()` helper → `assets/utils.ts`.

## The non-negotiable foundation (apply on EVERY app surface)

1. **Token architecture — `assets/foundation.css`.** One 4px spacing unit with a **closed set of
   permitted gaps**, explicit heights for every horizontal band, three control tiers (28 / 32 /
   40px) plus one touch promotion, a fixed-px app type scale, ONE `--radius`, ONE motion config,
   and semantic colour roles with measured contrast ratios in both themes.
2. **Element typography inside `@layer base`.** Non-negotiable in Tailwind v4: unlayered CSS beats
   layered CSS regardless of specificity, so an unlayered `h2 { font-size }` silently outranks every
   `text-*` utility you will ever write. This is the single highest-frequency bug in this document —
   `references/anti-patterns.md` § 1.
3. **The chrome budget: ≤2 bands, ≤96–120px to the first row.** Page title, count, view-tabs, search
   and the primary action all live in ONE 40px toolbar (`assets/Toolbar.tsx`). Recipe and the
   arithmetic of what each extra band costs → `references/foundations.md` § 1.
4. **The full state set, not just the happy path.** first-run · loading · populated · **no-results**
   (distinct from first-run) · partial · error · no-permission · cleared.
   `assets/EmptyState.tsx` · `references/flows.md` § 6.

**The one motion config, used on every state change** (the inverse of marketing motion advice):
```css
--dur: 140ms;  --ease: cubic-bezier(0.2, 0, 0, 1);   /* every hover, press, focus, disclosure */
```
No list-entrance animation, no per-row stagger, no counting numbers, no route transitions.
Why, with the arithmetic → `references/motion.md`.

## The toolbox map — reach for these

Each points to a reference file (loaded only when you need it) and/or a drop-in `assets/` file.

- **Foundations** — the chrome budget and how to measure it · app type scale (11.5 / 12 / 13 / 14 /
  16 / 18 / 20 / 24px with integer line-heights) vs reading copy · why 1.6 leading is wrong for
  controls · tabular figures · the Inter tracking curve · **two scales for app vs marketing and how
  to scope them** · the 4px unit and closed gap set · declared band heights · control tiers and
  reconciling WCAG 2.2's 24px floor with dense desktop UI. → `references/foundations.md`,
  `assets/foundation.css`
- **Layout archetypes** — list/table · master–detail · split view · dashboard · settings · wizard ·
  command palette · inspector panel. When to reach for each, the skeleton, the failure mode. →
  `references/layouts.md`
- **Data tables** — column order and alignment · row-height tiers · sticky headers (and the SC
  2.4.11 trap) · hover-revealed row actions · truncation · de-emphasised zeros and the en-dash rule
  · selection model · **where the bulk bar docks and why** · sorting · pagination vs virtualised
  infinite scroll · resize/reorder/visibility · responsive strategies. →
  `references/data-tables.md`, `assets/{DataTable,BulkActionBar,SkeletonRow}.tsx`
- **Filters & search** — the mechanism decision rule (inline selects vs chip bar vs sidebar) ·
  chips that carry label **and** value · filter state visible at rest and in the URL · conditional
  clear-all · instant vs Apply timing · the three different searches · when a palette replaces
  navigation. → `references/filters-and-search.md`, `assets/{FilterChipBar,Toolbar}.tsx`
- **Flows** — the wizard test · progressive disclosure · **validation timing (blur raises, change
  clears, submit is truth)** · error-message rules · destructive actions: undo by default, confirm
  when earned · the required state set. → `references/flows.md`,
  `assets/{MultiStepFlow,FormField,ConfirmDialog,UndoToast,EmptyState}.tsx`
- **Motion for product UI** — one config · what NOT to animate · why per-row stagger makes a list
  feel ~6× slower · skeleton-vs-spinner thresholds from Nielsen's 0.1 / 1 / 10s limits · optimistic
  UI and its three requirements · `prefers-reduced-motion`. → `references/motion.md`
- **Accessibility** — focus order and a ring that clears 3:1 · `<table>` vs `role="grid"` (a promise
  you keep or don't make) · tri-state checkboxes · APG combobox · dialog vs non-modal panel ·
  keyboard shortcuts and three-places discoverability · contrast in both themes and the two places
  dark themes always fail · announcing async state. → `references/accessibility.md`
- **Anti-patterns** — 12 concrete failures with symptom / mechanism / fix, including the Tailwind v4
  layer bug, the stats band that is really a filter, the permanently open side-rail form, marketing
  patterns on product surfaces, cards where a table belongs, dead and shadowed tokens, and
  wrapper-class scoping that Radix portals escape. → `references/anti-patterns.md`

## Reference a worked composition — name one

The catalog carries **15 worked app-surface compositions** — issue list, deployments list, triage
inbox, bulk-action list, payments table, audit log, log view, record workspace, dashboard, members
& roles, project settings, billing, import wizard, palette-first surface, first-run surface. Pull
one from `references/templates.md` when the user names it ("Reference7", "the triage inbox one") or
describes a surface that matches: archetype, band budget, information hierarchy, pattern set,
keyboard model. A number resolves directly; a described surface resolves against each row's opening
line. **A referenced composition is a wireframe + pattern set, not a source file** — take its
archetype and patterns, never its copy, columns or a 1:1 layout. Every row is tagged with how well
it is grounded (documented / public surface / composite), and no product's authenticated UI was
inspected — read the grounding note at the top of that file before quoting a row.

## Using the `assets/` files

Drop-in reference implementations — copy and adapt, they are not a package.
`foundation.css` first (everything else reads its tokens). Self-contained and dependency-light:
`Toolbar` (+ `Button`, `IconButton`) · `FilterChipBar` · `BulkActionBar` · `DetailPanel`
(+ `Field`, `FieldGroup`) · `EmptyState` (+ `NoResults`) · `SkeletonRows` (+ `InlineRefreshing`) ·
`FormField` (+ `useField`, validators, `focusFirstInvalid`) · `MultiStepFlow` (+ `Disclosure`) ·
`UndoToast` (+ `useUndoQueue`) · `utils`.
External deps: `DataTable` needs `@tanstack/react-table`; `CommandPalette` and `ConfirmDialog` need
`@radix-ui/react-dialog` (swap in `cmdk` for the palette if you already have it — the ARIA shape is
the same); `BulkActionBar`, `DetailPanel` and `UndoToast` use `motion/react`.
Several files export the decision rule as a function so it can be asserted rather than remembered:
`zebraIsWorthIt()`, `needsConfirm()`, `FILTER_MECHANISM_RULE`.

## Marketing surfaces are the inverse — and are a different skill

The most common way this skill is misapplied is by carrying marketing craft onto a product
surface. The two are scored differently and the advice inverts:

| | marketing surface | app surface (this skill) |
|---|---|---|
| scored on | visit one | visit four hundred |
| type | fluid `clamp()`, 14 → 96px | fixed px, 11.5 → 24px |
| motion | reveals, parallax, stagger, scroll-scrub | 140ms state changes only |
| chrome | sections are the product | chrome is a cost with a budget |

`references/anti-patterns.md` § 4 names the specific imports that fail — hero blocks, page
description paragraphs, eyebrow labels, `py-20` section rhythm — and `references/motion.md`
explains why the motion advice reverses.

**If both surfaces live in one codebase, scope them apart.** Two root layouts via Next.js App
Router route groups — `app/(marketing)/layout.tsx` and `app/(app)/layout.tsx` — each with its own
`:root` token file. Do **not** put both scales on one `:root`, and do not scope either to a wrapper
class: Radix portals render into `document.body` and will inherit the wrong one
(`references/anti-patterns.md` § 7).

## How this composes with Relay's other skills

- **`create-marketing-site-blueprint`** — marketing information architecture and site copy. It owns
  the surfaces this skill explicitly does not.
- **`explore-visual-directions`** — previews a named aesthetic on an existing product without
  changing production. Run it for *how the surface should look*; run `steel-design` for how it
  should be **structured, densified and behave**. Order matters: settle structure first, because a
  visual direction applied to a six-band layout just restyles the waste.
- **`verify-design-claims`** — verify the claims in a plan against source evidence. Reach for it
  when a redesign proposal asserts something about existing behaviour that has to hold.
- **`kpi-tree`** / **`ab-test-setup`** — if a surface change is meant to move a number, they define
  the metric and the experiment. This skill does not claim a lift.

**Scope boundary.** This skill produces structure, density, behaviour and reference
implementations. It does **not** authorize changing a shared design system's tokens, and
implementation, local qualification and deployment remain separate, human-decided steps.
