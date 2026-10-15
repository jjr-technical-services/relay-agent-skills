---
name: write-funder-report
description: Write interim and final grant reports to a funder - extract every deliverable and reporting requirement from the grant agreement, build an outcomes vs targets table with honest variance explanations, write the budget-to-actual narrative explaining every variance beyond the funder's threshold, record lessons learned and course corrections, include participant stories only with recorded consent, complete an attachments checklist, set the next-period plan, and plan a stewardship follow-up. Tone is candid about shortfalls. Use when asked to write a grant report, progress or interim report, final or close-out report, answer a funder's reporting template, explain underspending or missed targets to a funder, or prepare a renewal-ready report. Do not use for a general budget variance memo (budget-variance-explainer prompt), a short update email to a funder (funder-update-email prompt), the original proposal (write-grant-proposal), or drafting the participant story itself (write-impact-story).
---

# Write Funder Report

A funder report is where an organization earns its next grant. Program officers read many reports; what they remember is whether the organization did what it said, told the truth when it did not, and knows what it will do next. The common failures are missing a reporting requirement buried in the agreement, presenting outputs as if they were outcomes, smoothing over a missed target, leaving budget variances unexplained, and using a participant's story without consent. This skill starts from the grant agreement, reports against every promise, explains variances plainly, and ends with a plan and a stewardship step.

## Inputs to gather

Ask for these; label anything missing as **Assumed** or leave a visible placeholder.

