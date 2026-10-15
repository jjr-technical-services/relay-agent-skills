# Handoff and unattended runs

Read this when a workflow or another skill runs this skill, when nobody is
available to answer questions, or when a later stage will consume the result.

## Unattended runs

A run is unattended when a workflow started it, when the request says no one is
available, or when questions would go unanswered. In an unattended run:

- Ask nothing. Continue with the evidence you have.
- Record every input you had to guess as an assumption: the field, the value you
  used, why, and your confidence. Guesses never appear as facts in the report.
- Look for prior work before starting over. When a Context Library search tool
  or a frozen Context Package is available, search it for earlier ICP,
  positioning or competitive studies. Cite and reuse what you find, and
  recheck its facts rather than copying them.
- Put every choice that needs a person (budget, a segment you had to exclude on
  judgment, anything irreversible) in `human_decisions`.

## Low evidence

`scripts/score_segments.py` ranks on raw attractiveness when every eligible
segment's evidence confidence is below the threshold (default 40%). It then
reports `ranking_basis: raw_score` and `evidence_level: hypothesis`. When that
happens:

- present the ranking as a hypothesis to validate, never as a selection;
- keep both scores visible;
- make the validation plan the first recommendation.

With enough evidence it ranks on confidence-adjusted scores and reports
`evidence_level: provisional`. Raise it to `evidence-backed` only when customer
behavior or economics support the primary ICP.

## Reconcile with competitive research

When a `competitive_research_handoff` exists, read it before selecting the ICP.
Check the chosen segment against its whitespace and traps. Set
`reconciled_with_competitive_research` to `true` only when you did, and record
any conflict you resolved in `assumptions` or `human_decisions`.

## The handoff block

End the deliverable with one fenced `json` block whose only top-level key is
`icp_uvp_handoff`. It must validate against `relay.gtm.icp_uvp.v1`:

```json
{
  "icp_uvp_handoff": {
    "schema": "relay.gtm.icp_uvp.v1",
    "created_at": "YYYY-MM-DD",
    "evidence_level": "hypothesis | provisional | evidence-backed",
    "ranking_basis": "raw_score | confidence_adjusted",
    "reconciled_with_competitive_research": false,
    "segments": [
      { "name": "", "raw_score": 0, "confidence_adjusted_score": 0, "rank": 1, "rationale": "" }
    ],
    "primary_icp": {
      "definition": "",
      "trigger": "",
      "buyer_roles": [],
      "pains": [],
      "anti_icp": ""
    },
    "uvp": { "statement": "", "mechanism": "", "alternative": "", "proof": [] },
    "messaging_pillars": [],
    "assumptions": [{ "field": "", "value": "", "reason": "", "confidence": "low" }],
    "do_not_ship": [{ "claim": "", "reason": "" }],
    "human_decisions": [{ "decision": "", "why_human": "" }],
    "sources": [{ "url": "", "accessed_on": "YYYY-MM-DD" }]
  }
}
```

Rules:

- Dates are `YYYY-MM-DD` strings. Every source has a `url` or a `reference`,
  and an `accessed_on` date.
- Copy `ranking_basis` and `evidence_level` from the scorer output. Copy the
  scores; do not round them differently.
- List in `do_not_ship` every claim the evidence does not support, including
  results, customer names or testimonials you do not have. Never invent them.
- Omit optional fields rather than filling them with placeholders. Keep the
  four common arrays even when they are empty.
