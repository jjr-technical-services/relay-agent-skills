#!/usr/bin/env python3
"""Territory balance checker.

Reads an account-level CSV and reports, for each owner, account count and the
totals of each numeric measure, with an index against the mean territory
(100 = average) and flags for owners outside a tolerance band. Also reports the
coefficient of variation (population standard deviation / mean) per measure.

Usage:
    python3 territory_balance.py accounts.csv [--tolerance 0.15]
    cat accounts.csv | python3 territory_balance.py - [--tolerance 0.15]

Required columns:
    owner       owner or territory name
    potential   numeric account potential (currency or score)

Optional numeric columns (used when present):
    workload    hours per year to cover the account
    arr         current annual recurring revenue

Rows with a blank owner are reported as unassigned and excluded from the
balance statistics. Non-numeric values in a numeric column stop the run with
the offending line number. The script reads only; it writes nothing.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from collections import OrderedDict

OPTIONAL_MEASURES = ("workload", "arr")


def parse_number(raw: str, column: str, line: int) -> float:
    text = (raw or "").strip().replace(",", "")
    if text == "":
        return 0.0
    try:
        value = float(text)
    except ValueError:
        sys.exit(f"error: line {line}: column '{column}' is not a number: {raw!r}")
    if not math.isfinite(value):
        sys.exit(f"error: line {line}: column '{column}' is not finite")
    return value


def cv(values: list[float]) -> float:
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    if mean == 0:
        return 0.0
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return math.sqrt(variance) / mean


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("csv_path", help="path to the CSV file, or - for stdin")
    parser.add_argument(
        "--tolerance",
        type=float,
        default=0.15,
        help="flag owners whose index is outside 100 x (1 +/- tolerance); default 0.15",
    )
    args = parser.parse_args()
    if not 0 < args.tolerance < 1:
        sys.exit("error: --tolerance must be between 0 and 1")

    handle = sys.stdin if args.csv_path == "-" else open(args.csv_path, newline="", encoding="utf-8-sig")
    with handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            sys.exit("error: the CSV has no header row")
        fields = [f.strip().lower() for f in reader.fieldnames]
        reader.fieldnames = fields
        for required in ("owner", "potential"):
            if required not in fields:
                sys.exit(f"error: missing required column '{required}'")
        measures = ["potential"] + [m for m in OPTIONAL_MEASURES if m in fields]

        owners: "OrderedDict[str, dict]" = OrderedDict()
        unassigned = 0
        for line, row in enumerate(reader, start=2):
            owner = (row.get("owner") or "").strip()
            if not owner:
                unassigned += 1
                continue
            bucket = owners.setdefault(owner, {"accounts": 0, **{m: 0.0 for m in measures}})
            bucket["accounts"] += 1
            for m in measures:
                bucket[m] += parse_number(row.get(m, ""), m, line)

    if not owners:
        sys.exit("error: no assigned accounts found")

    columns = ["accounts"] + measures
    means = {c: sum(o[c] for o in owners.values()) / len(owners) for c in columns}
    totals = {c: sum(o[c] for o in owners.values()) for c in columns}
    low, high = 100 * (1 - args.tolerance), 100 * (1 + args.tolerance)

    header = ["owner"]
    for c in columns:
        header += [c, f"{c}_share", f"{c}_index"]
    header.append("flags")
    print(",".join(header))
    for name, o in owners.items():
        cells = [name]
        flags = []
        for c in columns:
            share = o[c] / totals[c] if totals[c] else 0.0
            index = o[c] / means[c] * 100 if means[c] else 0.0
            cells += [f"{o[c]:.2f}" if c != "accounts" else str(o[c]), f"{share:.3f}", f"{index:.1f}"]
            if means[c] and not low <= index <= high:
                flags.append(f"{c} {'high' if index > high else 'low'}")
        cells.append("; ".join(flags) if flags else "ok")
        print(",".join(cells))

    print()
    print(f"owners: {len(owners)}; unassigned accounts: {unassigned}; tolerance: +/-{args.tolerance:.0%}")
    for c in columns:
        values = [o[c] for o in owners.values()]
        print(f"{c}: total {totals[c]:.2f}, mean {means[c]:.2f}, CV {cv(values):.1%}")


if __name__ == "__main__":
    main()
