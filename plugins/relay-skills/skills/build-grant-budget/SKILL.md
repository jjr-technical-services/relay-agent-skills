---
name: build-grant-budget
description: Build a grant budget and line-by-line budget justification for a foundation, corporate or government funder - personnel with percent effort and fringe, direct versus indirect costs, shared-cost allocation with a documented basis, indirect rate rules (negotiated rate, funder caps, the federal de minimis rate), cost share and in-kind match, multi-year budgets, and restricted funds - then reconcile it to the chart of accounts and payroll allocation, and set up budget-to-actual tracking and requests to modify the budget. Use when asked to build a grant budget, write a budget narrative or budget justification, calculate indirect or overhead on a grant, check a funder's indirect cap, allocate staff time or rent across grants, or prepare a budget modification. Do not use for the whole organization's annual budget (build-operating-budget), explaining monthly variances in general (budget-variance-explainer), or writing the proposal narrative (write-grant-proposal).
---

# Build Grant Budget

A grant budget is a promise about how a specific pot of restricted money will be spent, and the budget justification is the evidence that each number was calculated, not guessed. Reviewers check three things: that every line is allowable and follows from the program design, that the math is traceable from a unit cost to the line total, and that the indirect cost request follows the funder's rules. Finance teams then have to live with the budget for the whole award period, so it must map to the chart of accounts and to how payroll is actually allocated. This skill builds that budget, the justification, the indirect cost check, and the tracking that keeps it honest after the award.

## Inputs to gather

Ask for these. Record who supplied each and label anything missing as **Assumed** with the line it drives.

- **Funder rules**: the guidelines or notice of funding, budget template, allowable and unallowable costs, indirect cost policy (cap, base, or "no indirect"), cost share or match requirement, budget period, and any line-item limits. Quote the funder's wording; never infer a cap from another funder.
- **Award type**: private foundation, corporate, state or local government, or US federal (direct or pass-through). Federal awards and most pass-through awards follow the Uniform Guidance, 2 CFR 200.
- **Program design**: activities, volumes and timeline from the proposal or logic model (build-logic-model), so each cost has a driver.
- **Staffing**: each role, annual salary or hourly rate, percent effort on this project by year, start month, and whether the person is an employee or a contractor. Fringe rate or actual benefit costs from payroll.
- **Organization cost facts**: negotiated indirect cost rate agreement (if any) with its base and effective dates; audited or board-approved financials; the chart of accounts; current shared costs (rent, software, insurance) and the basis used to allocate them today.
- **Match sources**: cash and in-kind contributions, who provides them, and how they will be documented.
- **Other funding for the same program**, so the same cost is not charged twice.

If the user gives only a total ("we need 150,000"), build the structure from the program design, show which lines are estimates, and list the facts needed to replace them.

## Workflow

