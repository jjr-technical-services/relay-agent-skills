#!/usr/bin/env python3
"""Sales commission payout curve calculator.

Computes variable payout, total earnings, and rep cost of sales at chosen
attainment points for a tiered commission plan, and checks that the plan pays
exactly the target variable at 100 percent attainment.

Base commission rate (BCR) = target variable / quota.
Each tier is "upper attainment bound:multiplier", where the tier rate is
BCR x multiplier and applies to bookings between the previous bound and this
bound. The last tier's bound may be "inf".

Usage:
    python3 payout_curve.py --quota 1000000 --target-variable 100000 \
        --base 100000 --tiers "0.5:0.5,1.0:1.5,inf:2.0"

Options:
    --attainment 0.5,0.8,1.0,1.2,1.5   attainment points to model (default)
    --cap 2.0                          cap variable payout at this multiple
                                       of target variable (default: no cap)
    --distribution PATH                optional CSV (or - for stdin) with an
                                       "attainment" column, one row per rep,
                                       to estimate expected total cost
                                       (1.2, 120 and 120% all mean 120 percent)

The script reads only; it writes nothing and uses no network.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys


def parse_tiers(text: str) -> list[tuple[float, float]]:
    tiers = []
    previous = 0.0
    for part in text.split(","):
        try:
            bound_text, mult_text = part.split(":")
            bound = math.inf if bound_text.strip().lower() == "inf" else float(bound_text)
            mult = float(mult_text)
        except ValueError:
            sys.exit(f"error: bad tier {part!r}; expected 'bound:multiplier'")
        if bound <= previous:
            sys.exit("error: tier bounds must increase")
        if mult < 0:
            sys.exit("error: multipliers cannot be negative")
        tiers.append((bound, mult))
        previous = bound
    if tiers[-1][0] != math.inf:
        tiers.append((math.inf, tiers[-1][1]))
        print(f"note: no 'inf' tier given; last multiplier {tiers[-1][1]} extended above {previous}")
    return tiers


def payout_multiple(attainment: float, tiers: list[tuple[float, float]]) -> float:
    """Variable payout as a multiple of target variable at a given attainment."""
    total = 0.0
    lower = 0.0
    for bound, mult in tiers:
        if attainment <= lower:
            break
        width = min(attainment, bound) - lower
        total += width * mult
        lower = bound
    return total


def marginal_multiplier(attainment: float, tiers: list[tuple[float, float]]) -> float:
    lower = 0.0
    for bound, mult in tiers:
        if lower <= attainment < bound:
            return mult
        lower = bound
    return tiers[-1][1]


def read_distribution(path: str) -> list[float]:
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    with handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or "attainment" not in [f.strip().lower() for f in reader.fieldnames]:
            sys.exit("error: distribution CSV needs an 'attainment' column")
        key = next(f for f in reader.fieldnames if f.strip().lower() == "attainment")
        values = []
        for line, row in enumerate(reader, start=2):
            text = (row.get(key) or "").strip()
            has_percent = text.endswith("%")
            raw = text.rstrip("%").strip()
            try:
                value = float(raw)
            except ValueError:
                sys.exit(f"error: line {line}: attainment is not a number: {raw!r}")
            # "120%" is always a percentage; a bare number above 5 is read as a
            # percentage (120 -> 1.2), otherwise as a fraction (1.2).
            values.append(value / 100 if has_percent or value > 5 else value)
    if not values:
        sys.exit("error: distribution CSV has no rows")
    return values


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--quota", type=float, required=True)
    parser.add_argument("--target-variable", type=float, required=True)
    parser.add_argument("--base", type=float, default=0.0)
    parser.add_argument("--tiers", default="inf:1.0", help='e.g. "0.5:0.5,1.0:1.5,inf:2.0"')
    parser.add_argument("--attainment", default="0.5,0.8,1.0,1.2,1.5")
    parser.add_argument("--cap", type=float, default=None)
    parser.add_argument("--distribution", default=None)
    args = parser.parse_args()

    if args.quota <= 0 or args.target_variable <= 0 or args.base < 0:
        sys.exit("error: quota and target variable must be positive; base cannot be negative")
    tiers = parse_tiers(args.tiers)
    bcr = args.target_variable / args.quota
    points = [float(x) for x in args.attainment.split(",")]

    def variable_at(a: float) -> float:
        multiple = payout_multiple(a, tiers)
        if args.cap is not None:
            multiple = min(multiple, args.cap)
        return multiple * args.target_variable

    ote = args.base + args.target_variable
    print(f"BCR = target variable / quota = {args.target_variable:,.0f} / {args.quota:,.0f} = {bcr:.4%}")
    print(f"OTE = {ote:,.0f}; pay mix = {args.base / ote:.0%} base / {args.target_variable / ote:.0%} variable")
    print(f"quota-to-OTE multiple = {args.quota / ote:.2f}")
    at_100 = payout_multiple(1.0, tiers)
    if abs(at_100 - 1.0) > 1e-9:
        print(f"WARNING: payout at 100% attainment is {at_100:.3f} x target variable, not 1.000; recalibrate tiers")
    else:
        print("check: payout at 100% attainment equals target variable")
    print()
    print("marginal_rate is the rate on the next unit of bookings above that point")
    print("attainment,bookings,variable_payout,pct_of_target_variable,total_earnings,cost_of_sales,marginal_rate")
    for a in points:
        bookings = args.quota * a
        variable = variable_at(a)
        total = args.base + variable
        cos = total / bookings if bookings else float("nan")
        marginal = bcr * marginal_multiplier(a, tiers)
        if args.cap is not None and payout_multiple(a, tiers) >= args.cap:
            marginal = 0.0
        print(f"{a:.0%},{bookings:.0f},{variable:.0f},{variable / args.target_variable:.0%},"
              f"{total:.0f},{cos:.2%},{marginal:.2%}")

    if args.distribution:
        dist = read_distribution(args.distribution)
        variable_total = sum(variable_at(a) for a in dist)
        bookings_total = sum(args.quota * a for a in dist)
        base_total = args.base * len(dist)
        mean_a = sum(dist) / len(dist)
        print()
        print(f"reps: {len(dist)}; mean attainment {mean_a:.0%}")
        print(f"expected variable cost {variable_total:,.0f} (payout at mean attainment x reps would be "
              f"{variable_at(mean_a) * len(dist):,.0f})")
        print(f"expected total cost {base_total + variable_total:,.0f}; bookings {bookings_total:,.0f}; "
              f"plan cost of sales {(base_total + variable_total) / bookings_total:.2%}")


if __name__ == "__main__":
    main()
