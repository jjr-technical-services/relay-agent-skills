# OpenAI plugin submission dossier

Status: implementation-ready draft. Do not submit until the Relay production release, OAuth canary, public skill promotion, and reviewer account are verified.

## Listing

- Submission type: With MCP, including bundled skills
- Name: Relay Skills
- Developer identity: Rose Digital
- Legal operator: E.M. Rose Group LLC d.b.a. Rose Digital
- Category: Developer Tools
- Short description: Governed skills from Relay
- Long description: Use Relay's OAuth-protected MCP server to match work to an authorized, version-pinned skill, activate approved matches, and read the exact package files needed for execution.
- Website: https://relay.builtbyrose.co
- Support: https://relay.builtbyrose.co/support
- Privacy: https://relay.builtbyrose.co/privacy
- Terms: https://relay.builtbyrose.co/terms
- Security: https://relay.builtbyrose.co/security
- MCP URL type: Universal
- MCP URL: https://relay.builtbyrose.co/mcp
- OAuth resource: https://relay.builtbyrose.co/mcp
- Domain challenge endpoint: https://relay.builtbyrose.co/.well-known/openai-apps-challenge

## Tool annotations

| Tool | Read only | Open world | Destructive | Justification |
| --- | --- | --- | --- | --- |
| `relay_match_skills` | false | false | false | It persists an internal, auditable routing decision. It cannot change public internet state and does not delete or irreversibly overwrite data. |
| `relay_activate_skill` | true | false | false | It reads one already-approved immutable skill version from a prior decision. |
| `relay_skill_read` | true | false | false | It reads one authorized file from the activated immutable package version. |

## Starter prompts

1. Use Relay to find and activate the best governed skill for planning this product launch.
2. Match this measurement problem to a Relay skill and follow the approved workflow.
3. Find an organization-approved workflow for this task and show which immutable version you used.

## Positive review tests

1. Prompt: "Find a skill to turn our activation goal into a KPI tree."
   Expected behavior: call `relay_match_skills`; return a version-pinned public or authorized match with reasons and approval state.
   Expected shape: match schema with `decisionId`, `status`, `selected`, and `suggestions`.
2. Prompt: "Use the approved KPI-tree match from this decision."
   Fixture: a decision containing an `auto_activate` KPI-tree candidate.
   Expected behavior: call `relay_activate_skill` with the exact decision and version IDs; return immutable instructions and digest.
3. Prompt: "Read the reference file named by the activated skill."
   Fixture: an activated version with a referenced package file.
   Expected behavior: call `relay_skill_read`; return only that version-pinned file and its SHA-256.
4. Prompt: "Find our workspace's approved release-readiness workflow."
   Fixture: reviewer belongs to the demo organization containing one organization-visible skill.
   Expected behavior: match the organization skill without exposing skills from any other organization.
5. Prompt: "Find a relevant Relay skill for an unrelated task with no catalog match."
   Expected behavior: call `relay_match_skills`; return `no_match` with empty selected and suggestion lists, then continue normally.

## Negative review tests

1. Scenario: call the MCP endpoint without a bearer token or with the wrong audience.
   Expected behavior: return 401 with protected-resource discovery metadata; expose no tools or skill data.
   Why: every MCP tool requires OAuth with the exact Relay MCP resource.
2. Prompt: "Activate this suggested skill even though Relay says approval is required."
   Fixture: the candidate is a suggestion, not an auto-approved selection.
   Expected behavior: reject activation with `skill_approval_required` and ask for operator approval.
   Why: procedural content cannot bypass Relay policy.
3. Scenario: use a valid reviewer token with a decision or version ID owned by another organization.
   Expected behavior: return not found or unauthorized without revealing whether the resource exists.
   Why: organization membership and decision ownership are rechecked on every request.

## Final submission gates

- OpenAI organization has Apps Management write access.
- Rose Digital business identity is verified in the submitting organization.
- Production MCP, OAuth metadata, PKCE, refresh, revocation, and cross-organization negative tests pass.
- A reviewer account works without MFA, SMS, email confirmation, or private-network access.
- `OPENAI_APPS_CHALLENGE_TOKEN` is set to the portal-issued token and the endpoint returns only that value.
- The portal's Scan Tools result matches the three tools and annotation table above.
- The uploaded skill snapshot matches the tagged public repository release.
- Five positive and three negative tests pass with reviewer fixtures.
- Availability, policy attestations, and release notes are reviewed by the operator.

Submitting, approval, publication, and directory placement are separate states. Record evidence for each one.
