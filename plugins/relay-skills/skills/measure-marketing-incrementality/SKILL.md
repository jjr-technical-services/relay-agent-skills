---
name: measure-marketing-incrementality
description: Measure what marketing actually causes rather than what it gets credit for. Explains attribution models (last-touch, first-touch, position-based, data-driven) and their biases; designs and sizes incrementality tests (randomized holdouts, ghost ads, conversion lift studies, geo-lift and matched markets, on/off switchbacks); outlines a lightweight marketing mix model; reconciles self-reported attribution; and writes a per-channel measurement plan with pre-registered decision rules. Use when someone asks whether a channel really works, why platform ROAS disagrees with revenue, how to run a holdout or geo test, or which attribution model to trust. Do not use for page or product A/B tests (use ab-test-setup), funnel drop-off diagnosis (use diagnose-conversion-funnel), or setting budget levels (use plan-marketing-budget).
---

# Measure Marketing Incrementality

Separate the conversions marketing causes from the conversions it only touches. Attribution assigns credit among touchpoints that preceded a conversion; incrementality asks what would have happened without the marketing at all. This skill explains the difference, picks the strongest test design the user's channel and volume allow, sizes it, fixes the decision rule before launch, and turns the results into a measurement plan per channel. It never states a lift, incremental return, or "true" channel value that has not come from a controlled test or a clearly labeled model estimate.

## Inputs to gather

Ask for these. When one is missing, proceed with a labeled placeholder and say what the answer would change.

- **The decision at stake.** Cut, keep, or scale a channel; move budget between channels; renew a vendor; set a bidding target.
- **Channels and spend.** Spend by channel and week for at least the last several months, and planned spend for the test period.
- **Outcome data.** The conversion that matters (orders, qualified pipeline, revenue, signups) by day or week, by region if a geo test is possible, with the system of record named.
- **Current attribution.** Which tool and model assign credit today, the lookback windows, and platform-reported conversions per channel.
- **Targeting controls available.** Can the platform hold out a random audience share, run a conversion lift study, or target by region? Can the user's own email or direct mail lists be split?
- **Self-reported attribution.** Any "how did you hear about us" field, its answer options, and response rate.
- **Economics.** Value per conversion (revenue or gross margin), and the maximum acceptable incremental cost per acquisition or minimum incremental return, supplied by the user.
- **Constraints.** Seasonality, promotions, launches, and how long the business can tolerate reduced spend in a holdout.

Label every figure as **Supplied**, **Derived**, or **Assumed**. Platform-reported numbers are Supplied data about credit, not evidence of causation.

## Workflow

1. **State the causal question.** "If we had not spent X on channel Y during period Z, how many fewer [outcome] would we have had?" Write the counterfactual explicitly; every design below is a way to observe or estimate it.
2. **Diagnose the current attribution.** Identify the model in use and its known bias for this channel. Read `references/attribution-models.md` when explaining models or reconciling platform numbers with system-of-record totals.
   - Last-touch over-credits channels that catch people already intending to buy (branded search, retargeting, coupon sites).
   - First-touch over-credits discovery channels and ignores what closed the deal.
   - Position-based and data-driven models still only divide credit among observed touches; none measures what would have happened with no touch.
3. **Rank channels for testing.** Prioritize by spend at stake × doubt about incrementality × ease of testing. Retargeting, branded search, and affiliate or coupon programs are common candidates for high doubt because they target people already close to converting; confirm with the user's own data.
4. **Choose the design.** Pick the strongest feasible design for each priority channel. Read `references/test-designs.md` for mechanics, assumptions, and pitfalls.
   - **Randomized audience holdout:** best when the channel can target known individuals (email, direct mail, paid social custom audiences, CRM-based ads).
   - **Ghost ads or public service ad controls:** when the platform offers them, they identify the control users who would have been shown the ad.
   - **Platform conversion lift study:** run by the ad platform with its own randomization; useful, but the platform grades its own work, so check the method and outcome definition.
   - **Geo-lift or matched-market test:** when individual randomization is impossible (TV, radio, out-of-home, search at scale); needs outcome data by region.
   - **On/off switchback:** alternate spend on and off in time blocks when neither individuals nor regions can be separated; weakest, vulnerable to trends and carryover.
