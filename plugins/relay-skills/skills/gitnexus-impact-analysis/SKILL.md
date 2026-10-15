---
name: gitnexus-impact-analysis
description: Assess the likely consequences of a proposed or local code change with GitNexus graph evidence, then verify the result against the exact repository. Use for dependency tracing, blast-radius analysis, regression planning, and deciding whether a shared symbol is safe to change.
---

# GitNexus Impact Analysis

Use GitNexus as an index over an authorized repository, not as the source of truth. This package coordinates an independently installed GitNexus MCP server; it does not install GitNexus, create an index, or grant rights to the GitNexus software.

## Bind the evidence

Record the repository root, revision, branch, dirty state, and intended change. Use `list_repos` to select the matching graph explicitly. If no graph matches, more than one match is plausible, or freshness cannot be established, do not guess.

For local changes, use `detect_changes` with the narrowest applicable scope. For a proposed change, locate the exact symbol with `query` and disambiguate it with `context`.

If the graph is absent or stale, continue with exact repository inspection when that can answer the question. Otherwise report that a graph refresh is needed; do not run an installer, indexing command, watcher, hook, or configuration mutation from this skill.

## Trace likely consequences

1. Inspect the target implementation and the actual diff or proposed edit.
2. Use `impact` in the dependency direction that answers the question. Examine direct dependents first, then expand only when shared or high-connectivity code warrants it.
3. Use `context` or `trace` to resolve ambiguous relationships and important execution paths.
4. Check direct imports, runtime registration, configuration, generated code, schemas, and external contracts that a static graph may miss.
5. Identify tests that exercise the affected behavior and gaps where no relevant test exists.

An empty graph result is a hypothesis, never proof that there are no dependents. Verify negative claims with repository search and exact source. Call out reflection, dynamic dispatch, dependency injection, generated code, and configuration-driven wiring when relevant.

## Decide and report

Classify the change as low, medium, high, or unknown risk based on observed reach, contract sensitivity, test coverage, and unresolved gaps. Treat unknown as a reason to gather more evidence before editing.

Return:

- repository and revision;
- target and proposed change;
- graph identity and freshness;
- direct and transitive dependents;
- runtime, configuration, schema, and test effects;
- exact-source checks performed;
- risk classification, coverage gaps, and residual uncertainty;
- the smallest safe validation plan.

Read [references/provenance.md](references/provenance.md) when evaluating licensing, distribution, or the GitNexus dependency boundary.
