# Budget methods: top-down, back-solve, and bottom-up

## 1. Top-down methods

### Percent of revenue (heuristic only)

`marketing budget = revenue base × chosen percentage`

- The revenue base can be last year's actual revenue, this year's plan, or the new-revenue target; say which.
- The percentage is a policy choice. Published surveys report a wide spread by industry, stage, and growth goal, and are often self-reported and inconsistent in what they count as marketing. Use only a figure the user supplies with its source, and never present one as a norm.
- Useful as a sanity check on affordability and as a way finance communicates an envelope. It cannot say whether the budget will reach the target, because it ignores conversion rates and costs.

### Pipeline back-solve (target-driven)

Work backward from the outcome. For each channel c with share `s_c` of the target:

1. `revenue_c = revenue target × s_c`
2. `deals_c = revenue_c ÷ average deal size_c`
3. `opportunities_c = deals_c ÷ win rate_c`
4. `leads_c = opportunities_c ÷ lead-to-opportunity rate_c`
5. `program cost_c = leads_c × cost per lead_c`
6. `program CAC_c = program cost_c ÷ deals_c`

Then:

- `total program cost = Σ program cost_c`
- `fully loaded CAC = (total program cost + fixed marketing costs allocated to new business) ÷ total deals`

Compare fully loaded CAC with the maximum acceptable CAC from finance. If it is higher, the target, the rates, or the cost base must change, and the plan should say which.

**Timing:** leads needed for deals closing in quarter Q must enter the funnel roughly one median sales cycle earlier. For a 90-day cycle, deals closing in Q2 need leads in Q1. The back-solve for the first quarter of a year therefore depends on pipeline already created in the prior year; count it.

**Where the rates come from:** cohort-based rates from the CRM (leads created in a period, followed to outcome), per channel. Blended rates hide the fact that a lead from a referral and a lead from a content download convert very differently. When per-channel history is thin, use the blended rate, label it, and widen the scenario range.

**Sales-sourced and partner-sourced pipeline:** if sales development or partners also source pipeline, back-solve their shares separately so marketing is not budgeted for the whole target.

### Objective-and-task

A general form of the back-solve for goals that are not pipeline (awareness in a new region, a product launch, event attendance): define the objective, the tasks required to reach it, and cost each task. It is only as good as the evidence that the tasks produce the objective; state that evidence.

## 2. Bottom-up by program

List every program with the same fields so they can be compared and cut consistently.

| Field | Content |
| --- | --- |
| Program | Name and short description |
| Channel | Paid search, events, content, partner, email, etc. |
| Owner | Person accountable |
| Cost type | Fixed (committed) or variable (can be changed within the quarter) |
| Cost | By quarter |
| Expected output | Leads, opportunities, or another measurable result |
| Basis for expected output | Past results of this program (supplied), derived from rates, or assumed |
| Marginal evidence | What happened last time spend changed |
| Incrementality evidence | Tested, modeled, or attributed only |
| Kill or scale rule | The result that would cut or grow it |

Rules:

- Expected output comes from the program's own history where possible. New programs get an explicitly labeled assumption and usually belong in the test reserve.
- Do not double count: an event and the paid campaign promoting it cannot both claim the same leads.
- Include production costs (content, creative, agency fees) and not only media.

## 3. Fixed vs. variable

| Category | Examples | How quickly it can change |
| --- | --- | --- |
| People | Salaries, benefits, payroll taxes, bonuses, recruiting | Slowly; hiring takes months and reductions involve HR and legal |
| Contractors and agencies on retainer | Monthly retainers with notice periods | By the notice period in each contract |
| Tools | Marketing automation, analytics, design, data subscriptions | At renewal, unless the contract allows early termination |
| Programs | Media, events, sponsorships, content production, paid tools billed on usage | Often within weeks, except prepaid sponsorships and event deposits |

Show fixed and variable totals separately. The fixed share determines how a percentage cut lands on programs:

`program cut share = total cut ÷ variable programs`

For example (hypothetical), a 20% cut to a $1,000,000 budget with $600,000 fixed removes $200,000, which is half of the $400,000 in programs.

## 4. Reconciling the views

| Check | Question |
| --- | --- |
| Output gap | Do the programs' expected leads and opportunities meet the back-solve requirement by quarter? |
| Cost gap | Does the bottom-up total fit inside the top-down envelope? |
| Evidence gap | How much of the expected output rests on Assumed figures? |
| Timing gap | Is lead generation early enough for the sales cycle? |

If the gap cannot be closed with evidence-backed programs, say so and present the choice: lower the target, raise the envelope, or accept a plan that relies on untested assumptions, labeled as such.
