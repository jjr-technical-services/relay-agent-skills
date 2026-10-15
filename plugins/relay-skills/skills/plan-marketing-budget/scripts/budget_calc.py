#!/usr/bin/env python3
"""Marketing budget calculations: pipeline back-solve and marginal-CAC allocation.

Usage:
    python3 budget_calc.py backsolve CHANNELS.csv --revenue-target 1200000 --avg-deal 20000
                                     [--fixed-costs 360000] [--max-cac 12000]
    python3 budget_calc.py marginal RESPONSE.csv [--budget 40000] [--max-cac 500]
    Use '-' instead of a path to read the CSV from stdin.

backsolve CSV columns (header required):
    channel       channel name
    share         share of the revenue target this channel must deliver (fractions summing to 1)
    win_rate      opportunity-to-win rate for this channel, as a fraction
    lead_to_opp   lead-to-opportunity rate for this channel, as a fraction
    cost_per_lead optional; program cost per lead
    avg_deal      optional; overrides --avg-deal for this channel
  Prints revenue, deals, opportunities, leads, program cost, and program CAC
  per channel, then totals and, with --fixed-costs, fully loaded CAC.

marginal CSV columns (header required):
    channel, spend, customers   one row per observed spend level per channel
  A zero-spend, zero-customer starting point is assumed unless a spend of 0 is given.
  Prints average and marginal CAC for each increment. With --budget, allocates
  whole increments in order of lowest marginal CAC until the budget is used or
  the next increment's marginal CAC exceeds --max-cac. Assumes diminishing
  returns (marginal CAC rising within each channel) and warns when it does not.

Reads only the given file or stdin, prints to stdout, standard library only.
Inputs are the user's own data; the script adds no benchmarks.
"""

from __future__ import annotations

import argparse
import csv
import sys
from collections import OrderedDict


def read_csv(path: str, required: list[str]) -> list[dict[str, str]]:
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    try:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise SystemExit("error: empty input")
        names = [n.strip().lower() for n in reader.fieldnames]
        missing = [r for r in required if r not in names]
        if missing:
            raise SystemExit(f"error: missing columns: {', '.join(missing)}")
        return [{k.strip().lower(): (v or "").strip() for k, v in row.items() if k} for row in reader
                if any((v or "").strip() for v in row.values())]
    finally:
        if handle is not sys.stdin:
            handle.close()


def num(row: dict[str, str], key: str, label: str) -> float:
    try:
        return float(row[key].replace(",", "").replace("$", ""))
    except (KeyError, ValueError):
        raise SystemExit(f"error: '{key}' is missing or not a number for {label}")


def money(x: float) -> str:
    return f"{x:,.0f}"


def cmd_backsolve(a: argparse.Namespace) -> None:
    rows = read_csv(a.csv_path, ["channel", "share", "win_rate", "lead_to_opp"])
    total_share = 0.0
    totals = {"revenue": 0.0, "deals": 0.0, "opps": 0.0, "leads": 0.0, "cost": 0.0}
    cost_known = True
    print("channel | share | revenue | avg_deal | deals | win_rate | opportunities | lead_to_opp | leads "
          "| cost_per_lead | program_cost | program_CAC")
    for r in rows:
        name = r["channel"]
        share = num(r, "share", name)
        win = num(r, "win_rate", name)
        l2o = num(r, "lead_to_opp", name)
        if not (0 < win <= 1 and 0 < l2o <= 1):
            raise SystemExit(f"error: rates for {name} must be fractions between 0 and 1")
        deal = num(r, "avg_deal", name) if r.get("avg_deal") else a.avg_deal
        if not deal or deal <= 0:
            raise SystemExit(f"error: no average deal size for {name}; pass --avg-deal or an avg_deal column")
        revenue = a.revenue_target * share
        deals = revenue / deal
        opps = deals / win
        leads = opps / l2o
        cpl = num(r, "cost_per_lead", name) if r.get("cost_per_lead") else None
        cost = leads * cpl if cpl is not None else None
        if cost is None:
            cost_known = False
        total_share += share
        totals["revenue"] += revenue
        totals["deals"] += deals
        totals["opps"] += opps
        totals["leads"] += leads
        totals["cost"] += cost or 0.0
        print(" | ".join([
            name, f"{share:.1%}", money(revenue), money(deal), f"{deals:,.1f}", f"{win:.1%}", f"{opps:,.1f}",
            f"{l2o:.1%}", f"{leads:,.0f}", money(cpl) if cpl is not None else "n/a",
            money(cost) if cost is not None else "n/a",
            money(cost / deals) if cost is not None and deals else "n/a",
        ]))
    print(f"TOTAL | {total_share:.1%} | {money(totals['revenue'])} | | {totals['deals']:,.1f} | | "
          f"{totals['opps']:,.1f} | | {totals['leads']:,.0f} | | "
          f"{money(totals['cost']) + ('' if cost_known else ' (some channels lack cost_per_lead)')} | "
          f"{money(totals['cost'] / totals['deals']) if totals['deals'] and cost_known else 'n/a'}")
    if abs(total_share - 1.0) > 0.001:
        print(f"WARNING: channel shares sum to {total_share:.1%}, not 100%. "
              "The remainder must come from sources outside this plan (for example, sales-sourced).")
    if a.fixed_costs is not None and totals["deals"] and not cost_known:
        print("fully loaded CAC not computed: add cost_per_lead for every channel first")
    elif a.fixed_costs is not None and totals["deals"]:
        loaded = (totals["cost"] + a.fixed_costs) / totals["deals"]
        print(f"fully loaded CAC (program + fixed {money(a.fixed_costs)}) = {money(loaded)}")
        if a.max_cac is not None:
            verdict = "within" if loaded <= a.max_cac else "ABOVE"
            print(f"maximum acceptable CAC {money(a.max_cac)}: plan is {verdict} the limit")
    print("Shift each quarter's lead requirement one sales cycle earlier than the quarter its deals close.")


