---
name: prepare-board-meeting
description: Prepare a nonprofit board meeting that ends in clear decisions. Builds the annual board calendar (budget approval, audit and Form 990 review, executive director evaluation, conflict of interest disclosures, committee reports), designs the agenda with a consent agenda and decisions requested up front with options and a recommendation, a short board dashboard of mission and financial measures with definitions, pre-read standards, draft resolutions, a conflict check, minutes that record actions rather than discussion, and a follow-up tracker. Describes fiduciary duties of care, loyalty and obedience accurately and routes legal questions to counsel. Use when someone asks to prepare a board meeting, board packet or agenda, plan the board calendar, build a board dashboard, draft board resolutions, or fix board minutes. Do not use to design slides (use create-deck-outlines), to write minutes from a transcript (use the board-meeting-minutes prompt), or for general team meetings (use meeting-agenda-builder).
---

# Prepare Board Meeting

A board meeting exists to let the board carry out its duties: make the decisions only the board can make, oversee the organization's finances and mission, and support the executive director. Most board time is lost to reports read aloud and decisions that arrive without options. This skill prepares a meeting the other way round: the decisions are named first, each with options and a recommendation; routine items move to a consent agenda; the board sees a few defined measures rather than a stack of reports; conflicts are checked before the meeting; and the minutes record what was decided and who will do what. It organizes governance work; it does not give legal advice.

## Inputs to gather

Ask for, or retrieve from the organization's context library. Proceed with labelled placeholders when something is missing and say what each placeholder changes.

- Bylaws provisions on meetings: notice period, quorum, voting, who may call meetings, committee authority, and whether action without a meeting or electronic participation is allowed.
- Board roster with officer roles, committee assignments, terms, and each member's most recent conflict of interest disclosure.
- The conflict of interest policy and any related-party transactions on the table.
- The meeting date, format, length, and items requested by the chair, executive director and committees.
- Financial statements for the period, the budget, cash position, and the treasurer's or finance committee's notes.
- Program data for the dashboard, in aggregate, with definitions and sources.
- The last meeting's minutes and the open follow-up items.
- The annual cycle: fiscal year end, audit or review timing, Form 990 due date and extension status, executive director evaluation date.

Label every figure **Supplied**, **Calculated** (show the formula) or **Assumed**. Never invent financial results, program numbers, legal requirements or deadlines.

## Workflow

1. **Place the meeting in the annual calendar.** Check which recurring governance items fall due at this meeting (budget, audit, Form 990 review, executive director evaluation and compensation, conflict of interest disclosures, officer elections, committee charters, policy reviews). Read `references/board-calendar-and-governance.md`.
2. **List the decisions requested.** For each: the question in one sentence, why the board (not staff) must decide it, the options, the recommendation, the consequences of each option, and the resolution text. If an item needs no decision, it is information and belongs in the pre-read.
3. **Run the conflict check.** Compare every decision against the roster's disclosures and relationships. For any board member with a financial or family interest, record the interest and plan the recusal: the member discloses, may answer factual questions if the policy allows, leaves the discussion and vote, and the minutes record it. Read `references/board-calendar-and-governance.md`.
4. **Confirm quorum and voting rules** from the bylaws, including for any item where recusals reduce the number of eligible voters.
5. **Build the agenda.** Consent agenda first, then decisions in priority order with time allocated, then strategic discussion, then executive session if needed. Read `references/agenda-dashboard-and-preread.md`.
6. **Build the board dashboard.** Five to eight measures, each with a definition, formula, source, period, target and trend. Mission measures describe what was measured, never clinical outcomes. Suppress small groups in any participant data.
7. **Set the pre-read standard.** Each paper opens with its purpose (decide, discuss or note), a summary under a page, and the question for the board. Send the packet by the date the board agreed; late papers become information items unless the chair decides otherwise.
8. **Draft resolutions** for every decision in plain language, with any required findings (for example the basis for executive compensation). Read `references/resolutions-minutes-and-followup.md`.
9. **Prepare the minutes template** so the officer who keeps the minutes records attendance, quorum, actions, votes, recusals and follow-ups, not a transcript of discussion.
10. **Update the follow-up tracker** from the last meeting and add owners and dates for new actions.
11. **Route legal questions** (bylaws interpretation, employment matters, data incidents, regulatory filings, litigation) to counsel before the meeting and note in the packet that counsel's advice is pending or attached.

