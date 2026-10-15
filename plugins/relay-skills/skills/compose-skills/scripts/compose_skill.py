#!/usr/bin/env python3
"""Compile a resolved skill composition into a portable Agent Skills package."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
from typing import Any


SCHEMA_VERSION = "relay.skill_composition.v1"
VISUALIZATION_VERSION = "relay.capability_graph_visualization.v1"
WORKFLOW_VERSION = "relay.workflow.v1"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ALLOWED_VISIBILITY = {"personal", "organization", "public"}
ALLOWED_MODES = {"recipe", "outcome"}
ALLOWED_FAILURE_MODES = {"stop", "retry", "continue"}
TRUSTED_STATUSES = {"trusted", "approved"}
MIT_LICENSE = """MIT License

Copyright (c) 2026 {owner}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""


class CompositionError(ValueError):
    pass


def fail(message: str) -> None:
    raise CompositionError(message)


def text(value: Any, field: str) -> str:
    result = str(value or "").strip()
    if not result:
        fail(f"{field} is required")
    return result


def string_list(value: Any, field: str) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list) or any(not isinstance(item, str) or not item.strip() for item in value):
        fail(f"{field} must be an array of non-empty strings")
    return [item.strip() for item in value]


def safe_slug(value: Any, field: str = "slug") -> str:
    result = text(value, field)
    if len(result) > 64 or not SLUG_RE.fullmatch(result):
        fail(f"{field} must be a lowercase Agent Skills slug with at most 64 characters")
    return result


def read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"Could not read request JSON: {exc}")
    if not isinstance(value, dict):
        fail("The composition request must be a JSON object")
    return value


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def frontmatter_name(skill_file: Path) -> str:
    source = skill_file.read_text(encoding="utf-8")
    if not source.startswith("---\n"):
        fail(f"{skill_file} has no YAML frontmatter")
    closing = source.find("\n---", 4)
    if closing < 0:
        fail(f"{skill_file} has unterminated YAML frontmatter")
    for line in source[4:closing].splitlines():
        if line.startswith("name:"):
            return line.split(":", 1)[1].strip().strip('"\'')
    fail(f"{skill_file} has no frontmatter name")
    return ""


def package_digest(package_dir: Path) -> str:
    if not package_dir.is_dir() or not (package_dir / "SKILL.md").is_file():
        fail(f"Skill package is missing SKILL.md: {package_dir}")
    digest = hashlib.sha256()
    files = sorted(path for path in package_dir.rglob("*") if path.is_file() and not path.is_symlink())
    for path in files:
        relative = path.relative_to(package_dir).as_posix().encode("utf-8")
        content = path.read_bytes()
        digest.update(len(relative).to_bytes(4, "big"))
        digest.update(relative)
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return f"sha256:{digest.hexdigest()}"


def skill_candidates(name: str, roots: list[Path]) -> list[Path]:
    candidates: list[Path] = []
    for root in roots:
        direct = root / name
        if (direct / "SKILL.md").is_file():
            candidates.append(direct.resolve())
            continue
        if not root.is_dir():
            continue
        for child in sorted(root.iterdir()):
            skill_file = child / "SKILL.md"
            if child.is_dir() and skill_file.is_file() and frontmatter_name(skill_file) == name:
                candidates.append(child.resolve())
    return list(dict.fromkeys(candidates))


def resolve_skill(skill: dict[str, Any], roots: list[Path], trusted_roots: list[Path]) -> dict[str, Any]:
    name = safe_slug(skill.get("name"), "skill.name")
    source_type = str(skill.get("sourceType") or "local").strip()
    trust = dict(skill.get("trust") or {})

    if source_type == "relay":
        asset_id = text(skill.get("assetId"), f"Relay skill {name} assetId")
        version_id = text(skill.get("assetVersionId"), f"Relay skill {name} assetVersionId")
        digest = text(skill.get("packageDigest"), f"Relay skill {name} packageDigest")
        required_evidence = {
            "packageValidation": "passed",
            "securityAudit": "passed",
            "compatibility": "passed",
            "license": "passed",
        }
        missing = [key for key, expected in required_evidence.items() if trust.get(key) != expected]
        if missing:
            fail(f"Relay skill {name} is missing trusted readback: {', '.join(missing)}")
        return {
            **skill,
            "name": name,
            "sourceType": "relay",
            "assetId": asset_id,
            "assetVersionId": version_id,
            "packageDigest": digest,
            "trust": {**trust, "status": "trusted"},
        }

    requested_path = skill.get("path")
    if requested_path:
        candidates = [Path(str(requested_path)).expanduser().resolve()]
    else:
        candidates = skill_candidates(name, roots)
    if not candidates:
        fail(f"Installed skill not found: {name}")

    resolved: list[tuple[Path, str]] = []
    for candidate in candidates:
        declared = frontmatter_name(candidate / "SKILL.md")
        if declared != name:
            fail(f"Skill path {candidate} declares {declared}, expected {name}")
        resolved.append((candidate, package_digest(candidate)))
    distinct = {digest for _, digest in resolved}
    if len(distinct) > 1:
        paths = ", ".join(str(path) for path, _ in resolved)
        fail(f"Installed skill {name} has divergent packages; select an authoritative path: {paths}")

    selected_path, digest = resolved[0]
    trusted_by_root = any(within(selected_path, root) for root in trusted_roots)
    trust_status = str(trust.get("status") or "").strip()
    if not trusted_by_root and trust_status not in TRUSTED_STATUSES:
        fail(f"Local skill {name} is not under a trusted root and has no approved trust decision")
    return {
        **skill,
        "name": name,
        "sourceType": source_type if source_type in {"bundled", "system", "local"} else "local",
        "path": str(selected_path),
        "packageDigest": digest,
        "trust": {
            **trust,
            "status": "trusted" if trusted_by_root else trust_status,
            "evidence": "trusted_skill_root" if trusted_by_root else trust.get("evidence", "explicit_approval"),
        },
    }


