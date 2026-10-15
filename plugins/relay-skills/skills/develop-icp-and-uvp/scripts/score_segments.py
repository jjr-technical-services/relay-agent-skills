#!/usr/bin/env python3
"""Score ICP candidate segments with evidence-confidence adjustment."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


# Below this evidence confidence (percent) for every eligible segment, the
# confidence-adjusted scores all collapse toward zero and stop discriminating:
# the 2026-09-23 dogfood run put every segment in the "deprioritize" band.
# Rank on raw attractiveness instead and label the result a hypothesis.
DEFAULT_LOW_EVIDENCE_THRESHOLD = 40.0

DEFAULT_CRITERIA = [
    {"id": "problem_severity", "label": "Problem severity", "weight": 15},
    {"id": "trigger_urgency", "label": "Trigger and urgency", "weight": 10},
    {"id": "outcome_value", "label": "Outcome value", "weight": 15},
    {"id": "solution_fit", "label": "Solution fit", "weight": 15},
    {"id": "differentiation", "label": "Differentiation and winability", "weight": 10},
    {"id": "economic_viability", "label": "Economic viability", "weight": 10},
    {"id": "reachability", "label": "Reachability", "weight": 10},
    {"id": "retention_expansion", "label": "Retention and expansion", "weight": 10},
    {"id": "delivery_friction", "label": "Delivery feasibility", "weight": 5},
]


class InputError(ValueError):
    """Raised when the scorecard input does not satisfy the contract."""


def require_number(value: Any, field: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise InputError(f"{field} must be a number.")
    return float(value)


def load_payload(source: str) -> dict[str, Any]:
    try:
        raw = sys.stdin.read() if source == "-" else Path(source).read_text(encoding="utf-8")
    except OSError as error:
        raise InputError(f"Could not read {source}: {error}") from error
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        raise InputError(f"Invalid JSON: {error}") from error
    if not isinstance(payload, dict):
        raise InputError("Input must be a JSON object.")
    return payload


def validate_criteria(payload: dict[str, Any]) -> list[dict[str, Any]]:
    raw_criteria = payload.get("criteria") or DEFAULT_CRITERIA
    if not isinstance(raw_criteria, list) or not raw_criteria:
        raise InputError("criteria must be a non-empty array when provided.")

    criteria: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, item in enumerate(raw_criteria):
        if not isinstance(item, dict):
            raise InputError(f"criteria[{index}] must be an object.")
        criterion_id = str(item.get("id") or "").strip()
        label = str(item.get("label") or criterion_id).strip()
        if not criterion_id:
            raise InputError(f"criteria[{index}].id is required.")
        if criterion_id in seen:
            raise InputError(f"Duplicate criterion id: {criterion_id}.")
        if not label:
            raise InputError(f"criteria[{index}].label is required.")
        weight = require_number(item.get("weight"), f"criteria[{index}].weight")
        if weight <= 0:
            raise InputError(f"criteria[{index}].weight must be greater than zero.")
        criteria.append({"id": criterion_id, "label": label, "weight": weight})
        seen.add(criterion_id)
    return criteria


def score_segments(
    payload: dict[str, Any],
    low_evidence_threshold: float = DEFAULT_LOW_EVIDENCE_THRESHOLD,
) -> dict[str, Any]:
    if not 0 <= low_evidence_threshold <= 100:
        raise InputError("low_evidence_threshold must be between 0 and 100.")
    criteria = validate_criteria(payload)
    raw_segments = payload.get("segments")
    if not isinstance(raw_segments, list) or not raw_segments:
        raise InputError("segments must be a non-empty array.")

    total_weight = sum(item["weight"] for item in criteria)
    scored: list[dict[str, Any]] = []
    seen_names: set[str] = set()

    for segment_index, segment in enumerate(raw_segments):
        if not isinstance(segment, dict):
            raise InputError(f"segments[{segment_index}] must be an object.")
        name = str(segment.get("name") or "").strip()
        if not name:
            raise InputError(f"segments[{segment_index}].name is required.")
        if name.casefold() in seen_names:
            raise InputError(f"Duplicate segment name: {name}.")
        seen_names.add(name.casefold())

        scores = segment.get("scores")
        if not isinstance(scores, dict):
            raise InputError(f"Segment {name}: scores must be an object.")

        raw_points = 0.0
        adjusted_points = 0.0
        confidence_points = 0.0
        details: list[dict[str, Any]] = []

        for criterion in criteria:
            criterion_id = criterion["id"]
            score = scores.get(criterion_id)
            if not isinstance(score, dict):
                raise InputError(f"Segment {name}: missing score object for {criterion_id}.")
            rating = require_number(score.get("rating"), f"{name}.{criterion_id}.rating")
            confidence = require_number(score.get("confidence"), f"{name}.{criterion_id}.confidence")
            if not 1 <= rating <= 5:
                raise InputError(f"Segment {name}: {criterion_id} rating must be between 1 and 5.")
            if not 0 <= confidence <= 1:
                raise InputError(f"Segment {name}: {criterion_id} confidence must be between 0 and 1.")

            weight = criterion["weight"]
            raw_contribution = weight * rating / 5
            adjusted_contribution = raw_contribution * confidence
            raw_points += raw_contribution
            adjusted_points += adjusted_contribution
            confidence_points += weight * confidence
            details.append(
                {
                    "criterion_id": criterion_id,
                    "label": criterion["label"],
                    "weight": weight,
                    "rating": rating,
                    "confidence": confidence,
                    "evidence": str(score.get("evidence") or "").strip() or None,
                    "raw_contribution": round(raw_contribution, 4),
                    "adjusted_contribution": round(adjusted_contribution, 4),
                }
            )

        raw_knockouts = segment.get("knockouts") or []
        if not isinstance(raw_knockouts, list) or any(not isinstance(item, str) for item in raw_knockouts):
            raise InputError(f"Segment {name}: knockouts must be an array of strings.")
        knockouts = [item.strip() for item in raw_knockouts if item.strip()]
        scored.append(
            {
                "name": name,
                "eligible": not knockouts,
                "knockouts": knockouts,
                "raw_score": round(raw_points / total_weight * 100, 2),
                "confidence_adjusted_score": round(adjusted_points / total_weight * 100, 2),
                "evidence_confidence": round(confidence_points / total_weight * 100, 2),
                "notes": str(segment.get("notes") or "").strip() or None,
                "details": details,
            }
        )

    eligible = [item for item in scored if item["eligible"]]
    low_evidence = bool(eligible) and all(
        item["evidence_confidence"] < low_evidence_threshold for item in eligible
    )
    if low_evidence:
        ranking_basis = "raw_score"
        evidence_level = "hypothesis"
        scored.sort(
            key=lambda item: (
                not item["eligible"],
                -item["raw_score"],
                -item["confidence_adjusted_score"],
                item["name"].casefold(),
            )
        )
    else:
        ranking_basis = "confidence_adjusted"
        evidence_level = "provisional"
        scored.sort(
            key=lambda item: (
                not item["eligible"],
                -item["confidence_adjusted_score"],
                -item["raw_score"],
                item["name"].casefold(),
            )
        )
    rank = 0
    for item in scored:
        if item["eligible"]:
            rank += 1
            item["rank"] = rank
        else:
            item["rank"] = None

    return {
        "method": "confidence-adjusted-weighted-segment-score-v1",
        "ranking_basis": ranking_basis,
        "evidence_level": evidence_level,
        "low_evidence_threshold": low_evidence_threshold,
        "total_weight": round(total_weight, 4),
        "criteria": criteria,
        "segments": scored,
    }


def markdown_table(result: dict[str, Any]) -> str:
    lines = []
    if result.get("ranking_basis") == "raw_score":
        lines += [
            "Ranked on raw attractiveness: every eligible segment is below the "
            f"{result['low_evidence_threshold']:.0f}% evidence-confidence threshold. "
            "Treat this ranking as a hypothesis to validate, not a selection.",
            "",
        ]
    lines += [
        "| Rank | Segment | Raw | Confidence-adjusted | Evidence confidence | Status |",
        "|---:|---|---:|---:|---:|---|",
    ]
    for segment in result["segments"]:
        rank = str(segment["rank"]) if segment["rank"] is not None else "—"
        status = "eligible" if segment["eligible"] else "excluded: " + "; ".join(segment["knockouts"])
        safe_name = segment["name"].replace("|", "\\|")
        safe_status = status.replace("|", "\\|")
        lines.append(
            f"| {rank} | {safe_name} | {segment['raw_score']:.2f} | "
            f"{segment['confidence_adjusted_score']:.2f} | {segment['evidence_confidence']:.2f}% | {safe_status} |"
        )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="JSON input path, or - for stdin")
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    parser.add_argument(
        "--low-evidence-threshold",
        type=float,
        default=DEFAULT_LOW_EVIDENCE_THRESHOLD,
        help="Evidence confidence percent below which every segment is ranked on raw score",
    )
    args = parser.parse_args()

    try:
        result = score_segments(load_payload(args.input), args.low_evidence_threshold)
    except InputError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    if args.format == "markdown":
        print(markdown_table(result))
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
