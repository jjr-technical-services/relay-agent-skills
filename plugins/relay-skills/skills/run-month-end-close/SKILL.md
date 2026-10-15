---
name: run-month-end-close
description: >-
  Run, document, and speed up a month-end close for a small-to-mid-size company: a business-day close calendar (BD-3 to BD+10) with owners, pre-close and cutoff procedures, the core checklist (cash and bank reconciliations, AR and AP subledger ties, revenue recognition review, accruals, prepaids, fixed assets, payroll, intercompany, deferred revenue roll-forward, inventory), journal entry review standards, balance-sheet reconciliations, flux analysis against user-set thresholds, sign-off and lock, and a faster-close plan. Use when asked to build a close checklist or calendar, reconcile accounts, review journal entries, run a flux review, or shorten the close. Do not use to explain one budget variance (budget-variance-explainer), for a 13-week cash forecast (build-cash-forecast), or for accounting-standard opinions.
license: MIT
---

# Run Month-End Close

Turn a month-end close into a repeatable, owned, evidenced process: every balance-sheet account reconciled to support, every journal entry supported and reviewed, every material fluctuation explained, and the period locked on a known business day. Then make the next close faster by moving work earlier and removing manual steps. The skill runs the process and produces the working documents; it does not decide how an accounting standard applies to a transaction. Those judgements go to the controller and, where relevant, the external auditor.

## Inputs to gather

Ask for these first. When an input is missing, proceed with a clearly labelled placeholder (`[ASSUMED: ...]`) and list every placeholder in an "Open items" section so nothing is mistaken for fact.

- **Entity facts:** number of legal entities, functional currencies, accounting system (general ledger, or GL), subledgers in use (billing, AP, payroll, fixed assets, inventory), basis of accounting (accrual under US GAAP, IFRS, or another framework), and fiscal calendar.
- **People:** who prepares, who reviews, who approves; the size of the finance team; any outsourced bookkeeping or payroll provider.
- **Current state:** the business day the books close today, the last close's pain points, open audit findings or management letter comments, and any existing checklist.
- **Policies the user already has:** revenue recognition policy, capitalisation threshold, accrual threshold, materiality or review thresholds, depreciation methods and useful lives, intercompany settlement rules. Never invent a policy; if one is missing, flag it as a gap for the controller to set.
- **Reporting deadlines:** board pack, lender covenant reporting, investor updates, tax filings that depend on close.
- **Data for the specific close (if running one now):** trial balance for current and prior periods, subledger reports, bank statements, and the list of manual entries.

## Workflow

1. **Frame the close.** Confirm the period, entities, target close day, and who signs off. State the target as a business day (BD), where BD+1 is the first working day after month end. If the team has no target, propose one from the current state and the work volume, labelled as a proposal.
2. **Build the close calendar.** Lay out tasks from BD-3 (pre-close) to the lock day, each with an owner, a reviewer, a due day, and a dependency. Read `references/close-calendar-and-cutoff.md` when building or revising the calendar, setting cutoff rules, or sequencing dependencies.
3. **Run pre-close and cutoff.** Before month end, clear what does not depend on the final day: reconcile bank activity to date, chase unapproved bills, confirm payroll dates, collect accrual inputs from budget owners, review open purchase orders, and agree intercompany balances with the other entities. Apply cutoff procedures so revenue and expenses land in the correct period.
4. **Work the core checklist.** For each area (cash, AR, AP, revenue, accruals, prepaids, fixed assets, payroll, intercompany, deferred revenue, inventory, equity, tax provisions if the team handles them), perform the procedure, post supported entries, and reconcile the balance. Read `references/close-checklist-and-reconciliations.md` for the procedure by area, the reconciliation template, and the tie-out rules.
5. **Apply journal entry standards.** Every manual entry needs a preparer, a reviewer who is not the preparer, a description a stranger can follow, support attached, and a reversal flag where relevant. Read `references/journal-entries-and-flux.md` when setting entry standards, review levels, or reviewing a batch of entries.
6. **Reconcile the balance sheet.** Every balance-sheet account gets a reconciliation: GL balance, supporting balance, difference, explanation of reconciling items, age of each item, preparer and reviewer sign-off. Unexplained differences are not "rounding" unless they are below a threshold the controller set in advance.
7. **Run flux analysis.** Compare the income statement and balance sheet to prior month, same month last year, and budget or forecast. Use the thresholds the user sets (an absolute amount and a percentage, both required). Explain each line above threshold with a cause and evidence, not a restatement of the number. Read `references/journal-entries-and-flux.md` for the flux method and explanation standard.
8. **Review, sign off, and lock.** The controller reviews reconciliations, material entries, and flux explanations; the approver signs; the period is locked in the GL so no further entries post without a documented reopen. Record late adjustments as post-close entries with approval, not by reopening quietly.
9. **Retrospective and speed plan.** After each close, log what ran late and why. Read `references/close-speed-improvement.md` when the user wants a faster close, fewer manual entries, or an automation roadmap.

## Checklist quick reference

Use this table to confirm coverage; the procedures sit in `references/close-checklist-and-reconciliations.md`.

