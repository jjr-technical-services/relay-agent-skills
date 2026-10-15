---
name: review-sales-forecast
description: Run a weekly or quarterly sales forecast review that ends in a defensible number. Applies forecast categories (commit, best case, pipeline, omitted) with explicit inclusion criteria, inspects deals against evidence using MEDDPICC correctly, triangulates stage-weighted, historical-conversion and rep-judgement forecasts, checks pipeline coverage by stage against the team's own win rates, analyses slippage, pushes and aging, and writes the forecast narrative with risks and upside. Use when asked to prepare or run a forecast call, pressure-test a commit, call the quarter, review pipeline coverage, inspect deals for a forecast, or explain why the forecast moved. Do not use for building a mutual action plan with a buyer (use mutual-action-plan), for reviewing customer churn risk (use churn-risk-review), or for setting annual quotas (use plan-sales-territories).
license: MIT
---

# Review Sales Forecast

A forecast is a commitment about what will close in a period, backed by evidence that a sceptical reviewer can check. The review's job is to separate what the team knows from what it hopes, produce a number with a range, and surface the actions that change the outcome. This skill runs the forecast review: it applies category rules, inspects deals against evidence, triangulates three forecasting methods, tests coverage and slippage, and writes the narrative leadership reads.

## Inputs to gather

Ask for these. When one is missing, proceed with a labelled placeholder and list it under "Open inputs".

- **Period and target:** the period being forecast (week, month, quarter), the target or quota, and bookings already closed in the period.
- **Opportunity export:** opportunity ID, owner, amount, stage, forecast category, close date, created date, date entered current stage, next step and its date, and the history of close-date and amount changes.
- **Qualification evidence:** MEDDPICC fields or notes, mutual action plan status, last meaningful buyer interaction, and whether the economic buyer is engaged.
- **Rep and manager calls:** each rep's commit and best-case numbers, and the manager's adjusted call.
- **History:** stage-to-close conversion by value for the last 4 to 8 periods, in-period win rates, average cycle length for won deals, and the accuracy of past forecasts (forecast at each week versus actual).
- **Context:** pricing changes, new products, seasonality, known large deals, and anything that makes history a poor guide this period.

Label every figure **Supplied**, **Derived** (show the formula), or **Assumed** (must be confirmed).

## Workflow

1. **Lock the snapshot.** Work from a dated export so numbers do not change during the review. Note the week of the period (week 3 of 13 differs from week 11).
2. **Check hygiene first.** Flag opportunities with close dates in the past, no next step, next steps dated in the past, amount of zero, or stage and category that contradict each other. Hygiene problems make every method wrong.
3. **Apply category rules.** Re-test each opportunity against the written inclusion criteria for commit, best case, pipeline, and omitted. Move deals whose evidence does not meet the rule, and record the move and reason. Read references/categories-and-deal-inspection.md.
4. **Inspect the deals that decide the number.** Sort commit and best case by amount; inspect the deals that together make up most of the gap between closed and target. For each, test MEDDPICC elements against evidence, not against a filled-in field.
5. **Compute three forecasts.** Stage-weighted, historical-conversion, and rep-judgement (the category roll-up). Read references/forecast-methods.md for formulas.
6. **Triangulate.** Compare the three. Where they diverge, find the deals or assumptions causing it. Weight methods by their past accuracy for this team at this point in the period. Produce a call and a range.
7. **Test coverage.** Compute coverage of remaining target by pipeline due in period, overall and by stage. Derive required coverage from the team's own in-period win rate (required coverage = 1 / win rate by value, measured at the same week of the period as the review). Do not use a generic coverage ratio.
8. **Analyse slippage and aging.** Push rate, repeat pushers, slipped value, and deals aging beyond the typical won-deal cycle or stage duration. Read references/pipeline-health-and-narrative.md.
9. **Identify risks and upside.** Name specific deals and specific events (legal review, budget approval, competitor evaluation), with the action and owner that would change each one.
10. **Write the narrative.** The call, the range, what changed since last review and why, the top risks and upside, and the asks for leadership.
11. **Record for accuracy tracking.** Save the call and each method's number so forecast accuracy can be measured at period end.

## Routing

- Read references/categories-and-deal-inspection.md when setting or applying category criteria and inspecting deals with MEDDPICC.
- Read references/forecast-methods.md when computing stage-weighted, historical-conversion, or rep-judgement forecasts, triangulating, measuring accuracy, or calculating coverage.
- Read references/pipeline-health-and-narrative.md when analysing slippage, pushes and aging, running the call, or writing the narrative.
- Hand off to the mutual-action-plan prompt when a commit deal lacks an agreed closing plan with the buyer, to the churn-risk-review prompt for renewal risk in the installed base, and to the win-loss-synthesis prompt for post-period learning.

## Core formulas

```
Stage-weighted forecast   = closed + sum over open deals (amount x historical stage-to-close rate)
Historical conversion     = closed + open pipeline due in period x historical in-period conversion
                            at the same week of the period
Rep-judgement forecast    = closed + commit (+ agreed share of best case)
Coverage                  = open pipeline due in period / remaining target
Required coverage         = 1 / in-period win rate by value
Push rate                 = value (or count) of deals whose close date moved out of the period
                            / value (or count) due in the period at the start
Forecast error            = (forecast - actual) / actual
```

