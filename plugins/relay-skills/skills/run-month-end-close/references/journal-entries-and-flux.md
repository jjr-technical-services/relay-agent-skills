# Journal entries and flux analysis

## Journal entry support standard

Every manual journal entry carries:

1. **Description** a reviewer who did not prepare it can follow: what happened, which period, why this account. "To record accrual" is not enough; "Accrue March legal fees for contract review, per law firm's work-in-progress email of 2 April" is.
2. **Support** attached or referenced: invoice, contract, calculation workbook, subledger report, email confirmation. Calculations show inputs, formula, and source of each input.
3. **Preparer and reviewer**, different people, with dates.
4. **Classification:** recurring (same accounts each month, amount may vary), standard (templated, formula-driven), or non-standard (one-off or judgemental).
5. **Reversal flag:** accruals that will be replaced by an invoice next month auto-reverse on day one of the next period. Record the reversal date.
6. **Balance:** debits equal credits, entity and period are correct, and no entry posts to a control account (AR, AP, fixed assets) that is maintained by a subledger unless the entry is a documented reconciling adjustment.

## Review levels

Set review depth by risk, using thresholds the controller writes down in advance. A common structure:

| Entry type | Reviewer | What the reviewer checks |
|---|---|---|
| Recurring, below threshold | Senior accountant | Support exists, amount consistent with prior months |
| Recurring, above threshold | Controller | Recalculate, compare to support and prior month |
| Non-standard, any amount | Controller | Support, accounting basis, whether it needs auditor discussion |
| Entries to revenue, equity, or reserves | Controller and approver | Policy basis, documentation of judgement |
| Entries posted after the lock | Controller and approver | Reason for late posting, reopen approval |

Replace the roles and thresholds with the user's. Where the finance team is one or two people, a monthly review of the full manual entry list by the owner or an outside accountant is the compensating control.

## Reviewing a batch of entries

When reviewing entries the user supplies, check each for:

- Missing or vague description.
- Missing support, or support that does not agree to the amount.
- Same person as preparer and reviewer.
- Round-number entries without a calculation (not wrong by itself, but ask for the basis).
- Entries posted to suspense or clearing accounts that are not cleared by month end.
- Accruals with no reversal and no invoice match next month.
- Entries dated in a closed period.
- Unusual account pairs (for example, a debit to revenue with a credit to cash).

Report findings as a table: entry number, issue, risk, and the fix required.

## Flux analysis

Flux (fluctuation) analysis compares balances between periods to find errors and explain movements before results go to management.

### Comparisons

Run at least:

- Current month vs prior month (catches missing or duplicate entries).
- Current month vs same month last year (catches seasonality misread as change).
- Current month or year-to-date vs budget or forecast (for the management pack; hand narrative explanation of a single variance to the budget-variance-explainer prompt).
- Balance sheet: current month end vs prior month end.

### Thresholds

The user sets both an absolute threshold and a percentage threshold. Calculate:

`Change = current - comparison`

`Change % = change / |comparison|` (undefined when the comparison is zero; treat any non-zero change from zero as over threshold)

Decide in advance whether a line needs explaining when it breaches **both** tests (fewer, larger items; common for income statement lines) or **either** test (more coverage; common for small balances that should be stable). Record the rule with the thresholds. Scale thresholds to the size of the line: a single threshold across revenue and a small expense line either floods reviewers or hides errors in large lines.

If the user has no thresholds, do not invent them as policy. Offer a placeholder clearly marked `[ASSUMED]` and ask the controller to confirm.

### Explanation standard

A flux explanation names:

1. **Cause:** the business event (new hire in engineering in the month; annual insurance renewal; price increase effective on a date; a customer's one-off order).
2. **Quantification:** how much of the change the cause explains. If several causes, list each with its amount; the parts should add up to the change or leave a stated unexplained remainder.
3. **Evidence:** payroll register, contract, invoice, or subledger report.
4. **Expectation:** whether the change will recur, reverse, or is permanent.

Reject: "timing", "higher activity", "per GL", or a restatement of the numbers. "Timing" is acceptable only when it names the item and the period it moves to.

### Using flux to find errors

Look for: a recurring expense missing this month or present twice; an accrual that reversed with no replacement invoice; revenue and deferred revenue moving in inconsistent directions; payroll expense out of line with headcount change; depreciation changing without asset additions or disposals; balance-sheet accounts that should be stable (deposits, long-term debt) moving without a known event.

## Sign-off and lock

- Sign-off record: preparer and reviewer on every reconciliation; controller on the flux review and material entries; approver (CFO, owner, or delegate) on the close as a whole.
- Lock the period in the GL on the calendar day. Reopening requires a named approver and a written reason, and the change is logged.
- Adjustments found after lock are posted in the next open period when immaterial under the company's policy, or through a documented reopen when not. The materiality judgement belongs to the controller.
