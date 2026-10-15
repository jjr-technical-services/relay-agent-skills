#!/usr/bin/env python3
"""Build a fundraising campaign goal from the organization's own history.

Usage:
  python3 campaign_goal.py SEGMENTS.csv [options]
  cat SEGMENTS.csv | python3 campaign_goal.py - [options]

SEGMENTS.csv columns (one row per audience segment):
  segment         name, e.g. "Last year-end donors"
  audience        number of people who will receive the ask
  response_rate   share who gave in the comparable past campaign, as 0.05 or 5%
  avg_gift        average gift from that segment in the comparable campaign
Optional columns for a range (fall back to the base value when blank):
  response_rate_low, response_rate_high, avg_gift_low, avg_gift_high
Optional column:
  match_eligible  yes/no (default yes); whether gifts count toward a match

Formula per segment and scenario:
  expected donors  = audience x response_rate
  expected revenue = expected donors x avg_gift
Match (if --match-cap is set):
  match = min(match cap, match ratio x revenue from match-eligible segments)
Goal = segment revenue + committed leadership gifts + match.

Options:
  --leadership N       gifts already committed in writing for this campaign
  --match-cap N        maximum the matching donor will give
  --match-ratio R      matcher dollars per donor dollar (default 1 for 1:1)
  --costs N            direct campaign costs, for net revenue and cost per
                       dollar raised (cost / gross revenue)
  --requested-goal N   a goal someone proposed; prints the gap to it

Rates and averages must come from the organization's own past results.
Standard library only; no network; prints results and writes nothing.
"""
import argparse
import csv
import sys


def num(text, is_rate=False):
    if text is None:
        return None
    t = str(text).strip().replace(",", "").replace("$", "")
    if t == "":
        return None
    if t.endswith("%"):
        return float(t[:-1]) / 100.0
    v = float(t)
    if is_rate and v > 1:
        sys.exit(f"Rate {text} looks like a percent; write 5% or 0.05")
    return v


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("segments", help="segments CSV path, or - for stdin")
    ap.add_argument("--leadership", type=float, default=0.0)
    ap.add_argument("--match-cap", type=float)
    ap.add_argument("--match-ratio", type=float, default=1.0)
    ap.add_argument("--costs", type=float)
    ap.add_argument("--requested-goal", type=float)
    args = ap.parse_args()

    handle = sys.stdin if args.segments == "-" else open(args.segments, newline="", encoding="utf-8-sig")
    with handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        sys.exit("No segment rows found.")

    scenarios = ("low", "base", "high")
    totals = {s: 0.0 for s in scenarios}
    eligible = {s: 0.0 for s in scenarios}
    donors = {s: 0.0 for s in scenarios}
    print("Segment build-up (expected donors = audience x response rate; revenue = donors x average gift)")
    print("segment,scenario,audience,response_rate,avg_gift,expected_donors,expected_revenue")
    for r in rows:
        audience = num(r.get("audience"))
        base_rate = num(r.get("response_rate"), True)
        base_gift = num(r.get("avg_gift"))
        if audience is None or base_rate is None or base_gift is None:
            sys.exit(f"Row {r.get('segment')!r} needs audience, response_rate and avg_gift")
        is_eligible = str(r.get("match_eligible") or "yes").strip().lower() not in ("no", "n", "false", "0")
        for s in scenarios:
            rate, gift = base_rate, base_gift
            if s != "base":
                alt_rate = num(r.get(f"response_rate_{s}"), True)
                alt_gift = num(r.get(f"avg_gift_{s}"))
                rate = base_rate if alt_rate is None else alt_rate
                gift = base_gift if alt_gift is None else alt_gift
            d = audience * rate
            rev = d * gift
            totals[s] += rev
            donors[s] += d
            if is_eligible:
                eligible[s] += rev
            print(f"{r.get('segment')},{s},{audience:.0f},{rate:.4f},{gift:.2f},{d:.1f},{rev:.2f}")

    print("\nScenario totals")
    for s in scenarios:
        match = 0.0
        if args.match_cap:
            match = min(args.match_cap, args.match_ratio * eligible[s])
        goal = totals[s] + args.leadership + match
        line = (f"  {s}: donors {donors[s]:.0f}; segment revenue {totals[s]:,.2f}; "
                f"leadership {args.leadership:,.2f}; match {match:,.2f}; goal {goal:,.2f}")
        if args.costs is not None and goal > 0:
            line += f"; net {goal - args.costs:,.2f}; cost per dollar raised {args.costs / goal:.3f}"
        if args.requested_goal is not None:
            line += f"; gap to requested goal {args.requested_goal - goal:,.2f}"
        print(line)
        if args.match_cap and args.match_ratio * eligible[s] < args.match_cap:
            print(f"    note: match not fully earned in {s}; eligible gifts cover "
                  f"{args.match_ratio * eligible[s]:,.2f} of the {args.match_cap:,.2f} cap")


if __name__ == "__main__":
    main()
