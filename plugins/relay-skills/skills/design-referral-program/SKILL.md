---
name: design-referral-program
description: Design a customer referral or advocacy program that pays for itself. Tests fit first (is word of mouth already happening, per NPS and referral-source evidence), identifies who refers and why beyond cash, chooses the reward structure (single or double-sided; cash, credit, or product; tiered), models economics against alternative CAC with payback and fraud controls, flags tax and legal points for counsel, sets the moments to ask and the tracking, and launches as a test with a holdout. Use when someone asks to start or fix a referral, refer-a-friend, or customer advocacy program, what referral reward to offer, or whether referrals are worth it. Do not use for partner or reseller commissions, sales compensation (use design-sales-compensation), measuring paid channels (use measure-marketing-incrementality), or offer and pricing design (use develop-offers).
---

# Design Referral Program

Build a referral program only where customers already recommend the product, reward them in ways that fit why they recommend it, and prove the program creates customers who would not have come anyway. The output is a program design with explicit economics, controls, and a launch test, not a promotional campaign. Every rate and cost is the user's own or a labeled placeholder; referral performance figures from other companies are never presented as expectations.

## Inputs to gather

Ask for these. When one is missing, proceed with a labeled placeholder and say what the answer would change.

- **Business model.** B2C or B2B, purchase frequency, price point, sales-led or self-serve, contract length.
- **Word-of-mouth evidence.** Share of new customers who say a friend or colleague referred them (from a "how did you hear about us" field, sales notes, or signup source), Net Promoter Score (NPS) or similar survey results with response counts, reviews, and any informal referrals sales already receives.
- **Customer base.** Number of active customers who could refer, and segments that are most satisfied or most connected to other buyers.
- **Economics.** Gross margin per customer per month (or per order), retention or repeat rates, and the marginal CAC of the channels a referral program would compete with.
- **Current alternatives.** What the business spends to acquire a customer today by channel, ideally incremental rather than attributed (see measure-marketing-incrementality).
- **Constraints.** Regulated industry, geographies served, whether customers are businesses or consumers, existing loyalty or credit systems, engineering capacity for tracking.

Label every figure as **Supplied**, **Derived**, or **Assumed**.

## Workflow

1. **Run the fit test.** A program amplifies existing word of mouth; it rarely creates it. Check:
   - Are some new customers already arriving through personal recommendation? Measure the share from the user's own source data.
   - Do satisfied customers exist in enough numbers? Look at NPS promoters (those scoring 9 or 10) as a count, not just the score, and at repeat or expansion behavior.
   - Is the product easy to explain and relevant to the referrer's network?
   - If the evidence is weak, the recommendation is to fix the product experience or customer success first, or to run a small pilot, not to launch a program.
2. **Identify who refers and why.** Segment likely referrers (power users, long-tenure customers, recent successful onboarding, champions inside business accounts). Name their motives: helping a friend or colleague, status and expertise, reciprocity, access or exclusivity, and money. Read `references/fit-and-motivation.md`.
3. **Choose the reward structure.** Decide single-sided (referrer only or referee only) or double-sided; cash, account credit, product, charity donation, or recognition; flat or tiered. Match the reward to the motive and to what the referee needs to act. Read `references/rewards-and-economics.md`.
4. **Model the economics.** Compute cost per referred customer and per incremental referred customer, payback in months, and the break-even reward against the marginal CAC of alternatives. Use `scripts/referral_economics.py`. Include fixed program costs (software, operations, support), reward costs at their true cost, fraud leakage, and the share of referrals that would have happened anyway.
5. **Design fraud and abuse controls.** Set the qualifying event, holding periods, caps, and review rules against each pattern:
   - self-referral through a second account;
   - fake accounts created to collect rewards;
   - public posting of codes on coupon and deal sites;
   - reward cycling (sign up, collect, cancel);
   - collusion rings referring each other.
6. **Flag tax and legal questions for counsel.** List them as questions, not conclusions:
   - reward taxability and any reporting duties;
   - disclosure of incentivized recommendations;
   - consent and privacy rules for contacting referred people;
   - contest or sweepstakes rules if any reward involves chance;
   - sector rules on referral payments in regulated industries.
7. **Set mechanics and moments.** Decide where and when to ask (after a success moment, not at signup for most products), the sharing methods, the referee landing experience, and reward delivery timing. Read `references/mechanics-tracking-launch.md`.
8. **Design tracking.** Unique referral links or codes, attribution rules (first valid referral wins; lookback window), a "who referred you" fallback field, and events for invite sent, invite accepted, signup, qualifying event, reward issued, and reward reversed.
9. **Launch as a test with a holdout.** Randomly offer the program to part of the eligible base and keep the rest as a control, so the program's incremental customers can be measured against organic word of mouth. Pre-register success thresholds.
10. **Define success metrics and review cadence.** Participation rate, invites per participant, referral conversion, referred-customer retention compared with non-referred customers, cost per incremental customer, fraud rate, and share of new customers from referral.

## Routing to references and script