5. **Size the test.** Compute sample or duration for the minimum lift worth acting on, before launch. Use the power formulas in `references/test-designs.md` or `scripts/incrementality_calc.py power`. If the required size is infeasible, say so and choose a bigger contrast (a full pause instead of a 20% cut), a longer run, or a different design; do not run an underpowered test and report its noise.
6. **Pre-register the decision rule.** Before launch, write down the primary metric, the analysis method, the test length, the minimum lift worth acting on, and what each outcome triggers (scale, keep, cut, retest). Include guardrails such as total revenue and lead quality.
7. **Run and monitor for validity, not results.** Check that the holdout or control stays clean (no leakage through other campaigns), spend is delivered as planned, and tracking is stable. Do not stop early because the result looks good or bad unless a pre-agreed guardrail is breached.
8. **Analyze.** Compute lift, incremental conversions, incremental cost per acquisition (iCPA), and incremental return on ad spend (iROAS) with confidence intervals. Use `scripts/incrementality_calc.py analyze` for audience holdouts. Compare incremental conversions with platform-attributed conversions to get the incrementality factor for that channel.
9. **Triangulate with self-reported attribution and, where data allows, a mix model.** Read `references/mmm-and-self-reported.md` for the lightweight mix model outline, its data needs and limits, and how to reconcile "how did you hear about us" answers with test results.
10. **Write the measurement plan.** For every channel: the current evidence level, the next test, its timing, and how routine reporting will be adjusted by the latest measured incrementality factor until the next test.

## Routing to references and script

- Read `references/attribution-models.md` when a user asks which attribution model to use, why numbers disagree, or how to interpret platform-reported ROAS.
- Read `references/test-designs.md` before choosing, sizing, or analyzing any holdout, ghost ad, lift study, geo, or switchback test.
- Read `references/mmm-and-self-reported.md` when the user has at least a couple of years of weekly spend and outcome data, asks about marketing mix modeling, or has a self-reported attribution field.
- Run `python3 scripts/incrementality_calc.py --help` for usage.
  - `power` prints sample size per group for a holdout, including unequal splits such as 90/10.
  - `analyze` prints lift, incremental conversions, a 95% interval, iCPA, iROAS (when value per conversion is given), and the incrementality factor (when platform-attributed conversions are given).
  - Read intervals before point estimates. An interval that includes zero lift means the test did not show the channel is incremental at this size; it does not show the channel is worthless.

## Illustrative example

Hypothetical round numbers, for method only. A paid social retargeting program spends $90,000 in a month. A random 10% of the target audience is held out.

- Treatment: 900,000 people, 19,800 conversions (2.2%). Holdout: 100,000 people, 2,000 conversions (2.0%).
- Relative lift = (2.2% − 2.0%) / 2.0% = 10%.
- Incremental conversions = (0.022 − 0.020) × 900,000 = 1,800.
- iCPA = $90,000 / 1,800 = $50.
- The 95% interval on the rate difference is about 0.11 to 0.29 points, so incremental conversions are roughly 970 to 2,630 and iCPA roughly $34 to $93.
- If the platform attributed 6,000 conversions, the incrementality factor is 1,800 / 6,000 = 0.30: about 30% of attributed conversions were caused by the ads.
- Whether that is good depends on the user's own maximum acceptable iCPA, which must be supplied, not assumed.

## Choosing a design by channel

Starting points only; confirm what the user's platforms and data actually allow.