1. **Read the funder rules first and quote them.** Extract into a short rules table: budget period, allowable categories, indirect policy (rate, base, cap, how the cap is expressed), match requirement, line limits, template, and whether the budget justification has its own page or character limit. Every later check refers back to this table.
2. **List activities and their cost drivers.** From the program design, list each activity with the quantity that drives cost (workshops, sessions, participants, sites, months). A line with no driver is a line a reviewer will cut.
3. **Build personnel.** One row per role: annual salary × percent effort × months in period ÷ 12. Effort must match what the person will actually spend and what payroll will charge. Total effort for one person across all funding sources cannot exceed 100%. Read [references/cost-principles-and-indirect.md](references/cost-principles-and-indirect.md) for effort and fringe mechanics.
4. **Apply fringe.** Use actual benefit costs or the organization's documented fringe rate. Apply it to salary lines only, not to contractors or stipends.
5. **Build the other direct costs.** Travel (trips × travelers × per-trip cost, following the organization's travel policy), supplies, contractual services, subawards (a partner carrying out part of the program, as distinct from a contractor selling a service), participant support costs (stipends, travel or fees paid to or for participants, not employees), equipment (per the organization's capitalization threshold and the funder's definition), and other. Classify each line carefully; classification changes the indirect base.
6. **Allocate shared costs with a documented basis.** When rent, software, or a shared role serves several programs, charge this grant only its share, using a basis you can defend (square footage, headcount, direct salary, time records). Write the basis beside the line. Never charge the same cost as both a direct cost and inside the indirect rate.
7. **Calculate indirect costs.** Choose the rate the organization is entitled to, apply it to the correct base, and compare with the funder's cap. Run `scripts/grant_budget.py` for the arithmetic when a CSV of lines exists. Read [references/cost-principles-and-indirect.md](references/cost-principles-and-indirect.md) for the rules and formulas.
8. **Add cost share and match.** Separate cash match (money the organization or another funder spends) from in-kind match (donated goods, services or space valued at fair market value). Match must meet the same allowability rules and be documented; do not count a cost that another award already pays for.
9. **Extend to multiple years if needed.** Show each year, with cost-of-living increases or effort changes labelled as assumptions, and a total column. Do not front-load or back-load costs without a program reason.
10. **Write the budget justification line by line.** For every line: the calculation, the reason the program needs it, and the basis of any rate. Read [references/justification-and-reconciliation.md](references/justification-and-reconciliation.md) for the pattern and a worked example.
11. **Reconcile to the books.** Map each budget line to general ledger accounts and a grant or class code, and confirm that payroll allocation by grant will charge the effort in the budget. Flag any line with no account mapping.
12. **Set up post-award tracking.** Define the budget-to-actual report, the funder's variance thresholds, and the trigger for a budget modification request. Read [references/post-award-tracking.md](references/post-award-tracking.md).

## Indirect cost rules in brief

- **Negotiated rate**: if the organization has a current negotiated indirect cost rate agreement with a federal agency, federal awards generally must accept it unless a statute or program rule limits it; state the base and dates exactly as the agreement does.
- **De minimis rate**: organizations without a negotiated rate may use the de minimis rate set in 2 CFR 200.414(f), 15% of modified total direct costs since the October 2024 revision; confirm the current rule and the funder's own cap. Modified total direct costs (MTDC) exclude, among others, equipment, rental costs, participant support costs, tuition remission, scholarships and fellowships, and the portion of each subaward above the first 50,000 (confirm the current thresholds in 2 CFR 200.1).
- **Funder cap**: private and many public funders set their own cap. Read how the cap is expressed. A cap of X% of direct costs allows X × direct. A cap of X% of the total award allows X × direct ÷ (1 − X), because the indirect is itself part of the total.
- **When the request exceeds the cap**: reduce indirect to the cap, and show the unrecovered amount as organizational cost share only if the funder allows unrecovered indirect to count as match. Never move indirect costs into direct lines to get around a cap; that is double charging.

## Worked example (illustrative, hypothetical round numbers)

A one-year program budget, to show the mechanics. Replace every figure with the user's own.

| Line | Category | Calculation | Amount |
| --- | --- | --- | --- |
| Program coordinator | Personnel | 60,000 × 50% × 12 ÷ 12 | 30,000 |
| Fringe | Fringe | 30,000 × 20% (assumed rate) | 6,000 |
| Workshop materials | Supplies | 40 workshops × 100 | 4,000 |
| Advisory stipends | Participant support | 12 members × 500 | 6,000 |
| Program space | Rental | 48,000 × 500 ÷ 2,000 square feet | 12,000 |
| Total direct costs | | | 58,000 |

- MTDC excludes the stipends and the rent: 58,000 − 6,000 − 12,000 = 40,000.
- De minimis indirect: 0.15 × 40,000 = 6,000. Total request: 58,000 + 6,000 = 64,000.
- If the funder caps administrative costs at 10% of the total request, the maximum is 0.10 × 58,000 ÷ 0.90 = 6,444.44, so 6,000 is within the cap with 444.44 of headroom.
- The common error of 15% on all direct costs gives 0.15 × 58,000 = 8,700, a total of 66,700, and indirect equal to 13.0% of the total request (8,700 ÷ 66,700), which exceeds that cap by 8,700 − 6,444.44 = 2,255.56.

## Judgement calls and decision rules

- **Contractor or subaward?** If the partner makes program decisions, is measured against program objectives, and must follow the award's terms, treat it as a subaward. If it sells a defined service to many buyers on its own terms, treat it as a contract. The choice changes the indirect base and the monitoring duties; record the reasoning.
- **Participant support or supplies?** Costs paid to or on behalf of participants (stipends, participant travel, registration fees) are participant support; materials the program uses to deliver sessions are supplies.
- **Equipment or supplies?** Use the lower of the organization's capitalization threshold and the funder's definition; under 2 CFR 200.1 equipment means a useful life of more than one year and a per-unit cost at or above the lesser of the organization's threshold or 10,000 since the 2024 revision (confirm the current figure). A cart of laptops each below the threshold is supplies even when the total is large.
- **Direct-charge a shared cost or leave it in indirect?** Direct-charge only with a measurable basis, the funder's permission, and no overlap with the indirect pool.
- **Ask for full cost or fit the cap?** Budget the true cost, then show the portion the funder will not cover and which unrestricted source pays it. Hiding unrecovered cost weakens the organization's case for future indirect recovery.
- **Voluntary cost share?** Offer it only when the funder scores it or it is strategic; once awarded it must be tracked like mandatory match.

## Using the script

`scripts/grant_budget.py` totals a budget CSV by category, builds the chosen base (MTDC by default) with every exclusion listed, applies the rate, and checks a cap expressed on total direct costs, on MTDC, or on the total award. Example:

`python3 scripts/grant_budget.py budget.csv --rate 0.15 --base mtdc --cap 0.10 --cap-base total`

Read its output this way: the base section shows which lines were excluded and why; "Exceeds cap by" gives the amount to cut or reclassify as cost share; the justification table marks any line missing its calculation basis. The script checks arithmetic and categories. It does not decide whether a cost is allowable or which category an ambiguous line belongs to; record those judgements in the narrative.

## Common errors this skill prevents

- Applying an indirect rate to total direct costs when the rate is defined on MTDC.
- Reading "10% of the request" as 10% of direct costs, which overstates the allowed indirect.
- Treating stipends, participant travel, or rent as ordinary direct costs inside the base.
- Charging fringe on contractor fees or stipends.
- Budgeting one person above 100% effort across awards, or at an effort payroll will never charge.
- Counting the same cost as match on two awards, or as match and as a direct charge.
- Charging a shared cost directly with no written basis, which fails at audit even when the amount is fair.
- Moving indirect costs into direct lines to get around a cap.
- Presenting a fringe rate or cost per participant from another organization as fact.
- Leaving the justification as adjectives instead of calculations.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Funder rules table
2. Budget table
3. Allocation basis
4. Indirect cost check
5. Budget justification
6. Reconciliation map
7. Tracking plan
8. Assumptions and open questions

Use these exact labels where they apply: "Personnel", "Fringe", "Supplies", "Equipment", "Participant support", "MTDC", "Within cap", "Exceeds cap by", "Cash", "In-kind" as budget categories and results; name the indirect base explicitly, for example MTDC or total direct costs.

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Use plain tables; do not use Markdown checkboxes.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

1. **Funder rules table**: rule, funder wording, source (document and page or section), effect on the budget.
2. **Budget table**: line, category, calculation, year columns, total, cost share, cash or in-kind. Personnel rows show salary, percent effort, months, and fringe.
3. **Allocation basis**: every shared cost with its basis, the calculation, and where the basis is documented.
4. **Indirect cost check**: rate used and why the organization is entitled to it, base type, base amount with exclusions listed, indirect amount, funder cap with its formula, and a result of "Within cap" or "Exceeds cap by" an amount, plus the recommended fix. When the user proposed a rate or base, show the check for their proposal and for the corrected budget side by side, so the difference is visible.
5. **Budget justification**: one paragraph or table row per line with calculation, program need, and rate basis.
6. **Reconciliation map**: budget line, general ledger account, grant or class code, payroll allocation source.
7. **Tracking plan**: budget-to-actual cadence, the funder's variance threshold, and the modification trigger.
8. **Assumptions and open questions**: each assumed figure with the line it drives and who can confirm it.

## Quality checks

Run these before answering.

- Every line total equals its stated calculation; the year columns sum to the total; the categories sum to total direct costs.
- No person exceeds 100% effort across all sources, and effort matches the program narrative.
- Fringe is applied to salaries only.
- The indirect base matches the rate's definition; participant support, equipment, rent and subaward amounts above the threshold are out of an MTDC base.
- The cap test uses the funder's own formula, and the "Exceeds cap by" amount has a stated fix.
- No cost appears both as a direct line and inside the indirect rate, or on two awards.
- Match is split into cash and in-kind with a documentation source.
- Every assumed figure is labelled; no benchmark or "typical" rate is presented as fact.

## Boundaries

- This skill does not decide allowability in disputed cases, sign certifications, or negotiate an indirect cost rate. The organization's finance lead, its auditor, and the funder's grants officer decide those.
- Tax, audit (including whether a Single Audit is triggered), and legal questions go to the organization's accountant or counsel.
- Federal rules change; state the rule the budget relies on and tell the user to confirm the current version of 2 CFR 200 and the funder's notice before submission.
- Hand-offs: the proposal narrative to write-grant-proposal, activities and outputs to build-logic-model, evaluation costs to design-program-evaluation, reporting against the budget to write-funder-report, and whole-organization budgeting to build-operating-budget.
