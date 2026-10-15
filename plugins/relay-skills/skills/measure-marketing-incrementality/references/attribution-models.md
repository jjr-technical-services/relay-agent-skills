# Attribution models and their biases

Attribution divides credit for a conversion among the tracked touchpoints that came before it. It answers "which touches were present?", not "which touches caused the conversion?". Every model below gives credit to a channel that reached someone who would have converted anyway.

## The models

| Model | Rule | Systematic bias | When it is still useful |
| --- | --- | --- | --- |
| Last-touch (last click) | 100% of credit to the final tracked touch before conversion | Over-credits channels that intercept existing intent: branded search, retargeting, affiliate and coupon sites, email to engaged lists. Under-credits channels that create demand earlier. | Operational optimization inside a channel (which keyword, which ad) when the decision is small and fast |
| First-touch | 100% to the first tracked touch | Over-credits discovery channels; ignores everything that moved the buyer from interest to purchase; heavily affected by how far back tracking reaches | Understanding how new people first arrive |
| Linear | Equal credit to every touch | Rewards channels that generate many touches, not influential ones | A neutral view when no better evidence exists |
| Time-decay | More credit to touches closer to conversion | Leans toward last-touch biases | Short, transactional purchase cycles |
| Position-based (U-shaped) | Commonly 40% first, 40% last, 20% spread over the middle; weights are a convention, not a finding | Weights are arbitrary; inherits both first- and last-touch biases | Presenting a compromise view to stakeholders who disagree |
| Data-driven (algorithmic) | Credit estimated from how conversion probability differs between paths with and without a touch, often using Shapley-value or Markov-chain methods | Still observational: people who see retargeting differ from people who do not, so the model confuses targeting with effect. Vendor models are often opaque and may favor the vendor's own inventory. | Better than rules-based models for within-platform allocation, if the method is documented |

### Why every model misses causation

1. **Selection.** Channels are targeted at people more likely to convert. Retargeting shows ads to people who already visited; branded search appears only for people typing the brand name. High attributed conversion rates can be almost entirely selection.
2. **Invisible touches.** Word of mouth, podcasts, TV, offline events, and dark social (links shared privately) rarely leave a tracked touch, so their effect is credited to whatever tracked channel came next.
3. **Tracking loss.** Consent choices, browser privacy features, and cross-device journeys break paths. Models distribute credit only among what survives.
4. **Self-grading platforms.** Each ad platform counts conversions it can link to its own impressions or clicks, including view-through conversions. Summing platform-reported conversions across platforms routinely exceeds the conversions in the system of record.

## Reconciling platform numbers with the system of record

Build a simple table per period:

| Source | Conversions | Notes |
| --- | --- | --- |
| System of record (orders, CRM closed-won) | Total actually recorded | The only total that is real |
| Sum of platform-reported conversions | Sum across all platforms | Usually larger; the excess is double counting and view-through credit |
| Web analytics last-touch by channel | Distribution of the real total | Credit, not causation |

Report the ratio `sum of platform-reported / system-of-record total`. A ratio above 1 proves double counting; it does not tell you which platform is inflated. Only incrementality tests do that.

View-through conversions (a conversion after someone saw but did not click an ad, within a window) deserve special caution: in channels with broad reach, many people who were going to convert anyway will have been shown an ad.

## Using attribution alongside incrementality

Attribution remains useful for decisions tests cannot support at speed: which creative, keyword, or audience inside a channel performs better. Keep it for that, and adjust channel-level totals with a measured incrementality factor:

`incrementality factor = incremental conversions from a test / platform-attributed conversions in the same period and population`

`adjusted conversions (between tests) = platform-attributed conversions × incrementality factor`

Rules for using a factor:

- It applies to the channel, audience, and spend level tested. A factor measured on retargeting does not transfer to prospecting.
- It decays in validity when spend, targeting, creative strategy, or the platform's attribution settings change materially; retest then.
- Show it with its interval, not as a single number.

## Choosing a model to report

There is no correct attribution model; choose by the decision:

- Day-to-day bidding inside a platform: the platform's own model, with the incrementality factor applied to channel totals.
- Cross-channel reporting to leadership: one consistent rules-based model (often linear or position-based) plus the evidence level of each channel, clearly labeled as credit allocation.
- Budget allocation between channels: incrementality tests and, where data allows, a mix model; attribution only as a tie-breaker.

Practitioners disagree on whether a data-driven model is worth its opacity. Decision rule: prefer it only when its method is documented enough to explain a surprising result, and never treat its output as causal without a test.
