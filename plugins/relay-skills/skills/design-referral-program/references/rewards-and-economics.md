# Rewards, economics, fraud controls, and legal questions

## 1. Reward structure options

| Choice | Options | When it fits | Watch out for |
| --- | --- | --- | --- |
| Sidedness | Referrer only; referee only; double-sided | Double-sided when the referee needs a push and the referrer wants to be seen as helping. Referee-only when referrers are motivated socially and cash would feel awkward. Referrer-only when the referee's barrier is low | Double-sided doubles reward cost per conversion |
| Form | Cash; account credit; free product or upgrade; discount; charity donation; recognition or access | Credit and product keep value in the business and suit repeat-purchase or subscription models. Cash suits infrequent purchases where credit has little use | Cash has the highest fraud appeal and the clearest tax questions |
| Size | Flat amount; percentage of first purchase; tiered by number of successful referrals | Flat is simplest to explain. Percentage fits variable order values. Tiers reward the few heavy referrers | Tiers add complexity and gaming risk; cap them |
| Timing | On signup; on first payment; after a holding period; after a usage milestone | Pay on a qualifying event after the refund or cancellation window | Paying at signup invites fake accounts and reward cycling |
| Limits | Per-referrer cap per period; lifetime cap; one reward per referee | Always set caps | Caps must be disclosed in the terms |

## 2. Economics

### Funnel

- `participants = eligible customers × participation rate`
- `invites = participants × invites per participant`
- `referred customers = invites × invite-to-customer conversion`
- Viral coefficient (sometimes called k-factor) `k = invites per customer × invite conversion`, measured over all eligible customers. If k is below 1, each cohort of customers brings in a smaller one, so the program adds customers but does not compound on its own. Unless the user's own data shows k at or above 1, plan the program as a channel, not as self-sustaining growth.

### Cost

- `reward cost per referred customer = (referrer reward + referee reward) × reward cost factor`
- **Reward cost factor:** 1.0 for cash. For credits, discounts, or product, the true cost lies between the delivery cost of what is given and its face value: face value when the credit replaces revenue the customer would have paid anyway; closer to delivery cost when it funds usage the customer would not otherwise have bought. Use 1.0 unless the user can show otherwise, and account for credits never redeemed only with their own redemption data.
- `total cost = reward cost × paid referred customers + fixed program cost` (software, operations, support, design, legal review)
- **Fraud leakage:** if a share f of rewarded conversions turn out to be invalid after payment, genuine referred customers = paid referred customers × (1 − f), and cost per genuine referred customer rises accordingly.

### Incrementality

Some referred customers would have bought anyway (they already knew the product, or would have been recommended without a reward). Let `i` be the incremental share, measured by the holdout test in `mechanics-tracking-launch.md`.

- `incremental customers = genuine referred customers × i`
- `cost per incremental customer = total cost ÷ incremental customers`

Until a holdout measures `i`, show a range of values, labeled Assumed.

### Payback and comparison

- `payback months = cost per incremental customer ÷ monthly gross margin per customer`
- Compare cost per incremental customer with the **marginal** CAC of the alternative channels the program would replace or supplement (see plan-marketing-budget), not their blended average.
- Break-even total reward per paid referred customer, where cost per incremental customer equals the alternative CAC: `(alternative CAC × incremental customers − fixed cost) ÷ paid referred customers ÷ reward cost factor`.

If referred customers retain differently from other customers (measure it; do not assume), compare lifetime gross margin rather than payback alone.

Illustrative, hypothetical round numbers: 60 referred customers, $100 in rewards each ($6,000), $3,000 fixed, no fraud, incremental share 70% gives 42 incremental customers at $9,000 ÷ 42 ≈ $214 each; at $40 monthly gross margin, payback ≈ 5.4 months; against a $300 alternative marginal CAC, break-even reward is ($300 × 42 − $3,000) ÷ 60 = $160 per referred customer.

## 3. Fraud and abuse controls

| Pattern | Control |
| --- | --- |
| Self-referral (same person, second account) | Match on payment method, device, address, email patterns; block rewards on matches; require the referee to be a new customer by the business's definition |
| Fake accounts | Reward only on a qualifying paid event after the refund window; require verification appropriate to the business |
| Reward cycling (join, get reward, cancel) | Holding period before reward; clawback terms; referee must remain active through the period |
| Public code posting on coupon and deal sites | Personal links rather than generic codes; monitor referral volume per referrer; cap rewards per period; decide in the terms whether public posting is allowed |
| Collusion rings | Graph checks for clusters of mutual referrals; manual review above a threshold |
| Employee or reseller abuse | Eligibility rules excluding them or routing them to a partner program |

Set a fraud-rate metric (rewards reversed ÷ rewards issued) and a review threshold chosen by the user.

## 4. Questions for counsel and tax advisers

Phrase these as questions to confirm in each jurisdiction served; do not answer them as legal conclusions.

1. **Taxability and reporting.** Are cash or credit rewards taxable income for recipients, and does the business have information-reporting duties above certain amounts? Does treatment differ for account credits versus cash?
2. **Disclosure.** Do consumer protection or advertising rules require referrers to disclose that they receive a reward when recommending? (In the United States, for example, the Federal Trade Commission's Endorsement Guides address disclosure of material connections.) How should the program terms and share messages handle this?
3. **Contacting referees.** If the business sends messages to people a customer nominates, which consent, anti-spam, and privacy rules apply (email, SMS, and phone rules differ, and data protection laws may require a lawful basis for processing the referee's details)? Is it safer to have the referrer send the invite from their own account?
4. **Sweepstakes and contests.** If any reward involves chance (a prize draw for referrers), do sweepstakes or lottery rules apply?
5. **Sector rules.** In healthcare, financial services, insurance, real estate, legal, and other regulated sectors, are referral payments restricted or prohibited (for example, anti-kickback or anti-rebating rules)?
6. **B2B conflicts of interest.** Could personal rewards to employees of customer companies breach their employers' policies or anti-bribery rules? Should rewards go to the account instead?
7. **Terms and changes.** Are the program terms clear on eligibility, caps, reward timing, clawbacks, and the right to change or end the program, and do they meet consumer-contract rules?
8. **Accounting.** How should reward liabilities and credits be recorded? (Finance and auditors.)