def cmd_marginal(a: argparse.Namespace) -> None:
    rows = read_csv(a.csv_path, ["channel", "spend", "customers"])
    curves: "OrderedDict[str, list[tuple[float, float]]]" = OrderedDict()
    for r in rows:
        curves.setdefault(r["channel"], []).append((num(r, "spend", r["channel"]), num(r, "customers", r["channel"])))
    increments: "OrderedDict[str, list[tuple[float, float, float]]]" = OrderedDict()
    for ch, pts in curves.items():
        pts = sorted(set(pts))
        if pts[0][0] != 0:
            pts.insert(0, (0.0, 0.0))
        print(f"\n== {ch} ==")
        print("spend | customers | average_CAC | increment_spend | increment_customers | marginal_CAC")
        incs = []
        prev_m = None
        for i in range(1, len(pts)):
            s0, c0 = pts[i - 1]
            s1, c1 = pts[i]
            ds, dc = s1 - s0, c1 - c0
            m = ds / dc if dc > 0 else float("inf")
            avg = s1 / c1 if c1 > 0 else float("inf")
            print(f"{money(s1)} | {c1:,.0f} | {money(avg) if avg != float('inf') else 'n/a'} | {money(ds)} | "
                  f"{dc:,.0f} | {money(m) if m != float('inf') else 'no added customers'}")
            if prev_m is not None and m < prev_m:
                print("  WARNING: marginal CAC fell as spend rose. Check for seasonality, a minimum-scale "
                      "threshold, or noise before trusting the curve.")
            prev_m = m
            incs.append((ds, dc, m))
        increments[ch] = incs

    if a.budget is None:
        return
    print(f"\n== allocation of {money(a.budget)} by lowest marginal CAC ==")
    remaining = a.budget
    position = {ch: 0 for ch in increments}
    alloc = {ch: [0.0, 0.0] for ch in increments}
    while True:
        options = [(increments[ch][position[ch]][2], ch) for ch in increments if position[ch] < len(increments[ch])]
        options = [(m, ch) for m, ch in options if increments[ch][position[ch]][0] <= remaining]
        if a.max_cac is not None:
            options = [(m, ch) for m, ch in options if m <= a.max_cac]
        if not options:
            break
        m, ch = min(options)
        ds, dc, _ = increments[ch][position[ch]]
        alloc[ch][0] += ds
        alloc[ch][1] += dc
        remaining -= ds
        position[ch] += 1
        print(f"fund {ch} increment of {money(ds)} at marginal CAC {money(m)} (+{dc:,.0f} customers)")
    total_c = sum(v[1] for v in alloc.values())
    for ch, (s, c) in alloc.items():
        print(f"{ch}: spend {money(s)}, customers {c:,.0f}")
    print(f"total customers {total_c:,.0f}; unallocated {money(remaining)}")
    if remaining > 0:
        print("Unallocated money: no remaining increment fits the budget or clears the CAC ceiling. "
              "Hold it, test a new channel, or return it.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pipeline back-solve and marginal-CAC allocation.")
    sub = parser.add_subparsers(dest="command", required=True)
    b = sub.add_parser("backsolve", help="revenue target to deals, opportunities, leads, and cost by channel")
    b.add_argument("csv_path")
    b.add_argument("--revenue-target", type=float, required=True)
    b.add_argument("--avg-deal", type=float)
    b.add_argument("--fixed-costs", type=float)
    b.add_argument("--max-cac", type=float)
    b.set_defaults(handler=cmd_backsolve)
    m = sub.add_parser("marginal", help="average vs marginal CAC and greedy allocation")
    m.add_argument("csv_path")
    m.add_argument("--budget", type=float)
    m.add_argument("--max-cac", type=float)
    m.set_defaults(handler=cmd_marginal)
    args = parser.parse_args()
    args.handler(args)


if __name__ == "__main__":
    main()
