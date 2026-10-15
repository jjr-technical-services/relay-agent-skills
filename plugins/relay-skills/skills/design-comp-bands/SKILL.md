---
name: design-comp-bands
description: Design salary bands (pay ranges) from a job architecture and market data. Confirms job families and levels first, ages survey data to a common effective date with a user-supplied annual factor, rates match quality, sets a pay philosophy percentile, then builds midpoints, range spread ((max - min) / min), midpoint progression, and overlap by level, with geographic differentials. Places current employees with compa-ratio and range penetration, handles red- and green-circle cases, costs bringing people to minimum, and adds pay-transparency and pay-equity review steps. Use when asked to build salary bands, pay ranges, a compensation structure, compa-ratios, or to find who is under or over range. Do not use for sales commission or variable pay plans (design-sales-compensation), defining levels and expectations (design-career-ladder), or writing an individual offer letter.
---

# Design Comp Bands

A salary band (pay range) sets the minimum, midpoint, and maximum base pay the company is willing to pay for a job at a level. Good bands make pay decisions consistent, explainable, and defensible; bad ones either leak money or lose people, and inconsistent ones create pay equity risk. This skill builds bands the way compensation practitioners do: job architecture first, then market data aged to a common date, then a stated pay philosophy, then range math, then placement of current employees and the cost of fixing problems. Every number is traced to a supplied source or labeled as an assumption.

## Inputs to gather

- **Job architecture**: job families (groups of jobs with similar work, such as software engineering or customer support), levels with written definitions, and which employees sit in which job and level. If this does not exist, stop and build it first with design-career-ladder; bands on top of inconsistent leveling are meaningless.
- **Market data**: survey source names the user has licensed or collected, the percentiles reported (25th, 50th, 75th), survey effective dates, geography, company-size or industry cut, and number of organizations and incumbents per match.
- **Aging factor**: the annual rate the user wants to use to move survey data to a common effective date. Ask for it; do not supply one. If the user has none, show the calculation with a clearly labeled placeholder and flag it.
- **Pay philosophy**: target percentile (for example, 50th for all roles, or 75th for hard-to-hire families), which market (national, regional, remote), and whether the midpoint equals the target or sits at a stated premium or discount.
- **Employee data**: employee ID (no names needed), job, level, location, base salary, hire date, time in level, and performance rating if used. Demographic fields only for the pay equity step and only with HR's involvement.
- **Geography**: locations where people work and whether the company uses location-based pay.
- **Budget constraint**: any limit on adjustment spend this cycle.
- **Jurisdictions**: where the company hires, for the pay transparency check.
- **Population in scope**: which employees the bands cover (for example, full-time and part-time employees on base salary; contractors and hourly roles often need separate treatment). Part-time pay should be compared on a full-time-equivalent basis.
- **Pay element**: confirm the bands are for base salary. If the user wants target total cash (base plus target bonus), build that separately and label it.

When data is missing, proceed with placeholders labeled "Assumed" and list them in the assumptions table. Never fill a market value from general knowledge.

## Workflow

