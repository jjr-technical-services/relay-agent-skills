# Marketing Strategy Deliverable Standard

Use this structure for a comprehensive or stakeholder-ready strategy. Compress sections when the user asks for a brief.

## Contents

- Required output
- Channel portfolio table
- Channel playbook
- Measurement and plan
- Reusable handoff

## Required output

### 1. Recommendation

Lead with:

- the strategic thesis;
- two to four primary channel choices;
- the most important supporting motion;
- the first consequential experiment;
- what not to do now;
- strategy status and evidence cutoff date.

### 2. Situation and diagnosis

Summarize the objective, baseline, target, horizon, business and delivery constraints, primary growth bottleneck, evidence quality, and largest unknowns.

### 3. Audience, position, and journey

Define the ICP and anti-ICP, buyer and user roles, trigger, job, stakes, alternatives, promised outcome, differentiated mechanism, proof, key objection, offer, and conversion path. Show how the buyer moves from unaware or status quo through evaluation, conversion, value, retention, and referral.

### 4. Competitive implications

Summarize only findings that change the strategy. Name occupied positions, category conventions, channel signals, proof gaps, defensible or testable whitespace, risks, and sources. Do not restate the full competitive report.

## Channel portfolio table

Use a scannable table:

| Priority | Channel | Role | ICP and moment | Research-backed rationale | Fit / confidence | First move | Outcome metric | Decision rule |
|---|---|---|---|---|---|---|---|---|

Follow with a **Not now** table containing the channel, reason, and reconsideration trigger.

## Channel playbook

For each primary channel, provide:

1. strategic role and hypothesis;
2. audience, trigger, message, proof, and offer;
3. surfaces, formats, distribution, cadence, and conversion path;
4. cross-channel reinforcement;
5. owner, operating requirements, production load, and dependencies;
6. spend or effort range and the basis for it;
7. leading, conversion, business, and quality metrics;
8. test design, pass or fail thresholds, scale or stop rule, and review date.

Group supporting channels when a shorter treatment is sufficient.

## Measurement and plan

Separate:

- **Instrumentation and readiness:** Tracking, CRM, lifecycle stages, response process, landing experience, attribution caveats.
- **Leading signals:** Qualified audience reach, engagement depth, search or response intent, offer take-up, proof consumption.
- **Funnel outcomes:** Qualified conversion, pipeline, purchase, activation, sales velocity, contribution margin.
- **Durable outcomes:** Retention, repeat purchase, expansion, referrals, branded demand, audience or partner assets.

For budgets, show low, base, and high scenarios or percentage allocations when dollar inputs are missing. Separate media, production, people, software, events, agency, and contingency.

Sequence the operating plan by dependencies. For a 30/60/90-day plan:

- **Days 0-30:** Resolve evidence gaps, instrument, build proof and conversion foundations, launch the smallest useful tests.
- **Days 31-60:** Iterate message and offer, establish cadence, improve follow-up and conversion, compare channel signal quality.
- **Days 61-90:** Scale only passed motions, stop or redesign failed tests, add the most reinforcing supporting motion.

Name owner, deliverable, dependency, success evidence, and decision date for each workstream.

## Reusable handoff

Append this block when another agent, skill, or workflow will consume the strategy. Use one fenced `json` block whose only top-level key is `marketing_strategy_handoff`. It must validate against `relay.gtm.marketing_strategy.v1`. JSON keeps dates as strings; YAML turned them into timestamps.

If the user requests both competitive and marketing handoffs, retain the companion skill's complete `competitive_research_handoff` as one block and add `marketing_strategy_handoff` as a second block. Never replace either named block with shorthand prose.

```json
{
  "marketing_strategy_handoff": {
    "schema": "relay.gtm.marketing_strategy.v1",
    "created_at": "YYYY-MM-DD",
    "evidence_cutoff": "YYYY-MM-DD",
    "status": "hypothesis | provisional | evidence-backed | validated-for-scope",
    "scope": { "business": "", "offer": "", "geography": "", "horizon": "" },
    "objective": {
      "outcome": "",
      "baseline": "unknown",
      "target": "unknown",
      "primary_constraint": ""
    },
    "channel_portfolio": { "primary": [], "supporting": [], "experiments": [], "not_now": [] },
    "channel_plays": [
      {
        "channel": "",
        "job": "acquisition | activation | retention | referral | revenue",
        "audience_and_moment": "",
        "message_and_offer": "",
        "first_test": "",
        "decision_rule": "",
        "owner": ""
      }
    ],
    "measurement": { "business_outcomes": [], "leading_indicators": [], "attribution_limits": [] },
    "unknowns": [],
    "risks": [],
    "revision_triggers": [],
    "assumptions": [{ "field": "", "value": "", "reason": "", "confidence": "low" }],
    "do_not_ship": [{ "claim": "", "reason": "" }],
    "human_decisions": [{ "decision": "", "why_human": "" }],
    "sources": [{ "url": "https://", "accessed_on": "YYYY-MM-DD" }]
  }
}
```

Rules:

- Dates are `YYYY-MM-DD` strings. Every source has a `url` or a `reference`, and an `accessed_on` date.
- Carry forward every `do_not_ship` claim from upstream handoffs; a strategy never makes a forbidden claim shippable.
- Write `unknown` for a baseline or target you do not have rather than inventing one.
- Omit optional fields rather than filling them with placeholders. Keep the four common arrays even when they are empty.

Do not duplicate a long report inside the block. Preserve source URLs and label unknown values rather than inventing them.
