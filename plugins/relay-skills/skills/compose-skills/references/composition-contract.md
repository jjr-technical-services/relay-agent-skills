# Composition contract

Use this reference after the source skills have been selected and read.

## Resolved request

The compiler accepts JSON matching `composition.schema.json`. The important fields are:

- `mode`: `recipe` preserves the supplied stages; `outcome` records that the stages were selected from the requested result.
- `visibility`: always supplied by the user. Public packages also require `license`.
- `stages`: ordered definitions with stable IDs. A skill may appear in several stages.
- `resources`: optional agent and workflow capability declarations used by stages and graph visualization.
- `lineage`: the live Relay ownership decision: `create`, `revision`, or `fork`.
- `evaluation`: task-specific trigger and scenario language for the generated skill.

Every stage has:

- `skill.name` and either an installed `path` or immutable Relay identifiers;
- `purpose`, `inputs`, a single `output`, `acceptanceCriteria`, and `preserve`;
- `dependsOn`, plus `condition` when the edge is conditional;
- `failurePolicy.mode` of `stop`, `retry`, or `continue`, with a bounded `maxAttempts`;
- `authority.allowed`, `authority.prohibited`, and `authority.requiresApproval`;
- optional `agentId`, `workflowId`, durable/scheduled/parallel flags, gates, and external effects.

## Capability relationships

`resources.agents[].skills` lists procedures an agent may use. `resources.agents[].workflows` lists workflows it may invoke. `resources.workflows[].skills`, `.agents`, and `.workflows` describe a workflow's skill bindings, agent assignments, and nested calls.

These are capability edges, not grants. Runtime authorization and tool approval still apply. Reject direct self-invocation and cycles in nested workflow calls. Agent-to-workflow and workflow-to-agent edges may coexist because one means invocation and the other means assignment; they do not imply recursive execution by themselves.

## Skill or workflow

Compile only the master skill when all stages are same-thread, non-durable transformations with a linear dependency chain and no conditions, retries, approvals, agent assignments, nested workflows, scheduling, parallelism, or external effects.

Compile a Relay workflow when any of those properties is present. The callable master skill remains the front door and points to the exact published workflow version after publication.

## Dependency evidence

Local skills use a digest of every package file. Relay skills require `assetId`, `assetVersionId`, and `packageDigest`, plus trust evidence supplied from authoritative readback. Different installed copies of the same canonical skill with different digests are ambiguous; stop and ask which source is authoritative.

## Generated graphs

`references/visualization.json` drives Relay's interactive map, accessible outline, and inspector. `references/graph.mmd` is a portable interoperability export. Both are derived from `references/composition.json`; neither is an independent source of truth.
