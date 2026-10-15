# Close calendar and cutoff

## Business-day notation

- **BD-n**: the nth working day before month end. BD-1 is the last working day of the month.
- **BD+n**: the nth working day after month end. BD+1 is the first working day of the new month.
- Count only working days in the finance team's location. Publish the calendar with real dates for the next twelve months so public holidays are visible in advance.

State the target close as "books locked on BD+n". Do not state it as "close in n days" without saying whether the count starts at month end or at BD+1.

## Building the calendar

1. List every recurring task from the last close, including informal ones people do from memory.
2. For each task, record: owner, reviewer, input it needs, who provides the input, output it produces, and which later tasks depend on it.
3. Draw the dependency chain. The critical path is usually: bank and subledger cutoff, then subledger close (billing, AP, payroll), then accruals and allocations, then reconciliations, then flux review, then sign-off. Anything not on that chain can move earlier or run in parallel.
4. Assign each task the earliest day its inputs exist. A task that waits for no month-end data belongs in pre-close.
5. Place review on the calendar as its own task with its own day. Close calendars that list only preparation routinely slip at review.
6. Leave buffer before sign-off. A calendar where every task finishes on the last possible day has no room for a single late input.

## Template calendar (starting point, adjust to the company)

This is a common shape for a single-entity company closing on BD+6 to BD+8. It is a starting template, not a benchmark; replace days with what the user's team can actually meet.

| Day | Typical tasks |
|---|---|
| BD-3 | Send accrual input requests to budget owners; confirm payroll dates and amounts for the period; review open purchase orders and goods-received-not-invoiced list; agree intercompany balances to date; reconcile bank activity to date |
| BD-2 | Post recurring entries prepared in advance (depreciation from the fixed asset register, prepaid amortisation, standard accruals); review AP for unapproved bills; confirm billing run schedule |
| BD-1 | Final billing run; cutoff checks on shipments or service delivery; last AP entry for the period; notify the team of cutoff times |
| BD+1 | Download bank statements; reconcile cash; close AP and AR subledgers; post payroll and benefits accruals |
| BD+2 | Revenue recognition review and deferred revenue roll-forward; accruals from budget-owner inputs; inventory count results or roll-forward (if applicable) |
| BD+3 | Intercompany eliminations and settlement entries; fixed asset additions and disposals; allocations |
| BD+4 | Balance-sheet reconciliations completed by preparers |
| BD+5 | Reconciliation review; first flux pass on income statement and balance sheet |
| BD+6 | Flux explanations reviewed; controller review of material entries |
| BD+7 | Final adjustments; approval; period lock |
| BD+8 to BD+10 | Management reporting pack, board pack, lender reporting |

## Cutoff procedures

Cutoff means each transaction lands in the period in which it occurred under the company's policy. Procedures by area:

- **Revenue and receivables:** confirm the billing run includes all services delivered or goods transferred in the period and excludes those after. For product companies, compare shipping records for the last and first few days around month end to invoices. For subscription companies, confirm new contracts and changes signed near month end have the correct service start dates.
- **Purchases and payables:** review invoices received in the first days of the new month for goods or services received in the old month; accrue them. Review the goods-received-not-invoiced report.
- **Payroll:** accrue wages earned but unpaid at month end (days worked after the last pay date), employer taxes on those wages, and any bonus or commission earned under the plan terms. Use the payroll calendar, not an estimate, where the dates are known.
- **Cash:** deposits in transit and outstanding cheques are reconciling items on the bank reconciliation, not reasons to move a transaction into another period.
- **Inventory:** freeze movements at the count time or apply a documented roll-forward from the count date to month end.

Record the cutoff test performed and its result in the checklist. A cutoff procedure with no evidence did not happen.

## Owners and separation of duties

- Every task has one owner. "Finance team" is not an owner.
- The reviewer must be different from the preparer. In a two-person team, the controller or an outside accountant reviews; where that is impossible, record a compensating control such as a monthly review of all manual entries by the business owner.
- The person who posts cash disbursements should not also reconcile the bank account without an independent review.

## Multi-entity and foreign currency notes

- Agree intercompany balances between entities before BD+1 where possible. Differences found after close are expensive.
- Set a single rate source and time for month-end foreign exchange rates and write it into the calendar.
- Consolidation, eliminations, and currency translation form their own tasks with their own day, after the entity closes.
