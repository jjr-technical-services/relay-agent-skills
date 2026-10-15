---
name: develop-marketing-strategy
description: Develop coherent, targeted, evidence-backed marketing and go-to-market strategies from free text, URLs, business and product materials, ICP or UVP work, analytics, customer research, and outputs from other skills or agents. Use when asked to choose or prioritize marketing channels, define channel strategy, connect positioning to acquisition and lifecycle motions, build a campaign or content portfolio, allocate budget or effort, create a 30/60/90-day marketing plan, diagnose weak growth, or turn competitive research into an actionable strategy for a product, service, company, launch, or market.
---

# Develop Marketing Strategy

Build a strategy as a set of linked choices: objective, target, positioning, journey, channel roles, offers, execution, measurement, and decision rules. Produce researched opinions and tradeoffs, not a generic list of tactics.

## Route supporting material

Read only the references needed for the request:

- Read [references/input-and-research.md](references/input-and-research.md) when inputs include a URL, files, raw notes, or prior skill or agent outputs, or when material facts are missing or conflicting.
- Read [references/channel-decision-model.md](references/channel-decision-model.md) whenever recommending, scoring, sequencing, or excluding channels. Use `scripts/score_channels.py` when a comparable multi-channel scorecard would improve the decision.
- Read [references/deliverable-standard.md](references/deliverable-standard.md) before producing a comprehensive, stakeholder-ready, budgeted, or 30/60/90-day strategy.

## Frame the decision

Establish:

- the business, offer, business model, maturity, geography, and delivery capacity;
- the primary objective, time horizon, baseline, target, and economic constraint;
- the primary ICP or buying situation, buyer and user roles, trigger, stakes, and alternatives;
- the current positioning, claim-proof boundaries, price or contract shape, and conversion path;
- existing channels, performance evidence, capabilities, budget, sales motion, and compliance constraints;
- the decision this strategy must make and what is explicitly out of scope.

Ask only questions whose answers could materially change the strategy. If answers are unavailable, proceed with named assumptions and conditional recommendations.

## Run unattended when no one can answer

When a workflow or another skill runs this skill, or questions would go unanswered, ask nothing. Take the objective, budget, horizon, owner capacity, and channel history from a supplied GTM foundation record (`relay.gtm.foundation.v1`) when one exists. Record every input you still had to guess in the handoff's `assumptions`, with the value you used, why, and your confidence. Put budget commitments and other choices that need a person in `human_decisions`.

## Normalize all input forms

Accept free text, a URL, files, tables, analytics, research, or prior agent and skill outputs. Do not require a special schema. Preserve citations, dates, scope, evidence labels, and uncertainty from upstream work. Resolve conflicting inputs explicitly rather than silently choosing or averaging them.

For a URL, inspect the supplied page and the smallest useful set of first-party product, service, solution, pricing, customer, proof, and company pages. Research current external facts when competitive conditions, channel behavior, platform rules, prices, benchmarks, or market conditions affect the recommendation. Cite live sources close to the claims they support.

Before finalizing a substantive channel strategy, perform current market, audience, channel, and competitive research unless the user explicitly requests an offline exercise or has supplied sufficient dated evidence for the decision. If live research is unavailable, state the limitation and keep recommendations provisional. Do not substitute generic channel heuristics for research.

Use these evidence states consistently:

- **Observed:** Directly visible behavior, data, product capability, page content, or market evidence.
- **Reported:** A stakeholder, customer, analyst, or upstream agent statement with provenance.
- **Inferred:** A conclusion derived from named evidence.
- **Assumed:** A useful premise that remains unverified.
- **Unknown:** A gap that could change the recommendation.

Never invent market size, channel cost, conversion, competitor performance, customer language, or product proof. Treat stale or undated research as provisional.

## Compose with other skills

Use existing work before starting new research.

- Use outputs from `$develop-icp-and-uvp` when provided. If the ICP is too vague to make a responsible channel choice and that skill is available, run or request a bounded ICP decision first.
- Use `$research-competitive-positioning` when competitor positioning, category conventions, whitespace, or channel activity could materially change the strategy. Give it the target business or URL, offer, tentative ICP, geography, decision horizon, known competitors, and the questions the marketing strategy must answer. Consume its `competitive_research_handoff` block when present.
- Use ad-library or creative research such as `$competitive-ads-extractor` only for a paid-media question. Treat active ads and repeated concepts as evidence of activity or emphasis, never as proof of spend, targeting, profitability, or creative performance.

If a supporting skill is unavailable, complete a proportionate fallback analysis and label the reduced evidence depth. Do not block useful strategic work merely because the input packet is imperfect.

