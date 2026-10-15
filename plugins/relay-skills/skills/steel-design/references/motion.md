# Motion for product UI — the inverse of marketing motion

Marketing motion advice — *never ship a static page*: reveals, parallax, stagger, scroll-scrubbed
video — is correct for a page someone visits once and should feel something about.

**This is the opposite surface.** A work surface is visited forty times a day by someone who
already knows what it does. Here motion has exactly one job: **tell the user that the thing they
just did happened.** Everything beyond that is a tax on every interaction, forever.

```
marketing surface:  motion creates the impression
app surface:        motion confirms the action
```

Runtime: `--dur`, `--dur-enter`, `--ease` in `assets/foundation.css`; `MOTION` / `MOTION_ENTER` in
`assets/utils.ts`.

---

## 1. One config, applied to every state change

```css
--dur:       140ms;                       /* every state change */
--dur-enter: 180ms;                       /* panels and dialogs entering */
--ease:      cubic-bezier(0.2, 0, 0, 1);  /* the only curve */
```
```ts
export const MOTION = { duration: 0.14, ease: [0.2, 0, 0, 1] }
```

**Apply it with one class, not three.** `foundation.css` exports the whole config as a single
utility, so a component cannot pick its own duration or curve and there is exactly one place to
change how the app feels:

```tsx
className="transition-app"         // state changes: colour, opacity, shadow, transform
className="transition-app-enter"   // panels / dialogs / toasts entering (--dur-enter)
```
Do **not** hand-assemble `transition-colors duration-… ease-…` per component — that is how a
codebase ends up with four durations. (It is also a Tailwind v4 trap: there is no `--duration-*`
theme namespace, so `duration-[--dur]` compiles to the invalid `transition-duration: --dur`. Use
`transition-app`, or `duration-[var(--dur)]` if you must write it inline.)

