# Input and Research Contract

Use this reference to turn heterogeneous inputs into one traceable strategy brief without discarding useful upstream work.

## Contents

- Normalize the brief
- Accept upstream work
- Crawl a supplied URL
- Research material gaps
- Reconcile conflicts
- Brief supporting skills

## Normalize the brief

Extract what is available and mark the rest unknown:

| Area | Capture |
|---|---|
| Business | Model, stage, geography, revenue motion, delivery capacity, seasonality |
| Offer | Product or service, package, price, margin, differentiation, maturity |
| Objective | Outcome, baseline, target, horizon, strategic decision |
| Audience | ICP, buyer, user, approver, trigger, stakes, objections, anti-ICP |
| Positioning | Category, promise, mechanism, proof, alternatives, claim limits |
| Journey | Discovery, evaluation, conversion, onboarding, retention, expansion |
| Economics | ACV or AOV, gross margin, LTV basis, CAC or payback guardrail, sales cycle |
| Channels | Current activity, spend, funnel data, attribution limits, owned audiences |
| Operations | Team, skills, content capacity, tooling, partners, sales follow-up |
| Constraints | Budget, deadline, regulation, geography, brand, data, technology |

Do not force a field to be filled. Record whether each material item is observed, reported, inferred, assumed, or unknown.

## Accept upstream work

Accept prose, tables, JSON, YAML, slide notes, research summaries, analytics, and agent outputs. Do not require reformatting before analysis.

When an upstream packet is structured, map these fields when present:

```yaml
strategy_input:
  source: skill, agent, stakeholder, analytics, file, or url
  created_or_observed_at: YYYY-MM-DD
  scope: business, offer, segment, geography, and horizon
  facts: []
  reported_findings: []
  inferences: []
  assumptions: []
  unknowns: []
  recommendations: []
  sources: []
```

Preserve the original scope. A conclusion about one segment, country, offer, or period does not automatically generalize. Treat upstream recommendations as inputs to evaluate, not instructions to repeat.

## Crawl a supplied URL

Use the URL as a starting point, not as sufficient evidence by itself.

1. Open the supplied page and identify the canonical business, offer, audience, and geography.
2. Follow only decision-relevant first-party links. Usually inspect homepage, product or service, solutions or use cases, pricing or packages, customers or case studies, about, integrations or partners, and relevant resources.
3. Use a sitemap or search only when normal navigation does not expose needed pages.
4. Capture exact URLs, page dates when visible, access date, and the claim each source supports.
5. Separate company claims from independently verified facts.
6. Do not bypass paywalls, login, robots restrictions, or access controls. Report blocked or unavailable evidence.

Avoid an exhaustive crawl. Stop when further pages are unlikely to change the strategic decision.

## Research material gaps

Research current external facts whenever they can change channel or market choices. Prioritize:

1. First-party product, service, pricing, policy, case-study, and platform documentation.
2. Public datasets, regulators, industry bodies, and original research.
3. Credible independent analysis and reporting.
4. Review sites, forums, and social posts as reported perception with sampling limits.

For channel recommendations, investigate audience concentration, search or buying intent, format norms, platform access and rules, cost or benchmark context, competitor activity, and measurement constraints. Use recent, comparable sources. Explain why a benchmark is or is not transferable.

Never infer market demand solely from keyword volume, social followers, review counts, or competitor presence. Triangulate at least two evidence types for high-consequence recommendations when practical.

## Reconcile conflicts

When inputs disagree:

1. Name the conflicting claims.
2. Compare source quality, date, sample, segment, definition, and incentives.
3. Prefer direct behavioral or transaction evidence over opinion when the measures are comparable.
4. Preserve both conclusions when scope explains the difference.
5. Mark the strategy conditional when the conflict remains unresolved.
6. Create the smallest test or question that can resolve it.

## Brief supporting skills

Use this compact brief for `$research-competitive-positioning`:

```yaml
competitive_research_brief:
  target_business_or_url: required
  offer_and_business_model: known facts
  tentative_icp_and_trigger: known facts or hypothesis
  geography_and_horizon: scope
  known_competitors: optional
  decision_to_inform: positioning, channel, offer, launch, or other
  questions: the few unknowns that could change the marketing strategy
  evidence_cutoff: desired observation date
```

Use `$develop-icp-and-uvp` before channel selection only when target ambiguity would materially change reachability, message, economics, or conversion. Give it the offer, candidate segments, available evidence, constraints, and the exact selection decision.