| Channel type | First-choice design | Fallback | Main threat to validity |
| --- | --- | --- | --- |
| Email, SMS, direct mail to own lists | Randomized audience holdout | None needed | Holdout reached by the same offer elsewhere |
| Retargeting and CRM-matched paid social | Platform lift study or audience holdout | Geo-lift | Platform grading its own work |
| Prospecting paid social and display | Platform lift study with ghost ads | Geo-lift | Outcome defined by platform pixel, not system of record |
| Paid search, non-brand | Geo-lift | Switchback | Auction dynamics when switching |
| Paid search, brand | Geo-lift or switchback pause | Holdout where the platform supports it | Organic results catching displaced clicks |
| TV, radio, out-of-home, podcasts | Geo-lift or matched markets | Switchback plus mix model | Spillover between regions; lagged effects |
| Affiliates and coupon sites | Geo or time-based pause | Code-level analysis | Last-touch interception of existing buyers |

## Common traps

- Reading platform-reported ROAS or conversions as incremental.
- Building a control from people who "were not reached" rather than by random assignment.
- Running a test too small to detect the lift that would change the decision.
- Checking results daily and stopping at the first good-looking reading.
- Calling an inconclusive test "no effect" and cutting a channel on that basis.
- Applying one channel's incrementality factor to another channel or audience.
- Adding self-reported and attributed conversions together.

## Output

1. **Summary.** The decision, the channels at stake, current evidence level per channel, and the recommended next test.
2. **Attribution diagnosis.** Table: Channel, Model in use, Attributed conversions, Known bias for this channel, Direction of likely error.
3. **Test design** for each priority channel. Table: Channel, Design, Unit of randomization, Treatment, Control, Primary metric, Guardrails, Minimum lift worth acting on, Sample or regions, Duration, Power.
4. **Pre-registered decision rule.** Table: Result, Condition (with interval), Action.
5. **Results** (when analyzing). Table: Channel, Lift, 95% interval, Incremental conversions, iCPA, iROAS, Incrementality factor, Evidence level.
6. **Self-reported and model triangulation.** Where they agree, where they disagree, and which evidence governs.
7. **Measurement plan.** Table: Channel, Evidence level (tested / modeled / attributed only), Next test, Timing, Reporting adjustment, Owner.
8. **Assumptions and open questions.**

Evidence levels: **Tested** (randomized or well-controlled geo test in the last 12 months or since the last major change), **Modeled** (mix model estimate with stated uncertainty), **Attributed only** (no causal evidence).

## Quality checks

- No lift, iROAS, or incrementality factor is stated without a named test or a labeled model estimate and its interval.
- Every test has a written power calculation or a stated reason power cannot be computed, and a decision rule fixed before launch.
- The control group or regions are chosen by randomization or a documented matching method, not by convenience.
- Contamination paths (other campaigns reaching the holdout, spillover between regions) are listed with mitigations.
- Platform-run lift studies are labeled as platform-run and their outcome definition is checked against the system of record.
- Attribution models are described as credit allocation, never as causal measurement.
- Self-reported attribution is reported with its response rate and answer options, and not scaled up as if it covered all customers.
- Results that include zero in the interval are reported as inconclusive, not as "no effect".
- All thresholds for acting (maximum iCPA, minimum iROAS) come from the user's economics, not from outside benchmarks.
- Every design names the counterfactual it estimates and the population the result applies to.
- The measurement plan gives each channel an evidence level and a retest trigger (spend, targeting, or creative change).

## Boundaries

- This skill measures and recommends tests; budget levels and reallocation belong to plan-marketing-budget, which should use the incrementality factors produced here.
- Page, pricing, and product experiments belong to ab-test-setup.
- Holdouts on email or messaging must respect consent and suppression rules; holding people out of a legally required or transactional message is never acceptable.
- Audience matching, clean rooms, and uploads of customer lists involve personal data; confirm the user's privacy obligations and involve privacy counsel before new data sharing.
- A full-scale marketing mix model with Bayesian priors, adstock tuning, and calibration is a specialist project; this skill outlines it and states when it is worth commissioning.
