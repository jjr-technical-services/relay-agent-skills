# Flows — forms, validation, destructive actions, and the state set

Runtime: `assets/MultiStepFlow.tsx` (wizard + `Disclosure`), `assets/FormField.tsx`,
`assets/ConfirmDialog.tsx`, `assets/UndoToast.tsx`, `assets/EmptyState.tsx`.

---

## 1. Multi-step forms

**The test for whether you need steps at all** — both must hold
([NN/g](https://www.nngroup.com/articles/wizards/)):

1. a real **order dependency**: the system needs step 2's answer to know what step 3 should ask;
2. the user is a **novice at this task, or does it rarely** — setup, migration, onboarding, a
   quarterly filing.

If neither holds, **one long form with labelled sections wins.** An expert doing this weekly wants
the whole shape visible and wants to tab through it. The tell that you got this wrong: a support
request asking for a bulk/CSV path to create the thing your wizard creates.

**Rules, each with its reason:**

| rule | why |
|---|---|
| **≤5 steps** | past five, "Step 7 of 9" reads as a cost estimate and abandonment climbs. Group into named phases instead. |
| **steps named by outcome** — "Connect your warehouse", not "Configuration" | NN/g: use short descriptive labels, not generic ones. A named outcome lets the user predict the work remaining. |
| **forward locked until the step validates** | NN/g: don't let users pick a step before completing the ones before it — otherwise the wizard's ordering promise is a lie and step 4 asks questions step 2 should have answered. |
| **back is always free and lossless** | the only reason users tolerate steps is that they can check what they said. Clearing data on back turns a review into a redo. |
| **save and resume** | NN/g: let users exit midway, save state, and resume. Real setup flows get interrupted; without this, interruption means starting over. |
| **each step self-sufficient** | NN/g: a step should not require information from elsewhere in the app. If it does, the user leaves the flow and loses it. |
| **a review step when submit is irreversible or costly** | it is the last cheap place to catch a mistake, and it is where you restate what is about to happen in the user's own values. |
| **focus moves to the new step's heading** | without it, a keyboard user is left focused on a button that changed meaning, and a screen-reader user is told nothing happened. |

---

## 2. Progressive disclosure

Show the frequently-needed options; defer the rest behind one obviously-labelled control
([NN/g](https://www.nngroup.com/articles/progressive-disclosure/)). It improves three of the five
usability components at once — learnability, efficiency, and error rate — and NN/g notes users
build *better* mental models when features are prioritised than when everything is shown.

**Two decisions, per NN/g:** which features are on the initial display (the frequently needed
ones), and making the progression mechanism obvious and clearly labelled.

**Three rules the pattern lives or dies by:**

1. **A collapsed section that can hold a validation error must open itself and take focus.**
   Otherwise the user is told the form is invalid and cannot see where. `Disclosure` does this.
2. **Give the collapsed section a summary at rest** — `Advanced · 3 rules, 1 exclusion`. Without
   it the user must open it to learn whether they care, which is the cost disclosure was meant to
   avoid.
3. **Never hide a required field.** If it is required, it is frequently needed by definition.

**Staged vs progressive** (NN/g's distinction): staged = a linear task sequence, each step
revealing what is used at that step — that is the wizard. Progressive = hierarchical, the user
reaches for the advanced thing when they want it. Do not mix: a wizard step with three collapsed
"advanced" panels has two competing models of what is next.

---

## 3. Validation timing

```
onBlur    → raise the first error
onChange  → CLEAR an existing error. Never create one.
onSubmit  → cross-field rules + server truth, then focus the first invalid control
```

**Why on-blur and not while typing.** Validation on blur — after the user finishes with the field
— is the long-standing NN/g position, and the reason is behavioural: premature errors read as
accusation and *increase* error rates rather than reducing them, because the user reacts to the
message before they have finished the entry. NN/g's own wording of the goal is that inline
validation "reduces interaction cost… by allowing them to fix errors immediately, without
searching" ([NN/g](https://www.nngroup.com/articles/errors-forms-design-guidelines/)).

**Why on-change clears.** Once a field is in error the user is actively fixing it, and live
feedback at that point rewards the fix instead of nagging. Asymmetry is the whole trick: slow to
accuse, fast to forgive.

**Success indicators only where they carry information** — username availability, password
strength. A green tick on "First name" is noise (NN/g recommends them for intricate fields
specifically).

---

## 4. Error message rules

Each rule below maps to a specific NN/g guideline:

- **Below or adjacent to the field.** It minimises working-memory load: the user can see the
  message *while* fixing the error.
- **Wired through `aria-describedby`**, and `role="alert"` on the message so it is announced when
  it appears.
- **Never in a tooltip.** Alert icons are hard to notice and a hover-only message is missed
  entirely — and does not exist at all on touch.
- **Never colour alone.** Icon + text + colour. Red at 4.5:1 is necessary and not sufficient.
- **Say what is wrong *and* what is accepted.** "Enter an email address in the form
  name@company.com" beats "Invalid email". The validators in `FormField.tsx` all do this.
- **Never clear the user's input.** Re-typing a long value because one character was wrong is the
  fastest way to lose a form completion.
- **A summary at the top of the form only *in addition to* inline messages** — NN/g: summaries
  alone force users to search and memorise.
- **After a failed submit, focus the first invalid control** (`focusFirstInvalid()`). A summary the
  user has to hunt through is the failure the summary was meant to fix.
- **After three identical failures, offer a way out** — contact support, an alternative path. NN/g
  treats repeated identical errors as a signal of a design defect, which it usually is.

---

## 5. Destructive actions: undo first, confirm when earned

**Default to undo.** NN/g's position is that designers should *"go to great lengths to provide
undo"*, and that confirmation dialogs should be reserved for actions with serious consequences
([NN/g](https://www.nngroup.com/articles/confirmation-dialog/)).

**Why undo beats confirm for routine deletes.** A dialog taxes every *correct* action in order to
catch the rare wrong one, and the tax is paid in click-through: users learn to dismiss dialogs,
including the one that mattered. NN/g says it directly — do not use confirmation dialogs for
routine actions, because overuse makes users ignore them. Undo taxes nothing and still recovers
the mistake.

**Confirm is genuinely required when any of these hold** (`needsConfirm()` in the asset):

| condition | example |
|---|---|
| irreversible — no undo path exists | permanently purging records |
| affects other people before the actor could undo | revoking access, sending |
| costs money, quota, or a rate-limited external call | provisioning, bulk email |
| blast radius is a whole resource, not a row | deleting a workspace, a production database |

**When you do confirm, four rules:**

1. **Restate the object by name and count.** "Are you sure?" gets a reflex click; NN/g's point is
   that vague confirmations prompt automatic clicking. "Delete 12 members from Acme?" gets read.
2. **Label the buttons with outcomes, not Yes/No** — `Delete 12 members` / `Keep them`. NN/g:
   provide response options that summarise what will happen for each response. Yes/No forces the
   user to re-read the question to decide which button they want.
3. **Initial focus on the safe control.** A destructive default turns a stray Enter into data loss.
4. **Type-to-confirm only for whole-resource actions.** Used more widely it is friction theatre,
   and users paste the name straight out of the dialog.

**Undo toast rules** (`UndoToast.tsx`):
- 8s window — *extrapolated*; no source gives a number. It sits between Nielsen's 10s attention
  limit and the point where the user has moved on.
- **Do not start the countdown before the request settles**, or Undo can fire against a delete that
  has not happened.
- **Pause on hover and on focus-within.** A user reaching for Undo must not lose it mid-reach.
- One **polite** live region for the whole stack — the user caused this, so it is a status, not an
  alert; and per-toast live regions talk over each other.
- **If undo is not possible, do not show an Undo toast.** "Deleted" with no action is a
  notification and belongs at lower prominence.

---

## 6. The required state set

Eight states. A list surface ships all of them or it ships bugs — and the two most commonly
merged are the two that need the most different responses.

| state | trigger | what it must do |
|---|---|---|
| **first-run** | never had data | teach what will appear here + **one** primary action |
| **loading** | first fetch | see `motion.md` § 4 — skeletons only past 1s |
| **populated** | the happy path | |
| **no-results** | filters/search exclude everything | name the query, offer **Clear filters** — *not* "create your first…" |
| **partial** | some sources loaded, some failed | show what loaded, flag what did not, offer retry for just that part |
| **error** | the request failed | what failed, what the user can do, Retry. `role="alert"`. |
| **no-permission** | data exists, this user cannot see it | say who can grant it. Never "something went wrong" |
| **cleared** | the user emptied it themselves | confirm success + Undo |

**The structural rule for empty states in a table** — Carbon states it and the reason is specific:
the empty state **replaces the element that would ordinarily show, column headers included**,
because otherwise a screen reader reads the entire empty table before reaching the message saying
there is nothing in it ([Carbon](https://carbondesignsystem.com/patterns/empty-states-pattern/)).
Geist puts it structurally: render the empty state *outside* the table, not as an empty `<tbody>`.

**Copy rules for empty states**, from Carbon:
- Phrase the title as a positive where honest — "Start by adding data assets" over "You don't have
  any data assets".
- Explain the next action and, where it helps, the benefit of taking it.
- **One** primary action. Carbon: don't cover multiple options in one empty state; pick the most
  important. Two primary buttons means you have not decided what the user should do.
- Left-align the block. Centred text on a product surface reads as marketing and gets skipped.
  (Carbon's one exception: a small tile centres the *image* above left-aligned text, so the state
  does not get mistaken for content.)
- Where several empty states can appear at once (a dashboard of widgets), drop to tertiary buttons
  and text-only states — repeated illustrations lose their impact and add noise.
- **Never a dead end.** If there is a useful next step, it is in the empty state.

**Partial is the state everyone forgets.** Three widgets load, one 500s. The wrong answers are: an
error page for the whole surface (you threw away three working widgets) and silence (the user reads
a chart as complete when it is not). The right answer is per-region failure with a retry scoped to
the region.

---

## Sources

- [NN/g — Wizards](https://www.nngroup.com/articles/wizards/)
- [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [NN/g — Error-Message Guidelines for Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- [NN/g — Confirmation Dialogs Can Prevent User Errors](https://www.nngroup.com/articles/confirmation-dialog/)
- [NN/g — Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- [IBM Carbon — Empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [Vercel Geist — Table](https://vercel.com/geist/table) (empty state outside the table; destructive button ↔ toast pairing)

**Extrapolated:** the ≤5-step limit, the 8s undo window, the eight-state list as a required set,
and the three-identical-failures escape hatch as a concrete number.
