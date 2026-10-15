# Receipts and disbursements

## Receipts

### Split the customer base

- **Named customers:** the largest customers by open AR or expected billings (often the top 10 to 20, or those that make up most of receipts). Forecast each one individually by invoice, using its own payment behaviour.
- **Everyone else:** forecast by aging bucket with a collection curve.

### Customer-level timing

For each named customer, calculate from the last 6 to 12 months of receipts:

`Days to pay = receipt date - invoice date`, per invoice.

Use the median, and note the spread. If a customer's pattern is "pays on the last business day of the month after invoice" or "pays after a quarterly approval run", forecast on that pattern rather than an average number of days. Check with the account owner for known changes (new procurement process, dispute, change of ownership).

`Expected receipt date = invoice date + that customer's typical days to pay`, adjusted to the customer's known payment day.

### Collection curve for the rest

From history, for invoices raised in a given week or month, measure the share collected in each following week:

`Collection share in week j = cash received in week j from invoices raised in period p / total invoiced in period p`

Average several periods to get a curve (for example, share collected in weeks 1-2, 3-4, 5-6, 7-8, and never). Apply the curve to:

- open AR by aging bucket (use the part of the curve that remains for invoices of that age), and
- new billings expected in the forecast window.

Illustration only, hypothetical numbers: if history shows 10% of invoices collected in weeks 1-2, 50% in weeks 3-4, 30% in weeks 5-6, 8% in weeks 7-8, and 2% never, then 100,000 of new invoices in week 1 produces about 10,000 in weeks 1-2, 50,000 in weeks 3-4, 30,000 in weeks 5-6, and 8,000 in weeks 7-8, with 2,000 not collected. For an invoice already 30 days old and unpaid, rescale the remaining shares: the remaining curve beyond week 4 is 30% + 8% + 2% = 40%, so expected collection is 30/40 = 75% in weeks 5-6 relative to invoice date, 8/40 = 20% in weeks 7-8, and 5% not collected.

If the user has no receipts history, use invoice terms plus a stated delay, label it as an estimate, and replace it with actual behaviour after a few weekly cycles.

### Receipts adjustments

- **Disputed invoices:** exclude or push out until resolved; list them.
- **90+ days:** forecast only with specific evidence (payment plan, promise with a date).
- **Credit risk:** customers showing distress are forecast later or at a lower amount, with a note.
- **Card and payment processor receipts:** use the processor's payout schedule, net of fees, refunds, and reserves.
- **Other receipts:** tax refunds, asset sales, grants, equity or debt proceeds only when documented and dated; financing receipts are shown on their own line so operating cash is visible.

## Disbursements

### Payroll

- Use the payroll calendar. Weekly, biweekly, semi-monthly, and monthly schedules put a different number of pay dates in a 13-week window; biweekly schedules produce two months a year with three pay dates.
- Separate net pay (paid on pay date), employee withholdings and employer taxes (remitted on the tax authority's schedule, which may be days after pay date), and benefits (paid on insurer or provider invoice dates).
- Include bonuses, commissions, and severance on their plan payment dates, and planned hires from their start dates.
- If payroll is outsourced, the provider may debit the full funding amount one or more days before pay date; use the debit date.

### Rent, leases, and fixed costs

Rent and lease payments on contractual dates; insurance on premium schedule (note annual or quarterly lump sums); software and subscriptions from the vendor list, including annual renewals in the window.

### Vendor payment runs

- Start from AP aging: which bills fall due in each week under terms.
- Apply the company's payment-run days (for example, one run each Thursday); a bill due on Monday is paid in that week's run, or the next if the policy is to pay on or after due date.
- Add expected new purchases that will be billed and paid inside the window (usually from the budget or purchase orders), with the terms.
- List any vendor on special terms, cash in advance, or with overdue balances that must be caught up.

### Taxes

Sales and indirect tax (collected from customers, remitted on the filing schedule), payroll taxes, income tax instalments, property and other taxes, all by due date. The tax adviser confirms amounts and dates when uncertain.

### Debt service

Principal and interest on each facility by payment date; interest on a revolver based on drawn balance and the current rate; fees (commitment, unused line) on their billing dates. Covenant test dates are listed even if no cash moves.

### Capex and one-off items

Committed capex by payment milestone, deposits, legal settlements, and other non-recurring items with dates. Uncommitted capex belongs in a scenario, not the base.

## Direct vs indirect vs P&L: a reconciliation check

Once a month, reconcile the forecast's cumulative net cash flow for the month to the change in bank balance, and explain the difference from the P&L:

`Net income + non-cash expenses (depreciation, amortisation, stock compensation) - increase in receivables + increase in payables and accruals - increase in inventory and prepaids + increase in deferred revenue - capex +/- financing flows = change in cash`

This is the indirect method. It should agree with the direct-method total for the same period. A persistent gap means a category is missing from the direct forecast.
