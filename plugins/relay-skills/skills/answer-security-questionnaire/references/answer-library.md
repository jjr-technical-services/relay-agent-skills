# Answer library: structure, control areas, and upkeep

The answer library is the company's single source of approved questionnaire wording. Without one, each salesperson or engineer rewrites answers from memory, the same control is described three different ways across customers, and one of those descriptions is eventually wrong. With one, a long questionnaire becomes mostly a mapping exercise, and review effort goes only to new or changed answers.

## Control-area taxonomy

Key every library entry and every incoming question to one control area. Questionnaire frameworks (SIG, CAIQ, and custom forms) all cover roughly the same ground under different names; a stable internal taxonomy lets one approved answer serve all of them. Adapt names to the company's own policy set if it already has one.

| Code | Control area | Typical questions |
|---|---|---|
| GOV | Governance and policy | Security program owner, policy set, policy review frequency, management approval |
| RISK | Risk management | Risk assessment frequency, risk register, risk acceptance process |
| ASSET | Asset and data inventory | Asset inventory, data classification, data flow documentation |
| HR | People security | Background checks (where lawful), confidentiality agreements, security awareness training, disciplinary process |
| IAM | Identity and access management | Single sign-on, multi-factor authentication, least privilege, privileged access, access reviews, joiner-mover-leaver process, authentication factor rules |
| CRYPTO | Encryption and key management | Encryption in transit and at rest, algorithms and protocol versions, encryption key storage and rotation, who can access keys |
| OPS | Operations security | Logging and monitoring, alerting, malware protection, configuration hardening, capacity |
| VULN | Vulnerability management | Scanning frequency, patch time frames by severity, penetration testing cadence and scope |
| SDLC | Secure development | Code review, change approval, separation of environments, dependency scanning, use of production data in testing |
| NET | Network security | Segmentation, firewalls and security groups, remote access, intrusion detection |
| BCDR | Business continuity and disaster recovery | Backups, backup testing, recovery point objective (RPO, the maximum acceptable data loss measured in time), recovery time objective (RTO, the maximum acceptable downtime), plan testing |
| IR | Incident response | Plan, roles, testing, customer notification process and time frame |
| TPRM | Third parties and subprocessors | Subprocessor list, vendor due diligence, contractual flow-down |
| PRIV | Privacy and data handling | Data processing agreement, data location, retention, deletion on termination, secondary use of customer data |
| PHYS | Physical security | Office controls; data center controls usually inherited from the hosting provider |
| COMP | Compliance and assurance | SOC 2 reports, ISO certificates, other attestations, audit rights |
| AI | Use of AI systems | Whether customer data is sent to AI providers, whether it trains models, controls on AI outputs |

Questions that span two areas get the primary area of the control being asked about. "Are backups encrypted?" is CRYPTO if the question is about encryption and BCDR if it is about backup existence; answer both parts.

## Library entry schema

Keep the library in a spreadsheet or knowledge base with these fields.

| Field | Content |
|---|---|
| Entry ID | Stable ID, for example IAM-004 |
| Control area | Code from the taxonomy |
| Canonical question | The control, stated neutrally ("MFA enforced for workforce access to production") |
| Standard answer | Yes, Partial, No, or N/A for the canonical scope |
| Scope statement | Exactly which systems, environments, and people the answer covers |
| Approved wording | One to three factual sentences |
| Long-form wording | Optional paragraph for "describe" questions |
| Evidence reference | Document name, section, version or date; SOC 2 control reference |
| Sharing condition | Public, NDA only, summary only |
| Owner | Role accountable for the control |
| Approved by and date | Named approver and date |
| Next review date | Commonly set to the policy review cycle or the next SOC 2 period, whichever is sooner |
| Dependencies | Other entries this answer relies on |
| Change log | What changed and why |

## Matching incoming questions to entries

1. Strip the customer's wording down to the control and the scope.
2. Find the entry for that control.
3. Compare scope. If the question's scope is wider than the entry's scope statement, the answer may drop from Yes to Partial.
4. Compare frequency. If the question asks "at least quarterly" and the entry says "annually", the answer is No or Partial for the frequency asked.
5. Reuse the approved wording, trimming to what the question asks. Do not add claims the entry does not contain.
6. If no entry exists, draft a new one, mark it Needs review, and add it to the sign-off queue.

## Keeping the library current

- Re-review every entry when its evidence changes: new SOC 2 period, new pen test, policy revision, architecture change, new subprocessor.
- Re-review all entries in a control area when an incident touches that area.
- Retire entries whose evidence has lapsed rather than letting them be reused.
- Track which customers received which version of an answer; if an answer later proves wrong, the company may need to correct it with those customers. Legal decides whether and how.
- Watch for drift: if drafters keep editing the same entry's wording for different customers, the canonical wording is probably unclear.
