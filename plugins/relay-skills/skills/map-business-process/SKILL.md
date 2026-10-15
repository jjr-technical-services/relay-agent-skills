---
name: map-business-process
description: Map and improve a business process end to end. Scopes it with SIPOC (Suppliers, Inputs, Process, Outputs, Customers), draws the current-state swimlane map, measures cycle time against touch time, handoffs, rework loops, and wait states, classifies waste with the lean waste categories, finds root causes with 5 whys and a fishbone, designs the future state, assigns RACI for the redesigned steps, adds controls, and produces an implementation plan with metrics. Use when a process is slow, error-prone, full of handoffs or approvals, or nobody can say who owns a step; when asked for a process map, value stream map, swimlane, SIPOC, bottleneck analysis, or process improvement. Do not use for documenting a settled process as a procedure (sop-writer), building a metric hierarchy (kpi-tree), or post-incident analysis of a single failure (incident-postmortem).
---

# Map Business Process

Most process problems are invisible because nobody sees the whole process: each team sees its own step and experiences the rest as delay. This skill makes the whole flow visible, measures where time and quality are lost, finds the causes behind the biggest losses, and redesigns the process with clear ownership and controls. The standard is evidence over opinion: every claim about where time goes or why errors happen must trace to observed work items, timestamps, or interviews, and anything estimated is labeled as an estimate.

## Inputs to gather

- **The process and the problem**: what the process produces, who complains, and what "better" means (faster, fewer errors, lower cost, better compliance). Get one sentence on why this matters now.
- **Boundaries**: the trigger that starts it and the event that ends it. Without these, cycle time cannot be measured.
- **Volume and mix**: items per week or month, and variants (for example, standard versus exception cases).
- **Data**: system timestamps (ticket, workflow, ERP, CRM logs), a sample of recent work items, error or rework logs, and any existing documentation.
- **People**: one or two people who do each step, plus the process owner. Interviews and observation beat documentation.
- **Constraints**: regulatory or audit requirements, systems that cannot change, budget, and timing.

If timestamps are unavailable, estimate from a sample of recent items traced by hand, or from interviews, and label every figure "Estimated (interview)" or "Estimated (sample of n)". Never present an interview estimate as a measurement.

## Workflow

1. **Frame the problem and scope with SIPOC.** Write the SIPOC before drawing anything. It forces agreement on start, end, outputs, and customers. Read `references/sipoc-and-current-state.md` for how to build it.
2. **Map the current state as it actually runs.** Walk a real item through the process (follow the work, not the org chart). Draw a swimlane map with one lane per role or team, showing every handoff, decision, wait, and rework loop. Map the common path first, then the main exceptions.
3. **Measure the current state.** For each step capture touch time (hands-on work), wait time before it, the handoff in, and first-pass yield (share of items that pass without rework). Compute the summary metrics below. Use at least a small sample of real items; note sample size.
4. **Classify waste.** Tag each non-value-adding step or delay with a lean waste category. Read `references/waste-and-root-cause.md` for the categories and how they show up in office and knowledge work.
5. **Pick the top problems.** Rank by impact on the stated goal (usually the largest waits, the highest-rework steps, and the steps that fail compliance). Choose two or three; do not try to fix everything.
6. **Find root causes.** For each top problem, use a fishbone diagram to lay out candidate causes across categories, then 5 whys to trace the most likely chain, then check each proposed cause against data. A root cause must be something the organization can change and that, if removed, would stop the problem recurring.
7. **Design the future state.** Apply the design principles in `references/future-state-and-implementation.md`: remove steps before automating them, reduce handoffs, move checks to the source, set work-in-progress limits, standardize the common path and route exceptions separately. Draw the future-state map.
8. **Assign RACI to the redesigned steps.** One Accountable per step. Resolve every step with no Accountable or with several.
9. **Add controls.** For each risk the process manages (financial, compliance, data, customer), specify the control, whether it is preventive or detective, who performs it, and the evidence it leaves. Keep controls that auditors rely on; do not remove them for speed without the control owner's agreement.
10. **Plan implementation and measurement.** Sequence the changes, pilot where risk is high, define baseline and target metrics, and set a review date. Targets are proposals for the owner to set, not predictions.

## Core metrics and formulas

| Metric | Definition | Formula |
|---|---|---|
| Cycle time (end to end) | Elapsed time from the start trigger to the end event for one item | end timestamp − start timestamp |
| Touch time | Time someone is actively working the item | sum of hands-on time across steps |
| Wait time | Time the item sits idle in queues, inboxes, or approvals | cycle time − touch time |
| Flow efficiency | Share of elapsed time spent on actual work | touch time ÷ cycle time |
| First-pass yield (FPY) of a step | Share of items that complete the step without rework | items passing first time ÷ items entering |
| Rolled throughput yield (RTY) | Probability an item passes every step first time | product of each step's FPY |
| Handoff count | Number of times the item moves between people or teams | count from the swimlane map |
| Little's Law | Relationship between work in progress, throughput, and average cycle time in a stable process | average WIP = throughput × average cycle time |

