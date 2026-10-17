# Release verification

The v0.3.1 authentication repair requests refresh access and the permissions used by Relay MCP tools consistently in both host manifests and CLI setup output. Existing connections may require one consent step to grant added permissions; package verification alone does not prove automatic refresh or authentication after a host restart.

The v0.3.0 candidate expands Relay Skills from four native canaries to 63 practical workflows, including a first-use guide. It preserves the original remote version lock and the frozen v0.1.0 compatibility plugins.

Release receipts are retained outside source. Verify publication against the GitHub release and npm registry; verify directory submission, approval, and publication against each provider portal. A staged source tree or passing package test is not proof of directory availability.

`library-lock.json` records the native package's file hashes, source commits, licenses, and adaptations. Its `static_reviewed_not_behaviorally_qualified` status describes package review only. It does not claim that all native skills were behaviorally evaluated or promoted in Relay's governed catalog.

The existing four remote packages remain independently pinned in `relay-lock.json`; live release verification retains their version, qualification, immutable provenance, archive-byte and per-file checks, plus the OAuth discovery contract.
