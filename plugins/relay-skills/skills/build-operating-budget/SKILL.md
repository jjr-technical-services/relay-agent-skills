---
name: build-operating-budget
description: Build an annual operating plan and budget from drivers - revenue drivers, a headcount plan with fully loaded cost and start-month timing, non-headcount opex by department, COGS, monthly phasing, scenarios, and cash runway - and reconcile top-down targets with bottom-up department requests, with approval and reforecast cadence. Use when asked to build next year's budget or annual operating plan, create a headcount plan and cost model, phase a budget by month, reconcile department requests with company targets, model base, upside and downside scenarios, or check runway under the plan. Do not use for explaining actual-versus-budget variances (budget-variance-explainer), marketing channel allocation (plan-marketing-budget), a 13-week cash forecast (build-cash-forecast), or support team sizing (plan-support-staffing).
---

# Build Operating Budget

Produce an annual operating plan that leadership can approve and department owners can run against: a monthly, driver-based model in which revenue, headcount and spending follow from a small number of stated assumptions, reconciled between what the company needs (top-down targets) and what departments say they need (bottom-up requests), with scenario cases and the cash consequences made explicit. A budget built from drivers can be re-run when assumptions change; a budget built by adding 10% to last year cannot explain itself. Every assumption is labelled with its owner and source.

## Inputs to gather

Ask for these, record who supplied each, and mark gaps as "Assumed" placeholders with the output they drive.

- **Company targets** from leadership: revenue or growth goal, margin or burn limit, minimum cash balance, headcount ceiling, strategic priorities.
- **Current-year actuals and forecast**: income statement by month and department, current headcount roster with salaries and start dates, open requisitions, current cash.
- **Revenue drivers**: for recurring revenue, starting recurring revenue, new bookings, expansion, churn and contraction by month; for transactional, traffic or leads, conversion, orders, average order value; for services, billable headcount, utilization, and rates. Sales capacity drivers where relevant (ramped quota-carrying reps × productivity).
- **Headcount inputs**: planned roles by department, level, location, start month, base salary or band midpoint, variable pay, and the burden rate (employer taxes, benefits, retirement contributions, per-head equipment and software).
- **Non-headcount spend**: contracts and renewals, software, rent and facilities, professional fees, travel, marketing programmes, insurance — by department, with contract dates.
- **COGS drivers**: hosting and infrastructure per unit of usage, third-party costs, payment fees, support and delivery staff.
- **Fiscal calendar**, currency, accounting basis, and whether capitalized costs (for example, capitalized software development) are in scope.
- **Approval process**: who approves, by when, and what format the board or leadership expects.
- **Known commitments and events**: signed contracts with price escalators, office moves, product launches, conferences, debt repayments.
- **Prior-year plan accuracy**: how far last year's plan was from actuals by line; it tells you where to be more conservative.

When the user supplies only a few numbers, build the structure anyway: fill what can be derived, mark every placeholder, and put the list of missing inputs at the top of the response.

## Workflow

1. **Set the frame.** Confirm fiscal year, the level of detail (department × account × month is typical), the approval deadline, and the targets that bind. Write the planning calendar backwards from the approval date.
2. **Establish the baseline.** Build the current run rate from recent actuals: headcount cost at current roster, committed contracts, recurring spend. This separates "cost we already have" from "new asks".
3. **Model revenue from drivers.** Build revenue month by month from its drivers, not from a growth percentage. Link sales capacity (hiring and ramp of quota-carrying roles) to bookings where relevant. Read [references/driver-based-model.md](references/driver-based-model.md) for the revenue, headcount, opex and COGS mechanics.
4. **Build the headcount plan.** One row per existing employee and planned hire, with department, start month, fully loaded monthly cost, and variable pay. Cost starts in the start month, not January. Add merit increases in their effective month, a vacancy or hiring-delay factor if the history supports it, and one-time recruiting costs.
5. **Build non-headcount opex by department.** Classify each line as fixed, variable (tied to a driver), or contractual (with renewal dates), and phase each by when it is incurred.
6. **Build COGS** from usage and delivery drivers, so gross margin moves with volume.
7. **Collect bottom-up requests** from budget owners using the template in [references/governance-and-owner-template.md](references/governance-and-owner-template.md). Each request states the driver, the outcome it supports, and what happens if it is not funded.
8. **Reconcile top-down and bottom-up.** Compare the sum of requests with the company envelope; rank incremental asks by outcome and timing; cut, defer, or fund with explicit trade-offs. Read [references/reconciliation-scenarios-and-cash.md](references/reconciliation-scenarios-and-cash.md) for the process.
9. **Phase by month.** Confirm every line has a monthly profile that reflects timing (hire dates, contract dates, seasonality, events), not an even twelfth unless the cost truly is even.
10. **Run scenarios.** Base, downside, and upside cases driven by a small number of named driver changes, each with pre-agreed actions (triggers) for what the company will do if the downside materializes.
11. **Translate to cash and runway.** Convert the plan to cash timing (collections, payment terms, annual prepayments, capital expenditure, taxes) and show month-end cash and runway for each scenario against the minimum cash balance.
12. **Package for approval** and set the reforecast cadence and owner accountability.

