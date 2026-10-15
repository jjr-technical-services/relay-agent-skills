---
name: design-customer-health-score
description: Design a customer health score that predicts a defined outcome and drives customer success action. Defines the outcome (renewal, churn, expansion) and prediction window, selects candidate signals (usage depth and breadth, key feature adoption, support pattern, stakeholder engagement, sentiment, commercial), backtests against past renewals and churn, chooses expert weights or logistic regression, sets bands, playbooks and review cadence, and guards against gaming and lagging signals. Use when asked to build, redesign or validate a health score, pick or weight health signals, check whether a health score predicts churn, or set red, yellow and green thresholds. Do not use for reviewing a list of at-risk accounts this quarter (use churn-risk-review), for preparing a QBR (use quarterly-business-review-brief), or for cohort retention curves (use analyze-cohort-retention).
license: MIT
---

# Design Customer Health Score

A customer health score is a prediction dressed as a traffic light. It is only useful if it predicts an outcome the business cares about early enough for someone to act, and if each band triggers a specific response. Most scores fail because nobody defined the outcome, the weights were agreed in a meeting and never tested, or the signals move only after the customer has already decided. This skill designs the score from the outcome backwards, tests it against history, and ties every band to a playbook.

## Inputs to gather

Ask for these. When one is missing, proceed with a labelled placeholder and list it under "Open inputs".

- **Outcome history:** a list of past renewal events with account, renewal date, and result (renewed, churned, downgraded, expanded) and revenue before and after. Two or more years if available.
- **Signal data at the account level, with dates:** product usage (active users, licensed seats, feature events), support tickets (count, severity, escalations, satisfaction), stakeholder data (executive sponsor, champion changes, meeting attendance), survey responses (NPS, CSAT), and commercial data (payment status, contract length, discounts, downgrade requests).
- **Segments:** customer size, plan, product line, industry, and lifecycle stage (onboarding, steady state, pre-renewal).
- **Current score:** its signals, weights, thresholds, and how CS uses it today.
- **CS capacity:** team size and how many accounts each band can realistically receive attention.
- **Decision the score supports:** prioritising CSM time, triggering executive outreach, forecasting renewals, identifying expansion.

Label every figure **Supplied**, **Derived** (show the formula), or **Assumed** (must be confirmed).

## Workflow

1. **Define the outcome.** Choose one primary outcome (for example, logo churn or gross revenue lost at the next renewal), the unit (account or contract), and the prediction window (how far before renewal the score must warn). A score built to predict everything predicts nothing. Consider a separate expansion score rather than folding expansion into health.
2. **Build the label set.** For each past renewal event, record the outcome and take a snapshot date at the start of the prediction window. Only data available on that snapshot date may be used as a signal. Read references/outcome-and-signals.md.
3. **List candidate signals.** Draw from usage depth and breadth, key feature adoption, trend, support pattern, stakeholder engagement, sentiment, and commercial signals. For each, write the hypothesis for why it predicts the outcome, and whether it is leading or lagging.
4. **Engineer and normalise.** Convert raw data into comparable signals: ratios (active users / licensed seats), trends (this period versus prior), and percentiles or thresholds scaled 0 to 100. Normalise within segment where segments behave differently.
5. **Test signals one at a time.** For each signal, compare outcome rates across its quartiles or thresholds. Drop signals that do not separate churned from renewed accounts, and note signals that separate strongly but only because they occur after the decision (leakage).
6. **Choose the weighting approach.** Expert weights when outcomes are few or transparency matters most; logistic regression when there are enough outcome events. Read references/weighting-and-backtest.md for the decision rule and formulas.
7. **Backtest the composite.** On a holdout period not used to set weights, measure separation (AUC), churn rate by band, share of churners caught in the lowest band (recall), and lift. Use `scripts/health_backtest.py`.
8. **Set bands and thresholds.** Set thresholds from the backtest and CS capacity: the red band should be small enough to act on and rich enough in churners to be worth acting on. Read references/bands-playbooks-governance.md.
9. **Write playbooks per band.** Each band gets a trigger, owner, actions, time limit, and exit criteria.
10. **Segment check.** Rerun the backtest by segment. If a segment's performance is much worse, give it its own weights or thresholds.
11. **Set governance.** Refresh cadence, model review cadence, ownership, override rules for CSM judgement, and the monitoring that detects gaming and drift.

## Routing

- Read references/outcome-and-signals.md when defining the outcome, building labels, choosing signals, or avoiding leakage.
- Read references/weighting-and-backtest.md when choosing expert weights or logistic regression, building the composite, or backtesting.
- Read references/bands-playbooks-governance.md when setting thresholds and bands, writing playbooks, setting review cadence, or diagnosing failure modes.
- Hand off to the churn-risk-review prompt to review specific at-risk accounts, to the quarterly-business-review-brief prompt to prepare a customer QBR, to analyze-cohort-retention for retention curves and GRR/NRR analysis, and to kpi-tree if the user needs the retention metric tree around the score.

## Core formulas

