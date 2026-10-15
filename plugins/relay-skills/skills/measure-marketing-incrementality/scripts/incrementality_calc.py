#!/usr/bin/env python3
"""Size and analyze a randomized marketing holdout test.

Usage:
    python3 incrementality_calc.py power --baseline 0.02 --lift 0.10 [--treatment-share 0.9]
                                         [--alpha 0.05] [--power 0.8]
    python3 incrementality_calc.py analyze --n-treat 900000 --conv-treat 19800
                                           --n-control 100000 --conv-control 2000
                                           [--spend 90000] [--value-per-conversion 120]
                                           [--attributed 6000]

power:
    --baseline          conversion rate expected in the control (holdout) group, as a fraction
    --lift              smallest relative lift worth acting on (0.10 = +10%)
    --treatment-share   share of the eligible audience in treatment (0.5 = equal split)
    Prints the sample needed in each group and in total (two-sided test).

analyze:
    Prints conversion rates, absolute and relative lift, a 95% interval on the
    absolute lift (unpooled normal approximation), a two-sided z statistic,
    incremental conversions with interval, and, when the optional inputs are
    given, incremental cost per acquisition (iCPA), incremental return on ad
    spend (iROAS), and the incrementality factor versus platform-attributed
    conversions.

The script takes numbers as arguments, reads no files, writes no files, and
uses the Python standard library only. Inputs are the user's own data;
the script adds no benchmarks.
"""

from __future__ import annotations

import argparse
import math
from statistics import NormalDist


def z_of(p: float) -> float:
    return NormalDist().inv_cdf(p)


def cmd_power(a: argparse.Namespace) -> None:
    if not (0 < a.baseline < 1):
        raise SystemExit("error: --baseline must be between 0 and 1")
    if not (0 < a.treatment_share < 1):
        raise SystemExit("error: --treatment-share must be between 0 and 1")
    p_c = a.baseline
    p_t = p_c * (1 + a.lift)
    if not (0 < p_t < 1) or p_t == p_c:
        raise SystemExit("error: baseline x (1 + lift) must be between 0 and 1 and differ from baseline")
    k = a.treatment_share / (1 - a.treatment_share)  # n_T = k * n_C
    mult = (z_of(1 - a.alpha / 2) + z_of(a.power)) ** 2
    n_c = mult * (p_t * (1 - p_t) / k + p_c * (1 - p_c)) / (p_t - p_c) ** 2
    n_t = k * n_c
    print(f"control rate {p_c:.4%}, treatment rate to detect {p_t:.4%} (relative lift {a.lift:.1%})")
    print(f"alpha {a.alpha}, power {a.power}, treatment share {a.treatment_share:.0%}")
    print(f"holdout (control) needed : {math.ceil(n_c):,}")
    print(f"treatment needed         : {math.ceil(n_t):,}")
    print(f"total audience needed    : {math.ceil(n_c) + math.ceil(n_t):,}")
    print("If the eligible audience is smaller, use a larger contrast, a longer window, or another design.")


def cmd_analyze(a: argparse.Namespace) -> None:
    for name in ("n_treat", "n_control"):
        if getattr(a, name) <= 0:
            raise SystemExit(f"error: --{name.replace('_', '-')} must be positive")
    if a.conv_treat > a.n_treat or a.conv_control > a.n_control:
        raise SystemExit("error: conversions cannot exceed group size")
    p_t = a.conv_treat / a.n_treat
    p_c = a.conv_control / a.n_control
    diff = p_t - p_c
    se = math.sqrt(p_t * (1 - p_t) / a.n_treat + p_c * (1 - p_c) / a.n_control)
    zc = z_of(0.975)
    lo, hi = diff - zc * se, diff + zc * se
    z = diff / se if se > 0 else float("nan")
    inc = diff * a.n_treat
    inc_lo, inc_hi = lo * a.n_treat, hi * a.n_treat

    print(f"treatment rate {p_t:.4%} ({a.conv_treat:,}/{a.n_treat:,})")
    print(f"control rate   {p_c:.4%} ({a.conv_control:,}/{a.n_control:,})")
    print(f"absolute lift  {diff * 100:.3f} pts, 95% interval {lo * 100:.3f} to {hi * 100:.3f} pts, z = {z:.2f}")
    if p_c > 0:
        print(f"relative lift  {diff / p_c:.1%}, 95% interval {lo / p_c:.1%} to {hi / p_c:.1%}")
    print(f"incremental conversions {inc:,.0f} (95% interval {inc_lo:,.0f} to {inc_hi:,.0f})")
    if lo <= 0 <= hi:
        print("VERDICT: interval includes zero. Inconclusive at this size; do not report a lift.")
    elif hi < 0:
        print("VERDICT: treatment converted worse than control. Check for a setup error before acting.")
    else:
        print("VERDICT: lift distinguishable from zero at the 95% level.")

    if a.spend is not None:
        def icpa(n: float) -> str:
            return "undefined (no positive lift)" if n <= 0 else f"{a.spend / n:,.2f}"
        print(f"iCPA {icpa(inc)} (range {icpa(inc_hi)} to {icpa(inc_lo)})")
        if a.value_per_conversion is not None and a.spend > 0:
            v = a.value_per_conversion
            print(f"iROAS {inc * v / a.spend:.2f} (range {inc_lo * v / a.spend:.2f} to {inc_hi * v / a.spend:.2f})"
                  " -- value per conversion as supplied; say whether it is revenue or gross margin")
    if a.attributed is not None and a.attributed > 0:
        print(f"incrementality factor {inc / a.attributed:.2f} "
              f"(range {inc_lo / a.attributed:.2f} to {inc_hi / a.attributed:.2f}) of platform-attributed conversions")


def main() -> None:
    parser = argparse.ArgumentParser(description="Size and analyze a randomized marketing holdout test.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("power", help="sample size for a holdout test")
    p.add_argument("--baseline", type=float, required=True)
    p.add_argument("--lift", type=float, required=True, help="relative lift, e.g. 0.10")
    p.add_argument("--treatment-share", type=float, default=0.5)
    p.add_argument("--alpha", type=float, default=0.05)
    p.add_argument("--power", type=float, default=0.8)
    p.set_defaults(handler=cmd_power)

    q = sub.add_parser("analyze", help="lift, interval, iCPA, iROAS from test counts")
    q.add_argument("--n-treat", type=int, required=True)
    q.add_argument("--conv-treat", type=int, required=True)
    q.add_argument("--n-control", type=int, required=True)
    q.add_argument("--conv-control", type=int, required=True)
    q.add_argument("--spend", type=float)
    q.add_argument("--value-per-conversion", type=float)
    q.add_argument("--attributed", type=float, help="platform-attributed conversions in the same period")
    q.set_defaults(handler=cmd_analyze)

    args = parser.parse_args()
    args.handler(args)


if __name__ == "__main__":
    main()