- **The grant agreement and award letter**, including reporting schedule, required template or questions, deliverables, outcome targets, budget, variance or modification rules, and any special conditions.
- **The approved proposal**, logic model, and evaluation plan, which hold the targets and measures the funder expects to see.
- **Program data for the period**: outputs (activities delivered, participants reached) and outcomes (measured changes), with source, collection method, and response counts. Aggregated only.
- **Budget-to-actual** for the grant from the accounting system or monthly grant spending report, with approved modifications.
- **Changes during the period**: staffing, partners, timeline, scope; and any approvals already received from the funder.
- **Stories and quotes** proposed for the report, with the consent record for each (who consented, when, for what uses, and for minors, parental consent and the organization's review).
- **Prior reports** to this funder and any feedback received.
- **The organization's small-cell threshold** for reporting subgroup data (if none is set, state the default used as an assumption, for example suppressing any group under 10).
- **Report logistics**: the portal or template, the due date, who approves internally, and who signs any financial certification.
- **Acknowledgement rules**: how the funder asked to be credited, so attached materials can be checked.

When the agreement itself is not supplied, say so at the top, build the requirements table from what the user states, and mark it "Agreement not reviewed".

## Workflow

1. **Extract every requirement from the agreement.** Build the "Requirements extracted" table: requirement, agreement section, due date, format, and where the report answers it. Include deliverables, outcome targets, demographic or geographic data asked for, financial report format, attachments, certifications, and special conditions. Read [references/requirements-and-outcomes.md](references/requirements-and-outcomes.md).
2. **Separate outputs from outcomes.** Outputs are what the program did and how many took part; outcomes are measured changes for participants. Report both, labelled.
3. **Build the outcomes vs targets table.** For each target: target, actual, percent of target, data source, and a variance explanation for anything not met or significantly exceeded. Describe mental-health-related results as what was measured (knowledge, self-reported confidence, help-seeking intentions), never as clinical effects.
4. **Explain each variance honestly.** Cause (timing, volume, external, design, data), effect on the grant's purpose, and what the organization is doing about it. Do not reframe a miss as a success or omit it.
5. **Protect privacy in the data.** Aggregate everything; suppress any subgroup below the threshold and label it "Suppressed"; do not include names, student records, or health information. Where data may be covered by FERPA or HIPAA, flag it; the organization's counsel decides applicability.
6. **Write the budget-to-actual narrative.** Compare actual with budget for the period, apply the funder's variance threshold exactly as the agreement words it, and explain every line marked "Beyond threshold". State whether any change needed or needs prior approval. Read [references/budget-narrative-and-variance.md](references/budget-narrative-and-variance.md).
7. **Write lessons learned and course corrections.** What the organization learned, what it changed, and what it will change, with evidence. Specific beats general.
8. **Check stories and quotes for consent.** Every story or quote gets a consent status: "Consent on file" (with scope and date) or "Needs consent". A story involving a minor needs parental consent and the organization's review in addition to the young person's agreement. Anything marked "Needs consent" stays out of the report. Hand approved stories to write-impact-story for drafting. Read [references/stories-tone-and-stewardship.md](references/stories-tone-and-stewardship.md).
9. **Complete the attachments checklist.**
10. **Write the next-period plan**: activities, targets (unchanged or proposed changes flagged for approval), and risks.
11. **Plan the stewardship follow-up**: who contacts the program officer, when, and with what (an invitation, a short conversation about the shortfall, a thank-you from a participant with consent).
12. **Read it as the program officer would**: would they find every requirement answered, every miss explained, and nothing that later surprises them?

## Tone rules

- Candid, specific, and calm. Name shortfalls in the first sentence of the relevant section, then the cause and the fix.
- No guilt, fear, or pity framing about participants; strengths-based and people-first language in the organization's own terms.
- No inflation: do not present outputs as outcomes, percentages without counts, or self-reported change as proven impact.
- Safe messaging for any suicide-related content: "died by suicide", no method or location detail, no single-cause explanation, no sensational language, and include help-seeking and hope. Use the organization's approved crisis resource wording verbatim; if it is not supplied, leave the slot marked as organization-approved crisis resource.
- Credit partners and the funder accurately; do not claim sole credit for shared results.

## Worked example (illustrative, hypothetical round numbers)

| Measure | Target | Actual | Percent of target | Variance explanation |
| --- | --- | --- | --- | --- |
| Workshops delivered | 40 | 30 | 75% | Two partner campuses paused programming for a term; 8 of the 10 missing workshops are rescheduled for next term |
| Students completing both sessions | 600 | 480 | 80% | Follows from fewer workshops; completion per workshop held steady at 16 (480 ÷ 30) |
| Completers reporting more confidence in where to seek help | 60% | 66% | 110% | Measured by pre and post survey; 400 of 480 completers responded, 264 reported an increase (264 ÷ 400 = 66%) |

Budget line: personnel budgeted 40,000 for the period, actual 31,000, variance −9,000 or −22.5% (9,000 ÷ 40,000). With a funder threshold of 10% per line, this line is "Beyond threshold" and needs an explanation: the coordinator started two months late. Travel budgeted 5,000, actual 5,400, +8%, within threshold.

## Interim versus final reports

- **Interim**: progress to date against the phased plan, early variances with their fixes, any approval needed before the next period, and the next-period plan. Keep outcome claims provisional when data collection is incomplete.
- **Final**: every deliverable and target for the whole award, final budget-to-actual reconciled to the ledger, match documentation, unspent funds and what happens to them, lessons learned for the field or the funder, and what comes next (renewal, a different ask, or a planned close).
- **Renewal-ready**: when a renewal is likely, the final report should make the case with evidence, but it is not a proposal; keep the ask to one clear sentence and hand the application to write-grant-proposal.

## Decision rules for hard cases

- **Leadership asks to leave out a missed target**: include it. Put it in the summary with its cause and fix, and tell the user plainly why: the funder already has the targets, and an omission found later costs more trust than the miss. Offer the most constructive honest framing, not a softer number.
- **A story is compelling but consent is incomplete**: mark it "Needs consent", leave it out, and list what is needed to use it next time (for a minor, parental consent plus organizational review). Do not describe the participant in identifying detail even while explaining the gap.
- **A subgroup is too small to report**: show "Suppressed", suppress any cell that could be recovered by subtraction, and note the threshold once.
- **Data are late or incomplete**: report what exists with counts, say when the rest will be available, and do not estimate outcomes to fill the gap.
- **The agreement's threshold is ambiguous**: apply the stricter reading and ask the program officer.
- **A target now looks wrong**: explain why with evidence, propose a revised target, and mark it as needing the funder's approval; do not quietly report against a new target.

## Common failure patterns

- Reporting against the proposal's narrative instead of the agreement's actual requirements.
- Leading with the best number and burying the misses.
- Percentages with no counts or response rates.
- Treating self-reported survey change as proven impact.
- Budget variances explained in one sentence for the whole budget instead of line by line against the rule.
- Stories used on verbal permission, or "anonymized" stories that still identify a young person.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Requirements extracted
2. Summary
3. Outputs
4. Outcomes vs targets
5. Budget-to-actual narrative
6. Lessons learned and course corrections
7. Stories and quotes
8. Attachments checklist
9. Next-period plan
10. Stewardship follow-up
11. Assumptions and gaps

Use these exact labels where they apply: "Answered", "Partly answered", "Not yet available", "Suppressed", "Within threshold", "Beyond threshold", "Consent on file", "Needs consent".

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Use plain tables; do not use Markdown checkboxes.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

1. **Requirements extracted**: requirement, agreement section, due date, format, where answered, status (Answered, Partly answered, Not yet available).
2. **Summary**: three to five sentences, including the most important shortfall if there is one.
3. **Outputs**: activity, planned, delivered, source.
4. **Outcomes vs targets**: measure, target, actual, percent of target, data source and response count, variance explanation. Small subgroups show "Suppressed".
5. **Budget-to-actual narrative**: line, budget, actual, variance, variance percent, flag ("Within threshold" or "Beyond threshold"), explanation, approval needed (yes or no).
6. **Lessons learned and course corrections**.
7. **Stories and quotes**: each with consent status ("Consent on file" or "Needs consent"); only consented material appears in the report text.
8. **Attachments checklist**: item, agreement source, owner, status.
9. **Next-period plan**: activities, targets, proposed changes needing funder approval, risks.
10. **Stewardship follow-up**: action, owner, date, purpose.
11. **Assumptions and gaps**: data not yet available, assumed thresholds, and who can confirm.

## Quality checks

- Every requirement in the agreement appears in "Requirements extracted" with where it is answered.
- Every target has an actual; every miss or large overshoot has an explanation; no miss is omitted or reframed.
- Percentages show their counts; outputs and outcomes are labelled separately.
- Every budget line beyond the funder's threshold has an explanation and an approval status, and the math is right.
- No names or identifying details of participants; small cells are suppressed; possible FERPA or HIPAA data is flagged.
- No story or quote without recorded consent; minors have parental consent and organizational review.
- No clinical or treatment claims, no "guaranteed", and no "committed suicide".
- The next-period plan and stewardship follow-up each have owners and dates.
- Suppressed cells cannot be recovered by subtracting from totals.
- Leadership requests to omit a miss are answered with the reason for disclosure, not followed silently.
- Figures match between the summary, the tables, and the attachments.
- Percent-of-target figures are recomputed from the counts before sending.

Illustrative suppression (hypothetical): participation by site of 150, 86, and 4 with a threshold of 10 is reported as 150, "Suppressed", "Suppressed" plus a total of 240, or as 150 and "Other sites combined, 90", because showing 86 with a total of 240 would reveal the 4.

## Relation to the automations

Where the organization already runs automated funder report preparation or monthly grant spending reports, use their outputs as the data inputs; this skill supplies the reading of the agreement, the variance explanations, the consent gate, and the writing.

## Boundaries

- The skill drafts; the organization's leadership approves and an authorized person submits, including any financial certification.
- It does not decide whether a variance requires the funder's prior approval when the agreement is unclear; ask the program officer and record the answer.
- Privacy law applicability (FERPA, HIPAA, state law) is decided by the organization's counsel.
- Hand-offs: participant stories to write-impact-story, budget modifications to build-grant-budget, a short update email to the funder-update-email prompt, general variance commentary to the budget-variance-explainer prompt, and renewal applications to write-grant-proposal.
