# Relay Agent Skills

Portable Agent Skills for Codex and Claude Code, plus an OAuth-protected Relay MCP connection for governed, organization-scoped skills.

Relay is operated by JJR Technical Services LLC. The tooling in this repository is MIT-licensed; each bundled skill carries its own license file.

## Install from the marketplace

Codex:

```sh
codex plugin marketplace add rose-digital/relay-agent-skills
codex plugin add relay-skills@relay
codex plugin add relay-product-skills@relay
codex plugin add relay-growth-skills@relay
```

Claude Code:

```text
/plugin marketplace add rose-digital/relay-agent-skills
/plugin install relay-skills@relay
/plugin install relay-product-skills@relay
/plugin install relay-growth-skills@relay
```

The core `relay-skills` plugin connects to `https://relay.builtbyrose.co/mcp`. The host discovers Relay's OAuth metadata, opens sign-in and consent, and requests only the declared skill scopes. Do not paste or commit a bearer token.

## Install standalone skills

Run from the repository or, after npm publication, through `npx relay-agent-skills`:

```sh
npx relay-agent-skills list
npx relay-agent-skills verify
npx relay-agent-skills install kpi-tree --host both --scope user
npx relay-agent-skills install ab-test-setup --host codex --scope project
```

User installs target `~/.agents/skills` for Codex and `~/.claude/skills` for Claude Code. Project installs target `.agents/skills` and `.claude/skills` under the selected project root. Existing skill directories are preserved unless `--force` is explicit.

## Bundled canaries

- `relay-skill-router`: matches and activates governed, immutable Relay skill versions through MCP.
- `kpi-tree`: turns strategic goals into causal metrics and an instrumentation plan.
- `ab-test-setup`: produces a decision-ready controlled-experiment brief.

## Direct MCP setup

Claude Code:

```sh
claude mcp add --transport http relay-skills https://relay.builtbyrose.co/mcp
```

Codex `config.toml`:

```toml
[mcp_servers.relay-skills]
url = "https://relay.builtbyrose.co/mcp"
oauth_resource = "https://relay.builtbyrose.co/mcp"
scopes = ["relay.skills.read", "relay.skills.route", "relay.skills.activate"]
```

## Trust and support

- Privacy: https://relay.builtbyrose.co/privacy
- Terms: https://relay.builtbyrose.co/terms
- Security: https://relay.builtbyrose.co/security
- Support: https://relay.builtbyrose.co/support

Public packages are promoted from Relay only after license, strict-format, immutable-version, and static-security gates pass. Organization and private skills remain accessible only through authenticated, scope-checked Relay tools.
