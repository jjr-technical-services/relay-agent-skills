#!/usr/bin/env python3
"""Create a portable marketing screenshot pack scaffold without overwriting files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


FOLDERS = {
    "rawDesktop": "raw/desktop",
    "rawTablet": "raw/tablet",
    "rawMobile": "raw/mobile",
    "selected": "selected",
    "crops": "crops",
    "framedLaptop": "framed/laptop",
    "framedPhone": "framed/phone",
    "evidence": "evidence",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output_directory", type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--product", required=True)
    parser.add_argument("--base-url", default="")
    parser.add_argument("--audience", default="")
    return parser.parse_args()


def write_new(path: Path, content: str) -> None:
    if path.exists():
        raise FileExistsError(f"Refusing to overwrite existing file: {path}")
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    root = args.output_directory.expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)
    for folder in FOLDERS.values():
        (root / folder).mkdir(parents=True, exist_ok=True)

    manifest = {
        "schemaVersion": 2,
        "pack": {
            "title": args.title,
            "product": args.product,
            "audience": args.audience,
            "intendedUse": [],
            "baseUrl": args.base_url,
            "environment": "",
            "capturedAt": "",
            "revision": "",
            "dataMode": "",
            "harmlessConsoleErrors": [],
        },
        "folders": FOLDERS,
        "flows": [],
        "screenshots": [],
    }
    write_new(root / "manifest.json", json.dumps(manifest, indent=2) + "\n")

    report = f"""# {args.title}

## Pack summary

- Product: {args.product}
- Audience: {args.audience or 'Not yet recorded'}
- Intended use: Not yet recorded
- Environment: Not yet recorded
- Capture date: Not yet recorded
- Revision: Not yet recorded
- Data mode: Not yet recorded
- Base URL: {args.base_url or 'Not yet recorded'}

## Narrative

Not yet recorded.

## Use-flow map

Not yet recorded.

## Selected screenshots

Not yet recorded.

## Recommended sequences

Not yet recorded.

## Asset locations

- [Manifest](manifest.json)
- [Raw desktop](raw/desktop/)
- [Raw tablet](raw/tablet/)
- [Raw mobile](raw/mobile/)
- [Selected](selected/)
- [Crops](crops/)
- [Laptop frames](framed/laptop/)
- [Phone frames](framed/phone/)
- [Evidence](evidence/)

## Caveats

Not yet recorded.
"""
    write_new(root / "pack.md", report)
    write_new(root / "evidence" / "capture-log.jsonl", "")
    write_new(
        root / "evidence" / "source-notes.md",
        "# Source notes\n\nRecord inspected routes, tests, fixtures, revisions, and source-inferred functionality here.\n",
    )

    print(json.dumps({"packRoot": str(root), "manifest": str(root / "manifest.json"), "report": str(root / "pack.md")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
