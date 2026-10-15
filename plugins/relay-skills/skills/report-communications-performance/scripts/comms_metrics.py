#!/usr/bin/env python3
"""Compute communications metrics with explicit denominators and period-over-period change.

Usage:
    python3 comms_metrics.py data.csv [--current LABEL] [--previous LABEL] [--min-count N]
    cat data.csv | python3 comms_metrics.py - [options]

Input CSV (one row per channel per period). Required columns: channel, period.
Optional numeric columns (leave blank when not applicable):
    delivered      emails delivered (sent minus bounces)
    opens          unique opens reported by the email tool
    clicks         unique clicks (email) or link clicks (social)
    reach          unique accounts that saw content
    impressions    total times content was displayed
    engagements    reactions + comments + shares + saves (define per platform)
    conversions    donations, sign-ups, or registrations credited to the channel
    conversion_value   money value of conversions, if any

Options:
    --current LABEL    period label treated as current (default: last period in file)
    --previous LABEL   period label treated as previous (default: the period before it)
    --min-count N      smallest count treated as a stable base for comparisons (default 30,
                       an assumption to replace with the organization's own threshold)

Output: for each channel, each rate with its formula and denominator, the value in both
periods, the change in percentage points for rates and in percent for counts, and flags:
  SMALL-BASE      a numerator or denominator is below --min-count
  OPENS-DIRECTIONAL   open-based rates are inflated by mail privacy features
  DENOMINATOR-FLIP    engagement rate moves in opposite directions on reach vs impressions
  CTOR-DIVERGES   open rate rose while click-to-open rate fell (a sign opens are inflated)

Standard library only. Reads the path given (or stdin with "-") and prints to stdout.
"""
import argparse
import csv
import sys

FIELDS = ["delivered", "opens", "clicks", "reach", "impressions",
          "engagements", "conversions", "conversion_value"]

RATES = [
    # name, numerator, denominator, formula text, directional flag
    ("open rate", "opens", "delivered", "unique opens / delivered", True),
    ("click rate", "clicks", "delivered", "unique clicks / delivered", False),
    ("click-to-open rate", "clicks", "opens", "unique clicks / unique opens", True),
    ("engagement rate (by reach)", "engagements", "reach", "engagements / reach", False),
    ("engagement rate (by impressions)", "engagements", "impressions",
     "engagements / impressions", False),
    ("click-through rate (social)", "clicks", "impressions", "link clicks / impressions", False),
    ("conversion rate (per click)", "conversions", "clicks", "conversions / clicks", False),
]
COUNTS = ["delivered", "reach", "impressions", "engagements", "clicks",
          "conversions", "conversion_value"]


def num(value):
    value = (value or "").strip().replace(",", "").replace("$", "")
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def load(path):
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8")
    try:
        reader = csv.DictReader(handle)
        rows = []
        for raw in reader:
            row = {k.strip().lower(): v for k, v in raw.items() if k}
            if not row.get("channel") or not row.get("period"):
                continue
            rec = {"channel": row["channel"].strip(), "period": row["period"].strip()}
            for field in FIELDS:
                rec[field] = num(row.get(field))
            rows.append(rec)
        return rows
    finally:
        if handle is not sys.stdin:
            handle.close()


def rate(rec, n, d):
    if rec is None or rec.get(n) is None or not rec.get(d):
        return None
    return rec[n] / rec[d]


def fmt_pct(x):
    return "n/a" if x is None else f"{x * 100:.1f}%"


def fmt_num(x):
    if x is None:
        return "n/a"
    return f"{x:,.0f}" if float(x).is_integer() else f"{x:,.2f}"


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path")
    parser.add_argument("--current")
    parser.add_argument("--previous")
    parser.add_argument("--min-count", type=float, default=30)
    args = parser.parse_args()

    rows = load(args.path)
    if not rows:
        sys.exit("No rows with channel and period found.")
    periods = []
    for rec in rows:
        if rec["period"] not in periods:
            periods.append(rec["period"])
    current = args.current or periods[-1]
    if args.previous:
        previous = args.previous
    else:
        idx = periods.index(current) if current in periods else len(periods) - 1
        previous = periods[idx - 1] if idx > 0 else None

    data = {(r["channel"], r["period"]): r for r in rows}
    channels = []
    for rec in rows:
        if rec["channel"] not in channels:
            channels.append(rec["channel"])

    print(f"Current period: {current}   Previous period: {previous or 'none'}   "
          f"Stable-base threshold (assumption): {args.min_count:g}")
    for ch in channels:
        cur = data.get((ch, current))
        prev = data.get((ch, previous)) if previous else None
        if cur is None:
            continue
        print(f"\n== {ch} ==")
        print("Counts:")
        for field in COUNTS:
            c = cur.get(field)
            if c is None:
                continue
            p = prev.get(field) if prev else None
            change = "n/a"
            if p:
                change = f"{(c - p) / p * 100:+.1f}%"
            base_field = "conversions" if field == "conversion_value" else field
            bc = cur.get(base_field)
            bp = prev.get(base_field) if prev else None
            small = " SMALL-BASE" if (bc is not None and bc < args.min_count) or (
                bp is not None and bp < args.min_count) else ""
            print(f"  {field}: {fmt_num(c)} (previous {fmt_num(p)}, change {change}){small}")
        print("Rates (formula | current | previous | change in percentage points | flags):")
        found = {}
        for name, n, d, formula, directional in RATES:
            rc = rate(cur, n, d)
            if rc is None:
                continue
            rp = rate(prev, n, d)
            found[name] = (rc, rp)
            delta = "n/a" if rp is None else f"{(rc - rp) * 100:+.1f} pts"
            flags = []
            for rec in (cur, prev):
                if rec and ((rec.get(n) or 0) < args.min_count or (rec.get(d) or 0) < args.min_count):
                    flags.append("SMALL-BASE")
                    break
            if directional:
                flags.append("OPENS-DIRECTIONAL")
            print(f"  {name}: {formula} | {fmt_pct(rc)} | {fmt_pct(rp)} | {delta}"
                  f"{' | ' + ', '.join(flags) if flags else ''}")
        reach_r = found.get("engagement rate (by reach)")
        imp_r = found.get("engagement rate (by impressions)")
        if reach_r and imp_r and reach_r[1] is not None and imp_r[1] is not None:
            dr = reach_r[0] - reach_r[1]
            di = imp_r[0] - imp_r[1]
            if dr * di < 0:
                print("  DENOMINATOR-FLIP: engagement rate rises on one denominator and falls on "
                      "the other; report both and explain before calling a trend.")
        o = found.get("open rate")
        ct = found.get("click-to-open rate")
        if o and ct and o[1] is not None and ct[1] is not None and o[0] > o[1] and ct[0] < ct[1]:
            print("  CTOR-DIVERGES: open rate rose while click-to-open fell; opens are likely "
                  "inflated (for example by mail privacy features). Use click rate for trends.")


if __name__ == "__main__":
    main()
