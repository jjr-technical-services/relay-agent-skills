---
name: gitnexus-review
description: Review a pull request, commit range, branch, or local diff with GitNexus-assisted dependency evidence and exact-source verification. Use for regression review, merge-risk assessment, missing-test analysis, and source-supported review findings.
---

# GitNexus Review

Review the change, not the repository in the abstract. GitNexus provides structural leads; the diff, runtime contracts, and exact source decide whether an issue is real. This package requires a separately installed GitNexus MCP server and neither installs nor redistributes GitNexus.

## Establish the review target

Resolve the requested pull request, commit range, branch comparison, staged diff, unstaged diff, or full local worktree. Record the repository, base and head revisions, dirty state, and changed paths. Do not silently substitute a default branch or omit untracked files from a local review.

Use `list_repos` to bind the graph to the same repository. If the graph is missing, ambiguous, or stale relative to the reviewed revision, say so. Continue with exact-source review when possible; do not refresh an index or change repository configuration from this skill.

## Review from behavior outward

1. Read the complete diff and summarize the behavior that changed.
2. Use `detect_changes` for local work or `query` and `context` for a committed comparison to locate affected symbols.
3. Use upstream `impact` on behaviorally changed symbols, including tests when supported. Inspect direct dependents before broader transitive results.
4. Use `trace`, `explain`, or `pdg_query` only when control flow, data flow, guards, or a cross-module path materially affects a finding.
5. Verify every candidate issue against the exact implementation, its callers, runtime wiring, configuration, schemas, and relevant tests.
6. Check whether the change adds, removes, or weakens coverage for the behavior it modifies.

Static graphs may omit reflection, generated code, framework conventions, runtime registration, and configuration-driven behavior. Do not infer safety from an empty result.

## Finding standard

Report a finding only when the reviewed change introduces or exposes a concrete defect, security weakness, compatibility break, or material test gap. Each finding must include severity, affected path and line, triggering scenario, evidence, and a practical correction. Keep pre-existing issues and speculative improvements out of the findings list; mention them separately only when they materially affect merge risk.

If no qualifying findings remain, say so plainly and list the checks performed plus residual uncertainty.

## Output

Return:

- review target and exact revisions;
- findings ordered by severity;
- behavior and dependency-impact summary;
- test coverage and missing scenarios;
- graph identity, freshness, and limitations;
- verdict: ready, ready with follow-up, or not ready.

Read [references/provenance.md](references/provenance.md) when evaluating licensing, distribution, or the GitNexus dependency boundary.