def default_dependencies(stages: list[dict[str, Any]], index: int) -> list[str]:
    if "dependsOn" in stages[index]:
        return string_list(stages[index].get("dependsOn"), f"stages[{index}].dependsOn")
    return [] if index == 0 else [text(stages[index - 1].get("id"), f"stages[{index - 1}].id")]


def normalize_stage(stage: dict[str, Any], index: int, stages: list[dict[str, Any]], roots: list[Path], trusted_roots: list[Path]) -> dict[str, Any]:
    if not isinstance(stage, dict):
        fail(f"stages[{index}] must be an object")
    stage_id = safe_slug(stage.get("id"), f"stages[{index}].id")
    output = stage.get("output")
    if not isinstance(output, dict):
        fail(f"stages[{index}].output must be an object")
    failure = dict(stage.get("failurePolicy") or {"mode": "stop", "maxAttempts": 1})
    failure_mode = str(failure.get("mode") or "stop").strip()
    if failure_mode not in ALLOWED_FAILURE_MODES:
        fail(f"stages[{index}].failurePolicy.mode is unsupported")
    max_attempts = int(failure.get("maxAttempts") or 1)
    if max_attempts < 1 or max_attempts > 5:
        fail(f"stages[{index}].failurePolicy.maxAttempts must be between 1 and 5")
    if failure_mode != "retry" and max_attempts != 1:
        fail(f"stages[{index}] may use multiple attempts only with retry mode")

    authority = dict(stage.get("authority") or {})
    normalized = {
        **stage,
        "id": stage_id,
        "label": text(stage.get("label"), f"stages[{index}].label"),
        "purpose": text(stage.get("purpose"), f"stages[{index}].purpose"),
        "skill": resolve_skill(dict(stage.get("skill") or {}), roots, trusted_roots),
        "inputs": string_list(stage.get("inputs"), f"stages[{index}].inputs"),
        "output": {
            "name": text(output.get("name"), f"stages[{index}].output.name"),
            "type": text(output.get("type"), f"stages[{index}].output.type"),
            "description": text(output.get("description"), f"stages[{index}].output.description"),
        },
        "acceptanceCriteria": string_list(stage.get("acceptanceCriteria"), f"stages[{index}].acceptanceCriteria"),
        "preserve": string_list(stage.get("preserve"), f"stages[{index}].preserve"),
        "dependsOn": default_dependencies(stages, index),
        "failurePolicy": {**failure, "mode": failure_mode, "maxAttempts": max_attempts},
        "authority": {
            "allowed": string_list(authority.get("allowed"), f"stages[{index}].authority.allowed"),
            "prohibited": string_list(authority.get("prohibited"), f"stages[{index}].authority.prohibited"),
            "requiresApproval": string_list(authority.get("requiresApproval"), f"stages[{index}].authority.requiresApproval"),
        },
        "externalEffects": string_list(stage.get("externalEffects"), f"stages[{index}].externalEffects"),
        "durable": bool(stage.get("durable", False)),
        "scheduled": bool(stage.get("scheduled", False)),
        "parallel": bool(stage.get("parallel", False)),
    }
    if normalized.get("condition") and not normalized["dependsOn"]:
        fail(f"Conditional stage {stage_id} must depend on an earlier stage")
    if not normalized["acceptanceCriteria"]:
        fail(f"stages[{index}].acceptanceCriteria must include at least one criterion")
    return normalized


