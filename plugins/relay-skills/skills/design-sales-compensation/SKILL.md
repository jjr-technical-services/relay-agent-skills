---
name: design-sales-compensation
description: Design sales compensation plans that pay for the behaviour the business needs at a cost it can afford. Defines roles, OTE and pay mix by role (SDR, hunter, farmer), up to three measures linked to quota, base commission rate math, accelerators, decelerators, thresholds, caps, SPIFFs, clawbacks, crediting and split rules, a cost-of-sales check, payout modelling at 50/80/100/120/150 percent attainment, and a plan document outline. Use when asked to build or fix a comp plan, set commission rates, choose pay mix or OTE for sales roles, add accelerators, model what reps earn at different attainment, or check whether a plan is affordable. Do not use for carving territories or setting quota totals (use plan-sales-territories), for salary bands of non-sales roles (use design-comp-bands), or for drafting an offer letter.
license: MIT
---

# Design Sales Compensation

A sales compensation plan is a contract that tells sellers what the company values and how much it will pay for it. The plan must be simple enough that a rep can calculate their own pay, linked to quotas that are achievable, affordable at every level of attainment, and legally sound where the reps work. This skill designs or repairs a plan by role: pay mix, measures, rate math, payout curve, crediting rules, and governance, then models the cost before anyone signs it.

## Inputs to gather

Ask for these. When one is missing, proceed with a labelled placeholder and list it under "Open inputs".

- **Roles in scope:** titles, what each role owns (new logos, expansion, renewals, meetings booked), headcount, and who they hand off to.
- **Business goals for the period:** growth versus retention, new product push, margin, multi-year deals, cash collection. Rank them; a plan cannot reward everything.
- **Current plan:** documents, OTE, base, pay mix, rates, accelerators, caps, and known complaints.
- **Quotas:** by role and rep, and how they were set (link to plan-sales-territories output if available).
- **Attainment history:** distribution of attainment for the last 4 to 8 periods, by role. This drives the cost model.
- **Market pay data:** any salary survey or recruiter data the user has licensed. Do not invent market figures.
- **Finance limits:** target cost of sales, budget for variable pay, payment timing, and whether commission is paid on booking, invoice, or cash.
- **Jurisdictions:** where every rep lives and works. Commission law is local.

Label every figure **Supplied**, **Derived** (show the formula), or **Assumed** (must be confirmed).

## Workflow

1. **Start from strategy.** Write down the two or three outcomes the plan must drive this period and the behaviours that produce them. Every plan element must trace to one of them.
2. **Define roles precisely.** For each role, state the customers it owns, the motion (hunter: wins new customers; farmer: grows and retains existing ones; sales development representative (SDR): creates qualified meetings for others), and the handoffs. Overlapping roles cause double-paying or disputes.
3. **Set OTE and pay mix.** On-target earnings (OTE) is base plus target variable pay at 100 percent attainment. Pay mix is the base-to-variable split. Set mix by how much the rep's own effort determines the sale; read references/plan-architecture.md for the reasoning by role. Use the user's market data for OTE levels.
4. **Choose at most three measures.** Primary measure first (for example, new ARR), then at most two secondary measures (for example, multi-year term or a product line). Give each a weight; a measure worth very little is ignored. Tie each measure to a quota.
5. **Link to quota.** Confirm quotas exist, are set from capacity and potential, and that the historical attainment distribution is plausible. A plan cannot fix bad quotas.
6. **Do the rate math.** Base commission rate (BCR) = target variable pay for the measure / quota for the measure. Build tiers: any threshold or decelerator below a set attainment, BCR through 100 percent, and accelerators above. Recalibrate lower tiers so the rep earns exactly the target variable at 100 percent. Read references/rate-math-and-modeling.md.
7. **Decide on caps, SPIFFs, and clawbacks.** Default to no cap; handle windfalls with a large-deal review clause defined in advance. Use SPIFFs (short, specific incentive payments) sparingly. Define clawbacks for cancellations or non-payment within a stated window, subject to local law.
8. **Write crediting rules.** Who gets credit when, for what amount, in which period; split rules for overlays and territory transfers; treatment of multi-year deals, renewals, discounts, and returns.
9. **Model payouts and cost.** Compute payout and total earnings at 50, 80, 100, 120, and 150 percent attainment for each role, then apply the historical attainment distribution to estimate total cost and cost of sales. Use `scripts/payout_curve.py`.
10. **Stress-test.** Check the plan against gaming: sandbagging deals into the next period, splitting or inflating deals, heavy discounting to hit volume, and pushing one measure at the expense of others. Adjust rules that invite it.
11. **Document and govern.** Produce the plan document outline, the approval path, the exceptions process, and the communication plan. Read references/plan-document-and-governance.md.

## Routing

- Read references/plan-architecture.md when setting roles, pay mix, OTE, measures and weights, or crediting and split rules.
- Read references/rate-math-and-modeling.md when computing rates, tiers, accelerators, thresholds, caps, SPIFFs, clawbacks, payout curves, or cost of sales.
- Read references/plan-document-and-governance.md when writing the plan document, planning the rollout, or answering legal and governance questions.
- Hand off to plan-sales-territories for territory design and quota totals, to design-comp-bands for base salary structures across the company, and to the budget-variance-explainer prompt for explaining a variance in commission expense after the fact.

## Core formulas