**Why 120–160ms.** NN/g's range for UI animation is 100–500ms: ~100ms "feels immediate" and
creates the illusion of direct manipulation; 200–300ms is right for substantial screen changes;
past 400ms it is a large movement and past 500ms it "feels like a real drag"
([NN/g](https://www.nngroup.com/articles/animation-duration/)). A state change on a control is
the *immediate* end of that range, not the middle. 140ms is perceptible as a transition —
which is the point, it tells you the change was caused — without being waited on.

**Why one ease-out curve.** NN/g: ease-out is the most common and recommended, because it feels
responsive at the start and lets the eye settle on the resting element; linear motion reads as
unnatural. One curve across the whole app means motion never reads as a per-component decision,
which is the same consistency argument as the closed spacing set.

**Where it applies** — and this list is complete:

| target | property | duration |
|---|---|---|
| hover / press / focus on any control | `color`, `background-color`, `border-color`, `opacity` | `--dur` |
| disclosure open/close | `height`, `opacity` | `--dur` |
| row hover, row selected | `background-color` | `--dur` |
| hover-revealed row actions | `opacity` only | `--dur` |
| detail panel entering | `opacity` + 12px `x` | `--dur-enter` |
| dialog entering | `opacity` + `scale 0.98→1` | `--dur-enter` |
| toast / bulk bar entering | `opacity` + 8px `y` | `--dur-enter` |

12px and 8px are the travel budgets. A panel that flies 100px in reads as a page transition, which
it is not.

---

## 2. What NOT to animate

| do not animate | why |
|---|---|
| **list / row entrance** | see § 3 |
| **table re-sort reorder** | the user asked for a new order; animating 40 rows to their new positions means they must wait to read the answer, and FLIP on a virtualised list is a frame-rate problem you do not need |
| **filter re-query results** | same: the user is mid-query and wants the count |
| **numbers counting up** | a KPI that ticks from 0 to 1,204 is unreadable for the duration, and on a surface the user refreshes it is actively annoying |
| **layout of the toolbar** | chrome that moves is chrome the user cannot build muscle memory for |
| **page / route transitions** in an app shell | the user navigates dozens of times per session; a 300ms curtain is minutes per week |
| **skeleton → content crossfade** beyond opacity | any transform during the swap moves the target the user is already aiming at |
| **anything on a hot path** — the surface they hit forty times a day | the cost is multiplied by frequency; that is the whole calculus |

---

## 3. Why per-row stagger makes a list feel *slower*

The arithmetic. Twelve rows at a 40ms stagger plus a 140ms per-row transition:

```
last row finishes at  11 × 40ms + 140ms = 580ms
```

The user's sense of "loaded" is set by the **last** element to settle, not the first. So a list
whose data arrived in 90ms is perceived as taking ~600ms — a ~6× penalty, entirely self-inflicted.
Worse, the eye saccades to row 1 immediately and the rows below it are still moving in peripheral
vision, which reads as instability.

Stagger is a device for a **first impression**. A work surface has no first impression after day
one. Render the list; let it be there.

*(The stagger arithmetic is mine; NN/g supplies the duration ranges and the 500ms ceiling it
breaches, not this calculation.)*

The one acceptable per-row delay is an **ambient** one that does not gate arrival: the shimmer
phase offset on skeleton rows, capped at 4 rows so row 8 is not visibly later than row 1
(`SkeletonRows`).

---

## 4. Skeletons vs spinners — the thresholds

From Nielsen's three response-time limits — 0.1s (perceived as instantaneous, no feedback needed),
1.0s (the user notices but their thought process is uninterrupted), 10s (the limit of attention,
needs a percent-done indicator and a way to interrupt)
([NN/g](https://www.nngroup.com/articles/response-times-3-important-limits/)):

| expected duration | show |
|---|---|
| **<100ms** | **nothing.** A spinner that flashes for 80ms is worse than no spinner: it registers as a glitch. |
| **100ms – 1s** | keep the **old content**, dim it, and show one inline progress affordance at the top edge (`InlineRefreshing`). Do **not** blank a populated list to show skeletons — you are removing information the user already had. |
| **>1s, shape known** | **skeletons**: 3–8 rows, exactly the real row height. Carbon: use skeleton states rather than spinners when extra load time is expected. |
| **>1s, shape unknown** | a single indeterminate indicator in the region that will fill |
| **>10s** | **determinate** progress + a cancel control |

**The skeleton's only job is to hold the geometry.** If the skeleton row is 36px and the real row
is 40px, the content jumps 4px per row when it swaps — at the exact moment the user finally has
something to click. The skeleton must mirror the real column widths too, or it reads as a generic
loading state rather than *this* table arriving.

**Spinners still have a place**: inside a button that is submitting (the button keeps its size and
its focus, and announces busy — this is Geist's rule: pass a `loading` prop rather than swapping in
a spinner), and as the indeterminate case above. Not as a centred overlay on a list.

---

## 5. Optimistic UI

Apply the mutation locally, reconcile with the server in the background. Linear's speed is widely
attributed to exactly this — mutations apply locally first and reconcile after
([analysis](https://performance.dev/how-is-linear-so-fast-a-technical-breakdown)) — and it is the
only technique here that changes perceived latency by an order of magnitude rather than a few
percent.

**Three requirements. Missing any one makes it worse than a spinner:**
1. **A deterministic local id**, so the optimistic row can be reconciled with (or replaced by) the
   server's row without flickering into a duplicate.
2. **A rollback path.** On failure the local change is reverted *and* the user is told.
3. **A visible, non-blocking failure** — a toast with Retry, next to where the change appeared. The
   silent-revert version is the worst outcome in this document: the user believes they saved, and
   they did not.

**Use it when** the failure is recoverable by the same user in the same place — renames, status
changes, reordering, toggles, adding a comment.
**Do not use it when** the user will act on the result before the server confirms: a balance they
are about to transfer against, a permission they are about to rely on, a quota they are about to
spend. There, show the pending state honestly.

---

## 6. `prefers-reduced-motion`

**Reduce the travel, keep the feedback.** The common implementation mistake is killing transitions
wholesale, which often takes the hover and press colour changes with it — so the user loses the
feedback *and* the motion.

```css
@media (prefers-reduced-motion: reduce) {
  :root { --dur: 0.01ms; --dur-enter: 0.01ms; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Because every duration in the system is one variable, this is one place. NN/g's list of
motion-related accessibility hazards — parallax, auto-advancing carousels, scroll-jacking, hard
flashes — is a list of things a product surface should not have contained in the first place; the
skeleton shimmer is the only ambient animation in this system, and it stops here.

---

## 7. Announcing state changes to assistive tech

Motion communicates "something changed" to sighted users. The equivalent for everyone else is a
live region, and it is not optional — see `accessibility.md` § Announcing async state. One
`aria-live="polite"` status region per surface; `assertive` only for a genuine interruption.

---

## Sources

- [NN/g — Executing UX Animations: Duration and Motion Characteristics](https://www.nngroup.com/articles/animation-duration/)
- [NN/g — Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- [IBM Carbon — data table usage](https://carbondesignsystem.com/components/data-table/usage/) (skeletons over spinners)
- [Vercel Geist — Button](https://vercel.com/geist/button) (`loading` prop keeps the button focusable and announces busy)
- [Linear performance breakdown](https://performance.dev/how-is-linear-so-fast-a-technical-breakdown) (local-first mutations) — third-party analysis, not a Linear primary source

**Extrapolated:** the 140ms default and the specific curve, the 8px/12px travel budgets, the
per-row-stagger arithmetic, and the do-not-animate list.
