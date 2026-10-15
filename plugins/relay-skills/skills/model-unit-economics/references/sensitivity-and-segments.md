# Sensitivity and segment breakdowns

## Why averages mislead

A blended payback of 15 months can be the average of a channel that pays back in 8 months and one that never pays back. Segment and channel breakdowns turn a single verdict into decisions: scale this, fix that, stop the other.

## Segment and channel cuts

Choose cuts that map to decisions someone can make:

- **Acquisition channel**: paid search, paid social, outbound sales, partners, events, organic and referral. Organic customers lower blended CAC; show them separately so paid channels are judged on their own cost.
- **Customer size or plan tier**: small accounts often have lower CAC and higher churn; large accounts the reverse. Payback can look similar while risk differs.
- **Geography or currency**: pricing, payment fees, and support costs differ.
- **Product line or offer**: different gross margins.
- **Cohort period**: economics that were good for last year's cohorts may not hold for recent ones as channels saturate.

For each cut, show the number of customers. Mark any segment with too few customers or too short a history to support a ratio (for example, fewer than a few dozen customers or less history than the payback period) as indicative only. The threshold is a judgement; state the one used.

Allocating shared costs: sales salaries and brand spend often support several channels. Allocate by a stated driver (time spent, opportunities created, spend share) and show the unallocated remainder rather than hiding it.

## Designing sensitivity grids

- Vary the inputs that are both uncertain and influential: CAC, gross margin, ARPA or AOV, churn or repeat rate.
- Use realistic ranges based on the user's own variation (last 12 months' low to high), not arbitrary ±50%.
- Use two-way grids for pairs that interact: CAC × gross margin and CAC × ARPA for payback; churn × CAC for LTV:CAC.
- Mark the base case, and show the threshold line where the result crosses the user's tolerance (for example, the payback months the business can fund).
- Report a tornado-style ranking: for each input moved across its range with others at base, how much the output moves. The top input is where better data or management effort pays most.

`scripts/unit_econ_sensitivity.py` produces the payback and LTV grids from a base case; pass explicit value lists to use realistic ranges.

## Break-even questions worth answering

- **Maximum affordable CAC** for a payback tolerance P months: CAC_max = P × monthly revenue per customer × gross margin %.
  Illustrative (hypothetical): tolerance 12 months, ARPA 500, GM 80% → CAC_max = 12 × 500 × 0.80 = 4,800.
- **Minimum gross margin** for a given CAC and tolerance: GM_min = CAC ÷ (P × monthly revenue per customer).
- **Maximum churn** for a target capped LTV:CAC: solve numerically by scanning churn values in the grid.

## Transactional businesses

- Replace ARPA with AOV × orders per period and churn with repeat purchase curves: share of a cohort that places a second, third, and later order within set windows.
- Contribution margin per order must include variable fulfilment, shipping, payment, and returns; returns are often the swing factor.
- First-order economics are frequently negative by design; the model should show the order number at which cumulative contribution covers CAC.
- Discount-driven first orders distort AOV and repeat rates; separate customers acquired with deep discounts.

## Presenting results

- Lead with the decision per segment or channel, then the table, then the grids.
- Show ranges, not false precision: payback "13–17 months under plausible CAC and margin" beats "15.0 months".
- State the data window, the attribution model, and the churn history length next to the numbers they affect.
