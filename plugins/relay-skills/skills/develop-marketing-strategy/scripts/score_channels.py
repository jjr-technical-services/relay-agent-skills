#!/usr/bin/env python3
"""Score marketing channels with explicit fit and evidence confidence."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any


# A channel's job. Ranking every channel on one list let a retention channel
# (onboarding email) outrank every acquisition channel in the 2026-09-23
# dogfood run: it scores well on fit because its audience is already won.
CHANNEL_JOBS = ("acquisition", "activation", "retention", "referral", "revenue")
DEFAULT_PRIMARY_JOB = "acquisition"

DEFAULT_CRITERIA = [
    {"id": "icp_reach", "label": "ICP reach", "weight": 20},
    {"id": "intent_timing", "label": "Intent and timing", "weight": 15},
    {"id": "message_proof_fit", "label": "Message and proof fit", "weight": 15},
    {"id": "economic_fit", "label": "Economic fit", "weight": 15},
    {"id": "learning_speed", "label": "Learning speed", "weight": 10},
    {"id": "operational_fit", "label": "Operational fit", "weight": 10},
    {"id": "competitive_headroom", "label": "Competitive headroom", "weight": 10},
    {"id": "durability", "label": "Durability", "weight": 5},
]


def load_payload(path: str) -> dict[str, Any]:
    if path == "-":
        payload = json.load(sys.stdin)
    else:
        with Path(path).open(encoding="utf-8") as handle:
            payload = json.load(handle)
    if not isinstance(payload, dict):
        raise ValueError("The input must be a JSON object.")
    return payload


def validate_criteria(raw: Any) -> list[dict[str, Any]]:
    criteria = DEFAULT_CRITERIA if raw is None else raw
    if not isinstance(criteria, list) or not criteria:
        raise ValueError("criteria must be a non-empty array when provided.")

    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, item in enumerate(criteria):
        if not isinstance(item, dict):
            raise ValueError(f"criteria[{index}] must be an object.")
        criterion_id = item.get("id")
        weight = item.get("weight")
        if not isinstance(criterion_id, str) or not criterion_id.strip():
            raise ValueError(f"criteria[{index}].id must be a non-empty string.")
        if criterion_id in seen:
            raise ValueError(f"Duplicate criterion id: {criterion_id}")
        if not isinstance(weight, (int, float)) or isinstance(weight, bool) or weight <= 0:
            raise ValueError(f"criteria[{index}].weight must be greater than zero.")
        seen.add(criterion_id)
        result.append(
            {
                "id": criterion_id,
                "label": item.get("label") or criterion_id.replace("_", " ").title(),
                "weight": float(weight),
            }
        )
    return result


def validate_number(value: Any, minimum: float, maximum: float, field: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"{field} must be a number from {minimum} to {maximum}.")
    number = float(value)
    if not math.isfinite(number) or number < minimum or number > maximum:
        raise ValueError(f"{field} must be from {minimum} to {maximum}.")
    return number


def validate_job(value: Any, field: str) -> str:
    if value not in CHANNEL_JOBS:
        raise ValueError(f"{field} must be one of: {', '.join(CHANNEL_JOBS)}.")
    return value


def score_channels(payload: dict[str, Any]) -> dict[str, Any]:
    criteria = validate_criteria(payload.get("criteria"))
    primary_job = validate_job(payload.get("primary_job", DEFAULT_PRIMARY_JOB), "primary_job")
    channels = payload.get("channels")
    if not isinstance(channels, list) or not channels:
        raise ValueError("channels must be a non-empty array.")

    total_weight = sum(item["weight"] for item in criteria)
    results: list[dict[str, Any]] = []
    seen_names: set[str] = set()

    for index, channel in enumerate(channels):
        if not isinstance(channel, dict):
            raise ValueError(f"channels[{index}] must be an object.")
        name = channel.get("name")
        if not isinstance(name, str) or not name.strip():
            raise ValueError(f"channels[{index}].name must be a non-empty string.")
        if name in seen_names:
            raise ValueError(f"Duplicate channel name: {name}")
        seen_names.add(name)
        job = validate_job(channel.get("job"), f"channels[{index}].job")

        knockout = channel.get("knockout")
        if knockout:
            results.append(
                {
                    "name": name,
                    "job": job,
                    "serves_primary_job": job == primary_job,
                    "status": "excluded",
                    "knockout": str(knockout),
                    "fit_score": None,
                    "evidence_confidence": None,
                    "confidence_adjusted_fit": None,
                }
            )
            continue

        scores = channel.get("scores")
        if not isinstance(scores, dict):
            raise ValueError(f"channels[{index}].scores must be an object.")

        weighted_fit = 0.0
        weighted_confidence = 0.0
        details: list[dict[str, Any]] = []
        for criterion in criteria:
            criterion_id = criterion["id"]
            entry = scores.get(criterion_id)
            if not isinstance(entry, dict):
                raise ValueError(f"Channel '{name}' is missing score object '{criterion_id}'.")
            score = validate_number(entry.get("score"), 1, 5, f"{name}.{criterion_id}.score")
            confidence = validate_number(
                entry.get("confidence"), 0, 1, f"{name}.{criterion_id}.confidence"
            )
            weighted_fit += criterion["weight"] * (score / 5)
            weighted_confidence += criterion["weight"] * confidence
            details.append(
                {
                    "criterion": criterion_id,
                    "score": score,
                    "confidence": confidence,
                    "rationale": entry.get("rationale", ""),
                }
            )

        fit_score = 100 * weighted_fit / total_weight
        evidence_confidence = weighted_confidence / total_weight
        results.append(
            {
                "name": name,
                "job": job,
                "serves_primary_job": job == primary_job,
                "status": "scored",
                "fit_score": round(fit_score, 1),
                "evidence_confidence": round(evidence_confidence, 3),
                "confidence_adjusted_fit": round(fit_score * evidence_confidence, 1),
                "details": details,
            }
        )

    # Channels that serve the objective's primary job rank first; the others
    # support it and are ranked within their own job.
    results.sort(
        key=lambda item: (
            item["status"] == "scored",
            item["serves_primary_job"],
            item["confidence_adjusted_fit"] if item["confidence_adjusted_fit"] is not None else -1,
            item["name"],
        ),
        reverse=True,
    )
    rankings_by_job = {
        job: [item["name"] for item in results if item["job"] == job and item["status"] == "scored"]
        for job in CHANNEL_JOBS
    }
    return {
        "criteria": criteria,
        "total_weight": total_weight,
        "primary_job": primary_job,
        "channels": results,
        "rankings_by_job": {job: names for job, names in rankings_by_job.items() if names},
        "note": (
            "Scores compare channel fit; they are not forecasts. Confidence-adjusted fit equals raw fit "
            f"times evidence confidence. Channels serving the primary job ({primary_job}) rank first; "
            "compare the others only within their own job."
        ),
    }


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        f"Primary job: {result['primary_job']}",
        "",
        "| Channel | Job | Status | Fit / 100 | Evidence confidence | Confidence-adjusted fit |",
        "|---|---|---|---:|---:|---:|",
    ]
    for channel in result["channels"]:
        channel_name = channel["name"].replace("|", "\\|")
        if channel["status"] == "excluded":
            reason = channel["knockout"].replace("|", "\\|")
            lines.append(f"| {channel_name} | {channel['job']} | Excluded: {reason} | - | - | - |")
        else:
            confidence = f"{channel['evidence_confidence'] * 100:.1f}%"
            lines.append(
                f"| {channel_name} | {channel['job']} | Scored | {channel['fit_score']:.1f} | "
                f"{confidence} | {channel['confidence_adjusted_fit']:.1f} |"
            )
    lines.extend(["", f"_Note: {result['note']}_"])
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Score marketing channels with weighted fit and evidence confidence."
    )
    parser.add_argument(
        "input",
        nargs="?",
        default="-",
        help="Input JSON file, or - for stdin (default).",
    )
    parser.add_argument(
        "--format",
        choices=("markdown", "json"),
        default="markdown",
        help="Output format (default: markdown).",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        result = score_channels(load_payload(args.input))
    except (OSError, json.JSONDecodeError, ValueError) as error:
        parser.error(str(error))

    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        print(render_markdown(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
