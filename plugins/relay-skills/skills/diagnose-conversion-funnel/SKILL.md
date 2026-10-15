---
name: diagnose-conversion-funnel
description: Diagnose where and why a conversion funnel leaks, using the user's own web analytics exports, CRM stage data, or product signup and activation events. Defines stages and exact conversion formulas, chooses cohort or period measurement, cuts by segment, checks sample size before calling a difference real, ranks stages by recoverable loss rather than worst rate, gathers qualitative evidence, and ends with a scored hypothesis backlog. Use when someone asks why conversion dropped, where the funnel leaks, why signups do not activate, why leads stall between stages, for a drop-off analysis, or which funnel step to fix first. Do not use for writing landing page copy (use the landing-page-copy prompt), for designing or sizing a specific A/B test (use ab-test-setup), for building a metric hierarchy (use kpi-tree), or for retention curves after purchase (use analyze-cohort-retention).
---

# Diagnose Conversion Funnel

Find the step where the funnel loses the most recoverable value, explain why with both numbers and qualitative evidence, and hand the team a ranked list of testable hypotheses. The job is diagnosis, not redesign: the output tells people where to look and what to test, with every rate traceable to a stated formula and every claim labeled as measured, estimated, or assumed.

## Inputs to gather

Ask for these. When one is missing, proceed with a clearly labeled placeholder and say what the answer would change.

- **Business goal and final outcome.** What the funnel ends in (paid order, closed-won deal, activated account, booked demo) and why the question is being asked now (a drop, a target, a launch).
- **Raw data, not dashboard screenshots.** Web analytics export (sessions or users by step), CRM opportunity history with stage entry dates, or product event log with user id, event name, and timestamp. Note the tool and the export date range.
- **Stage definitions currently in use.** The exact event, page, or CRM field that marks each stage, and who owns each definition.
- **Unit of analysis.** Sessions, users, accounts, or opportunities. Mixed units are the most common source of impossible rates above 100%.
- **Segment fields available.** Traffic source or campaign, device, plan or offer, region, new vs. returning, company size, sales owner.
- **Known changes.** Releases, pricing changes, tracking changes, campaign launches, seasonality, and outages in or near the period.
- **Qualitative sources.** Session recordings, form analytics, on-site surveys, support tickets, sales call notes, lost-reason fields.

