#!/usr/bin/env python3
"""Roll a weekly direct-method cash forecast from dated inflows and outflows.

Usage:
  python3 cash_forecast.py flows.csv --opening-balance 250000 --start-date 2026-01-05 [options]
  cat flows.csv | python3 cash_forecast.py - --opening-balance 250000 [options]

Input CSV, one row per expected cash movement:
  date          YYYY-MM-DD the cash is expected to clear the bank
  amount        signed number: positive = receipt, negative = disbursement.
                "1,200", "$1200" and "(1200)" are accepted.
  category      optional label (e.g. customer receipts, payroll, rent, tax)
  direction     optional "in"/"receipt" or "out"/"disbursement". When present,
                amount is read as a positive value on that side, and a negative
                amount is an adjustment that reduces that side (useful for a
                downside scenario row such as a receipt that slips).
  scenario      optional label; rows with a scenario other than the one chosen
                by --scenario are ignored (rows with a blank scenario always apply)

What it does:
  - Buckets each flow into forecast weeks of 7 days starting at --start-date
    (default: the Monday on or before the earliest flow date).
  - Rolls closing = opening + receipts - disbursements week by week.
  - Flags any week whose closing balance is below --min-balance, and, when
    --credit-available is given, shows liquidity = closing cash + undrawn credit
    and flags weeks where liquidity is below --min-liquidity.
  - Optionally compares an actuals CSV (same columns) to the forecast by week
    and category (--actuals), for the variance-to-actual loop.

Options:
  --opening-balance N     bank cash at the start of week 1 (required)
  --start-date YYYY-MM-DD first day of week 1
  --weeks N               number of weeks (default 13)
  --min-balance N         minimum cash buffer to test against (default 0)
  --credit-available N    undrawn committed credit line at the start
  --min-liquidity N       minimum cash + undrawn credit, e.g. a covenant test
  --scenario NAME         include rows tagged with this scenario
  --by-category           also print a category x week table
  --actuals PATH          CSV of actual flows to compare with the forecast
  --out PATH              also write the weekly roll-forward as CSV to PATH

Undrawn credit is shown as headroom only; the script never assumes a draw.
Model a planned draw or repayment as its own row with category "revolver":
a draw (positive) adds to cash and reduces undrawn credit by the same amount,
a repayment (negative) does the reverse, so liquidity is not double counted.
The script reads only the files you pass and writes only to --out.
"""

from __future__ import annotations

import argparse
import csv
import sys
from collections import defaultdict
from datetime import date, timedelta


def parse_date(value: str, line: int) -> date:
    text = (value or "").strip()[:10]
    try:
        return date.fromisoformat(text)
    except ValueError:
        raise SystemExit(f"line {line}: date '{value}' is not YYYY-MM-DD")


def parse_amount(value: str, line: int) -> float:
    text = (value or "").strip().replace(",", "").replace("$", "")
    if text.startswith("(") and text.endswith(")"):
        text = "-" + text[1:-1]
    try:
        return float(text)
    except ValueError:
        raise SystemExit(f"line {line}: amount '{value}' is not a number")


def read_flows(path: str, scenario: str | None):
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    rows = []
    with handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames or []
        for required in ("date", "amount"):
            if required not in fields:
                raise SystemExit(f"{path}: missing column '{required}'; found {fields}")
        for line, row in enumerate(reader, start=2):
            tag = (row.get("scenario") or "").strip()
            if tag and tag != scenario:
                continue
            amount = parse_amount(row.get("amount", ""), line)
            direction = (row.get("direction") or "").strip().lower()
            if direction in ("in", "receipt", "inflow"):
                kind = "in"
            elif direction in ("out", "disbursement", "outflow"):
                kind, amount = "out", -amount
            elif direction:
                raise SystemExit(f"{path} line {line}: unknown direction '{direction}'")
            else:
                kind = "in" if amount >= 0 else "out"
            category = (row.get("category") or "").strip() or ("uncategorised receipts" if kind == "in" else "uncategorised disbursements")
            rows.append((parse_date(row.get("date", ""), line), amount, category, kind))
    return rows


def bucket(rows, start: date, weeks: int):
    by_week = defaultdict(lambda: {"in": 0.0, "out": 0.0})
    by_cat = defaultdict(lambda: defaultdict(float))
    before, after = [], []
    for when, amount, category, kind in rows:
        index = (when - start).days // 7
        if index < 0:
            before.append(amount)
            continue
        if index >= weeks:
            after.append(amount)
            continue
        if kind == "in":
            by_week[index]["in"] += amount
        else:
            by_week[index]["out"] += -amount
        by_cat[category][index] += amount
    return by_week, by_cat, before, after


