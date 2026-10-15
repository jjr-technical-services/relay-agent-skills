# Funnel measurement: stages, formulas, windows, and significance

## 1. Define each stage so it can be counted the same way twice

A stage definition has four parts. Write all four for every stage.

| Part | Question | Example |
| --- | --- | --- |
| Entry criterion | What exact event, page view, or field value marks entry? | `signup_completed` event fired with a non-null user id |
| Unit | What is being counted? | Unique users (not sessions) |
| Window | How long after entering the previous stage does an entity have to reach this one? | Within 14 days of signup |
| Source of truth | Which system wins when two tools disagree? | Product event warehouse, not the web analytics tool |

Rules:

- **One unit per funnel.** Do not divide users by sessions. If the top of the funnel is only available as sessions, either convert everything to sessions or report the top step separately with a warning.
- **Entities, not events.** Count each entity once per stage. A user who views pricing five times has reached the pricing stage once.
- **Ordered or unordered.** State whether an entity must pass stages in order. Unordered counting lets people skip stages, which can make a later stage larger than an earlier one.
- **Terminal outcome.** State what counts as success at the end, and whether refunds, cancellations inside a trial, or disqualified opportunities are excluded.

## 2. Formulas

For stages 1..K, with `N_k` = entities that reached stage k (under the ordering and window rules):

- Step conversion rate: `r_k = N_{k+1} / N_k`
- Step drop-off count: `D_k = N_k − N_{k+1}`
- Step drop-off rate: `1 − r_k`
- Cumulative conversion to stage k: `C_k = N_k / N_1`
- Overall conversion: `C_K = N_K / N_1 = r_1 × r_2 × … × r_{K−1}`
- Downstream rate from stage k+1 to the end: `d_k = N_K / N_{k+1}` (the chance that an entity that clears step k reaches the final outcome)

The product identity `C_K = r_1 × … × r_{K−1}` holds only for a strictly nested cohort. If it does not hold in the user's data, the stages are not nested and the table must say so.

For CRM funnels also compute:

- Stage velocity: median days from entering stage k to entering stage k+1, for those that advanced.
- Stage aging: count of open opportunities that have sat in stage k longer than the 75th or 90th percentile of historical stage time. Aged opportunities are a leak even though they have not been marked lost.

## 3. Cohort vs. period measurement

**Cohort (entry-dated) measurement.** Fix the group that entered stage 1 in a date range, then follow each member forward for the full window. Rates are true probabilities for that group. The cost is lag: a cohort is complete only after the window closes, so recent cohorts look artificially weak. Mark incomplete cohorts as immature and exclude them from comparisons.

**Period (event-dated) measurement.** Count how many entities hit each stage during a calendar period, regardless of when they entered. It is fast and matches most dashboards, but the ratio of two period counts is not a conversion rate when stages are far apart: this month's closed deals came from opportunities opened months ago.

