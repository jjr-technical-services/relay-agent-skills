#!/usr/bin/env python3
"""Validate screenshot-pack structure, manifest references, image dimensions, and capture errors.

PNG dimensions are read natively, so validating a PNG-only pack needs no
third-party package. Other image formats need Pillow (scripts/requirements.txt).
"""

from __future__ import annotations

import argparse
import json
import re
import struct
import sys
from pathlib import Path
from typing import Any


EVIDENCE_STATUSES = {"source-inferred", "observed", "successfully-exercised", "blocked"}
PAGE_ROLES = {"hero", "feature", "workflow", "proof", "detail", "mobile", "archive"}
SCREENSHOT_FIELDS = (
    "id",
    "flowId",
    "sequence",
    "state",
    "breakpoint",
    "viewport",
    "functionalityShown",
    "whySelected",
    "claimSupported",
    "evidenceStatus",
    "files",
)
# Schema 2 adds what a landing page needs to place an image without manual edits.
SCHEMA_2_FIELDS = ("altText", "pageRole", "selected", "dimensions")
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pack_directory", type=Path)
    parser.add_argument("--allow-empty", action="store_true", help="Allow an initialized pack with no flows or screenshots")
    return parser.parse_args()


def resolve_portable(root: Path, relative: str) -> Path:
    candidate = Path(relative)
    if candidate.is_absolute():
        raise ValueError("path must be relative")
    resolved = (root / candidate).resolve()
    if root != resolved and root not in resolved.parents:
        raise ValueError("path escapes the pack root")
    return resolved


def image_size(path: Path) -> tuple[int, int]:
    """Return (width, height). PNG is parsed directly; other formats use Pillow."""
    with path.open("rb") as handle:
        header = handle.read(24)
    if header[:8] == PNG_SIGNATURE and header[12:16] == b"IHDR":
        return struct.unpack(">II", header[16:24])
    try:
        from PIL import Image
    except ImportError as error:
        raise ValueError(
            "is not a PNG; reading other formats needs Pillow "
            "(python3 -m pip install -r scripts/requirements.txt)"
        ) from error
    with Image.open(path) as image:
        width, height = image.size
        image.verify()
    return width, height


def harmless_patterns(pack: Any, errors: list[str]) -> list[tuple[re.Pattern[str], str]]:
    entries = pack.get("harmlessConsoleErrors", []) if isinstance(pack, dict) else []
    if not isinstance(entries, list):
        errors.append("pack.harmlessConsoleErrors must be an array")
        return []
    patterns: list[tuple[re.Pattern[str], str]] = []
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or not entry.get("pattern") or not entry.get("reason"):
            errors.append(f"pack.harmlessConsoleErrors[{index}] needs a pattern and a reason")
            continue
        try:
            patterns.append((re.compile(str(entry["pattern"])), str(entry["reason"])))
        except re.error as exc:
            errors.append(f"pack.harmlessConsoleErrors[{index}].pattern is not a valid regular expression: {exc}")
    return patterns


