# Flow Selection and Narrative Design

Use this guide after the initial source review or crawl has produced candidate product flows.

## Start with the buyer's question

A screenshot is useful when it answers a buyer question quickly. Typical questions include:

- What job can I complete?
- What makes this better or different?
- What changes between the starting state and the result?
- Can a person review, control, or trust the output?
- What tangible result is delivered?

Write one sentence for the intended story before selecting images. A useful form is: “For `<audience>`, the product turns `<starting condition>` into `<valuable result>` through `<distinctive mechanism>` while preserving `<important control or trust boundary>`.”

## Candidate matrix

For each candidate flow, record:

| Dimension | Question |
| --- | --- |
| Buyer relevance | Is this tied to a costly, frequent, risky, or strategic job? |
| Visible differentiation | Can a viewer see the distinctive mechanism without a long explanation? |
| Outcome clarity | Does the state reveal progress, quality, time saved, or a delivered result? |
| Visual clarity | Is the important content legible and compositionally strong? |
| Narrative usefulness | Does it play a distinct role in the story rather than duplicate another image? |
| Evidence confidence | Was it successfully exercised, merely observed, or inferred from source? |
| Safety and durability | Can it be shown without sensitive data, brittle fixtures, or misleading claims? |

An optional `0–3` score per dimension can help compare a large inventory. Treat the score as a sorting aid, not the decision. A slightly lower-scoring control or review state may be essential to make the story credible.

## Strong screenshot roles

The selected sequence commonly draws from these roles:

- **Orientation:** establishes the product's workspace and buyer context.
- **Input or setup:** shows how work enters the system, but only when setup itself is differentiated.
- **Mechanism:** shows the distinctive interaction, analysis, automation, or coordination.
- **Review and control:** shows human judgment, approval, traceability, permissions, or safeguards.
- **Outcome:** shows the delivered artifact, resolved state, decision, metric, or completed work.
- **Continuity:** shows how the result is tracked, reused, shared, or advanced to the next stage.

Not every story needs every role. Prefer one strong image per narrative job over many near-duplicates.

## Selection anti-patterns

Avoid selecting:

- empty dashboards or generic navigation with no visible customer value
- loading, error, placeholder, or partially hydrated states
- the same composition at several breakpoints when the layout does not materially change
- screens whose key meaning depends on unreadably small text
- source-inferred features described as live proof
- images containing unapproved customer, employee, financial, health, or authentication data
- crops that remove the label, action, or outcome needed to interpret the UI
- a polished hero frame that hides a broken or unverified underlying flow

## Write the narrative from evidence

For every selected screenshot, answer:

1. What step of the use flow is this?
2. What functionality is visibly demonstrated?
3. Why is this image valuable to the intended audience?
4. What specific claim can it support?
5. What does it not prove?
6. Why was this breakpoint, crop, or frame chosen?

Use the answers in both `pack.md` and `manifest.json`. Keep marketing language direct, but do not upgrade inference into evidence.
