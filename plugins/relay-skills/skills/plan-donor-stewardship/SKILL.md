---
name: plan-donor-stewardship
description: Plan donor stewardship for a nonprofit from its own giving data. Segments donors with tunable RFM scoring (recency, frequency, monetary), sizes and assigns portfolios, runs moves management stages (identify, qualify, cultivate, solicit, steward), builds a stewardship calendar by segment, sets acknowledgment and receipt standards including the US $250 written acknowledgment and $75 quid pro quo rules, honours restrictions and anonymity, plans lapsed-donor reactivation, and defines retention, upgrade, average gift and lifetime giving with exact formulas. Use when someone asks for a donor stewardship plan, donor segmentation or RFM scoring, a moves management or portfolio review, donor retention analysis, acknowledgment standards, or how to win back lapsed or LYBUNT donors. Do not use to write a single donor thank-you letter or gift acknowledgment receipt (use those prompts), to plan a time-bound appeal (use plan-fundraising-campaign), or for corporate sponsors (use plan-corporate-partnership).
---

# Plan Donor Stewardship

Stewardship is everything an organization does after a gift so the donor knows the gift arrived, was used as intended, and mattered, and so the next ask is earned rather than assumed. This skill turns a nonprofit's own gift history into a working system: who the donors are (segments), who looks after whom (portfolios), where each relationship stands (moves management), what each segment hears and when (calendar), how every gift is thanked and receipted (acknowledgment standard), which gifts carry conditions (restrictions, anonymity, quid pro quo), and how the team will know it is working (metrics with exact formulas). It does not write individual letters; it sets the standard those letters follow.

## Inputs to gather

Ask for, or retrieve from the organization's context library, the following. Proceed with clearly labelled placeholders when something is missing, and say what each placeholder changes.

- Gift history export: one row per gift with donor ID, gift date, amount, and ideally fund or restriction, gift type (cash, stock, in-kind, donor-advised fund, matching, soft credit), campaign or appeal code, and the acknowledgment date.
- Fiscal year start month and the periods to compare (for example the last two complete fiscal years).
- Staff who steward donors, their hours available for relationship work, and who signs acknowledgments today.
- Existing gift acceptance, recognition and anonymity policies, and any gift agreements for restricted or pledged gifts.
- Events or benefits donors receive in return for payments (dinners, tickets, merchandise) and the organization's good-faith value for each.
- CRM in use and known data problems (duplicates, missing addresses, household records).
- Organizational goals for the year (for example raise retention, grow monthly givers, move mid-level donors up).
- Recurring gift program details: number of active recurring donors, how failed payments and expired cards are followed up.
- Donor communication preferences and opt-outs as recorded in the CRM.
- The donor privacy policy and any rules about what may be recorded on donor records.
- Upcoming events, reports and program milestones that can become non-ask stewardship touches.
- Current acknowledgment backlog, if any, and the average days from gift to thank-you.