1. **Confirm the job architecture.** Check that each employee is in one job family and one level with a written definition. Flag jobs that span two levels or levels that mean different things in different families. Read `references/job-architecture-and-market-pricing.md`.
2. **Source and match market data.** For each benchmark job, record the survey job matched, match quality (strong, moderate, weak), sample size, and cut. Prefer data from more than one survey where available. Do not price a job from a title match alone.
3. **Age data to a common effective date.** Aged value = survey value × aging factor, using the user-supplied annual rate and the elapsed time from each survey's effective date to the chosen common date. State the method (compound or simple) and rate on the output.
4. **Blend and choose the market reference.** Where several surveys match, blend with stated weights (commonly by match quality and sample size). Record the market reference value at the target percentile for each job and level.
5. **Set the pay philosophy.** Decide the percentile target and whether any families have a different target. This is the leadership's decision; present the cost and competitiveness tradeoff, not a recommendation dressed as fact.
6. **Build the structure.** Set midpoints from the market reference, smooth them so midpoint progression between levels is consistent, and choose range spread by level. Check overlap between adjacent levels. Read `references/band-math.md` for formulas and decision rules. Run `scripts/comp_bands.py build` when the user supplies market data as a CSV.
7. **Apply geographic differentials** if the company uses location-based pay: either separate structures per location tier or a percentage differential applied to the national structure. State which, and the source of each differential.
8. **Place current employees.** Compute compa-ratio and range penetration for each person, list who is below minimum (green-circle) and above maximum (red-circle), and compute the annual cost to bring everyone to minimum. Run `scripts/comp_bands.py place` for this when data is in CSV. Read `references/placement-transparency-and-equity.md` for handling rules.
9. **Run a pay equity review step.** Before finalizing, check for unexplained pay differences between groups doing the same job at the same level. Involve HR and, where appropriate, employment counsel.
10. **Check pay transparency obligations.** Identify jurisdictions where the company must disclose ranges in postings or to employees, and route to counsel. Bands that will be published must be ranges the company actually intends to pay.
11. **Document governance.** Who approves bands, how often they are refreshed, how exceptions are approved, and how placement in range is decided for new hires and promotions.

## Using the script

`scripts/comp_bands.py` is arithmetic only, standard library Python.

- `python3 scripts/comp_bands.py build market.csv --target-date YYYY-MM-DD --aging-rate R [--aging-method compound|simple] [--spread S] [--round 100] [--output bands.csv]` reads columns `level, market_value, effective_date` and optional `spread`, and prints aged midpoints, min, max, spread, midpoint progression, and overlap with the level below. It flags any level whose midpoint does not rise above the level below, which usually means a matching problem or rows out of order.
- `python3 scripts/comp_bands.py place --bands bands.csv employees.csv` reads `level, min, midpoint, max` and `employee_id, level, salary`, and prints compa-ratio, range penetration, status, and cost to minimum, with a summary of counts, total cost to minimum, and average compa-ratio by level. Employees whose level is missing from the bands are listed as not placed.

Interpretation: a compa-ratio of 1.00 means pay equals the midpoint. Range penetration below 0% means below minimum; above 100% means above maximum. Average compa-ratio by level shows whether the structure sits above or below current pay overall; a level averaging well below 1.00 may mean the structure is too high for that level, or that the company pays below its stated philosophy, which is a decision for leadership.

When the user has no CSV, do the same arithmetic by hand in the tables and show each formula once.

## Worked example (illustrative, hypothetical numbers)

- A Level 3 job has a 50th percentile market value of 100,000 effective 1 January. The user supplies a 3% annual aging rate and a common date of 1 July. Simple aging: 100,000 × (1 + 0.03 × 0.5) = 101,500. Compound: 100,000 × 1.03^0.5 ≈ 101,489. Over half a year the difference is small; over longer gaps it grows.
- Using a midpoint of 100,000 and a 50% spread: min = 2 × 100,000 ÷ (2 + 0.50) = 80,000; max = 80,000 × 1.50 = 120,000. Check: (120,000 − 80,000) ÷ 80,000 = 0.50.
- Level 4 midpoint 115,000 gives midpoint progression (115,000 − 100,000) ÷ 100,000 = 15%. With the same spread, Level 4 runs 92,000 to 138,000. Overlap = (120,000 − 92,000) ÷ (120,000 − 80,000) = 70% of the Level 3 range.
- An employee at 90,000 in Level 3 has compa-ratio 90,000 ÷ 100,000 = 0.90 and range penetration (90,000 − 80,000) ÷ 40,000 = 25%. An employee at 76,000 is 4,000 below minimum.

## Decisions only the user can make

Surface these as explicit choices with their cost, rather than deciding them silently:

