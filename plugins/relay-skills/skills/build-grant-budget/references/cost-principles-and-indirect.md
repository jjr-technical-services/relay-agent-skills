# Cost principles, personnel, and indirect costs

## Direct versus indirect

- **Direct cost**: a cost that can be identified specifically with this project with a high degree of accuracy (a program coordinator's time on this project, workshop materials, participant stipends).
- **Indirect cost** (also called facilities and administrative, overhead, or shared cost): a cost that benefits several programs and cannot be tied to one without effort out of proportion to the benefit (finance and HR staff, the executive director's general management time, audit fees, general liability insurance, organization-wide software).
- The same type of cost must be treated consistently. If the organization charges a cost as indirect in its rate, it cannot also charge the same type of cost directly to a grant in like circumstances. This consistency rule is the main double-charging safeguard under 2 CFR 200.412 and 200.403.

Some costs can go either way depending on documentation. Rent for program space used only by one program can be direct; rent for a shared office is usually allocated or left in the indirect pool. Decide the treatment once, write it in the organization's cost allocation policy, and apply it to every award.

## Personnel

Formula for each role and year:

`salary charged = annual salary × percent effort × (months in period ÷ 12)`

`fringe charged = salary charged × fringe rate` (or actual benefits for the person × percent effort)

Rules:

- Percent effort is the share of the person's total paid working time spent on this project. It is not a share of 40 hours if the person works a different schedule.
- The sum of a person's effort across all awards and unrestricted work equals 100%. Grants cannot together pay for more than 100% of anyone.
- Effort in the budget must match the payroll allocation by grant that will actually be run, and time records must support it. Under 2 CFR 200.430, charges for salaries must be based on records that accurately reflect the work performed; budget estimates alone are not support after the fact.
- Contractors are not personnel. Put them under contractual with rate × hours or a fixed fee, and no fringe.
- Apply cost-of-living or merit increases only from their effective month, and label the percentage as an assumption unless board-approved.

Illustrative (hypothetical round numbers): a coordinator earning 60,000 at 50% effort for a 12-month year is 60,000 × 0.50 × 12 ÷ 12 = 30,000. At an assumed 20% fringe rate, fringe is 30,000 × 0.20 = 6,000. If the award starts in month 4 of the organization's year and runs 9 months in year one, year-one salary is 60,000 × 0.50 × 9 ÷ 12 = 22,500.

## Allocating shared costs

A shared cost charged directly needs an allocation basis that is reasonable, consistently applied, and documented. Common bases, and when to use them:

| Cost | Common basis | When it fits |
| --- | --- | --- |
| Rent and utilities | Square footage used by the program ÷ total | Program has dedicated or measurable space |
| Shared software seats | Seats or users on the program ÷ total | Licenses are per user |
| Shared program staff | Time records by program | Always preferred for people |
| Supplies bought in bulk | Units consumed by program | Consumption can be counted |
| General office costs | Direct salaries by program ÷ total direct salaries | No better measure exists |

Formula: `share charged = total shared cost × (program's measure ÷ total measure)`

Illustrative: rent of 48,000 a year for 2,000 square feet, where the program uses 500 square feet, allocates 48,000 × 500 ÷ 2,000 = 12,000. Record the floor plan or occupancy count as the documentation source.

Practitioners disagree about direct-charging shared costs versus leaving them in the indirect pool. Decision rule: charge directly only when the funder allows it, the basis is measurable, and the same cost type is not already in the organization's indirect rate. Otherwise leave it in indirect.

## Indirect rate options

1. **Negotiated indirect cost rate agreement** with a federal cognizant agency. It states the rate, the base (often MTDC or salaries and wages), and the effective period. Federal awarding agencies generally must accept it, unless a statute, regulation, or program notice sets a lower limit; any such limit should be quoted.
2. **De minimis rate**: the de minimis rate set in 2 CFR 200.414(f), 15% of modified total direct costs since the October 2024 revision; confirm the current rule and the funder's own cap. It needs no negotiation but must be applied consistently to all federal awards once elected, and costs inside it may not also be charged directly.
3. **Funder's own policy** (most private foundations and corporate funders): a flat cap, a fixed amount, "no indirect", or full cost recovery. Some foundations now encourage full indirect recovery; read the guidelines rather than assuming.
4. **Pass-through awards**: a state or intermediary passing federal money through must honor the subrecipient's negotiated rate or allow the de minimis rate, subject to program rules. Confirm with the pass-through entity.

## Modified total direct costs (MTDC)

Under 2 CFR 200.1 (as revised in 2024), MTDC includes direct salaries and wages, fringe benefits, materials and supplies, services, travel, and up to the first 50,000 of each subaward regardless of the period of performance. It excludes equipment, capital expenditures, charges for patient care, rental costs, tuition remission, scholarships and fellowships, participant support costs, and the portion of each subaward above 50,000. Confirm the current thresholds before relying on them.

Formula: `MTDC = total direct costs − excluded categories − (each subaward amount above the threshold)`

`indirect = rate × base`

## Funder caps

Read the cap's wording exactly.

| Wording | Maximum indirect |
| --- | --- |
| "up to X% of direct costs" | X × total direct costs |
| "up to X% of MTDC" or "of modified direct costs" | X × MTDC |
| "no more than X% of the total request" or "of the grant" | X × direct ÷ (1 − X) |
| "fixed administrative fee of N" | N |
| "indirect costs not allowed" | 0; consider direct-charging only costs that are genuinely direct and documented |

If the wording is ambiguous, write the question for the program officer and budget to the stricter reading until answered.

## Worked example (illustrative, hypothetical round numbers)

Direct lines: salaries 100,000; fringe 25,000; travel 5,000; supplies 10,000; participant stipends 20,000; equipment 15,000; one subaward 80,000.

- Total direct costs = 100,000 + 25,000 + 5,000 + 10,000 + 20,000 + 15,000 + 80,000 = 255,000.
- MTDC = 100,000 + 25,000 + 5,000 + 10,000 + 50,000 (first 50,000 of the subaward) = 190,000. Stipends and equipment are excluded; 30,000 of the subaward is excluded.
- De minimis indirect = 0.15 × 190,000 = 28,500.
- Funder cap "10% of direct costs": maximum = 0.10 × 255,000 = 25,500. Result: Exceeds cap by 3,000.
- Funder cap "10% of the total grant": maximum = 0.10 × 255,000 ÷ 0.90 = 28,333.33. Result: Exceeds cap by 166.67.
- A common error is 0.15 × 255,000 = 38,250 (rate applied to total direct costs instead of MTDC), which overstates indirect by 9,750.

`scripts/grant_budget.py` reproduces these figures from a CSV.

## Cost share and match

- **Mandatory** cost share is required by the funder; **voluntary committed** cost share is offered in the proposal and becomes binding once awarded. Offer voluntary cost share only when it is strategic, because it must then be tracked and documented.
- **Cash match**: money spent from the organization's unrestricted funds or another funder's award that permits it.
- **In-kind match**: donated goods, services, or space, valued at fair market value, with documentation such as a signed letter from the donor stating the item, date, hours or quantity, and value basis. Volunteer time is valued at the rate for similar paid work in the local market; label the rate source.
- Match must be allowable, necessary for the project, not paid by another federal award (for federal match), and recorded in the books.
- Unrecovered indirect costs (the gap between the organization's rate and a lower cap) may count as cost share only with the funder's prior approval.

## Restricted versus unrestricted

A grant is usually a donor-restricted contribution for accounting purposes (purpose or time restrictions). Spend it only on the approved budget and period. Costs that exceed the award, or are unallowable, are paid from unrestricted funds; name that funding source in the budget narrative when the project's full cost exceeds the request. Accounting classification (for example under FASB ASU 2018-08, conditional versus unconditional contributions) is for the organization's accountant to decide.
