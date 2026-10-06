# Relay Agent Skills

Four portable Agent Skills for Codex and Claude Code, plus an OAuth-protected Relay MCP connection for the broader governed catalog.

Relay is operated by JJR Technical Services LLC. The tooling in this repository is MIT-licensed; each bundled skill carries its own license file.

## Install from the marketplace

Codex:

```sh
codex plugin marketplace add jjr-technical-services/relay-agent-skills
codex plugin add relay-skills@relay
```

Claude Code:

```text
/plugin marketplace add jjr-technical-services/relay-agent-skills
/plugin install relay-skills@relay
```

`relay-skills` v0.2.1 bundles all four public workflows and connects to `https://relay.builtbyrose.co/mcp`. The host discovers Relay's OAuth metadata, opens sign-in and consent, and requests only `relay.skills.read`, `relay.skills.route`, and `relay.skills.activate`. Do not paste or commit a bearer token.

`relay-product-skills` and `relay-growth-skills` remain available at frozen v0.1.0 for one compatibility release. New installations should use only `relay-skills`; the compatibility marketplace entries are scheduled for removal after v0.2.x.

## Install standalone skills

Run from the repository or, after npm publication, through `npx relay-agent-skills`:

```sh
npx relay-agent-skills list
npx relay-agent-skills verify
npx relay-agent-skills install kpi-tree --host both --scope user
npx relay-agent-skills install ab-test-setup --host codex --scope project
npx relay-agent-skills install negotiate-tactically --host claude --scope project
```

User installs target `~/.agents/skills` for Codex and `~/.claude/skills` for Claude Code. Project installs target `.agents/skills` and `.claude/skills` under the selected project root. Existing skill directories are preserved unless `--force` is explicit.

## Bundled canaries

- `relay-skill-router`: matches and activates governed, immutable Relay skill versions through MCP.
- `kpi-tree`: turns strategic goals into causal metrics and an instrumentation plan.
- `ab-test-setup`: produces a decision-ready controlled-experiment brief.
- `negotiate-tactically`: prepares ethical negotiation strategy, calls, and messages.

The five Relay voice-agent skills and `daily-meeting-prep` are intentionally absent from the public package. Authorized organizations retrieve their governed exact versions through Relay MCP. `silk-design` remains an independent public distribution.

## Version lock and release verification

`relay-lock.json` is generated from production Relay discovery and records each asset ID, asset-version ID, archive digest, source commit, license, qualification ID, evaluation-suite digest, and per-file hash. Run:

```sh
npm run sync:relay
npm run verify:release
npm run verify:live
npm run validate:hosts -- --release
claude plugin validate . --strict
```

The checked-in production lock pins the exact four behaviorally qualified and promoted Relay versions. Manual file changes fail `npm run verify`; changes in production discovery fail `npm run verify:live`.

## Direct MCP setup

Claude Code:

```sh
claude mcp add --transport http relay-skills https://relay.builtbyrose.co/mcp
```

Codex `config.toml`:

```toml
[mcp_servers.relay-skills]
url = "https://relay.builtbyrose.co/mcp"
auth = "oauth"
oauth_resource = "https://relay.builtbyrose.co/mcp"
scopes = ["relay.skills.read", "relay.skills.route", "relay.skills.activate"]
```

Claude's plugin uses HTTP transport with `oauth.scopes` encoded as the required single space-separated scope string in `plugins/relay-skills/.claude-mcp.json`.

## Trust and support

- Privacy: https://relay.builtbyrose.co/privacy
- Terms: https://relay.builtbyrose.co/terms
- Security: https://relay.builtbyrose.co/security
- Support: https://relay.builtbyrose.co/support

Public packages are promoted from Relay only after license, strict-format, immutable-version, static-security, exact-provenance, and behavioral-qualification gates pass. Publishing a newer Relay version does not advance the public pin. Organization and private skills remain accessible only through authenticated, scope-checked Relay tools.
