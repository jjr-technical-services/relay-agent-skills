#!/usr/bin/env python3
"""Referral program economics calculator.

Usage:
    python3 referral_economics.py --customers 2000 --participation 0.10 \
        --invites-per-participant 3 --invite-conversion 0.10 \
        --referrer-reward 50 --referee-reward 50 --fixed-costs 3000 \
        --incremental-share 0.7 --monthly-gross-margin 40 [--alt-cac 300] \
        [--fraud-share 0.0] [--reward-cost-factor 1.0] [--incremental-range 0.3,0.5,0.7,0.9]

Inputs (all for the same period, for example one quarter):
    --customers                eligible active customers
    --participation            share of eligible customers who send at least one invite
    --invites-per-participant  average invites per participant
    --invite-conversion        share of invites that become paid referred customers (reward paid)
    --referrer-reward          reward to the referrer per paid referred customer, face value
    --referee-reward           reward to the referee, face value (0 for single-sided)
    --reward-cost-factor       true cost as a share of face value (1.0 for cash; see references)
    --fixed-costs              fixed program cost for the period (software, operations, legal review)
    --fraud-share              share of paid referred customers later found invalid
    --incremental-share        share of genuine referred customers who would not have come anyway
    --monthly-gross-margin     gross margin per customer per month
    --alt-cac                  optional marginal CAC of the best alternative channel
    --incremental-range        optional comma-separated incremental shares for a sensitivity table

Prints the referral funnel, costs, cost per referred and per incremental customer,
payback months, viral coefficient, and, with --alt-cac, the comparison and the
break-even total reward per paid referred customer. Takes numbers as arguments,
reads and writes no files, standard library only. Every input is the user's own
figure or a labeled assumption; the script adds no benchmarks.
"""

from __future__ import annotations

import argparse


def share(x: str) -> float:
    v = float(x)
    if not 0 <= v <= 1:
        raise argparse.ArgumentTypeError("must be a fraction between 0 and 1")
    return v


def nonneg(x: str) -> float:
    v = float(x)
    if v < 0:
        raise argparse.ArgumentTypeError("must be zero or positive")
    return v


def compute(a: argparse.Namespace, incremental_share: float) -> dict:
    participants = a.customers * a.participation
    invites = participants * a.invites_per_participant
    paid = invites * a.invite_conversion
    genuine = paid * (1 - a.fraud_share)
    reward_each = (a.referrer_reward + a.referee_reward) * a.reward_cost_factor
    rewards = reward_each * paid
    total = rewards + a.fixed_costs
    incremental = genuine * incremental_share
    per_genuine = total / genuine if genuine else float("inf")
    per_incr = total / incremental if incremental else float("inf")
    payback = per_incr / a.monthly_gross_margin if a.monthly_gross_margin and incremental else float("inf")
    out = {
        "participants": participants, "invites": invites, "paid": paid, "genuine": genuine,
        "reward_each": reward_each, "rewards": rewards, "total": total, "incremental": incremental,
        "per_genuine": per_genuine, "per_incr": per_incr, "payback": payback,
        "k": a.participation * a.invites_per_participant * a.invite_conversion,
    }
    if a.alt_cac is not None and paid and a.reward_cost_factor:
        out["breakeven_reward"] = (a.alt_cac * incremental - a.fixed_costs) / paid / a.reward_cost_factor
    return out


def fmt(x: float, money: bool = False) -> str:
    if x == float("inf"):
        return "undefined"
    return f"{x:,.2f}" if money else f"{x:,.1f}"


def main() -> None:
    p = argparse.ArgumentParser(description="Referral program economics calculator.")
    p.add_argument("--customers", type=nonneg, required=True)
    p.add_argument("--participation", type=share, required=True)
    p.add_argument("--invites-per-participant", type=nonneg, required=True)
    p.add_argument("--invite-conversion", type=share, required=True)
    p.add_argument("--referrer-reward", type=nonneg, required=True)
    p.add_argument("--referee-reward", type=nonneg, default=0.0)
    p.add_argument("--reward-cost-factor", type=share, default=1.0)
    p.add_argument("--fixed-costs", type=nonneg, default=0.0)
    p.add_argument("--fraud-share", type=share, default=0.0)
    p.add_argument("--incremental-share", type=share, required=True)
    p.add_argument("--monthly-gross-margin", type=nonneg, required=True)
    p.add_argument("--alt-cac", type=nonneg)
    p.add_argument("--incremental-range", help="comma-separated incremental shares, e.g. 0.3,0.5,0.7")
    a = p.parse_args()

    r = compute(a, a.incremental_share)
    print("== referral funnel ==")
    print(f"participants              {fmt(r['participants'])}")
    print(f"invites                   {fmt(r['invites'])}")
    print(f"paid referred customers   {fmt(r['paid'])}")
    print(f"genuine after fraud       {fmt(r['genuine'])}")
    print(f"incremental customers     {fmt(r['incremental'])} (incremental share {a.incremental_share:.0%})")
    k_note = "below 1: adds customers but does not compound" if r["k"] < 1 else "at or above 1: verify before relying on it"
    print(f"viral coefficient k       {r['k']:.3f} ({k_note})")
    print("== cost ==")
    print(f"reward cost per paid referral {fmt(r['reward_each'], True)} (factor {a.reward_cost_factor})")
    print(f"reward cost total             {fmt(r['rewards'], True)}")
    print(f"fixed program cost            {fmt(a.fixed_costs, True)}")
    print(f"total program cost            {fmt(r['total'], True)}")
    print(f"cost per genuine referred     {fmt(r['per_genuine'], True)}")
    print(f"cost per incremental customer {fmt(r['per_incr'], True)}")
    print(f"payback months                {fmt(r['payback'])}")
    if a.alt_cac is not None:
        verdict = "BELOW" if r["per_incr"] < a.alt_cac else "AT OR ABOVE"
        print("== comparison ==")
        print(f"alternative marginal CAC      {fmt(a.alt_cac, True)}; referral cost per incremental customer is "
              f"{verdict} it")
        if "breakeven_reward" in r:
            be = r["breakeven_reward"]
            note = " (fixed costs alone exceed the alternative; no reward level breaks even)" if be < 0 else ""
            print(f"break-even total reward per paid referral (face value) {fmt(be, True)}{note}")
    if a.incremental_range:
        print("== sensitivity to incremental share ==")
        print("incremental_share | incremental_customers | cost_per_incremental | payback_months")
        for part in a.incremental_range.split(","):
            s = float(part)
            if not 0 < s <= 1:
                raise SystemExit("error: incremental shares must be between 0 and 1")
            rr = compute(a, s)
            print(f"{s:.0%} | {fmt(rr['incremental'])} | {fmt(rr['per_incr'], True)} | {fmt(rr['payback'])}")
    print("Label every input as supplied or assumed. Measure the incremental share with a holdout before scaling.")


if __name__ == "__main__":
    main()
