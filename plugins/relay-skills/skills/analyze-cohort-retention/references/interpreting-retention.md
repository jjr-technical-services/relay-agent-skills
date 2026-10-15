# Interpreting retention

## Read the triangle three ways

1. **Across a row (one cohort over time):** the retention curve for that cohort. Look at where the steepest drop happens and whether the curve flattens.
2. **Down a column (all cohorts at the same age):** cohort-over-cohort comparison. This is the fair comparison because every value is at the same age.
3. **Along a diagonal (same calendar month):** values on a diagonal share a calendar month. A drop along one diagonal across many cohorts points to a calendar event (price change, outage, billing migration, seasonality, data gap) rather than a cohort-quality change.

## Curve shape

- **Early drop then flattening:** most customers who will leave do so early; those remaining are stable. The flattening point suggests where onboarding or first-value problems end. Investigate what the survivors did in the early months that leavers did not.
- **Steady decline with no flattening:** churn is not concentrated in onboarding; value may erode over time, or the product lacks lasting use. Look at usage trends and renewal reasons.
- **Step drops at regular intervals:** usually contract renewals (annual plans at months 12, 24) or billing-cycle effects. Split monthly and annual customers.
- **Curve rising above earlier points:** in the active view, reactivations; in NRR, expansion outpacing churn. Check which.
- **NRR rising while logo falls:** a smaller group of customers is expanding enough to offset those leaving. Healthy for revenue, but concentration risk grows; check how much of NRR comes from the largest customers.
- **GRR close to NRR:** little expansion. Growth depends on new customers.

"Flattening" should be judged on the pooled curve or on cohorts large enough to be stable, and over several consecutive offsets, not one.

## Cohort-over-cohort improvement

To claim newer cohorts retain better:

1. Compare at the same offset (down a column).
2. Use cohorts above the minimum size; group months into quarters if needed.
3. Look for a consistent direction across several cohorts and several offsets, not one cell.
4. Check whether the mix changed (more customers from a channel or segment that always retained better). If so, compare within segment before crediting a product or process change.
5. Tie any claimed cause to a dated event (onboarding change, pricing change, new sales qualification rule) and look for a break in the column at that date.

A rough check on noise for logo retention: the standard error of a proportion p from n customers is `sqrt(p x (1 - p) / n)`. For illustration only, at p = 0.8 and n = 25 this is `sqrt(0.8 x 0.2 / 25) = sqrt(0.0064) = 0.08`, or 8 percentage points. Two cohorts of that size differing by 5 points are within noise. Use this as a rough guide, not a formal test; for a formal comparison, a two-proportion test or survival analysis (Kaplan-Meier curves with a log-rank test) is the standard approach, and a data analyst should run it for high-stakes decisions.

## Segment cuts

Cut by attributes known at the start (plan, acquisition channel, company size, region, industry, sales-led vs self-serve, annual vs monthly billing). Avoid cutting by attributes that are consequences of retention (for example, "customers who used feature X in month 6", which only survivors can do); those comparisons are biased.

Run the script once per segment with `--segment-col` and `--segment-value`, then compare the same offsets. Watch segment sizes; a cut that produces cohorts of five is not informative.

## What to investigate

Turn each pattern into a testable question with named data:

| Pattern | Question | Data needed | Hand-off |
|---|---|---|---|
| Steep drop in months 1-3 | Do leavers fail to reach first value? | Onboarding milestones, activation events, support tickets in first 90 days | design-customer-health-score for leading indicators |
| One segment retains worse | Is it fit, price, or service? | Win reasons, discount levels, support volume by segment | develop-icp-and-uvp if fit is the issue |
| Diagonal drop | What happened that month? | Release notes, pricing changes, billing migration log, incident log | |
| NRR driven by few accounts | How concentrated is expansion? | Revenue change by customer, top-10 share | |
| Named large accounts at risk | Which accounts, and what is the save plan? | Account notes, usage, contacts | churn-risk-review prompt |
| Retention inputs for payback or LTV | What does retention imply for economics? | Gross margin, acquisition cost | model-unit-economics |

## Things not to say

- Do not quote external retention "benchmarks" as fact. If the user wants a comparison point, ask for one they trust and label its source; otherwise compare to their own history.
- Do not read a young cohort's short curve as a trend.
- Do not extrapolate a curve beyond observed offsets without labelling it a projection and stating the method (for example, holding the last observed month-over-month retention rate constant).
- Do not mix cohort-based and TTM figures in one comparison.
