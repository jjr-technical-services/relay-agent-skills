---
name: design-program-evaluation
description: >-
  Design a proportionate evaluation plan for a nonprofit or mission-driven program: process and outcome evaluation questions, design choices and what each can support (pre/post, retrospective pre-post, comparison group, qualitative), indicators and instruments, sampling and response plans, consent and assent for minors, data privacy and small-cell suppression, analysis plan, limitations, and a reporting timeline sized to a small team. Non-clinical. Use when asked to plan an evaluation, measure program impact or outcomes for a funder, choose between pre-post and comparison designs, or plan measurement for a youth or family program. Do not use for drafting survey questions only (survey-designer prompt), a logic model (build-logic-model), or analyzing collected data (analyze-survey-results).
license: MIT
---

# Design Program Evaluation

Produce an evaluation plan that answers the questions the organization and its funders actually need answered, with a design whose claims match its strength, measures the team can collect, protections for participants, and a workload a small team can sustain. The plan says in advance what the results will and will not be able to show, so no one is surprised when the report is written.

Evaluation here means systematic collection of information about a program's delivery and results to improve it and to account for it. It is not clinical assessment of participants, and it is not research intended to produce generalizable knowledge unless the organization decides to pursue that, in which case ethics review questions arise (see Boundaries).

## Inputs to gather

Ask for or retrieve these; when missing, proceed with a labeled placeholder ("Assumed:" or "To confirm:").

- **The program and its logic model.** If no logic model exists, build a short one first or hand off to `build-logic-model`. Evaluation questions come from its links and outcomes.
- **Who needs the results and for what decision:** program improvement, funder report, board, renewal, or partner negotiation. Get the funder's own reporting requirements from their materials; never assume them.
- **Participants:** ages (flag anyone under 18), numbers per site and per cycle, how they are recruited, languages, access needs.
- **Delivery setting:** schools, colleges, community sites, online; which partner controls access and data.
- **Existing data:** attendance, forms, prior surveys, partner data, and what agreements govern them.
- **Capacity:** staff hours available for evaluation, survey and data tools already in use, analysis skills, budget for any external help.
- **Timeline:** program cycle dates, report due dates, and any fixed partner calendars (exam periods, school breaks).

## Workflow

