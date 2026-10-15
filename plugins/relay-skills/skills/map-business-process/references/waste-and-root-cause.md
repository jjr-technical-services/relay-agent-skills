# Waste classification and root-cause analysis

## Value-added test

For each step, ask three questions. A step is value-added only if all three are yes:

1. Would the customer of the process be willing to pay for it (or care that it happens)?
2. Does it change the item's form, fit, or function (information added, a decision made, a product built)?
3. Is it done right the first time?

Some steps fail the test but are still required: regulatory checks, audit controls, legal approvals. Label these **business-value-added** (also called necessary non-value-added). Minimize their effort; do not remove them without the control owner.

## The eight lean wastes

Lean practice lists seven wastes from the Toyota Production System plus an eighth, non-utilized talent. The mnemonic TIMWOODS covers all eight. Use the definitions exactly; teams often mislabel overprocessing and overproduction.

| Waste | Correct definition | How it shows up in office and knowledge work |
|---|---|---|
| Transportation | Moving materials or information between locations without adding value | Emailing files between systems, re-keying data from one tool into another, routing a form through extra mailboxes |
| Inventory | Work accumulated beyond what is needed now | Queues of unapproved requests, backlogs of unprocessed tickets, batches waiting for a weekly run |
| Motion | Unnecessary movement by people within their work | Searching for files, switching between many screens, hunting for the right template |
| Waiting | Idle time when the item or person waits for the next action | Approval queues, waiting for information from another team, waiting for a batch cycle |
| Overproduction | Producing more, or earlier, than the next step needs | Reports nobody reads, documents drafted before a decision is made, work started before it is prioritized |
| Overprocessing | Doing more work, or higher precision, than the customer requires | Several approval layers for low-value items, re-checking work already checked, formatting internal documents to external standards |
| Defects | Errors that cause rework, correction, or scrap | Missing fields, wrong codes, incorrect data sent back for correction |
| Skills (non-utilized talent) | Not using people's knowledge, skills, or ideas | Experienced staff doing clerical checks, frontline ideas ignored, decisions escalated that the doer could make |

Tag each wait or non-value step with one primary waste. If a step has two, pick the one that drives the most time or cost.

## Prioritizing problems

Build a simple Pareto table: list problems (not wastes in general, but specific ones such as "approvals wait for weekly meeting") with their measured impact (hours of wait per item, rework rate, error cost). Sort descending. The top two or three typically account for most of the loss; confirm this with your own data rather than assuming a fixed split.

## Fishbone diagram (Ishikawa)

A fishbone lays out candidate causes of one problem (the "head") across categories (the "bones"). Its purpose is breadth: make sure the team has considered causes beyond the obvious one. Categories vary by setting; practitioners disagree about which set to use. Decision rule: use the manufacturing set when physical work dominates, the service set when information and people dominate.

- Manufacturing set (often called the 6 Ms): Methods, Machines, Materials, Measurement, Manpower (people), Mother Nature (environment).
- Service set: Policies, Procedures, People, Systems (plus Surroundings or Suppliers where relevant).

Write the problem as a specific, measurable statement ("Approval step sends back roughly one in five invoices", using your measured figure), not a vague complaint ("Approvals are slow").

Text format:

```
Problem: [specific measured problem]
  Policies:   approval limit set very low, so most invoices need manager sign-off
  Procedures: no rule for what to do when the PO number is missing
  People:     new AP staff not trained on PO matching
  Systems:    invoice template does not require a PO number
  Suppliers:  suppliers not told PO numbers are required
```

Candidate causes are hypotheses. Mark each as Confirmed (data supports), Refuted (data contradicts), or Untested.

## 5 whys, used carefully

5 whys asks "why" repeatedly to move from a symptom to a cause the organization can change. It is quick and useful, and it has known weaknesses: it follows a single chain when problems usually have several causes, it depends on the knowledge of whoever is in the room, and it tends to stop at "human error" or "lack of training". Guardrails:

1. Start from a specific, observed problem instance, not a general complaint.
2. Answer each "why" with a fact that can be checked, not an opinion. Note the evidence.
3. Branch when there is more than one answer. Follow each branch that data supports.
4. Stop when you reach a cause that is within the organization's control and whose removal would prevent recurrence. Five is a convention, not a rule; stop earlier or go further as needed.
5. Reject "human error", "carelessness", and "lack of attention" as root causes. Ask why the process made the error easy to make and hard to catch.
6. Test the chain backward: read it as "therefore" from the root to the problem. If a link does not follow, it is wrong.

Illustrative chain:

- Invoices are sent back at approval. Why? The PO number is missing (checked: most returns cite it).
- Why is it missing? Suppliers do not include it. Why? Nothing tells them to, and the template does not require it.
- Why does AP accept invoices without it? There is no intake check; coding proceeds and the gap is found at approval.
- Root causes (two branches): no requirement communicated to suppliers; no check at intake. Both are changeable.

## Checking causes with data

Before redesigning, test the leading causes: stratify rework by supplier, item type, or team; compare items with and without the suspected cause; run a small trial of the fix. If data cannot be gathered, label the cause a hypothesis and make the pilot the test.
