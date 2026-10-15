# Incrementality test designs: mechanics, sizing, and decision rules

## Core quantities

For a treatment group T (exposed to the marketing) and a control group C (not exposed, or exposed to a neutral ad):

- Conversion rates `p_T = conversions_T / n_T`, `p_C = conversions_C / n_C`
- Absolute lift `Δ = p_T − p_C`
- Relative lift `Δ / p_C`
- Incremental conversions `= Δ × n_T`
- Incremental cost per acquisition `iCPA = spend / incremental conversions`
- Incremental return on ad spend `iROAS = incremental revenue / spend` (use gross margin instead of revenue when the decision is about profit, and say which)
- 95% interval on Δ: `Δ ± 1.96 × sqrt( p_T(1 − p_T)/n_T + p_C(1 − p_C)/n_C )`

Carry the interval through: incremental conversions and iCPA have ranges, and iCPA is undefined (infinite) when the lower bound of Δ is at or below zero.

## 1. Randomized audience holdout

**How:** Randomly assign eligible people (customer ids, emails, device or platform audience members) to treatment or holdout before exposure. Suppress the holdout from the channel being tested for the whole test. Measure conversions for both groups in the system of record.

**Use when:** the channel targets known individuals: email, SMS, direct mail, CRM-matched paid social or display, retargeting audiences.

**Assumptions to protect:**

- Assignment is random and happens before exposure. Do not build the holdout from people who "happened not to be reached".
- The holdout is not reached by the same message through another channel; list other campaigns that could leak.
- Outcomes are measured identically for both groups, outside the platform being tested.

**Intent-to-treat:** compare everyone assigned to treatment with everyone assigned to holdout, even if some treatment members never saw an ad. This dilutes the measured lift but keeps it unbiased. Scaling up to "lift among those actually exposed" (divide ITT lift by the exposed share) assumes the unexposed treatment members were unaffected; state that assumption if you do it.

**Split choice:** a smaller holdout (10% to 20%) costs less forgone revenue during the test but needs more total audience for the same precision. Use the unequal-split power formula below.

## 2. Ghost ads and public service ad controls

**Public service ad (PSA) control:** the control group is shown an unrelated charity or neutral ad through the same buying process. It solves the "who would have been reached" problem, but the user pays for the PSA impressions, and the platform's delivery algorithm may serve the PSA to different people than it would serve the real ad, which breaks comparability.

**Ghost ads:** the platform logs when a control user would have been shown the ad (won the auction) but shows something else, without charging. This gives the cleanest comparison of exposed vs. would-have-been-exposed users. Available only where a platform offers it; ask the platform rep what their lift product actually does.

## 3. Platform conversion lift studies

Many large ad platforms run randomized lift studies on their own inventory. Advantages: proper randomization at the user level and no engineering by the user. Limits:

- The platform measures and reports its own performance. Confirm the outcome is the user's real conversion (ideally uploaded from the system of record), not a platform pixel count.
- Results cover that platform's inventory and settings during the test only.
- Minimum spend and duration requirements are set by the platform.

Label results "platform-run" in every report.

## 4. Geo-lift and matched-market tests

**How:** Assign regions (designated market areas, states, postal-code clusters, or countries) to treatment or control. Change spend in treatment regions only. Compare outcome trends.

**Assignment methods, from strongest to weakest:**

1. Randomization of many small regions, stratified by size (possible when there are dozens of comparable regions).
2. Matched markets: pair regions whose pre-period outcome series track each other closely, then randomly pick one of each pair for treatment.
3. Synthetic control: build a weighted combination of control regions that reproduces the treatment region's pre-period series, and use its post-period series as the counterfactual.

**Simple ratio estimate** (illustrative, hypothetical round numbers): test regions sold 1,000 units per week in the pre-period and 1,150 in the test period; control regions sold 2,000 and 2,100.

- Counterfactual for test regions = test pre × (control post / control pre) = 1,000 × (2,100 / 2,000) = 1,050
- Incremental units per week = 1,150 − 1,050 = 100
- Relative lift = 100 / 1,050 ≈ 9.5%