def assert_acyclic(nodes: list[str], dependency_map: dict[str, list[str]], label: str) -> None:
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        if node in visiting:
            fail(f"{label} contains a recursive cycle at {node}")
        if node in visited:
            return
        visiting.add(node)
        for dependency in dependency_map.get(node, []):
            visit(dependency)
        visiting.remove(node)
        visited.add(node)

    for node in nodes:
        visit(node)


def normalize_resources(resources: Any, stages: list[dict[str, Any]], generated_slug: str) -> dict[str, Any]:
    value = dict(resources or {})
    agents = value.get("agents") or []
    workflows = value.get("workflows") or []
    if not isinstance(agents, list) or not isinstance(workflows, list):
        fail("resources.agents and resources.workflows must be arrays")
    normalized_agents: list[dict[str, Any]] = []
    normalized_workflows: list[dict[str, Any]] = []
    agent_ids: set[str] = set()
    workflow_ids: set[str] = set()
    selected_skills = {stage["skill"]["name"] for stage in stages}

    for index, agent in enumerate(agents):
        if not isinstance(agent, dict):
            fail(f"resources.agents[{index}] must be an object")
        agent_id = safe_slug(agent.get("id"), f"resources.agents[{index}].id")
        if agent_id in agent_ids:
            fail(f"Duplicate agent resource id: {agent_id}")
        agent_ids.add(agent_id)
        normalized_agents.append({
            **agent,
            "id": agent_id,
            "name": text(agent.get("name"), f"resources.agents[{index}].name"),
            "skills": string_list(agent.get("skills"), f"resources.agents[{index}].skills"),
            "workflows": string_list(agent.get("workflows"), f"resources.agents[{index}].workflows"),
        })

    for index, workflow in enumerate(workflows):
        if not isinstance(workflow, dict):
            fail(f"resources.workflows[{index}] must be an object")
        workflow_id = safe_slug(workflow.get("id"), f"resources.workflows[{index}].id")
        if workflow_id == generated_slug:
            fail(f"Nested workflow {workflow_id} cannot invoke or redefine the generated workflow")
        if workflow_id in workflow_ids:
            fail(f"Duplicate workflow resource id: {workflow_id}")
        workflow_ids.add(workflow_id)
        normalized_workflows.append({
            **workflow,
            "id": workflow_id,
            "name": text(workflow.get("name"), f"resources.workflows[{index}].name"),
            "skills": string_list(workflow.get("skills"), f"resources.workflows[{index}].skills"),
            "agents": string_list(workflow.get("agents"), f"resources.workflows[{index}].agents"),
            "workflows": string_list(workflow.get("workflows"), f"resources.workflows[{index}].workflows"),
        })

    for agent in normalized_agents:
        unknown_skills = set(agent["skills"]) - selected_skills
        unknown_workflows = set(agent["workflows"]) - workflow_ids
        if unknown_skills:
            fail(f"Agent {agent['id']} references unbound skills: {', '.join(sorted(unknown_skills))}")
        if unknown_workflows:
            fail(f"Agent {agent['id']} references unknown workflows: {', '.join(sorted(unknown_workflows))}")
    for workflow in normalized_workflows:
        unknown_skills = set(workflow["skills"]) - selected_skills
        unknown_agents = set(workflow["agents"]) - agent_ids
        unknown_workflows = set(workflow["workflows"]) - workflow_ids
        if unknown_skills:
            fail(f"Workflow {workflow['id']} references unbound skills: {', '.join(sorted(unknown_skills))}")
        if unknown_agents:
            fail(f"Workflow {workflow['id']} references unknown agents: {', '.join(sorted(unknown_agents))}")
        if unknown_workflows:
            fail(f"Workflow {workflow['id']} references unknown workflows: {', '.join(sorted(unknown_workflows))}")

    assert_acyclic(
        sorted(workflow_ids),
        {workflow["id"]: workflow["workflows"] for workflow in normalized_workflows},
        "Nested workflow graph",
    )
    for stage in stages:
        if stage.get("agentId") and stage["agentId"] not in agent_ids:
            fail(f"Stage {stage['id']} references unknown agent {stage['agentId']}")
        if stage.get("workflowId") and stage["workflowId"] not in workflow_ids:
            fail(f"Stage {stage['id']} references unknown workflow {stage['workflowId']}")
    return {"agents": normalized_agents, "workflows": normalized_workflows}


def validate_lineage(value: Any) -> dict[str, Any]:
    lineage = dict(value or {"action": "create"})
    action = str(lineage.get("action") or "create")
    if action not in {"create", "revision", "fork"}:
        fail("lineage.action must be create, revision, or fork")
    if action == "revision":
        text(lineage.get("assetId"), "lineage.assetId")
        text(lineage.get("assetVersionId"), "lineage.assetVersionId")
    if action == "fork":
        text(lineage.get("parentAssetId"), "lineage.parentAssetId")
        text(lineage.get("sourceVersionId"), "lineage.sourceVersionId")
    return {**lineage, "action": action}


