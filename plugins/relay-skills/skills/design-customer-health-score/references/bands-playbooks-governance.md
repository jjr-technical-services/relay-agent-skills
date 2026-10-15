# Bands, playbooks, governance, and failure modes

## Setting thresholds

Set thresholds from the backtest and from CS capacity together:

1. Sort holdout accounts by score. For candidate red thresholds, compute the red band's size, churn rate, recall, and lift.
2. Compare the red band's size with the number of accounts CS can run an intensive playbook on in one prediction window. A red band larger than capacity gets ignored.
3. Choose the red threshold that captures the most churners within capacity. Choose the yellow threshold where churn rate is still clearly above the green band.
4. Check that churn rate falls consistently across bands. If yellow and green have similar churn rates, merge them or move the threshold.
5. Recheck by segment. Separate thresholds per segment are acceptable if documented.

Three bands are usually enough. More bands add explanation cost without changing actions unless each band has a distinct playbook.

## Playbooks per band

| Band | Typical trigger | Owner | Example actions | Time limit | Exit criteria |
|---|---|---|---|---|---|
| Red | Score below red threshold, or a critical event (champion departed, executive sponsor lost, severe escalation) regardless of score | CSM with CS manager; executive sponsor for large accounts | Root-cause call within days; recovery plan agreed with the customer; executive-to-executive outreach; targeted re-onboarding on key features; weekly internal review | Defined by the team (for example, first action within a few business days) | Score above red threshold for a defined period and the root cause addressed |
| Yellow | Score between thresholds, or a declining trend | CSM | Usage review with the customer; enablement on unused key features; confirm stakeholder map; schedule a business review | Within the current month | Trend stabilised and stakeholder engagement confirmed |
| Green | Score at or above green threshold | CSM or pooled/digital coverage | Standard cadence; identify expansion or advocacy opportunities (hand to expansion motion) | Routine | Not applicable |

Rules that make playbooks work:

- Critical events override the score. A champion departure moves an account to red even if usage is fine.
- Every red account has a named owner and a dated next action in the CRM.
- Track playbook completion and outcome by band; this is the evidence that the score leads to action.
- For at-risk account reviews, hand off to the churn-risk-review prompt.

## Governance and review cadence

| Activity | Cadence | Owner |
|---|---|---|
| Score refresh | As often as the underlying data updates and CS can act (weekly or monthly is common) | CS operations |
| Band movement report (who moved into red, and why) | With each refresh | CS operations to CS managers |
| Override review (CSM changed a band manually) | Monthly | CS leadership |
| Backtest on the latest renewals | Quarterly or every renewal cohort | CS operations with analytics |
| Weight and threshold redesign | Annually, or after a major product, pricing, or segment change | CS leadership with analytics |

Document the version of the score (signals, weights, thresholds, date) so later backtests compare like with like.

## Failure modes and mitigations

| Failure mode | What it looks like | Mitigation |
|---|---|---|
| Score gaming | CSM sentiment inputs drift upward when CSMs are measured on health; customers prompted to log in before a review | Do not pay or rate CSMs on the score itself; audit sentiment inputs against outcomes; define usage by meaningful actions, not logins |
| Lagging signals | Score turns red after the cancellation notice | Remove post-decision signals; test each signal's lead time; prefer trends and engagement events |
| One-size weights | Score works for large customers and fails for small ones | Backtest by segment; separate weights or thresholds where performance differs |
| Leakage in design | Backtest looks excellent; live performance is poor | Rebuild labels with strict snapshot dates; test on a later time period |
| Stale weights | Performance decays after a product or pricing change | Quarterly backtests; version the score |
| Unexplainable score | CSMs ignore it because they cannot say why an account is red | Show the top contributing signals per account; keep the signal count small |
| Colour without action | Bands exist, nothing happens | Every band has a playbook, owner, and time limit; track completion |
| Missing data treated as healthy | Accounts with no survey or no tracking look green | Explicit missing-data rules; report data coverage per account |
| Correlation treated as cause | Team pushes a feature because its usage correlates with renewal | Test interventions with an experiment before scaling them |