- Read `references/fit-and-motivation.md` for the fit test, evidence thresholds to set with the user, and referrer motives by business type.
- Read `references/rewards-and-economics.md` when choosing rewards, modeling costs, setting fraud controls, or listing tax and legal questions.
- Read `references/mechanics-tracking-launch.md` when designing the ask moments, sharing flow, tracking events, holdout test, and success metrics.
- Run `python3 scripts/referral_economics.py --help` for usage. It prints the referral funnel, reward and fixed costs, cost per referred and per incremental customer, payback months, and, when `--alt-cac` is given, the comparison with alternatives and the break-even reward.
  - `--reward-cost-factor` converts face value to true cost for credits or product rewards (1.0 for cash; lower only when the user can show the credit costs less than face value).
  - `--incremental-share` is the share of referred customers who would not have come anyway. Until a holdout measures it, run several values and label them Assumed.

## Illustrative example

Hypothetical round numbers, for method only.

- 2,000 active customers; 10% participate, so 200 participants.
- Each participant sends 3 invites, so 600 invites; 10% of invites convert, so 60 referred customers.
- Double-sided cash reward of $50 each, so $100 per referred customer and $6,000 in rewards.
- Fixed program cost for the quarter $3,000, so $9,000 in total, or $150 per referred customer.
- If 70% of referred customers would not have come anyway, 42 are incremental, costing $9,000 ÷ 42 ≈ $214 each.
- At $40 gross margin per customer per month, payback is about $214 ÷ $40 ≈ 5.4 months.
- If the marginal CAC of the best alternative channel is $300, break-even total reward per referred customer is ($300 × 42 − $3,000) ÷ 60 = $160.

## Common traps

- Launching a program to create word of mouth that does not exist.
- Counting every referred customer as new business, including people who were already coming.
- Valuing a credit reward at zero cost because no cash leaves the business.
- Paying rewards at signup instead of at a qualifying event, which invites fraud and reward cycling.
- Asking for referrals at signup, before the customer has had a success worth sharing.
- Copying another company's reward amount without checking the user's own economics.
- Judging the program on referred-customer counts without checking their retention.

## Reward choice by situation

Starting points to test, not answers; confirm against the user's motives, margins, and counsel's review.

| Situation | Starting structure | Reason |
| --- | --- | --- |
| Subscription product, frequent use | Double-sided account credit | Keeps value in the product; credit is used |
| Infrequent, high-price consumer purchase | Double-sided cash or gift card after the return window | Credit has little use before the next purchase |
| B2B software with champions | Account credit, extended terms, or donation; recognition for the champion | Personal cash can conflict with employer policies |
| Community-driven or enthusiast product | Recognition, early access, exclusive invites; small referee discount | Status and belonging motives outweigh cash |
| Regulated sector | No cash until counsel confirms; non-monetary recognition | Referral payments may be restricted |

## Output

1. **Fit verdict.** Go, pilot, or not yet, with the evidence and its source.
2. **Referrer profile.** Table: Segment, Size, Evidence of advocacy, Primary motive, Best ask moment.
3. **Reward design.** Table: Party (referrer / referee), Reward, Form (cash / credit / product / other), Qualifying event, Timing, Cap, Tier rules.
4. **Economics.** Table: Line, Value, Source (supplied / derived / assumed). Include participants, invites, referred customers, reward cost, fixed cost, cost per referred customer, incremental share, cost per incremental customer, payback months, alternative CAC, break-even reward.
5. **Fraud and abuse controls.** Table: Abuse pattern, Control, Owner.
6. **Questions for counsel and tax advisers.** Numbered list, with the jurisdictions involved.
7. **Mechanics and moments.** Where, when, and how customers are asked; the referee experience.
8. **Tracking design.** Table: Event, Definition, System, Owner.
9. **Launch test.** Table: Group, Share of eligible base, Treatment, Primary metric, Duration, Success threshold, Decision rule.
10. **Success metrics and cadence.** Table: Metric, Formula, Target (user-set), Review frequency.
11. **Assumptions and open questions.**

## Quality checks

- The fit verdict rests on the user's own referral-source and satisfaction evidence, with counts.
- The reward matches a named motive and a named referee barrier.
- Rewards are paid on a qualifying event after a holding period, not on signup.
- Economics include fixed costs, true reward cost, fraud leakage, and an incremental share, all labeled.
- Cost per incremental customer is compared with the marginal CAC of alternatives, not with a blended average.
- The launch includes a randomized holdout and pre-set thresholds.
- Referred-customer retention is a success metric, not an afterthought.
- Tax and legal items are phrased as questions for counsel.
- No external referral benchmarks are presented as expectations.

## Boundaries

- This skill designs the program; it does not give legal or tax advice. Reward taxability, reporting duties, disclosure rules, privacy and consent for contacting referees, sweepstakes law, and sector-specific rules on referral payments must be confirmed by qualified counsel and tax advisers in each jurisdiction served.
- Regulated sectors (for example, healthcare, financial services, insurance, real estate settlement services) may restrict or prohibit referral payments; do not recommend a cash reward in these sectors before counsel confirms it is allowed.
- Partner, affiliate, and reseller commission plans are commercial contracts, not customer referral programs; treat them separately.
- Sales compensation for referred deals belongs to design-sales-compensation.
- Measuring other channels' incrementality belongs to measure-marketing-incrementality.