def is_linear(stages: list[dict[str, Any]]) -> bool:
    for index, stage in enumerate(stages):
        expected = [] if index == 0 else [stages[index - 1]["id"]]
        if stage["dependsOn"] != expected:
            return False
    return True


def composition_type(stages: list[dict[str, Any]], resources: dict[str, Any]) -> tuple[str, list[str]]:
    reasons: list[str] = []
    if not is_linear(stages):
        reasons.append("branch_join_or_parallel_graph")
    for stage in stages:
        if stage.get("condition"):
            reasons.append("conditional_stage")
        if stage.get("gate") or stage["authority"]["requiresApproval"]:
            reasons.append("approval_or_gate")
        if stage["failurePolicy"]["mode"] == "retry":
            reasons.append("bounded_retry")
        if stage["durable"]:
            reasons.append("durable_state")
        if stage["scheduled"]:
            reasons.append("schedule")
        if stage["parallel"]:
            reasons.append("parallel_stage")
        if stage["externalEffects"]:
            reasons.append("external_effect")
        if stage.get("agentId"):
            reasons.append("agent_assignment")
        if stage.get("workflowId"):
            reasons.append("nested_workflow")
    if resources["agents"]:
        reasons.append("agent_capability_graph")
    if resources["workflows"]:
        reasons.append("workflow_capability_graph")
    unique = list(dict.fromkeys(reasons))
    return ("workflow" if unique else "skill", unique)


def normalize_request(request: dict[str, Any], roots: list[Path], trusted_roots: list[Path]) -> dict[str, Any]:
    if request.get("schemaVersion") != SCHEMA_VERSION:
        fail(f"schemaVersion must be {SCHEMA_VERSION}")
    slug = safe_slug(request.get("slug"))
    mode = str(request.get("mode") or "").strip()
    visibility = str(request.get("visibility") or "").strip()
    if mode not in ALLOWED_MODES:
        fail("mode must be recipe or outcome")
    if visibility not in ALLOWED_VISIBILITY:
        fail("visibility must be personal, organization, or public")
    license_name = str(request.get("license") or "").strip()
    if visibility == "public" and not license_name:
        fail("Public compositions require an explicit license")
    raw_stages = request.get("stages")
    if not isinstance(raw_stages, list) or not raw_stages:
        fail("stages must include at least one stage")
    stages = [normalize_stage(stage, index, raw_stages, roots, trusted_roots) for index, stage in enumerate(raw_stages)]
    stage_ids = [stage["id"] for stage in stages]
    if len(stage_ids) != len(set(stage_ids)):
        fail("Stage IDs must be unique")
    known_ids = set(stage_ids)
    for stage in stages:
        unknown = set(stage["dependsOn"]) - known_ids
        if unknown:
            fail(f"Stage {stage['id']} references unknown dependencies: {', '.join(sorted(unknown))}")
        if stage["id"] in stage["dependsOn"]:
            fail(f"Stage {stage['id']} cannot depend on itself")
    assert_acyclic(stage_ids, {stage["id"]: stage["dependsOn"] for stage in stages}, "Stage graph")
    resources = normalize_resources(request.get("resources"), stages, slug)
    output_type, reasons = composition_type(stages, resources)
    edges = [
        {
            "id": f"{dependency}-{stage['id']}",
            "source": dependency,
            "target": stage["id"],
            **({"condition": stage["condition"]} if stage.get("condition") else {}),
        }
        for stage in stages
        for dependency in stage["dependsOn"]
    ]
    return {
        **request,
        "schemaVersion": SCHEMA_VERSION,
        "name": text(request.get("name"), "name"),
        "slug": slug,
        "description": text(request.get("description"), "description"),
        "mode": mode,
        "visibility": visibility,
        "license": license_name or "Proprietary",
        "implicitInvocation": request.get("implicitInvocation", True) is not False,
        "dependencyPolicy": "latest_trusted_at_run_start",
        "compositionType": output_type,
        "workflowReasons": reasons,
        "stages": stages,
        "edges": edges,
        "resources": resources,
        "lineage": validate_lineage(request.get("lineage")),
        "initialDependencySnapshot": [
            {
                "stageId": stage["id"],
                "skill": stage["skill"]["name"],
                "sourceType": stage["skill"]["sourceType"],
                "packageDigest": stage["skill"]["packageDigest"],
                **({"assetId": stage["skill"]["assetId"]} if stage["skill"].get("assetId") else {}),
                **({"assetVersionId": stage["skill"]["assetVersionId"]} if stage["skill"].get("assetVersionId") else {}),
            }
            for stage in stages
        ],
    }


