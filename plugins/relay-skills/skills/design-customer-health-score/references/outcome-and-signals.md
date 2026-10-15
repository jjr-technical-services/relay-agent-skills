# Outcome definition and signal selection

## Define the outcome first

| Choice | Options | Decision rule |
|---|---|---|
| Outcome | Logo churn (customer leaves), revenue churn (gross revenue lost, including downgrades), expansion, renewal on time | Pick the outcome the score's main user acts on. CS prioritisation usually targets logo churn or gross revenue lost. Build expansion propensity as a separate score, because the signals and actions differ. |
| Unit | Account, contract, or product subscription | Use the unit at which renewal decisions are made. Multi-product customers may need a score per subscription plus an account roll-up. |
| Prediction window | For example, 90 or 180 days before renewal | Long enough for a playbook to work (an executive engagement or re-onboarding takes weeks), short enough that signals still relate to the decision. Ask CS how long its interventions take. |
| Population | All customers, or excluding those in onboarding | Customers in the first months behave differently; consider an onboarding score with its own signals. |

For monthly or usage-based contracts without renewal dates, define churn as cancellation or usage falling below a threshold within the window, and snapshot on a rolling schedule.

## Build the label set without leakage

1. List every past renewal event (or rolling window) with its outcome.
2. For each event, set the snapshot date = renewal date minus the prediction window.
3. Compute every signal using only data dated on or before the snapshot date.
4. Exclude signals that are consequences of the decision: a cancellation notice, a renewal opportunity marked lost, a downgrade request logged after the customer told the CSM they are leaving. These look highly predictive and are useless for warning.
5. Keep the time order: set weights on earlier events and test on later ones (time-based holdout), so the test resembles real use.

Count events by outcome and segment. Few churn events limit what can be learned; say so.

## Candidate signals

| Category | Example signals (formula) | Leading or lagging | Notes |
|---|---|---|---|
| Usage depth | Active users / licensed seats; sessions or core actions per active user | Leading | Define "active" by a meaningful action, not a login. |
| Usage breadth | Key features or modules used / available on plan; number of teams or departments using | Leading | Breadth may matter more than volume for stickiness; test it. |
| Key feature adoption | Whether the features linked to the customer's purchase goal are in regular use | Leading | Identify key features from won-renewal history, not from product opinion alone. |
| Trend | Change in utilisation over the last period versus the prior | Leading | Declines may matter more than levels; a large customer at a stable level may be fine. |
| Support pattern | Tickets per active user; share high severity; escalations; ticket satisfaction; time to resolution | Mixed | Zero tickets can mean disengagement, not health. Test the shape, not just the count. |
| Stakeholder engagement | Executive sponsor identified and engaged in the last period; champion departed; attendance at business reviews | Leading | Champion departure is widely treated as a warning sign; test it in the backtest and capture it as an event with a date. |
| Sentiment | NPS or CSAT responses; CSM's structured risk assessment | Often lagging | Survey response rates are low and biased; CSM judgement is useful but gameable (see failure modes). |
| Commercial | Days past due; discount depth; contract length; seats reduced at last renewal; downgrade enquiries before snapshot | Mixed | Payment problems can be operational rather than intent; check. |
| Outcomes delivered | Customer-stated goals met (from success plans) | Leading if recorded | Rarely recorded consistently; improving capture can be a recommendation in itself. |

## Engineering and normalising

- Use ratios and trends rather than raw counts so accounts of different sizes are comparable.
- Cap extreme values (for example at the 1st and 99th percentiles) before scaling.
- Normalise to 0 to 100 by percentile rank within segment, or by explicit thresholds agreed with CS (for example utilisation below a value maps to 0, above another maps to 100, linear between). Percentiles are easy but change as the customer base changes; thresholds are stable but need maintenance.
- Handle missing data explicitly: a missing survey response is not a neutral score. Either use a separate "no response" category or leave the signal out for that account and reweight.

## Testing a single signal

For each candidate signal, split accounts into quartiles (or meaningful thresholds) and compute the churn rate in each. A useful signal shows churn rates that change consistently across the quartiles. Record the gap between the worst and best quartile. Signals with no consistent pattern are dropped even if they seem intuitive; signals with a pattern that is too good to be true are checked for leakage.
