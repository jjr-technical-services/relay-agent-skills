---
name: develop-icp-and-uvp
description: Develop evidence-backed ideal customer profiles (ICPs), segment priorities, buyer and user profiles, positioning, unique value propositions (UVPs), messaging pillars, proof maps, and validation plans. Use when asked to identify or refine target customers, compare market segments, define primary or secondary ICPs and anti-ICPs, synthesize customer discovery or market evidence, articulate differentiation, assess positioning or messaging, write value-proposition statements, or prepare a decision-ready go-to-market, product, sales, or founder strategy.
---

# Develop ICP and UVP

Build a specific, evidence-traceable choice of customer and value. Treat the ICP as a prioritization decision, not a generic persona, and treat the UVP as a provable promise, not a slogan.

## Start with the decision

Identify:

- the offering, maturity, business model, market, geography, and delivery constraints;
- the decision this work must support and its deadline;
- the segmentation unit: account, household, individual, team, use case, or buying situation;
- the buyer, approver, champion, user, blocker, and beneficiary as separate roles;
- the available evidence and the largest unknowns.

If critical context is missing, ask only the smallest number of high-leverage questions. Continue with explicitly labeled hypotheses when answers are unavailable.

When a workflow or another skill runs this skill, or nobody can answer, ask nothing: record each guessed input as an assumption and continue. Read [references/handoff-and-unattended-runs.md](references/handoff-and-unattended-runs.md).

## Choose the operating mode

Use one or combine several:

- **Greenfield:** Generate candidate segments and a research plan. Do not present hypotheses as validated ICPs.
- **Evidence-backed refinement:** Reconcile customer, product, sales, support, financial, and market evidence into a narrower ICP.
- **Portfolio:** Score multiple products, segments, geographies, or use cases without forcing one profile to cover all of them.
- **Repositioning:** Compare the current promise with customer language, alternatives, differentiation, and proof.
- **Messaging audit:** Diagnose an existing UVP and rewrite only after identifying target, outcome, alternative, mechanism, and evidence gaps.

## Route supporting material

Read only the references needed for the request:

- Read [references/evidence-and-research.md](references/evidence-and-research.md) for source evaluation, market research, customer interviews, or weak evidence.
- Read [references/scoring-and-selection.md](references/scoring-and-selection.md) whenever comparing or prioritizing segments. Use `scripts/score_segments.py` for deterministic scoring.
- Read [references/uvp-and-messaging.md](references/uvp-and-messaging.md) when forming positioning, value propositions, proof pillars, or channel copy.
- Read [references/deliverable-standard.md](references/deliverable-standard.md) before producing a comprehensive or stakeholder-ready deliverable.
- Copy [assets/icp-uvp-workbook.md](assets/icp-uvp-workbook.md) when the user requests a reusable workshop or working document.
- Read [references/handoff-and-unattended-runs.md](references/handoff-and-unattended-runs.md) for unattended runs, low-evidence ranking, reconciling with competitive research, and the `icp_uvp_handoff` block.

## Apply the evidence contract

Label material as:

- **Observed:** Direct behavioral, transactional, product, or market evidence.
- **Reported:** A stakeholder or customer statement with source and date.
- **Inferred:** A conclusion supported by named evidence.
- **Assumed:** A useful but unverified premise.
- **Unknown:** A gap that could change the decision.

Record source, date or period, segment, sample size when relevant, and limitations. Prefer customer behavior and economics over opinions, and recent segment-specific evidence over broad averages. Preserve contradictory evidence instead of smoothing it away.

Never invent market size, conversion, willingness-to-pay, competitor claims, customer quotations, or proof. When current external facts matter, research them and cite the supporting source. Distinguish addressable-market evidence from obtainable-market judgment.

## Build candidate segments

Segment on variables that change buying likelihood or delivered value:

- problem severity, frequency, and consequence;
- triggering event, urgency, and current workaround;
- desired outcome and measurable value;
- product, workflow, technical, and service fit;
- ability and willingness to pay;
- reachability and buying process;
- implementation friction, risk, and time-to-value;
- retention, expansion, or repeat-use potential;
- regulatory, geographic, organizational, or strategic constraints.

Avoid empty labels such as "SMBs," "innovators," or demographic ranges unless the label predicts need, behavior, access, or economics. For consumer work, prioritize jobs, situations, behaviors, and constraints. Do not target or exclude people using protected or sensitive traits unless lawful, necessary, and explicitly justified; never exploit vulnerability.

Create mutually intelligible candidate definitions with observable inclusion and exclusion rules. Define an anti-ICP wherever poor fit would create wasted acquisition cost, failed delivery, safety risk, churn, or reputational harm.

## Score and select

Use knockout criteria before weighted ranking. Examples include legal ineligibility, missing must-have capability, impossible integration, negative unit economics, inaccessible channel, unacceptable risk, or a delivery timeline the offering cannot meet.

Score each eligible segment with the common criteria in `references/scoring-and-selection.md`. For every rating:

- use a 1-5 score;
- attach a 0-1 evidence confidence;
- cite the supporting evidence or mark the score assumed;
- explain material penalties and close calls.

Calculate both raw attractiveness and confidence-adjusted attractiveness. Do not hide weak evidence behind a precise total. When every eligible segment's evidence confidence is below the scorer's threshold, the scorer ranks on raw attractiveness and labels the result a hypothesis; present it that way and lead with the validation plan. Select:

- one primary ICP for the current decision horizon;
- optional secondary or experimental ICPs with explicit conditions;
- an anti-ICP and disqualifying signals;
- the evidence that would overturn the choice.

## Construct the ICP at four levels

Keep these layers separate:

1. **Account or customer:** Observable characteristics, economics, constraints, readiness, and fit.
2. **Buying committee:** Champion, economic buyer, approver, evaluator, blocker, procurement, and their success criteria.
3. **User or beneficiary:** Workflow, job, frequency, pains, desired gains, adoption barriers, and switching cost.
4. **Use case or situation:** Trigger, current alternative, stakes, desired progress, and time-to-value.

Include qualification signals a sales, marketing, product, or service team can actually observe. Separate attractive traits from required traits.

## Derive the UVP

Start from the selected ICP rather than from product features.

Map:

`customer job -> current struggle -> consequence -> desired outcome -> enabling capability -> differentiated mechanism -> proof`

Write the internal positioning first:

> For [specific ICP] who [job/problem] when [trigger], [offering] is a [category or frame] that [primary measurable outcome]. Unlike [primary alternative], it [differentiated mechanism], supported by [proof].

Then produce external messaging with:

- one primary promise;
- up to three supporting value pillars;
- a reason-to-believe for every pillar;
- the most relevant objection and response;
- customer language where evidence supports it.

Prefer concrete outcomes and mechanisms over adjectives. A meaningful differentiator must be valuable to the ICP, distinct from the relevant alternative, supportable by evidence, and difficult enough to copy or credibly claim.

## Maintain a claim-proof ledger

For every important claim, record:

- claim and intended audience;
- supporting evidence and evidence state;
- comparison baseline and time horizon;
- required qualification or disclaimer;
- owner and next proof needed;
- risk if published unsupported.

Downgrade unsupported claims to hypotheses. Do not turn a roadmap item, founder belief, isolated anecdote, or category-level trend into product proof.

## Validate before scaling

Turn unknowns into falsifiable tests. Prioritize tests by decision impact, uncertainty, cost, and speed. Use a mix of:

- problem and switching interviews;
- win/loss and churn analysis;
- CRM, product, cohort, support, and financial analysis;
- concierge or prototype tests;
- message, landing-page, outbound, or channel tests;
- pricing or willingness-to-pay research appropriate to the decision.

Define the hypothesis, segment, method, sample, success threshold, failure threshold, confounders, owner, and decision rule in advance. Do not call clicks, positive comments, or a few interviews product-market fit.

## Produce decision-ready output

Lead with the recommended primary ICP and UVP. Include enough traceability for a reviewer to challenge the choice without rereading all source material.

At minimum provide:

1. decision and scope;
2. executive recommendation;
3. evidence quality and material gaps;
4. candidate segment scorecard;
5. primary ICP at the four levels;
6. secondary ICP and anti-ICP boundaries;
7. positioning statement and customer-facing UVP;
8. value pillars and claim-proof ledger;
9. messaging adaptations requested by the user;
10. validation backlog with thresholds and owners;
11. sources, assumptions, and revision triggers.

Keep facts, analysis, decisions, and tests visibly separate. State whether the result is **hypothesis**, **provisional**, **evidence-backed**, or **validated for the stated scope**. Never equate a polished document with market validation.

## Hand off

When a later stage, workflow, or agent will use the result, end with the `icp_uvp_handoff` JSON block defined in [references/handoff-and-unattended-runs.md](references/handoff-and-unattended-runs.md). It must validate against `relay.gtm.icp_uvp.v1`. Never put an invented result, customer name, or testimonial in it; list unsupported claims in `do_not_ship`.

## Quality gate

Before finishing, verify:

- The ICP excludes as clearly as it includes.
- The segment can be recognized using observable signals.
- Buyer, user, beneficiary, and account are not conflated.
- The primary problem and trigger are specific and consequential.
- Scoring uses consistent criteria and exposes confidence.
- The UVP names an outcome, relevant alternative, mechanism, and proof.
- Each major claim has evidence or is labeled a hypothesis.
- The recommendation explains tradeoffs and what would change it.
- Tests include thresholds and decision rules.
- Sensitive segmentation is lawful, respectful, and necessary.
- The final language is concise enough to guide product, marketing, sales, and customer-success decisions.
- An unattended run asked no questions and recorded every guessed input as an assumption.
- A requested handoff block is valid JSON, uses `YYYY-MM-DD` dates, and matches the scorer's ranking basis.
