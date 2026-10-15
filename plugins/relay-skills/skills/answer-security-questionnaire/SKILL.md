---
name: answer-security-questionnaire
description: Answer a customer's vendor security questionnaire (SIG, CAIQ, or a custom spreadsheet) from the company's own evidence. Builds and maintains an answer library keyed to control areas, maps each question to policies, SOC 2 report sections, penetration test summaries, and architecture documents, answers Yes, No, Partial, or N/A with a short factual explanation, handles compensating controls honestly, routes answers that need security or legal sign-off, and hands back a gap list for the security owner. Use when a prospect or customer sends a security questionnaire, vendor risk assessment, third-party risk review, or due-diligence form, or needs consistent SIG or CAIQ answers. Do not use for drafting a full RFP response (rfp-response-drafter), writing security policies from scratch, running a security audit or threat model, or negotiating contract terms.
---

# Answer Security Questionnaire

A vendor security questionnaire is a formal written statement about how the company protects customer data. Customers file the answers, auditors sample them, and contract language often incorporates them. The job is to answer every question accurately from evidence the company already has, reuse approved wording so answers stay consistent across customers, and surface every gap to the person who owns security instead of hiding it in soft language. A fast answer that overstates a control is worse than a slow honest one: it creates contractual exposure and destroys trust when the customer's auditor asks for proof.

## Inputs to gather

Ask for these. When one is missing, proceed with a flagged placeholder and list it in the open-items section.

- **The questionnaire itself**: format (SIG Lite or Core, CAIQ, custom spreadsheet, portal), number of questions, due date, and any instructions about answer options or required attachments.
- **Scope of the request**: which product, environment, and data types the customer will use. A question about "your systems" should be read against that scope, not the whole company.
- **Evidence set**: current security policies, SOC 2 report (Type I or Type II, period covered, exceptions noted, subservice organizations and whether they are carved out), ISO 27001 certificate and Statement of Applicability if any, most recent penetration test summary or attestation letter (date, scope, tester, remediation status), architecture and data-flow documents, business continuity and incident response plans, subprocessor list, data processing agreement, insurance certificate.
- **Existing answer library**: prior approved answers with owner and last-reviewed date.
- **Owners**: who signs off on security answers, who signs off on legal or contractual statements, and who owns privacy.
- **Deal context**: what the customer is buying and how much weight security carries in their decision. This changes how much explanation to write, never what is true.

If there is no evidence set at all, stop drafting substantive answers. Produce the question-to-evidence map with every row marked "Evidence needed" and hand it to the security owner.

## Workflow

1. **Triage the questionnaire.** Count questions by control area. Identify questions that are out of scope (for example, physical data center controls when all hosting is with a cloud provider) and questions that are really contract terms (breach notification hours, audit rights, liability, insurance limits). Flag the contract-term questions for legal immediately; they take longest.
2. **Map every question to a control area.** Use the taxonomy in `references/answer-library.md` so the same underlying control always gets the same answer, whatever wording the customer used.
3. **Pull from the answer library first.** For each question, look for an approved answer to the same control. Check its last-reviewed date and whether the underlying evidence has changed since. Reuse the wording, adjusting only to answer the exact question asked.
4. **Map each question to evidence.** Name the specific document and section, SOC 2 control reference, or pen-test finding that supports the answer. A question with no supporting evidence cannot be answered Yes. Read `references/evidence-and-answer-standards.md` when choosing between Yes, Partial, No, and N/A, or when writing the explanation.
5. **Answer the question that was asked.** Match the scope words in the question ("all", "every", "production", "at rest", "annually"). If the control covers production but not internal tools and the question says "all systems", the honest answer is Partial with the boundary stated.
6. **Handle compensating controls honestly.** When the exact control is absent but a different control addresses the same risk, answer No or Partial, then describe the alternative control and what risk it does and does not cover. Never answer Yes because a compensating control exists.
7. **Write short factual explanations.** One to three sentences: what the control is, its scope, how often it operates, and where the evidence sits. No adjectives such as "robust", "industry-leading", or "bank-grade".
8. **Record confidence and review needs for each row.** Mark any new answer, any changed answer, any answer that commits to a time frame or contractual obligation, and any Partial or No for review. Read `references/review-and-gap-handling.md` for the routing rules.
9. **Build the gap list.** Every No, every Partial, every "Evidence needed", and every answer resting on an expired or stale document becomes a gap row for the security owner, with the honest interim answer.
10. **Update the library.** Once reviewers approve, add or update library entries with owner, evidence reference, approval date, and next review date. Retire entries whose evidence has lapsed.
11. **Prepare the hand-back.** Assemble the completed questionnaire, the attachment list (with what may be shared only under NDA), the sign-off queue, and the gap list.

## Answer semantics

Use these definitions consistently. They are stricter than many teams use in practice; that is deliberate.

| Answer | Use only when |
|---|---|
| Yes | The control exists, is operating now, covers the full scope the question names, and there is evidence a customer's auditor could inspect. |
| Partial | The control exists but covers only part of the scope, operates less often than asked, or is designed but not yet operating. State the boundary. |
| No | The control does not exist for the asked scope. Add a compensating control or plan only if it is real and owned. |
| N/A | The question does not apply to the service or data in scope. State why in one sentence. Never use N/A to avoid an uncomfortable No. |

A roadmap item is not a Yes. "We plan to implement this by Q3" belongs only in an explanation for a No or Partial, and only when the owner has committed to the date in writing.

## Reading the evidence correctly

Most overstatement comes from misreading the evidence, not from intent. Check these points before relying on a document.

