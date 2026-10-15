# Scenarios, levers, and the variance loop

## Minimum cash buffer

The buffer is the level management will not plan to go below. It covers timing errors in the forecast and unexpected payments. Ways practitioners set it, in increasing order of rigour:

1. **Fixed cost cover:** enough cash for a set number of weeks of payroll plus fixed costs.
2. **Largest-week cover:** the largest single week of disbursements in the horizon (often a payroll week with rent or a tax payment).
3. **Forecast-error based:** once several weeks of variance history exist, the buffer covers the largest (or a high percentile of) cumulative negative variance seen over a few weeks.

Whichever is used, the CFO or board sets the number; the forecast only tests against it. Covenant minimums are separate and come from the credit agreement.

## Covenant checks

Common covenant forms (use the user's agreement for exact definitions):

- **Minimum liquidity:** unrestricted cash plus undrawn committed availability at or above a stated amount, sometimes tested at all times, sometimes at month end.
- **Minimum cash:** unrestricted cash alone at or above a stated amount.
- **Borrowing base:** availability on an asset-based line equals eligible receivables and inventory times advance rates, less reserves; the eligible amounts change weekly with AR, so availability is forecast too.
- **Financial ratios (fixed charge coverage, leverage):** measured from the financial statements, usually quarterly; the 13-week forecast flags the test dates and the cash items that feed them, while the ratio calculation follows the agreement.

Show each test on the week it applies, with the headroom.

## Building scenarios

A scenario is a set of named changes to base-case assumptions, each with dates and amounts:

| Change | Example (hypothetical) | Effect |
|---|---|---|
| Customer pays late | Largest customer pays 3 weeks later than pattern | Receipt moves from week 4 to week 7 |
| Contract slips | New contract starts one month later | Billings and receipts move out by four weeks |
| Collection rate drops | Weeks 3-4 collection share falls from 50% to 40% | Receipts shift to later weeks and more goes uncollected |
| Cost arrives early | Annual software renewal billed in week 2, not week 9 | Disbursement moves earlier |
| One-off payment | Legal settlement paid in week 6 | New disbursement |

Avoid flat haircuts ("receipts minus 10%") as the only downside; they hide which customer or event drives the risk. A flat sensitivity can be shown in addition, labelled as such.

With the script, tag scenario rows in a `scenario` column and run once per scenario. Untagged rows form the base and apply to all runs.

## Levers

For each lever, show: action, cash effect by week, cost or risk, owner, lead time, and decision date.

| Lever | How it moves cash | Cost or risk to note |
|---|---|---|
| Collections push | Call top overdue customers; ask for payment on agreed dates | Relationship strain; results take effect after the customer's next payment run |
| Early payment discount offered | Customers pay sooner for a discount | Discount is a real cost; compute the annualised cost before offering |
| Invoice faster | Bill on delivery or milestone without delay | Needs clean billing data |
| Vendor payment timing | Pay on due date rather than early; agree extended terms | Supplier relationship; late fees; stricter terms later |
| Defer discretionary spend | Pause hiring, travel, uncommitted capex | Operating impact |
| Draw on credit line | Borrow against the undrawn committed line | Interest and fees; borrowing base and conditions to draw; covenant effect |
| Asset sale or sale-leaseback | Converts an asset to cash | Longer-term cost; takes time to execute |
| Equity or new debt | New funding | Dilution or cost; long lead time |

The annualised cost of an early payment discount, for terms "d% if paid within a days, otherwise net n days":

`Annualised cost = (d / (100 - d)) x (365 / (n - a))`

Illustration only: a 2% discount for paying in 10 days instead of 30 costs `(2 / 98) x (365 / 20) = 0.0204 x 18.25 = 0.372`, about 37% a year. Compare with the cost of the credit line before offering or accepting such terms.

Do not recommend withholding payments owed to tax authorities or employees to manage cash; those carry legal consequences. If the base case shows the company cannot meet obligations, state it and recommend legal counsel.

## The weekly variance loop

Each week, after the week closes:

1. Replace week 1 forecast with actual bank activity by category.
2. Compare forecast to actual by category: `Variance = actual - forecast`, with positive meaning more cash than forecast (more receipts or lower disbursements).
3. Classify each material variance:
   - **Timing:** the cash moved to another week inside the horizon; move it, do not remove it.
   - **Permanent:** the amount changed (lower collection, a price change, a cost not previously known).
   - **Error:** a missing or duplicate item in the forecast.
4. Update the assumption that caused it (a customer's payment pattern, a collection curve, a vendor's terms).
5. Drop the completed week, add a new week 13, and reissue.
6. Track accuracy over time: for each week, the forecast made one, four, and eight weeks earlier versus the actual. Report the cumulative variance and the largest misses. Improving accuracy is the justification for a smaller buffer; worsening accuracy is a reason to widen it.

Use the script's `--actuals` option with a CSV of actual flows (same columns) to produce the forecast-versus-actual table by category and week.

## Cadence and governance

- Update weekly on a fixed day, after bank balances for the prior week are final.
- The CFO or controller reviews and signs off before distribution.
- Keep a dated copy of each version so accuracy can be measured.
- When the forecast feeds lender reporting, use the lender's template and definitions, and keep the internal version reconcilable to it.
