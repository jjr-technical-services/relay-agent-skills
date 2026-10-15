#!/usr/bin/env python3
"""Build cohort retention triangles from customer activity by month.

Usage:
  python3 cohort_retention.py activity.csv [options]
  cat activity.csv | python3 cohort_retention.py - [options]

Input: one row per customer per month in which the customer was active.
Required columns (names configurable):
  customer_id   stable customer identifier
  period        month as YYYY-MM (YYYY-MM-DD is accepted and truncated)
Optional columns:
  revenue       recurring revenue for that customer in that month, as a
                run-rate (MRR). Rows for the same customer and month are summed.
  segment       any label (plan, region, size band) used with --segment-value

Output (printed):
  1. Logo retention triangle: share of each cohort's customers active at
     month offset k (k = 0 is the cohort's first month).
  2. When revenue is present: net revenue retention (NRR) and gross revenue
     retention (GRR) triangles, measured against each cohort's month-0 revenue.
  3. When revenue is present: trailing-twelve-month (TTM) NRR and GRR as of the
     latest month, computed on the customers active twelve months earlier.

Definitions used:
  logo_k = active customers of cohort at offset k / customers in cohort
  NRR_k  = sum(revenue at k) / sum(revenue at 0)            (includes expansion)
  GRR_k  = sum(min(revenue at k, revenue at 0)) / sum(revenue at 0)
           (each customer capped at its starting revenue, so GRR <= 100%)

Options:
  --customer-col NAME     default customer_id
  --period-col NAME       default period
  --revenue-col NAME      default revenue (ignored if the column is absent)
  --segment-col NAME      default segment
  --segment-value VALUE   keep only rows whose segment equals VALUE; run once
                          per segment to compare segments
  --mode MODE             "active" (default): a customer counts in any month it
                          is active, so reactivations count again.
                          "survival": a customer counts only until its first
                          missing month; later reactivations are ignored.
  --count-zero-revenue    treat rows with revenue 0 as active (default: a row
                          with revenue <= 0 is inactive when revenue exists)
  --max-offset N          print offsets 0..N only (default: all)
  --min-cohort-size N     mark cohorts smaller than N with '*' (default 20;
                          a heuristic, set it from your own tolerance)
  --ttm-window N          months for the trailing NRR/GRR window (default 12)
  --period-length N       months per analysis period (default 1). 3 groups
                          calendar quarters, 12 calendar years; revenue is
                          summed within each period and offsets count periods.
                          Stop at the last complete period with --as-of.
  --as-of YYYY-MM         treat this month as the latest observed month
  --out PATH              also write long-format results as CSV to PATH
  --json                  print JSON instead of text tables

Cells beyond the latest observed month are blank (right-censored), not zero.
The script reads only the input you pass and writes only to --out.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import defaultdict


def parse_month(value: str, line: int) -> int:
    text = (value or "").strip()
    if len(text) < 7 or text[4] != "-":
        raise SystemExit(f"line {line}: period '{value}' is not YYYY-MM")
    try:
        year, month = int(text[0:4]), int(text[5:7])
    except ValueError:
        raise SystemExit(f"line {line}: period '{value}' is not YYYY-MM")
    if not 1 <= month <= 12:
        raise SystemExit(f"line {line}: month out of range in '{value}'")
    return year * 12 + (month - 1)


PERIOD_LENGTH = 1


def month_label(index: int) -> str:
    month = index * PERIOD_LENGTH
    return f"{month // 12:04d}-{month % 12 + 1:02d}"


def parse_amount(value: str, line: int) -> float:
    text = (value or "").strip().replace(",", "").replace("$", "")
    if text == "":
        return 0.0
    if text.startswith("(") and text.endswith(")"):
        text = "-" + text[1:-1]
    try:
        return float(text)
    except ValueError:
        raise SystemExit(f"line {line}: revenue '{value}' is not a number")


def load(args):
    handle = sys.stdin if args.path == "-" else open(args.path, newline="", encoding="utf-8-sig")
    with handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames or []
        for required in (args.customer_col, args.period_col):
            if required not in fields:
                raise SystemExit(f"missing column '{required}'; found {fields}")
        has_revenue = args.revenue_col in fields
        if args.segment_value is not None and args.segment_col not in fields:
            raise SystemExit(f"--segment-value given but column '{args.segment_col}' is absent")
        activity = defaultdict(float)  # (customer, month) -> revenue
        seen = set()
        for line, row in enumerate(reader, start=2):
            if args.segment_value is not None and (row.get(args.segment_col) or "").strip() != args.segment_value:
                continue
            customer = (row.get(args.customer_col) or "").strip()
            if not customer:
                raise SystemExit(f"line {line}: empty customer id")
            month = parse_month(row.get(args.period_col, ""), line) // PERIOD_LENGTH
            seen.add((customer, month))
            if has_revenue:
                activity[(customer, month)] += parse_amount(row.get(args.revenue_col, ""), line)
            else:
                activity[(customer, month)] += 0.0
    if not seen:
        raise SystemExit("no rows to analyse after filtering")
    return activity, has_revenue


def build(activity, has_revenue, args):
    active = defaultdict(dict)  # customer -> {month: revenue}
    for (customer, month), revenue in activity.items():
        if has_revenue and not args.count_zero_revenue and revenue <= 0:
            continue
        active[customer][month] = revenue
    active = {c: m for c, m in active.items() if m}
    if not active:
        raise SystemExit("no active customer-months (all revenue <= 0?); try --count-zero-revenue")

    latest = max(max(m) for m in active.values())
    if args.as_of:
        as_of = parse_month(args.as_of, 0) // PERIOD_LENGTH
        if as_of > latest:
            raise SystemExit("--as-of is later than the last month in the data; months with no rows "
                             "would read as churn. Use a month the data covers.")
        latest = as_of
    cohorts = defaultdict(list)
    for customer, months in active.items():
        start = min(months)
        if start <= latest:
            cohorts[start].append(customer)

    results = []
    for start in sorted(cohorts):
        members = cohorts[start]
        base_rev = {c: active[c][start] for c in members}
        base_total = sum(base_rev.values())
        max_k = latest - start
        row = {"cohort": month_label(start), "size": len(members), "start_revenue": base_total, "cells": []}
        alive = set(members)
        for k in range(0, max_k + 1):
            month = start + k
            present = {c for c in members if month in active[c]}
            if args.mode == "survival":
                alive &= present
                counted = alive
            else:
                counted = present
            rev_k = sum(active[c][month] for c in counted)
            capped = sum(min(active[c][month], base_rev[c]) for c in counted)
            reactivated = 0
            if k > 0 and args.mode == "active":
                reactivated = sum(1 for c in counted if (month - 1) not in active[c])
            row["cells"].append({
                "offset": k,
                "month": month_label(month),
                "active": len(counted),
                "reactivated": reactivated,
                "logo": len(counted) / len(members),
                "revenue": rev_k,
                "nrr": (rev_k / base_total) if has_revenue and base_total > 0 else None,
                "grr": (capped / base_total) if has_revenue and base_total > 0 else None,
            })
        results.append(row)

    pooled = []
    max_offset = max(len(r["cells"]) for r in results) - 1
    for k in range(0, max_offset + 1):
        reached = [r for r in results if len(r["cells"]) > k]
        size = sum(r["size"] for r in reached)
        act = sum(r["cells"][k]["active"] for r in reached)
        base = sum(r["start_revenue"] for r in reached)
        rev = sum(r["cells"][k]["revenue"] for r in reached)
        cap = sum((r["cells"][k]["grr"] or 0) * r["start_revenue"] for r in reached)
        pooled.append({
            "offset": k,
            "cohorts": len(reached),
            "logo": act / size if size else None,
            "nrr": rev / base if has_revenue and base > 0 else None,
            "grr": cap / base if has_revenue and base > 0 else None,
        })

    ttm = None
    if has_revenue:
        window = max(1, args.ttm_window // PERIOD_LENGTH)
        base_month = latest - window
        base_customers = [c for c, m in active.items() if base_month in m]
        base_total = sum(active[c][base_month] for c in base_customers)
        if base_customers and base_total > 0:
            end_total = sum(active[c].get(latest, 0.0) for c in base_customers)
            end_capped = sum(min(active[c].get(latest, 0.0), active[c][base_month]) for c in base_customers)
            ttm = {
                "window_months": window * PERIOD_LENGTH,
                "base_month": month_label(base_month),
                "as_of": month_label(latest),
                "customers": len(base_customers),
                "base_revenue": base_total,
                "end_revenue": end_total,
                "nrr": end_total / base_total,
                "grr": end_capped / base_total,
            }
        else:
            ttm = {"window_months": window * PERIOD_LENGTH, "base_month": month_label(base_month),
                   "as_of": month_label(latest), "note": "no revenue in base month; history too short"}
    return {"latest_month": month_label(latest), "mode": args.mode, "has_revenue": has_revenue,
            "min_cohort_size": args.min_cohort_size, "cohorts": results, "pooled": pooled, "ttm": ttm}


def pct(value):
    return "" if value is None else f"{value * 100:.1f}%"


def print_triangle(data, key, title, max_offset):
    cohorts = data["cohorts"]
    width = max(len(r["cells"]) for r in cohorts)
    if max_offset is not None:
        width = min(width, max_offset + 1)
    print(title)
    prefix = "M" if PERIOD_LENGTH == 1 else "P"
    header = ["cohort", "size"] + [f"{prefix}{k}" for k in range(width)]
    print("  ".join(f"{h:>8}" for h in header))
    for r in cohorts:
        flag = "*" if r["size"] < data["min_cohort_size"] else ""
        cells = [pct(c[key]) for c in r["cells"][:width]]
        cells += [""] * (width - len(cells))
        print("  ".join(f"{v:>8}" for v in [r["cohort"] + flag, str(r["size"])] + cells))
    pooled = [pct(p[key]) for p in data["pooled"][:width]]
    print("  ".join(f"{v:>8}" for v in ["pooled", ""] + pooled))
    print()


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path", help="CSV path, or - for stdin")
    parser.add_argument("--customer-col", default="customer_id")
    parser.add_argument("--period-col", default="period")
    parser.add_argument("--revenue-col", default="revenue")
    parser.add_argument("--segment-col", default="segment")
    parser.add_argument("--segment-value")
    parser.add_argument("--mode", choices=["active", "survival"], default="active")
    parser.add_argument("--count-zero-revenue", action="store_true")
    parser.add_argument("--max-offset", type=int)
    parser.add_argument("--min-cohort-size", type=int, default=20)
    parser.add_argument("--ttm-window", type=int, default=12)
    parser.add_argument("--as-of")
    parser.add_argument("--period-length", type=int, default=1)
    parser.add_argument("--out")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    global PERIOD_LENGTH
    if args.period_length < 1:
        raise SystemExit("--period-length must be at least 1")
    PERIOD_LENGTH = args.period_length

    activity, has_revenue = load(args)
    data = build(activity, has_revenue, args)

    if args.out:
        with open(args.out, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["cohort", "cohort_size", "offset", "month", "active", "reactivated",
                             "logo_retention", "revenue", "nrr", "grr"])
            for r in data["cohorts"]:
                for c in r["cells"]:
                    writer.writerow([r["cohort"], r["size"], c["offset"], c["month"], c["active"],
                                     c["reactivated"], round(c["logo"], 6), round(c["revenue"], 2),
                                     "" if c["nrr"] is None else round(c["nrr"], 6),
                                     "" if c["grr"] is None else round(c["grr"], 6)])

    if args.json:
        print(json.dumps(data, indent=2))
        return

    unit = "month" if PERIOD_LENGTH == 1 else f"{PERIOD_LENGTH}-month period (labelled by first month)"
    print(f"Latest {unit} observed: {data['latest_month']}   mode: {data['mode']}")
    print(f"Cohorts marked * have fewer than {data['min_cohort_size']} customers; read them as noisy.")
    print("Blank cells are months not yet observed for that cohort, not zero retention.")
    print()
    print_triangle(data, "logo", "Logo retention (share of cohort customers active)", args.max_offset)
    if has_revenue:
        print_triangle(data, "nrr", "Net revenue retention vs month-0 revenue (includes expansion)", args.max_offset)
        print_triangle(data, "grr", "Gross revenue retention vs month-0 revenue (capped per customer, excludes expansion)", args.max_offset)
        ttm = data["ttm"]
        if ttm and "nrr" in ttm:
            print(f"Trailing {ttm['window_months']}-month retention as of {ttm['as_of']} "
                  f"(customers active in {ttm['base_month']}: {ttm['customers']})")
            print(f"  base revenue {ttm['base_revenue']:.2f} -> end revenue {ttm['end_revenue']:.2f}")
            print(f"  NRR {pct(ttm['nrr'])}   GRR {pct(ttm['grr'])}")
        elif ttm:
            print(f"Trailing {ttm['window_months']}-month retention: {ttm['note']}")
    if args.mode == "active":
        total_react = sum(c["reactivated"] for r in data["cohorts"] for c in r["cells"])
        print(f"Reactivated customer-months counted as active: {total_react} (use --mode survival to exclude)")
    if args.out:
        print(f"Wrote long-format results to {args.out}")


if __name__ == "__main__":
    main()
