# Phasing, scenarios, test reserve, and tracking

## 1. Quarterly phasing

Build the phasing from what each quarter's pipeline requires, not by dividing the annual total by four.

1. Start from deals needed per quarter (target phasing agreed with sales and finance).
2. Shift lead and opportunity requirements earlier by the median sales cycle for each channel.
3. Place programs where they produce those leads, respecting seasonality in the user's own data (for example, if the user's history shows a slow quarter, do not assume it disappears).
4. Place fixed costs by payment schedule: salaries monthly, tool contracts by invoice date, event deposits when due.
5. Check cash timing with finance where prepayments are large.

Phasing table columns: Line, Fixed or variable, Q1, Q2, Q3, Q4, Total, Notes (contract dates, events, launches).

## 2. Scenarios: base, cut 20%, add 20%

Scenarios must say what changes, not only the new total. Build each from the same program list.

### Base

The reconciled plan. State its key assumptions (rates, cost per lead, deal size) and the evidence level of each.

### Cut 20%

1. Compute the cut in currency and as a share of variable programs: `program cut share = cut ÷ variable programs`. Fixed costs rarely move within the year; if they must, that is a separate decision involving HR, finance, and legal.
2. Cut in this order, stating each item:
   - programs with the highest marginal CAC or with no evidence of results;
   - untested new programs, unless the test is what protects next year's plan;
   - spend beyond the point where marginal CAC exceeds the maximum acceptable CAC;
   - brand or long-horizon programs only with an explicit note that their effect shows up later and is harder to measure.
3. Protect: commitments that cost more to cancel than to keep, programs feeding late-stage pipeline for the current quarter, and the incrementality tests that tell you where to cut next time.
4. Recompute leads, opportunities, and deals. Because the cut comes from the highest-marginal-CAC programs, the output loss should be proportionally smaller than the budget cut; if it is not, the allocation was already close to efficient.
5. State the decision deadline: the date by which the cut must be decided so notice periods and bookings can be honored.

### Add 20%

1. Put new money only where there is measured headroom: channels whose marginal CAC at current spend is below the maximum acceptable CAC and that are not at a capacity limit.
2. Expect diminishing returns: the added money buys customers at the marginal, not average, CAC, and often at a higher marginal CAC as spend rises.
3. Account for ramp time. New hires take months to reach full output; new channels take time to learn. Show when the added spend starts producing pipeline.
4. Route part of it to tests of new channels, sized to answer a question.
5. Recompute leads, opportunities, and deals with the ramp included.

Scenario table columns: Scenario, Total, Fixed, Variable, Programs added or removed, Leads, Opportunities, Deals, Change in CAC, Decision deadline.

## 3. Test reserve

Size the reserve from the tests planned, not from a flat percentage:

| Test | Question | Cost | Duration | Decision rule | Owner | If it fails |
| --- | --- | --- | --- | --- | --- | --- |

- Each test answers a question that could change next quarter's allocation (a new channel, a spend-level test, an incrementality holdout, a new offer).
- Decision rules and minimum sample are set before launch; incrementality tests follow measure-marketing-incrementality.
- Money released by a failed or finished test returns to the pool at the next quarterly review, not to whichever team ran it.
- If the user prefers a fixed share of budget as a reserve policy, record it as their policy choice and still list the tests.

## 4. Tracking cadence

| Review | Frequency | Metrics | Decisions allowed |
| --- | --- | --- | --- |
| Spend pacing | Monthly | Spend vs. plan by line; commitments remaining | Shift within a channel |
| Funnel output | Monthly | Leads, opportunities, and pipeline value by channel vs. back-solve requirement; cohort conversion rates | Flag gaps; small reallocations within the owner's limit |
| Allocation review | Quarterly | Marginal CAC by channel, incrementality evidence, test results, scenario triggers | Move money between channels; release or add test funds |
| Plan reset | Annually or on a material change in target | All assumptions | Rebuild the back-solve |

Set reallocation rules in advance, for example: an owner may move up to a stated amount within their channel; moves between channels need the budget owner's approval; any change to fixed commitments needs finance.

Define scenario triggers, for example: "If opportunities created in the quarter fall below the back-solve requirement by more than a stated share for two consecutive months, prepare the cut scenario for decision." The share is the user's choice; record it.

When actuals diverge from plan and someone needs an explanation, route to the budget-variance-explainer prompt with the plan, actuals, and notes.