## Routing

- Read `references/board-calendar-and-governance.md` when building the annual calendar, describing fiduciary duties, checking conflicts, or handling executive compensation, audit or Form 990 review.
- Read `references/agenda-dashboard-and-preread.md` when designing the agenda, consent agenda, dashboard or pre-read papers.
- Read `references/resolutions-minutes-and-followup.md` when drafting resolutions, minutes templates or the follow-up tracker.
- Hand off slide design to `create-deck-outlines`, writing up minutes from notes to the board-meeting-minutes prompt, budget explanations to the budget-variance-explainer prompt, and detailed budget building to `build-operating-budget`. Donor metrics for the dashboard come from `plan-donor-stewardship`.

## Duties in one paragraph

Board members of a nonprofit corporation owe the organization fiduciary duties, commonly described as three: the **duty of care** (act in good faith, with the care an ordinarily prudent person in a like position would use, which in practice means attending, reading the materials, asking questions and relying on reasonable information); the **duty of loyalty** (act in the organization's interest rather than a personal one, disclose conflicts, and step back from decisions where one exists); and the **duty of obedience** (act consistently with the organization's mission, governing documents and the law). State law defines these duties; some states and commentators treat obedience as part of care and loyalty rather than a separate duty. Counsel advises on how they apply to a specific decision.

## Handling common agenda items

- **Budget approval.** Decision paper with the budget, key assumptions (each labelled Supplied or Assumed), the reserve impact, and at least one alternative (for example a version with a contingency line). The finance committee recommends.
- **Executive director compensation.** Executive session; comparability data summarized in the paper; conflicted members (the executive director and any relative on the board) excluded from discussion and vote; the resolution records the data relied on.
- **Contracts with a board member's business.** Treat as a related-party transaction under the conflict of interest policy: disclosure, the member leaves, the disinterested members consider alternatives and whether terms are fair, and the minutes record the basis. Counsel confirms any state-law requirements for such transactions.
- **Form 990.** Offer the board, or the committee the board has designated, the draft before filing, with time to ask questions; record that it was provided.
- **Audit report.** The audit or finance committee presents; the board receives the report and management letter, with management's responses and dates.
- **Prior minutes.** On the consent agenda only if they are action-style; if they read like a transcript, propose corrected action-style minutes for approval and adopt the template going forward.
- **Program updates.** Information items in the pre-read, with the dashboard carrying the measures; meeting time goes to questions, not presentation.
- **Incidents and legal questions raised by members.** Acknowledge, list under questions for counsel, and schedule a report back; the board does not reach a legal conclusion in the meeting.
- **Committee reports.** Consent agenda unless a committee brings a decision.

## Decision rules where practitioners differ

- **Consent agenda or not.** Use one for routine items (prior minutes, committee reports with no action, routine policy renewals) once the board is used to reading papers in advance; any member may pull an item for discussion.
- **Executive session every meeting or only when needed.** A brief standing executive session without staff normalizes it and avoids signalling a problem; use it for executive director performance and compensation, audit discussions with the auditor, and sensitive matters counsel advises on. Keep its minutes separately.
- **Dashboard breadth.** Fewer measures, consistently defined, beat a long list that changes each meeting. Add a measure only when the board will act on it.
- **Recorded votes by name.** Record the result and recusals always; record names of those voting for and against when the bylaws require it, a member asks, or the matter is significant.
- **Level of minutes detail.** Record actions and the key basis for them, especially where the board relied on information such as comparability data or counsel's advice; do not record who said what.

## Illustrative example

Hypothetical round numbers: unrestricted cash and investments available for operations of $300,000, and annual operating expenses of $1,200,000 excluding depreciation. Months of operating reserve = 300,000 ÷ (1,200,000 ÷ 12) = 300,000 ÷ 100,000 = 3.0 months. Days cash on hand = 300,000 ÷ (1,200,000 ÷ 365) = 300,000 ÷ 3,287.67 = 91.25, about 91 days. Year-to-date expense at $540,000 against a year-to-date budget of $600,000 is a $60,000 (10%) underspend; the paper explains why and whether timing or a real saving.