1. **Write the evaluation questions.** Separate process questions (Was the program delivered as planned? Who was reached and who was missed? What helped or hindered delivery? How did participants experience it?) from outcome questions (Did participants' knowledge, confidence, intentions, or reported actions change?). Limit to three to six questions in total; each must feed a named decision.
2. **Check proportionality.** Match effort to the program's size, risk, and the decision at stake. Estimate staff hours per cycle for collection, cleaning, analysis, and reporting. If the plan costs more than the team can give, cut questions before cutting quality. Read `references/designs-and-proportionality.md`.
3. **Choose the design and state what it can support.** Options, from lighter to stronger for outcome claims: post-only, retrospective pre-post, pre/post on the same participants, pre/post with a comparison group, randomized designs. Qualitative methods (interviews, focus groups, open-ended items, observation) answer how and why. For each chosen design, write what it can and cannot support. Most small programs can support "participants reported change" and a contribution case, not "the program caused the change".
4. **Choose indicators and instruments.** One or two indicators per outcome question. Prefer existing validated instruments where one fits the construct, age group, and language, and name an instrument only when certain of its name and that it measures that construct. Never state reliability, validity, or norms unless the organization supplies them from the instrument's documentation. Check license and scoring terms. Do not use clinical screening or diagnostic instruments as program outcome measures (see step 6). Read `references/measurement-and-instruments.md`.
5. **Plan sampling and response.** Decide census (everyone) or sample, the timing of each wave, how pre and post responses will be linked (a participant-created code, not names), expected response rates as assumptions to replace with the team's own history, and follow-up steps to raise response. Plan to report the response rate beside every result.
6. **Protect participants.** For minors, plan parental or guardian permission and the young person's own assent, following the partner institution's rules. Participation must be voluntary, with a clear way to skip questions or stop. Avoid instruments that ask about self-harm or suicidal thoughts: a program that is not a clinical service cannot respond appropriately to a positive answer, and asking creates a duty to act. If a partner insists, require a clinical partner and a written response protocol before collection. Include the organization-approved crisis resource on any survey or session material that touches these topics. Read `references/consent-privacy-and-ethics.md`.
7. **Plan privacy and small-cell suppression.** Collect the minimum identifying data. Set a suppression threshold (report no cell with fewer than N respondents; N is the organization's choice, and a value such as 10 is a common default that must be labeled as an assumption until confirmed). Plan complementary suppression so hidden cells cannot be recovered from totals. Flag whether FERPA, HIPAA, or PPRA questions may arise and leave applicability to counsel.
8. **Write the analysis plan.** For each question: the data, the comparison, the summary (distributions, top-2-box share, matched-pair change), subgroup breakdowns allowed by the threshold, and how open-ended responses will be coded. Hand the actual analysis to `analyze-survey-results` when data arrives.
9. **State limitations in advance.** Name the threats the design leaves open (maturation, outside events, who chose to respond, attrition between waves, practice effects from repeated surveys, social desirability) and how the report will phrase results given them.
10. **Build the reporting plan and timeline.** Who gets what, when, in what form, and who approves before release. Include a data return to participants or partners where appropriate.

## Design selection guide

| Situation | Recommended design | Why |
|---|---|---|
| One-time session or webinar | Post-only or retrospective pre-post on 3 to 5 items, plus delivery data | Follow-up is rarely proportionate; a retrospective item captures self-perceived change in one contact |
| Multi-session cohort, participants reachable at start and end | Matched pre/post on short-term outcomes, plus a few interviews | Shows change among completers; interviews explain it |
| Concept that participants cannot judge well until they learn it | Retrospective pre-post | Reduces response-shift bias |
| Waitlist or later cohort exists | Pre/post with the waitlist as a comparison group | Stronger evidence at little extra cost |
| Funder requires causal evidence and budget allows | Comparison or randomized design with an external evaluator | Needs sample size, design expertise, and independence |
| Very small groups (fewer respondents than the suppression threshold) | Report combined across sites or cycles; favor qualitative feedback | Subgroup numbers cannot be reported safely or read reliably |

## Evaluation question patterns

Process:

- "To what extent was the program delivered as designed at each site, and what got in the way?"
- "Who enrolled and completed, and who did we intend to reach but did not?"
- "How did participants and partner staff experience the sessions?"

Outcome (phrase as measured, non-clinical constructs):

- "Did participants' self-reported confidence in finding support increase from start to end?"
- "Did participants' knowledge of named resources increase?"
- "Three months later, what share of respondents report having used a skill or resource from the program?"

Avoid questions the design cannot answer ("Did the program reduce distress on campus?"), and avoid questions nobody will act on.

## Common traps

- **A clinical screener proposed as the outcome measure.** Replace it with a non-clinical measure of the construct the program targets, explain why in one or two sentences, and note that any screening belongs with a clinical partner under their protocol.
- **Reporting each site separately when a site is small.** Apply the suppression threshold; fold small sites into the combined total and say so.
- **"Demonstrate impact" read as "prove causation".** Clarify with the funder, then state the claims the chosen design can and cannot support.
- **Plans bigger than the team.** Run the Proportionality check before presenting the plan.
- **Pre and post that cannot be linked.** Decide the linking method before the first survey goes out.

## Routing

- Read `references/designs-and-proportionality.md` when choosing a design, when a funder asks to "prove impact", or when the team is small.
- Read `references/measurement-and-instruments.md` when choosing instruments, writing items, or planning pre/post linking.
- Read `references/consent-privacy-and-ethics.md` whenever participants include minors, students, or people discussing mental health, and before any data sharing with partners.
- Hand off question wording to the survey-designer prompt once the plan is approved, and data analysis to `analyze-survey-results`.

## Output

### Output contract

Use these section headings verbatim, as Markdown headings, in this order:

1. Purpose and users
2. Evaluation questions
3. Design and what it can support
4. Measurement plan
5. Sampling and response plan
6. Consent and assent
7. Privacy and suppression
8. Analysis plan
9. Limitations
10. Reporting plan and timeline
11. Proportionality check

Use these exact labels where they apply: process, outcome, Claims this design can support, Claims this design cannot support, Suppression threshold:, Assumed:, confirmed, assumed.

Write amounts in full units with thousands separators (185,000, not 185 or 185k), and percentages with a % sign.

Do not rename, merge or skip a heading; if a section has nothing to report, keep the heading and say so in one line. Do not put square brackets or curly braces in headings or labels.

### Section contents

Do not use Markdown checkboxes; use plain lists and tables.

1. **Purpose and users** - who will use the results for which decision.
2. **Evaluation questions** - table: `No. | Question | Type (process or outcome) | Decision it informs`.
3. **Design and what it can support** - the chosen design in two or three sentences, then two lists titled exactly "Claims this design can support" and "Claims this design cannot support".
4. **Measurement plan** - table: `Question | Indicator | Instrument or source | Who responds | When | Linking method`.
5. **Sampling and response plan** - census or sample, waves, response-rate assumption labeled "Assumed:", follow-up steps.
6. **Consent and assent** - who gives permission, who gives assent, how refusal and withdrawal work, partner approvals needed.
7. **Privacy and suppression** - data minimization, storage and access, "Suppression threshold:" with the value and whether it is confirmed or assumed, complementary suppression rule, legal questions for counsel.
8. **Analysis plan** - table: `Question | Analysis | Subgroups allowed | Output`.
9. **Limitations** - each threat and how results will be worded because of it.
10. **Reporting plan and timeline** - table: `Date or week | Activity | Owner | Deliverable`.
11. **Proportionality check** - estimated staff hours by activity, the total against stated capacity, and what to cut first if over.

### Illustrative proportionality math (hypothetical)

Three cycles a year, each with pre and post surveys: setup 4 hours once; distribution and reminders 2 hours per wave x 2 waves x 3 cycles = 12 hours; cleaning 2 hours per cycle x 3 = 6 hours; analysis 4 hours per cycle x 3 = 12 hours; annual report 10 hours. Total 4 + 12 + 6 + 12 + 10 = 44 hours a year. Compare with the hours the team says it can give and cut from the top of the list of lower-value questions if over.

### Illustrative claims lists (hypothetical matched pre/post, no comparison group)

Claims this design can support:

- Among the participants who completed both surveys, self-reported confidence in finding support was higher at the end than at the start.
- The program was delivered at the planned frequency at each site (from delivery logs).

Claims this design cannot support:

- That the program caused the change; time, other supports, and outside events are not ruled out.
- That results apply to participants who did not complete both surveys.
- Any change in a clinical condition.

## Quality checks

- Every evaluation question maps to a decision, a logic-model outcome or process element, and at least one indicator.
- The claims lists match the design; nothing in "can support" implies causation unless a credible comparison exists.
- No clinical screening or diagnostic instrument is used as an outcome measure, and outcomes are phrased as self-reported knowledge, confidence, intentions, or actions. Do not use clinical-change language such as "clinically significant" or "symptom reduction".
- Instruments are named only when certain; no invented psychometric figures.
- Minors have both permission and assent planned; partner and district or campus rules are checked.
- A suppression threshold is stated, labeled confirmed or assumed, and applied to every subgroup breakdown, including by site.
- Response rates and linking method are planned so pre/post claims rest on matched or clearly unmatched data.
- The Proportionality check total is within capacity or the plan says what is cut.
- Language is people-first; say "died by suicide", never "committed suicide". Crisis references use the organization-approved crisis resource verbatim; never invent a line or number.

## Boundaries

- This skill plans program evaluation. It does not assess, screen, or triage individuals, and it does not recommend treatment.
- Whether an activity is research requiring Institutional Review Board (IRB) review, and whether FERPA, HIPAA, PPRA, COPPA, or state law applies, are decisions for the organization's counsel and partner institutions.
- Funder requirements come from the funder's materials. If a funder requires a specific design or instrument, follow it and state its limits.
- For rigorous causal designs, recommend an external evaluator and say what it would take; do not present a small internal study as one.