## Model structure

Build the model in three layers so it can be audited and re-run:

1. **Assumptions**: every driver and rate in one place, each with owner, source, and scenario values.
2. **Calculations**: monthly builds for revenue, headcount, non-headcount opex, COGS, and the cash bridge, referring only to the assumptions layer.
3. **Outputs**: P&L by month and department, headcount summary, scenario comparison, cash and runway.

A scenario is then a different column of assumptions, not a copy of the whole model. When the user works in a spreadsheet, describe the sheets and the key formulas; when they want the plan in the response, present the output tables with the assumptions register first.

## Worked example (illustrative, hypothetical numbers)

- A planned engineer with a base salary of 120,000 and an assumed burden rate of 25% costs 120,000 × 1.25 = 150,000 a year fully loaded, or 12,500 a month.
- Starting in April of a January–December fiscal year, the role costs 12,500 × 9 = 112,500 in the budget year, but adds 150,000 to next year's run rate. Budgets that show only in-year cost hide this; always show both.
- If an external recruiter fee is assumed at 20% of base, add a one-time 24,000 in the hire month (label the rate as an assumption; use the user's contracts).
- Department requests total 9,200,000 against an opex envelope of 8,000,000: a 1,200,000 gap, or 15% of the envelope, to close by ranking and deferring asks.
- With 6,000,000 of cash and an average net burn of 400,000 a month, runway is 6,000,000 ÷ 400,000 = 15 months before any minimum cash buffer; with a 2,000,000 buffer, usable runway is 10 months.

## Judgement calls and decision rules

- **Top-down first or bottom-up first.** Issue top-down guidance (envelope and priorities) before collecting requests; otherwise requests anchor on wishes and the reconciliation becomes a negotiation about cuts. Collect bottom-up detail to test whether the envelope is achievable.
- **Budget the hire month or the likely start month.** Budget cost from the realistic start month (offer plus notice period plus recruiting time), and track the requisition open date separately.
- **Vacancy factor.** Apply one only if history shows persistent slippage; state it as a percentage of planned new-hire cost and show it as a separate line, so departments are not budgeted below their approved plan without knowing it.
- **Zero-based versus incremental.** Zero-based budgeting (justify every line) suits discretionary spend and cost resets; incremental (baseline plus changes) is faster for stable, contractual costs. Mixing both by category is common.
- **Contingency.** Hold contingency centrally and visibly, not padded into department lines.
- **Phasing even or seasonal.** Use seasonal phasing for revenue and variable costs; even phasing only for costs that are genuinely even.

## Common failure modes to avoid

- **Last year plus a percentage.** It carries forward last year's mistakes and cannot explain itself when actuals diverge.
- **Every hire costed for twelve months.** Overstates in-year cost, then produces a false "underspend" that owners feel entitled to spend.
- **Only in-year cost shown.** Hides the run-rate commitment next year inherits; a plan can look affordable in year one and not in year two.
- **Revenue disconnected from capacity.** Bookings targets that assume sales hires the plan has deferred.
- **Sandbagged or padded lines.** Contingency hidden inside departments rather than held centrally and visibly.
- **Profit mistaken for cash.** Annual prepayments, payment terms, and capital spending move cash in different months from expense.
- **Downside cases without actions.** A scenario that nobody has agreed to act on is only a chart.

## Handing off

- Monthly actual-versus-budget explanations: budget-variance-explainer.
- Marketing programme allocation within the approved envelope: plan-marketing-budget.
- Sales capacity and quota inputs: plan-sales-territories and design-sales-compensation.
- Support headcount from workload: plan-support-staffing. Salary bands for new roles: design-comp-bands.
- Savings from software contracts in the baseline: audit-saas-spend. Near-term liquidity: build-cash-forecast.

## Output

Deliver the operating plan with these parts:

1. **Executive summary**: revenue, gross margin, operating expense, operating income or burn, ending cash, runway, and headcount for the base case, with the three assumptions that matter most.
2. **Assumptions register** — table: Driver | Value | Owner | Source (supplied / derived / assumed) | Scenario range.
3. **Revenue build** — table: Month | Driver lines (for example starting recurring revenue, new, expansion, churn) | Revenue.
4. **Headcount plan** — table: Role | Department | Level | Location | Start month | Base salary | Burden % | Fully loaded monthly cost | In-year cost | Annualized run-rate cost | Status (existing / approved / requested).
5. **Department budgets** — table: Department | Headcount cost | Non-headcount opex | Total | Change vs. prior year | Top-down envelope | Gap.
6. **Monthly P&L phasing** — revenue, COGS, gross margin, opex by department, operating income, by month.
7. **Scenarios** — table: Scenario | Driver changes | Revenue | Opex | Operating income | Ending cash | Runway (months) | Trigger and pre-agreed action.
8. **Cash and runway**: monthly cash bridge from operating income to cash, minimum cash point, and headroom versus the minimum balance.
9. **Reconciliation log**: requests funded, deferred, and declined, with rationale.
10. **Governance**: approval steps, reforecast cadence, and owners.

## Quality checks

Before answering, confirm:

- Every planned hire's cost starts in its start month and the annualized run-rate effect is shown.
- The burden rate is stated with its components and marked supplied or assumed.
- Revenue comes from drivers whose values are stated, not from a bare growth percentage.
- Department totals sum to the company total, and monthly phasing sums to the annual figure.
- Top-down envelope and bottom-up requests are both visible, and the gap and its resolution are documented.
- Each scenario changes named drivers and has a trigger and action; the downside is a real stress, not a rounding difference.
- Cash differs from profit where timing differs (annual prepayments, payment terms, capital expenditure), and runway uses cash, not operating income.
- No benchmark or "typical" percentage is presented as fact; every such figure is labelled as an assumption to replace.
- Illustrative numbers are marked hypothetical and their arithmetic has been recomputed.
- Deferred hires show both the in-year saving and the unchanged run rate.
- Revenue and sales hiring are linked: any deferred revenue-generating hire lowers the revenue build.
- Contingency, if any, is a visible central line.
- The reconciliation log records every funded, deferred, and declined request with a reason.

## Boundaries

- The plan informs decisions; leadership and the board approve targets and trade-offs. The skill ranks options and shows consequences; it does not decide which department to cut.
- Compensation changes, layoffs, and location-based pay decisions involve HR and employment counsel; salary bands come from design-comp-bands.
- Revenue recognition, capitalization of costs, and tax provisions follow the company's accounting policies; involve the controller, auditors, or tax advisers where the plan depends on them.
- Debt covenants, financing plans, and equity raises need the finance lead and, where relevant, lenders or counsel; the plan can show when cash falls to the minimum but does not choose the financing.
- Multi-currency plans need an agreed planning exchange rate; state it and show the sensitivity if exposure is material.
- Short-term liquidity management belongs in build-cash-forecast; actual-versus-budget analysis in budget-variance-explainer; marketing channel allocation in plan-marketing-budget; support headcount sizing in plan-support-staffing; acquisition economics in model-unit-economics.
