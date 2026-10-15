# Finding and ranking the leak

## 1. Why the worst rate is usually the wrong place to start

The lowest step rate in most funnels is the first one (visit to signup, lead to qualified lead), because that step filters the least-qualified traffic. A low rate there is normal, and a percentage point there is a large relative change. Rank steps by how many **final outcomes** a realistic improvement would recover, not by which rate looks worst.

Two facts drive the method:

1. In a nested funnel, overall conversion is the product of step rates, so the same **relative** improvement at any step (say, +10% of its current rate) raises final outcomes by the same 10%. Relative improvement alone cannot rank steps; what differs is how achievable that improvement is.
2. Achievability is best estimated from the user's own data: a segment, cohort, or prior period that already performs better at that step shows that the better rate is reachable for similar traffic.

## 2. Three quantities per step

With `N_k` entering step k, current step rate `r_k`, and downstream rate `d_k` (share of those clearing step k that reach the final outcome):

- **Sensitivity (final outcomes per percentage point):** `N_k × 0.01 × d_k`. Useful for comparing how much a point is worth, but a point is not equally hard to win at every step.
- **Recoverable loss vs. a reference:** `N_k × max(0, r_ref − r_k) × d_k`, where `r_ref` is the reference rate. Report the reference used.
- **Confidence in the reference:** high when the reference is the same traffic in an earlier cohort or a segment differing only in device or form; low when the reference segment has different intent (branded search vs. paid social) or small volume.

Reference choices, in order of preference:

1. Same segment, earlier cohort, before a known change (strongest: shows this traffic once did better).
2. Different segment with similar intent at the same step (desktop vs. mobile on the same campaign).
3. Different segment with different intent (weakest: much of the gap may be intent, not friction).

Never use an outside benchmark as `r_ref` unless the user supplies a sourced figure and accepts it as comparable.

## 3. Worked example (illustrative, hypothetical round numbers)

Funnel, one quarterly cohort, unit = users:

| Transition | Entered | Converted | Step rate | Drop-off |
| --- | --- | --- | --- | --- |
| Visit → Signup | 100,000 | 3,000 | 3.0% | 97,000 |
| Signup → Activated | 3,000 | 1,200 | 40.0% | 1,800 |
| Activated → Paid | 1,200 | 300 | 25.0% | 900 |

Overall: 300 / 100,000 = 0.3% = 3.0% × 40.0% × 25.0%.

Sensitivity per percentage point:

- Visit → Signup: `100,000 × 0.01 × (0.40 × 0.25) = 100` paid
- Signup → Activated: `3,000 × 0.01 × 0.25 = 7.5` paid
- Activated → Paid: `1,200 × 0.01 × 1 = 12` paid

The first step looks most valuable per point, but one point there is a one-third relative increase, which is rarely realistic. Recoverable loss against references tells a better story:

- **Signup → Activated, mobile vs. desktop.** Desktop 2,000 signups at 50% (1,000 activated); mobile 1,000 at 20% (200 activated). Recoverable if mobile matched desktop: `1,000 × (0.50 − 0.20) × 0.25 = 75` paid, assuming mobile activators pay at the same 25% (label as Assumed and check). Same campaigns, different device: reference confidence medium to high.
- **Visit → Signup, paid social vs. other sources.** Paid social 40,000 visits at 1.5% (600 signups); other 60,000 at 4.0% (2,400). Recoverable if paid social matched: `40,000 × (0.040 − 0.015) × 0.40 × 0.25 = 100` paid. Larger, but the reference mixes intent (other sources include branded search and direct), so confidence is low.
- **Activated → Paid, current vs. prior cohort.** Prior quarter's cohort converted 30% at this step. Recoverable: `1,200 × (0.30 − 0.25) × 1 = 60` paid. Confidence depends on what changed between cohorts (pricing, trial length, traffic mix).

Before ranking, run the significance check from `funnel-measurement.md` on each gap. Here the mobile gap (200 / 1,000 vs 1,000 / 2,000) gives pooled 1,200 / 3,000 = 0.40, `SE = sqrt(0.40 × 0.60 × (1/1,000 + 1/2,000)) ≈ 0.019`, `z ≈ 0.30 / 0.019 ≈ 15.8`: real.

## 4. Qualitative evidence

Numbers show where people leave; qualitative evidence suggests why. Collect it only at the top two or three ranked steps.

| Source | What to pull | What it can show | Caution |
| --- | --- | --- | --- |
| Session recordings | Sessions that reached the step and left, filtered by the segment with the gap | Confusion, rage clicks, dead ends, layout breaks, slow loads | Sample systematically (for example, the first 20 qualifying sessions per day over a week), not the most dramatic ones |
| Form analytics | Field-level start, error, and abandonment rates | Which field causes exits; validation errors | Needs field-level tracking; check consent settings |
| On-page or exit survey | One question at the step ("What stopped you today?") | Stated reasons in the visitor's words | Low response rates; answers are stated, not observed behavior |
| Support tickets and chat | Tickets tagged to the step or feature | Recurring blockers | Only captures people motivated to ask |
| Sales notes and lost reasons | Opportunities that stalled or were lost at the stage | Pricing, timing, competitor, missing capability, champion loss | Lost-reason fields are often filled carelessly; read notes, not just the picklist |
| Customer or prospect interviews | Five to ten recent drop-offs and recent converters | Decision process and alternatives considered | Small samples; use to form hypotheses, not to size them |

Record: source, number of cases reviewed, how cases were selected, and the observation. Do not generalize a pattern seen in three recordings to the whole segment; state it as a hypothesis with the count.

## 5. Hypothesis backlog and scoring

Each hypothesis is written as: "At [step], [segment] drops off because [cause]; if we [change], the step rate will move toward [reference rate]."

Score = Impact × Confidence ÷ Effort.

- **Impact:** recoverable final outcomes from section 2, or the same figure converted to revenue with a stated value per outcome.
- **Confidence (0.1 to 1.0):**
  - 0.8: significant quantitative gap against a comparable reference plus direct qualitative observation of the cause.
  - 0.5: significant gap against a comparable reference; cause inferred.
  - 0.3: gap against a weak reference, small sample, or cause supported by opinion only.
  - 0.1: no quantitative gap; idea only.
- **Effort:** person-weeks to ship the change or run the test, estimated by the team that would do it.

Illustrative scoring using the example above (efforts are hypothetical team estimates):

| ID | Hypothesis | Impact | Confidence | Effort | Score |
| --- | --- | --- | --- | --- | --- |
| H1 | Mobile activation checklist breaks on small screens | 75 | 0.6 | 2 | 22.5 |
| H2 | Paid social landing page mismatches ad promise | 100 | 0.3 | 3 | 10.0 |
| H3 | Shorter trial reduced time to see value | 60 | 0.5 | 4 | 7.5 |

Scores rank the backlog; they are not forecasts. Revisit them when new evidence arrives.

## 6. Routing each hypothesis

- **Bug or tracking error:** fix directly; no test needed. Re-measure the step on the next complete cohort.
- **Change with uncertain effect and enough traffic:** hand to `ab-test-setup` with the step metric, baseline rate, reference rate, minimum detectable effect, and the sample needed per group.
- **Not enough traffic to test:** ship behind a clearly dated change log and compare complete cohorts before and after, with confounders listed; label the result as observational.
- **Cause unknown:** research first (more recordings, interviews), and do not score Impact above zero until a gap is confirmed.
