---
name: write-grant-proposal
description: Develop a complete grant proposal from a funder's RFP or guidelines - parse every requirement into a compliance matrix (sections, questions, word and character limits, attachments, format rules, eligibility, deadline, and where each is answered), write the need statement from cited evidence, program design, SMART objectives, organizational capacity and sustainability, hand off the logic model, evaluation plan and budget narrative, reuse approved boilerplate with freshness checks, and run a reviewer read-through against the funder's scoring criteria and a final submission checklist. Use when asked to write a grant application, answer a funder's proposal questions, turn an RFP into an outline, check a draft against guidelines, or fit a proposal to limits. Do not use for a letter of inquiry (grant-letter-of-inquiry prompt), commercial RFP responses (rfp-response-drafter prompt), the budget itself (build-grant-budget), or post-award reports (write-funder-report).
---

# Write Grant Proposal

A proposal is scored against the funder's own rules before anyone reads for quality. Most losses that are not about fit come from compliance: a missed attachment, a section under the wrong heading, an answer over the character limit, an eligibility rule the applicant does not meet. The rest come from claims reviewers cannot believe: need statements with uncited numbers, objectives that cannot be measured, outcomes the program cannot produce. This skill parses the funder's requirements into a compliance matrix first, writes each section from evidence and the organization's approved language, and reads the draft the way a reviewer will score it.

## Inputs to gather

Ask for these; label anything missing as **Assumed** or leave a visible placeholder.

- **The funder's documents**: the RFP, notice of funding, guidelines, application form or portal questions, scoring rubric, FAQ, and any addenda. Never infer a requirement, limit, deadline, or priority that is not in these documents.
- **Eligibility facts about the organization**: legal status, budget size, audit or financial review status, service area, years of operation, registration in required systems.
- **Program facts**: what the program does, for whom, where, how often, staffing, partners, current results with their source, and what the grant would change.
- **Evidence for the need**: local and population data with source and date, the organization's own data (aggregated), and published research the user supplies or the agent retrieves and cites.
- **Approved boilerplate**: mission, history, leadership bios, board list, organizational capacity, diversity and equity statements, financial summaries, each with its last-approved date.
- **Hand-off outputs** if they exist: logic model (build-logic-model), evaluation plan (design-program-evaluation), budget and justification (build-grant-budget), participant story (write-impact-story).
- **Voice and audience language**: the organization's preferred terms for the people it serves.
- **Deadline and internal calendar**: the funder's deadline and time zone, internal review dates, and who signs.
- **Privacy constraints**: the small-cell suppression threshold, and whether any data may be covered by FERPA (student education records) or HIPAA (health information); the organization's counsel decides applicability.

When funder documents are missing, do not draft to a generic template and call it compliant. Build the matrix skeleton, mark it "Funder documents not supplied", and ask for them.

## Workflow