def money(value: float) -> str:
    return f"{value:,.0f}"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path", help="CSV of forecast flows, or - for stdin")
    parser.add_argument("--opening-balance", type=float, required=True)
    parser.add_argument("--start-date")
    parser.add_argument("--weeks", type=int, default=13)
    parser.add_argument("--min-balance", type=float, default=0.0)
    parser.add_argument("--credit-available", type=float)
    parser.add_argument("--min-liquidity", type=float)
    parser.add_argument("--scenario")
    parser.add_argument("--by-category", action="store_true")
    parser.add_argument("--actuals")
    parser.add_argument("--out")
    args = parser.parse_args()

    rows = read_flows(args.path, args.scenario)
    if not rows:
        raise SystemExit("no flows to forecast")
    if args.start_date:
        start = parse_date(args.start_date, 0)
    else:
        first = min(r[0] for r in rows)
        start = first - timedelta(days=first.weekday())
    by_week, by_cat, before, after = bucket(rows, start, args.weeks)

    table = []
    balance = args.opening_balance
    revolver = next((by_cat[c] for c in by_cat if c.lower() == "revolver"), {})
    drawn = 0.0
    for week in range(args.weeks):
        opening = balance
        receipts = by_week[week]["in"]
        disbursements = by_week[week]["out"]
        closing = opening + receipts - disbursements
        balance = closing
        drawn += revolver.get(week, 0.0)
        liquidity = closing + args.credit_available - drawn if args.credit_available is not None else None
        flags = []
        if closing < args.min_balance:
            flags.append("BELOW MIN CASH")
        if closing < 0:
            flags.append("NEGATIVE")
        if liquidity is not None and args.min_liquidity is not None and liquidity < args.min_liquidity:
            flags.append("BELOW MIN LIQUIDITY")
        week_start = start + timedelta(days=7 * week)
        table.append({
            "week": week + 1,
            "start": week_start.isoformat(),
            "end": (week_start + timedelta(days=6)).isoformat(),
            "opening": opening,
            "receipts": receipts,
            "disbursements": disbursements,
            "net": receipts - disbursements,
            "closing": closing,
            "headroom_vs_min": closing - args.min_balance,
            "liquidity": liquidity,
            "flags": "; ".join(flags),
        })

    scenario_label = args.scenario or "base (untagged rows only)"
    print(f"13-week style cash roll-forward   scenario: {scenario_label}")
    print(f"Week 1 starts {start.isoformat()}; opening bank balance {money(args.opening_balance)}; "
          f"minimum cash {money(args.min_balance)}")
    header = ["wk", "week start", "opening", "receipts", "disbursed", "net", "closing", "vs min"]
    if args.credit_available is not None:
        header.append("liquidity")
    header.append("flags")
    print("  ".join(f"{h:>11}" for h in header))
    for r in table:
        cells = [str(r["week"]), r["start"], money(r["opening"]), money(r["receipts"]),
                 money(r["disbursements"]), money(r["net"]), money(r["closing"]), money(r["headroom_vs_min"])]
        if args.credit_available is not None:
            cells.append(money(r["liquidity"]))
        cells.append(r["flags"])
        print("  ".join(f"{c:>11}" for c in cells))

    low = min(table, key=lambda r: r["closing"])
    total_in = sum(r["receipts"] for r in table)
    total_out = sum(r["disbursements"] for r in table)
    print()
    print(f"Total receipts {money(total_in)}; total disbursements {money(total_out)}; "
          f"net {money(total_in - total_out)}; ending cash {money(table[-1]['closing'])}")
    print(f"Lowest closing balance {money(low['closing'])} in week {low['week']} (starting {low['start']})")
    flagged = [r for r in table if r["flags"]]
    if flagged:
        print("Weeks flagged: " + ", ".join(f"{r['week']} ({r['flags']})" for r in flagged))
    else:
        print("No week falls below the minimum thresholds given.")
    if before:
        print(f"Excluded {len(before)} flow(s) dated before week 1 (net {money(sum(before))}). "
              "Confirm they are already reflected in the opening bank balance.")
    if after:
        print(f"Excluded {len(after)} flow(s) dated after the horizon (net {money(sum(after))}).")

    if args.by_category:
        print()
        print("Net flow by category and week (receipts positive, disbursements negative)")
        print("  ".join([f"{'category':<28}"] + [f"{'W' + str(w + 1):>9}" for w in range(args.weeks)] + [f"{'total':>10}"]))
        for category in sorted(by_cat):
            values = [by_cat[category].get(w, 0.0) for w in range(args.weeks)]
            print("  ".join([f"{category[:28]:<28}"] + [f"{money(v):>9}" for v in values] + [f"{money(sum(values)):>10}"]))

    if args.actuals:
        actual_rows = read_flows(args.actuals, args.scenario)
        _, actual_cat, _, _ = bucket(actual_rows, start, args.weeks)
        weeks_with_actuals = sorted({w for c in actual_cat.values() for w in c})
        print()
        if not weeks_with_actuals:
            print("Actuals file has no flows inside the forecast horizon.")
        else:
            print("Variance to actual by category (actual - forecast; positive = more cash than forecast)")
            print("  ".join([f"{'week':>5}", f"{'category':<28}", f"{'forecast':>11}", f"{'actual':>11}", f"{'variance':>11}"]))
            for week in weeks_with_actuals:
                for category in sorted(set(by_cat) | set(actual_cat)):
                    f_val = by_cat.get(category, {}).get(week, 0.0)
                    a_val = actual_cat.get(category, {}).get(week, 0.0)
                    if f_val == 0 and a_val == 0:
                        continue
                    print("  ".join([f"{week + 1:>5}", f"{category[:28]:<28}", f"{money(f_val):>11}",
                                     f"{money(a_val):>11}", f"{money(a_val - f_val):>11}"]))
                f_net = sum(c.get(week, 0.0) for c in by_cat.values())
                a_net = sum(c.get(week, 0.0) for c in actual_cat.values())
                print("  ".join([f"{week + 1:>5}", f"{'NET':<28}", f"{money(f_net):>11}",
                                 f"{money(a_net):>11}", f"{money(a_net - f_net):>11}"]))

    if args.out:
        with open(args.out, "w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(table[0].keys()))
            writer.writeheader()
            for r in table:
                writer.writerow(r)
        print(f"Wrote weekly roll-forward to {args.out}")


if __name__ == "__main__":
    main()