**Uncertainty:** single-pair estimates have no built-in interval. Estimate noise with placebo tests: run the same calculation on many past periods, or on control regions pretending to be treated, when nothing changed. The spread of those placebo "lifts" shows how large a lift must be to stand out. Require a good pre-period fit (the counterfactual should track the treatment series closely before the test starts) before trusting any result.

**Pitfalls:** spillover (people in control regions see treatment-region media or travel), regional promotions or stockouts, and too few regions. National digital campaigns need geo-targeting that actually holds; verify delivery by region.

## 5. On/off switchback (time-based)

**How:** alternate the channel on and off in blocks (for example, weeks), ideally in a randomized order, and compare outcomes in on vs. off blocks.

**Use only when** neither individuals nor regions can be separated. It is vulnerable to:

- trends and seasonality (randomize block order and use many cycles);
- carryover (a channel's effect persists after it stops; add wash-out periods and exclude them from analysis);
- anticipation and auction effects (turning search off and on can change bidding dynamics).

Treat switchback results as weaker evidence than holdouts or geo tests.

## 6. Sizing: power and duration

### Audience holdout, equal split

Per group, to detect a change from control rate `p_C` to treatment rate `p_T` with two-sided α and power 1 − β:

`n ≈ (z_{1−α/2} + z_{1−β})² × [ p_T(1 − p_T) + p_C(1 − p_C) ] / (p_T − p_C)²`

With α = 0.05 and power 0.80 the multiplier is about 7.85.

### Unequal split

With `n_T = k × n_C`:

`n_C ≈ (z_{1−α/2} + z_{1−β})² × [ p_T(1 − p_T)/k + p_C(1 − p_C) ] / (p_T − p_C)²`

Illustrative, hypothetical: control rate 2.0%, smallest lift worth acting on 10% relative (2.2%).

- Equal split: about 80,700 per group, about 161,400 total.
- 90/10 split (k = 9): about 43,200 in the holdout and 388,400 in treatment, about 431,500 total.

If the audience is smaller than required, choose a larger contrast (full pause rather than a partial cut), a longer window, a higher-rate outcome that is a validated proxy, or a different design. Say plainly when a channel cannot be tested at its current scale.

### Duration

- Run whole weeks to balance day-of-week patterns.
- Cover at least one typical consideration cycle, plus a post-period long enough to capture lagged conversions from exposure during the test.
- Avoid major promotions, launches, and holidays unless the decision is specifically about them.
- Fix the end date in advance. Checking results daily and stopping at the first significant reading inflates false positives.

## 7. Pre-registration template

Write this before launch and share it with the decision owner.

| Field | Entry |
| --- | --- |
| Question | If we stop / reduce / add [spend] on [channel] for [population], how many [outcome] change? |
| Design and unit | e.g., randomized 10% customer-id holdout |
| Primary metric and source | e.g., orders in the order system within 28 days |
| Guardrails | e.g., total revenue, average order value, unsubscribe rate |
| Minimum lift worth acting on | From the user's economics: the lift at which iCPA equals their maximum acceptable iCPA |
| Sample or regions, duration, power | From section 6 |
| Analysis | Intent-to-treat difference in rates with 95% interval |
| Decision rule | See below |
| Owner and date | |

Decision rule example, with thresholds to be filled from the user's economics:

- Whole iCPA interval below the maximum acceptable iCPA (equivalently, the lower bound of the lift interval is above break-even lift): keep or scale, and retest after a material spend change.
- Interval straddles the maximum: keep at current spend and retest with more power or a larger contrast.
- Whole iCPA interval above the maximum (the upper bound of the lift interval is below break-even lift): reduce spend and reallocate, then confirm with a follow-up test.

The lift at break-even follows from the economics: `break-even incremental conversions = spend / maximum acceptable iCPA`, so `break-even Δ = break-even incremental conversions / n_T`.
