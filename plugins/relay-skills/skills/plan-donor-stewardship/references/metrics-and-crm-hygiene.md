# Metrics with exact formulas, and CRM hygiene

## Period rules

- Compare two periods of equal length, usually consecutive fiscal years. Call them the prior period (P0) and the current period (P1).
- Decide and state: hard credit only or hard plus soft credit; individual or household; whether pledges count when made or when paid (count paid gifts for retention unless the user decides otherwise).
- A donor "gave in a period" if they have at least one counted gift dated inside it.

## Donor metrics

| Metric | Formula |
|---|---|
| Donor retention rate | donors who gave in both P0 and P1 ÷ donors who gave in P0 |
| Donor attrition rate | 1 − donor retention rate |
| New-donor retention | donors whose first-ever gift was in P0 and who gave again in P1 ÷ donors whose first-ever gift was in P0 |
| Repeat-donor retention | donors who gave in P0, had given before P0, and gave in P1 ÷ donors who gave in P0 and had given before P0 |
| Dollar retention | amount given in P1 by donors retained from P0 ÷ amount given in P0 by all P0 donors |
| Upgrade rate | retained donors whose P1 total exceeds their P0 total ÷ retained donors |
| Downgrade rate | retained donors whose P1 total is below their P0 total ÷ retained donors |
| Reactivation rate | donors who gave in P1, did not give in P0, and gave at some time before P0 ÷ donors who gave before P0 but not in P0 |
| New donors | donors whose first-ever gift is in P1 |
| Average gift | total amount of counted gifts in the period ÷ number of counted gifts in the period |
| Average donor total | total amount in the period ÷ number of donors who gave in the period |
| Lifetime giving (per donor) | sum of all counted gifts by the donor since the first gift |
| Recurring donor retention | active recurring donors at the end of P1 who were active at the end of P0 ÷ active recurring donors at the end of P0 |

Notes:

- Average gift and average donor total are different numbers. Monthly donors lower the average gift and raise the average donor total. Always say which one is shown.
- Upgrade rate needs a threshold decision: any increase, or an increase of at least a stated amount or percentage. State it.
- Report counts next to every rate. A retention rate on a small base (for example 20 first-time donors) moves a lot with a few people; say so.
- Donor counts in P1 = retained + reactivated + new. Check this identity; if it does not hold, the data or the definitions are inconsistent.

### Illustrative calculation

Hypothetical round numbers: 400 donors gave in P0. Of them, 180 gave again in P1. Donor retention = 180 ÷ 400 = 45%. If those 180 gave $90,000 in P1 and all 400 P0 donors gave $160,000 in P0, dollar retention = 90,000 ÷ 160,000 = 56.25%. If 60 of the 180 gave more in P1 than in P0, upgrade rate = 60 ÷ 180 = 33.3%.

### Benchmarks

Published sector studies report retention and other rates from pooled data. Do not present any such figure as fact or as the organization's target. The organization's own trend is the benchmark; if the user supplies a published figure with its source, show it labelled with that source.

## CRM hygiene checklist

Run before any metric or segmentation:

| Check | Why it matters | Typical fix |
|---|---|---|
| Duplicate donor records | Splits one donor's history, lowers retention | Merge rules on name plus email or address; review before merging |
| Household versus individual | Double counts couples, or loses one partner's preferences | Choose a counting unit and apply it everywhere |
| Soft credit coded as hard credit | Inflates donor counts and totals | Separate credit types; legal donor gets hard credit |
| Missing or wrong gift dates | Moves gifts across periods | Use deposit or received date consistently |
| Pledges mixed with payments | Double counts | Count payments for metrics; track pledge balances separately |
| Missing fund or restriction code | Restricted funds can be misused | Require fund code at entry; reconcile with finance monthly |
| Missing acknowledgment date | Cannot measure the acknowledgment standard | Make acknowledgment date a required field |
| Anonymity and recognition name not recorded | Recognition errors | Required fields, checked before any list is published |
| Communication preferences not recorded | Unwanted contact, legal exposure | Record opt-outs and channel preferences; honour them in every export |
| Deceased or do-not-contact flags missing | Distress for families, reputational harm | Check before every mailing; memorial gifts handled per preference |
| Appeal or campaign code missing | Cannot attribute results | Require a code for every gift; use "unsolicited" rather than blank |
| Program or service data stored on donor records | Privacy breach risk | Remove; keep program data in the program system only |

Give each hygiene fix an owner and a due date, and re-run the metrics after cleaning so the baseline is honest.
