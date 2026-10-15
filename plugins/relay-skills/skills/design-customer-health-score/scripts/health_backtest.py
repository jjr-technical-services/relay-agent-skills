#!/usr/bin/env python3
"""Customer health score backtest.

Reads historical accounts with a health score (higher = healthier) taken at the
snapshot date and the outcome at renewal, then reports how well the score
separates churned from retained accounts.

Usage:
    python3 health_backtest.py backtest.csv --bands 40,70
    cat backtest.csv | python3 health_backtest.py - --bands 40,70

Required columns:
    score     numeric health score; higher means healthier
    outcome   1, churned, churn, lost, yes or true for the bad outcome;
              0, renewed, retained, no or false otherwise

Optional column:
    segment   results are repeated per segment when present

--bands takes ascending thresholds. "40,70" produces three bands:
red (score < 40), yellow (40 <= score < 70) and green (score >= 70).
More thresholds produce more bands, named band1, band2, ... from lowest.

Output: AUC (probability a randomly chosen retained account scores higher than
a randomly chosen churned account, ties counted half), overall churn rate, and
per band the accounts, churned count, churn rate, share of all churners and
lift (band churn rate / overall churn rate). The script reads only and writes
nothing.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from collections import OrderedDict

BAD = {"1", "churned", "churn", "lost", "yes", "true"}
GOOD = {"0", "renewed", "retained", "no", "false", "expanded"}


def auc(rows: list[tuple[float, int]]) -> float | None:
    """Rank-based AUC (Mann-Whitney) with average ranks for ties."""
    n_bad = sum(1 for _, y in rows if y == 1)
    n_good = len(rows) - n_bad
    if n_bad == 0 or n_good == 0:
        return None
    ordered = sorted(rows, key=lambda r: r[0])
    ranks = [0.0] * len(ordered)
    i = 0
    while i < len(ordered):
        j = i
        while j + 1 < len(ordered) and ordered[j + 1][0] == ordered[i][0]:
            j += 1
        average = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[k] = average
        i = j + 1
    rank_sum_good = sum(r for r, (_, y) in zip(ranks, ordered) if y == 0)
    u_good = rank_sum_good - n_good * (n_good + 1) / 2
    return u_good / (n_good * n_bad)


def band_names(count: int) -> list[str]:
    if count == 3:
        return ["red", "yellow", "green"]
    if count == 2:
        return ["red", "green"]
    return [f"band{i + 1}" for i in range(count)]


def report(label: str, rows: list[tuple[float, int]], thresholds: list[float]) -> None:
    total = len(rows)
    churned = sum(y for _, y in rows)
    rate = churned / total if total else 0.0
    value = auc(rows)
    print(f"== {label}: accounts {total}, churned {churned}, churn rate {rate:.1%}, "
          f"AUC {'n/a (needs both outcomes)' if value is None else f'{value:.3f}'}")
    names = band_names(len(thresholds) + 1)
    edges = [-math.inf] + thresholds + [math.inf]
    print("band,range,accounts,churned,churn_rate,share_of_churners,lift")
    for idx, name in enumerate(names):
        low, high = edges[idx], edges[idx + 1]
        members = [y for s, y in rows if low <= s < high]
        n = len(members)
        c = sum(members)
        band_rate = c / n if n else 0.0
        share = c / churned if churned else 0.0
        lift = band_rate / rate if rate else 0.0
        low_text = "" if low == -math.inf else f"{low:g}"
        high_text = "" if high == math.inf else f"{high:g}"
        rng = f"< {high_text}" if not low_text else (f">= {low_text}" if not high_text else f"{low_text} to < {high_text}")
        print(f"{name},{rng},{n},{c},{band_rate:.1%},{share:.1%},{lift:.2f}")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_path", help="path to the CSV file, or - for stdin")
    parser.add_argument("--bands", default="40,70", help="ascending thresholds, e.g. 40,70")
    args = parser.parse_args()

    try:
        thresholds = [float(x) for x in args.bands.split(",") if x.strip()]
    except ValueError:
        sys.exit("error: --bands must be numbers separated by commas")
    if thresholds != sorted(thresholds) or len(set(thresholds)) != len(thresholds):
        sys.exit("error: --bands thresholds must be strictly ascending")

    handle = sys.stdin if args.csv_path == "-" else open(args.csv_path, newline="", encoding="utf-8-sig")
    with handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            sys.exit("error: the CSV has no header row")
        reader.fieldnames = [f.strip().lower() for f in reader.fieldnames]
        for required in ("score", "outcome"):
            if required not in reader.fieldnames:
                sys.exit(f"error: missing required column '{required}'")
        has_segment = "segment" in reader.fieldnames
        all_rows: list[tuple[float, int]] = []
        by_segment: "OrderedDict[str, list[tuple[float, int]]]" = OrderedDict()
        skipped = 0
        for line, row in enumerate(reader, start=2):
            raw_score = (row.get("score") or "").strip()
            raw_outcome = (row.get("outcome") or "").strip().lower()
            if raw_score == "" or raw_outcome == "":
                skipped += 1
                continue
            try:
                score = float(raw_score)
            except ValueError:
                sys.exit(f"error: line {line}: score is not a number: {raw_score!r}")
            if raw_outcome in BAD:
                outcome = 1
            elif raw_outcome in GOOD:
                outcome = 0
            else:
                sys.exit(f"error: line {line}: unrecognised outcome {raw_outcome!r}")
            all_rows.append((score, outcome))
            if has_segment:
                by_segment.setdefault((row.get("segment") or "unspecified").strip(), []).append((score, outcome))

    if not all_rows:
        sys.exit("error: no usable rows")
    if skipped:
        print(f"note: skipped {skipped} rows with a blank score or outcome")
    report("all accounts", all_rows, thresholds)
    for segment, rows in by_segment.items():
        report(f"segment {segment}", rows, thresholds)


if __name__ == "__main__":
    main()
