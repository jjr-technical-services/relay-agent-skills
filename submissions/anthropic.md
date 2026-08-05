# Claude Code marketplace release dossier

Status: locally qualified. GitHub publication remains gated on the Relay production MCP and OAuth release.

Claude Code marketplaces are Git repositories containing `.claude-plugin/marketplace.json`; publishing this repository makes the marketplace installable without a separate central marketplace-review claim.

## Marketplace

- Repository: `rose-digital/relay-agent-skills`
- Marketplace: `relay`
- Plugins: `relay-skills`, `relay-product-skills`, `relay-growth-skills`
- Core MCP URL: https://relay.builtbyrose.co/mcp
- Authentication: Relay OAuth discovered from protected-resource and authorization-server metadata

## Release checks

1. Run `claude plugin validate . --strict`.
2. Add the repository as a local marketplace and install all three plugins at local scope.
3. Confirm each plugin is enabled and its namespaced skill is visible.
4. Confirm the core plugin discovers Relay MCP, opens browser authentication, requests the three declared scopes, and completes PKCE.
5. Run one public-skill match and one organization-skill match.
6. Confirm a cross-organization decision ID and an approval-gated activation both fail closed.
7. Remove the local canary installs and marketplace registration.
8. Tag the exact qualified commit and publish the GitHub repository.
9. From a clean environment, add `rose-digital/relay-agent-skills`, install every plugin, and repeat the MCP smoke.

## User commands after publication

```text
/plugin marketplace add rose-digital/relay-agent-skills
/plugin install relay-skills@relay
/plugin install relay-product-skills@relay
/plugin install relay-growth-skills@relay
```

GitHub commit placement, marketplace installation, Relay deployment, OAuth activation, and end-to-end user acceptance are separate claims. Preserve the exact evidence for each.
