# Relay Skills

Relay Skills provides four native workflows for Claude Code and Codex, plus an OAuth-protected connection to the governed Relay skill catalog. Relay is operated by JJR Technical Services LLC.

## What you can do

- **Skill routing:** find and activate governed, immutable Relay skill versions.
- **KPI trees:** connect a strategic goal to causal metrics and an instrumentation plan.
- **Experiment design:** prepare a controlled-experiment brief with decision criteria.
- **Tactical negotiation:** prepare ethical negotiation strategies, calls, and messages.

The plugin bundles `relay-skill-router`, `kpi-tree`, `ab-test-setup`, and `negotiate-tactically`. Authorized catalog access is provided separately by the Relay MCP server.

## Install and connect in Claude Code

Add the marketplace and install the primary plugin:

```text
/plugin marketplace add jjr-technical-services/relay-agent-skills
/plugin install relay-skills@relay
```

Start a fresh session and confirm `relay-skills@relay` is enabled. Use the plugin's namespaced skills for the bundled workflows. To use catalog matching, activation, and immutable file retrieval, complete Relay sign-in and OAuth consent when the host requests it. The connection uses HTTP at https://relay.builtbyrose.co/mcp and requests `relay.skills.read`, `relay.skills.route`, and `relay.skills.activate`. Do not paste or commit bearer tokens.

New installations should use `relay-skills`; the separate product and growth plugins are frozen compatibility distributions.

## Privacy and data handling

Bundled skill files are installed on your machine and used by your selected host. Requests made to the Relay MCP server send the tool inputs to Relay for processing. Review inputs before invoking a remote tool, especially when they contain organization or client information. Catalog access requires the permissions granted by your Relay account and OAuth consent; installing this plugin does not grant access to another organization's private skills.

Review Relay's [privacy policy](https://relay.builtbyrose.co/privacy), [terms](https://relay.builtbyrose.co/terms), and [security information](https://relay.builtbyrose.co/security) for service details. Your host's own terms and data handling also apply.

## Support and limitations

For help with Relay sign-in, consent, or catalog access, use [Relay support](https://relay.builtbyrose.co/support). Report plugin installation issues in the [repository issue tracker](https://github.com/jjr-technical-services/relay-agent-skills/issues), without credentials or confidential content.

This is the v0.2.1 corrective candidate. The repository's RELEASE_STATUS.md records publication and OAuth UAT gates separately; this README does not establish that those gates passed or that Anthropic approved a directory listing. Component availability differs across Claude Code, claude.ai, and Cowork; check the host's supported components before relying on a workflow there.

Private voice-agent workflows and daily meeting preparation are not bundled. Published skill versions and provenance are pinned rather than silently advanced to new catalog versions. Plugin tooling is MIT licensed; each bundled skill includes its own license file.
