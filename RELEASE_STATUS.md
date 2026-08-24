# Relay Skills v0.2.0 release ledger

This ledger records evidence states independently. A later state never implies an earlier or adjacent one.

| State | Status | Evidence or next gate |
| --- | --- | --- |
| Relay governance implemented | Passed 2026-08-24 | Relay v0.1.56 contains exact-version public promotion, reserved-slug protection, governed voice imports, intentional OIDC 404 behavior, and OAuth/MCP authorization proof |
| Relay locally qualified | Passed 2026-08-24 | Exact v0.1.56 release gates, production build, browser matrix, infrastructure checks, image vulnerability scans, and deployment preflight passed; only the documented adopted recovery-stack drift warning remains |
| Relay pushed | Passed 2026-08-24 | The governed v0.1.56 release train was pushed and qualified before merge |
| Relay merged | Passed 2026-08-24 | Relay main and tag `v0.1.56` resolve to exact revision `db8ee338d64e37778509a5f366c14fa76718ca57` |
| Relay deployed | Passed 2026-08-24 | Production web task definition 14 and worker task definition 34 run exact v0.1.56 images; ECS targets are healthy and live revision, OAuth metadata, MCP 401 challenge, and intentional OIDC 404 readbacks passed |
| Production data reconciled | Passed 2026-08-23 | Reserved first-party slug reconciliation completed without deletion; live readback found zero duplicate active global slugs |
| Skill task projection backfill | Passed 2026-08-23 | 102 eligible published Relay-authored skills have published task projections and audit records; live mismatch count is zero |
| Canonical public packages imported | Passed 2026-08-24 | The Relay-authored `relay-skill-router`, `kpi-tree`, `ab-test-setup`, and `negotiate-tactically` immutable versions are present under their reserved slugs |
| Behavioral qualifications recorded | Passed 2026-08-24 | Each promoted asset version has a passing qualification for the exact evaluation-suite digest recorded in `relay-lock.json` |
| Public packages promoted | Passed 2026-08-24 | The governed worker promoted exactly four packages; live anonymous discovery, package digest headers, and downloaded bytes match, while a cross-version anonymous pin returns 404 |
| Distribution lock generated | Passed 2026-08-24 | `relay-lock.json` is `production_promoted` and pins the four live asset-version IDs, qualifications, evaluation suites, archive digests, source commits, licenses, and file hashes |
| Distribution candidate locally qualified | Passed 2026-08-24 | Node 22 clean install and zero-vulnerability audit; 11 tests; all four package hashes; normal and release host manifests; live production drift check; source-tree comparison; lock and compatibility hashes; all four skills pass `quick_validate.py` |
| Disposable host parser/install qualification | Passed 2026-08-24 | Exact Codex `0.147.0-alpha.6.5` and Claude `2.1.183` installed and parsed core plus compatibility plugins in a disposable Linux/ARM64 Node 22 container; strict Claude validation passed and the read-only candidate mount prevented profile or source mutation |
| Generic plugin-validator compatibility | Known tool gap | The bundled generic validator rejects Codex's officially supported direct MCP server map and ChatGPT's current `required` app mapping; exact Codex marketplace parsing/install and `claude plugin validate --strict` both pass the release artifact |
| Local npm tarball staged | Passed 2026-08-24 | Production-promoted dry pack contains 56 files, is 31.4 kB packed and 118.7 kB unpacked, and passed lock, live, release, host, and skill verification; it remains unpublished pending release publication |
| GitHub v0.2.0 published | Not started | Requires released production lock and public-repository qualification |
| npm v0.2.0 published with provenance | Not started | Governed GitHub Release workflow only |
| Codex marketplace published | Not started | Same tagged lock manifest |
| Claude self-hosted marketplace published | Not started | Same tagged lock manifest |
| Codex installed on this Mac | Not started | Released public marketplace only |
| Claude installed on this Mac | Not started | Released public marketplace only |
| Codex fresh-session UAT passed | Not started | Four skills, OAuth consent, three MCP tools, auth boundaries |
| Claude fresh-session UAT passed | Not started | Four skills, OAuth consent, three MCP tools, auth boundaries |
| Release screenshots approved | Not started | Capture actual released Codex and Claude inventory/invocation states during dual-host UAT; do not substitute candidate or fabricated host images |
| ChatGPT app mapping registered | Passed 2026-08-24 | Developer mode is enabled; ChatGPT registered the production Relay MCP URL with DCR, the exact three Relay scopes, app ID `asdk_app_6a8c9b9e00e8819196dc67e0197c3254`, and version ID `asdk_app_v_6a8c9b9e00fc8191a2e086d7842bb2ab`; OAuth connection remains a distinct UAT gate |
| OpenAI submitted | Not started | Separate challenge-token/configuration and portal submission authority |
| OpenAI approved/listed | External | Never infer from submission |
| Anthropic submitted | Not started | Official in-app submission form and retained receipt |
| Anthropic approved/listed | External | Never infer from submission |
| Local unmanaged voice skills archived | Blocked | Only after both hosts retrieve all five governed exact versions through Relay MCP |

Rollback preserves evidence: restore or clear Relay's public version pointer, release a corrective npm/plugin patch, retain immutable tags and audit records, restore archived local voice skills if governed MCP regresses, and amend or withdraw pending directory submissions.