## Decision rules at a glance

- **Evidence or it moves down.** A deal stays in commit only if its evidence meets the written commit rule today; a rep's confidence is not evidence.
- **Past close dates are not forecasts.** Any open deal with a close date in the past is excluded until the owner sets a new date with a reason.
- **Rates come from this team's history.** Stage probabilities, conversion rates, and required coverage are computed from the user's data; placeholders are labelled Assumed.
- **When methods disagree, inspect, do not average.** A large spread points to specific deals or a broken assumption; find them before choosing a number.
- **Repeat pushers are a risk category.** A deal pushed twice or more carries lower weight than its stage implies unless new evidence justifies it.
- **Upside is named, not hoped.** Upside lists specific deals and the event that would pull them in.

## Illustrative example (hypothetical numbers)

Quarter target 3.0M, closed 1.0M, so remaining target is 2.0M. Open pipeline due this quarter is 5.0M.

- Stage-weighted, using assumed historical rates (2.0M at 10 percent, 1.5M at 25 percent, 1.0M at 50 percent, 0.5M at 80 percent): 0.2M + 0.375M + 0.5M + 0.4M = 1.475M open contribution, so the forecast is 1.0M + 1.475M = 2.475M.
- Historical conversion: if 30 percent of due pipeline value has historically closed from this week, 5.0M x 0.30 = 1.5M, so the forecast is 2.5M.
- Rep judgement: commit 1.3M, so closed plus commit is 2.3M, with best case of 0.6M on top.
- Coverage: 5.0M / 2.0M = 2.5x against required coverage of 1 / 0.30 = 3.33x, which confirms the shortfall.
- Reading: the three methods sit between 2.3M and 2.5M, about 0.5M short of target. Inspection then decides whether any best-case deal has the evidence to move up, and the narrative names the deals that would close the gap.

## Common failure modes

- Treating the CRM's default stage probabilities as calibrated.
- Accepting commit on the rep's confidence when the economic buyer has not been engaged or the paper process is unmapped.
- Quoting a universal coverage ratio instead of deriving it from the team's win rate.
- Letting past-dated or stale deals sit in the forecast.
- Averaging methods without explaining why they differ.
- Never recording the weekly calls, so forecast accuracy can never be measured or improved.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Forecast call
2. Method comparison
3. Category summary
4. Deal inspection
5. Coverage
6. Slippage and aging
7. Risks and upside
8. Narrative
9. Hygiene issues and open inputs

Use these exact labels where they apply: the range line `Low / call / high:`; the table columns Category (reviewed), MEDDPICC gaps, Past accuracy at this week and What would change it; the line `Required coverage`; the terms push rate and repeat pusher; and the MEDDPICC element names as written (Metrics, economic buyer, Decision criteria, Decision process, paper process, Identify pain, Champion, Competition) when naming a gap.

Write amounts in the same units as the input, with thousands separators, and coverage as a ratio with an x (for example 3.0x). Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not use square brackets or curly braces anywhere in the answer, and do not use Markdown checkboxes.

### Section contents

1. **Forecast call:** the number, the range stated on one line as `Low / call / high: <low> / <call> / <high>`, confidence, and the change since last review.
2. **Method comparison:** table with columns `Method | Closed | Open contribution | Forecast | Past accuracy at this week | Notes`.
3. **Category summary:** table with columns `Category | Deals | Value | Change since last review | Moves in | Moves out`.
4. **Deal inspection:** table with columns `Opportunity | Owner | Amount | Stage | Category (rep) | Category (reviewed) | MEDDPICC gaps | Evidence | Next step and date | Risk`.
5. **Coverage:** table with columns `Stage | Open value due in period | Historical stage-to-close rate | Weighted value | Coverage of remaining target`, plus a line labelled `Required coverage` with its value and derivation.
6. **Slippage and aging:** push rate, repeat pushers, and deals past typical cycle or stage duration.
7. **Risks and upside:** table with columns `Opportunity or event | Type (risk/upside) | Value | What would change it | Owner | By when`.
8. **Narrative:** a short written summary for leadership (see the template in references/pipeline-health-and-narrative.md).
9. **Hygiene issues and open inputs**, with every assumption labelled.

## Quality checks

Run these before answering:

- The call is supported by at least two methods, or the reason only one method is usable is stated.
- Every commit deal has been tested against the written commit criteria, and moves are recorded with a reason.
- MEDDPICC elements are judged on evidence (who said what, when, in what document), and champion is distinguished from a friendly contact.
- Required coverage is derived from the team's own win rate, not quoted as a universal ratio.
- Stage probabilities are from the user's history or labelled Assumed.
- Deals with past close dates or no dated next step are flagged.
- The range and the call are consistent with the risk and upside lists.
- All arithmetic has been rechecked, and closed bookings are not double-counted in open pipeline.
- No deal detail is invented; missing evidence is reported as missing.

## Boundaries

- This skill informs the forecast; the sales leader owns the call and finance owns any external guidance.
- A sales forecast is not a revenue recognition schedule. Bookings, billings, and recognised revenue differ; involve finance before the forecast is used for financial reporting or investor communication.
- Do not pressure reps to change categories without evidence, and do not recommend misrepresenting pipeline to customers, investors, or auditors.
- Deal notes may contain personal data about buyer contacts; keep outputs to business facts needed for the forecast.
