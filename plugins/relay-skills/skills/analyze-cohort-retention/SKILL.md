---
name: analyze-cohort-retention
description: >-
  Build and interpret cohort retention analysis from a CSV of customers, subscriptions, or transactions, with a bundled Python script: a logo retention triangle and, when revenue is present, gross revenue retention (GRR, capped at 100%, excludes expansion) and net revenue retention (NRR, includes expansion) by cohort, plus trailing-twelve-month NRR. Handles reactivations, mid-month starts, plan changes, and small cohorts, then reads curves for flattening, cohort-over-cohort improvement, and segment differences. Use when asked for a cohort analysis, retention curve or triangle, NRR or GRR, or whether newer customers retain better. Do not use for churn risk on named accounts (churn-risk-review), a customer health score (design-customer-health-score), or unit economics (model-unit-economics).
license: MIT
---

# Analyze Cohort Retention

Show how groups of customers who started in the same period behave over time, measured consistently, so the user can tell whether retention is improving, where it breaks, and what to investigate. The skill builds the triangles, states the definitions used, checks the data for the traps that make retention numbers wrong, and interprets the result without overstating what small or young cohorts can show.

## Inputs to gather

- **The data:** a CSV with one row per customer per period of activity. Minimum columns: `customer_id` and `period` (YYYY-MM). Optional: `revenue` (recurring revenue for that month, as a run-rate) and a segment column (plan, region, acquisition channel, company size band).
- **What "active" means for this business:** paying subscription in the month, at least one order in the month, or usage above a floor. The definition changes the numbers; write it down.
- **Revenue basis:** monthly recurring revenue (MRR) or annual recurring revenue (ARR) run-rate, excluding one-time fees, usage overages if the user wants recurring-only, taxes, and refunds processed as separate lines. Invoiced amounts on annual plans must be converted to a monthly run-rate first.
- **Cohort definition:** first paid month (default), contract start date, or signup month. Free trials and free plans are usually excluded from the start date unless the user tracks free-to-paid separately.
- **Segments of interest** and any known events (pricing change, product launch, sales motion change) with dates.
- **The decision the analysis feeds:** board metric, forecast input, investigation of a drop, or comparing segments.

When an input is missing, proceed with a labelled assumption (`[ASSUMED: active = revenue > 0 in the month]`) and list it in the output.

## Workflow

1. **Confirm definitions before computing.** Agree what counts as active, which revenue is included, and the cohort start rule. Read `references/metric-definitions-and-edge-cases.md` for the exact formulas and the handling of reactivations, mid-month starts, plan changes, multi-product customers, currency, and small cohorts.
2. **Prepare and check the data.** One row per customer per month; duplicate rows are summed. Check for customers whose IDs change on plan migration or merge (these create fake churn and fake new cohorts), months with no rows at all (data gaps, not churn), negative revenue lines, and annual invoices not spread monthly. Read `references/data-preparation.md` when the data comes from billing exports, transaction logs, or a CRM.
3. **Run the script.** Use `scripts/cohort_retention.py` to build the triangles:

   ```
   python3 scripts/cohort_retention.py activity.csv --min-cohort-size 30
   python3 scripts/cohort_retention.py activity.csv --mode survival
   python3 scripts/cohort_retention.py activity.csv --segment-col plan --segment-value pro
   python3 scripts/cohort_retention.py activity.csv --period-length 3 --out results.csv
   ```

   It prints a logo retention triangle, NRR and GRR triangles against each cohort's month-0 revenue, a pooled row (all cohorts combined, weighted by size or starting revenue), and a trailing NRR and GRR as of the latest month. Run with `--help` for all options.
4. **Read the output correctly.** Blank cells are months a cohort has not reached yet, not zero retention. Cohorts marked `*` are below the minimum size and should not drive conclusions alone. `active` mode counts reactivated customers again; `survival` mode stops counting a customer at its first gap. Report which mode was used, and run both when reactivation is common.
5. **Interpret.** Look at the shape of each curve, compare cohorts at the same age, compare segments, and separate logo from revenue behaviour. Read `references/interpreting-retention.md` for the reading method, the questions to investigate, and the statistical cautions.
6. **Reconcile to reported metrics.** If the user reports an NRR figure elsewhere, state whether it is cohort-based or trailing-twelve-month, and why the two can differ. Recompute using the user's definition before comparing.
7. **Write findings and next steps.** Findings must cite the triangle cells they rest on. Investigation suggestions must name the data needed to test them.

## Reading the script output

| Output line | What it means | What to do with it |
|---|---|---|
| `Latest month observed` | The last month in the data, or the `--as-of` month | Confirm it is a complete month; if not, rerun with `--as-of` set to the prior month |
| Cohort row with `*` | Cohort smaller than `--min-cohort-size` | Report it, but do not base a trend on it; consider `--period-length 3` |
| Blank cell | The cohort has not reached that age | Never treat as zero; compare cohorts only at offsets all of them reached |
| `pooled` row | Customer-weighted (logo) or starting-revenue-weighted (NRR, GRR) across cohorts that reached each offset | Use as the headline curve; note that later offsets include fewer, older cohorts |
| `Trailing N-month retention` | TTM NRR and GRR on customers active N months before the latest month | Report separately from cohort values and label it |
| `Reactivated customer-months` | Returns after a gap counted in active mode | If material, rerun with `--mode survival` and show both |

## Common mistakes to avoid

