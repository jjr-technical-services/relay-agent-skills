# Segmentation, RFM scoring and portfolios

## RFM in plain terms

RFM ranks donors on three behaviours that past giving shows:

- **Recency (R):** days between the donor's most recent gift and the as-of date. Fewer days scores higher.
- **Frequency (F):** number of gifts in the lookback window (the user chooses: lifetime, last 3 years, last 5 years). More gifts scores higher.
- **Monetary (M):** either the total given in the window or the average gift in the window. Higher scores higher.

Each dimension is scored 1 (lowest) to 5 (highest). A combined score is either the three digits read together (for example 5-4-3, useful for rules) or a weighted sum:

`RFM score = wR × R + wF × F + wM × M`

with weights the user chooses. Equal weights (1, 1, 1) are a neutral starting point, not a finding.

## Choosing the scoring method

| Choice | Option A | Option B | Decision rule |
|---|---|---|---|
| Breakpoints | Quintiles of this file (relative) | Fixed breakpoints the user sets (absolute, for example R: 90, 180, 365, 730 days) | Use quintiles for a first look. Switch to fixed breakpoints once the team wants scores that mean the same thing year to year and across files. |
| Monetary basis | Total in window | Average gift in window | Total rewards loyal small donors; average isolates capacity per ask. Use total for stewardship priority, average for choosing ask amounts. State which. |
| Frequency window | Lifetime | Last N years | Use a recent window (commonly 3 to 5 years) when the organization's program or donor base changed; lifetime otherwise. |
| Recurring gifts | Count each installment | Count the recurring commitment once per year | Counting installments makes every monthly donor a 5 on frequency. If the monthly program is large, count per year or score monthly donors as their own segment. |
| Weights | Equal | Tuned | Only tune after checking which score best predicted giving in the next period on the organization's own history (score last year's file, compare with this year's gifts). |

Practitioners disagree on whether recency or monetary should carry more weight. The decision rule: back-test on the organization's own data. Score donors as of the start of the prior year, then see which of R, F or M best separated donors who gave again from those who did not. Weight that dimension more. If there is not enough history to back-test, keep equal weights and say so.

Quintile caution: with many donors at identical values (for example most gave once), quintile boundaries collapse and scores bunch. Report the counts per score so the user sees it.

## Segment rules that change treatment

Define segments by rules on the data, in priority order so every donor lands in one segment. Example rules, all adjustable:

| Priority | Segment | Rule (illustrative) | Distinct treatment |
|---|---|---|---|
| 1 | Major gift portfolio | Assigned to a gift officer, or cumulative giving in window above the organization's major gift threshold | Personal plan, officer-owned moves |
| 2 | Recurring donors | Active recurring commitment | Welcome series, annual impact summary, upgrade ask once a year, card-expiry follow-up |
| 3 | First-time donors | Exactly one gift, made in the last 12 months | Second-gift conversion track within the first months |
| 4 | Mid-level loyal | F at 4 or 5 and M at 3 or 4 | Personal thank-you by a named staff member, insider updates |
| 5 | LYBUNT | Gave in the prior fiscal year, not yet in the current one | Report back on what their last gift did, renewal ask |
| 6 | SYBUNT | Gave in some earlier year, not in the prior or current year | Reactivation track with a stop rule |
| 7 | Everyone else active | Remaining donors with a gift in the window | Programmed stewardship |

LYBUNT means "last year but unfortunately not this year"; SYBUNT means "some year but unfortunately not this year". Both are common practitioner labels; define them in the output because not every reader knows them.

## Portfolio sizing from capacity

Do not adopt a quoted portfolio size. Calculate it:

`max portfolio size = annual relationship hours available ÷ (planned contacts per donor per year × average hours per contact)`

Illustrative only, hypothetical round numbers: a staff member with 400 hours a year for donor relationships, planning 6 contacts per donor at 1 hour each (including preparation and logging), can carry 400 ÷ (6 × 1) = 66 donors, rounded down. If the plan needs more donors covered, either reduce contacts per donor for some stages, add board or executive portfolios, or move donors to a programmed track. Say which.

Board members and the executive director can hold small portfolios. Each board-held donor still needs a staff partner who logs contact and owns the next move.

## Moves management stages

Moves management is the practice of planning each meaningful interaction ("move") that brings a donor closer to the organization and to an appropriate ask. Use five stages with explicit entry and exit criteria:

| Stage | Entry criterion | Typical moves | Exit criterion |
|---|---|---|---|
| Identify | Named as a possible prospect (giving history, referral, event, screening) | Research from supplied data, check relationships | Enough known to request a qualifying conversation |
| Qualify | First substantive conversation scheduled | Discovery conversation about interests and connection to the mission | Donor confirms interest (move to cultivate) or declines (move to programmed track) |
| Cultivate | Donor interested | Program visit, briefing with program staff, report on a funded outcome, involvement opportunity | Ask amount, purpose and asker agreed internally, and donor readiness signals recorded |
| Solicit | Ask planned | The ask, follow-up, negotiation of purpose and schedule, gift agreement where needed | Gift made (steward), declined (back to cultivate or programmed), or deferred with a date |
| Steward | Gift received | Thank-you within standard, gift agreement compliance, impact report, recognition per preference | Next cultivation cycle begins on a set date |

Rules: every portfolio donor has a stage, an owner, a next move, and a date. A donor sitting in one stage longer than the organization's stated review interval is flagged at the portfolio review. Record the outcome of every contact in the CRM the same week.

## Program participants and donors

Some donors are also program participants, family members of participants, or alumni. Never use program participation, service records or health information to select, segment or target donors. If a donor volunteers their connection, record only what they chose to share and only for stewardship tone, under the organization's privacy policy.
