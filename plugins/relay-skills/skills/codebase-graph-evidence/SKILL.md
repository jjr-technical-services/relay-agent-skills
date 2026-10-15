---
name: codebase-graph-evidence
description: Explore an authorized codebase with structural graph evidence, trace callers and routes, assess the blast radius of local changes, and verify architecture claims against exact source. Use for unfamiliar repositories, cross-module impact analysis, route or call tracing, and audits where coverage matters. Do not use for trivial single-file work or as a replacement for exact source inspection.
---

# Codebase Graph Evidence

Use the code graph as a fast index over source, not as canonical memory or proof by itself. Pair structural results with index coverage, repository state, and exact source.

## Establish the evidence boundary

1. Record the repository root, current commit, branch, and whether the worktree is dirty.
2. Call `index_status` before structural exploration.
3. If the repository is not indexed or the index is stale, use exact source tools instead. In the Relay repository, an operator can explicitly refresh the local pilot with `npm run codebase-memory:index`.
4. Never index or query a path outside the active authorized repository.

## Explore, then verify

- Use `get_architecture` for orientation and `get_graph_schema` before writing a graph query.
- Use `search_graph`, `trace_path`, and `query_graph` to identify likely symbols, paths, callers, routes, and dependencies.
- Use `detect_changes` for a local-diff blast-radius hypothesis.
- Before making a negative or exhaustive claim, call `check_index_coverage` for every relevant path or scope.
- Inspect the exact implementation with `get_code_snippet` or normal repository file reads before recommending or changing code.
- Corroborate change impact with the actual git diff, direct imports, runtime registration, generated code, configuration, and tests when those may be invisible to static analysis.

## Interpret gaps honestly

Static graphs can miss reflection, dynamic dispatch, runtime wiring, generated files, configuration-driven behavior, and code excluded from the index. If coverage is incomplete or the graph conflicts with source, source wins. Report the uncertainty and the fallback checks performed.

The MCP's query tools may mutate or quarantine its derived cache when corruption is detected. They must not modify repository source. Keep tool approvals enabled and stop if a tool attempts a source, configuration, hook, installer, or external-system mutation.

## Keep knowledge in the right layer

- Keep the raw graph in the local, repository-scoped cache.
- Do not treat the graph as Codex durable memory.
- Do not save graph output into Relay Context Library unless the user or calling workflow explicitly requests a durable snapshot.
- When durable save-back is authorized, store a bounded summary or cited excerpt with repository, commit, dirty fingerprint, MCP version, graph generation, index mode, and coverage gaps. Do not store the raw graph by default.
- Do not use cached ADR records as the authoritative ADR source.

## Output contract

For architecture or impact answers, include:

- repository and revision evidence;
- graph generation or freshness state;
- paths and symbols examined;
- coverage gaps;
- exact source verification;
- inferred blast radius and residual uncertainty.

Read [references/provenance.md](references/provenance.md) when evaluating the runtime pin, onboarding the MCP into Relay, or changing the trust boundary.
