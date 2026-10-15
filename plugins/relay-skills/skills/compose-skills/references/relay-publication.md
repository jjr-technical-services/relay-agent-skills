# Relay publication

Read this only when the user has authorized Relay creation or publication.

## Resolve ownership and lineage

Use the authenticated Relay actor and current asset readback. Do not trust a local ownership label by itself.

- No matching asset: `create`.
- Matching asset editable by the current actor: `revision` using the current immutable version as predecessor.
- Matching asset not editable by the current actor: `fork` with `parentAssetId` and `sourceVersionId` and preserved attribution.

If a local package with the selected slug differs from the expected predecessor digest, preserve it and ask before replacement. Do not overwrite an unrelated host-specific package.

## Publication order

1. Compile to a temporary canonical root.
2. Validate the package, evaluations, dependency snapshot, and both graph views.
3. Install the canonical local package and collision-safe host adapters.
4. For a governed composition, create or version the workflow through the shared Relay asset API and publish its exact immutable version.
5. Regenerate the master package with the published workflow asset and version IDs, then validate again. Copy `references/composition.json` and `references/visualization.json` into the skill-version metadata as `composition` and `capabilityGraph`; the catalog UI renders the structured graph and never parses Mermaid.
6. Create, version, or fork the skill through the skill API.
7. Publish the exact validated skill version.
8. Read back the skill, workflow, versions, visibility, package digest, audit status, and bindings.

Never use direct database writes. Never convert the user's request to create a skill into authorization to deploy code, activate routing, install for an organization, schedule a run, execute the workflow, or make another external change.

## Failure states

Keep these states independent: generated, locally validated, installed, Relay draft created, workflow published, skill published, read back, activated, executed, and accepted.

If a create succeeds and publish fails, retain the draft and return its ID with the exact failure. Retry at most once after refreshing the authoritative asset state; do not weaken validation or license policy to force publication.