1. **Build the compliance matrix before writing a word.** Read every funder document end to end, including footnotes and attachments lists. One row per requirement: section or question, exact funder heading, limit (words, characters with or without spaces, pages), format rule (font, margins, file type, naming), attachment, eligibility rule, deadline and time zone, submission method. Add where the requirement will be answered and its status. Read [references/rfp-compliance-matrix.md](references/rfp-compliance-matrix.md).
2. **Resolve eligibility first.** Any eligibility rule that is not clearly met gets status "Eligibility risk" and goes to the top of the answer with the question to ask the funder. Do not draft around an eligibility gap.
3. **Outline in the funder's order with the funder's headings.** Use their exact headings and numbering, even if the organization's template differs. Map each scoring criterion to the section that earns its points.
4. **Write the need statement from cited evidence.** Local, specific, current, and sourced; population-level data plus the organization's own aggregated data; the gap between what exists and what is needed. Read [references/section-writing-guide.md](references/section-writing-guide.md).
5. **Write the program design.** Who, what, where, when, how often, by whom, and why this approach, linked to the need. Keep activities consistent with the budget.
6. **Write SMART objectives.** Specific, measurable, achievable, relevant, time-bound, with a baseline and data source for each. Describe outcomes as what will be measured (participation, knowledge, self-reported confidence, help-seeking intentions), not as clinical or treatment effects.
7. **Hand off the logic model** to build-logic-model when the funder asks for one or the objectives need structure; insert its result in the funder's format.
8. **Hand off the evaluation plan** to design-program-evaluation; summarize it in the funder's evaluation section with measures, data collection, and who analyses the data.
9. **Write organizational capacity** from approved boilerplate plus specifics relevant to this program: staff qualifications, partnerships, systems, prior grants managed.
10. **Write sustainability**: how the work continues after the grant, with named and realistic sources; say plainly what would end.
11. **Hand off the budget narrative** to build-grant-budget and check that every activity in the narrative has a budget line and every budget line has an activity.
12. **Reuse boilerplate with freshness checks.** Pull approved text, check its approval date and every fact in it, and mark anything older than the organization's freshness rule for update. Read [references/boilerplate-and-review.md](references/boilerplate-and-review.md).
13. **Fit to limits.** Count words or characters exactly as the funder defines them; cut adjectives and repetition before evidence.
14. **Run the reviewer read-through.** Score the draft against the funder's criteria as a reviewer would, section by section, and fix the weakest sections first.
15. **Complete the final submission checklist**: attachments, signatures, file names, portal fields, and deadline with time zone.

## Writing rules

- Plain, specific language. No superlatives ("unique", "innovative", "transformational") unless the funder uses the word and the evidence supports it.
- Every statistic has a source and year in the text or a note. If a number cannot be sourced, remove it or mark it as the organization's own unaudited data.
- Program outcomes are stated as measured results, never as diagnosis, treatment, or clinical improvement.
- When content touches suicide or self-harm, follow safe messaging practice: say "died by suicide", avoid method or location detail, do not attribute a death to a single cause, avoid sensational language, and include help-seeking and hope. Use the organization's approved crisis resource wording verbatim, marked as organization-approved crisis resource if the text is not supplied. In the US the 988 Suicide & Crisis Lifeline is reachable by call or text at 988.
- People-first, strengths-based language that follows the organization's own audience terms. Do not describe communities by deficits alone.
- Participant data appears only in aggregate; suppress small groups under the organization's threshold (state the threshold used as an assumption if none is supplied). Stories appear only with recorded consent; hand story drafting to write-impact-story.
- Do not promise results the program cannot control. Do not use "guaranteed".

## Worked example (illustrative, hypothetical)

Guidelines for a hypothetical youth program grant say, across three places: the narrative questions ("Statement of Need, 2,000 characters including spaces"), the eligibility FAQ ("applicants must submit an independent audit for the most recent fiscal year"), and the attachments list ("board list with affiliations; IRS determination letter"). The organization's draft uses its own heading "The Problem", runs 2,600 characters, and the organization had a financial review, not an audit, last year.

| Requirement | Funder source | Limit or rule | Where answered | Status |
| --- | --- | --- | --- | --- |
| Independent audit, most recent year | Eligibility FAQ | Required | Not available | Eligibility risk |
| Statement of Need | Question 2 | 2,000 characters including spaces | Section 2, retitled | Partly met (2,600; cut 600) |
| Board list with affiliations | Attachments list | PDF | Attachment 1 | Gap |
| IRS determination letter | Attachments list | PDF | Attachment 2 | Met |

The answer leads with the eligibility risk and the question for the program officer ("Will you accept a reviewed financial statement from an organization of our budget size, or should we apply through a fiscal sponsor?"), then retitles the section, cuts 600 characters, and lists the missing board list.

## Decision rules for hard cases