def unexpected_capture_errors(root: Path, patterns: list[tuple[re.Pattern[str], str]], errors: list[str]) -> dict[str, list[str]]:
    """Map screenshot id -> console errors not covered by the allowlist."""
    log_path = root / "evidence" / "capture-log.jsonl"
    if not log_path.is_file():
        return {}
    unexpected: dict[str, list[str]] = {}
    for line_number, line in enumerate(log_path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            errors.append(f"evidence/capture-log.jsonl line {line_number} is not valid JSON")
            continue
        messages = event.get("consoleErrors", []) if isinstance(event, dict) else []
        if not isinstance(messages, list):
            errors.append(f"evidence/capture-log.jsonl line {line_number}: consoleErrors must be an array")
            continue
        shot_id = str(event.get("screenshotId") or f"line {line_number}")
        for message in messages:
            text = str(message)
            if not any(pattern.search(text) for pattern, _ in patterns):
                unexpected.setdefault(shot_id, []).append(text)
    return unexpected


def main() -> int:
    args = parse_args()
    root = args.pack_directory.expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []

    report_path = root / "pack.md"
    manifest_path = root / "manifest.json"
    if not report_path.is_file():
        errors.append("Missing pack.md")
    if not manifest_path.is_file():
        errors.append("Missing manifest.json")
        print("\n".join(f"ERROR: {item}" for item in errors), file=sys.stderr)
        return 1

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"ERROR: Cannot read manifest.json: {exc}", file=sys.stderr)
        return 1

    schema_version = manifest.get("schemaVersion")
    if schema_version not in (1, 2):
        errors.append("schemaVersion must be 2 (1 is accepted with warnings)")
    elif schema_version == 1:
        warnings.append(
            "schemaVersion 1: add altText, pageRole, selected and dimensions to every screenshot "
            "and set schemaVersion 2 so a landing page can use the pack without manual edits"
        )

    folders = manifest.get("folders")
    if not isinstance(folders, dict):
        errors.append("folders must be an object")
    else:
        for key, value in folders.items():
            if not isinstance(value, str) or not value:
                errors.append(f"folders.{key} must be a non-empty relative path")
                continue
            try:
                folder_path = resolve_portable(root, value)
            except ValueError as exc:
                errors.append(f"folders.{key}: {exc}")
                continue
            if not folder_path.is_dir():
                errors.append(f"Missing folder referenced by folders.{key}: {value}")

    patterns = harmless_patterns(manifest.get("pack"), errors)

    flows = manifest.get("flows")
    screenshots = manifest.get("screenshots")
    if not isinstance(flows, list):
        errors.append("flows must be an array")
        flows = []
    if not isinstance(screenshots, list):
        errors.append("screenshots must be an array")
        screenshots = []
    if not args.allow_empty and not flows:
        errors.append("Pack has no flows")
    if not args.allow_empty and not screenshots:
        errors.append("Pack has no screenshots")

    flow_ids: set[str] = set()
    for index, flow in enumerate(flows):
        if not isinstance(flow, dict):
            errors.append(f"flows[{index}] must be an object")
            continue
        flow_id = flow.get("id")
        if not isinstance(flow_id, str) or not flow_id:
            errors.append(f"flows[{index}].id is required")
        elif flow_id in flow_ids:
            errors.append(f"Duplicate flow id: {flow_id}")
        else:
            flow_ids.add(flow_id)
        status = flow.get("evidenceStatus")
        if status not in EVIDENCE_STATUSES:
            errors.append(f"flows[{index}].evidenceStatus must be one of {sorted(EVIDENCE_STATUSES)}")

    unexpected = unexpected_capture_errors(root, patterns, errors)

    screenshot_ids: set[str] = set()
    for index, shot in enumerate(screenshots):
        prefix = f"screenshots[{index}]"
        if not isinstance(shot, dict):
            errors.append(f"{prefix} must be an object")
            continue
        required = SCREENSHOT_FIELDS + (SCHEMA_2_FIELDS if schema_version == 2 else ())
        for field in required:
            if field not in shot or shot[field] in (None, ""):
                errors.append(f"{prefix}.{field} is required")
        shot_id = shot.get("id")
        if isinstance(shot_id, str):
            if shot_id in screenshot_ids:
                errors.append(f"Duplicate screenshot id: {shot_id}")
            screenshot_ids.add(shot_id)
        if shot.get("flowId") not in flow_ids:
            errors.append(f"{prefix}.flowId does not reference a known flow")
        status = shot.get("evidenceStatus")
        if status not in EVIDENCE_STATUSES:
            errors.append(f"{prefix}.evidenceStatus must be one of {sorted(EVIDENCE_STATUSES)}")
        selected = shot.get("selected")
        if schema_version == 2:
            if not isinstance(selected, bool):
                errors.append(f"{prefix}.selected must be true or false")
            if shot.get("pageRole") not in PAGE_ROLES:
                errors.append(f"{prefix}.pageRole must be one of {sorted(PAGE_ROLES)}")
            alt_text = shot.get("altText")
            if isinstance(alt_text, str) and not 10 <= len(alt_text.strip()) <= 250:
                errors.append(f"{prefix}.altText must describe the image in 10 to 250 characters")
        if status == "blocked":
            if selected is True:
                errors.append(f"{prefix} is blocked and cannot be selected as marketing proof")
            else:
                warnings.append(f"{prefix} is blocked and should not be selected as marketing proof")
        if isinstance(shot_id, str) and shot_id in unexpected:
            message = f"{prefix} was captured with unexpected console errors: {unexpected[shot_id][:3]}"
            if selected is True:
                errors.append(message + ". Fix the state, or add a harmlessConsoleErrors entry with a reason.")
            else:
                warnings.append(message)

        viewport = shot.get("viewport")
        if not isinstance(viewport, dict) or not all(isinstance(viewport.get(key), int) and viewport[key] > 0 for key in ("width", "height")):
            errors.append(f"{prefix}.viewport must contain positive integer width and height")

        files = shot.get("files")
        if not isinstance(files, dict) or not files.get("raw"):
            errors.append(f"{prefix}.files.raw is required")
            continue
        dimensions = shot.get("dimensions") if isinstance(shot.get("dimensions"), dict) else {}
        for variant, relative in files.items():
            if relative in (None, ""):
                continue
            if not isinstance(relative, str):
                errors.append(f"{prefix}.files.{variant} must be a relative string path")
                continue
            try:
                image_path = resolve_portable(root, relative)
            except ValueError as exc:
                errors.append(f"{prefix}.files.{variant}: {exc}")
                continue
            if not image_path.is_file():
                errors.append(f"Missing image for {prefix}.files.{variant}: {relative}")
                continue
            try:
                width, height = image_size(image_path)
            except (OSError, ValueError, struct.error) as exc:
                errors.append(f"Cannot read image {relative}: {exc}")
                continue
            if width < 1 or height < 1:
                errors.append(f"Invalid image dimensions for {relative}")
            recorded = dimensions.get(variant)
            if schema_version == 2:
                if not isinstance(recorded, dict):
                    errors.append(f"{prefix}.dimensions.{variant} is required")
                elif (recorded.get("width"), recorded.get("height")) != (width, height):
                    errors.append(
                        f"{prefix}.dimensions.{variant} records {recorded.get('width')}x{recorded.get('height')} "
                        f"but {relative} is {width}x{height}"
                    )
            if variant == "raw" and isinstance(viewport, dict):
                expected = viewport.get("width")
                if isinstance(expected, int) and width not in (expected, expected * 2):
                    warnings.append(f"Raw image width {width}px differs from viewport width {expected}px (or 2x) for {shot_id}")

    if not args.allow_empty and report_path.is_file() and "Not yet recorded" in report_path.read_text(encoding="utf-8"):
        errors.append("pack.md still contains 'Not yet recorded' placeholders")

    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(json.dumps({
        "packRoot": str(root),
        "schemaVersion": schema_version,
        "flows": len(flows),
        "screenshots": len(screenshots),
        "selected": sum(1 for shot in screenshots if isinstance(shot, dict) and shot.get("selected") is True),
        "warnings": len(warnings),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
