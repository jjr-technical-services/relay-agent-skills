# Reconciliation, scenarios, and cash

## Top-down targets versus bottom-up requests

- **Top-down**: leadership sets the envelope — revenue goal, margin or burn limit, headcount ceiling, minimum cash — derived from strategy, investor expectations, and funding.
- **Bottom-up**: each budget owner builds what their plan needs, line by line, from drivers.

Neither is correct alone. Top-down alone produces budgets owners do not believe; bottom-up alone produces a sum of wishes that rarely fits the envelope.

### Reconciliation process

1. **Issue guidance first**: the envelope, the priorities, and the planning assumptions every department must use (growth, pay increases, burden rates, currency rates). Shared assumptions prevent departments from building on different premises.
2. **Separate baseline from incremental**: each department shows its baseline (current run rate plus committed contracts) and each incremental ask separately.
3. **Tie asks to outcomes**: each incremental ask names the driver it moves (bookings, customers served, releases shipped, risk reduced), when the effect lands, and the consequence of not funding it.
4. **Size the gap**: sum of baseline plus asks versus envelope, in total and by department.
5. **Rank asks across departments**, not within them, using expected effect on the company's targets per unit of cost and the timing of the effect. A simple scoring or a leadership ranking session both work; record the criteria.
6. **Close the gap** with a combination of: declining low-ranked asks, deferring start dates (which lowers in-year cost but not run rate), changing scope, finding savings in the baseline (for example, contracts found in audit-saas-spend), or revisiting the envelope if the targets cannot be met with the funded plan.
7. **Check coherence**: if revenue assumes sales hires that were deferred, revenue must be lowered too. Re-run the model after every change.
8. **Log decisions**: funded, deferred (with the condition that would release it), declined (with reason).

Deferring hires is the most common gap-closer and the most commonly misread: it saves in-year cost but leaves next year's run rate unchanged. Show both effects.

## Scenario cases

Build scenarios by changing a small number of named drivers, not by applying a percentage to the whole P&L.

| Scenario | Typical driver changes | Purpose |
|---|---|---|
| Base | Plan drivers | The plan owners commit to |
| Downside | Lower new bookings or conversion, higher churn, slower hiring of revenue roles, later collections | Tests cash and covenant safety |
| Upside | Higher bookings, faster ramp | Tests what extra investment could be released and when |

For each scenario, pre-agree **triggers and actions**: the observable signal (for example, bookings below a set level for two consecutive months) and the response (freeze a list of hires, cut named discretionary programmes). Pre-agreed actions are what make a downside case useful.

The size of the downside should be grounded in the company's own history (the worst recent period, the forecast error of past plans), not an arbitrary percentage. State the basis.

## From profit to cash

Operating income is not cash. Build a monthly cash bridge:

```
Cash from operations = operating income
                     + non-cash expenses (depreciation, amortization, stock-based compensation)
                     − increase in receivables (+ decrease)
                     + increase in payables and accrued expenses (− decrease)
                     + increase in deferred revenue (annual billing collected upfront)
                     − increase in prepaid expenses (+ decrease)
Free cash flow       = cash from operations − capital expenditure − capitalized software costs
Ending cash          = starting cash + free cash flow + financing inflows (debt drawn, equity raised) − debt repayments
```

Key timing items: billing terms and collection days, annual customer prepayments, annual vendor prepayments, payroll timing, bonus and commission payout months, tax payments, and capital purchases.

### Runway

```
Net burn (month)   = cash out − cash in from operations (negative free cash flow)
Runway (months)    = (cash − minimum cash buffer) ÷ average forward monthly net burn
```

Use forward net burn from the plan, not the trailing average, when the plan changes spending. Better still, report the month in which cash falls to the minimum balance under each scenario. State whether undrawn credit facilities are counted and whether any covenants apply.

Illustrative (hypothetical): cash 6,000,000; minimum buffer 2,000,000; forward net burn 400,000 per month → runway to the buffer = (6,000,000 − 2,000,000) ÷ 400,000 = 10 months.

The 13-week, receipts-and-payments view of near-term liquidity belongs in build-cash-forecast; this plan's cash view is monthly and annual.
