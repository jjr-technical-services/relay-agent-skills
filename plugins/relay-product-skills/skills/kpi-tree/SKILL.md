---
name: kpi-tree
description: Build a KPI tree that connects a strategic goal to an outcome metric, controllable input metrics, guardrails, owners, and instrumentation. Use for product strategy, metric design, OKR measurement, north-star decomposition, initiative prioritization, or diagnosing why a business outcome is moving.
---

# KPI Tree

Turn a goal into a causal, testable measurement system rather than a list of loosely related metrics.

## Workflow

1. Restate the goal, target population, time horizon, and decision the tree must support. Mark missing inputs as assumptions.
2. Define one primary outcome metric. Specify its formula, unit, grain, reporting window, and desired direction.
3. Decompose the outcome into three to seven input metrics that teams can influence. Explain the hypothesized relationship from each input to its parent.
4. Add guardrail and counter-metrics for quality, risk, cost, fairness, or user harm. Do not optimize an outcome without naming likely failure modes.
5. Separate leading indicators from lagging results. Avoid vanity metrics unless they have a defensible causal link.
6. Map current or proposed initiatives to the input metric they intend to move. Flag initiatives with no measurable path to the outcome.
7. Define ownership, source system, update cadence, baseline, target, and instrumentation gaps for every metric.
8. End with the smallest measurement plan that can validate the most important causal assumptions.

## Output

Return:

1. A compact tree using indentation or parent-child notation.
2. A metric dictionary with formula, owner, source, cadence, baseline, target, and type.
3. An initiative-to-metric map.
4. Assumptions, instrumentation gaps, and the next validation actions.

Do not invent baselines, targets, or causal certainty. Label estimates and hypotheses explicitly.
