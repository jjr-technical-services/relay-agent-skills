---
name: build-cash-forecast
description: >-
  Build and run a 13-week direct-method cash flow forecast: opening cash from the bank, receipts by customer and aging using the user's own collection history, disbursements (payroll calendar, rent, vendor payment runs, taxes, debt service, capex), minimum cash buffer and covenant checks, weekly roll-forward with variance to actual, and scenarios and levers such as collections pushes, payment timing, and credit line draws. Includes a Python script that rolls weekly balances from dated flows and flags weeks below a minimum. Use when asked for a 13-week cash forecast, weekly cash flow, runway in weeks, liquidity planning, or a covenant check. Do not use for an annual operating budget (build-operating-budget), month-end close (run-month-end-close), or legal or insolvency advice.
license: MIT
---

# Build Cash Forecast

Build a 13-week cash forecast that treasury, the CFO, and lenders can act on: a week-by-week view of actual cash receipts and disbursements, starting from the bank balance, showing the lowest point, the buffer against a minimum, and the levers available if the buffer is breached. Then keep it honest by rolling it forward every week and comparing it to what actually cleared the bank.

The 13-week forecast uses the **direct method**: it lists cash in and cash out by source and payee. It is different from the **indirect method**, which starts from net income and adjusts for non-cash items and working capital changes (the method used in the statement of cash flows), and different from the **P&L**, which records revenue when earned and expenses when incurred, not when cash moves. Revenue booked in March may be collected in May; an annual insurance premium paid in January is expensed monthly. The forecast follows the cash.

## Inputs to gather

Ask for the following. Where an item is missing, use a clearly labelled placeholder (`[ASSUMED: ...]`), and list every placeholder at the top of the output so no one mistakes an assumption for a commitment.

- **Opening cash:** bank balances by account on the start date, from bank statements or online banking, not from the GL. Note restricted cash (deposits held as collateral, trust accounts) separately; it is not available.
- **Receivables:** AR aging by customer (current, 1-30, 31-60, 61-90, 90+ days), payment terms, and each large customer's actual payment behaviour from the last 6 to 12 months of receipts.
- **New billings:** expected invoices in the next 13 weeks from the billing schedule, contracts, or the sales forecast, with terms.
- **Payroll:** pay dates, net pay per run, employer taxes and their remittance dates, benefits, bonuses and commissions due, and planned hires or exits.
- **Fixed disbursements:** rent, leases, insurance, software subscriptions, loan principal and interest dates.
- **Vendor payments:** AP aging, payment-run days, and any vendor with special terms or overdue balances.
- **Taxes:** sales and indirect tax, payroll tax, income tax instalments, property tax, with due dates.
- **Capex and one-offs:** equipment purchases, deposits, legal settlements, fundraising or debt proceeds.
- **Financing:** credit line limit, amount drawn, availability (borrowing base if asset-based), covenants (minimum liquidity, minimum cash, fixed charge coverage), and reporting dates.
- **Minimum cash buffer:** the level the company will not go below, set by the CFO or board. If none exists, propose how to set one (for example, one payroll cycle plus fixed costs for a set number of weeks) and label it a proposal.

## Workflow

