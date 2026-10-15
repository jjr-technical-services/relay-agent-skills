#!/usr/bin/env python3
"""Stage conversion and drop-off table for a conversion funnel.

Usage:
    python3 funnel_table.py FUNNEL.csv [--reference SEGMENT] [--z 1.96]
    cat FUNNEL.csv | python3 funnel_table.py - [--reference SEGMENT]

Input CSV columns (header required):
    stage    stage name, rows ordered from the top of the funnel to the bottom
    count    entities (users, accounts, or opportunities) that reached the stage
    segment  optional; when present, one funnel is computed per segment value,
             plus an "ALL" funnel that sums the segments stage by stage

Output, per segment and transition:
    entered, converted, step_rate, ci_low, ci_high (Wilson interval),
    cumulative_rate, drop_off, share_of_drop_off, downstream_rate,
    final_per_1pt   final outcomes gained per +1 percentage point at this step,
    recoverable_final  (only with --reference) final outcomes gained if this
                       segment matched the reference segment's step rate.

The script reads only the file given (or stdin) and prints to stdout.
It uses the Python standard library only.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from collections import OrderedDict


def wilson(successes: int, trials: int, z: float) -> tuple[float, float]:
    if trials <= 0:
        return (float("nan"), float("nan"))
    p = successes / trials
    denom = 1 + z * z / trials
    center = (p + z * z / (2 * trials)) / denom
    half = z * math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denom
    return (max(0.0, center - half), min(1.0, center + half))


def read_rows(path: str) -> list[dict[str, str]]:
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    try:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise SystemExit("error: empty input")
        fields = [f.strip().lower() for f in reader.fieldnames]
        if "stage" not in fields or "count" not in fields:
            raise SystemExit("error: CSV needs 'stage' and 'count' columns")
        rows = []
        for raw in reader:
            row = {k.strip().lower(): (v or "").strip() for k, v in raw.items() if k}
            if not row.get("stage"):
                continue
            rows.append(row)
        return rows
    finally:
        if handle is not sys.stdin:
            handle.close()


def build_funnels(rows: list[dict[str, str]]) -> "OrderedDict[str, OrderedDict[str, int]]":
    funnels: "OrderedDict[str, OrderedDict[str, int]]" = OrderedDict()
    stage_order: list[str] = []
    for row in rows:
        seg = row.get("segment") or "ALL"
        stage = row["stage"]
        try:
            count = int(float(row["count"]))
        except ValueError:
            raise SystemExit(f"error: count '{row['count']}' for stage '{stage}' is not a number")
        if count < 0:
            raise SystemExit(f"error: negative count for stage '{stage}'")
        if stage not in stage_order:
            stage_order.append(stage)
        funnels.setdefault(seg, OrderedDict())
        funnels[seg][stage] = funnels[seg].get(stage, 0) + count
    if len(funnels) > 1 or "ALL" not in funnels:
        total: "OrderedDict[str, int]" = OrderedDict((s, 0) for s in stage_order)
        for seg_counts in funnels.values():
            for s, c in seg_counts.items():
                total[s] += c
        funnels["ALL"] = total
    for seg, counts in funnels.items():
        missing = [s for s in stage_order if s not in counts]
        if missing:
            raise SystemExit(f"error: segment '{seg}' is missing stages: {', '.join(missing)}")
        funnels[seg] = OrderedDict((s, counts[s]) for s in stage_order)
    return funnels


def analyse(counts: "OrderedDict[str, int]", z: float) -> list[dict]:
    stages = list(counts.keys())
    values = list(counts.values())
    top, final = values[0], values[-1]
    total_drop = sum(max(0, values[i] - values[i + 1]) for i in range(len(values) - 1))
    out = []
    for i in range(len(values) - 1):
        entered, converted = values[i], values[i + 1]
        rate = converted / entered if entered else float("nan")
        low, high = wilson(min(converted, entered), entered, z)
        drop = entered - converted
        downstream = final / converted if converted else float("nan")
        out.append({
            "transition": f"{stages[i]} -> {stages[i + 1]}",
            "entered": entered,
            "converted": converted,
            "step_rate": rate,
            "ci_low": low,
            "ci_high": high,
            "cumulative_rate": converted / top if top else float("nan"),
            "drop_off": drop,
            "share_of_drop_off": (max(0, drop) / total_drop) if total_drop else float("nan"),
            "downstream_rate": downstream,
            "final_per_1pt": entered * 0.01 * downstream if converted else float("nan"),
            "increase_warning": converted > entered,
        })
    return out


def pct(x: float) -> str:
    return "n/a" if x != x else f"{x * 100:.2f}%"


def num(x: float) -> str:
    return "n/a" if x != x else f"{x:,.1f}"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Stage conversion and drop-off table from a funnel CSV.",
        epilog="Rows must be ordered from the top of the funnel to the bottom.",
    )
    parser.add_argument("csv_path", help="path to CSV, or '-' for stdin")
    parser.add_argument("--reference", help="segment whose step rates are the reference for recoverable loss")
    parser.add_argument("--z", type=float, default=1.96, help="z value for the Wilson interval (default 1.96 = 95%%)")
    args = parser.parse_args()

    funnels = build_funnels(read_rows(args.csv_path))
    results = {seg: analyse(c, args.z) for seg, c in funnels.items()}
    if args.reference and args.reference not in results:
        raise SystemExit(f"error: reference segment '{args.reference}' not found")

    header = ["transition", "entered", "converted", "step_rate", "ci_low", "ci_high",
              "cumulative_rate", "drop_off", "share_of_drop_off", "downstream_rate", "final_per_1pt"]
    if args.reference:
        header.append("recoverable_final")

    for seg, rows in results.items():
        print(f"\n== segment: {seg} ==")
        print(" | ".join(header))
        seg_recoverable = 0.0
        for i, r in enumerate(rows):
            cells = [r["transition"], f"{r['entered']:,}", f"{r['converted']:,}", pct(r["step_rate"]),
                     pct(r["ci_low"]), pct(r["ci_high"]), pct(r["cumulative_rate"]), f"{r['drop_off']:,}",
                     pct(r["share_of_drop_off"]), pct(r["downstream_rate"]), num(r["final_per_1pt"])]
            if args.reference:
                ref_rate = results[args.reference][i]["step_rate"]
                gap = max(0.0, ref_rate - r["step_rate"]) if seg != args.reference else 0.0
                if seg == "ALL" or not r["converted"]:
                    rec = float("nan")  # ALL contains the reference itself; not a like-for-like gap
                else:
                    rec = r["entered"] * gap * r["downstream_rate"]
                if rec == rec:
                    seg_recoverable = max(seg_recoverable, rec)
                cells.append(num(rec))
            print(" | ".join(cells))
            if r["increase_warning"]:
                print(f"  WARNING: count increases at '{r['transition']}'. The funnel is not nested: "
                      "check unit mixing, unordered counting, stage skips, or a second entry path.")
        overall = rows[-1]["cumulative_rate"] if rows else float("nan")
        print(f"overall conversion: {pct(overall)}")
        if args.reference and seg not in (args.reference, "ALL"):
            print(f"largest single-step recoverable_final vs '{args.reference}': {num(seg_recoverable)} "
                  "(upper bound; segments may differ in intent)")


if __name__ == "__main__":
    main()
