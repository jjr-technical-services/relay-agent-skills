# Balancing territories and transitioning accounts

## Balance tests

Run each test across territories within the same role and segment. Comparing an enterprise territory with a small-business territory is meaningless.

| Test | Measure | Formula |
|---|---|---|
| Potential | Total potential per territory | index_i = potential_i / mean potential x 100 |
| Workload | Hours per year to cover the territory | index_i = hours_i / mean hours x 100 |
| Account count | Accounts per territory, by tier | index_i = count_i / mean count x 100 |
| Existing book | Current ARR or installed base (for territories that include expansion or renewal) | same index |
| Travel | Average drive or flight time from the rep's base to the territory's accounts, weighted by planned visits | compare directly; flag outliers |
| Pipeline | Open pipeline at plan start | same index; used as a tiebreaker, not a primary test, because pipeline reflects last year's owner |

Summarise spread with the coefficient of variation:

```
CV = standard deviation of the measure across territories / mean of the measure
```

Use the population standard deviation when the territories are the whole set being balanced.

**Illustration (hypothetical).** Three territories with potential of 1.0M, 1.2M, and 0.8M. Mean = 1.0M. Deviations are 0, +0.2M, and -0.2M; the squared deviations sum to 0.08; divided by 3 gives 0.0267; the square root is about 0.163M. CV = 0.163 / 1.0 = 16.3 percent. Indexes are 100, 120, and 80.

## Tolerances

There is no universal correct tolerance. A band of plus or minus 10 to 15 percent around the mean on potential is a commonly used heuristic for territories of the same type; treat it as a starting point and set the band with sales leadership. Tighten it when quota will be allocated purely on potential; loosen it when quota is allocated on a blend with history, because the blend absorbs some imbalance. Workload tolerance can be looser than potential tolerance if managers can shift support resources.

When tests conflict (balanced potential but unbalanced workload), fix the one that drives attainment. For new-business roles, potential usually matters most. For account-management roles with many small customers, workload often binds first.

## Rebalancing moves, in order of preference

1. Move unowned or low-engagement prospects first; they carry little relationship cost.
2. Move accounts at territory borders (adjacent postcodes, adjacent size band) before moving accounts from the middle of a territory.
3. Split large metros or large verticals only when smaller moves cannot reach tolerance.
4. Move active customers or accounts with late-stage pipeline last, and only with a transition plan.

Record every move with its reason. A move that does not bring either territory closer to the mean on the binding test should not happen.

## Holdover and crediting rules for moved accounts

Write these before announcing territories so they apply to everyone equally.

- **Late-stage holdover.** Opportunities at or beyond a defined stage (for example, a signed proposal or a verbal commit) and with a close date inside a defined window stay with the original rep through close. Define the stage and window explicitly and apply them mechanically from the CRM snapshot date.
- **Early-stage transfer.** Earlier opportunities move with the account on the effective date.
- **Split credit.** For opportunities where both reps will do meaningful work, define the split (for example, a fixed share to each) and whether both are credited at full value for quota purposes. Split rules must match the compensation plan; coordinate with design-sales-compensation.
- **Expiry.** Holdovers that do not close within the window revert to the new owner. No indefinite holdovers.
- **Renewals.** Decide whether the renewal owner is the account owner on the renewal date or the rep who sold the original contract.
- **Disputes.** Name a single decision-maker (usually sales operations with a leadership escalation path) and a response time.

## Customer handoff

For each moved customer account with active revenue or late-stage pipeline:

1. Outgoing rep writes a short handoff note: stakeholders, open issues, commitments made, renewal date, and expansion plans.
2. Joint introduction meeting or call with the customer before the effective date where the relationship warrants it.
3. Customer-facing notice sent by the outgoing rep or manager, not by an automated system.
4. Customer success and support teams are told the new owner the same day.

## Timing

Territory changes are least disruptive at the start of a fiscal year or quarter, announced several weeks ahead so reps can plan. Mid-period changes affect expected pay; see the Boundaries section of SKILL.md and involve HR and counsel.

## Reading the script output

`scripts/territory_balance.py` reports per-owner indexes and the CV for each measure. Flags mark owners whose index falls outside 100 x (1 plus or minus tolerance). Treat flags as a list of territories to examine, not as instructions to move accounts. Check workload, relationship continuity, and travel before acting.
