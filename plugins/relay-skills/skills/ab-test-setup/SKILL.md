---
name: ab-test-setup
description: Design a decision-ready controlled experiment with an explicit hypothesis, assignment unit, exposure rules, metrics, guardrails, sample assumptions, QA checks, and stopping criteria. Use when planning an A/B test, feature experiment, growth experiment, holdout, rollout validation, or experiment brief.
---

# A/B Test Setup

Design the experiment around the decision it must support and make hidden assumptions visible.

## Workflow

1. State the decision, target population, and falsifiable hypothesis in the form: changing X for Y will move Z because mechanism M.
2. Define control and treatment precisely. Identify the unit of randomization, unit of analysis, eligibility rules, exclusions, exposure event, and contamination risks.
3. Choose one primary metric tied to the hypothesis. Define secondary diagnostic metrics and guardrails for quality, cost, user harm, or long-term effects.
4. Record the baseline rate or distribution, minimum detectable effect, significance level, desired power, allocation, and expected traffic. If these inputs are missing, request them or return a range; do not invent a sample size.
5. Set a minimum run length that covers relevant business cycles. Define data-quality checks, novelty or seasonality risks, and the stopping rule before launch.
6. Specify instrumentation and QA: event names, assignment logging, exposure logging, deduplication, sample-ratio-mismatch checks, metric reconciliation, and pre-launch A/A or dry-run needs.
7. Write decision rules for ship, iterate, stop, or extend. Include how to handle a neutral primary result, a guardrail regression, and conflicting segments.
8. Define rollout, rollback, ownership, and the post-experiment readout date.

## Output

Return an experiment brief with sections for hypothesis, variants, population and assignment, metrics, sample assumptions, duration, instrumentation and QA, risks, decision rules, and launch checklist.

Separate confirmed facts from assumptions. Avoid peeking-based stopping, post-hoc metric switching, and unplanned segment claims.
