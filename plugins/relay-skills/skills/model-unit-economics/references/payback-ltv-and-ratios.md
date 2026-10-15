# Payback, LTV, and LTV:CAC

## CAC payback

```
CAC payback (months) = CAC ÷ (monthly revenue per customer × gross margin %)
```

It answers: how many months of gross margin from a new customer does it take to recover what it cost to win them? It ignores churn, so it is optimistic whenever customers leave before the payback month.

Variants to state explicitly when used:

- **Revenue payback** (CAC ÷ monthly revenue) ignores the cost of delivery and flatters the result. Do not use it for decisions.
- **Contribution payback** uses contribution margin instead of gross margin. Use it for transactional businesses with large variable selling costs.
- **Churn-adjusted or cohort-observed payback**: the first month in which cumulative gross margin per originally acquired customer ≥ CAC. Because it counts customers who left as earning zero, it is the most honest measure. Prefer it when at least one cohort has been observed past the formula payback month.
- **Annual contracts paid upfront** change cash payback (cash arrives early) but not margin payback. Report both if the user cares about cash.

The payback period that is acceptable depends on the business's cash position, cost of capital, and churn. There is no universal threshold; present the payback and let the user compare it with their own tolerance (for example, "within the period for which we have cash runway and observed retention").

## LTV (customer lifetime value)

Simple churn-based formula for subscriptions:

```
LTV = ARPA × gross margin % ÷ monthly customer churn rate
```

This assumes churn is constant forever, no expansion or contraction, and no discounting. 1 ÷ churn is the implied average lifetime in months.

Why it is fragile:

- **Small churn explodes the number.** At 1% monthly churn the implied lifetime is 100 months (more than eight years). Few young businesses have observed any customer for that long.
- **Churn is rarely constant.** It is often higher in early months and lower for survivors, so a single rate mixes groups with different behaviour.
- **Short history makes churn uncertain.** Distinguishing 1% from 2% monthly churn needs many customer-months of data; with a small base the confidence interval covers both, and LTV differs by a factor of two.
- **Expansion changes everything.** Net revenue retention above 100% can make the formula meaningless (it would imply infinite value) if revenue churn is used naively.

Safer alternatives, in order of preference:

1. **Cohort-observed cumulative margin.** For each acquisition cohort, sum gross margin earned per originally acquired customer month by month. Report the value at 12, 24, and 36 months (or as far as data goes). This is observed, not modelled. Extend it only with a clearly labelled assumption for months not yet seen.
2. **Horizon-capped LTV.** Cap the lifetime at a horizon H the business is willing to count on:
   ```
   Capped LTV = ARPA × GM% × (1 − (1 − c)^H) ÷ c
   ```
   where c is monthly churn. State why H was chosen (contract terms, product life, observed history).
3. **Discounted LTV.** Add a monthly discount rate d: LTV = ARPA × GM% × Σ_{t=0}^{H−1} ((1 − c) ÷ (1 + d))^t. Use when the user has a cost of capital and wants value today.
4. **Revenue-retention LTV.** Replace customer churn with net revenue retention per cohort when expansion is material; model it as a cohort curve, not a single rate.

Decision rule: use cohort-observed margin wherever the history covers the decision horizon; use capped LTV for planning beyond observed history; show simple LTV only for comparison and with its caveats.

For transactional businesses, LTV = contribution margin per order × expected orders per customer over the horizon, where expected orders come from observed repeat purchase curves, not from an assumed purchase frequency.

## LTV:CAC

```
LTV:CAC = LTV ÷ CAC
```

A heuristic that compresses value created per acquisition dollar into one number. Treat it with care:

- It inherits every weakness of the LTV figure. A good ratio built on a fragile LTV is still fragile.
- It says nothing about timing: a ratio can look healthy while payback takes years and consumes cash.
- It is often quoted with a "healthy" threshold. Such thresholds are conventions without a universal basis; do not present any ratio as the target. Instead, show the ratio next to payback and cohort evidence and let the user judge against their cash and growth goals.
- A very high ratio can signal under-investment in acquisition rather than excellence; test whether marginal CAC at higher spend still pays back.

## Net revenue retention and gross revenue retention

- **Gross revenue retention (GRR)** = (starting recurring revenue − churned revenue − contraction) ÷ starting recurring revenue, for a fixed customer set over a period. Cannot exceed 100%.
- **Net revenue retention (NRR)** = (starting recurring revenue − churn − contraction + expansion) ÷ starting recurring revenue, for the same customer set.

Use them to explain why cohort margin curves rise or fall over time; detailed cohort analysis belongs in analyze-cohort-retention.
