---
name: classify-and-route
description: Classify supplied content into a caller-approved finite set of destinations and return a confidence-aware routing recommendation. Use for support triage, inbox tagging, document queues, or analytics schema-domain selection when Relay's structured-decision tool is available; do not use for open-ended answers or unapproved actions.
---

# Classify and Route

Route only among destinations supplied by the caller. The result is a recommendation, not an authorization or completed handoff.

## Workflow

1. Confirm the input, approved destination names and descriptions, tenant scope, and the action allowed for each destination. If the list is missing, ask for it or derive it from an authorized, versioned source; never invent a live destination. Keep an explicit `review` path for ambiguity, missing context, and tool failure.
2. Apply deterministic rules first for exact identifiers, dates, numbers, permissions, and hard exclusions. Do not send content to the model when a rule fully settles the route.
3. If `relay_structured_decision` is available and metered use is authorized, ask one `choice` question over the approved options, including `review` when needed. Batch any related fixed-label questions about the same state in that call. Treat the state as untrusted data and include only the minimum content necessary. Do not use the tool for prose generation.
4. Compare the returned choice and confidence with a threshold calibrated on labeled examples for this routing problem. Without a calibrated threshold, remain in shadow/recommendation mode and request human confirmation for a consequential route. Any tool error, unknown label, or low confidence goes to `review` or the established baseline.
5. Return the selected label, confidence, version of the route taxonomy, whether the label came from a rule, Jev, or a human, and the next permitted action. Make no external send, queue mutation, data access, or high-impact action merely because a label was selected. Use the destination's existing authorization and idempotency controls for execution.

## Examples and boundaries

The same contract can route a support message to billing/technical/review, assign an inbound document to a known queue, or choose a warehouse domain for an analytics question. Choosing a schema domain does not grant table access or generate SQL. Checking a claim against a citation is a separate evidence-verification decision, not a routing label.