```
OTE                     = base salary + target variable pay
Pay mix                 = base / OTE : target variable / OTE
Base commission rate    = target variable pay / quota
Tier rate               = BCR x tier multiplier
Variable payout         = sum over tiers (bookings in tier x tier rate)
Payout as % of target   = variable payout / target variable pay
Rep cost of sales       = (base + variable payout) / bookings credited
Quota-to-OTE multiple   = quota / OTE
```

## Decision rules at a glance

- **Mix follows influence.** The more the individual rep determines whether the sale happens, the higher the variable share. Hunters above farmers; SDRs and overlays more base-heavy.
- **Rates are derived, never chosen.** Every rate is BCR times a multiplier, and the multipliers below 100 percent must sum (weighted by band width) to exactly 1.0.
- **Threshold from history.** Put any threshold or decelerator at the attainment level most reps reach even in a weak period, not at a round number.
- **Accelerate, do not cap.** Handle windfalls with a large-deal review clause written in advance; use a cap only with a stated reason and the number of reps it would have affected last period.
- **Pay on the value you want.** If discounting or front-loaded multi-year deals are a problem, change the credited amount (first-year ARR, discount modifier) rather than adding a measure.
- **Earning event before payment event.** Decide when commission is earned separately from when it is paid; clawbacks and termination rules depend on it.
- **Model the distribution, not the average.** Payout curves are non-linear, so cost at average attainment understates the cost of a spread of results.

## Common failure modes

- Five or six measures, each too small to change behaviour.
- A rate picked as a round percentage that does not pay target variable at 100 percent.
- Account managers paid full rate on renewals that would have happened anyway.
- SDRs paid on meetings held regardless of quality, producing meetings no one can sell to.
- Mid-period changes to rates or quotas that reps experience as a pay cut, with legal exposure.
- A plan only the comp administrator can calculate.

## Script

`scripts/payout_curve.py` computes a payout table from quota, target variable, base, and tier definitions, and checks that the plan pays exactly the target variable at 100 percent attainment.

```
python3 scripts/payout_curve.py --quota 1000000 --target-variable 100000 --base 100000 \
  --tiers "0.5:0.5,1.0:1.5,inf:2.0"
```

Tiers are `upper attainment bound:multiplier of BCR`, in order. Output columns: attainment, bookings, variable payout, payout as a percentage of target variable, total earnings, cost of sales, and marginal rate. Add `--cap 2.0` to model a cap at 200 percent of target variable and `--attainment 0.5,0.8,1.0,1.2,1.5` to choose the points. Add `--distribution attainment.csv` (one row per rep with an `attainment` column) to estimate expected total variable cost and plan cost of sales across the historical distribution; the script also prints what the naive estimate (payout at mean attainment times headcount) would have been, which shows how much a non-linear curve changes cost. If the script warns that 100 percent attainment does not pay target variable, fix the lower-tier multipliers before going further. Read the cost-of-sales column to see how cost changes with attainment: because base is fixed, cost of sales falls as attainment rises unless accelerators offset it.

## Output

Deliver in this order:

1. **Summary:** the outcomes the plan drives, the main changes from the current plan, total modelled cost at expected attainment, and decisions needed.
2. **Role definitions:** table with columns `Role | Owns | Motion | Hands off to | Headcount`.
3. **OTE and pay mix:** table with columns `Role | Base | Target variable | OTE | Mix | Rationale | Data source`.
4. **Measures and weights:** table with columns `Role | Measure | Weight | Quota | Crediting event | Payment timing`.
5. **Rate table:** table with columns `Role | Tier (attainment band) | Multiplier | Rate | Notes`, with the BCR formula shown.
6. **Payout model:** table with columns `Attainment | Bookings | Variable payout | % of target variable | Total earnings | Cost of sales` at 50, 80, 100, 120, and 150 percent for each role.
7. **Cost of sales check:** expected total cost using the attainment distribution, compared with the finance target.
8. **Rules:** crediting and splits, thresholds, caps or windfall clause, SPIFF policy, clawbacks, leavers and joiners, disputes.
9. **Gaming risks and mitigations.**
10. **Plan document outline** and rollout plan.
11. **Assumptions, open inputs, and items for legal and HR review.**

## Quality checks

Run these before answering:

- Each role has no more than three measures, and each measure carries enough weight to matter.
- The payout at exactly 100 percent attainment equals target variable pay for every role; show the check.
- Rates are derived from BCR = target variable / quota, not picked as round numbers.
- The payout table covers 50, 80, 100, 120, and 150 percent attainment and all arithmetic has been rechecked.
- Cost of sales is computed at each attainment point and at the expected attainment distribution.
- Any pay mix, OTE, or quota-to-OTE figure is from the user's data or labelled as a heuristic to replace; no market figure is invented.
- Crediting rules say what event earns credit, when commission is earned, and when it is paid.
- If a cap is proposed, the reason is stated along with its effect on top performers.
- Legal review items are listed for every jurisdiction where reps work.

## Boundaries

- This skill designs plan mechanics. Compensation decisions belong to sales leadership, finance, and HR, and final plan terms must be approved through the company's governance.
- Commission and wage-payment laws vary by state and country: rules on written plans, when commissions are earned, payment timing after termination, deductions, and clawbacks differ. Some jurisdictions require written, signed commission agreements explaining how commissions are computed and paid. Involve employment counsel before issuing, changing, or retroactively applying any plan, and before implementing clawbacks.
- Revenue recognition and capitalisation of commission costs are accounting questions; involve the finance team and auditors.
- Pay equity: review OTE and plan outcomes across comparable roles for unexplained differences with HR and counsel.
- Do not provide individual tax advice on commission payments.
