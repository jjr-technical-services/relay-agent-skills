---
name: plan-sales-territories
description: Plan sales territories and quotas from account and whitespace data. Segments accounts (named, geographic, vertical, employee band), scores account potential, models ramped rep capacity with ramp curves and attrition, runs balance tests on potential, workload, account count and travel, reconciles a top-down bookings plan with bottom-up capacity, sanity-checks quota against OTE, and writes the transition plan with holdover rules for moved accounts. Use when asked to carve or rebalance territories, set or allocate quotas, build a sales capacity model, check whether reps have fair books, plan headcount against a bookings target, or reassign accounts for a new fiscal year. Do not use for designing commission rates, accelerators or pay mix (use design-sales-compensation), for weekly forecast calls (use review-sales-forecast), or for tiering a single rep's accounts or writing an account plan.
license: MIT
---

# Plan Sales Territories

Territory and quota planning decides who owns which customers and what each seller is expected to deliver. Done well, every seller has a fair shot at quota, the company's bookings plan is backed by real capacity, and customers are not bounced between owners for no reason. Done badly, the plan hides a capacity gap, a few reps are over-served while others starve, and quota attainment reflects the map rather than the selling. This skill turns account data into segments, potential scores, a capacity model, balanced territories, reconciled quotas, and a transition plan, with every assumption labelled.

## Inputs to gather

Ask for these. When something is missing, proceed with a clearly labelled placeholder and list it under "Open inputs" in the output.

- **Account file:** account ID, current owner, industry, employee count or revenue band, location (region, state, postcode or coordinates), customer or prospect status, current annual revenue (ARR) for customers, open pipeline, and any whitespace estimate.
- **Plan target:** next-period bookings or net new ARR target by segment, from finance. Note whether it is gross new, net of churn, or includes expansion.
- **Sales roster:** each rep's role, segment, start date, ramp status, planned hires with start months, and expected departures.
- **History:** bookings per fully ramped rep for the last 4 to 8 quarters, quota attainment distribution, win rates and average deal size by segment, sales cycle length, and historical rep attrition.
- **Effort data:** typical hours or touches per account per year by tier, travel expectations, and selling time available per rep.
- **Constraints:** named-account commitments, partner or channel coverage, language and time-zone needs, contractual or legal limits on who may sell where, and leadership's appetite for moving accounts.

