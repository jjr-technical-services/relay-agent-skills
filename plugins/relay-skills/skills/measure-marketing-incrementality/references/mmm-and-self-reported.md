# Marketing mix models and self-reported attribution

## Part 1. A lightweight marketing mix model (MMM)

A marketing mix model is a regression of an aggregate outcome (weekly sales, signups, or pipeline) on weekly spend or exposure by channel plus non-marketing drivers. It estimates each channel's contribution without user-level tracking, so it can include TV, radio, out-of-home, and word-of-mouth proxies. It is still observational: it finds correlations over time and depends heavily on modeling choices.

### Model outline

`outcome_t = baseline + Σ_channels β_c × saturation( adstock( spend_{c,t} ) ) + controls_t + error_t`

- **Adstock (carryover):** a channel's effect in week t includes a decaying share of past spend. Geometric form: `adstock_t = spend_t + λ × adstock_{t−1}`, with decay λ between 0 and 1. Higher λ means longer-lasting effect.
- **Saturation (diminishing returns):** each extra unit of spend adds less. Common forms are a Hill curve `x^s / (x^s + h^s)` or a simple log `log(1 + x)`. Saturation is what allows the model to estimate marginal return at the current spend level, which is what budget decisions need.
- **Controls:** price changes, promotions, seasonality (week of year, holidays), trend, distribution or product availability, competitor activity where known, and macro shocks.
- **Baseline:** outcome expected with zero marketing, driven by brand, existing customers, and organic demand.

Outputs worth using: each channel's contribution share with an uncertainty range, the response curve (outcome vs. spend) per channel, and marginal return at current spend.

### Data needs

- Weekly data for each variable. Two to three years is a common working minimum so that seasonality appears more than once; with less, seasonality and channel effects are hard to separate. Treat this as a heuristic and check whether the user's data has enough variation, not only enough weeks.
- Spend (or impressions) by channel per week, from invoices or platform exports, reconciled to finance.
- Outcome from the system of record, per week.
- Records of promotions, price changes, launches, outages, and stockouts.
- Variation: if a channel's spend was nearly constant, the model cannot estimate its effect. Planned spend variation (including geo tests) improves the model.

### Limits

- Channels whose spend moves together (for example, all turned up every Q4) cannot be separated reliably.
- Results are sensitive to adstock and saturation choices; two reasonable specifications can disagree materially. Report the range across specifications, not a single run.
- It measures average historic effects at historic spend levels; extrapolating far beyond past spend is guesswork.
- It is weak for small channels and short periods.

### Calibration with tests

The strongest practice combines both: use incrementality test results to constrain or check the model (for example, as priors in a Bayesian model, or by rejecting specifications whose implied channel lift contradicts a recent test). When model and test disagree, the test governs for the tested channel, population, and spend level.

### When to commission a full model

Worth it when marketing spend is large enough that a modest reallocation pays for the work, several offline or hard-to-track channels are material, and the data needs above are met. Otherwise, run tests on the biggest channels first. Open-source MMM libraries exist from several large ad-tech and analytics organizations; evaluate them on documentation and calibration support, and remember that a model built by a media seller should be reviewed by someone independent.

## Part 2. Self-reported attribution ("How did you hear about us?")

### Design the question

- Ask at a natural point (signup, checkout, first sales call), required or optional by decision, and record the response rate either way.
- Use an open text field or a short list plus "Other (please say)". Lists should include channels that trackers miss: friend or colleague, podcast, community or forum, event, social post (not ad), AI assistant or search, press.
- Keep the answer options stable; changing them breaks trends.
- Store the raw answer and a coded category; code open text with a written rulebook and spot-check.

### What it is good and bad at

- Good at: revealing channels that leave no tracked touch (word of mouth, podcasts, communities), and showing what buyers remember as decisive.
- Bad at: precision. Memory favors recent and vivid touches; people often name the last place they searched rather than where they first heard. Non-responders may differ from responders.

### Reconciling with attribution and tests

Build a comparison per channel for the same period and population:

| Channel | Self-reported share | Last-touch share | Tested or modeled incremental share | Reading |
| --- | --- | --- | --- | --- |
| [channel from the user's data] | [share of responders] | [share of system-of-record conversions] | [from a test or model, with interval] | [see below] |

Reading the gaps:

- **Self-reported high, attributed low** (typical for podcasts, word of mouth, communities): the channel likely drives demand that shows up in tracking as direct, organic, or branded search. Candidate for a geo or switchback test, or a vanity-URL or code approach, before concluding.
- **Attributed high, self-reported low** (typical for retargeting and branded search): the channel may intercept demand created elsewhere. Prime candidate for a holdout.
- **All three agree:** confidence rises; test less often.

Never scale self-reported shares to all customers without stating the response rate and the assumption that non-responders answer similarly. Never add self-reported and attributed conversions together; they describe the same customers.