- Target percentile, overall and by family.
- Which labor market defines "market" for each family (geography, company size, industry).
- The annual aging rate and the common effective date.
- Whether to use one structure or several, and whether pay is location-based.
- Spread policy by level.
- How quickly to fix below-minimum pay, and the budget for it.
- What employees and candidates will be told about ranges.

## Common mistakes to avoid

- Pricing jobs from title matches, or from a single self-reported salary site.
- Mixing survey data from different effective dates without aging, or mixing different percentiles in one blend.
- Presenting a "market rate" without the source, cut, percentile, and date.
- Calculating spread from the midpoint in one place and from the minimum in another.
- Treating compa-ratio as a performance judgment; it only describes position relative to midpoint.
- Cutting the pay of red-circle employees, or leaving green-circle employees below minimum indefinitely.
- Publishing ranges that are wider than the company would actually pay, to satisfy a disclosure rule.
- Running the pay equity check after new bands are announced rather than before.

## Output

1. **Decisions and assumptions**: pay philosophy, target percentile, market definition, common effective date, aging rate and method, spread policy, and every assumption labeled.
2. **Market pricing table**

| Job | Level | Survey match | Match quality | Sample (orgs / incumbents) | Survey date | Aged value at target percentile | Weight | Blended market reference |
|---|---|---|---|---|---|---|---|---|

3. **Band structure table**

| Family | Level | Min | Midpoint | Max | Range spread | Midpoint progression | Overlap with level below |
|---|---|---|---|---|---|---|---|

4. **Geographic differentials** (if used): location tier, differential, source.
5. **Employee placement summary**: counts below, within, and above range by level; average compa-ratio by level; list of below-minimum and above-maximum employees by ID.
6. **Cost to minimum** and a proposed phasing if it exceeds the budget constraint.
7. **Red- and green-circle handling plan.**
8. **Pay equity review findings** (or the plan and owner if not yet run).
9. **Pay transparency check**: jurisdictions, obligations to confirm with counsel.
10. **Governance**: approvers, refresh cadence, exception process.
11. **Assumptions and open items**

| Item | Value used | Supplied, calculated, or assumed | Who must confirm |
|---|---|---|---|

## Quality checks

- Every employee sits in one job family and level before any band is applied.
- Every market value has a named source, date, cut, and match quality; nothing is filled from memory.
- All data is aged to the same effective date with the user's stated rate and method.
- Range spread uses (max − min) ÷ min, and min, midpoint, and max are internally consistent (midpoint is the average of min and max unless the user chose otherwise).
- Midpoints increase with level within each family; progression and overlap are stated for each step.
- Compa-ratio uses the midpoint; range penetration uses min and max; neither is confused with the other.
- Cost to minimum is computed from the actual below-minimum employees, annualized, and labeled.
- Red-circle employees are not cut; the handling plan is stated.
- The pay equity step and the transparency check are present, with counsel involvement noted.
- All worked numbers are recomputed and correct.
- Supplied data, calculated values, and assumptions are visibly separated in every table.
- Outliers were checked for leveling errors before being treated as pay problems.

## Boundaries

- Pay philosophy, percentile targets, adjustment budgets, and individual pay decisions belong to leadership and HR. This skill models options and costs.
- Pay transparency and pay equity laws vary by country, state, and city and change often. Flag the obligation and route to employment counsel; do not state the law as settled.
- Pay equity analyses that may be used in legal proceedings are often run under counsel's direction for privilege reasons; let counsel decide.
- Variable pay and sales commission plans belong to design-sales-compensation. Equity grants and executive pay usually need specialist advisers.
- Do not publish or share individual salary data beyond the people authorized to see it.
- Tax, benefits, and payroll cost loading (employer taxes, benefits that scale with pay) come from finance or payroll; label any loaded figure's source.
- Where employees are covered by a collective agreement or works council, pay structure changes may require consultation; involve HR and counsel.
