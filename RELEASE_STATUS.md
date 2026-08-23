# Relay Skills v0.2.0 release ledger

This ledger records evidence states independently. A later state never implies an earlier or adjacent one.

| State | Status | Evidence or next gate |
| --- | --- | --- |
| Relay governance implemented | Passed 2026-08-23 | Relay v0.1.49 contains version-pinned distribution, reserved-slug reconciliation, governed voice imports, OIDC correction, and release-gated OAuth proof |
| Relay locally qualified | Passed 2026-08-23 | Exact full gate on a fresh 78-migration database: 895 unit passes plus 3 edge passes; 36 integration passes; production audit 0; build/budgets; 135 browser passes plus 1 unrelated flaky pass on retry and 2 skips; 2 OAuth lifecycle passes |
| Relay pushed | Passed 2026-08-23 | Governed release branch was pushed and qualified through PR #98 |
| Relay merged | Passed 2026-08-23 | PR #98 merged as exact revision `0817ee86ab0a878819e3d46cc596cd3904abc981` |
| Relay deployed | Passed 2026-08-23 | Production web task definition 8 and worker task definition 27 run the exact v0.1.49 images; live web, OAuth, MCP, migration, and static-delivery smokes passed |
| Production data reconciled | Passed 2026-08-23 | Reserved first-party slug reconciliation completed without deletion; live readback found zero duplicate active global slugs |
| Skill task projection backfill | Passed 2026-08-23 | 102 eligible published Relay-authored skills have published task projections and audit records; live mismatch count is zero |
| Canonical public packages imported | Not started | The four first-party canaries are not yet present as canonical production assets; import must pin Relay revision `0817ee86ab0a878819e3d46cc596cd3904abc981` |
| Behavioral qualifications recorded | Not started | Each imported immutable version must pass its matching evaluation-suite digest before promotion |
| Public packages promoted | Not started | Requires the four exact production asset-version IDs and passed behavioral qualifications |
| Distribution lock generated | Blocked | `relay-lock.json` remains `candidate_unpromoted` until all four public distribution pointers make production discovery authoritative |
| Distribution candidate locally qualified | Passed 2026-08-23 | Node 22 clean install/audit; 11 tests; all four package hashes; host manifests; npm dry pack; source-tree comparison; lock and compatibility hashes |
| Disposable host parser/install qualification | Passed 2026-08-23 | Exact Codex `0.147.0-alpha.6.5` and Claude `2.1.183` installed and parsed core plus compatibility plugins in a disposable Node 22 container; strict Claude validation passed and no user profile changed |
| Local npm tarball staged | Passed 2026-08-23 | Candidate tarball contains 51 files and is retained in the promotion evidence bundle; it is not published and must be rebuilt after the production lock is generated |
| GitHub v0.2.0 published | Not started | Requires released production lock and public-repository qualification |
| npm v0.2.0 published with provenance | Not started | Governed GitHub Release workflow only |
| Codex marketplace published | Not started | Same tagged lock manifest |
| Claude self-hosted marketplace published | Not started | Same tagged lock manifest |
| Codex installed on this Mac | Not started | Released public marketplace only |
| Claude installed on this Mac | Not started | Released public marketplace only |
| Codex fresh-session UAT passed | Not started | Four skills, OAuth consent, three MCP tools, auth boundaries |
| Claude fresh-session UAT passed | Not started | Four skills, OAuth consent, three MCP tools, auth boundaries |
| Release screenshots approved | Not started | Capture actual released Codex and Claude inventory/invocation states during dual-host UAT; do not substitute candidate or fabricated host images |
| ChatGPT app mapping registered | Not started | Developer-mode registration must supply the real `plugin_asdk_app...` ID before `.app.json` is added |
| OpenAI submitted | Not started | Separate challenge-token/configuration and portal submission authority |
| OpenAI approved/listed | External | Never infer from submission |
| Anthropic submitted | Not started | Official in-app submission form and retained receipt |
| Anthropic approved/listed | External | Never infer from submission |
| Local unmanaged voice skills archived | Blocked | Only after both hosts retrieve all five governed exact versions through Relay MCP |

Rollback preserves evidence: restore or clear Relay's public version pointer, release a corrective npm/plugin patch, retain immutable tags and audit records, restore archived local voice skills if governed MCP regresses, and amend or withdraw pending directory submissions.
