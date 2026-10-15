# Data preparation

The script expects one row per customer per month of activity. Most source data does not arrive in that shape. This file covers the conversions and the checks that catch the errors most likely to distort retention.

## From a subscription or billing export

Typical export: one row per subscription with start date, end date (blank if active), plan, and recurring amount, plus a change log.

1. Map subscription IDs to a stable customer ID.
2. For each subscription, expand to one row per month from start month to end month (or the latest complete month if still active). Use the contracted monthly amount for that month from the change log.
3. Sum subscriptions for the same customer and month.
4. Decide whether the end month counts as active. Common rule: a subscription is active in a month if it was active on the last day of that month. Write down the rule; apply it consistently.

## From invoices

1. Remove one-time fees (setup, implementation, hardware), taxes, and pass-through charges unless the user wants total revenue retention.
2. Spread each recurring invoice over its service period. An annual invoice of 12,000 for a year becomes 1,000 per month for twelve months.
3. Treat credit notes as reductions in the months they relate to, not the month they were issued, when the service period is known.
4. Sum by customer and month.

## From transactions (non-subscription businesses)

For e-commerce, marketplaces, and usage businesses:

- "Active" is usually "at least one order (or usage above a floor) in the period". Monthly periods may be too short for infrequent buyers; run the script with `--period-length 3` to group calendar quarters (offsets then count quarters, labelled P0, P1, ...), or `--period-length 12` for years. Caveat: with grouped periods, revenue is summed within each period, so a customer who starts part-way through their first quarter or year has a partial starting revenue. That understates the base and inflates NRR in the next period. Either count cohort revenue from the first full period, or state this bias next to the NRR figures.
- Revenue is period revenue, not a run-rate. NRR and GRR then describe spend retention, which is noisier. Say so in the output.
- Reactivation is normal; use the active view as the main result and show survival as a secondary view.

## Checks before running

| Check | How | Why it matters |
|---|---|---|
| Duplicate customer IDs for one customer | Search for customers with the same name or domain and different IDs | Creates false churn and a false new cohort |
| Months with no data at all | Count rows by month; look for sudden drops to near zero | A data gap looks like mass churn |
| Negative or zero revenue rows | Filter revenue <= 0 | Refunds or credits distort NRR; zero rows affect the active rule |
| Partial current month | Confirm the latest month is complete | An incomplete month looks like churn; use `--as-of` to stop at the last complete month |
| Test or internal accounts | Filter by known internal domains or flags | Inflates retention |
| Currency | Check for multiple currencies | Exchange moves look like expansion or contraction |
| Customer-level aggregation | Confirm one row per customer per month after summing | Multi-product customers otherwise double count |

## Column mapping for the script

The script accepts different column names:

```
python3 scripts/cohort_retention.py export.csv --customer-col account_id --period-col month --revenue-col mrr
```

Periods may be YYYY-MM or YYYY-MM-DD (the day is ignored). Amounts may include commas, a leading currency sign, or parentheses for negatives.

## Output file

`--out results.csv` writes a long-format table (one row per cohort and offset) with active count, reactivations, logo retention, revenue, NRR, and GRR. Use it to chart curves or load into a spreadsheet. The script writes nothing else.
