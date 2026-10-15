# Allocating on marginal return

## 1. Why average CAC misleads

Average CAC for a channel is total spend divided by total customers. Marginal CAC is the cost of the next customer: the extra spend divided by the extra customers it produces.

`average CAC = spend ÷ customers`
`marginal CAC between two spend levels = (spend_2 − spend_1) ÷ (customers_2 − customers_1)`

Most channels show diminishing returns: the first dollars reach the most responsive audience, and each additional increment reaches people who are less likely to buy, or bids against competitors at higher prices. Average CAC includes the cheap early customers, so it understates what the next dollar will cost.

Illustrative, hypothetical round numbers:

| Channel A spend | Customers | Average CAC | Marginal CAC of the last $10,000 |
| --- | --- | --- | --- |
| $10,000 | 50 | $200 | $200 |
| $20,000 | 80 | $250 | $10,000 ÷ 30 ≈ $333 |
| $30,000 | 95 | ≈ $316 | $10,000 ÷ 15 ≈ $667 |

At $30,000, average CAC looks acceptable at about $316, but the last $10,000 bought customers at about $667 each.

## 2. The allocation rule

Move money from channels with high marginal CAC to channels with low marginal CAC until marginal CAC is roughly equal across channels, and stop adding spend anywhere once marginal CAC exceeds the maximum acceptable CAC. At that point no reallocation can buy more customers for the same budget.

Illustrative continuation. Channel B:

| Channel B spend | Customers | Average CAC | Marginal CAC |
| --- | --- | --- | --- |
| $10,000 | 30 | ≈ $333 | ≈ $333 |
| $20,000 | 55 | ≈ $364 | $400 |
| $30,000 | 75 | $400 | $500 |

With a $40,000 budget:

- Allocating by average CAC (A looks cheaper at every level) might put $30,000 in A and $10,000 in B: 95 + 30 = 125 customers.
- Allocating by marginal CAC, increment by increment: A's first $10,000 ($200), then A's second and B's first ($333 each), then B's second ($400) rather than A's third ($667). Result: $20,000 in each, 80 + 55 = 135 customers.

Same budget, 10 more customers, because the last dollars went where they bought the most.

When the goal is value rather than customer count (customers in different channels have different deal sizes or retention), compare marginal return instead: `marginal return = Δ(gross margin or lifetime value of customers) ÷ Δspend`, and equalize that.

## 3. Estimating marginal CAC from the user's data

In order of strength:

1. **Planned spend tests.** Deliberately change spend in a channel (or in some regions) and measure the change in results. Coordinate with measure-marketing-incrementality so the change is also incremental, not just attributed.
2. **Historic spend variation.** Plot results against spend by week or month for each channel. Look for flattening. Beware confounding: spend often rises in seasons when demand is naturally high, which makes channels look more responsive than they are.
3. **Platform signals.** Rising cost per click or cost per thousand impressions, falling click-through, or impression share near its ceiling suggest saturation, but do not measure it directly.
4. **Marketing mix model response curves**, when a model exists (see measure-marketing-incrementality).

Use incremental results where they exist. A channel whose attributed customers are mostly people who would have bought anyway has a much higher true marginal CAC than its attributed figure. If a test measured an incrementality factor, estimate `incremental customers = attributed customers × incrementality factor`, then compute marginal CAC on those.

## 4. Practical limits

- **Minimum efficient scale.** Some channels (events, TV, a new region) produce little below a threshold spend. Treat the threshold as one lumpy increment.
- **Capacity limits.** Sales capacity, event capacity, or audience size can cap a channel regardless of budget.
- **Lag.** Channels with long sales cycles show marginal effects late; judge them on leading indicators (opportunities created) with the cycle length stated.
- **Extrapolation.** Response history covers only the spend range tried. Increasing well beyond it is a test, and belongs partly in the test reserve.
- **Brand and long-term effects.** Some spend builds demand captured later by other channels. Marginal CAC measured on short windows understates its value; say so rather than inventing a multiplier, and prefer a geo test or mix model to measure it.

## 5. Recording the rationale

For each channel in the plan, record: current spend, average CAC, marginal CAC at current spend (with its source), incrementality evidence level, and the recommended change. A reviewer should be able to see why each dollar moved.