- **Ambiguous rule**: follow the stricter reading and ask the program officer in writing; record the answer and its date in the matrix.
- **Conflicting documents**: the most recent addendum or question-and-answer posting governs; note both sources.
- **The funder's priority does not fit the program**: say so. Do not reshape the program on paper to match a priority it will not deliver.
- **Limits too tight for the evidence**: keep the claim and its source, cut description; move detail to an attachment only if the funder allows attachments for that purpose.
- **No local data**: use the nearest cited data with its scope stated, plus the organization's own aggregated data labelled as internal.
- **Boilerplate fact out of date**: update it from the current source and flag it for re-approval; never submit a known-stale number.
- **Story requested without consent on file**: leave a placeholder and hand to write-impact-story; do not draft from memory.

## Common failure patterns

- Writing before reading the whole RFP, then discovering a required section or attachment late.
- Using the organization's headings instead of the funder's.
- Counting words when the portal counts characters, or ignoring whether spaces count.
- Uncited statistics or national figures presented as local.
- Objectives with no baseline or data source.
- Outcome claims the program cannot measure or that imply clinical effects.
- Narrative, budget, and logic model describing different numbers of participants or sessions.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Compliance matrix
2. Open questions for the funder
3. Proposal draft
4. Evidence notes
5. Boilerplate freshness
6. Reviewer read-through
7. Final submission checklist
8. Assumptions and placeholders

Use these exact labels where they apply: "Requirement", "Funder source", "Limit or rule", "Where answered", "Status", "Met", "Partly met", "Gap", "Eligibility risk", "Current", "Update needed".

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Use plain tables; do not use Markdown checkboxes, because some reviewers' systems misread them.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

1. **Compliance matrix**: columns Requirement, Funder source (document and page or section), Limit or rule, Where answered, Status. Status values: Met, Partly met, Gap, Eligibility risk. Eligibility rows first.
2. **Open questions for the funder**: each ambiguity or eligibility risk with the exact question to send the program officer.
3. **Proposal draft**: every section under the funder's exact heading, with the count against its limit shown after the section (for example "1,940 of 2,000 characters including spaces").
4. **Evidence notes**: each statistic with source, date, and where used.
5. **Boilerplate freshness**: each reused block, its last-approved date, facts that changed, and status Current or Update needed.
6. **Reviewer read-through**: each scoring criterion, points available, where addressed, a candid assessment, and the fix.
7. **Final submission checklist**: a table with Item, Requirement source, Owner, Status. No checkboxes.
8. **Assumptions and placeholders**: everything assumed or left for the user, with who can supply it.

## Quality checks

- Every requirement in the funder's documents appears in the compliance matrix, including requirements buried in footnotes, FAQs, and attachment lists.
- Every section uses the funder's heading and fits its limit as the funder counts it.
- Eligibility risks are stated first and not written around.
- Every statistic has a source and date; nothing is invented.
- Objectives have a baseline, target, date, and data source.
- Outcomes are non-clinical and measured; no treatment claims.
- Safe messaging and people-first language are followed; no identifiable participant data.
- Narrative, logic model, evaluation plan, and budget describe the same activities and numbers.
- Boilerplate facts are current or flagged.
- Every eligibility row has a status, and every Eligibility risk has a question for the funder.
- Each section shows its count against the funder's limit.
- Scoring criteria with the most points get proportionate space and evidence.
- The submission checklist names an owner for every item and uses no checkboxes.
- No identifiable participant details, and no small groups reported below the threshold.

## Tone

Write like a confident, specific colleague explaining the work to a reviewer who has twenty other applications on the desk: short sentences, concrete numbers with sources, and no appeals to pity or urgency. Candour about limits (a pilot, a small sample, a gap in data) reads as credibility, not weakness.

## Boundaries

- The skill drafts and checks; the organization decides what to submit, and an authorized signer certifies it.
- Eligibility interpretations that are uncertain go to the funder's program officer; legal certifications and assurances (for example on federal forms) go to the organization's leadership and counsel.
- Hand-offs: funder research to research-grant-prospects, budget to build-grant-budget, logic model to build-logic-model, evaluation to design-program-evaluation, stories to write-impact-story, and reports after award to write-funder-report.