When the user requests downstream reuse, preserve any supplied `competitive_research_handoff` and append the exact `marketing_strategy_handoff` JSON block defined in the deliverable standard. If both are requested, return both as separate `json` blocks; do not replace or merge them into a prose summary.

## Establish the strategic spine

Write a one-sentence strategy of the form:

> Win [specific audience or buying situation] by making [positioned promise and proof] discoverable at [critical moments] through [coherent channel roles], converting with [offer or path], and learning against [business outcome].

Then make the dependencies explicit:

`business objective -> growth constraint -> ICP and trigger -> position and proof -> journey -> channel role -> offer -> action -> measurement`

Every proposed activity must support this spine. Reject tactics that have no audience, journey role, conversion path, operational owner, or learning value.

## Choose a channel portfolio

Evaluate a realistic channel universe across owned, earned, partner, community, outbound, organic, paid, event, referral, product-led, and lifecycle motions. Score only plausible channels; do not pad the table with irrelevant options.

For each channel, research and judge:

- ICP concentration and reachability;
- intent and timing fit;
- message, proof, and format fit;
- unit economics and sales-cycle fit;
- speed and quality of learning;
- team, content, data, and operational fit;
- competitive headroom and platform dependency;
- durability, compounding value, and measurement quality.

Select a portfolio, not a winner-take-all ranking:

- **Primary:** Two to four channels that carry the strategy now.
- **Supporting:** Channels that improve conversion, proof, retention, or primary-channel yield.
- **Experiments:** One to three bounded tests that resolve consequential uncertainty.
- **Not now:** Attractive-looking channels explicitly deferred with a reason and reconsideration trigger.

Avoid recommending a channel merely because it is popular or competitors use it. A competitor's visible activity is a signal; it is not proof that the channel will work for this business.

## Write an executable strategy for every selected channel

Specify:

- role in the customer journey and strategic rationale;
- target segment, buying trigger, message, proof, and offer;
- formats, surfaces, distribution motion, cadence, and conversion path;
- integration with the other selected channels;
- owner, capabilities, dependencies, production effort, and budget assumptions;
- leading indicators, conversion metrics, business outcomes, and attribution limits;
- first test, success and failure thresholds, scale rule, stop rule, and review date.

Use ranges and scenarios when the evidence does not support point estimates. Separate media spend from creative, tooling, agency, and internal labor. Do not quote an industry benchmark without a current source and a credible comparability note.

## Sequence learning and scale

Match the plan to the maturity of the business:

1. Prove the problem, audience, claim, offer, and conversion path.
2. Establish one repeatable demand or capture motion.
3. Add supporting channels that increase yield or reduce dependency.
4. Scale spend only after signal quality, conversion, capacity, and economics meet named thresholds.

Prefer tests that settle a strategic question over disconnected campaign activity. Distinguish setup metrics, leading signals, pipeline or revenue outcomes, retention outcomes, and brand effects.

## Produce decision-ready output

Lead with the recommendation and the few choices that matter most. Include:

1. strategic thesis and decision status;
2. business objective, constraints, and growth diagnosis;
3. ICP, buying situation, positioning, proof, and conversion path;
4. competitive implications and whitespace worth testing;
5. customer journey and channel roles;
6. prioritized channel portfolio with researched rationale, score, confidence, and exclusions;
7. channel playbooks and cross-channel system;
8. content, offer, proof, and lifecycle plan;
9. budget or effort scenarios and economic assumptions;
10. measurement framework and experiment decision rules;
11. sequenced 30/60/90-day or horizon-appropriate plan;
12. sources, assumptions, unknowns, risks, and revision triggers;
13. the reusable `marketing_strategy_handoff` block defined in the deliverable standard when downstream agents or skills will use the result.

State whether the strategy is **hypothesis**, **provisional**, **evidence-backed**, or **validated for the stated scope**. A polished strategy is not validation.

## Quality gate

Before finishing, verify:

- The strategy makes clear choices and names what not to do.
- The ICP, trigger, promise, proof, channel, offer, and measurement form one coherent chain.
- Competitive claims and time-sensitive channel claims have current citations.
- Observed competitor activity is not presented as performance evidence.
- Each primary channel has a distinct role and an executable playbook.
- Budget, capacity, compliance, sales-cycle, and delivery constraints are reflected.
- Metrics reach a business outcome and expose attribution limits.
- Tests include thresholds, stop or scale rules, owners, and review dates.
- Facts, inferences, assumptions, and unknowns remain visibly separate.
- A downstream handoff request returns the exact named JSON block, valid against `relay.gtm.marketing_strategy.v1`, not shorthand prose.
- Every channel names its job, and channels are compared only with others doing the same job.
- An unattended run asked no questions and recorded every guessed input as an assumption.
- The output is concise enough to guide actual prioritization and execution.
