---
name: plan-fundraising-campaign
description: Plan a nonprofit fundraising campaign from the organization's own giving history. Covers year-end, giving day, peer-to-peer, memorial and tribute, and employee giving campaigns. Builds the goal bottom-up (segment audience x response rate x average gift, plus committed leadership gifts and any match), defines audience segments, the case for support, channel plan and cadence, matching gift mechanics, tracking codes, gift processing and acknowledgment handoff, ethical rules (no guilt, fake urgency, countdown timers or pre-checked recurring boxes), and a post-campaign review. Use when someone asks to plan a year-end appeal campaign, a giving day, a peer-to-peer or memorial fundraiser, an employee giving or matching gift drive, or how to set a realistic fundraising goal. Do not use to write the appeal letter itself (use the year-end-appeal-letter prompt), for commercial marketing campaigns (use campaign-plan-one-pager), or for ongoing donor retention (use plan-donor-stewardship).
---

# Plan Fundraising Campaign

A fundraising campaign is a time-bound effort with a goal, an audience, a case and a deadline that is real. This skill plans the whole campaign, from the goal math to the review afterwards, for the campaign types a small or mid-sized nonprofit runs most often: year-end, giving day, peer-to-peer (supporters raise money from their own networks on personal pages), memorial and tribute (gifts in someone's name, often led by a family), and employee giving (workplace drives, employee resource group campaigns and company matching). The plan earns trust twice: the goal is built from the organization's own results rather than hope, and every tactic passes an ethics check before it ships.

## Inputs to gather

Ask for, or retrieve from the organization's context library. Proceed with labelled placeholders when something is missing and say what each placeholder changes.

- Results of the most comparable past campaign by segment: audience size, number of donors, total raised, average gift, channel, and appeal code. Two or more years is better than one.
- Current audience counts by segment (past campaign donors, other active donors, lapsed donors, subscribers who never gave, event attendees, peer-to-peer fundraisers from last time).
- Leadership gifts already committed in writing for this campaign, and who is being asked before launch.
- Match or challenge offers: matcher, ratio, cap, eligible gifts, eligible dates, and what the matcher will do if the match is not met.
- Program facts for the case for support, with sources: what the organization does, what it measured, what a gift makes possible. Outcomes are stated as what was measured.
- Channels available and their consent status (email list, postal list, texting consent, social accounts), staff and volunteer time, budget.
- Donation platform, CRM, acknowledgment process, and who processes gifts.
- For memorial campaigns: the family's wishes, who speaks for the family, and whether the cause of death may be mentioned at all.
- For employee giving: the company's match policy (ratio, cap, eligible organizations, submission deadline) from the company's own documents.
- Other communications scheduled in the same window (newsletters, program emails, event invitations) so asks do not collide.
- Stories and images already approved for fundraising use, with their consent records.
- The organization's approved crisis resource copy, if campaign content may touch suicide, self-harm or a mental-health crisis.
- Campaign budget and direct costs (printing, postage, platform fees, paid promotion).
- Who approves final copy, and how long approval takes.

Label every figure **Supplied**, **Calculated** (show the formula) or **Assumed**. Never substitute a published response rate or "typical" average gift for the organization's own history; if no history exists, say so, use a clearly labelled assumption, and widen the range.

## Workflow

1. **Name the campaign type, window and purpose.** One sentence: who is asked, for what, by when. If funds will be restricted to a purpose, say so; restricted campaign money must be spent on that purpose.
2. **Build the goal bottom-up.** For each segment: expected donors = audience × response rate; expected revenue = expected donors × average gift. Add leadership gifts committed in writing, then any match. Produce low, base and high scenarios. Run `scripts/campaign_goal.py` when segment data is available. Read `references/goal-and-segments.md`.
3. **Compare with any requested goal.** If someone proposed a number, show the gap to requested goal and the specific levers that could close it (more leadership gifts secured before launch, larger reachable audience, a new match), each with its own arithmetic. Never close a gap by raising response rates without evidence.
4. **Segment the audience** so each segment gets a different message, ask amount or channel. Remove people from segments who should not be asked (recent major donors in active cultivation, anyone who opted out, families in a memorial campaign unless they asked to be included).
5. **Write the case for support outline.** Need, approach, evidence, what a gift does, why this timing is true, who else supports. Use only facts the user supplied. Hand the letter itself to the year-end-appeal-letter prompt.
6. **Design match mechanics** if a match exists: ratio, cap, eligible gifts, dates, public attribution consent, and truthful disclosure of what happens if the match is not reached. Read `references/channels-matching-and-ethics.md`.
7. **Plan channels and cadence.** A calendar of every touch by segment and channel, including pre-launch leadership asks, launch, reminders to non-donors only, and a thank-you to donors that does not ask again.
8. **Run the ethics check** on every message and page element before launch. Read `references/channels-matching-and-ethics.md`.
9. **Set tracking codes.** One appeal code per campaign, source codes per segment and channel, and URL tagging for links. Read `references/processing-tracking-and-review.md`.
10. **Plan gift processing and the acknowledgment handoff.** Who batches, deposits, enters and acknowledges each gift, how fast, and how tribute notifications and match submissions are handled. Acknowledgment content follows the standard in `plan-donor-stewardship`.
11. **Plan the post-campaign review** before launch, so the right data is captured: results by segment against the goal build-up, costs, new donors, and a second-gift follow-up plan.

## Campaign-type specifics

- **Year-end:** the deadline (end of the calendar year) is real for donors who want a gift in that tax year; say only that. Coordinate with any mailing already scheduled so donors are not asked twice in a week.
- **Giving day:** a fixed 24-hour or short window. Pre-schedule matches and leadership gifts; use any running total truthfully. No countdown timers on the organization's own pages; a date and time are enough.
- **Peer-to-peer:** goal = fundraisers recruited × share who raise anything (activation) × average raised per active fundraiser, each from the last peer-to-peer campaign. Give fundraisers approved language, a coaching schedule, and rules for stories (their own, not participants').
- **Memorial and tribute:** the family leads. Get written agreement on name use, photos, wording and whether the cause of death is mentioned. If a death by suicide is mentioned, follow safe messaging practice and use the organization's approved crisis resource copy. Tribute notifications tell the family who gave, and give amounts only if the donor agreed.
- **Employee giving:** confirm the company's match policy from its own documents; the match is the company's gift and is credited to the company, with soft credit to the employee. Employee resource group campaigns need the company's approval for internal promotion.

## Routing

- Read `references/goal-and-segments.md` when building the goal, choosing segments, or setting ask amounts.
- Read `references/channels-matching-and-ethics.md` when planning channels and cadence, designing match mechanics, handling memorial or peer-to-peer content, or running the ethics check.
- Read `references/processing-tracking-and-review.md` when setting codes, planning gift processing and acknowledgment, or designing the review.
- Hand off the appeal letter to the year-end-appeal-letter prompt, email copy to the newsletter or email prompts, and ongoing stewardship of the donors acquired to `plan-donor-stewardship`. Corporate matching programs negotiated with a company belong in `plan-corporate-partnership`.

## Using the goal script

`python3 scripts/campaign_goal.py segments.csv --match-cap 10000 --requested-goal 150000` prints each segment's expected donors and revenue for low, base and high scenarios, then totals with leadership gifts, match, goal, and the gap to any requested goal. Add `--costs` for net revenue and cost per dollar raised. Rates may be written as 5% or 0.05. The output is only as good as the history behind each rate; if a rate is an assumption, say so next to the number. Remove leadership donors from segment audiences before running, or they are counted twice.

## Decision rules where practitioners differ

- **Is the match inside the goal?** Include it only when terms are in writing and eligible gifts in the low scenario can earn it; otherwise show it as upside.
- **Public running total or thermometer?** Use one only if it is updated from real gifts at least daily during the window; a stale total misleads.
- **Mail plus email, or email only?** Keep postal mail for segments whose past gifts came mainly by mail (check source codes); move a segment to email only when its history supports it.
- **Ask amount: last gift or highest previous gift?** Use last gift for donors who gave once or twice, highest previous gift for loyal donors who have varied; test the choice when volume allows.
- **One campaign-wide story or several?** One lead story keeps messages consistent; segment-specific stories suit lapsed donors who gave to a different program. Every story needs consent either way.
- **Plan goal versus stretch target.** Publish the plan goal; keep a stretch target internal, clearly labelled, and never present it as the expected outcome.

## Illustrative example

Hypothetical round numbers: 500 past donors at a 40% response rate and a $100 average gift = 500 × 0.40 × 100 = $20,000. 1,000 lapsed donors at 4% and $50 = $2,000. Committed leadership gifts $5,000. A 1:1 match capped at $10,000 is earned in full because eligible gifts ($22,000) exceed the cap. Base goal = 20,000 + 2,000 + 5,000 + 10,000 = $37,000. If the board proposed $60,000, the gap is $23,000; closing it needs named leadership prospects or a larger reachable audience, not a higher assumed response rate.

## Common mistakes to catch

- A goal set as the budget gap, with no segment arithmetic behind it.
- A match counted in the goal before the terms are written down, or counted in full when eligible gifts cannot earn it.
- Leadership donors counted both as committed gifts and inside a segment's expected revenue.
- Reminder emails sent to people who already gave.
- A giving day page with a countdown timer, or a donation form with the monthly option pre-selected.
- Match copy that says gifts "unlock" money the matcher will give anyway.
- A memorial page built from a family's grief without their written agreement on every element.
- Peer-to-peer fundraisers telling participants' stories instead of their own.
- No appeal or source codes, so the review cannot say what worked.
- Acknowledgments that fall weeks behind at the year-end peak because one person signs everything.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Campaign summary
2. Data used and assumptions
3. Goal build-up
4. Gap to requested goal
5. Audience segments and asks
6. Case for support outline
7. Match mechanics
8. Channel plan and cadence
9. Ethics check
10. Tracking codes
11. Gift processing and acknowledgment handoff
12. Post-campaign review plan
13. Open questions

Use these exact labels where they apply: "Supplied", "Calculated", "Assumed", "low", "base", "high", "pass", "change needed", "Slot: organization-approved crisis resource".

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Write status as words and placeholders as plain text. Do not use Markdown checkboxes. Wherever campaign content touches suicide, self-harm or a mental-health crisis, include the placeholder "Slot: organization-approved crisis resource" and say the approved copy is used verbatim.

Gap to requested goal applies when someone proposed a number; otherwise keep the heading and say no goal was proposed.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

1. **Campaign summary** — type, window, purpose, restriction if any, recommended goal and the one-line reason.
2. **Data used and assumptions** — table: Item | Value | Source label (Supplied, Calculated, Assumed) | What changes if wrong.
3. **Goal build-up** — table: Segment | Audience | Response rate | Average gift | Expected donors | Expected revenue, then leadership gifts, match, and low, base and high totals with the formula written out.
4. **Gap to requested goal** — only when someone proposed a number: the gap, and each lever to close it with its own arithmetic and evidence status.
5. **Audience segments and asks** — table: Segment | Include or exclude rule | Ask amount basis | Message angle | Channel.
6. **Case for support outline** — need, approach, measured evidence, what a gift does, why now, who else supports; each fact with its source.
7. **Match mechanics** — ratio, cap, eligible gifts and dates, attribution consent, and what donors are told about the match.
8. **Channel plan and cadence** — table: Date | Segment | Channel | Message | Ask or thank-you | Owner.
9. **Ethics check** — each rule, pass or change needed, and the change.
10. **Tracking codes** — appeal code, source codes, link tagging convention.
11. **Gift processing and acknowledgment handoff** — table: Step | Owner | Time standard | System.
12. **Post-campaign review plan** — the measures, formulas, data owner and review date.
13. **Open questions** — decisions for leadership, and points for the accountant or counsel.

## Quality checks

- The goal is the sum of segment build-ups plus committed gifts plus a match that is actually earnable; every rate traces to the organization's history or is labelled Assumed.
- Low, base and high scenarios exist, and the arithmetic has been rechecked.
- No countdown timer, fake deadline, pre-checked recurring gift option, guilt or fear framing, or claim that a match is lost when it is not.
- Match language matches the matcher's actual terms.
- Stories and photos have recorded consent; minors have parental consent and organizational review; participants are de-identified unless they chose otherwise.
- Memorial content follows the family's written wishes and safe messaging practice, says "died by suicide" if cause is mentioned at all, and uses the organization's approved crisis resource copy verbatim.
- Program outcomes are described as what was measured, never as treatment effects.
- Every gift path ends in an acknowledgment owner and time standard.

## Boundaries

- Tax language in campaign materials, quid pro quo disclosures for event tickets, and year-end deadline statements are checked with the organization's accountant.
- Charitable solicitation registration in the states where the campaign solicits, texting consent rules, and sweepstakes or raffle rules go to counsel; they vary by state.
- This skill does not decide the organization's priorities or approve use of a family's story; leadership and the family do.
- Non-clinical: campaign content never diagnoses, assesses risk, or promises clinical outcomes.