| Area | Tie-out that proves completeness | Independent support |
|---|---|---|
| Cash and bank | Adjusted bank balance = adjusted book balance | Bank and processor statements |
| Accounts receivable | Aging total = AR control account | AR aging, cash receipts |
| Accounts payable | Aging total = AP control account | AP aging, vendor statements |
| Accruals | Each accrual traced to support; prior accruals trued up | Invoices received after month end, budget-owner confirmations |
| Revenue | Recognised revenue = revenue schedule or subledger | Contracts, billing records |
| Deferred revenue | Opening + billings - recognised +/- adjustments = closing | Contract schedule |
| Prepaids | Opening + additions - amortisation = closing | Prepaid schedule, invoices |
| Fixed assets | Cost and accumulated depreciation roll-forwards tie to GL | Asset register, purchase invoices |
| Payroll | Register = GL expense; liabilities = later remittances | Payroll provider reports |
| Intercompany | Counterparty balances agree; eliminations net to zero | Intercompany statements |
| Inventory | Perpetual subledger = GL; count adjustments posted | Count sheets, cost reports |
| Debt and leases | Principal and interest tie to lender and lease schedules | Lender statements, lease schedule |
| Suspense and clearing | Zero, or every item explained | Item listing |

## Running a close that is already in progress

When the user arrives mid-close rather than asking for a design, do not rebuild the whole process. Instead:

1. Ask for the trial balance, the checklist status (or a list of what is done), and the lock date that was promised.
2. List what is still open by area, and mark which open items sit on the critical path to the lock day.
3. Triage reconciling differences by size and age. Unexplained differences above the controller's threshold block sign-off; smaller ones are logged with an owner and a date.
4. Run the flux review on the current numbers even if reconciliations are incomplete; flux often points to the missing entry faster than the reconciliation does.
5. Tell the user plainly whether the promised lock day is still achievable, what would have to be true for it to be, and which items would move to a post-close adjustment if it is not.

## Common failure patterns to look for

- **Reconciliations that only restate the GL.** A reconciliation that uses the GL itself as the support proves nothing. Support must be independent: a bank statement, a subledger, a lender statement, a contract schedule.
- **Aged reconciling items carried forward.** Items that roll from month to month without clearing often hide an error or a write-off decision nobody has made. Age them and escalate past the controller's limit.
- **Accruals that never true up.** If last month's accrual is always far from the invoice that replaces it, the estimate method is wrong. Compare and fix the method.
- **Review compressed into the last day.** When preparation runs late, review gets squeezed. Protect review time on the calendar.
- **Undocumented judgement.** A reserve, allowance, or revenue treatment changed without a memo is an audit finding waiting to happen. Record the facts, the policy applied, and who approved.
- **Suspense accounts that never reach zero.** Clear them every close or explain each item.

## Worked illustration (hypothetical)

For illustration only, with round numbers: a company with a flux threshold of "greater than 10,000 and greater than 10%" sees software expense move from 50,000 to 62,000. The change is 12,000 and 24%, so both tests are met and the line needs an explanation. Rent moving from 100,000 to 108,000 is 8,000 and 8%, so it passes without explanation. A travel line moving from 2,000 to 5,000 is 150% but only 3,000, so it passes the combined test; the controller may still ask about it, and the team should decide in advance whether the rule is "both" or "either".

## Output

Produce the pieces the user asked for; for a full close setup, produce all of them in this order.

**1. Close summary** — period, entities, target BD, actual BD (if a close was run), status (open, in review, locked), open items.

**2. Close calendar**

| Day | Task | Area | Owner | Reviewer | Depends on | Evidence produced | Status |
|---|---|---|---|---|---|---|---|

**3. Close checklist** — grouped by area, each line with procedure, owner, due BD, and sign-off columns.

**4. Balance-sheet reconciliation register**

| Account | GL balance | Supporting balance | Difference | Reconciling items (age) | Preparer / date | Reviewer / date | Status |
|---|---|---|---|---|---|---|---|

**5. Journal entry log** — entry number, date, description, amount, preparer, reviewer, support reference, recurring or one-off, auto-reverse (yes/no).

**6. Flux analysis**

| Line | Current | Comparison | Change | Change % | Over threshold? | Explanation (cause and evidence) | Follow-up |
|---|---|---|---|---|---|---|---|

**7. Sign-off and lock record** — who signed, when, the lock date, and any post-close adjustments.

**8. Speed plan** (when asked) — current BD, target BD, tasks moved pre-close, automation candidates ranked by hours saved and risk reduced.

**9. Open items and assumptions** — every placeholder and every judgement referred to the controller or auditor.

## Quality checks

Run these before answering:

- Every task has one named owner and a reviewer who is a different person; flag where a small team cannot separate duties and suggest a compensating review.
- Every balance-sheet account on the trial balance appears in the reconciliation register; none is marked reconciled with an unexplained difference above the stated threshold.
- AR, AP, fixed assets, and deferred revenue subledgers tie to the GL control accounts, or the difference is listed.
- The deferred revenue roll-forward and the fixed asset roll-forward both foot: opening + additions - releases or disposals = closing.
- Flux explanations name a cause and evidence; "timing" or "increase in activity" alone is rejected.
- Thresholds, capitalisation limits, and useful lives are the user's own; any placeholder is labelled.
- Calculations in examples and tables are rechecked.
- No statement says how a standard applies to a specific contract; such questions are listed for the controller.

## Boundaries

- Does not give accounting-standard opinions (for example, whether a contract has one or several performance obligations, whether a lease is operating or finance, or how to treat a complex equity instrument). Document the facts and route the question to the controller and, where material, the external auditor.
- Does not replace tax advice. Income tax provisions, sales tax nexus, and payroll tax filings go to the tax adviser.
- Does not explain a single budget variance in narrative form; hand that to the budget-variance-explainer prompt. Does not build the 13-week cash forecast; hand that to build-cash-forecast. Budget construction belongs to build-operating-budget.
- Does not approve its own work. The output is a working paper for human preparers and reviewers; sign-off remains with named people.
- If the user asks to change a posted entry in a locked period, describe the reopen control and approval needed rather than advising a direct change.
