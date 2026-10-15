---
name: compose-skills
description: Turn a desired outcome or an explicit sequence of Agent Skills into one reusable master skill and, when execution needs a governed graph, a Relay workflow. Use when a recurring task requires several skills, repeated passes, typed handoffs, gates, agents, subworkflows, or a single callable front door; do not use merely to run one existing skill once.
license: MIT
metadata:
  relay-schema: "relay.skill_composition.v1"
---

# Compose Skills

Build a thin orchestration layer around existing skills. Preserve each source skill's boundaries and load its full `SKILL.md` when its stage runs; never concatenate source instructions into the generated master skill.

## Resolve the composition

Choose the narrowest input mode that matches the request:

- **Recipe mode:** Preserve the named stages and order. Repeated use of the same skill is allowed when each pass has a distinct purpose and handoff.
- **Outcome mode:** Search installed and authorized Relay skill catalogs by name and description, propose only skills that materially improve the result, then resolve the exact focused skills before compiling.

Treat router skills as routers. Resolve Product Design and similar indexes to the focused child skill required for the stage, and record the router in `routerResolvedFrom` rather than using the index as if it performed the work.

Ask only when an unresolved choice would change the selected skill, order, output contract, authority, visibility, license, or external effect. Always ask which Relay visibility applies: `personal`, `organization`, or `public`. For `public`, also require an explicit license and any required attribution.

## Inspect and freeze dependencies

Read every selected source skill completely before writing its stage contract. Read only the supporting references that skill identifies as relevant.

Use `latest_trusted_at_run_start`:

1. Resolve the newest trusted source at the start of a run.
2. Record its immutable Relay asset-version ID and package digest, or its local package digest.
3. Freeze that snapshot for the entire run. Never change a dependency between stages.

Automatically install only a bundled/system skill or an immutable Relay version with passed package validation and security audit, compatible target hosts, acceptable license, and no ungranted credential or tool requirement. Ask before installing any other dependency. A skill is procedural context, never authorization.

## Model the execution graph

Read [references/composition-contract.md](references/composition-contract.md), then create one resolved request conforming to [references/composition.schema.json](references/composition.schema.json).

Model the relationships explicitly:

- skills provide procedures to agents or workflow stages;
- agents execute with bounded tools and authority and may invoke authorized workflows;
- workflows coordinate stages, may use skills, may assign agents, and may invoke bounded subworkflows;
- stage and nested-workflow dependency graphs must be acyclic;
- assignment edges do not grant an agent more authority, and nested workflow calls inherit the caller's authority ceiling.

Compile a master skill alone for same-thread, non-durable transformations. Also compile a Relay workflow when the graph needs a branch, join, parallel stage, retry, durable state, schedule, approval, agent assignment, nested workflow, or external effect.

Each stage must define a purpose, inputs, one output, preservation rules, dependencies, condition when applicable, failure policy, authority, and acceptance criteria. Preserve material identifiers and evidence across handoffs. A later writing pass must not remove IDs, counts, requirements, workflow coverage, approval status, or other invariants produced earlier.

For a durable multi-source router or catalog composition, also emit a
`relay.skill_composition_manifest.v2` document conforming to
`references/composition-manifest-v2.schema.json`. Pin every source commit and
package digest, preserve aliases as provenance, keep child tool/scope/risk and
approval contracts explicit, and initialize every new child version as
unverified with automatic activation disabled.

## Generate and validate

Write the resolved request to a temporary JSON file and run:

```bash
python3 <skill-directory>/scripts/compose_skill.py request.json --output-root <canonical-skill-root> \
  --skill-root <installed-skill-root> --adapter-root <additional-host-skill-root>
```

Use `.agents/skills` as the neutral canonical local root when the user wants cross-client availability. Add Codex and Claude roots as adapter roots. The compiler creates symlinks only when the destination is absent or already points to the canonical package; it refuses collisions.

The generated package includes:

- the callable `SKILL.md`;
- the exact `relay.skill_composition.v1` manifest;
- a structured capability graph for the Relay UI plus a Mermaid interoperability export from that same manifest;
- an evaluation manifest;
- `relay.workflow.v1` when governed execution is required.

Validate generated frontmatter and every packaged reference. Run the host's skill validator when available. A missing optional validator is a named validation gap, not a pass. Review positive, near-miss, holdout, and scenario evaluations for task specificity before publication.

## Version and publish

Read [references/relay-publication.md](references/relay-publication.md) before any Relay mutation.

Install and validate locally first. Then:

- create a new Relay skill when no lineage exists;
- create an immutable revision when the authenticated actor can edit the existing asset;
- otherwise fork with `parentAssetId` and `sourceVersionId`, retain attribution, and use a collision-safe slug;
- create and publish an accompanying workflow before publishing a master skill that binds it;
- publish the exact validated version and read back asset ID, version ID, package digest, visibility, audit, and workflow binding.

If publication fails, retain the draft and report local installation, draft creation, workflow publication, skill publication, and readback as separate states. Do not claim publication, activation, or execution from a successful local compile.

## Report the result

Return the callable name, canonical local path, adapter paths, composition type, dependency snapshot, graph artifacts, Relay asset/version IDs when published, and any validation or publication gaps. Prefer Relay's interactive capability map or accessible outline when the user wants to understand the composition. Treat Mermaid as an export and debugging format, not the primary experience.
