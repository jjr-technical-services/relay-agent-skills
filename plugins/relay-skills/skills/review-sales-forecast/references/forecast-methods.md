# Forecast methods, triangulation, and coverage

## Method 1: stage-weighted

```
Forecast = closed + sum over open deals due in period (amount x p(stage))
p(stage) = value of deals that reached this stage and later closed won
           / value of all deals that reached this stage (over a historical window)
```

- Compute p(stage) from the user's own history, by value, over enough periods to be stable, and exclude periods that no longer resemble today.
- Strength: mechanical and consistent. Weakness: ignores close dates and deal quality; a stage-4 deal pushed three times gets the same weight as a fresh one. Default CRM probabilities are rarely calibrated; recompute them.

Illustration (hypothetical): closed so far 0 (for simplicity); open deals due in period of 2.0M at stage 2, 1.5M at stage 3, 1.0M at stage 4, and 0.5M at stage 5, with assumed historical rates of 10, 25, 50, and 80 percent.

| Stage | Open value | p(stage) | Weighted |
|---|---|---|---|
| 2 | 2,000,000 | 10% | 200,000 |
| 3 | 1,500,000 | 25% | 375,000 |
| 4 | 1,000,000 | 50% | 500,000 |
| 5 | 500,000 | 80% | 400,000 |
| Total | 5,000,000 | | 1,475,000 |

## Method 2: historical conversion (time-in-period)

```
Forecast = closed + open pipeline due in period at week w x c(w)
c(w) = in-period bookings from pipeline that was open and due at week w
       / pipeline that was open and due at week w (average over past periods)
```

- It captures the team's real behaviour at this point in the period, including slippage.
- Weakness: breaks when the mix of deals, pricing, or team changes. Check that the current pipeline resembles the historical pipeline (average deal size, stage mix).
- A variant applies c(w) by stage or by segment when those differ materially.

## Method 3: rep judgement (category roll-up)

```
Forecast = closed + commit + (share of best case the leader judges likely)
```

- It captures information not in the CRM (buyer conversations, politics).
- Weakness: individual optimism or sandbagging. Track each rep's historical commit accuracy (commit at week w versus their actual) and adjust with it rather than with intuition.

## Triangulation

1. Put the three numbers side by side with closed-to-date shown separately.
2. If they are close, the call is well supported; set the range from the spread.
3. If they differ materially, decompose the difference. Typical causes: a few large deals weighted differently by stage and by judgement; a stage mix unlike history; reps commit deals with weak evidence; or known events (price change, new product) the history does not reflect.
4. Choose the call by weighting methods by their accuracy for this team at this week in past periods. If there is no accuracy history, say so, start recording it, and explain the judgement used.
5. State the range: low (closed + commit deals that passed inspection), call, and high (call + named upside).

## Measuring accuracy

```
Forecast error at week w = (forecast at week w - actual) / actual
Bias = average signed error over periods (positive = over-forecasting)
Absolute accuracy = 1 - average absolute error
```

Record every method's number every week. After several periods, the team knows which method to trust at which point, and which reps over- or under-call. Replace judgement weighting with this evidence as soon as it exists.

## Pipeline coverage

```
Remaining target = target - closed
Coverage = open pipeline due in period / remaining target
Required coverage = 1 / in-period win rate by value
```

- The in-period win rate by value is the share of pipeline value open and due in the period that closed won in that period, from the team's history, measured at the same week of the period as the review (this is c(w) from Method 2; at week 1 it is the start-of-period rate). Do not apply a start-of-period rate to a mid-period snapshot: the deals still open late in the period are a different population. Illustration (hypothetical): if 30 percent of due pipeline value historically closed in period, required coverage is 1 / 0.30 = 3.33x. With 5.0M of pipeline against 2.0M remaining, coverage is 2.5x, below the required 3.33x, so the pipeline alone implies about 5.0M x 0.30 = 1.5M, a shortfall of about 0.5M.
- Generic coverage ratios quoted without reference to win rate are not a standard; teams with different win rates need different coverage. Do not present a single ratio as a rule.
- Coverage by stage matters more than total coverage late in the period: early-stage pipeline has little chance of closing in the remaining weeks. Use the stage-weighted table to show weighted coverage (weighted value / remaining target).
- Coverage for future periods (next quarter's pipeline today) is a leading indicator of the next forecast; report it separately.