Label every figure as **Supplied** (from the user's data), **Derived** (calculated from supplied data, show the formula), or **Assumed** (placeholder or heuristic the user must confirm).

## Workflow

1. **Frame the decision.** Confirm the period, the sales motions in scope (new business, expansion, renewal), the roles being planned, and what "fair" means to this leadership team. Territory planning without an agreed fairness definition becomes a negotiation.
2. **Clean the account universe.** Deduplicate parent and child accounts, decide the unit of ownership (global parent, regional subsidiary, or site), remove accounts outside the ideal customer profile or already owned by partners, and record how many accounts lack key fields. Read references/segmentation-and-potential.md for the cleaning checklist.
3. **Choose the segmentation.** Pick the primary cut (named, geographic, vertical, employee band, or a hybrid) using the decision rules in references/segmentation-and-potential.md. Tie each segment to a distinct sales motion; a segment that is sold the same way as another is not a segment.
4. **Score account potential.** Estimate what each account could buy over the planning horizon, then adjust for likelihood. Prefer an addressable-spend estimate calibrated to closed-won history over an unweighted fit score. Show the formula and the weights.
5. **Estimate workload.** Convert accounts into hours using effort per account by tier, and compare with selling hours available per rep. Potential tells you what a territory is worth; workload tells you whether one person can cover it.
6. **Model capacity.** Build ramped rep equivalents (RRE) from the roster, ramp curve, hire timing, and attrition, then multiply by productivity per ramped rep. Read references/capacity-and-quota.md for the formulas and a worked example.
7. **Reconcile top-down and bottom-up.** Compare the finance target with capacity. If there is a gap, lay out the levers (hire earlier, improve productivity with evidence, add channel, change the target) with the size of each. Do not close the gap by quietly raising quota.
8. **Draw and balance territories.** Assign accounts to owners, then run the balance tests: potential, workload, account count, existing book, and travel. Read references/balancing-and-transition.md for the tests and tolerances. Use `scripts/territory_balance.py` when an account-level file with owner and potential is available.
9. **Set and allocate quotas.** Set the total quota pool including any over-assignment, allocate it to territories in proportion to potential blended with history, apply ramp to new hires, and check quota-to-OTE and implied cost of sales.
10. **Plan the transition.** List every moved account, apply holdover and crediting rules to open deals, schedule customer handoffs, and define the exception process. Minimise moves that do not improve balance or coverage.
11. **Stress-test.** Rerun capacity and balance under a downside case (slower hiring, higher attrition, lower productivity) and state which territories and quotas break first.

## Core formulas

Keep these visible in the deliverable so reviewers can recompute them.

```
Potential          = addressable spend x (1 - share already captured) x propensity
RRE per rep        = sum of monthly ramp factors in the plan year / 12
Capacity           = (sum of RRE - attrition loss) x productivity per ramped rep
Gap                = plan target - capacity
Quota pool         = plan target x (1 + over-assignment)
Quota_i            = quota pool x (w x potential share_i + (1 - w) x historical share_i)
Balance index_i    = measure_i / mean measure x 100
CV                 = standard deviation across territories / mean
Quota-to-OTE       = annual quota / on-target earnings
```

## Decision rules at a glance

- **Segment on motion, not on org chart.** Split segments only where deal size, cycle length, win rate, or channel differ.
- **Potential before workload for hunters; workload before potential for farmers.** New-business reps are limited by opportunity; account managers with many small customers are limited by hours.
- **Blend weight w.** Use a high weight on potential for new or heavily redrawn territories and a high weight on history for stable ones. State the weight.
- **Continuity beats marginal balance.** Do not move a customer relationship to gain a point or two of balance. Move prospects and border accounts first.
- **Capacity gap is a leadership decision.** Show it and the levers; never hide it in over-assignment or quota.
- **Over-assignment comes from history.** Derive it from the share of assigned quota the ramped team actually delivered, not from a round number.

## Common failure modes

- Counting heads instead of ramped rep equivalents, so capacity is overstated in hiring years.
- Allocating quota on last year's bookings alone, which rewards whoever held the best accounts and punishes whoever inherits new ground.
- Balancing potential across territories of different roles or segments, which compares unlike things.
- A potential score that was never checked against win rate or deal size, so balance is achieved on a number that does not predict anything.
- Announcing new territories without holdover rules, which turns every late-stage deal into a dispute.
- Letting exceptions accumulate until the written territory rules no longer describe reality.

## Routing

- Read references/segmentation-and-potential.md when choosing segments, cleaning the account universe, or building a potential score.
- Read references/capacity-and-quota.md when modelling ramp, attrition, and capacity, reconciling the plan, setting over-assignment, allocating quota, or checking quota-to-OTE.
- Read references/balancing-and-transition.md when running balance tests, interpreting the script output, or writing holdover and transition rules.
- Hand off to design-sales-compensation for commission rates, pay mix, accelerators, and plan documents. Hand off to review-sales-forecast for in-period forecast calls. Use the market-sizing prompt if the user needs a top-down market estimate rather than account-level potential.

## Script

`scripts/territory_balance.py` reads a CSV (path argument or stdin) with at least `owner` and `potential` columns, plus optional `workload` (hours per year) and `arr` (current recurring revenue) columns. It prints, per owner, account count, total potential, share of total, index against the mean (100 = average), and flags owners outside the tolerance band (default plus or minus 15 percent, set with `--tolerance`). It also prints the coefficient of variation (CV, the standard deviation divided by the mean) for each measure.

```
python3 scripts/territory_balance.py accounts.csv --tolerance 0.15
```

Interpret the output: an index of 118 means that owner holds 18 percent more potential than the average territory. A flagged owner is a candidate for moving accounts, not an automatic move; check workload, existing relationships, and travel before changing anything. A low potential CV with a high workload CV usually means account counts or tiers are uneven.

## Output

Deliver in this order:

1. **Summary:** the plan target, modelled capacity, gap, recommended levers, and the three decisions leadership must make.
2. **Segmentation:** a table with columns `Segment | Definition rule | Sales motion | Accounts | Total potential | Reps`.
3. **Potential model:** formula, inputs, weights, calibration evidence, and known weaknesses.
4. **Capacity model:** a table with columns `Role | Headcount start | Hires (month) | Expected attrition | RRE | Productivity per RRE | Capacity`, followed by the reconciliation `Target | Capacity | Gap | Lever | Gap closed`.
5. **Territory balance:** a table with columns `Territory | Owner | Accounts | Potential | Potential index | Workload hours | Workload index | Existing ARR | Flags`, plus the CV for each measure.
6. **Quota allocation:** a table with columns `Territory | Potential share | Historical share | Blended share | Quota | Ramp factor | Ramped quota | OTE | Quota-to-OTE`.
7. **Transition plan:** a table with columns `Account | From | To | Reason | Open pipeline | Holdover rule applied | Handoff date`, and the written holdover policy.
8. **Downside case** and what breaks first.
9. **Assumptions and open inputs**, each labelled Supplied, Derived, or Assumed.

## Quality checks

Run these before answering:

- Every number is labelled Supplied, Derived, or Assumed, and every Derived figure shows its formula.
- Capacity uses ramped rep equivalents, not raw headcount, and includes attrition and hire timing.
- The sum of territory quotas, after ramp adjustments, equals the stated quota pool (or any shortfall is shown), and the pool's relationship to the finance target (over-assignment percentage) is explicit.
- Balance tests cover potential and workload at minimum, and CV is reported for each.
- The potential score was checked against closed-won history, or its lack of calibration is flagged.
- The gap between target and capacity is shown, not absorbed into quota.
- Every moved account with open pipeline has a holdover rule applied.
- No benchmark, attainment rate, ramp length, or tolerance is presented as an industry fact; heuristics are labelled and marked for replacement with the user's data.
- The math in any worked example has been rechecked.

## Boundaries

- This skill proposes territories and quotas; sales leadership and finance decide them. Flag political trade-offs (a top performer losing a key account) rather than resolving them silently.
- It does not set pay. Commission rates, accelerators, and plan terms belong to design-sales-compensation.
- Changing territories or quotas mid-period can affect earned or expected pay. Commission and wage laws differ by state and country; involve HR and employment counsel before mid-period changes, before reducing a territory that affects expected earnings, and when plan documents give the company specific rights to reassign accounts.
- Using location or personal data about contacts may be subject to privacy law. Work with account-level business data, not personal data, unless the user confirms a lawful basis.
- Account potential is an estimate. Say so, and do not present a score as a forecast of bookings.
