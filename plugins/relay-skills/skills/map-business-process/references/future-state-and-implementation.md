# Future-state design, RACI, controls, and implementation

## Design principles, in order

Apply these in sequence. Automating a step you could have removed locks in waste.

1. **Eliminate.** Remove steps that fail the value-added test and are not required controls. Remove duplicate checks and reports nobody uses.
2. **Combine.** Merge steps done by different people in sequence when one person could do both, which removes a handoff and its wait.
3. **Move checks to the source.** Catch errors where they are made (required fields, validation at intake, checklists before handoff) rather than at a downstream inspection.
4. **Reduce handoffs and approvals.** Set approval thresholds by risk, delegate low-risk decisions to the doer, and use parallel rather than serial approvals where both are needed.
5. **Separate the standard path from exceptions.** Design a fast lane for the common case and route exceptions to a specialist, rather than slowing every item for the rare case.
6. **Limit work in progress.** From Little's Law, average cycle time = average WIP ÷ throughput. If throughput is fixed, reducing WIP reduces cycle time. Replace large weekly batches with smaller, more frequent ones where the batch causes the wait.
7. **Balance to the constraint.** Identify the step with the least capacity relative to demand (the bottleneck). Improvements elsewhere do not raise output; protect and relieve the bottleneck first.
8. **Automate what remains.** Automate stable, rule-based, high-volume steps. Keep human judgment where rules do not cover the cases.

## RACI

RACI assigns, for each step or decision:

- **Responsible**: does the work. Can be more than one person.
- **Accountable**: owns the outcome and signs off. Exactly one per step.
- **Consulted**: gives input before the work is done (two-way).
- **Informed**: told after the fact (one-way).

Checks on the finished matrix:

- Every row has exactly one Accountable.
- A row with many Consulted entries is a likely source of delay; reduce or change to Informed.
- A person who is Accountable for many unrelated steps is a likely bottleneck.
- A row with no Responsible is work nobody will do.
- Accountability sits at the lowest level with the authority and information to decide.

## Controls

Processes that touch money, customer data, or regulated activity carry risks that controls manage. For each risk, specify:

| Field | Content |
|---|---|
| Risk | What could go wrong (for example, paying a fictitious supplier) |
| Control | The action that prevents or detects it (for example, supplier bank-detail changes verified by call-back to a known number) |
| Type | Preventive (stops the error before it happens) or detective (finds it afterward) |
| Automated or manual | Automated controls are more consistent; manual controls need evidence of performance |
| Performer | Role, independent of the person whose work is controlled where segregation of duties matters |
| Frequency | Per item, daily, monthly |
| Evidence | The record that proves the control happened |

Prefer preventive controls at the source. Keep segregation of duties (the same person should not both create and approve a payment, for example) even when combining steps elsewhere. Any change to a control that auditors test needs the control owner's approval and usually internal audit's awareness.

## Implementation plan

- **Sequence** changes by dependency and risk: quick, low-risk, reversible changes first (a required field, a clearer template), then policy changes (approval thresholds), then system changes.
- **Pilot** high-risk changes on a subset (one team, one supplier group, one region) with a defined end date and comparison against the baseline.
- **Communicate** with each lane: what changes for them, when, and why.
- **Train** on the new standard path and the exception route.
- **Update documentation** once the pilot confirms the design; hand to sop-writer for the working procedure.

## Measuring the change

- Keep the same start and end definitions as the baseline.
- Track cycle time as a distribution (median and a high percentile such as the 85th or 90th), not only the average, because customers feel the long tail.
- Track FPY for changed steps, flow efficiency, and handoff count.
- Add a guardrail metric that should not get worse (error rate, control exceptions, customer complaints).
- Compare before and after over similar periods and volumes; note seasonal effects and other changes that happened at the same time.
- Set a review date (commonly 30 and 90 days after go-live) and name who decides whether to keep, adjust, or roll back.
- Targets come from the process owner. The analysis can show the size of the opportunity (for example, total wait time at a step) but must not present a target as a forecast.
