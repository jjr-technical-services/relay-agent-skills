# Relay Skills

63 practical workflows for research, strategy, product design, marketing, sales, analytics, finance, fundraising, operations, engineering, and QA. Use the included skills immediately; connect a Relay account when you need authorized workspace assets and governed remote routing.

## Get started

Ask: **“Help me choose a Relay workflow and get started.”** Or bring a specific task:

- Research competitors and produce an evidence-based positioning comparison.
- Build a KPI tree, plan an experiment, or diagnose a conversion funnel.
- Design a product surface or build a conversion-focused landing page.
- Plan a fundraising campaign, draft a grant proposal, or prepare a funder report.
- Model unit economics, build a cash forecast, or review a sales forecast.
- Prepare a negotiation, a board meeting, or a new-hire onboarding plan.

The included `get-started-with-relay` skill routes to the appropriate workflow. Some workflows use research, coding, browser, or connected-data tools; availability depends on your host. When tools are unavailable, the workflow can work from supplied inputs where appropriate and states its limits.

## Install

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

Start a fresh session after installation. New installations should use `relay-skills`; the separate product and growth plugins retain their frozen compatibility workflows.

## Standalone workflows

From a repository checkout, use `node bin/relay-agent-skills.mjs`. After npm publication, the same commands are available through `npx relay-agent-skills`:

```sh
npx relay-agent-skills list
npx relay-agent-skills verify
npx relay-agent-skills install steel-design --host both --scope user
npx relay-agent-skills install write-grant-proposal --host codex --scope project
```

User installs target `~/.agents/skills` for Codex and `~/.claude/skills` for Claude Code. Project installs target `.agents/skills` and `.claude/skills`. Existing directories are preserved unless `--force` is explicit.

## Optional Relay connection

The bundled MCP endpoint is `https://relay.builtbyrose.co/mcp`. Complete OAuth consent when you want authorized workspace catalog matching, activation, or exact package-file retrieval. Its scopes are `offline_access`, `relay.skills.read`, `relay.skills.route`, and `relay.skills.activate`. Never paste or commit a bearer token.

Native bundled workflows and governed remote asset versions have independent version histories. `library-lock.json` pins every native file. `relay-lock.json` retains the original four promoted remote versions; live verification checks their immutable archives, qualification identities, and OAuth contract. A native package review does not create a remote behavioral qualification or advance a public catalog pointer.

## Validation

```sh
npm ci
npm run verify:release
npm run verify:live
npm run validate:hosts -- --release
npm test
npm run pack:dry-run
claude plugin validate . --strict
```

The complete workflow index ships in `plugins/relay-skills/skills/get-started-with-relay/references/workflows.md`. Each included skill retains its MIT license and supporting resources. The native lock records source commits and portability adaptations. Organization-private content and skills without redistribution evidence are excluded from the public bundle.

Relay is operated by JJR Technical Services LLC. [Privacy](https://relay.builtbyrose.co/privacy) · [Terms](https://relay.builtbyrose.co/terms) · [Security](https://relay.builtbyrose.co/security) · [Support](https://relay.builtbyrose.co/support).
