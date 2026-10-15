---
name: model-unit-economics
description: Model the unit economics of a subscription or transactional business - contribution margin per customer or order, CAC (fully loaded vs. paid-only, blended vs. by channel), CAC payback on gross margin, LTV with its caveats, LTV:CAC, sensitivity tables, and segment and channel breakdowns. Use when asked to calculate CAC, LTV, payback period, contribution margin, or LTV to CAC ratio, to check whether customer acquisition is profitable, to compare unit economics by channel or segment, or to prepare unit economics for a board or investor review. Do not use for sizing a market (market-sizing), setting prices and packaging (develop-offers), building the annual budget (build-operating-budget), or measuring retention curves in depth (analyze-cohort-retention).
---

# Model Unit Economics

Show whether acquiring and serving one more customer (or one more order) creates or destroys value, and how sure we can be. Unit economics is a small set of ratios built on top of careful cost classification: what it costs to win a customer, what margin that customer produces each period, and how long they stay. Most errors come from misclassified costs, blended averages that hide a losing channel, and lifetime value formulas that extrapolate thin churn data into large numbers. This skill builds the model from the ledger up, labels every assumption, prefers observed cohort data to formulas, and presents results as ranges with sensitivity rather than single figures.

## Inputs to gather

Ask for, and record the source of, each item. Where something is missing, proceed with a placeholder clearly marked "Assumed" and state which output it drives.

- **Business model**: subscription (recurring revenue per account per month or year) or transactional (revenue per order, repeat purchase rate). Hybrid models get both views.
- **Revenue per unit**: average revenue per account (ARPA) per month, or average order value (AOV) and orders per customer per period. Note discounts, refunds, and currency.
- **Cost of revenue detail**: hosting and infrastructure, third-party software and data used to deliver the product, payment processing, customer support and onboarding, fulfilment, shipping and packaging, returns. Ask for the general ledger mapping, not only the reported gross margin.
- **Acquisition spend by month and channel**: paid media, agency and tool fees, sales and marketing salaries, commissions, bonuses, events, content, partner fees.
- **New customers by month and channel**, with the attribution method used.
- **Retention**: customer churn and revenue churn per month or cohort tables; expansion and contraction revenue.
- **Segments** that matter to decisions: plan tier, company size, geography, product line.
- **Time period** and whether figures are monthly or annual.
- **Contract terms**: monthly or annual billing, upfront payment, minimum terms, and cancellation rights; they change cash payback and churn timing.
- **Payback tolerance**: the number of months of payback the business can fund from its cash position, or the cost of capital if the user thinks in those terms.
- **Sales cycle length** by channel, to set the lag between spend and new customers.
- **Planned changes**: price changes, new channels, or cost programmes that would make history a poor guide.

Separate **supplied** data, **derived** figures, and **assumed** placeholders in every table.

## Workflow

1. **Define the unit.** Customer (account) for subscription, order or customer for transactional, sometimes seat or location. Every ratio must use the same unit and the same period.
2. **Classify costs.** Map each cost line to COGS (cost of revenue), acquisition (sales and marketing), or other operating expense, and mark it variable or fixed. Read [references/margin-and-cac.md](references/margin-and-cac.md) for the classification rules and the common disputes.
3. **Compute gross margin and contribution margin per unit.** Gross margin % = (revenue − COGS) ÷ revenue. Contribution margin per unit = revenue per unit − all variable costs per unit (COGS plus variable selling costs such as payment fees or per-order shipping not already in COGS).
4. **Compute CAC two ways.** Paid-only CAC = paid media spend ÷ new customers. Fully loaded CAC = all sales and marketing cost attributable to new customer acquisition ÷ new customers. Report both, blended and by channel, and state the time lag used between spend and customer.
5. **Compute CAC payback on gross margin.** Payback (months) = CAC ÷ (monthly revenue per customer × gross margin %). Where cohort data exists, also report observed payback: the month in which cumulative gross margin per acquired customer first exceeds CAC.
6. **Estimate lifetime value with caveats.** Simple churn-based LTV = ARPA × GM% ÷ monthly churn. Show it only alongside its caveats and a horizon-capped or cohort-observed version. Read [references/payback-ltv-and-ratios.md](references/payback-ltv-and-ratios.md) before presenting any LTV or LTV:CAC figure.
7. **Break down by segment and channel.** Blended numbers hide losers. Build the table per channel and per major segment; flag any unit with payback beyond the business's cash tolerance or with negative contribution margin.
8. **Run sensitivity.** Vary CAC, gross margin, ARPA, and churn across realistic ranges. Use `scripts/unit_econ_sensitivity.py` to produce the grids. Read [references/sensitivity-and-segments.md](references/sensitivity-and-segments.md) for grid design, segment cuts, and transactional-business adaptations.
9. **Interpret.** State which lever moves the result most, which units are uneconomic, and what data would most reduce uncertainty. Frame LTV:CAC as a heuristic, not a target.

