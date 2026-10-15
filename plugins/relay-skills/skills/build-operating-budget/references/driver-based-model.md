# The driver-based model

A driver is an operational quantity that causes revenue or cost: customers, orders, sales reps, headcount, usage. Model each line as driver × rate, so the plan can be re-run when a driver changes and variances can later be explained as volume, rate, or timing.

## Structure

Keep three layers separate, ideally on separate sheets or tables:

1. **Assumptions**: every driver and rate, with owner, source, and scenario values. Nothing is typed directly into the calculation layer.
2. **Calculations**: monthly builds for revenue, headcount, non-headcount opex, COGS, and cash.
3. **Outputs**: P&L by month and department, headcount summary, cash and runway, scenario comparison.

## Revenue drivers

Choose the build that matches the business.

**Recurring revenue (subscription)**, per month:

```
Ending recurring revenue = starting recurring revenue + new + expansion − contraction − churn
Recognized revenue (month) ≈ average of starting and ending monthly recurring revenue
                             (or starting revenue plus a mid-month convention for new bookings)
```

State the convention; revenue recognition policy decides the detail.

New bookings from sales capacity:

```
New bookings (month) = ramped-equivalent quota-carrying reps × productivity per ramped rep
Ramped-equivalent reps = Σ reps × ramp factor by tenure month
```

The ramp schedule (for example, a new rep counted at a fraction of full productivity for the first several months) should come from the company's history; if none exists, label the schedule an assumption. Tie the sales hiring plan in the headcount sheet to this build so a hiring delay automatically lowers bookings.

**Pipeline-based alternative**: new bookings = pipeline created × win rate, lagged by the sales cycle. Use when capacity is not the constraint.

**Transactional**: revenue = traffic or leads × conversion rate × orders per customer × average order value, by month, with seasonality from history.

**Services**: revenue = billable headcount × available hours × utilization × realized rate.

Test the revenue build against history: does the implied productivity, win rate, or conversion match what the company has actually achieved? If the plan needs a rate never achieved before, flag it.

## Headcount plan: the main cost driver

For most companies headcount is the largest cost. Build it one row per person or planned role.

```
Fully loaded annual cost = base salary × (1 + burden rate) + variable pay + per-head costs not in the burden rate
Monthly cost             = fully loaded annual cost ÷ 12, from the start month
In-year cost             = monthly cost × months employed in the fiscal year
Annualized run rate      = fully loaded annual cost (the cost carried into next year)
```

Burden rate components to list separately: employer payroll taxes (which may have annual wage caps, so cost can be front-loaded in the year), health and other benefits, retirement contributions, workers' compensation or equivalent insurance, and per-head equipment, software and workspace. Use the company's actual rates by country; do not assume one rate fits all locations.

Other headcount mechanics:

- **Start month**: realistic start date after recruiting time and notice periods.
- **Merit and promotion increases**: apply in the effective month, not from January.
- **Variable pay**: commissions tied to bookings (link to the revenue build), bonuses accrued monthly at target unless policy says otherwise.
- **Recruiting costs**: agency fees, referral bonuses, relocation, one-time equipment, in the hire month.
- **Attrition and backfills**: expected departures create gaps (savings) and backfill costs (recruiting); model them only if history supports a rate, and show them as separate lines.
- **Contractors**: plan them in headcount or opex consistently; state which.

## Non-headcount opex by department

For each department, list lines by type:

| Type | Definition | Phasing method |
|---|---|---|
| Contractual | Committed contracts and subscriptions | Per contract dates, renewal months, price escalators |
| Variable | Cost driven by a driver (per head, per customer, per transaction) | Driver × rate by month |
| Discretionary | Programmes, events, travel, consulting | Month of planned activity |
| Fixed | Rent, insurance, audit fees | Per invoice or accrual pattern |

Per-head costs (software seats, equipment, travel allowance) should be linked to the headcount plan so they move with hires.

## COGS

Build COGS from delivery drivers so gross margin responds to volume:

- Hosting and infrastructure per unit of usage or per customer, with committed-spend agreements shown separately.
- Third-party services consumed per transaction or per customer.
- Payment processing as a percentage of collected revenue.
- Support, onboarding, and delivery staff from the headcount plan, allocated to COGS by role.

## Phasing

- Revenue follows the driver build and seasonality.
- Headcount follows start months; payroll taxes may follow wage-cap timing.
- Contracts follow invoice or service periods (expense recognition is not the same as cash payment for annual prepayments).
- Events and campaigns fall in their months.

A plan phased in even twelfths cannot be tracked monthly; variances will be timing noise.
