---
name: plan-marketing-budget
description: Build and allocate a marketing budget from the user's own targets and conversion data. Compares top-down methods (percent of revenue as a stated heuristic only; a pipeline back-solve from revenue target to deals, opportunities, and leads by channel) with a bottom-up build by program; allocates on marginal rather than average CAC; separates fixed from variable costs; holds a test reserve; phases by quarter; models base, cut 20%, and add 20% scenarios; and sets a tracking cadence. Use when someone asks how much to spend on marketing, how to split budget across channels, how many leads a revenue target needs, or what to cut if the budget drops. Do not use for a one-page campaign plan (use campaign-plan-one-pager), the company operating budget (use build-operating-budget), or proving channel incrementality (use measure-marketing-incrementality).
---

# Plan Marketing Budget

Turn a revenue goal into a marketing budget that can be defended line by line, allocated where the next dollar does the most, and adjusted when conditions change. The plan reconciles a top-down view (what the target requires) with a bottom-up view (what the programs cost), exposes the costs that cannot move quickly, and says in advance what happens if the budget is cut or increased. Every conversion rate and cost comes from the user's own history or is labeled as an assumption to be replaced.

## Inputs to gather

Ask for these. When one is missing, proceed with a labeled placeholder and say what the answer would change.

- **Targets.** New revenue or new customer target for the period, split between new business, expansion, and renewal if marketing supports all three; the share of new business marketing is expected to source or influence.
- **Deal economics.** Average new deal size or first-year revenue per customer, gross margin, and the maximum acceptable customer acquisition cost (CAC) or payback period set by finance.
- **Funnel rates by channel.** Lead to opportunity, opportunity to win, and sales cycle length from the user's CRM, by channel where available. Use cohort-based rates; see diagnose-conversion-funnel if they are not trustworthy.
- **Channel costs and response.** Last several quarters of spend and results by channel, cost per lead or per opportunity, and any evidence of how results changed when spend changed.
- **Incrementality evidence.** Test results or incrementality factors from measure-marketing-incrementality, if any.
- **Fixed costs.** Marketing headcount (fully loaded), contractors on retainer, and tool contracts with renewal dates and notice periods.
- **Constraints.** Finance's top-down envelope if one exists, fiscal calendar, seasonality, planned launches and events, hiring timelines.

Label every figure as **Supplied**, **Derived**, or **Assumed**. Do not cite outside "typical" budget percentages or conversion rates as fact.

## Workflow

1. **Anchor the target.** Write the goal as a number, a period, and an outcome definition (for example, "new annual recurring revenue closed in fiscal year, marketing-sourced"). Separate new-business targets from expansion and renewal.
2. **Run the pipeline back-solve.** Work backward from revenue to leads, by channel, using the user's rates:
   - `deals = revenue target ÷ average deal size`
   - `opportunities = deals ÷ opportunity-to-win rate`
   - `leads = opportunities ÷ lead-to-opportunity rate`
   - `program cost = leads × cost per lead` (or opportunities × cost per opportunity)
   - Shift each quarter's lead requirement one sales cycle earlier than the quarter its deals must close.
   - Use `scripts/budget_calc.py backsolve` for the per-channel arithmetic.
3. **Cross-check with the percent-of-revenue heuristic, only as a sanity check.** Some companies express marketing spend as a percentage of revenue. The percentage varies widely by business model, growth goal, and stage, so use only a figure the user supplies (a board guideline, their own history, or a sourced survey they accept) and state it as a heuristic. If the back-solve and the heuristic disagree sharply, the gap is a finding: either the target, the rates, or the envelope is unrealistic.
4. **Build bottom-up by program.** List every program (campaign, event, content series, paid channel, agency engagement) with its cost, expected output, owner, and the evidence behind the expected output. Read `references/budget-methods.md` for the program template and the fixed vs. variable split.
5. **Reconcile top-down and bottom-up.** Compare the leads and opportunities the programs are expected to produce with what the back-solve requires. Close the gap by changing programs, not by raising conversion assumptions without evidence.
6. **Allocate on marginal return.** For each channel, estimate how results change with the next increment of spend, and move money until marginal CAC is roughly equal across channels and below the maximum acceptable CAC. Average CAC is the wrong guide because it hides diminishing returns. Read `references/marginal-allocation.md` before allocating; use `scripts/budget_calc.py marginal` when the user has spend-level history by channel.
7. **Separate fixed and variable costs.** Show people, tools, and committed contracts apart from programs. Fixed costs set the floor of any scenario; cuts fall on programs first unless headcount changes.
8. **Hold a test reserve.** Fund named experiments (new channels, incrementality tests, creative or offer tests) from a reserve sized to those tests. Each test lists its cost, its decision rule, and what happens to the money if it fails.
9. **Phase by quarter.** Spread programs by when their leads are needed (step 2), seasonality, launch dates, and contract timing. Front-load lead generation for deals that must close early in the year.
10. **Model scenarios.** Build base, cut 20%, and add 20%. For each, name which programs change, the effect on leads, opportunities, and deals, and the date by which a decision is needed to act in time. Read `references/scenarios-and-tracking.md`.
11. **Set the tracking cadence.** Define monthly and quarterly reviews, the metrics watched, the reallocation rules, and who can approve moving money between lines. Route explanations of budget-vs-actual variance to the budget-variance-explainer prompt.

## Routing to references and script

