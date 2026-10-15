# Close checklist and balance-sheet reconciliations

Each area lists the procedure, the evidence it produces, and the tie-out that proves it is complete. Where the procedure requires the company's policy (revenue, capitalisation, useful lives, accrual thresholds), use the user's policy; if there is none, record the gap for the controller.

## Cash and bank

- Reconcile every bank, card, payment processor, and petty cash account to the statement balance at month end.
- Bank reconciliation form, two sides that must agree:
  - `Adjusted bank balance = statement balance + deposits in transit - outstanding payments +/- bank errors`
  - `Adjusted book balance = GL balance + bank credits not yet recorded (interest, direct customer deposits) - bank charges not yet recorded (fees, returned payments)`
- Items on the book side are posted to the GL this period, not left as reconciling items. After posting, the GL balance equals the adjusted bank balance.
- Age every reconciling item. Items older than a threshold the controller sets are investigated and cleared, not carried forward indefinitely.
- Payment processor accounts: reconcile gross sales, fees, refunds, chargebacks, and payouts; the payout received in the bank should equal the processor balance movement.

## Accounts receivable

- Tie the AR aging report total to the AR control account in the GL.
- Review unapplied cash and credit balances; reclassify material customer credit balances to liabilities if the policy says so.
- Review the allowance for expected credit losses using the method in the company's policy. Document the inputs (aging buckets, specific reserves, history used). The method choice belongs to the controller.

## Accounts payable and accruals

- Tie the AP aging total to the AP control account.
- Build the accrual list from: goods received not invoiced, budget-owner confirmations, contracts with fixed monthly fees not yet billed, professional fees for work performed, utilities, and usage-based vendor charges.
- Each accrual needs support: a quote, contract, usage report, email confirmation from the budget owner, or a documented estimate method. Record whether it auto-reverses next month.
- Compare last month's accruals to the actual invoices received this month. Large repeated differences mean the estimate method needs changing.

## Revenue recognition review

- Apply the company's written revenue policy. Under ASC 606 and IFRS 15 the five steps are: identify the contract, identify the performance obligations, determine the transaction price, allocate the price to the obligations, recognise revenue when (or as) each obligation is satisfied. The close checks that billing and recognition follow the policy already set; it does not decide how the policy applies to a new or unusual contract.
- Review new contracts, amendments, and cancellations in the period. List any with non-standard terms (multiple elements, variable consideration, refund rights, bill-and-hold, significant discounts, usage-based pricing, implementation services) and route them to the controller.
- Reconcile recognised revenue to the billing or revenue subledger and to the deferred revenue roll-forward.

## Deferred revenue roll-forward

`Opening deferred revenue + billings in period - revenue recognised from deferred balance +/- adjustments = closing deferred revenue`

- Tie the closing balance to the GL and to the subledger or contract schedule.
- Explain adjustments individually (cancellations, credit notes, reclassifications).
- Where billings are recorded before the invoice is due and unpaid, follow the company's policy on whether to present the related receivable and deferred revenue gross or net.

## Prepaid expenses

- Maintain a schedule: vendor, total paid, service period, monthly amortisation, balance remaining.
- `Opening + additions - amortisation = closing`, tied to the GL.
- Items below the company's prepaid threshold can be expensed when paid if the policy allows.

## Fixed assets and depreciation

- Additions: review expense accounts and AP for purchases over the capitalisation threshold; capitalise per policy.
- Disposals: remove cost and accumulated depreciation; record the gain or loss.
- Depreciation: straight-line is `(cost - residual value) / useful life in months` per month. Use the useful lives in the company's policy.
- Roll-forward: `Opening cost + additions - disposals = closing cost`; `Opening accumulated depreciation + depreciation - disposals = closing accumulated depreciation`. Tie both to the GL.
- Construction in progress: confirm nothing placed in service is still sitting in construction in progress.

## Payroll and benefits

- Reconcile the payroll register to GL wage expense and to cash paid.
- Accrue unpaid wages for days worked after the last pay date: `daily gross pay for the period x unpaid working days`, plus employer taxes and benefits on that amount.
- Accrue earned bonuses and commissions under the plan terms, paid time off if policy requires, and benefit invoices not yet received.
- Reconcile payroll liability accounts (withholdings, benefits payable) to the amounts remitted after month end.

## Intercompany

- Each entity confirms its balance with each counterparty. Differences are investigated before consolidation.
- Eliminate intercompany revenue, expense, receivables, and payables in consolidation; the eliminations should net to zero.
- Settle balances on the schedule in the intercompany agreement. Transfer pricing questions go to the tax adviser.

## Inventory (if applicable)

- Reconcile the perpetual inventory subledger to the GL.
- Apply count results or cycle-count adjustments; investigate large shrinkage.
- Review the reserve for slow-moving or obsolete items using the policy method.
- Confirm cost of goods sold matches the relieved inventory for shipments in the period.

## Other balance-sheet areas

Debt (tie to lender statements, accrue interest), leases (tie to the lease schedule), equity (tie to the cap table and board approvals), income and indirect tax balances (tie to returns and provisions from the tax adviser), and suspense or clearing accounts (should be zero or fully explained at month end).

## Balance-sheet reconciliation template

Use one per account, every month, for every balance-sheet account including zero-balance accounts that had activity.

| Field | Content |
|---|---|
| Account number and name | |
| Period end | |
| GL balance | from the trial balance |
| Supporting balance | from the statement, subledger, or schedule named below |
| Support source | bank statement, aging report, roll-forward schedule, lender statement |
| Difference | GL balance - supporting balance |
| Reconciling items | description, amount, date originated, age in days, expected resolution date, owner |
| Unexplained difference | must be zero or below the controller's written threshold |
| Preparer and date | |
| Reviewer and date | a different person |
| Risk rating | high, medium, low; drives review depth and frequency |

Risk-rate accounts so review effort goes where errors are likely: high for accounts with judgement, high volume, or past errors (revenue, deferred revenue, accruals, inventory); low for stable accounts with little activity. Low-risk accounts may be reviewed less deeply but are still reconciled.