def node_id(kind: str, value: str) -> str:
    return f"{kind}:{value}"


def build_visualization(manifest: dict[str, Any]) -> dict[str, Any]:
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    stages = manifest["stages"]
    root_type = "workflow" if manifest["compositionType"] == "workflow" else "master_skill"
    root_id = node_id(root_type, manifest["slug"])
    nodes.append({
        "id": root_id,
        "type": root_type,
        "position": {"x": 0, "y": 0},
        "data": {"label": manifest["name"], "compositionType": manifest["compositionType"]},
    })
    depths: dict[str, int] = {}
    for stage in stages:
        depths[stage["id"]] = max([depths.get(dep, 0) + 1 for dep in stage["dependsOn"]] or [0])
    rows: dict[int, int] = {}
    skill_nodes: set[str] = set()
    for stage in stages:
        depth = depths[stage["id"]]
        row = rows.get(depth, 0)
        rows[depth] = row + 1
        sid = node_id("stage", stage["id"])
        nodes.append({
            "id": sid,
            "type": "stage",
            "position": {"x": 420 + depth * 520, "y": row * 220},
            "data": {
                "label": stage["label"],
                "purpose": stage["purpose"],
                "output": stage["output"],
                "condition": stage.get("condition"),
                "gate": stage.get("gate"),
            },
        })
        skill_id = node_id("skill", stage["skill"]["name"])
        if skill_id not in skill_nodes:
            skill_nodes.add(skill_id)
            nodes.append({
                "id": skill_id,
                "type": "skill",
                "position": {"x": 420 + depth * 520, "y": -180 - len(skill_nodes) * 90},
                "data": {"label": stage["skill"]["name"], "packageDigest": stage["skill"]["packageDigest"]},
            })
        edges.append({
            "id": f"uses:{stage['id']}:{stage['skill']['name']}",
            "source": skill_id,
            "target": sid,
            "type": "uses_skill",
            "data": {"label": "uses"},
        })
        if stage.get("gate") or stage["authority"]["requiresApproval"]:
            gate_id = node_id("gate", stage["id"])
            nodes.append({
                "id": gate_id,
                "type": "gate",
                "position": {"x": 680 + depth * 520, "y": row * 220 + 90},
                "data": {"label": str((stage.get("gate") or {}).get("label") or "Approval gate")},
            })
            edges.append({
                "id": f"gate:{stage['id']}",
                "source": sid,
                "target": gate_id,
                "type": "gate",
                "data": {"label": "requires"},
            })
    for edge in manifest["edges"]:
        edges.append({
            "id": f"dependency:{edge['id']}",
            "source": node_id("stage", edge["source"]),
            "target": node_id("stage", edge["target"]),
            "type": "condition" if edge.get("condition") else "dependency",
            "data": {"label": edge.get("condition") or "handoff"},
        })
    for stage in stages:
        if not stage["dependsOn"]:
            edges.append({
                "id": f"orchestrates:{stage['id']}",
                "source": root_id,
                "target": node_id("stage", stage["id"]),
                "type": "orchestrates",
                "data": {"label": "starts with"},
            })

    agents = manifest["resources"]["agents"]
    workflows = manifest["resources"]["workflows"]
    for index, agent in enumerate(agents):
        aid = node_id("agent", agent["id"])
        nodes.append({"id": aid, "type": "agent", "position": {"x": 0, "y": 300 + index * 180}, "data": {"label": agent["name"]}})
        for skill in agent["skills"]:
            edges.append({"id": f"agent-skill:{agent['id']}:{skill}", "source": aid, "target": node_id("skill", skill), "type": "can_use", "data": {"label": "can use"}})
        for workflow in agent["workflows"]:
            edges.append({"id": f"agent-workflow:{agent['id']}:{workflow}", "source": aid, "target": node_id("workflow", workflow), "type": "can_invoke", "data": {"label": "can invoke"}})
    for index, workflow in enumerate(workflows):
        wid = node_id("workflow", workflow["id"])
        nodes.append({"id": wid, "type": "workflow", "position": {"x": 220, "y": 300 + index * 180}, "data": {"label": workflow["name"], "assetId": workflow.get("assetId"), "assetVersionId": workflow.get("assetVersionId")}})
        for skill in workflow["skills"]:
            edges.append({"id": f"workflow-skill:{workflow['id']}:{skill}", "source": wid, "target": node_id("skill", skill), "type": "uses_skill", "data": {"label": "uses"}})
        for agent in workflow["agents"]:
            edges.append({"id": f"workflow-agent:{workflow['id']}:{agent}", "source": wid, "target": node_id("agent", agent), "type": "assigns", "data": {"label": "assigns"}})
        for nested in workflow["workflows"]:
            edges.append({"id": f"workflow-workflow:{workflow['id']}:{nested}", "source": wid, "target": node_id("workflow", nested), "type": "invokes", "data": {"label": "invokes"}})
    for stage in stages:
        if stage.get("agentId"):
            edges.append({"id": f"stage-agent:{stage['id']}:{stage['agentId']}", "source": node_id("agent", stage["agentId"]), "target": node_id("stage", stage["id"]), "type": "executes", "data": {"label": "executes"}})
        if stage.get("workflowId"):
            edges.append({"id": f"stage-workflow:{stage['id']}:{stage['workflowId']}", "source": node_id("stage", stage["id"]), "target": node_id("workflow", stage["workflowId"]), "type": "invokes", "data": {"label": "invokes"}})
    return {"schemaVersion": VISUALIZATION_VERSION, "sourceSchemaVersion": SCHEMA_VERSION, "nodes": nodes, "edges": edges}