- **SOC 2 Type I vs Type II.** A Type I report says controls were suitably designed at a point in time. A Type II report says they operated effectively over a period (the review period). Only a Type II supports "operates" language, and only for its period and its system description.
- **Exceptions.** A Type II report lists test exceptions. A control with an exception is not a clean Yes for the review period; answer accurately and state remediation if the owner confirms it.
- **Carve-outs and complementary controls.** When a subservice organization such as a hosting provider is carved out, its controls are not covered by the company's report. Point to that provider's own report for physical and infrastructure controls. Complementary user entity controls are things the customer must do; mention them where the question depends on them.
- **Bridge letters.** If the report period ended months ago, the customer may ask for a bridge letter (a management statement that nothing material changed since the period end). It is a statement by company management (usually coordinated by the security owner); the drafter never writes or promises one.
- **Penetration test summaries.** Note the test date, scope (which applications and environments), whether the tester was independent, and the remediation status of high and critical findings. A test of the marketing site does not support an answer about the product.
- **Policies.** A policy proves intent, not operation. "We have an access control policy" answers a policy question; it does not prove quarterly access reviews happen. Look for the review records or the SOC 2 control test.

## Worked example (illustrative)

Hypothetical facts: the company has a SOC 2 Type II report for its production platform; multi-factor authentication is enforced through single sign-on for all workforce access to production and to the corporate identity provider, but two legacy internal tools still use local sign-in without a second factor.

Question: "Is multi-factor authentication enforced for all employee access to all systems?"

- Weak answer: "Yes. We enforce MFA across our environment." This overstates scope.
- Correct answer: **Partial.** "Multi-factor authentication is enforced through single sign-on for all workforce access to the production platform and the corporate identity provider (SOC 2 report, logical access controls section). Two internal tools that hold no customer data use local sign-in without a second factor; they are scheduled for migration to single sign-on by the date the security owner has set." The gap list records the two tools, and the date comes from the owner, not the drafter.

## Question types that need extra care

- **Time-bound commitments** ("notify within 24 hours", "patch critical issues within 7 days"): answer with the time frame in the company's own incident response or vulnerability management policy, and send to legal because the answer may be read as a contractual promise.
- **Certifications and frameworks** ("Are you ISO 27001 certified?", "Do you comply with NIST CSF?"): answer only what a certificate or report shows, with its scope. Alignment with a framework is not certification.
- **Data location and residency**: answer from the architecture documents and subprocessor list, including backups and support access from other countries.
- **Customer data used for other purposes** (analytics, model training, product improvement): answer from the data processing agreement and actual system behavior; route to privacy.
- **Free-text "describe your approach" questions**: use library wording, keep to what the evidence supports, and resist the urge to write a sales paragraph.

## Output

Deliver these sections in order.

1. **Summary**: questionnaire name, scope assumed, number of questions, counts by answer (Yes, Partial, No, N/A, Evidence needed), number awaiting sign-off, due date.
2. **Answer table**

| Q ID | Question (short form) | Control area | Answer | Response text | Evidence reference | Library entry | Confidence | Reviewer | Status |
|---|---|---|---|---|---|---|---|---|---|

   Confidence is High (library answer, current evidence), Medium (new wording, evidence found), or Low (inferred, evidence unclear). Status is Draft, Needs review, Approved.

3. **Sign-off queue**

| Q IDs | Why review is needed | Reviewer role | Question for reviewer | Deadline |
|---|---|---|---|---|

4. **Gap list for the security owner**

| Gap ID | Q IDs | Control area | What is missing | Customer impact if unchanged | Honest interim answer | Compensating control (if real) | Owner | Target date (owner-set) |
|---|---|---|---|---|---|---|---|---|

5. **Attachments and sharing conditions**: document, version or date, whether it may be shared openly, under NDA only, or via summary only.
6. **Library changes**: new or revised entries with evidence reference and next review date.
7. **Assumptions and open items**: every assumption about scope or evidence, labeled.

## Quality checks

Run these before handing back.

- Every Yes names specific evidence, and that evidence is current (check dates on the SOC 2 period, pen-test date, policy review date).
- No answer is Yes because of a compensating control, a plan, or a verbal assurance.
- Scope words in each question ("all", "every", "annually", "production") match the scope of the evidence.
- The same control has the same answer everywhere in this questionnaire and in the library.
- N/A answers each carry a reason.
- No certification, attestation, framework alignment, or practice is claimed that the evidence set does not show. "SOC 2 compliant" is not a claim a company can make; say "has a SOC 2 Type II report covering [period] for [system]".
- Any statement with a number of hours, days, or a contractual obligation is in the sign-off queue for legal.
- Carved-out subservice organizations and complementary user entity controls from the SOC 2 report are reflected where relevant.
- Explanations contain no marketing adjectives and no promises beyond the evidence.
- Every No, Partial, and missing-evidence row appears in the gap list.

## Boundaries

- This skill drafts answers. The security owner approves security content and legal approves anything contractual. Do not mark any row Approved without a named approver.
- It does not decide whether to accept a customer's contract terms, insurance requirements, audit rights, or liability language; route those to legal and to negotiate-tactically if a negotiation follows.
- It does not assess whether the company's security is adequate or run a threat model or audit. It reports what the evidence shows.
- Do not share full penetration test reports, full SOC 2 reports, or architecture diagrams outside the terms the owner sets (often NDA only).
- Where a question concerns regulated data (health, payment card, government), note that specific regulatory obligations apply and recommend the relevant compliance owner review.
- For a full proposal where security is one section, use rfp-response-drafter for the proposal and this skill for the security section.
