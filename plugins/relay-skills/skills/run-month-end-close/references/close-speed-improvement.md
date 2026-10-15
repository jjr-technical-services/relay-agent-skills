# Close-speed improvement

A faster close comes from three moves: do work before month end, remove waiting between tasks, and replace manual steps with system-driven ones. Speed that comes from skipping review is not an improvement.

## Step 1: measure the current close

For the last two or three closes, record for each task: planned day, actual finish day, hours spent, and the reason for any delay (late input, rework, reviewer unavailable, system limit). Without this, improvement ideas are guesses.

Summarise:

- Actual lock day for each close.
- The critical path: the chain of dependent tasks that set the lock day.
- Hours by area.
- The top causes of delay by frequency and by days lost.

## Step 2: move work pre-close

Anything whose inputs exist before month end can run before month end. Common candidates:

- Reconcile bank and card accounts weekly or daily so month end handles only the last few days.
- Post recurring and standard entries (depreciation, prepaid amortisation, fixed monthly accruals) on BD-2 from schedules.
- Collect accrual inputs from budget owners before month end with a standing form.
- Agree intercompany balances mid-month and again at BD-1.
- Review and approve AP bills continuously so month end has few unapproved items.
- Pre-build flux templates with prior-period and budget columns filled.
- Run a "soft close" check mid-month on high-risk accounts.

## Step 3: remove waiting

- Put review on the calendar with named reviewers and times. Waiting for review is a frequent delay.
- Break large reconciliations into parts different people can do in parallel.
- Replace email chasing with a shared tracker where every task shows owner and status.
- Agree with budget owners and outside providers (payroll, outsourced bookkeeping) on fixed delivery days for their inputs.

## Step 4: automation candidates

Rank candidates by hours saved per close, error risk removed, and effort to implement. Typical candidates for small and mid-size teams (rank them with the user's own hours data):

| Candidate | What it replaces | Preconditions |
|---|---|---|
| Bank feeds with matching rules | Manual keying and matching of bank lines | Stable transaction descriptions; rules reviewed |
| Recurring and templated entries in the GL | Rebuilding the same entries monthly | Stable schedules for depreciation, prepaids, fixed accruals |
| Subledger integrations (billing, payroll, expense tools) | Summary entries keyed by hand | Clean mapping of subledger codes to GL accounts |
| Auto-reversing accruals | Manual reversal entries | Accrual process that flags reversing items |
| Reconciliation workflow tool or structured workbook | Scattered spreadsheets without sign-off | Account list with risk ratings and owners |
| Revenue schedule automation | Spreadsheet revenue waterfalls | Contracts captured with consistent fields |
| Purchase orders with receipt matching | Hunting for unbilled receipts | Buyers use purchase orders consistently |

Do not recommend a specific vendor unless the user asks and names the systems they have. Automating a broken process moves the error faster; fix the process design and mapping first.

## Step 5: set a target and a path

- Set the next target one or two business days earlier than the current actual, not the eventual goal. Repeatable beats fast once.
- For each close, pick the two or three changes that shorten the critical path. A change off the critical path saves hours but not days.
- Track the lock day, the number of post-close adjustments, and the count of reconciliations with aged items. A faster close with more post-close adjustments is not better.

## Quality guardrails while speeding up

- Keep preparer and reviewer separation.
- Keep the reconciliation of every balance-sheet account; you may change frequency of deep review for low-risk accounts, but record the decision.
- Keep evidence standards for entries; an automated entry needs a documented rule and periodic review of that rule.
