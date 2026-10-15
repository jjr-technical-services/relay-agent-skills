# Margin and CAC: classifying costs correctly

Unit economics inherits every classification decision made here. Write each decision down; a reviewer should be able to reproduce the numbers from the ledger.

## COGS versus operating expense

Cost of goods sold (COGS, also called cost of revenue) is the cost of delivering the product or service that was sold. Operating expense (opex) is the cost of running and growing the business.

Usually COGS for a software subscription:

- Hosting, cloud infrastructure, and data storage used to serve customers.
- Third-party software, data, or model usage that is consumed when customers use the product.
- Payment processing fees (some companies treat these as a revenue deduction or selling cost; be consistent).
- Customer support and onboarding or implementation staff, to the extent they serve existing customers.
- Customer success staff whose work is keeping the service running for customers (practice varies; see below).
- Allocated share of site reliability or operations staff who run the production service.

Usually COGS for a transactional or physical-goods business:

- Product cost, inbound freight, packaging, fulfilment labour, outbound shipping (if not charged separately), payment fees, returns and refunds processing, marketplace fees charged per sale.

Usually opex, not COGS:

- Research and development (building new product), general and administrative, sales and marketing, and hosting used for development and testing environments.

Common disputes and a decision rule:

- **Customer success.** If the team primarily renews and expands accounts, many companies classify it as sales and marketing; if it primarily delivers the service, as COGS. Decision rule: classify by the main activity measured in time, and show gross margin both ways when the amount is material.
- **Implementation and professional services.** Keep services revenue and its cost separate from subscription revenue and cost; blending hides whether subscriptions are profitable.
- **Free users.** The cost of serving free or trial users is often charged to COGS but is really an acquisition cost. Decision rule: for unit economics, move free-user serving cost into acquisition cost and say so; leave the reported statements unchanged.

## Variable versus fixed

- **Variable** costs change with the number of units (customers, orders, usage): payment fees, per-order shipping, usage-based infrastructure, per-seat third-party licences.
- **Fixed** costs do not change within the relevant range: salaried platform teams, minimum commitments, rent.
- **Step** costs are fixed until a threshold, then jump (another support agent every so many customers). Treat as variable per unit at planning scale, and note the step.

Contribution margin per unit = revenue per unit − variable costs per unit. It answers "does one more unit add money?". Gross margin answers "is delivery profitable after its direct costs, including some fixed delivery costs?". Report both; they differ when COGS contains fixed costs or when variable selling costs sit outside COGS.

Illustrative (hypothetical): an order of 100 with product cost 40, shipping 10, payment fees 3, and packaging 2 has contribution margin = 100 − 40 − 10 − 3 − 2 = 45, or 45%.

## CAC: definitions

Customer acquisition cost is the cost to win one new customer.

```
Paid-only CAC      = paid media spend ÷ new customers
Fully loaded CAC   = (paid media + sales and marketing salaries, commissions, bonuses,
                      agency and tool costs, events, content, partner fees
                      attributable to new business) ÷ new customers
```

- **Paid-only CAC** is useful for managing a media channel day to day. It flatters the business.
- **Fully loaded CAC** is the one to use for payback and profitability. Exclude the cost of teams that only serve existing customers (renewals, expansion) or allocate their time; state which.
- **Blended CAC** divides all acquisition cost by all new customers, including organic ones. It is the honest company-level number but hides the marginal cost of paid growth.
- **Channel CAC** attributes cost and customers to channels. Attribution is a model, not a fact: last-touch, first-touch, and multi-touch give different answers. State the model and, for decisions about spending more, prefer incrementality evidence (holdouts, geo tests) over attribution; the measure-marketing-incrementality skill covers that.
- **Marginal CAC** is the cost of the next customer in a channel; it usually rises as spend grows because the cheapest audiences are reached first. Averages understate it.

## Timing

Spend in one month often produces customers in later months, especially with sales cycles. Choose one of:

- Same-period ratio (simple, biased when spend is changing fast).
- Lagged ratio: spend in month t − L ÷ customers in month t, with L near the median sales cycle.
- Cohort matching: spend attributed to the customers it produced (best, needs data).

State the method. Use a trailing three- or six-month window to smooth noise, and say which.

## Revenue per unit

- **ARPA** = recurring revenue in the period ÷ customers (accounts) in the period. Use the revenue from new customers when computing payback for new customers, if their price differs from the installed base.
- Use net revenue after discounts and refunds.
- For transactional businesses, revenue per customer per period = AOV × orders per customer per period; build retention on repeat purchase rates.
