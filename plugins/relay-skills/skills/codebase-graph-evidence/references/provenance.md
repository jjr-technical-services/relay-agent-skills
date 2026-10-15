# Runtime provenance and trust boundary

This skill adapts the evidence workflow around
[`DeusData/codebase-memory-mcp`](https://github.com/DeusData/codebase-memory-mcp)
release `v0.10.8`, commit
`46ae198fc11cda80e817acbc5f5908d7c2de7032`.

The upstream project is MIT licensed. Its license is preserved in
[LICENSE](../LICENSE). The Rose-authored skill does not vendor the upstream source
or binary. The repository launcher downloads one exact release archive, verifies
the pinned archive and executable SHA-256 digests, and extracts only the binary,
license, and third-party notices. It never runs the upstream installer.

## Current Codex pilot

- Platform: macOS arm64 only.
- Release archive: `codebase-memory-mcp-darwin-arm64.tar.gz`.
- Archive SHA-256: `9bd840dfb3ec7eaef4f310382057adaa5b0e904df883104d03ffcf39836afd07`.
- Executable SHA-256: `2412e017268bef8f847f38d1b0f79f63185b38c27fe6fba637067bfc87c0eedf`.
- Tool profile: `analysis`.
- Indexing: explicit one-shot command only.
- Auto-index, auto-watch, UI, diagnostics, global hooks, and global agent configuration: disabled or unused.
- Allowed root, cache, and logs: confined to the active Relay checkout.
- Daemon rendezvous: a checkout-keyed owner-private directory under `/private/tmp`,
  because macOS ACL metadata on development worktrees fails the upstream secure
  ancestry check.

The analysis profile exposes graph search, graph query, path tracing, snippets,
schema, architecture, indexed-source search, project listing, status, coverage,
and local-diff impact detection. It does not expose repository indexing,
project deletion, ADR mutation, or trace ingestion as MCP tools. In v0.10.8,
10 of those 11 tools declare both non-read-only and destructive MCP annotations,
including status and search. Keep per-call approvals on and do not use those
annotations as sufficient action classification.

## Relay boundary

Relay registry presence is discovery evidence only. Keep the exact MCP candidate
quarantined until its namespace, artifacts, discovered tool schemas, cache
mutation semantics, network behavior, and authentication behavior are certified.
Do not merge the raw graph into Context Library. If durable save-back is
authorized, create an immutable, bounded codebase snapshot that preserves the
repository revision and coverage gaps.

Performance and accuracy claims from upstream are hypotheses for Relay's own
evaluation. Qualification must compare representative tasks against exact source
exploration and must not count fewer tool calls or lower context consumption as
a win when answer quality regresses.
