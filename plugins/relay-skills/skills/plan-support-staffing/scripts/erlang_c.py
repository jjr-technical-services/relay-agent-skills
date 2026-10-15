#!/usr/bin/env python3
"""Erlang C staffing calculator for real-time support channels (voice, chat).

For each interval it finds the smallest number of agents on the phones
(net, "in seat") that meets a service-level target, raises that number if
occupancy would exceed a cap, then grosses it up for shrinkage.

Formulas (A = traffic intensity in Erlangs, N = agents, T = target seconds):
  A        = arrivals_in_interval * AHT_seconds / interval_seconds
  P(wait)  = Erlang C = [A^N/N! * N/(N-A)] / [sum_{k=0}^{N-1} A^k/k! + A^N/N! * N/(N-A)]
  SL       = 1 - P(wait) * exp(-(N - A) * T / AHT)
  ASA      = P(wait) * AHT / (N - A)
  occupancy= A / N
  gross    = net / (1 - shrinkage)
N must exceed A or the queue grows without limit.

Erlang C assumes no caller abandons and no retries, so it tends to overstate
the agents needed when abandonment is material. Chat with concurrency > 1 is
approximated by dividing AHT by the effective concurrency (an assumption).

Usage:
  Single interval:
    python3 erlang_c.py --calls 100 --aht 180 --interval-minutes 30 \
        --sl-target 0.80 --sl-seconds 20 --max-occupancy 0.85 --shrinkage 0.30

  Many intervals from a CSV (path or "-" for stdin). Required column:
  "calls". Optional columns: "interval" (label), "aht" (seconds; overrides
  --aht for that row).
    python3 erlang_c.py --csv intervals.csv --aht 180 --interval-minutes 30

  Optional: --asa-target SECONDS adds an average-speed-of-answer constraint.
            --concurrency C divides AHT by C (chat approximation).
            --out PATH writes the result table as CSV to PATH.

Output columns: interval, calls, aht, erlangs, net_agents, service_level,
asa_seconds, occupancy, binding (which constraint set N), gross_agents.
Totals report net and gross agent-hours across all intervals.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys


def erlang_c(agents: int, erlangs: float) -> float:
    """Probability an arrival waits. Uses the stable Erlang B recursion."""
    if agents <= erlangs:
        return 1.0
    b = 1.0
    for n in range(1, agents + 1):
        b = erlangs * b / (n + erlangs * b)
    return agents * b / (agents - erlangs * (1.0 - b))


def service_level(agents: int, erlangs: float, aht: float, target_seconds: float) -> float:
    if agents <= erlangs:
        return 0.0
    pw = erlang_c(agents, erlangs)
    return 1.0 - pw * math.exp(-(agents - erlangs) * target_seconds / aht)


def asa(agents: int, erlangs: float, aht: float) -> float:
    if agents <= erlangs:
        return math.inf
    return erlang_c(agents, erlangs) * aht / (agents - erlangs)


def solve_interval(calls: float, aht: float, interval_seconds: float, sl_target: float,
                   sl_seconds: float, max_occ: float, asa_target: float | None) -> dict:
    erlangs = calls * aht / interval_seconds
    if calls <= 0:
        return {"erlangs": 0.0, "net_agents": 0, "service_level": 1.0,
                "asa_seconds": 0.0, "occupancy": 0.0, "binding": "no volume"}
    n = max(1, math.floor(erlangs) + 1)
    while service_level(n, erlangs, aht, sl_seconds) < sl_target:
        n += 1
    binding = "service level"
    if asa_target is not None:
        while asa(n, erlangs, aht) > asa_target:
            n += 1
            binding = "ASA"
    occ_floor = math.ceil(erlangs / max_occ - 1e-9)
    if occ_floor > n:
        n = occ_floor
        binding = "occupancy cap"
    return {
        "erlangs": erlangs,
        "net_agents": n,
        "service_level": service_level(n, erlangs, aht, sl_seconds),
        "asa_seconds": asa(n, erlangs, aht),
        "occupancy": erlangs / n,
        "binding": binding,
    }


def read_rows(path: str, default_aht: float | None) -> list[dict]:
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    try:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or "calls" not in [f.strip() for f in reader.fieldnames]:
            raise SystemExit("CSV must have a 'calls' column")
        rows = []
        for i, raw in enumerate(reader, start=1):
            row = {k.strip(): (v or "").strip() for k, v in raw.items() if k}
            aht_text = row.get("aht", "")
            aht = float(aht_text) if aht_text else default_aht
            if aht is None or aht <= 0:
                raise SystemExit(f"row {i}: no positive AHT (add an 'aht' column or pass --aht)")
            rows.append({"interval": row.get("interval") or str(i),
                         "calls": float(row["calls"] or 0), "aht": aht})
        return rows
    finally:
        if handle is not sys.stdin:
            handle.close()


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--calls", type=float, help="arrivals in a single interval")
    p.add_argument("--csv", help="CSV path with per-interval 'calls' (use - for stdin)")
    p.add_argument("--aht", type=float, help="average handle time in seconds (talk + hold + after-call work)")
    p.add_argument("--interval-minutes", type=float, default=30.0)
    p.add_argument("--sl-target", type=float, default=0.80, help="fraction answered within --sl-seconds")
    p.add_argument("--sl-seconds", type=float, default=20.0)
    p.add_argument("--asa-target", type=float, default=None, help="optional max average speed of answer, seconds")
    p.add_argument("--max-occupancy", type=float, default=0.85, help="occupancy cap, 0-1")
    p.add_argument("--shrinkage", type=float, default=0.30, help="fraction of paid time not available, 0-1")
    p.add_argument("--concurrency", type=float, default=1.0, help="simultaneous contacts per agent (chat)")
    p.add_argument("--out", help="optional path to write the result table as CSV")
    a = p.parse_args()

    if not 0 < a.sl_target < 1:
        raise SystemExit("--sl-target must be between 0 and 1")
    if not 0 < a.max_occupancy <= 1:
        raise SystemExit("--max-occupancy must be in (0, 1]")
    if not 0 <= a.shrinkage < 1:
        raise SystemExit("--shrinkage must be in [0, 1)")
    if a.concurrency < 1:
        raise SystemExit("--concurrency must be >= 1")

    if a.csv:
        rows = read_rows(a.csv, a.aht)
    elif a.calls is not None:
        if not a.aht or a.aht <= 0:
            raise SystemExit("--aht is required and must be positive")
        rows = [{"interval": "1", "calls": a.calls, "aht": a.aht}]
    else:
        raise SystemExit("pass --calls for one interval or --csv for many (see --help)")

    interval_seconds = a.interval_minutes * 60.0
    results = []
    for r in rows:
        eff_aht = r["aht"] / a.concurrency
        s = solve_interval(r["calls"], eff_aht, interval_seconds, a.sl_target, a.sl_seconds,
                           a.max_occupancy, a.asa_target)
        gross = s["net_agents"] / (1.0 - a.shrinkage)
        results.append({"interval": r["interval"], "calls": r["calls"], "aht": round(eff_aht, 1),
                        "erlangs": round(s["erlangs"], 3), "net_agents": s["net_agents"],
                        "service_level": round(s["service_level"], 4),
                        "asa_seconds": round(s["asa_seconds"], 1), "occupancy": round(s["occupancy"], 4),
                        "binding": s["binding"], "gross_agents": round(gross, 2)})

    cols = list(results[0].keys())
    print(f"Target: {a.sl_target:.0%} in {a.sl_seconds:g}s | occupancy cap {a.max_occupancy:.0%} | "
          f"shrinkage {a.shrinkage:.0%} | interval {a.interval_minutes:g} min | concurrency {a.concurrency:g}")
    print("\t".join(cols))
    for r in results:
        print("\t".join(str(r[c]) for c in cols))
    hours = a.interval_minutes / 60.0
    net_hours = sum(r["net_agents"] for r in results) * hours
    gross_hours = sum(r["net_agents"] / (1.0 - a.shrinkage) for r in results) * hours
    print(f"Totals: net agent-hours {net_hours:.1f} | gross (paid) agent-hours {gross_hours:.1f}")
    print("Note: Erlang C ignores abandonment; interval results assume steady arrivals within each interval.")

    if a.out:
        with open(a.out, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=cols)
            w.writeheader()
            w.writerows(results)
        print(f"Wrote {a.out}")


if __name__ == "__main__":
    main()