def mermaid_id(value: str) -> str:
    return "n_" + re.sub(r"[^a-zA-Z0-9_]", "_", value)


def mermaid_label(value: Any) -> str:
    return str(value or "").replace('"', "'").replace("[", "(").replace("]", ")")


def build_mermaid(visualization: dict[str, Any]) -> str:
    lines = ["flowchart LR"]
    shapes = {
        "master_skill": ('[["', '"]]'),
        "skill": ('(["', '"])'),
        "stage": ('["', '"]'),
        "agent": ('{{"', '"}}'),
        "workflow": ('[["', '"]]'),
        "gate": ('{"', '"}'),
    }
    for node in visualization["nodes"]:
        opening, closing = shapes.get(node["type"], ('["', '"]'))
        lines.append(f"  {mermaid_id(node['id'])}{opening}{mermaid_label(node['data'].get('label'))}{closing}")
    for edge in visualization["edges"]:
        label = mermaid_label(edge.get("data", {}).get("label"))
        lines.append(f"  {mermaid_id(edge['source'])} -->|{label}| {mermaid_id(edge['target'])}")
    return "\n".join(lines) + "\n"


def workflow_definition(manifest: dict[str, Any]) -> dict[str, Any]:
    tasks = []
    for stage in manifest["stages"]:
        resource_refs: list[dict[str, Any]] = [{
            "type": "skill",
            "id": stage["skill"]["name"],
            **({"assetId": stage["skill"]["assetId"]} if stage["skill"].get("assetId") else {}),
            **({"assetVersionId": stage["skill"]["assetVersionId"]} if stage["skill"].get("assetVersionId") else {}),
            "packageDigest": stage["skill"]["packageDigest"],
        }]
        recommended_mode = "ai_prompt"
        if stage.get("agentId"):
            resource_refs.append({"type": "agent", "id": stage["agentId"]})
            recommended_mode = "ai_agent"
        if stage.get("workflowId"):
            resource_refs.append({"type": "workflow", "id": stage["workflowId"]})
            recommended_mode = "ai_workflow"
        tasks.append({
            "id": stage["id"],
            "label": stage["label"],
            "description": stage["purpose"],
            "decomposition": {
                "objective": stage["purpose"],
                "inputs": stage["inputs"],
                "output": stage["output"],
                "acceptanceCriteria": stage["acceptanceCriteria"],
                "dependencies": stage["dependsOn"],
                "decisionRights": stage["authority"]["requiresApproval"],
                "sideEffects": stage["externalEffects"],
                "evidenceRequirements": stage["preserve"],
            },
            "resources": {"resourceRefs": resource_refs},
            "recommendedMode": recommended_mode,
            "selectableModes": list(dict.fromkeys([recommended_mode, "human", "hybrid"])),
            "execution": {"maxAttempts": stage["failurePolicy"]["maxAttempts"]},
            "condition": stage.get("condition"),
            "gate": stage.get("gate"),
            "authority": stage["authority"],
            "signals": {
                "materialExternalEffect": bool(stage["externalEffects"]),
                "materialStakeholderJudgment": bool(stage.get("gate") or stage["authority"]["requiresApproval"]),
                "difficultToDetectErrors": bool(stage["preserve"]),
                "provenCapability": False,
            },
        })
    return {
        "schemaVersion": WORKFLOW_VERSION,
        "name": manifest["name"],
        "description": manifest["description"],
        "deliverable": manifest["stages"][-1]["output"],
        "tasks": tasks,
        "edges": manifest["edges"],
        "metadata": {
            "compositionSchemaVersion": SCHEMA_VERSION,
            "compositionSlug": manifest["slug"],
            "dependencyPolicy": manifest["dependencyPolicy"],
        },
    }