1. **Set the frame.** Start date (usually a Monday), 13 weekly buckets, the currency, and the entity or entities included. Intercompany cash moves inside the group are shown only if forecasting entities separately.
2. **Anchor opening cash** to bank balances on the start date. Remove restricted cash. List any receipts or payments already initiated but not cleared, so they are not double counted.
3. **Forecast receipts** by customer for the largest customers and by aging bucket for the rest, using collection patterns derived from the user's own receipts history. Add new billings with expected collection timing. Read `references/receipts-and-disbursements.md` for the collection-curve method, days-to-pay by customer, and how to treat disputes and credit risk.
4. **Forecast disbursements** by category from calendars and schedules: payroll dates, rent, loan payments, tax due dates, vendor payment runs from AP aging and new purchases, and capex. The same reference covers each category.
5. **Roll forward.** For each week: `Closing cash = opening cash + receipts - disbursements`, and the next week's opening equals this week's closing. Compare each week's closing to the minimum buffer and, if relevant, to covenant tests. Use `scripts/cash_forecast.py` to roll the weeks from a CSV of dated flows (see below).
6. **Test the buffer and covenants.** Identify the lowest week, the headroom against the minimum, and any week that breaks a covenant test. Covenants are defined in the credit agreement; use its definitions, not a generic one, and confirm with the lender or counsel when wording is unclear.
7. **Build scenarios and levers.** At least a base case and a downside case, with the downside built from named changes (a large customer pays three weeks late, a contract slips a month), not a flat percentage cut. List the levers and their cash effect by week. Read `references/scenarios-levers-and-variance.md`.
8. **Run the weekly cycle.** Each week, replace the first forecast week with actuals, add a new week 13, compare forecast to actual by category, explain the variances, and update assumptions that were wrong. The same reference covers the variance loop and accuracy tracking.

## Using the script

`scripts/cash_forecast.py` takes a CSV with columns `date`, `amount` (positive receipt, negative disbursement), and optional `category`, `direction`, and `scenario`. It buckets flows into weeks, rolls the balance, and flags weeks below the minimum.

```
python3 scripts/cash_forecast.py flows.csv --opening-balance 500000 --start-date 2026-01-05 --min-balance 150000
python3 scripts/cash_forecast.py flows.csv --opening-balance 500000 --start-date 2026-01-05 --min-balance 150000 --credit-available 250000 --min-liquidity 300000
python3 scripts/cash_forecast.py flows.csv --opening-balance 500000 --start-date 2026-01-05 --scenario downside --by-category
python3 scripts/cash_forecast.py flows.csv --opening-balance 500000 --start-date 2026-01-05 --actuals actuals.csv --out weekly.csv
```

Reading the output:

- Each row shows opening, receipts, disbursements, net, closing, and headroom versus the minimum (`vs min`). Negative headroom means the week is below the buffer and is flagged.
- With `--credit-available`, `liquidity` is closing cash plus the undrawn line; the script never assumes a draw. Model a planned draw as its own row with category "revolver"; the script then reduces undrawn credit by the drawn amount so the draw is not counted twice.
- Rows with a `scenario` tag apply only when that scenario is selected; untagged rows apply to every run. A downside row usually adjusts an existing base row, such as `-20000` with direction `in` to reduce a receipt in one week and a matching `+20000` in the later week it is expected.
- Flows dated before week 1 are excluded and reported; confirm they are already in the opening balance. Flows after week 13 are reported as outside the horizon.
- `--actuals` prints forecast versus actual by category and week for the weeks present in the actuals file.

## Common errors to catch

- **Starting from the GL cash balance.** The GL can lag the bank by uncleared items. Start from the bank and list items in transit.
- **Forecasting receipts on due dates.** Customers pay on their own patterns; use history.
- **Including non-cash P&L lines.** Depreciation, accrued bonuses not yet paid, and revenue recognised from deferred balances do not move cash in the week.
- **Missing lumpy items.** Annual insurance, quarterly tax instalments, annual software renewals, and the third biweekly pay date in a month are the usual surprises.
- **Double counting.** A payment initiated before the start date and still uncleared is either in the opening balance or in week 1, not both.
- **Treating the undrawn line as cash.** It is available only if the conditions to draw are met, including borrowing base and covenant compliance.
- **Letting the forecast go stale.** A 13-week forecast not rolled weekly loses its value within a few weeks.

## Worked illustration (hypothetical)