- Read `references/budget-methods.md` when choosing between top-down and bottom-up methods, running the back-solve, building the program list, or splitting fixed and variable costs.
- Read `references/marginal-allocation.md` before allocating across channels or answering "where should the next dollar go".
- Read `references/scenarios-and-tracking.md` when building cut and add scenarios, phasing by quarter, or setting the review cadence.
- Run `python3 scripts/budget_calc.py --help` for usage.
  - `backsolve` reads a channel CSV and prints deals, opportunities, leads, program cost, and program CAC per channel.
  - `marginal` reads spend-level history per channel, prints average and marginal CAC for each increment, and, with `--budget`, allocates increments in order of lowest marginal CAC until the budget or the `--max-cac` ceiling is reached.
  - Treat the marginal output as a starting point: history at past spend levels says little about spend far beyond them.

## Illustrative example

Hypothetical round numbers, for method only.

- Target: $1,200,000 in new revenue. Average deal $20,000, so 60 deals.
- Opportunity-to-win rate 25%, so 240 opportunities.
- Lead-to-opportunity rate 10%, so 2,400 leads.
- Cost per lead $100, so $240,000 in program spend, a program CAC of $240,000 ÷ 60 = $4,000.
- Add fixed costs (say $360,000 for people and tools) for a fully loaded marketing CAC of ($240,000 + $360,000) ÷ 60 = $10,000.
- With a 90-day sales cycle, leads for deals closing in the first quarter must be generated in the prior quarter.
- A 20% cut to a $600,000 total is $120,000. If fixed costs cannot move, it is half of the $240,000 program budget, not a fifth.
- A 20% addition ($120,000), all to programs, would buy 30 more deals only if program CAC stayed at $4,000.
- With diminishing returns it buys fewer, because the extra spend is priced at marginal CAC, which is above the average.
- Every rate above is a placeholder: replace with the user's cohort-based CRM rates by channel before presenting.

## Choosing the method

| Situation | Lead with | Cross-check with |
| --- | --- | --- |
| Clear revenue or pipeline target, reliable CRM rates | Pipeline back-solve | Bottom-up program list; percent-of-revenue envelope if finance sets one |
| Finance sets a fixed envelope first | Bottom-up program list ranked by marginal CAC | Back-solve to show what the envelope can deliver |
| New company or new market with little history | Bottom-up program list, mostly test reserve | Back-solve with labeled assumptions and wide scenarios |
| Non-pipeline goal (awareness, launch, event) | Objective-and-task costing | Evidence that the tasks move the objective |

When methods disagree, report the gap rather than averaging them. The gap is the conversation to have with finance.

## Common traps

- Treating a percentage-of-revenue figure from a survey or peer as a target rather than a rough envelope.
- Using one blended conversion rate for every channel.
- Forgetting the sales cycle, so leads arrive after the quarter that needed them.
- Moving money toward the lowest average CAC without checking the cost of the next customer.
- Counting attributed customers as incremental.
- Applying a cut proportionally to every line, including costs that cannot move this year.
- Adding budget to a channel already at a capacity or audience limit.

## Output

1. **Summary.** Recommended total, split into fixed and variable, the target it supports, and the two or three assumptions that most affect it.
2. **Pipeline back-solve.** Table: Channel, Share of target, Deals, Win rate, Opportunities, Lead-to-opp rate, Leads, Cost per lead, Program cost, Program CAC.
3. **Heuristic cross-check.** The percent-of-revenue figure used, its source as given by the user, and the gap versus the back-solve.
4. **Program budget.** Table: Program, Channel, Owner, Fixed or variable, Cost, Expected output, Evidence (supplied / derived / assumed), Quarter.
5. **Allocation rationale.** Table: Channel, Current spend, Average CAC, Marginal CAC at current spend, Incrementality evidence, Recommended change.
6. **Test reserve.** Table: Test, Cost, Decision rule, Decision date, Fate of funds if the test fails.
7. **Quarterly phasing.** Table: Line, Q1, Q2, Q3, Q4, Total.
8. **Scenarios.** Table: Scenario, Total, Programs changed, Leads, Opportunities, Deals, Decision deadline.
9. **Tracking cadence.** Table: Review, Frequency, Metrics, Reallocation rule, Approver.
10. **Assumptions and open questions.**

## Quality checks

- The back-solve arithmetic is shown and checks: deals × average deal equals the target, and each rate is traceable to the user's data or labeled Assumed.
- Rates are cohort-based and by channel where possible; one blended rate is flagged if channel rates differ.
- Lead timing reflects the sales cycle.
- Allocation reasoning uses marginal, not average, CAC, and names the evidence for each channel's response to spend.
- Channels with only attributed (not tested) results are labeled, and their CAC is not treated as incremental.
- Fixed costs are separated, and scenario cuts show their disproportionate effect on programs.
- The test reserve funds named tests with decision rules, not a vague slush fund.
- Any percent-of-revenue figure is labeled a heuristic with a user-supplied source.
- Scenario tables state what changes, not just a new total.
- No external benchmark is presented as fact.

## Boundaries

- Finance owns the company operating budget, accounting treatment (for example, whether a cost is capitalized or expensed), and the final envelope; hand company-wide planning to build-operating-budget.
- Whether a channel is truly incremental is measured by measure-marketing-incrementality; this skill consumes those results.
- Headcount decisions involve HR and managers; the plan shows cost and timing implications, not personnel choices.
- Contract terminations, notice periods, and vendor commitments should be checked against the actual contracts, with legal or procurement review before cancelling.
- The plan does not approve spend; it gives the budget owner the evidence and the choices.
- Tax, capitalization, and revenue-recognition questions go to the finance team or outside accountants.
- Unit economics beyond acquisition (lifetime value, payback modeling) belong to model-unit-economics.
