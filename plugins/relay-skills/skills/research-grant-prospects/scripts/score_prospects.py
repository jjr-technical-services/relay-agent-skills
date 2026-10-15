#!/usr/bin/env python3
"""Score grant prospects from a CSV with a tunable weighted rubric, knockouts, and stale-data flags.

Usage:
    python3 score_prospects.py PROSPECTS.csv [--weights mission=25,geography=20] [--as-of 2026-09-01]
                               [--stale-months 18] [--min-coverage 60]
    cat PROSPECTS.csv | python3 score_prospects.py -

Input CSV columns (header row required):
    funder          funder name (required)
    mission         0-5 fit score, or blank / "unknown"
    population      0-5
    geography       0-5  (0 = outside the funder's stated geography -> knockout)
    grant_size      0-5
    funding_type    0-5
    recent_giving   0-5
    relationship    0-5
    access          open, invitation, or unclear
    knockout        optional free text; any value removes the prospect (e.g. "ineligible org type")
    source_date     optional YYYY-MM-DD date of the oldest fact the scores rely on

Default weights (a starting point to tune, not a standard):
    mission 20, population 15, geography 15, grant_size 10, funding_type 10,
    access 10, recent_giving 10, relationship 10
The access criterion is derived: open = 5, unclear = 2, invitation = 0.

Scoring:
    weighted score = sum(weight_i x score_i / 5) / sum(weight_i for known criteria) x 100
    coverage       = sum(weight_i for known criteria) / sum(all weights) x 100
Unknown criteria are left out of both the numerator and the denominator, and lower coverage.

Recommendation rules:
    knockout present or geography = 0           -> Remove
    access = invitation and relationship < 3    -> Watch (no letter of inquiry; build a path first)
    access = invitation and relationship >= 3   -> Cultivate first
    coverage below --min-coverage               -> Research more
    score >= 70                                 -> Pursue now
    score >= 50                                 -> Cultivate first
    otherwise                                   -> Watch
Any source_date older than --stale-months before --as-of is flagged "Stale - re-verify".

The script prints a ranked table. It writes nothing to disk and makes no network calls.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import sys

CRITERIA = ["mission", "population", "geography", "grant_size", "funding_type", "access", "recent_giving", "relationship"]
DEFAULT_WEIGHTS = {
    "mission": 20.0,
    "population": 15.0,
    "geography": 15.0,
    "grant_size": 10.0,
    "funding_type": 10.0,
    "access": 10.0,
    "recent_giving": 10.0,
    "relationship": 10.0,
}
ACCESS_SCORES = {"open": 5.0, "unclear": 2.0, "invitation": 0.0, "invitation only": 0.0}


def parse_weights(text: str) -> dict[str, float]:
    weights = dict(DEFAULT_WEIGHTS)
    if not text:
        return weights
    for part in text.split(","):
        if not part.strip():
            continue
        key, _, value = part.partition("=")
        key = key.strip().lower()
        if key not in weights:
            raise SystemExit(f"error: unknown criterion in --weights: {key}")
        try:
            weights[key] = float(value)
        except ValueError as exc:
            raise SystemExit(f"error: weight for {key} is not a number") from exc
        if weights[key] < 0:
            raise SystemExit(f"error: weight for {key} is negative")
    return weights


def parse_score(raw: str, label: str) -> float | None:
    text = (raw or "").strip().lower()
    if text in ("", "unknown", "n/a", "na", "?"):
        return None
    try:
        value = float(text)
    except ValueError as exc:
        raise SystemExit(f"error: {label} must be 0-5 or unknown, got {raw!r}") from exc
    if not 0 <= value <= 5:
        raise SystemExit(f"error: {label} must be between 0 and 5, got {value}")
    return value


def months_between(earlier: dt.date, later: dt.date) -> int:
    return (later.year - earlier.year) * 12 + (later.month - earlier.month) - (1 if later.day < earlier.day else 0)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_path", help="prospect CSV path, or - for stdin")
    parser.add_argument("--weights", default="")
    parser.add_argument("--as-of", default=dt.date.today().isoformat())
    parser.add_argument("--stale-months", type=int, default=18)
    parser.add_argument("--min-coverage", type=float, default=60.0)
    args = parser.parse_args()

    weights = parse_weights(args.weights)
    total_weight = sum(weights.values())
    if total_weight <= 0:
        raise SystemExit("error: weights sum to zero")
    as_of = dt.date.fromisoformat(args.as_of)

    text = sys.stdin.read() if args.csv_path == "-" else open(args.csv_path, encoding="utf-8-sig").read()
    reader = csv.DictReader(io.StringIO(text))
    results = []
    for line_no, raw in enumerate(reader, start=2):
        row = {(k or "").strip().lower(): (v or "").strip() for k, v in raw.items()}
        if not row.get("funder"):
            continue
        scores: dict[str, float | None] = {}
        for crit in CRITERIA:
            if crit == "access":
                access = row.get("access", "").lower() or "unclear"
                if access not in ACCESS_SCORES:
                    raise SystemExit(f"error: row {line_no} access must be open, invitation or unclear")
                scores[crit] = ACCESS_SCORES[access]
            else:
                scores[crit] = parse_score(row.get(crit, ""), f"row {line_no} {crit}")
        known_weight = sum(weights[c] for c in CRITERIA if scores[c] is not None)
        numerator = sum(weights[c] * scores[c] / 5 for c in CRITERIA if scores[c] is not None)
        score = numerator / known_weight * 100 if known_weight else 0.0
        coverage = known_weight / total_weight * 100

        flags = []
        stale = ""
        if row.get("source_date"):
            try:
                src = dt.date.fromisoformat(row["source_date"])
            except ValueError as exc:
                raise SystemExit(f"error: row {line_no} source_date must be YYYY-MM-DD") from exc
            age = months_between(src, as_of)
            if age > args.stale_months:
                stale = f"Stale - re-verify ({age} months old)"
        else:
            stale = "No source date"
        unknown = [c for c in CRITERIA if scores[c] is None]
        if unknown:
            flags.append("unknown: " + "/".join(unknown))

        access = row.get("access", "").lower() or "unclear"
        relationship = scores["relationship"] or 0.0
        if row.get("knockout") or scores["geography"] == 0:
            rec = "Remove"
            flags.append("knockout: " + (row.get("knockout") or "outside geography"))
        elif access.startswith("invitation"):
            rec = "Cultivate first" if relationship >= 3 else "Watch"
            flags.append("invitation only: no letter of inquiry")
        elif coverage < args.min_coverage:
            rec = "Research more"
        elif score >= 70:
            rec = "Pursue now"
        elif score >= 50:
            rec = "Cultivate first"
        else:
            rec = "Watch"
        results.append((row["funder"], score, coverage, rec, stale, "; ".join(flags)))

    order = {"Pursue now": 0, "Cultivate first": 1, "Research more": 2, "Watch": 3, "Remove": 4}
    results.sort(key=lambda r: (order[r[3]], -r[1]))
    print("Weights: " + ", ".join(f"{k}={v:g}" for k, v in weights.items()) + f"  (as of {as_of.isoformat()})")
    print(f"{'Funder':<28}{'Score':>7}{'Cover%':>8}  {'Recommendation':<16}{'Data age':<36}Flags")
    print("-" * 120)
    for funder, score, coverage, rec, stale, flags in results:
        print(f"{funder[:27]:<28}{score:>7.1f}{coverage:>8.0f}  {rec:<16}{stale:<36}{flags}")


if __name__ == "__main__":
    main()