For illustration only, with round numbers: opening cash 100,000; minimum buffer 50,000. Week 1 receipts 40,000 and payroll 60,000 give closing 80,000. Week 2 receipts 30,000 and rent 20,000 give 90,000. Week 3 receipts 50,000 and payroll 60,000 give 80,000. Week 4 has a 15,000 vendor run and no receipts, giving 65,000. Week 5 receipts 25,000 and payroll 60,000 give 30,000, which is 20,000 below the buffer. In a downside where 20,000 of week 5 receipts slip, week 5 closes at 10,000, 40,000 below the buffer. The levers to consider are named in the scenarios reference, each with its week-by-week effect.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Summary
2. Weekly forecast table
3. Assumptions register
4. Scenarios
5. Levers
6. Variance to actual

Use these exact labels where they apply: "Opening cash", "Total receipts", "Total disbursements", "Net cash flow", "Closing cash", "Minimum buffer", "Headroom", "Undrawn credit", "Liquidity (cash + undrawn)" as row names in the weekly forecast table, and "Supplied", "Derived" or "Estimated" as the source of each assumption.

Write amounts in full units with thousands separators (1,250,000, not 1,250 or 1.25m), and percentages with a % sign. Never present amounts in thousands, including in tables, even with a note such as "all amounts in $000".

Variance to actual applies from week 2 onward; in a first forecast keep the heading and say there is no actual week yet.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

**1. Summary** — start date, opening cash, lowest closing week and amount, headroom versus minimum buffer, covenant status, and the three assumptions that matter most.

**2. Weekly forecast table**

| Line | Wk 1 | Wk 2 | ... | Wk 13 | Total |
|---|---|---|---|---|---|
| Opening cash | | | | | |
| Receipts: top customers (named) | | | | | |
| Receipts: other AR by aging | | | | | |
| Receipts: new billings | | | | | |
| Receipts: other (tax refunds, financing) | | | | | |
| Total receipts | | | | | |
| Payroll and benefits | | | | | |
| Rent and leases | | | | | |
| Vendor payment runs | | | | | |
| Taxes | | | | | |
| Debt service | | | | | |
| Capex | | | | | |
| Other | | | | | |
| Total disbursements | | | | | |
| Net cash flow | | | | | |
| Closing cash | | | | | |
| Minimum buffer | | | | | |
| Headroom | | | | | |
| Undrawn credit | | | | | |
| Liquidity (cash + undrawn) | | | | | |

**3. Assumptions register** — each assumption, its source (supplied data, derived from history, or estimate), owner, and sensitivity.

**4. Scenarios** — base and downside (and upside if asked), each defined by named changes, with lowest week and headroom.

**5. Levers** — action, cash effect by week, cost or risk, owner, and decision date.

**6. Variance to actual** (from week 2 onward) — forecast, actual, variance, cause, and whether the assumption was updated.

## Quality checks

- Opening cash equals bank balances on the start date, excluding restricted cash.
- Each week's opening equals the prior week's closing; totals foot across and down.
- Receipts are timed by collection behaviour, not by invoice due date, unless history shows customers pay on terms.
- No non-cash items (depreciation, accruals, stock compensation, revenue recognition entries) appear in the forecast.
- Payroll dates match the payroll calendar, including months with an extra pay date.
- Tax, rent, and debt payment dates match their schedules.
- Every assumption is labelled as supplied, derived, or estimated; placeholders are listed.
- Downside cases are built from named events, and levers show when the cash arrives or is saved.
- Covenant tests use the definitions from the user's credit agreement.
- Every calculation in examples and tables is rechecked.

## Boundaries

- Not legal or insolvency advice. If the forecast shows the company cannot meet obligations as they fall due, say so plainly, and recommend that leadership involve legal counsel and, where appropriate, a restructuring adviser promptly; directors may have legal duties that change in that situation, and those depend on jurisdiction.
- Does not interpret credit agreements; covenant definitions and waivers are for the lender and counsel.
- Does not decide which creditors to pay first when cash is short beyond laying out the options and their consequences; that decision rests with management and its advisers.
- Hands annual planning to build-operating-budget and month-end accounting to run-month-end-close. For retention inputs to long-range cash planning, use analyze-cohort-retention.
- The script reads only the files passed to it and writes only to the `--out` path when given.
