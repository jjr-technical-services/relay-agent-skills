---
name: verify-design-claims
description: Verify concrete claims in architecture documents, implementation plans, refactoring proposals, or state-machine designs against source evidence and executable models. Use when correctness depends on named APIs, paths, invariants, transitions, ordering, retries, or behavioral preservation.
---

# Verify Design Claims

Turn a proposal's checkable claims into an evidence ledger. Do not treat the document, an earlier summary, or model intuition as proof.

## Scope the verification

Extract only claims that can affect implementation or acceptance:

- file paths, symbols, API signatures, enum values, and numeric counts;
- mechanism and feasibility claims;
- invariants and absolute behavioral claims;
- state transitions, guards, ordering, retries, and before/after equivalence.

Classify each claim as `confirmed`, `refuted`, `inferred`, or `unresolved`. Cite the command, source location, runtime observation, or authoritative record supporting the classification.

## Choose proportionate depth

- For structural claims, inspect the repository and run focused searches or checks.
- For behavioral claims, run the smallest real reproduction that can distinguish the claim from a plausible failure.
- For a state machine with guards, concurrency, retries, or three or more states, extract a model and check reachability, deadlocks, missing guard branches, invariant violations, replay behavior, and event ordering.
- For a refactor, compare the observed current behavior with the proposed behavior. Report undocumented deltas rather than assuming preservation.

Use an available deterministic runtime for model checks. A specialized provider tool is optional, never assumed. Do not install a runtime or call an external provider without authority.

## Preserve authority

Verification is read-only by default. Do not edit the reviewed plan, source, provider, or external record unless the user separately asked for that mutation. If an ambiguity changes the model materially, state it and ask for the missing decision; otherwise continue and label the result unresolved.

## Output

Return a compact claim ledger with claim, status, evidence, and correction direction. For behavioral failures, include the shortest observed counterexample you can reproduce. Distinguish source inspection, executable proof, inference, and remaining gaps.

## Attribution

Adapted from `AmethystLuna/logicprobe@7ce1fdf87fcc8f50487d0c09e3c5e34d61d4efec` under the MIT License. This adaptation removes host-specific mandatory gates, plan-file mutation, and assumptions about DSH tooling.
