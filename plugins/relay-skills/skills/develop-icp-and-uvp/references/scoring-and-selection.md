# Segment scoring and selection

## Contents

1. Scoring principles
2. Default criteria
3. Rating anchors
4. Confidence adjustment
5. Knockout criteria
6. Selection rules
7. Script input and output

## 1. Scoring principles

Use one scoring model across all candidate segments for a decision. Adjust weights only before inspecting totals, or document why a changed weight is legitimate. Preserve the raw ratings, evidence, and confidence; a total alone is not auditable.

Score the segment in the current product and go-to-market context, not its theoretical long-term potential. Use observable segment definitions that can be applied consistently.

## 2. Default criteria

The default weights total 100.

| Criterion ID | Criterion | Weight | What to evaluate |
|---|---|---:|---|
| `problem_severity` | Problem severity | 15 | Frequency, consequence, dissatisfaction, and cost of inaction |
| `trigger_urgency` | Trigger and urgency | 10 | Observable event, deadline, or pressure that creates action now |
| `outcome_value` | Outcome value | 15 | Measurable economic, operational, experiential, or risk value |
| `solution_fit` | Solution fit | 15 | Current capability, workflow, integration, service, and compliance fit |
| `differentiation` | Differentiation and winability | 10 | Meaningful advantage against the real alternative and proof available |
| `economic_viability` | Economic viability | 10 | Ability and willingness to pay, cost to acquire/serve, and margin logic |
| `reachability` | Reachability | 10 | Identifiable audience, credible channels, access, and sales-cycle practicality |
| `retention_expansion` | Retention and expansion | 10 | Recurring value, habit, renewal, repeat use, seats, volume, or adjacent use cases |
| `delivery_friction` | Delivery feasibility | 5 | Low implementation burden, manageable risk, and time-to-value |

Change criteria when the decision requires it. For regulated or safety-critical work, add explicit compliance and harm criteria or use them as knockouts. For mission-led work, add mission impact. Do not double-count the same concept under several labels.

## 3. Rating anchors

Apply the same anchor logic to each criterion:

- `1`: Strongly unfavorable; evidence indicates a material barrier or little value.
- `2`: Below average; meaningful weakness outweighs limited upside.
- `3`: Mixed or acceptable; neither a clear advantage nor a disqualifier.
- `4`: Favorable; evidence supports a meaningful advantage.
- `5`: Exceptional; strong, segment-specific evidence of a decisive advantage.

For `delivery_friction`, a high score means lower friction and better feasibility.

Attach confidence to each rating:

- `0.20`: Mostly assumed.
- `0.40`: Some reported evidence; important gaps remain.
- `0.60`: Repeated evidence or useful data with limitations.
- `0.80`: Strong converging evidence.
- `1.00`: Replicated, current, directly relevant evidence; use rarely.

## 4. Confidence adjustment

Calculate:

`raw score = sum(weight * rating / 5) / sum(weight) * 100`

`confidence-adjusted score = sum(weight * rating / 5 * confidence) / sum(weight) * 100`

`evidence confidence = sum(weight * confidence) / sum(weight) * 100`

Interpret all three together. A high raw score with low evidence confidence is a research priority, not a winner. The confidence-adjusted score is intentionally conservative; it does not mean an uncertain segment is intrinsically bad.

Use qualitative bands only as aids:

- `80-100`: compelling for the present scope;
- `65-79`: promising with manageable gaps;
- `50-64`: conditional or experimental;
- below `50`: deprioritize unless strategy requires further study.

Do not use a band to override knockout criteria or obvious business constraints.

## 5. Knockout criteria

Evaluate knockouts before ranking. Make each knockout test objective enough for two reviewers to agree.

Common knockouts:

- the segment cannot legally or ethically be served;
- a must-have product capability is absent for the decision horizon;
- the required implementation, security, or integration cannot be delivered;
- unit economics are structurally negative;
- the buyer or channel is inaccessible within the target period;
- time-to-value exceeds the trigger window;
- expected safety, brand, or compliance risk is unacceptable;
- the segment requires a business model the organization will not support.

Record the knockout, evidence, owner, and re-entry condition. Do not disguise a strategic preference as an objective knockout.

## 6. Selection rules

Choose the primary ICP by combining scores with strategic constraints and evidence quality. Document:

- why it wins now;
- why the runner-up does not;
- the cost of focus and the cost of spreading effort;
- the assumed channel and product state;
- the evidence that would reverse the decision;
- the review date or trigger.

Use secondary labels deliberately:

- **secondary:** viable, but not the current center of product and go-to-market effort;
- **experimental:** strategically interesting but insufficiently proven;
- **opportunistic:** acceptable inbound demand without proactive investment;
- **anti-ICP:** actively disqualify or redirect.

Do not merge several middling segments into a vague primary profile.

## 7. Script input and output

Run:

```bash
python3 scripts/score_segments.py segments.json --format markdown
```

Input shape:

```json
{
  "criteria": [
    {"id": "problem_severity", "label": "Problem severity", "weight": 15}
  ],
  "segments": [
    {
      "name": "Multi-site clinics replacing phone scheduling",
      "scores": {
        "problem_severity": {
          "rating": 5,
          "confidence": 0.8,
          "evidence": "12 months of abandoned-call and staffing data"
        }
      },
      "knockouts": []
    }
  ]
}
```

Omit `criteria` to use the default model. Supply every configured criterion for every segment. The script fails on ratings outside 1-5, confidence outside 0-1, duplicate IDs or names, missing scores, non-positive weights, or empty inputs. Use `--format json` for structured output.
