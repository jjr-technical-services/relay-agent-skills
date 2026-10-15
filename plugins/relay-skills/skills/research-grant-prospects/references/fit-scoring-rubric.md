# Fit scoring rubric

The rubric makes judgement visible and consistent across prospects. It is a tool for ranking effort, not a prediction of an award. Weights are a starting point the user tunes; say which weights were used in every output.

## Criteria, anchors, and default weights

Score 0 to 5 from cited facts. Mark "Unknown" when there is no evidence; never score a guess.

| Criterion | Default weight | 5 means | 3 means | 0 means |
| --- | --- | --- | --- | --- |
| Mission alignment | 20 | Funder's stated priorities name this issue and approach | Adjacent issue; the program fits one stated priority loosely | No stated interest in the issue |
| Population alignment | 15 | Funder names the same population (age group, community) | Broader population that includes it | Different population |
| Geography | 15 | Funder names the service area | Region or state that includes it; no local grants seen | Outside stated geography (knockout) |
| Grant size fit | 10 | Request sits within the range of the funder's recent grants to comparable organizations | Request is above the median but within the range | Request is far outside anything the funder has given |
| Funding type fit | 10 | Funder gives the type needed (for example general operating) | Gives it occasionally | Does not give this type |
| Access | 10 | Open process with published guidelines | Unclear | Invitation only |
| Recent giving pattern | 10 | Recent grants to peers doing similar work; giving stable or rising | Some related grants; giving flat | No related grants in recent years, or giving falling sharply |
| Relationship path | 10 | Warm relationship with the program officer or a trustee | Credible introduction available | No known path |

Formula:

`weighted score = Σ(weight_i × score_i ÷ 5) ÷ Σ(weight_i for known criteria) × 100`

`evidence coverage = Σ(weight_i for known criteria) ÷ Σ(all weights) × 100`

Report both. A high score with low coverage is a research task, not a prospect.

## Grant size relative to the organization's budget

Two separate checks:

1. **Funder side**: compare the request with the median and range of the funder's recent grants to comparable organizations. First grants from a funder are often smaller than renewals; treat that as a common pattern to check in the grants list, not a rule.
2. **Organization side**: a single grant that becomes a large share of the organization's budget creates dependence and reporting load. Set a concentration threshold with the user (for example, flag any single funder above a share leadership chooses) and flag prospects that would exceed it.

Illustrative (hypothetical round numbers): the need is 100,000; the funder's last 12 grants to youth organizations ranged 10,000 to 50,000 with a median of 25,000. A 100,000 request scores 0 on grant size. Options: ask for 25,000 to 50,000 toward a defined part of the need, or stage the relationship with a smaller first request.

## Knockouts

Apply before scoring. Any one removes the prospect and records the reason:

- outside the funder's stated geography;
- organization type not eligible (for example, the funder gives only to named institutions, or excludes organizations below a budget size);
- the funder states an exclusion covering this work;
- conflict with the organization's gift acceptance policy;
- a decline in the last cycle with a reason that has not changed.

Invitation only is not a knockout; it changes the route (cultivation instead of application).

## Recommendation rules

| Condition | Recommendation |
| --- | --- |
| Any knockout | Remove |
| Invitation only, relationship score below 3 | Watch |
| Invitation only, relationship score 3 or above | Cultivate first |
| Coverage below the minimum (default assumption 60%) | Research more |
| Score 70 or above | Pursue now |
| Score 50 to 69 | Cultivate first |
| Below 50 | Watch |

The thresholds are defaults to tune, not standards. Any prospect with a "Stale - re-verify" fact that drives its score must be re-verified before a submission, whatever its recommendation.

## Tuning the weights

- A new organization with few relationships may lower the relationship weight to see which funders to build toward.
- An organization seeking general operating support may raise the funding type weight.
- A place-based program may raise geography and treat anything below 5 as a knockout.
- Change weights before scoring, not after seeing the ranking, and record why.

## Running the script

`scripts/score_prospects.py` applies this rubric to a CSV of scores and prints the ranked table with coverage, recommendation, stale-data flags, and knockout reasons.

`python3 scripts/score_prospects.py prospects.csv --weights relationship=5,funding_type=15 --stale-months 18`

The script does not produce the scores themselves. Each score must come from facts in the fact ledger.
