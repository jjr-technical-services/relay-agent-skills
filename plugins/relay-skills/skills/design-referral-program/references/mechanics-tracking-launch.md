# Mechanics, tracking, launch test, and success metrics

## 1. Moments to ask

Ask when the customer has just experienced value and has a reason to think of someone else. Candidate moments, to confirm with the user's own journey data:

| Moment | Example | Why it works |
| --- | --- | --- |
| First success | First report delivered, first order arrived, first saving realized | Enthusiasm is fresh and specific |
| Positive feedback | Customer gives a high satisfaction or NPS score, leaves a good review, or thanks support | Stated willingness; ask right after the score |
| Milestone | Anniversary, usage milestone, renewal | Natural reflection point |
| Sharing already happening | Customer invites a teammate, exports a shareable result, mentions a colleague to sales | The social act is in progress |
| Account review | Quarterly business review in B2B | Champion is discussing value with the vendor |

Avoid: at signup (no value yet), right after a billing problem or support failure, and in the middle of a task the customer is trying to finish.

Frequency: set a contact rule (for example, at most one referral prompt per customer per chosen period unless they engage) so the program does not become noise.

## 2. Sharing flow and referee experience

- **Referrer side:** a personal link and, where useful, a short code; one-click sharing by email, messaging, and copy link; a pre-written message the customer can edit, written in plain language, including any required disclosure of the reward.
- **Referee side:** a landing page that names the referrer (with the referrer's consent), states the referee benefit and its conditions, and leads straight to signup or a sales conversation. For B2B, route referred leads to sales with the referrer's context attached.
- **Status visibility:** referrers can see pending, qualified, and paid referrals, and when rewards will arrive. Silence after a referral kills repeat referring.
- **Reward delivery:** automatic where possible, on the qualifying event after the holding period, with a notification.
- **Terms:** one page covering eligibility, qualifying event, holding period, caps, clawbacks, exclusions, and the right to change or end the program, reviewed by counsel.

## 3. Tracking design

Attribution rules:

- Personal link or code is the primary identifier. Store it on the referee's record at first touch and carry it through signup and payment.
- First valid referral wins when a referee has several referrers; state the rule in the terms.
- Lookback window: how long after clicking a link a signup still counts. Choose from the user's typical consideration time.
- Fallback: a "who referred you" field at signup or in the sales process for referrals that lose the link (verbal recommendations, a different device).

Events to log:

| Event | Definition | Needed for |
| --- | --- | --- |
| prompt_shown | Referral ask displayed to an eligible customer | Participation rate denominator |
| invite_sent | Customer shares a link or sends an invite | Participation and invites per participant |
| invite_clicked | Referee opens the link | Click-through |
| referee_signup | Referee creates an account or becomes a lead | Referral conversion |
| qualifying_event | Referee meets the reward condition (for example, first paid month) | Reward eligibility |
| reward_issued | Reward paid or credited, with amount and form | Cost tracking |
| reward_reversed | Reward clawed back, with reason | Fraud rate |

Keep the referee's retention and revenue linked to the referral so referred-customer quality can be measured over time.

## 4. Launch as a test with a holdout

Goal: measure how many customers the program adds beyond organic word of mouth.

Design:

1. Define the eligible base (active customers meeting the program's eligibility rules).
2. Randomly assign a share to the **program group** (sees prompts and rewards) and the rest to the **holdout** (no prompts, no rewards). Randomize at the customer or account level.
3. Track new customers who name a referrer from each group, through links for the program group and through the "who referred you" field and sales notes for both groups.
   For the rate comparison, count referred customers the same way in both groups (for example, the "who referred you" field plus sales notes, matched to the referrer's group). Links exist only in the program group, so counting link attributions there but not in the holdout inflates the measured lift; report link-attributed referrals separately.
4. Run for a period long enough to cover the ask moments and the qualifying event, fixed in advance.

Analysis:

- `referral rate_g = referred new customers attributed to group g ÷ customers in group g`
- `incremental referred customers = (rate_program − rate_holdout) × customers in program group`
- `incremental share i = incremental referred customers ÷ referred customers from the program group`
- Test the difference with a two-proportion test or an interval on the difference (as in measure-marketing-incrementality), and size the groups in advance with the power formula there. If the base is too small for a useful test, run the pilot anyway but label the incremental share as unmeasured.

Limits: holdout customers can still recommend organically, which is exactly what the control measures; but referees of program customers may also have been reached by marketing. Randomization handles this on average.

Pre-register: primary metric (incremental referred customers per 1,000 eligible customers), guardrails (fraud rate, referred-customer early churn, support load), success threshold (cost per incremental customer below the user's alternative marginal CAC), and the decision each result triggers.

## 5. Success metrics

| Metric | Formula |
| --- | --- |
| Participation rate | customers who sent at least one invite ÷ eligible customers shown the prompt |
| Invites per participant | invites sent ÷ participants |
| Invite click-through | invites clicked ÷ invites sent |
| Referral conversion | referees reaching the qualifying event ÷ invites sent (also report per click) |
| Referred share of new customers | referred new customers ÷ all new customers |
| Referred-customer retention | retention of referred customers at the user's standard checkpoints vs. a comparable non-referred cohort acquired in the same period |
| Cost per incremental customer | total program cost ÷ incremental customers (from the holdout) |
| Payback months | cost per incremental customer ÷ monthly gross margin per customer |
| Fraud rate | rewards reversed ÷ rewards issued |

Targets are set by the user from their economics; report each metric against its target monthly for operations and quarterly for the keep, change, or stop decision. Use analyze-cohort-retention for the retention comparison.