def generated_skill_markdown(manifest: dict[str, Any]) -> str:
    description = json.dumps(manifest["description"])
    license_name = json.dumps(manifest["license"])
    workflow_line = "Execute the stage graph directly in this thread."
    if manifest["compositionType"] == "workflow":
        workflow_line = "Execute through the exact published Relay workflow binding when available; otherwise stop and report that governed execution is unavailable."
    stage_lines = []
    for index, stage in enumerate(manifest["stages"], start=1):
        dependencies = ", ".join(stage["dependsOn"]) or "none"
        preserves = "; ".join(stage["preserve"]) or "the complete prior handoff"
        stage_lines.extend([
            f"### {index}. {stage['label']} (`{stage['id']}`)",
            "",
            f"Load and follow `${stage['skill']['name']}` for this stage. Purpose: {stage['purpose']}",
            f"Dependencies: {dependencies}. Output: {stage['output']['name']} (`{stage['output']['type']}`).",
            f"Preserve: {preserves}.",
            "",
        ])
    implicit = "true" if manifest["implicitInvocation"] else "false"
    return "\n".join([
        "---",
        f"name: {manifest['slug']}",
        f"description: {description}",
        f"license: {license_name}",
        "metadata:",
        f"  relay-composition-schema: \"{SCHEMA_VERSION}\"",
        f"  relay-composition-type: \"{manifest['compositionType']}\"",
        "---",
        "",
        f"# {manifest['name']}",
        "",
        "Resolve the latest trusted dependencies at run start, record their exact version IDs or package digests, and freeze that snapshot for the run. Read every selected skill's complete `SKILL.md` before its stage. Skills provide procedure, not authority.",
        "",
        workflow_line,
        "",
        "Use `references/composition.json` as the execution contract. Preserve stage inputs, outputs, invariants, gates, and authority. Stop on dependency drift, missing trust evidence, an unmet gate, or a requested action outside the caller's authority.",
        "",
        "## Stages",
        "",
        *stage_lines,
        "## Graph",
        "",
        "Use `references/visualization.json` for Relay's interactive capability map and accessible outline. `references/graph.mmd` is an interoperability export, not the primary user experience. Both are derived from the composition manifest.",
        "",
        "## Invocation policy",
        "",
        f"Implicit invocation is `{implicit}`. Do not publish, schedule, activate, or execute an external mutation unless the user's current request authorizes that specific action.",
        "",
    ])


def generated_openai_yaml(manifest: dict[str, Any]) -> str:
    prompt = f"Use ${manifest['slug']} to {manifest['description'].rstrip('.').lower()}."
    return "\n".join([
        "interface:",
        f"  display_name: {json.dumps(manifest['name'])}",
        f"  short_description: {json.dumps(manifest['description'][:64])}",
        f"  default_prompt: {json.dumps(prompt)}",
        "policy:",
        f"  allow_implicit_invocation: {'true' if manifest['implicitInvocation'] else 'false'}",
        "",
    ])


def generated_evaluation(manifest: dict[str, Any]) -> dict[str, Any]:
    supplied = dict(manifest.get("evaluation") or {})
    final_output = manifest["stages"][-1]["output"]["name"]
    return {
        "schemaVersion": "relay.skill_eval_suite.v1",
        "triggers": {
            "positive": supplied.get("positive") or [{"id": "invoke-master-skill", "query": f"Use {manifest['name']} to {manifest['description'].rstrip('.').lower()}."}],
            "nearMiss": supplied.get("nearMiss") or [{"id": "run-one-source-skill", "query": f"Run only the first source skill once; do not create or use {manifest['name']}."}],
            "holdout": supplied.get("holdout") or [{"id": "equivalent-recurring-outcome", "query": f"Complete this recurring process and return {final_output}."}],
        },
        "scenarios": supplied.get("scenarios") or [{
            "id": "complete-composed-outcome",
            "task": f"Run {manifest['name']} from its required inputs through {final_output}, preserving every stage invariant and authority gate.",
            "baselineFailure": "A baseline may skip a stage, lose handoff invariants, or treat procedural context as authorization.",
            "runs": 1,
            "assertions": [
                {"id": "returns-final-output", "kind": "text_contains", "value": final_output},
                {"id": "preserves-authority", "kind": "text_contains", "value": "authority"},
            ],
        }],
    }