Terms such as "lead time" and "cycle time" are used differently across lean, Six Sigma, and software teams. Decision rule: define your start and stop events explicitly in the SIPOC and use the same definition in the baseline and the after measurement.

Use working time or calendar time consistently. Customers experience calendar time; staff capacity is measured in working time. State which one each figure uses.

## Worked example (illustrative, hypothetical numbers)

A supplier-invoice approval process. A sample of items shows average cycle time of 5 working days (40 working hours) and total touch time of 2 hours.

- Wait time = 40 − 2 = 38 hours. Flow efficiency = 2 ÷ 40 = 5%. Almost all delay is waiting, so faster data entry would barely matter.
- Three steps with first-pass yields of 0.90 (coding), 0.80 (approval, because of missing purchase order numbers), and 0.95 (payment run). RTY = 0.90 × 0.80 × 0.95 = 0.684, so about 68% of invoices pass through with no rework.
- About 100 invoices are in progress and about 20 complete per working day. Little's Law gives average cycle time = WIP ÷ throughput = 100 ÷ 20 = 5 working days, which agrees with the sample and confirms the backlog, not effort, drives delay.
- The top problem is the approval step's rework. A 5 whys chain reaches "the purchase order number is not a required field on the supplier invoice template", which is checkable and changeable.

## Common mistakes to avoid

- Mapping the process as documented or as managers believe it runs, instead of following real items.
- Measuring only touch time and speeding up work that was never the delay; check the data, because in office processes waiting often dominates.
- Averaging first-pass yields instead of multiplying them, which hides how few items pass cleanly end to end.
- Jumping from the map straight to a software purchase before removing and combining steps.
- Stopping 5 whys at "human error" or "training", which leaves the process that allowed the error unchanged.
- Redesigning every step at once, so nobody can tell which change helped.
- Removing an approval that exists because an auditor or regulator relies on it.

## Output

1. **Problem statement and goal**: one paragraph, with the metric the owner wants to move.
2. **SIPOC table**

| Suppliers | Inputs | Process (5–7 high-level steps) | Outputs | Customers |
|---|---|---|---|---|

   Plus the start trigger, end event, and what is out of scope.

3. **Current-state swimlane map** in Mermaid or indented text, with waits, handoffs, and rework loops marked.
4. **Step measurement table**

| Step | Lane (role) | Touch time | Wait before step | FPY | Handoff in | Waste category | Data source (measured / estimated) |
|---|---|---|---|---|---|---|---|

5. **Summary metrics**: cycle time, touch time, wait time, flow efficiency, RTY, handoff count, volume, with sample size and date range.
6. **Top problems and root causes**: fishbone summary, 5 whys chain, and the data that confirms or weakens each cause.
7. **Future-state map** and a before/after comparison of steps, handoffs, and expected waits (labeled as estimates).
8. **RACI table**

| Step | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|

9. **Controls table**

| Risk | Control | Preventive or detective | Performed by | Frequency | Evidence left |
|---|---|---|---|---|---|

10. **Implementation plan**

| Change | Owner | Depends on | Pilot scope | Start | Success metric | Baseline | Target (owner-set) |
|---|---|---|---|---|---|---|---|

11. **Assumptions, estimates, and open questions.**

## Quality checks

- The SIPOC has an explicit start trigger and end event, and the metrics use the same boundaries.
- The current-state map reflects observed work, including rework loops and exceptions, not the documented ideal.
- Every metric is labeled measured or estimated, with sample size and period.
- Cycle time − touch time = wait time holds in every row and in the totals; RTY is a product, not an average.
- Waste categories are used by their correct definitions (for example, overprocessing is not the same as overproduction).
- Each root cause is testable, within the organization's control, and supported by data or clearly marked as a hypothesis to test.
- The future state removes or combines steps before automating them.
- Every future-state step has exactly one Accountable.
- No existing control that auditors or regulators rely on is removed without the control owner's sign-off.
- Targets are presented as proposals for the owner, not forecasts.

## Boundaries

- The process owner decides the future state; this skill recommends it.
- Changes to financial controls, segregation of duties, or regulated steps need the control owner, and often internal audit, to approve.
- Changes to roles, workload, or headcount involve HR and the affected managers.
- Once the future state is agreed and stable, hand it to sop-writer to produce the working procedure.
- If the goal is a metric system rather than a process fix, use kpi-tree; if a single failure event triggered the work, run incident-postmortem first.