## Running the sensitivity script

`scripts/unit_econ_sensitivity.py` uses only the Python standard library and writes no files.

```
python3 scripts/unit_econ_sensitivity.py --arpa 500 --gross-margin 0.80 --cac 6000 --monthly-churn 0.02 --horizon-months 60
```

Optional grids: `--cac-values`, `--gm-values`, `--arpa-values`, `--churn-values` (comma-separated). Without them the script uses the base value −20% to +20%. Add `--cohort-csv cohort.csv` (columns `month`, `margin_per_customer`, where margin is per originally acquired customer so churn is already reflected) to get observed payback.

Read the output this way:

- **Base case** prints payback, simple LTV, horizon-capped LTV and both LTV:CAC ratios. A large gap between simple and capped LTV means much of the claimed value sits beyond the horizon and depends on churn staying low for years.
- **Payback grids** show how far CAC or margin must move to change the answer; use them to set a CAC ceiling per channel.
- **LTV by churn** shows the fragility: halving churn doubles simple LTV.
- **Cohort section** reports the month cumulative margin covers CAC, or that it has not yet. When the observed payback is later than the formula payback, trust the cohort and explain the difference (usually churn or contraction in early months).

## Worked example (illustrative, hypothetical numbers)

A subscription business has ARPA of 500 per month, gross margin of 80%, fully loaded CAC of 6,000, and monthly customer churn of 2%.

- Monthly gross margin per customer = 500 × 0.80 = 400.
- CAC payback = 6,000 ÷ 400 = 15 months.
- Simple LTV = 400 ÷ 0.02 = 20,000; LTV:CAC = 20,000 ÷ 6,000 = 3.3.
- 60-month capped LTV = 400 × (1 − 0.98^60) ÷ 0.02 ≈ 14,049; LTV:CAC ≈ 2.3.
- If churn were 1% instead, simple LTV doubles to 40,000. If the business has only a few months of history, it cannot tell 1% from 2% churn reliably, so the LTV figure is not decision-grade.
- A hypothetical cohort whose monthly margin per acquired customer falls from 400 by 10 each month reaches only 5,670 cumulative margin by month 18, so observed payback is later than the 15-month formula figure.

## Judgement calls and decision rules

Practitioners disagree on several choices. Make each one explicit and give the reason.

- **Which CAC to headline.** Headline fully loaded CAC for payback and profitability; use paid-only CAC for managing media buying. Never compare one company's paid-only CAC with another's fully loaded figure.
- **Blended or paid CAC for growth decisions.** Blended CAC answers "is the business as a whole efficient?". Paid or channel CAC answers "should we spend more here?". For spend decisions, the relevant number is marginal CAC in the channel, which is usually above its average.
- **Gross margin or contribution margin.** Use gross margin for subscription payback, because it is reported and comparable. Use contribution margin when variable selling costs are large (payment fees, shipping, marketplace commissions) or when the question is "does one more unit add money?".
- **Customer churn or revenue churn in LTV.** Use customer churn with ARPA when accounts are similar in size. Use revenue retention by cohort when account sizes vary widely or expansion is material.
- **How far to trust LTV.** If observed history is shorter than the implied lifetime (1 ÷ churn), cap the lifetime at a stated horizon or use cohort-observed margin. Say plainly when LTV cannot yet be estimated reliably.
- **Allocation of shared sales and marketing cost.** Allocate by a stated driver and show the unallocated remainder; do not spread brand or overhead costs silently across channels.
- **Annual or monthly view.** Keep everything monthly when churn is monthly. If the user reports annual figures, convert rates properly rather than dividing by 12.

