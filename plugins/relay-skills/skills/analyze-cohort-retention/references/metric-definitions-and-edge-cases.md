# Metric definitions and edge cases

## Notation

- Cohort c: customers whose first active month is month c.
- N_c: number of customers in cohort c.
- A_c(k): customers from cohort c active in month c + k.
- R_i(t): recurring revenue run-rate of customer i in month t (zero if inactive).
- R_c(0) = sum over i in c of R_i(c): the cohort's starting revenue.

## Logo retention

`Logo retention_c(k) = |A_c(k)| / N_c`

Also called customer retention or logo survival. Logo churn for the step is `1 - (|A_c(k)| / |A_c(k-1)|)` when measured month over month.

Two conventions exist and give different numbers when customers return after a gap:

- **Active view** (the script's `--mode active`): a customer counts in any month it is active. The curve can rise when customers come back.
- **Survival view** (`--mode survival`): a customer counts only until its first inactive month. The curve never rises.

Decision rule: use the survival view when the question is "how long do customers stay continuously", or when reactivation is rare. Use the active view when the business has seasonal or intermittent buyers (for example, customers who pause subscriptions) and the question is "what share of the cohort is paying at month k". Report which one you used; run both when reactivation is material.

## Net revenue retention (NRR)

Cohort-based:

`NRR_c(k) = sum over i in c of R_i(c + k) / R_c(0)`

Also called net dollar retention (NDR). It includes expansion (upgrades, added seats, price increases), contraction (downgrades), and churn. It excludes revenue from customers who are not in the starting group.

## Gross revenue retention (GRR)

`GRR_c(k) = sum over i in c of min(R_i(c + k), R_i(c)) / R_c(0)`

GRR measures revenue kept from the starting base without credit for expansion. Two ways to compute it appear in practice:

- **Per-customer cap (used by the script and recommended):** each customer contributes at most its starting revenue. Expansion at one customer cannot offset contraction at another.
- **Component method:** `GRR = (starting revenue - churned revenue - contraction revenue) / starting revenue`, where churn and contraction are summed from month-over-month movements. When computed from the same two endpoints (month 0 and month k), this gives the same result as the per-customer cap. When contraction and churn are summed across every intermediate month, a customer who contracts and later re-expands is counted as lost revenue, so the component method gives a lower number.

Decision rule: compare periods only with the same method, and state it. For a board metric, compute from the two endpoints of the window with per-customer capping unless the company's published definition says otherwise.

By construction, GRR is at most 100% and at most NRR.

## Cohort-based vs trailing-twelve-month (TTM) NRR

TTM NRR as of month t:

`TTM NRR(t) = sum over i in S of R_i(t) / sum over i in S of R_i(t - 12)`, where S is every customer active in month t - 12.

TTM GRR applies the same per-customer cap.

Differences from cohort NRR:

- TTM mixes customers of every age. A base dominated by young customers (who often churn more early) reads differently from one dominated by mature customers, even if no cohort's behaviour changed.
- TTM changes each month as the base changes; cohort values are fixed once observed.
- A cohort's month-12 NRR describes one start group; TTM NRR describes the whole customer base over the last year.

Neither is wrong. Use cohort views to see whether behaviour is improving for newer customers; use TTM for a single company-level figure over a year. Label which one any reported figure is.

Some teams compute NRR over a window by using the start-of-window ARR and end-of-window ARR of the same customers; that is the same as the TTM formula when the window is twelve months.

## Edge cases

### Reactivations

A customer who leaves and returns stays in its original cohort. It does not form a new cohort. In the active view it counts again when it returns; its revenue counts in NRR and, capped, in GRR. In the survival view it is lost at the first gap. If the business routinely sees returns (seasonal buyers), consider also reporting a "returned" count per cell; the script prints the number of reactivated customer-months in active mode.

### Mid-month starts and proration

A customer starting on the 20th may show a partial first-month charge. Using that partial charge as the base inflates NRR at month 1. Fixes, in order of preference:

1. Use the contracted MRR run-rate rather than the billed amount (the recommended input to the script).
2. If only billed amounts exist, use the first full month as the revenue base and state that month-0 revenue was excluded.

Logo retention is unaffected by proration.

### Plan changes, seat changes, and migrations

Upgrades and downgrades are expansion and contraction, not churn and new sales. Make sure the customer ID is stable across plan changes. If the billing system issues a new subscription ID on migration, map subscriptions to a customer ID first; otherwise each migration shows as a churn plus a new customer in a later cohort.

### Multiple products or subscriptions per customer

Aggregate to the customer (or account) level before building cohorts. A customer who cancels one of two products is contraction, not churn.

### Annual and multi-year contracts

Convert contract value to a monthly run-rate spread over the service term. Annual customers can only churn at renewal, so their logo curve is flat within the year and drops at months 12, 24, and so on. Analyse annual and monthly customers as separate segments when both exist.

### Currency

Convert revenue at a constant rate (for example, the budget rate) for retention analysis, so exchange movements do not look like expansion or contraction. State the rate used.

### Pauses, credits, and discounts

A paused customer with zero revenue is inactive for revenue retention. Whether it is active for logo retention depends on the active rule the user chose. Temporary discounts reduce revenue and show as contraction then expansion; note known promotions next to the cohorts they affect.

### Small cohorts

A cohort of 10 customers moves 10 percentage points for every customer lost. Mark cohorts below a minimum size (the script default is 20, a working heuristic; set it from the user's volumes and tolerance) and avoid trend claims that depend on them alone. Options: group months into quarterly cohorts, use the pooled row, or show the count alongside the percentage.

### Right-censoring

Cohorts started recently have not reached later offsets. Their missing cells are unknown, not zero. When comparing cohorts, compare at the same offset only. The pooled row at offset k includes only cohorts that have reached k.

### Pooled rows

The pooled logo value at offset k is customer-weighted across cohorts that have reached k; the pooled NRR and GRR are starting-revenue-weighted. A simple average of cohort percentages gives small cohorts too much influence; avoid it.