def write_package(package_dir: Path, manifest: dict[str, Any]) -> None:
    (package_dir / "agents").mkdir(parents=True)
    (package_dir / "references").mkdir(parents=True)
    (package_dir / "evals").mkdir(parents=True)
    (package_dir / "SKILL.md").write_text(generated_skill_markdown(manifest), encoding="utf-8")
    (package_dir / "agents" / "openai.yaml").write_text(generated_openai_yaml(manifest), encoding="utf-8")
    write_json(package_dir / "references" / "composition.json", manifest)
    visualization = build_visualization(manifest)
    write_json(package_dir / "references" / "visualization.json", visualization)
    (package_dir / "references" / "graph.mmd").write_text(build_mermaid(visualization), encoding="utf-8")
    write_json(package_dir / "evals" / "manifest.json", generated_evaluation(manifest))
    if manifest["compositionType"] == "workflow":
        write_json(package_dir / "references" / "workflow.json", workflow_definition(manifest))
    license_text = str(manifest.get("licenseText") or "").strip()
    if not license_text and manifest["license"].upper() == "MIT":
        license_text = MIT_LICENSE.format(owner=str(manifest.get("licenseOwner") or "Skill author"))
    if license_text:
        (package_dir / "LICENSE").write_text(license_text.rstrip() + "\n", encoding="utf-8")


def validate_adapter(adapter_root: Path, target: Path, slug: str) -> None:
    destination = adapter_root.expanduser().resolve() / slug
    if not destination.exists() and not destination.is_symlink():
        return
    if destination.is_symlink() and destination.resolve() == target.resolve():
        return
    fail(f"Host adapter collision at {destination}")


def install_adapters(adapter_roots: list[Path], target: Path, slug: str) -> list[str]:
    for root in adapter_roots:
        validate_adapter(root, target, slug)
    installed: list[str] = []
    for root in adapter_roots:
        expanded = root.expanduser().resolve()
        expanded.mkdir(parents=True, exist_ok=True)
        destination = expanded / slug
        if not destination.exists() and not destination.is_symlink():
            destination.symlink_to(target.resolve(), target_is_directory=True)
        installed.append(str(destination))
    return installed


def install_package(output_root: Path, manifest: dict[str, Any], expected_digest: str | None) -> tuple[Path, str, str | None]:
    output_root = output_root.expanduser().resolve()
    output_root.mkdir(parents=True, exist_ok=True)
    target = output_root / manifest["slug"]
    previous_path: str | None = None
    with tempfile.TemporaryDirectory(prefix=f".{manifest['slug']}-", dir=output_root) as temp:
        staged = Path(temp) / manifest["slug"]
        staged.mkdir()
        write_package(staged, manifest)
        staged_digest = package_digest(staged)
        if target.exists() or target.is_symlink():
            if target.is_symlink() or not target.is_dir():
                fail(f"Canonical package collision at {target}")
            current_digest = package_digest(target)
            if current_digest == staged_digest:
                return target, staged_digest, None
            if not expected_digest or current_digest != expected_digest:
                fail(f"Canonical package {target} diverged; expected digest authorization is required")
            backup = output_root / f".{manifest['slug']}.previous.{current_digest.split(':', 1)[1][:12]}"
            if backup.exists() or backup.is_symlink():
                fail(f"Recoverable predecessor path already exists: {backup}")
            target.rename(backup)
            previous_path = str(backup)
        staged.rename(target)
    return target, package_digest(target), previous_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request", type=Path, help="Resolved relay.skill_composition.v1 request JSON")
    parser.add_argument("--output-root", type=Path, required=True, help="Canonical Agent Skills root")
    parser.add_argument("--skill-root", type=Path, action="append", default=[], help="Installed skill root to search")
    parser.add_argument("--trusted-skill-root", type=Path, action="append", default=[], help="Installed root trusted for automatic resolution")
    parser.add_argument("--adapter-root", type=Path, action="append", default=[], help="Host skill root receiving a collision-safe symlink")
    parser.add_argument("--replace-if-digest", help="Allow a recoverable revision only when the current canonical package has this digest")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        request = read_json(args.request)
        roots = [root.expanduser().resolve() for root in args.skill_root]
        trusted_roots = [root.expanduser().resolve() for root in args.trusted_skill_root]
        manifest = normalize_request(request, roots, trusted_roots)
        target, digest, previous = install_package(args.output_root, manifest, args.replace_if_digest)
        adapters = install_adapters(args.adapter_root, target, manifest["slug"])
        result = {
            "ok": True,
            "schemaVersion": SCHEMA_VERSION,
            "compositionType": manifest["compositionType"],
            "canonicalPath": str(target),
            "packageDigest": digest,
            "previousPath": previous,
            "adapterPaths": adapters,
            "graphPath": str(target / "references" / "graph.mmd"),
            "visualizationPath": str(target / "references" / "visualization.json"),
            "workflowPath": str(target / "references" / "workflow.json") if manifest["compositionType"] == "workflow" else None,
            "lineage": manifest["lineage"],
        }
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except CompositionError as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, indent=2), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
