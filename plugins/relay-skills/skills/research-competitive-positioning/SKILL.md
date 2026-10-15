---
name: research-competitive-positioning
description: Research a business's competitive landscape, including direct competitors, substitutes, adjacent options, and the status quo; compare target audiences, positioning, claims, proof, pricing and offers, conversion paths, content and acquisition channels; identify category patterns, risks, and credible whitespace; and produce an evidence-labeled handoff for marketing, ICP, product, sales, or brand strategy. Use when given free text, a URL, company or product materials, a competitor list, or another skill or agent's output and is asked for competitor discovery, competitive analysis, positioning maps, channel intelligence, messaging comparisons, differentiation opportunities, market-entry research, or current competitor research.
---

# Research Competitive Positioning

Map what buyers can choose, how those choices are framed and distributed, and what the evidence permits the strategist to conclude. Separate observable competitor behavior from inferred strategy and unknown performance.

## Route supporting material

- Read [references/research-method.md](references/research-method.md) before crawling a URL, discovering competitors, assessing channel activity, or making current market claims.
- Read [references/deliverable-and-handoff.md](references/deliverable-and-handoff.md) before producing a comprehensive comparison or an output another skill or agent will consume.

## Frame the research decision

Determine:

- the target business, offer, category or job, business model, geography, and maturity;
- the primary ICP or buying situation, buyer roles, trigger, budget, and evaluation criteria;
- the strategic decision and horizon this research must inform;
- known competitors, suspected substitutes, and the current status quo;
- the dimensions that could change positioning, product, pricing, sales, or channel strategy;
- recency requirements, accessible sources, and material evidence gaps.

Ask only questions whose answers would substantially change the competitive set or comparison. Continue with labeled assumptions when context is unavailable.

## Run unattended when no one can answer

When a workflow or another skill runs this skill, or questions would go unanswered, ask nothing. Record every guessed framing input (target, offer, ICP, geography, decision horizon, known competitors) in the handoff's `assumptions` with the value you used, why, and your confidence, and continue. Put choices that need a person in `human_decisions`.

## Reuse prior work before researching again

Before discovering competitors, look for earlier competitive studies of the same business. When a Context Library search tool or a frozen Context Package is available, search it for competitive research, positioning, or market studies. If you find one:

- cite it and record it in `reused_study` with its observation date;
- recheck its time-sensitive facts (pricing, positioning, offers, channel activity) instead of copying them, and count how many you rechecked;
- extend or correct it rather than starting over.

Never treat an earlier study's conclusions as current without rechecking.

## Accept and normalize heterogeneous inputs

Accept free text, a URL, files, tables, screenshots, prior research, and outputs from other skills or agents. Preserve upstream sources, dates, scope, evidence labels, and caveats. Recheck time-sensitive claims instead of treating an earlier agent's conclusion as current fact.

Use these evidence states:

- **Observed:** Directly visible first-party content, product behavior, price, ad-library record, publication, partnership, or other traceable evidence.
- **Reported:** A stakeholder, customer, reviewer, analyst, or upstream agent statement with provenance.
- **Inferred:** A conclusion derived from named observations.
- **Assumed:** A premise used to continue despite missing evidence.
- **Unknown:** A question the accessible evidence cannot answer.

Record source URL, publisher, access date, page or artifact date when available, claim supported, and limitations. Preserve contradictions. Distinguish “not found” from “does not exist.”

Perform current web research for any substantive competitive landscape unless the user explicitly requests an offline synthesis. If live access is unavailable, work from supplied material, name the evidence cutoff, and keep all current-state conclusions provisional.

## Discover the real competitive set

Define competitors by the buyer's decision, not only by category labels. Include a purposeful mix of:

- direct competitors solving the same job for a similar audience;
- segment or geography specialists;
- adjacent products or service models that can absorb the budget;
- internal workflows, spreadsheets, agencies, consultants, or other substitutes;
- the status quo or decision to do nothing;
- emerging entrants when they could change expectations.

Choose the smallest set that represents the decision, usually four to eight named options plus the status quo. Explain why each belongs. Do not equate search rank, funding, social following, review volume, or brand fame with competitive importance.

## Research before interpreting

For the target and each priority competitor, collect evidence on:

- claimed category and target audience;
- problem framing, buying trigger, promise, differentiated mechanism, and proof;
- product or service scope, packaging, pricing visibility, trial or sales motion, and CTA;
- customer examples, testimonials, certifications, integrations, and partner signals;
- homepage, solution, comparison, case-study, resource, and campaign messages;
- observable organic, paid, social, event, community, partner, outbound, referral, and lifecycle signals;
- conversion path, lead magnets, demos, trials, consultations, and onboarding cues;
- material weaknesses, contradictions, exclusions, and unsupported claims.

Use first-party sources for what a competitor says or offers. Use credible independent sources for customer perception, market context, or verification. Treat reviews as reported evidence with sampling and recency limits. Do not bypass paywalls, authentication, access controls, robots restrictions, or platform safeguards.

## Distinguish activity from performance

Competitor channel evidence can show presence, cadence, message emphasis, offer structure, and strategic possibility. It rarely reveals spend, targeting, conversion, profitability, pipeline, retention, or incrementality.

Never claim that an ad, post, keyword, format, or channel “works” because it is visible, frequent, recent, or repeated. State the strongest defensible conclusion, such as “active,” “repeated,” “apparently emphasized,” or “consistent with a demand-capture motion.” Label performance as unknown unless reliable performance data is available.

## Compare positioning and channel posture

Build a common comparison frame:

`ICP and trigger -> category frame -> promised outcome -> mechanism -> proof -> offer -> CTA -> channel and journey posture`

For every material comparison:

- show the evidence or mark it unknown;
- distinguish company-wide positioning from a page, segment, or campaign variant;
- compare on buyer-relevant dimensions, not an arbitrary feature checklist;
- note claim qualifications, geography, pricing basis, and observation date;
- avoid false precision when sources are incomplete.

Identify category conventions, clusters, contradictions, overused claims, under-served situations, proof gaps, offer gaps, channel crowding, and distribution asymmetries.

## Form credible strategic implications

Classify each apparent opportunity as:

- **Defensible whitespace:** Valuable to the ICP, credibly deliverable, supportable with proof, and not already strongly occupied.
- **Testable whitespace:** Plausible but dependent on an unverified buyer need, message, offer, or channel response.
- **Empty space for a reason:** Unattractive economics, low demand, capability mismatch, regulatory risk, or another barrier.

Do not recommend copying competitor language or creative. Do not call absence a differentiation strategy. Convert research into choices about who to target, which alternative to frame against, what promise and proof to lead with, which channels merit testing, and which category conventions to match or reject.

## Produce a reusable handoff

Lead with the strategic implications, not a catalog of screenshots or links. Include:

1. scope, decision, observation date, and evidence quality;
2. competitive-set rationale by competitor type;
3. executive findings and decision implications;
4. buyer-relevant positioning matrix;
5. concise competitor profiles with evidence and caveats;
6. category patterns, contested positions, and message or proof gaps;
7. observable channel and conversion-path signals, separated from performance unknowns;
8. defensible, testable, and misleading whitespace;
9. implications for positioning, offers, content, channel strategy, and testing;
10. risks, contradictions, unknowns, and next research priorities;
11. cited source ledger;
12. the `competitive_research_handoff` block in the companion reference.

When downstream reuse is requested, append the exact named block as the `json` block defined in the companion reference, even in a brief response. Do not substitute a prose recap, YAML, or an unlabeled field list.

State whether each conclusion is **observed**, **reported**, **inferred**, **assumed**, or **unknown**, and whether the overall research is **snapshot**, **provisional**, or **decision-ready for the stated scope**.

## Quality gate

Before finishing, verify:

- The competitive set reflects the buyer's alternatives, including status quo.
- Important current claims have direct citations and observation dates.
- First-party claims and independent perceptions are not conflated.
- Missing evidence is not presented as absence.
- Visible channel activity is not presented as performance.
- The comparison uses consistent, buyer-relevant dimensions.
- Whitespace is tested against customer value, deliverability, proof, and economics.
- Recommendations explain tradeoffs and what evidence could overturn them.
- A downstream handoff request returns the exact `competitive_research_handoff` JSON block, valid against `relay.gtm.competitive_research.v1`.
- An unattended run asked no questions, recorded guessed inputs as assumptions, and checked for prior work first.
- The handoff is concise, traceable, and usable by `$develop-marketing-strategy` or another downstream skill or agent.