How mixing misleads, illustrated with hypothetical round numbers: a team doubles trial signups in March from 1,000 to 2,000. Trials take about 30 days to convert. March period reporting shows 2,000 trials and 100 paid conversions (mostly from February's 1,000 trials), a "5% conversion rate", down from 10% in February. Nothing about trial quality changed; the numerator is from an older, smaller cohort. The cohort view (February trials → paid within 30 days = 100 / 1,000 = 10%) shows no change.

Decision rule:

- Median time from first to final stage is shorter than the reporting period, and volume is stable: period measurement is acceptable; say so.
- Otherwise, or whenever volume or mix changed: use cohort measurement.
- Dashboards the team already watches may stay period-based, but the diagnosis must be cohort-based and must say how the two differ.

## 4. Data validation checklist

Run before interpreting any rate.

- Counts should not increase down a nested funnel. If they do, look for unit mixing, unordered counting, stage skips (for example, sales-created opportunities that never had a lead record), or a second entry path.
- Compare totals across tools for the same stage and period. A gap larger than the team's normal reconciliation tolerance is itself a finding.
- Look for step changes in any rate that coincide with a release, tag manager change, consent banner change, or CRM field migration. Treat a sudden change that lines up with such a date as a tracking hypothesis until ruled out.
- Remove internal, test, and known bot traffic, and state how.
- De-duplicate by the chosen unit. Users with several devices and accounts with several contacts inflate top-of-funnel counts.
- Check that every segment value sums back to the total. An "unknown" or "(not set)" bucket larger than a few percent of volume limits what segment cuts can show; report its size.

## 5. Segment cuts

Standard cuts: traffic source or campaign, device type, plan or offer, region or country, new vs. returning visitor, company size, sales owner or team, and entry-page or entry-feature. Use only the fields the data supports.

Two patterns to look for:

1. **Within-segment gap.** One segment converts far worse at one step (for example, mobile at the payment step). Points to a step-specific cause for that segment.
2. **Mix shift.** Overall rate drops, but no segment's rate changed; the share of traffic from a low-converting segment grew. The fix is in acquisition mix, not the funnel step. Decompose the overall change:
   - Rate effect = Σ over segments of (old share × (new rate − old rate))
   - Mix effect = Σ over segments of ((new share − old share) × new rate)
   - Rate effect + mix effect = new overall rate − old overall rate (exactly, with this pairing of weights).

## 6. Is the difference real? Significance and sample size

### Two-proportion z-test for an observed difference

For two groups with conversions `x1, x2` from `n1, n2` entrants:

- `p1 = x1 / n1`, `p2 = x2 / n2`
- Pooled rate `p = (x1 + x2) / (n1 + n2)`
- Standard error `SE = sqrt( p × (1 − p) × (1/n1 + 1/n2) )`
- `z = (p1 − p2) / SE`

At a 5% two-sided significance level, `|z| ≥ 1.96` is the conventional threshold. Illustrative, hypothetical numbers:

- Desktop 300 / 5,000 = 6.0%, mobile 200 / 5,000 = 4.0%. Pooled 500 / 10,000 = 5.0%. `SE = sqrt(0.05 × 0.95 × (2/5,000)) = sqrt(0.000019) ≈ 0.00436`. `z = 0.02 / 0.00436 ≈ 4.59`. Distinguishable from noise.
- Same rates on 100 entrants each: 6 / 100 vs 4 / 100. `SE = sqrt(0.05 × 0.95 × 0.02) ≈ 0.0308`. `z ≈ 0.65`. Not distinguishable; do not report as a finding.

### 95% interval on one rate

Use the Wilson score interval, which behaves well for small counts and rates near 0 or 1. With `z = 1.96`, `p = x/n`:

`center = (p + z²/(2n)) / (1 + z²/n)`
`half-width = z × sqrt( p(1 − p)/n + z²/(4n²) ) / (1 + z²/n)`

The script computes this for every step.

### Minimum sample to detect a difference

Per group, to detect a change from `p1` to `p2` with two-sided significance α and power 1 − β:

`n ≈ (z_{1−α/2} + z_{1−β})² × [ p1(1 − p1) + p2(1 − p2) ] / (p1 − p2)²`

With α = 0.05 and power 0.80, `(1.960 + 0.842)² ≈ 7.85`. Illustrative: from 10% to 12% needs about `7.85 × (0.09 + 0.1056) / 0.0004 ≈ 3,840` per group. Use this to say whether a segment has enough volume for any conclusion, and to hand ab-test-setup a realistic minimum detectable effect.

### Multiple comparisons

Cutting six segment fields across five steps is thirty comparisons; at a 5% threshold about one or two will look significant by chance. Either pre-select the few cuts you will test and say why, or apply a Bonferroni adjustment (use α / m for m comparisons, so `|z|` must exceed roughly 3.14 for m = 30 at α = 0.05). Treat anything found by broad slicing as a hypothesis to confirm on a fresh period.

## 7. Reconciling tools

When web analytics, the product database, and the CRM disagree:

- Pick one source of truth per stage and write it down.
- Expect web analytics to undercount where consent or blocking prevents tracking; do not "correct" it with a guessed factor. Report the observed gap.
- Join across systems on a stable id (user id, email hash, CRM contact id) where possible, and report the match rate. An unmatched share large enough to change a step rate must be disclosed next to that rate.
