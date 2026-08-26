# Claude Code marketplace release dossier

Status: gated v0.2.1 corrective-release draft. Relay v0.1.56 and the production lock are live; official-marketplace submission remains blocked on corrective dual-host OAuth UAT and a retained receipt.

Claude Code marketplaces are Git repositories containing `.claude-plugin/marketplace.json`; publishing this repository makes the marketplace installable without a separate central marketplace-review claim.

## Marketplace

- Repository: `rose-digital/relay-agent-skills`
- Marketplace: `relay`
- Primary plugin: `relay-skills` v0.2.1 with four bundled native workflows
- Compatibility plugins: frozen `relay-product-skills` v0.1.0 and `relay-growth-skills` v0.1.0, deprecated for this release
- Core MCP URL: https://relay.builtbyrose.co/mcp
- Authentication: Relay OAuth discovered from protected-resource and authorization-server metadata

## Release checks

1. Run `npm run verify:release`, `npm run verify:live`, and `claude plugin validate . --strict`.
2. Add the repository as a local marketplace and install all three plugins at local scope.
3. Confirm each plugin is enabled and its namespaced skill is visible.
4. Confirm the core plugin discovers Relay MCP, opens browser authentication, requests the three declared scopes, and completes PKCE.
5. Run one public-skill match and one organization-skill match.
6. Confirm a cross-organization decision ID and an approval-gated activation both fail closed.
7. Remove the local canary installs and marketplace registration.
8. Tag the exact qualified commit and publish the GitHub repository and self-hosted marketplace.
9. From a clean environment, add `rose-digital/relay-agent-skills`, install `relay-skills`, and repeat the MCP smoke.
10. Submit the released plugin through `https://claude.ai/settings/plugins/submit` or `https://platform.claude.com/plugins/submit` and retain the receipt.

## User commands after publication

```text
/plugin marketplace add rose-digital/relay-agent-skills
/plugin install relay-skills@relay
```

GitHub self-hosting, official Anthropic submission, official approval/listing, marketplace installation, Relay deployment, OAuth activation, and end-to-end UAT are separate claims. Preserve exact evidence for each and do not claim curated placement before acceptance.