- **Using billed revenue with annual prepayments.** A customer paying annually shows revenue in one month and zero in eleven, which reads as churn and reactivation. Convert to a monthly run-rate first.
- **Letting new subscriptions of existing customers form new cohorts.** Aggregate to the customer before running.
- **Averaging cohort percentages.** Use the pooled row, which weights by size or revenue.
- **Calling an incomplete month churn.** Stop at the last complete month.
- **Treating NRR above 100% as proof of healthy retention.** Check GRR and logo retention; strong expansion from a few accounts can hide broad churn.
- **Comparing a board NRR with a cohort NRR without checking both definitions.**

## Definitions (summary)

For a cohort that starts in month 0, at month offset k:

- **Logo retention_k** = customers from the cohort active at k / customers in the cohort at 0.
- **NRR_k** (net revenue retention) = revenue at k from the cohort's customers / revenue at 0 from the same customers. Includes expansion, contraction, and churn. Can exceed 100%.
- **GRR_k** (gross revenue retention) = sum over customers of min(revenue at k, revenue at 0) / revenue at 0. Each customer is capped at its starting revenue, so expansion never offsets churn or contraction. Cannot exceed 100%.
- **Trailing-twelve-month (TTM) NRR** = revenue now from customers who were active twelve months ago / their revenue twelve months ago. It mixes cohorts of every age and moves with the customer mix, so it is not comparable to a cohort's month-12 value.

The full formulas, the per-customer capping rule, and the edge cases are in `references/metric-definitions-and-edge-cases.md`.

## Worked illustration (hypothetical)

For illustration only: a cohort of 4 customers each paying 100 in month 0 (400 total). In month 2, customer A pays 150, customer B has left, and customers C and D pay 100 each.

- Logo retention = 3 / 4 = 75%.
- NRR = (150 + 0 + 100 + 100) / 400 = 350 / 400 = 87.5%.
- GRR = (min(150, 100) + 0 + 100 + 100) / 400 = 300 / 400 = 75%.

The 50 of expansion from A lifts NRR above GRR; it does not change GRR.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Definitions used
2. Data checks
3. Retention triangles
4. Summary table
5. TTM view
6. Findings
7. What to investigate

Use these exact labels where they apply: "active", "survival", "Logo", "GRR", "NRR", "strong", "suggestive", "too early": name the counting mode as "active" or "survival" in Definitions used, use Logo, GRR and NRR for the three measures, and "strong", "suggestive" or "too early" as the confidence of each finding.

Write amounts and counts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

TTM view is required whenever a trailing or board figure is discussed; if no trailing figure applies, keep the heading and say so.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

**1. Definitions used** — active rule, revenue basis, cohort start rule, mode (active or survival), minimum cohort size, and every assumption.

**2. Data checks** — rows read, customers, months covered, gaps found, ID or revenue issues and how they were handled.

**3. Retention triangles** — logo, NRR, GRR, with cohort size and starting revenue per row, a pooled row, and small cohorts marked.

**4. Summary table**

| Cohort | Size | Start revenue | Logo M3 | Logo M12 | GRR M12 | NRR M12 | Note |
|---|---|---|---|---|---|---|---|

Use offsets the data supports; leave cells blank where a cohort is too young.

**5. TTM view** — trailing NRR and GRR, base month, customer count, and the reason it differs from cohort values.

**6. Findings** — each finding with the cells it rests on and a confidence level (strong, suggestive, too early).

**7. What to investigate** — hypothesis, data needed, owner, and the neighbouring work it hands to (for example, account-level review in the churn-risk-review prompt, or leading indicators in design-customer-health-score).

## Presenting the results

- Show the triangle as a heatmap table with cohort size beside each row; readers need the size to judge the percentages.
- Plot curves as lines by offset (x-axis) with one line per cohort or per quarter of cohorts; highlight the pooled curve. Do not plot by calendar month, which mixes ages.
- Put logo, GRR, and NRR on separate charts with the same axes, or state clearly which is shown.
- When sharing a single figure, state the definition beside it: "cohort NRR at month 12, pooled across 2024 cohorts, MRR basis, active view".
- Keep a short definitions box on every page that carries a retention number, so the figure cannot be quoted without its basis.

## Quality checks

- GRR is never above 100% and never above NRR for the same cell; if it is, the capping or the base is wrong.
- Month-0 logo retention is 100% for every cohort, no logo cell exceeds 100%, and in survival mode no curve ever rises.
- Cohort sizes add up to the number of distinct customers analysed.
- Blank (not-yet-reached) cells are not read as zero, and young cohorts are not compared with old ones at different ages.
- Small cohorts are flagged and not used alone for a trend claim.
- The revenue basis excludes one-time fees and taxes unless the user chose otherwise, and annual invoices were converted to a monthly run-rate.
- Every number in the narrative matches the triangle; every calculation in an example is rechecked.
- No benchmark figures are presented as fact; comparisons are to the user's own past cohorts.

## Boundaries

- Describes what the data shows; it does not diagnose why an individual account left. Account-level churn risk belongs to the churn-risk-review prompt; building a forward-looking health score belongs to design-customer-health-score.
- Does not produce lifetime value, payback, or contribution margin; hand those to model-unit-economics, which can use the retention curves as an input.
- Retention figures prepared for investors, lenders, or public disclosure should be reviewed by finance leadership against the company's published metric definitions.
- The script reads only the file passed to it and writes only to the `--out` path when given.
