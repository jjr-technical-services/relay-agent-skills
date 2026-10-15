# Evidence mapping and answer standards

## Evidence hierarchy

Not all evidence proves the same thing. Rank what you have and use the strongest item that fits the question.

| Rank | Evidence type | What it proves | What it does not prove |
|---|---|---|---|
| 1 | Independent attestation of operation (SOC 2 Type II control test without exception, ISO 27001 certificate within scope) | The control operated over a period, as tested by an independent auditor | Anything outside the report's system description, period, or certificate scope |
| 2 | Independent point-in-time test (penetration test, SOC 2 Type I) | Design or state at a date | Continued operation since that date |
| 3 | Operating records (access review sign-offs, backup restore test logs, training completion reports, change tickets) | The control happened on the recorded dates | That it happens every time or across all systems |
| 4 | System configuration (identity provider settings, encryption settings, infrastructure code) | Current technical state | History, or systems not shown |
| 5 | Approved policy or standard | Management intent and requirement | That anyone follows it |
| 6 | Verbal statement from an engineer or manager | A lead to find real evidence | Nothing a customer's auditor would accept |

Rank 6 alone never supports Yes. Use it to find rank 1–4 evidence, or record the row as Evidence needed.

## Mapping procedure

For each question:

1. Identify the control and scope (see answer-library.md).
2. List candidate evidence, strongest first.
3. Check dates: is the SOC 2 period, pen-test date, or policy review within what the company considers current? If the customer states a recency requirement ("within the last 12 months"), apply it literally.
4. Check scope: does the evidence cover the product and environment in scope for this customer?
5. Record the reference precisely enough that a reviewer can find it in under a minute: "SOC 2 Type II, section 4, control CC6.1 test" or "Backup restore test log, most recent entry dated [date]". (CC6.1 is an example of the Trust Services Criteria numbering used in SOC 2 reports; use whatever references the company's actual report contains.)
6. Choose the answer from the semantics table in SKILL.md.

## Writing the explanation

Structure: **control → scope → frequency or mechanism → evidence pointer.**

- "Customer data is encrypted at rest using the cloud provider's managed encryption service for databases and object storage in the production environment. Encryption keys are managed in the provider's key management service with access limited to the infrastructure team. See SOC 2 report, encryption controls."
- Name protocols and algorithms only if the configuration evidence shows them. Do not write "AES-256" because it is common; write it because the configuration says so.
- Use present tense for controls that operate now. Use "is scheduled" or "is planned" only with an owner-confirmed date.
- Avoid absolute words ("always", "never", "all", "every", "fully", "guarantee") unless the evidence supports the absolute. Absolutes are where most overstatements hide.
- Avoid adjectives that cannot be verified: robust, comprehensive, state-of-the-art, military-grade, bank-level, best-in-class, industry-leading.
- Do not volunteer information the question did not ask for. Extra claims become extra obligations.

## Compensating controls

A compensating control is a different control that reduces the same risk when the asked-for control is absent or impractical. Treat it honestly:

1. Answer the question as asked (No or Partial).
2. Name the compensating control and its evidence.
3. State which part of the risk it addresses and which part remains.
4. Add the residual gap to the gap list.

Illustrative: the question asks for a web application firewall in front of all public endpoints; there is none. The company runs rate limiting and automated abuse detection at the load balancer, plus quarterly dependency scanning and an annual independent penetration test. Answer: No. Explanation names the alternative controls and says plainly that they do not provide signature-based request filtering. The security owner decides whether to accept that risk or add the control.

Do not present a compensating control as equivalent unless a qualified reviewer has assessed it as equivalent for the customer's stated risk.

## Common overstatement patterns and corrections

| Overstated answer | Why it is wrong | Accurate version |
|---|---|---|
| "We are SOC 2 compliant." | SOC 2 is an attestation report, not a compliance status | "We have a SOC 2 Type II report covering [system] for [period]." |
| "We are GDPR certified." | There is no general certification of that kind | Describe the data processing agreement, data location, and privacy controls actually in place |
| "All data is encrypted." | Usually true only for specific stores and in transit | Name which data stores and connections, per configuration evidence |
| "We perform regular penetration testing." | "Regular" hides the frequency | "An independent penetration test of [scope] was performed on [date]." |
| "Access is reviewed regularly." | Frequency and scope unstated | "Access to production is reviewed [frequency] by system owners; records retained." |
| "We follow NIST." | Alignment is not certification or audit | "Our security program references [framework] for [purpose]; it has not been independently assessed against it." |
| N/A for background checks | Usually applicable to workforce | Answer truthfully; note where local law restricts checks |

## When evidence conflicts

If a policy says quarterly access reviews and the records show two reviews last year, the records win. Answer from actual operation, add the discrepancy to the gap list, and tell the security owner. Never answer from the policy when the records contradict it.