Label every input as **Supplied** (from the user's data), **Derived** (calculated here from supplied data), or **Assumed** (placeholder to be replaced). Never fill a gap with an outside benchmark presented as fact.

## Workflow

1. **Frame the decision.** Write one sentence: "We need to know which step to fix first to move [final outcome] for [population] over [period]." If the user asks about a sudden drop, treat instrumentation failure as the first hypothesis, not the last.
2. **Define stages and formulas.** List each stage with its entry criterion, unit, and time window. Write the step conversion formula for every transition (`step rate = entities reaching stage k+1 within the window / entities that entered stage k`) and the cumulative formula (`cumulative rate = entities reaching stage k / entities entering stage 1`). Read `references/funnel-measurement.md` when defining stages, choosing windows, or reconciling tools.
3. **Choose cohort or period measurement and state why.** Use cohort measurement (follow a fixed entry group forward) when stages are days or weeks apart, as in most B2B and product-led funnels. Period measurement (count each stage's events in the same calendar window) is acceptable only when the whole funnel usually completes within the reporting window. Never divide one period's conversions by another period's entries without saying so.
4. **Validate the data before interpreting it.** Report every data-quality issue and whether it changes the conclusion. Check at least:
   - counts that increase down the funnel (unit mixing, unordered counting, or stage skips);
   - duplicate ids and multi-device users;
   - internal, test, and bot traffic;
   - step changes that line up with a release, tag change, consent banner, or CRM field migration;
   - totals that disagree between tools for the same stage and period;
   - the size of any "unknown" or "(not set)" segment bucket.
5. **Build the stage table.** For each transition show entered, converted, step rate, cumulative rate, drop-off count, and a 95% interval on the step rate. Use `scripts/funnel_table.py` when the user supplies stage counts as CSV; it prints this table plus the sensitivity and recoverable-loss columns described below.
6. **Cut by segment.** Repeat the table for the segment fields available: source, device, plan, region, new vs. returning, and any sales-owner or company-size field. Look for a segment whose step rate differs sharply from the rest, and a segment-mix shift that explains an overall change with no change inside any segment (Simpson's paradox).
7. **Run a sample-size sanity check before calling any difference real.** Use the two-proportion z-test and the minimum-sample formula in `references/funnel-measurement.md`. When many segments are compared, adjust the significance threshold for multiple comparisons. A difference that fails the check is reported as "not distinguishable from noise at this volume", never as a finding.
8. **Rank by recoverable loss, not worst rate.** For each step, compute the final-outcome gain from a realistic improvement, using the user's own best segment, best cohort, or prior period as the reference rate. The worst-rate step is often the top of the funnel, where improvement is hardest and traffic intent varies most. Read `references/leak-prioritization.md` when ranking steps.
9. **Gather qualitative evidence at the top-ranked steps only.** Record what was observed, how many cases were reviewed, and how they were sampled. Useful sources:
   - session recordings filtered to people who dropped at that step, sampled systematically;
   - form-field start, error, and abandonment rates;
   - one-question on-page or exit survey answers;
   - support tickets tied to the step;
   - sales notes and lost reasons for stalled or lost opportunities.
10. **Write the hypothesis backlog.** Each hypothesis names the step, segment, suspected cause, evidence for and against, the proposed change, and a score of Impact × Confidence ÷ Effort. Impact is the recoverable loss from step 8, not a guess.
11. **Route tests and fixes.** Send outright bugs and tracking errors straight to the owning team. Send hypotheses that need a controlled comparison to `ab-test-setup`, with the step, metric, baseline rate, and minimum detectable effect already filled in. Route copy work to the landing-page-copy prompt.

## Routing to references and script

- Read `references/funnel-measurement.md` when defining stages, writing formulas, choosing cohort vs. period measurement, validating data, or running significance and sample-size checks.
- Read `references/leak-prioritization.md` when ranking steps by recoverable loss, collecting qualitative evidence, or scoring the hypothesis backlog.
- Read `references/funnel-patterns.md` when the user's funnel is sales-led (CRM stages), product-led (signup and activation events), or e-commerce, for stage templates and the traps specific to each.
- Run `python3 scripts/funnel_table.py --help` for usage. Input is a CSV with columns `stage,count` and optional `segment`, rows ordered from top of funnel to bottom. Pass `--reference <segment>` to compute recoverable loss against the user's best segment.

### Interpreting the script output

- `step_rate` and `ci_low`/`ci_high` come from the counts; a wide interval means the rate is not yet reliable.
- `final_per_1pt` is how many final-stage outcomes one percentage point of improvement at that step would add, holding the other steps constant. Equal relative improvements at every step yield the same final gain, so this column shows where a percentage point is worth most.
- `recoverable_final` appears only with `--reference`. It is `entered × max(0, reference rate − segment rate) × downstream rate`, the final outcomes gained if that segment matched the reference at that step. It is an upper bound: segments differ in intent, so reduce confidence when the reference is not comparable.
- A warning about counts increasing down the funnel means the data mixes units, windows, or stage-skipping paths. Fix that before interpreting anything.

## Illustrative walk-through

Hypothetical round numbers, for method only. One quarterly signup cohort, unit = users:

| Transition | Entered | Converted | Step rate |
| --- | --- | --- | --- |
| Visit → Signup | 100,000 | 3,000 | 3.0% |
| Signup → Activated | 3,000 | 1,200 | 40.0% |
| Activated → Paid | 1,200 | 300 | 25.0% |

- Overall conversion is 300 / 100,000 = 0.3%, which equals 3.0% × 40.0% × 25.0%, so the funnel is nested.
- Visit → Signup has the worst rate, but raising it by a single point would be a one-third relative lift.
- Desktop activates 1,000 of 2,000 signups (50%) and mobile 200 of 1,000 (20%). The z statistic is about 15.8, so the gap is real at this volume.
- Recoverable if mobile matched desktop: 1,000 × (0.50 − 0.20) × 0.25 = 75 paid customers, assuming mobile activators pay at the same 25% (labeled Assumed until checked).
- That becomes the first hypothesis to investigate with recordings of mobile first sessions, before any top-of-funnel work.

## Common traps

- Reading a period-based dashboard ratio as a conversion rate after volume changed.
- Treating a tracking change, consent banner change, or event rename as a behavior change.
- Declaring a segment "broken" on a few hundred entrants without an interval.
- Slicing dozens of segments and reporting the one that looks significant.
- Ranking by drop-off count, which always favors the top of the funnel.
- Quoting a lost-reason picklist without reading the notes behind it.
- Proposing redesigns before confirming where the loss is.

## Output

Deliver in this order:

1. **Summary.** One paragraph: the top one to three leaks, the evidence strength, and the recommended next action.
2. **Funnel definition.** Table with columns: Stage, Entry criterion, Unit, Window, Data source, Owner.
3. **Measurement choice.** Cohort or period, with the one-line reason.
4. **Data quality notes.** Each issue, its size, and whether it changes the conclusion.
5. **Stage table.** Columns: Transition, Entered, Converted, Step rate, 95% interval, Cumulative rate, Drop-off, Final per 1 pt.
6. **Segment findings.** Columns: Segment, Step, Segment rate, Comparison rate, Difference, z or interval check, Verdict (real / not distinguishable / too small to test).
7. **Recoverable loss ranking.** Columns: Step, Segment, Reference used, Recoverable final outcomes, Confidence, Why.
8. **Qualitative evidence.** Columns: Step, Source, Cases reviewed, Sampling method, Observation.
9. **Hypothesis backlog.** Columns: ID, Step, Segment, Hypothesis, Evidence for, Evidence against, Proposed change, Impact, Confidence, Effort, Score, Route (fix / test via ab-test-setup / research).
10. **Assumptions and open questions.** Every Assumed input and what answering it would change.

## Quality checks

Before answering, confirm:

- Every rate has a written formula with a consistent unit and window, and no rate exceeds 100% without explanation.
- Cohort vs. period measurement is stated and not mixed within one table.
- Instrumentation changes were checked before behavioral explanations for a sudden drop.
- No segment difference is called real without a significance or interval check at the observed volume, and multiple comparisons are acknowledged.
- The ranking uses recoverable final outcomes, and the worst-rate step is not assumed to be the biggest opportunity.
- Qualitative claims state how many cases were reviewed and how they were chosen.
- Impact scores in the backlog trace to the recoverable-loss table.
- Every number is labeled Supplied, Derived, or Assumed; no external benchmark is stated as fact.
- Tests are handed to ab-test-setup rather than designed ad hoc here.
- Immature cohorts (whose window has not closed) are excluded or labeled.
- The summary names what evidence would change the ranking.

## Boundaries

- This skill diagnoses; it does not declare a winning change. Only a controlled test or a clearly bounded before-and-after with checked confounders can show that a change caused an improvement.
- It does not decide pricing, packaging, or channel budgets; hand those to develop-offers, plan-marketing-budget, or measure-marketing-incrementality.
- Session recordings and form analytics can capture personal data. Confirm that recording and consent settings meet the user's privacy obligations before recommending more capture, and involve privacy or legal counsel when collection would expand.
- Retention after the first purchase or conversion belongs to analyze-cohort-retention; metric hierarchies belong to kpi-tree.
- When the data cannot support a conclusion, say so and give the smallest instrumentation fix that would make the next diagnosis possible.
