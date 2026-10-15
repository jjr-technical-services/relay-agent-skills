# Weighting and backtesting

## Two approaches

### Expert weights

```
Health = sum over signals (w_i x s_i),  with each s_i on 0-100 and sum of w_i = 1
```

- CS leaders assign weights from experience, informed by the single-signal tests.
- Strengths: transparent, easy to explain to CSMs and customers, works with few outcome events.
- Weaknesses: weights reflect beliefs, correlated signals get double-counted, and nobody knows whether the weights are right until tested.

### Logistic regression

```
P(churn) = 1 / (1 + exp(-(b0 + b_1 x_1 + ... + b_k x_k)))
Health   = 100 x (1 - P(churn))
```

- Coefficients b_i are fitted on historical labelled events. Each exp(b_i) is the odds ratio: the factor by which the odds of churn are multiplied for a one-unit increase in x_i, holding other signals constant.
- Strengths: weights come from data, handles correlated signals better than adding expert weights, produces a probability that can be checked for calibration.
- Weaknesses: needs enough outcome events; can overfit; coefficients can have surprising signs when signals are correlated, which confuses users.

### Decision rule

- **Few churn events** relative to signals: use expert weights, informed by single-signal tests, and plan to refit as events accumulate. A commonly cited statistical heuristic for logistic regression is at least about ten events of the rarer outcome per candidate signal; below that, estimates are unstable. Treat it as a guide, not a law.
- **Enough events and a data team to maintain it:** fit a logistic regression with a small number of signals, regularised if available, then present it as points per signal so CSMs can read it.
- **Hybrid:** fit the regression, then round its relative weights into an expert-style scorecard that CS can explain, and confirm the rounded version backtests nearly as well.
- In all cases, compare against the simplest baseline (for example, seat utilisation alone). If the composite does not beat it clearly, use the simpler score.

Other methods (decision trees, gradient boosting, survival models) can separate better, but they cost transparency and maintenance. Recommend them only when the user has the data volume and a team to maintain them; survival models are the natural choice when the question is time to churn rather than churn at a fixed renewal.

## Backtesting

Split by time: set weights on earlier renewal events, test on later ones. Report:

| Measure | Formula | What it tells you |
|---|---|---|
| AUC | Probability that a randomly chosen renewed account has a higher health score than a randomly chosen churned account (ties count half) | Ranking quality across all thresholds; 0.5 is chance |
| Band churn rate | Churned in band / accounts in band | Whether bands mean what their colours say |
| Recall of red band | Churned in red / all churned | Share of churn the red band warns about |
| Precision of red band | Churned in red / accounts in red | How many red accounts actually churn (equals red band churn rate) |
| Lift of red band | Red band churn rate / overall churn rate | How much better than random the red list is |
| Calibration (regression only) | Predicted versus observed churn rate by decile | Whether probabilities can be used in forecasts |

### Illustrative backtest (hypothetical numbers)

200 renewal events in the holdout period, 20 churned, so the overall churn rate is 10 percent.

| Band | Accounts | Churned | Churn rate | Share of churners | Lift |
|---|---|---|---|---|---|
| Red | 30 | 12 | 40.0% | 60% | 4.0 |
| Yellow | 50 | 6 | 12.0% | 30% | 1.2 |
| Green | 120 | 2 | 1.7% | 10% | 0.17 |
| Total | 200 | 20 | 10.0% | 100% | |

Reading: the red band holds 15 percent of accounts and 60 percent of churners, four times the base rate. Churn rates fall steadily across bands. Two green churners are worth reviewing individually for missed signals.

## Comparing to the current score

Run the current score through the same backtest. Present both side by side. If the new score does not improve AUC or red-band lift meaningfully, the redesign is not worth the change cost; say so.

## Small samples

With few churn events, every number above is noisy. Report counts, not only percentages, and avoid fine distinctions between designs whose results differ by one or two accounts.