## Handing off

- Deep cohort and retention analysis: analyze-cohort-retention.
- Price or packaging changes that the economics suggest: develop-offers.
- Proving that a channel's customers are incremental before scaling it: measure-marketing-incrementality.
- Rolling acquisition targets and CAC ceilings into next year's plan: build-operating-budget and plan-marketing-budget.
- Decomposing the drivers behind a unit metric into a managed tree: kpi-tree.

## Output

Deliver a unit economics model with:

1. **Summary**: payback, contribution margin, and the verdict per channel or segment in three to five lines, with the main caveat.
2. **Definitions and assumptions** — table: Metric | Definition used | Formula | Period | Source (supplied / derived / assumed).
3. **Cost classification** — table: Cost line | Amount | Class (COGS / acquisition / other opex) | Variable or fixed | Rationale.
4. **Unit economics by channel and segment** — table: Channel or segment | New customers | Paid-only CAC | Fully loaded CAC | ARPA | Gross margin % | Contribution margin per unit | Payback (months) | Observed payback | LTV (method) | LTV:CAC.
5. **Sensitivity** — grids for payback (CAC × gross margin, CAC × ARPA) and LTV:CAC (churn × CAC), with the base case marked.
6. **Findings and recommendations**: which channels or segments to scale, fix, or stop; the CAC ceiling implied by the payback tolerance.
7. **Data gaps**: what to measure next and how it could change the conclusion.

Keep the model reproducible: every figure in the summary should trace to a row in a table, and every row to a supplied number or a labelled assumption. Present ranges where the sensitivity shows the answer is not stable, and say which single measurement would narrow the range most.

When the user supplies only partial data, still deliver the structure above with placeholders, and put the missing inputs at the top of the data-gaps list.

## Quality checks

Before answering, confirm:

- Revenue, costs, CAC and churn use the same unit and period (monthly with monthly; annual churn is not monthly churn ÷ 12 exactly — convert with 1 − (1 − annual)^(1/12)).
- Payback uses gross margin, not revenue; LTV uses gross margin, not revenue.
- Both paid-only and fully loaded CAC are shown, and the blended figure is not presented without the channel split.
- CAC excludes costs of retaining or expanding existing customers unless stated, and the spend-to-customer time lag is stated.
- Any LTV figure is accompanied by the churn assumption, the history length behind it, and a capped or cohort-observed comparison.
- LTV:CAC is described as a heuristic; no ratio is presented as a universal target or industry benchmark.
- Every illustrative calculation has been recomputed and marked hypothetical.
- Customer counts behind small segments are shown; ratios from a handful of customers are flagged as unreliable.
- Organic customers are shown separately so paid channels are not credited with free acquisition.
- Free-user or trial serving costs are either in CAC or explicitly excluded, with the choice stated.
- The verdict per channel or segment follows from the numbers shown and names the payback tolerance it was judged against.

## Boundaries

- This skill analyzes economics; it does not set prices (develop-offers), size the market (market-sizing), or build the full annual plan (build-operating-budget). Detailed retention curve analysis belongs to analyze-cohort-retention.
- Cost classification for reported financial statements follows the company's accounting policies and applicable standards; if the analysis would change how gross margin is reported externally, involve the controller or auditors.
- Investor-facing metrics should be reconciled to the financial statements and reviewed by finance before distribution.
- The skill does not decide how much to spend on growth; it shows the economics that such a decision should weigh against cash, strategy and risk.
- Figures shared outside the company may be subject to confidentiality or disclosure obligations; check with finance or counsel before publishing.
- Tax effects, discount rates for valuation, and capital structure are out of scope unless the user supplies them; say so rather than assuming.
