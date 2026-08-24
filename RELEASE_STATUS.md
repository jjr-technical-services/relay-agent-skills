# Relay Skills v0.2.1 corrective release ledger

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
| v0.2.0 disposable host parser/install qualification | Incomplete gate found by UAT | Exact Codex `0.147.0-alpha.6.5` and Claude `2.1.183` parsed and installed both marketplaces, but the gate did not assert that Codex actually loaded the bundled MCP server |
| v0.2.1 corrective host qualification | Passed 2026-08-24 | Exact Codex `0.147.0-alpha.6.5` and Claude `2.1.183` strict validation/install passed in a disposable Linux/ARM64 Node 22 container; supplementary Codex `0.149.0-alpha.4.1` installation also lists Relay as an enabled OAuth MCP server |
| Generic plugin-validator compatibility | Known tool gap | The corrected MCP envelope passes the bundled validator; the validator still rejects ChatGPT's current `required` app mapping, which exact Codex install/runtime testing accepts |
| v0.2.1 local npm tarball staged | Passed 2026-08-24 | Corrective dry pack contains the expected 56 files; lock, live drift, host manifests, 11 tests, strict Claude validation, and the strengthened disposable host gate pass |
| GitHub v0.2.0 published | Passed 2026-08-24 | Release `v0.2.0` targets exact revision `690c8f2db33f52f186c50043ced2a3b40eb5c650` |
| npm v0.2.0 published with provenance | Passed 2026-08-24 | Governed release workflow `32769608769` passed every release gate and published the public npm artifact |
| v0.2.0 self-hosted marketplaces published | Passed 2026-08-24 | The public Git marketplace installed successfully in Codex and Claude on this Mac |
| Codex v0.2.0 installed on this Mac | Passed 2026-08-24 | Public marketplace inventory readback shows enabled `relay-skills@relay` v0.2.0 |
| Claude v0.2.0 installed on this Mac | Passed 2026-08-24 | Public marketplace inventory readback shows enabled `relay-skills@relay` v0.2.0 with the expected HTTP OAuth definition |
| Codex v0.2.0 native-skill UAT | Passed 2026-08-24 | A fresh ephemeral session discovered and invoked all four exact `relay-skills:*` native skills |
| Codex v0.2.0 MCP UAT | Failed 2026-08-24 | Fresh-session `relay_match_skills` was unavailable because Codex 0.149 did not load the documented direct server map; v0.2.1 changes to the runtime-supported `mcpServers` envelope and adds a regression gate |
| Claude fresh-session UAT | Blocked by host auth | Plugin installation passed, but Claude Code's own account token was revoked before model or Relay MCP startup; refresh host sign-in, then rerun four skills and three tools |
| Corrective GitHub/npm v0.2.1 published | Not started | Requires exact corrected-head local and hosted qualification plus real Codex MCP readback |
| Release screenshots approved | Not started | Capture actual released Codex and Claude inventory/invocation states during dual-host UAT; do not substitute candidate or fabricated host images |
| ChatGPT app mapping registered | Passed 2026-08-24 | Developer mode is enabled; ChatGPT registered the production Relay MCP URL with DCR, the exact three Relay scopes, app ID `asdk_app_6a8c9b9e00e8819196dc67e0197c3254`, and version ID `asdk_app_v_6a8c9b9e00fc8191a2e086d7842bb2ab`; OAuth connection remains a distinct UAT gate |
| OpenAI submitted | Not started | Separate challenge-token/configuration and portal submission authority |
| OpenAI approved/listed | External | Never infer from submission |
| Anthropic submitted | Not started | Official in-app submission form and retained receipt |
| Anthropic approved/listed | External | Never infer from submission |
| Local unmanaged voice skills archived | Blocked | Only after both hosts retrieve all five governed exact versions through Relay MCP |

Rollback preserves evidence: restore or clear Relay's public version pointer, release a corrective npm/plugin patch, retain immutable tags and audit records, restore archived local voice skills if governed MCP regresses, and amend or withdraw pending directory submissions.