```
Seat utilisation        = active users in period / licensed seats
Breadth                 = key features or modules used / key features available to the plan
Trend                   = (value this period - value prior period) / value prior period
Normalised signal s_i   = percentile rank within segment x 100 (or threshold mapping to 0-100)
Expert composite        = sum over signals (w_i x s_i), with sum of w_i = 1
Logistic model          = P(churn) = 1 / (1 + exp(-(b0 + sum over signals b_i x_i)))
Health score (logistic) = 100 x (1 - P(churn))
Band churn rate         = churned accounts in band / accounts in band
Recall of lowest band   = churned accounts in lowest band / all churned accounts
Lift of lowest band     = band churn rate / overall churn rate
AUC                     = probability a randomly chosen renewed account scores higher
                          than a randomly chosen churned account
```

## Decision rules at a glance

- **Outcome before signals.** No signal is chosen until the outcome, unit, and prediction window are written down.
- **Snapshot discipline.** A signal counts only if it was known on the snapshot date; anything recorded after the customer decided is leakage.
- **Expert weights when events are scarce; regression when they are not.** Either way, backtest on a later period than the one used to set weights.
- **Beat the simple baseline.** If the composite does not clearly outperform a single strong signal such as seat utilisation, ship the simpler score.
- **Thresholds fit capacity.** The red band must be small enough for CS to work in one prediction window and rich enough in churners to justify the effort.
- **Events override scores.** Champion departure, loss of the executive sponsor, or a severe escalation moves an account to red regardless of its score.
- **Never pay on the score.** Measuring CSMs on the health score invites gaming; measure them on outcomes and playbook completion.

## Common failure modes

- Weights agreed in a meeting and never tested against outcomes.
- NPS or CSM sentiment carrying most of the weight, so the score moves only after the customer has decided.
- One set of weights for every segment, so the score works for large customers and fails for small ones.
- Missing data scored as neutral or healthy.
- Bands that exist on a dashboard but trigger no action.

## Script

`scripts/health_backtest.py` reads a CSV (path or stdin) with a `score` column (higher means healthier) and an `outcome` column (1 or `churned` for the bad outcome, 0 or `renewed` otherwise), plus an optional `segment` column. It prints AUC, the overall churn rate, and for the band thresholds given with `--bands` (for example `40,70` gives red below 40, yellow 40 to below 70, green 70 and above) the accounts, churn rate, share of all churners, and lift for each band, overall and by segment.

```
python3 scripts/health_backtest.py backtest.csv --bands 40,70
```

Interpret: an AUC of 0.5 means the score ranks accounts no better than chance and 1.0 means perfect separation; judge it against the current score's AUC on the same data rather than a fixed bar. Band churn rates should fall steadily from red to green. A red band with high lift but low recall misses most churners; a red band with high recall but low lift is too large to act on. Always run it on a holdout period, not the data used to set weights.

## Output

Deliver in this order:

1. **Summary:** the outcome predicted, the window, the recommended signals and weighting approach, backtest results, and decisions needed.
2. **Outcome definition:** the outcome, unit, prediction window, label rules, and counts of events by outcome and segment.
3. **Signal catalogue:** table with columns `Signal | Category | Formula | Leading or lagging | Hypothesis | Data source | Separation in backtest | Keep or drop`.
4. **Weighting:** the method chosen and why; table with columns `Signal | Normalisation | Weight or coefficient | Direction`.
5. **Backtest results:** AUC for the new and current score, and a table with columns `Band | Threshold | Accounts | Churned | Churn rate | Share of churners | Lift`, overall and by segment.
6. **Bands and playbooks:** table with columns `Band | Trigger | Owner | Actions | Time limit | Exit criteria`.
7. **Governance:** refresh cadence, review cadence, owner, override rules, and monitoring.
8. **Failure modes and mitigations** specific to this design.
9. **Assumptions and open inputs**, each labelled.

## Quality checks

Run these before answering:

- One primary outcome and a prediction window are defined before any signal is chosen.
- Every signal uses only data available at the snapshot date; any post-decision signal is removed and named.
- The composite has been backtested on data not used to set its weights, or the absence of a backtest is stated as the main risk.
- Band thresholds come from backtest churn rates and CS capacity, not round numbers alone.
- Performance is checked by segment.
- Every band has a playbook with an owner and a time limit.
- Weights are either derived (regression) or explicitly labelled as expert judgement pending validation.
- No benchmark churn rate, AUC target, or signal weight is presented as an industry standard.
- Every worked number has been rechecked.

## Boundaries

- The score supports CS judgement; it does not replace it. Keep a documented override path and review overrides.
- It predicts risk; it does not prove cause. Do not claim that raising a signal will reduce churn without an experiment (see ab-test-setup).
- Customer usage and contact data may be personal data. Confirm that its use for scoring is consistent with contracts, the privacy notice, and applicable privacy law, and involve the privacy or legal team before adding individual-level signals.
- If the score will feed revenue forecasts shared with finance or investors, finance owns that use and its validation.