Label every figure as **Supplied** (from the user's data), **Calculated** (derived from supplied data, show the formula) or **Assumed** (a placeholder the user must confirm). Never fill a gap with an "industry" benchmark; if a heuristic helps, name it as a heuristic and say what data should replace it.

## Workflow

1. **Clean before counting.** Merge duplicate donor records, decide household versus individual counting, and separate hard credit (the legal donor) from soft credit (the person who influenced or directed it, such as an employee whose company matched, or a donor-advised fund recommender). Metrics run on hard credit unless the user decides otherwise; state the choice. Read `references/metrics-and-crm-hygiene.md` for the field checklist.
2. **Compute the baseline metrics** for the two most recent comparable periods: donor retention, new-donor retention, repeat-donor retention, dollar retention, upgrade rate, average gift, average donor total, reactivation rate and lifetime giving distribution. Use the exact formulas in `references/metrics-and-crm-hygiene.md`. Show numerators and denominators, not only percentages.
3. **Score RFM.** Score each donor 1 to 5 on recency (days since last gift), frequency (gifts in the lookback window) and monetary value (total or average in the window, the user chooses). Default to quintiles of the organization's own distribution; let the user set fixed breakpoints and weights instead. Run `scripts/rfm_score.py` when a gifts CSV is available. Read `references/segmentation-and-portfolios.md` for scoring choices and segment rules.
4. **Name segments that drive different treatment.** A segment only earns its place if it gets a different ask, channel, signer or cadence. Typical: first-time donors, recurring or monthly donors, loyal mid-level donors, major gift prospects and donors, LYBUNT (gave last year but not yet this year), SYBUNT (gave some year but not last year or this year), lapsed long-term, and restricted-gift or institutional donors.
5. **Size and assign portfolios.** Only donors who will receive personal, planned contact go into a staff or board portfolio. Size each portfolio from capacity, not a quoted norm: portfolio size = available relationship hours per year ÷ (planned contacts per donor per year × hours per contact). Unassigned donors get a programmed stewardship track.
6. **Place portfolio donors in a moves management stage** (identify, qualify, cultivate, solicit, steward) with a next move, owner and date for each. A donor with no dated next move is not being managed. Read `references/segmentation-and-portfolios.md` for stage entry and exit criteria.
7. **Build the stewardship calendar by segment.** For each segment list touches across the year: thank-you, impact report, invitation, personal call, survey or feedback request, renewal ask. Keep a ratio of non-ask touches to asks that the organization chooses and states.
8. **Set the acknowledgment standard.** Timing target by gift size, who signs, channel, and receipt content. Apply the US substantiation rules carefully and route edge cases to the accountant. Read `references/acknowledgment-and-restrictions.md` before writing this section.
9. **Register every gift exception.** Restricted purpose, time restriction, pledge schedule, anonymity request, quid pro quo benefit, noncash gift, donor-advised fund or matching gift, communication preferences. Each gets an owner and a control.
10. **Plan reactivation** for LYBUNT, SYBUNT and long-lapsed donors: what they last gave to, a specific report back on that purpose, a low-friction way to give again, and a stop rule (when to stop asking and move to an annual touch only).
11. **Define recognition rules** that honour anonymity and naming preferences, use approved gift ranges rather than exact amounts unless the donor agreed, and never list a donor publicly without a recorded preference check.
12. **Set targets and a review cadence.** Targets come from the organization's own baseline (for example move repeat-donor retention by a stated number of points), not from outside averages.

## Routing

- Read `references/segmentation-and-portfolios.md` when scoring RFM, naming segments, sizing portfolios, or placing donors in moves management stages.
- Read `references/acknowledgment-and-restrictions.md` when setting acknowledgment timing, signers, receipt content, quid pro quo disclosures, restricted gifts, anonymity or recognition.
- Read `references/metrics-and-crm-hygiene.md` when computing any metric or when the data needs cleaning.
- Hand off single letters to the donor-thank-you-letter prompt and single receipts to the gift-acknowledgment-receipt prompt, using the standard this skill sets.
- Hand off time-bound appeals (year-end, giving day, peer-to-peer, memorial) to `plan-fundraising-campaign`; corporate sponsors and cause marketing to `plan-corporate-partnership`; board reporting of donor metrics to `prepare-board-meeting`.

## Using the RFM script

`python3 scripts/rfm_score.py gifts.csv --as-of 2026-06-30` prints each donor's recency days, gift count, monetary value, R, F and M scores, weighted score and segment, then a segment summary. Add `--current-start` and `--current-end` to also print retention, upgrade, average gift and reactivation for that period against the immediately preceding period of the same length. Options: `--r-breaks`, `--f-breaks`, `--m-breaks` for fixed breakpoints, `--weights` for R,F,M weights, `--monetary total|average`, `--lapse-days` for the lapsed rule, and column-name overrides. Run `--help` for the full list.

Interpretation: quintile scores are relative to this file, so a 5 means "top fifth of these donors", not "a large donor". Ties at breakpoints can make score groups uneven; that is expected. Check that the lapsed count and the retention denominators match the CRM before relying on the result. The script reads only the file it is given and prints to the screen; `--out` writes the donor table to a path the user names.

## Decision rules where practitioners differ

- **Hard credit or hard plus soft credit for metrics.** Use hard credit for retention and revenue so totals reconcile to finance. Report soft-credit relationships separately for stewardship. Switch only if leadership explicitly wants influence-based counts, and label them.
- **Household or individual.** Count households when mailings and asks go to households; count individuals when relationships are individual (for example board members or major donors with separate giving). Apply one rule to both periods.
- **Calendar or fiscal year.** Use the fiscal year for internal reporting because budgets and audits use it; use the calendar year only for year-end tax-receipt analysis.
- **Recency or monetary weight in RFM.** Back-test on the organization's own data; without enough history, keep equal weights and say so.
- **Personal call threshold.** Set it where staff capacity can call every donor above it within the acknowledgment standard; a threshold the team cannot meet is worse than a higher one it always meets.
- **Board as signers or callers.** Use board thank-you calls for a defined segment when board members commit to a schedule; otherwise keep them for the most important relationships only.

## Illustrative example

Hypothetical round numbers, for method only:

- 400 donors gave in the prior year; 180 of them gave again this year. Donor retention = 180 ÷ 400 = 45%. Attrition = 55%. The 220 who did not give again form the LYBUNT pool for next year's renewal track.
- If 500 donors gave this year in total, then 500 − 180 = 320 were new or reactivated. Split them by whether they had given before the prior year; the donor count identity (retained + reactivated + new = current donors) must hold.
- A staff member with 300 relationship hours, planning 5 contacts per donor at 1.5 hours each, can carry 300 ÷ (5 × 1.5) = 40 portfolio donors.
- A $150 event ticket with a $60 good-faith estimate of the meal's value: the disclosure says the deductible portion is limited to $150 − $60 = $90. The receipt names the $60 estimate and does not call the payment fully deductible.

## Common mistakes to catch

- Reporting a retention rate without its denominator, or comparing a calendar year with a fiscal year.
- Counting a matching gift twice (once for the company, once for the employee) in donor counts.
- Letting a restricted gift be reported back to the donor with a general newsletter instead of a report on the restricted purpose.
- Publishing a donor list without checking anonymity flags and recognition names.
- Treating a gala ticket, auction purchase or benefit-bearing membership as a plain gift on the receipt.
- A senior signer who creates a multi-week backlog. Speed of thanks matters more than the title of the signer.
- Portfolios assigned by habit (every donor above a dollar line) rather than by capacity and readiness.
- A reactivation track with no stop rule, which keeps asking people who have clearly moved on.
- Using program participation or service history to decide whom to ask.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Summary
2. Data used and assumptions
3. Metric definitions
4. RFM scoring key
5. Segments and treatment
6. Portfolios and moves
7. Stewardship calendar by segment
8. Acknowledgment standard
9. Gift exceptions register
10. Reactivation plan
11. Recognition rules
12. CRM hygiene actions
13. Targets and review cadence
14. Open questions for the accountant or counsel

Use these exact labels where they apply: "Supplied", "Calculated", "Assumed", "Donor retention rate", "Upgrade rate", "Average gift", "Lifetime giving", "Quid pro quo disclosure", "good-faith estimate", "Do not list publicly", "LYBUNT", "SYBUNT".

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Write status as words and placeholders as plain text, for example "Assumed: fiscal year starts in July". Do not use Markdown checkboxes.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

1. **Summary** — three to five sentences: current retention and the one change that would matter most.
2. **Data used and assumptions** — table: Item | Value | Source label (Supplied, Calculated, Assumed) | What changes if wrong.
3. **Metric definitions** — table: Metric | Formula | Numerator | Denominator | Result. Always include donor retention rate, upgrade rate, average gift and lifetime giving.
4. **RFM scoring key** — breakpoints for R, F and M, weights, monetary basis, and how the user can tune them.
5. **Segments and treatment** — table: Segment | Rule | Donor count | Owner | Primary channel | Signer | Next ask.
6. **Portfolios and moves** — table: Portfolio owner | Capacity calculation | Donors assigned | Stage counts (identify, qualify, cultivate, solicit, steward) | Donors missing a next move.
7. **Stewardship calendar by segment** — table: Month | Segment | Touch | Ask or no ask | Owner.
8. **Acknowledgment standard** — table: Gift type or size | Target time to thank | Channel | Signer | Receipt must include.
9. **Gift exceptions register** — table: Donor ID or gift | Exception type | Condition | Control | Owner | Status. Use the label "Quid pro quo disclosure" for any payment over $75 that is partly a contribution, stating the good-faith estimate of the benefit's value, and "Do not list publicly" for every donor who asked for anonymity.
10. **Reactivation plan** — LYBUNT, SYBUNT and long-lapsed tracks with message basis, channel, number of attempts and stop rule.
11. **Recognition rules** — how names, ranges and anonymity are handled.
12. **CRM hygiene actions** — table: Problem | Records affected | Fix | Owner | Due.
13. **Targets and review cadence** — targets stated against the baseline, and who reviews what monthly and quarterly.
14. **Open questions for the accountant or counsel** — every tax or legal point the plan depends on.

## Quality checks

Before answering, confirm:

- Every metric shows its formula, numerator and denominator, and the periods compared are the same length.
- Hard and soft credit were not double counted; the choice is stated.
- Every number is labelled Supplied, Calculated or Assumed, and no outside benchmark is presented as fact.
- Every restricted gift in the data appears in the exceptions register with a control that keeps it on its stated purpose.
- Every anonymity request is marked "Do not list publicly" and excluded from recognition lists.
- Any payment over $75 that bought a benefit has a quid pro quo disclosure with a good-faith estimate, and no receipt calls it fully deductible.
- Portfolio sizes come from a capacity calculation.
- The calendar has more non-ask touches than asks for every segment unless the user chose otherwise.
- Service or program participation data was not joined to donor records or used to target asks.
- Arithmetic has been rechecked.

## Boundaries

- Tax statements here describe US federal substantiation rules at a general level. The organization's accountant or tax adviser confirms current rules, state requirements, noncash gift valuation, and any gift that is unusual. Never tell a donor what they may deduct.
- Gift agreements, pledge enforceability, releasing or redirecting a restriction, and naming-rights terms go to counsel and, where required, the donor.
- Donor privacy: follow the organization's donor privacy policy and the donor's communication preferences; do not share donor lists; never link program participation or service records with donor records.
- This skill does not write the letters or receipts themselves; it sets the standard and hands off.
- Wealth screening and prospect research outputs are estimates, not facts about a donor; label them so.