## Common mistakes to catch

- An agenda that lists reports and hides the decisions at the end.
- A decision paper with one option, or with no recommendation.
- Executive director compensation decided without comparability data, without excluding conflicted members, or without contemporaneous documentation.
- The Form 990 filed without the board being offered a copy first, when the organization answers yes to the Form 990 question that asks about it.
- Conflict of interest disclosures collected once and never checked against the agenda.
- Minutes that read like a transcript, or that omit recusals and the basis for a decision.
- Dashboard measures that change definition from meeting to meeting.
- Participant-level or small-group data in the board packet.
- Legal questions answered in the meeting by whoever sounds most confident.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Meeting summary
2. Decisions requested
3. Conflict check
4. Agenda
5. Board dashboard
6. Pre-read standards
7. Draft resolutions
8. Annual board calendar
9. Minutes template
10. Follow-up tracker
11. Questions for counsel

Use these exact labels where they apply: Supplied, Calculated, Assumed, recusal, disclosure only, none, Eligible voters remaining, No conflicts identified, decide, discuss, note.

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

Do not use Markdown checkboxes or square-bracket placeholders; write status as words and placeholders as plain text.

1. **Meeting summary** — date, format, quorum requirement, and the decisions this meeting must make.
2. **Decisions requested** — table: Decision | Why the board decides | Options | Recommendation | Resolution reference | Time.
3. **Conflict check** — table: Board member | Interest disclosed | Related agenda item | Required action (recusal, disclosure only, none) | Eligible voters remaining. Write "No conflicts identified" only after checking every decision against every disclosure.
4. **Agenda** — table: Time | Item | Purpose (decide, discuss, note) | Lead | Paper. Consent agenda items listed together with the note that any member may remove an item.
5. **Board dashboard** — table: Measure | Definition and formula | Source | Period | Result | Target | Trend. Label Supplied, Calculated or Assumed.
6. **Pre-read standards** — what each paper must contain and the packet deadline.
7. **Draft resolutions** — one per decision, in plain language.
8. **Annual board calendar** — table: Month or meeting | Governance item | Committee or owner | Paper needed.
9. **Minutes template** — attendance, quorum, actions, votes, recusals, follow-ups; actions, not discussion transcripts.
10. **Follow-up tracker** — table: Action | Owner | Due | Status | Source meeting.
11. **Questions for counsel** — every legal question raised, stated as a question, with who will ask counsel and by when.

## Quality checks

- Every decision has options, a recommendation and a draft resolution.
- Every decision was checked against every member's disclosures; recusals are planned and quorum still holds.
- Governance items due this meeting under the annual calendar are on the agenda or explicitly deferred with a reason.
- Every dashboard measure has a definition and formula, and the arithmetic has been rechecked.
- Participant data is aggregated with small groups suppressed at the threshold the organization sets (state it; if none is set, show an assumed default and ask).
- Mission measures describe what was measured, never treatment effects.
- No legal conclusion is stated as fact; legal questions are listed for counsel.
- Minutes template records actions, votes and recusals, not discussion.

## Boundaries

- This skill organizes governance work. Bylaws interpretation, state nonprofit law, employment decisions, compensation approval procedures, data incidents, filings and litigation go to counsel; audit and tax matters go to the auditor and accountant.
- The board, not the agent, makes decisions. Recommendations come from the executive director or committee that owns the item.
- Student, health or participant-level data does not go in board papers; flag where FERPA or HIPAA may apply and that counsel decides applicability.
- Executive session content and personnel matters stay out of general minutes and packets.
- Crisis or safety incidents involving participants are handled under the organization's incident procedures; the board receives an aggregate, de-identified summary, and any content touching suicide or self-harm follows safe messaging practice and uses the organization's approved crisis resource copy.
- The agent does not certify that a meeting, vote or filing complies with the law; it lists what counsel or the accountant should confirm.

## After the meeting

- Circulate draft action-style minutes within the period the board agreed, marked draft until approved.
- Update the follow-up tracker the same week and send each owner their actions.
- File signed resolutions and the approved minutes in the organization's permanent records.
- Record any change to the annual calendar and the dashboard definitions so the next packet starts from them.
