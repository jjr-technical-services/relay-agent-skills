# Review routing, gap handling, and the hand-back

## Who must review what

Route every row that meets one of these conditions. The drafter never approves their own new or changed answer.

| Condition | Reviewer role | Why |
|---|---|---|
| New answer with no library entry | Security owner | No prior approval exists |
| Changed answer (different from library) | Security owner | Consistency across customers |
| Any Partial or No | Security owner | Owner must know and may choose to act |
| Any answer resting on Rank 5 or 6 evidence only | Security owner | Operation is unproven |
| Time frame or number (notification hours, patch days, RPO or RTO values, retention periods) | Security owner and legal | May be read as a contractual commitment |
| Audit rights, right to test, on-site assessment | Legal | Contract term |
| Liability, indemnity, insurance limits | Legal and finance | Contract term |
| Data location, residency, cross-border transfer, secondary use of data | Privacy owner and legal | Regulatory obligations |
| Regulated data (health, payment card, government) | Relevant compliance owner | Sector rules |
| Any statement about a named subprocessor | Security owner, and legal if contractual | Accuracy of third-party claims |

Write each review request as a specific question, not "please review". Example: "Q 7.3 asks whether we notify customers of incidents within 24 hours. Our incident response plan says 72 hours from confirmation. Proposed answer: No, with the plan's time frame stated. Approve, or tell me the approved commitment."

## Building the gap list

A gap is anything the company cannot currently answer Yes to, plus anything answered Yes on weak or stale evidence. For each gap record:

- **What is missing**: the control, the scope, or the evidence.
- **Customer impact if unchanged**: stated factually (for example, "customer's questionnaire marks this as a required control"), not guessed. If the customer did not say, write "Unknown".
- **Honest interim answer**: exactly what the questionnaire says today.
- **Compensating control**: only if it exists and is evidenced.
- **Owner and target date**: set by the owner. The drafter never invents a remediation date.

Sort the gap list by: questions the customer flagged as required or knockout first, then contract-term gaps, then control gaps, then evidence gaps.

Distinguish three kinds of gap, because they need different fixes:

1. **Control gap**: the control does not exist. Needs a decision to build it or accept the risk.
2. **Scope gap**: the control exists but not everywhere asked. Needs extension or a scope statement.
3. **Evidence gap**: the control probably operates but cannot be shown. Needs records, not new controls. These are often the cheapest to close.

## Handling customer follow-up

- If the customer challenges a Partial or No, answer with the same facts and, if the owner agrees, the remediation plan. Do not upgrade the answer under pressure.
- If the customer asks for a document the company shares only under NDA, confirm an NDA is in place before sending.
- If the customer asks for a call with the security team, prepare a one-page brief of the open gaps and the approved positions so the call does not produce new unreviewed commitments.
- If the customer's contract later incorporates the questionnaire, legal should check the final answers against the contract language.

## Hand-back checklist

- Completed questionnaire in the customer's format, answer options matching their allowed values exactly.
- Every row has an answer; no blanks unless the customer's instructions allow them.
- Attachment list with version dates and sharing conditions.
- Sign-off record: who approved which rows and when.
- Gap list delivered internally to the security owner, not to the customer.
- Library updated with approved new or changed entries.
- Copy of the submitted version retained with the date submitted and the customer name, so later corrections are possible.
