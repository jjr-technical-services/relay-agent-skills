# Competitive Research Deliverable and Handoff

Use this structure for a comprehensive report and for downstream reuse by marketing, ICP, product, sales, or brand work.

## Contents

- Report structure
- Comparison matrix
- Channel intelligence
- Whitespace and implications
- Reusable handoff

## Report structure

### 1. Executive implications

Lead with three to seven conclusions that change a decision. For each, state the evidence state, confidence, sources, and what action or test follows.

### 2. Scope and evidence quality

State:

- target, offer, ICP or buying situation, geography, and decision horizon;
- observation and evidence cutoff dates;
- competitor inclusion method;
- sources searched, inaccessible evidence, and material gaps;
- overall status: snapshot, provisional, or decision-ready for the stated scope.

### 3. Competitive set

List each direct, specialist, adjacent, substitute, status-quo, and emerging option included. Explain why it competes for this buyer and why notable candidates were excluded.

## Comparison matrix

Use buyer-relevant dimensions:

| Competitor | Type | ICP / trigger | Category frame | Promise | Mechanism | Proof | Offer / price | CTA / path | Evidence confidence |
|---|---|---|---|---|---|---|---|---|---|

Follow with concise competitor profiles only where nuance would be lost in the table. Separate the company's claims from independent reports and analyst inference.

Do not build a large feature grid unless features are known purchase criteria for the scoped buyer.

## Channel intelligence

Use a separate table so presence is not confused with performance:

| Competitor | Channel | Observation and dates | Message / offer | Destination | Defensible inference | Performance unknowns | Sources |
|---|---|---|---|---|---|---|---|

Summarize:

- category-wide channel patterns;
- segment-specific or unusually differentiated motions;
- underused channels or journey moments worth investigating;
- offer, proof, or conversion conventions;
- visible dependencies on platforms, partners, creators, events, or sales teams.

Never rank competitors by channel success without reliable comparable performance data.

## Whitespace and implications

Classify opportunities:

| Opportunity | Classification | Buyer value | Target capability and proof | Competitive evidence | Risk | Validation test |
|---|---|---|---|---|---|---|

Use classifications:

- **Defensible whitespace:** Ready to support a strategic choice.
- **Testable whitespace:** Worth a bounded validation test.
- **Empty space for a reason:** Do not pursue without resolving the named barrier.

Translate findings into implications for:

- ICP or buying-situation focus;
- category frame and alternative to position against;
- promise, mechanism, proof, objection handling, and claim boundaries;
- packaging, offer, CTA, and conversion path;
- content themes and proof assets;
- primary, supporting, experimental, and deferred channel hypotheses;
- customer or market research priorities.

## Reusable handoff

End with one fenced `json` block whose only top-level key is
`competitive_research_handoff`. It must validate against
`relay.gtm.competitive_research.v1`. JSON keeps dates as strings; YAML turned
them into timestamps. Keep it compact enough for another skill or agent to
consume without rereading the full report.

```json
{
  "competitive_research_handoff": {
    "schema": "relay.gtm.competitive_research.v1",
    "observed_at": "YYYY-MM-DD",
    "status": "snapshot | provisional | decision-ready-for-scope",
    "reused_study": { "reference": "", "observed_at": "YYYY-MM-DD", "rechecked_facts": 0 },
    "scope": {
      "business": "",
      "offer": "",
      "primary_icp_or_buying_situation": "",
      "geography": "",
      "horizon": ""
    },
    "competitive_set": [
      { "name": "", "type": "", "inclusion_reason": "", "canonical_url": "https://" }
    ],
    "positioning_patterns": [
      { "finding": "", "evidence_state": "observed | reported | inferred | assumed | unknown", "confidence": "low | medium | high", "sources": [] }
    ],
    "whitespace": [
      { "opportunity": "", "classification": "defensible | testable | empty-for-a-reason", "rationale": "", "proof_required": [], "validation_test": "", "sources": [] }
    ],
    "channel_signals": [
      { "channel": "", "competitors": [], "observation": "", "strategic_implication": "", "performance_unknowns": [], "confidence": "low | medium | high", "sources": [] }
    ],
    "strategic_implications": {
      "positioning": [],
      "offers_and_conversion": [],
      "content_and_proof": [],
      "channels_to_evaluate": [],
      "traps_to_avoid": []
    },
    "contradictions": [],
    "unknowns": [],
    "next_research": [],
    "assumptions": [{ "field": "", "value": "", "reason": "", "confidence": "low" }],
    "do_not_ship": [{ "claim": "", "reason": "" }],
    "human_decisions": [{ "decision": "", "why_human": "" }],
    "sources": [{ "url": "https://", "accessed_on": "YYYY-MM-DD" }]
  }
}
```

Rules:

- `type` is open text. Prefer direct, specialist, adjacent, substitute,
  status-quo or emerging, and use another short label when none fits.
- Every source has a `url` or a `reference`, and an `accessed_on` date in
  `YYYY-MM-DD` form.
- Include `reused_study` only when you reused earlier research; count the facts
  you rechecked.
- Put claims the evidence does not support, including competitor comparisons
  you could not verify, in `do_not_ship`.
- Omit optional fields rather than filling them with placeholders. Keep the
  four common arrays (`assumptions`, `do_not_ship`, `human_decisions`,
  `sources`) even when they are empty.

Do not claim exhaustive coverage. Preserve exact URLs, scope, and observation dates. Keep performance unknowns explicit so downstream strategy does not convert competitor activity into unsupported effectiveness claims.
