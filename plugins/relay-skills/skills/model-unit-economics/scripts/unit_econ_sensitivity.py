#!/usr/bin/env python3
"""Unit economics sensitivity tables: CAC payback, LTV and LTV:CAC.

All money inputs must be in one currency and one period (monthly).

Formulas:
  Gross-margin CAC payback (months) = CAC / (ARPA x GM%)
  Simple churn-based LTV            = ARPA x GM% / monthly churn
  Horizon-capped LTV                = ARPA x GM% x (1 - (1 - churn)^H) / churn
      (margin earned from month 1 to month H while a constant share churns
       each month; H = --horizon-months)
  LTV:CAC                           = LTV / CAC   (heuristic, not a target)

The simple LTV is extremely sensitive to churn when churn is small; the
capped version shows how much of that value sits beyond the horizon.

Usage:
  python3 unit_econ_sensitivity.py --arpa 500 --gross-margin 0.80 --cac 6000 \
      --monthly-churn 0.02 --horizon-months 60

  Optional grids (comma-separated; defaults are the base value -20%/-10%/0/+10%/+20%):
    --cac-values 4000,5000,6000,7000,8000
    --gm-values 0.70,0.75,0.80
    --arpa-values 400,500,600
    --churn-values 0.01,0.02,0.03

  Optional cohort check (observed payback, preferred over formula LTV):
    --cohort-csv cohort.csv   (path or - for stdin) with columns
      month, margin_per_customer
    where margin_per_customer is gross margin earned in that month divided by
    the number of customers originally acquired in the cohort (so churn is
    already reflected). The script accumulates it and reports the month
    cumulative margin first covers CAC.

Prints plain-text tables. No files are written.
"""

from __future__ import annotations

import argparse
import csv
import sys


def parse_list(text: str | None, base: float, label: str) -> list[float]:
    if not text:
        return [round(base * f, 6) for f in (0.8, 0.9, 1.0, 1.1, 1.2)]
    try:
        values = [float(x) for x in text.split(",") if x.strip()]
    except ValueError:
        raise SystemExit(f"{label}: values must be numbers separated by commas")
    if not values:
        raise SystemExit(f"{label}: no values given")
    return values


def payback(cac: float, arpa: float, gm: float) -> float:
    monthly_margin = arpa * gm
    return float("inf") if monthly_margin <= 0 else cac / monthly_margin


def ltv_simple(arpa: float, gm: float, churn: float) -> float:
    return float("inf") if churn <= 0 else arpa * gm / churn


def ltv_capped(arpa: float, gm: float, churn: float, horizon: int) -> float:
    if churn <= 0:
        return arpa * gm * horizon
    return arpa * gm * (1 - (1 - churn) ** horizon) / churn


def fmt(x: float, digits: int = 1, inf_label: str = "never") -> str:
    if x == float("inf"):
        return inf_label
    return f"{x:,.{digits}f}"


def table(title: str, row_label: str, rows: list[float], col_label: str, cols: list[float], cell) -> None:
    print(f"\n{title}")
    print(f"{row_label} \\ {col_label}\t" + "\t".join(f"{c:g}" for c in cols))
    for r in rows:
        print(f"{r:g}\t" + "\t".join(cell(r, c) for c in cols))


def cohort_payback(path: str, cac: float) -> None:
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    try:
        reader = csv.DictReader(handle)
        needed = {"month", "margin_per_customer"}
        if not reader.fieldnames or not needed.issubset({f.strip() for f in reader.fieldnames}):
            raise SystemExit("cohort CSV needs columns: month, margin_per_customer")
        rows = []
        for raw in reader:
            row = {k.strip(): (v or "").strip() for k, v in raw.items() if k}
            rows.append((int(float(row["month"])), float(row["margin_per_customer"])))
    finally:
        if handle is not sys.stdin:
            handle.close()
    rows.sort()
    print("\nCohort-observed cumulative gross margin per acquired customer")
    print("month\tmargin\tcumulative\tcovers_CAC")
    cumulative = 0.0
    reached = None
    for month, margin in rows:
        cumulative += margin
        covered = cumulative >= cac
        if covered and reached is None:
            reached = month
        print(f"{month}\t{margin:,.2f}\t{cumulative:,.2f}\t{'yes' if covered else 'no'}")
    if reached is None:
        print(f"Observed payback: not reached within {len(rows)} observed months "
              f"(cumulative {cumulative:,.2f} vs CAC {cac:,.2f}).")
    else:
        print(f"Observed payback: month {reached}.")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--arpa", type=float, required=True, help="average monthly revenue per customer (account)")
    p.add_argument("--gross-margin", type=float, required=True, help="gross margin as a fraction, e.g. 0.8")
    p.add_argument("--cac", type=float, required=True, help="customer acquisition cost per new customer")
    p.add_argument("--monthly-churn", type=float, required=True, help="monthly customer churn as a fraction")
    p.add_argument("--horizon-months", type=int, default=60, help="cap for horizon LTV (default 60, an assumption)")
    p.add_argument("--cac-values")
    p.add_argument("--gm-values")
    p.add_argument("--arpa-values")
    p.add_argument("--churn-values")
    p.add_argument("--cohort-csv")
    a = p.parse_args()

    if not 0 < a.gross_margin <= 1:
        raise SystemExit("--gross-margin must be a fraction in (0, 1]")
    if not 0 <= a.monthly_churn < 1:
        raise SystemExit("--monthly-churn must be a fraction in [0, 1)")
    if a.arpa <= 0 or a.cac <= 0 or a.horizon_months <= 0:
        raise SystemExit("--arpa, --cac and --horizon-months must be positive")

    cacs = parse_list(a.cac_values, a.cac, "--cac-values")
    gms = parse_list(a.gm_values, a.gross_margin, "--gm-values")
    arpas = parse_list(a.arpa_values, a.arpa, "--arpa-values")
    churns = parse_list(a.churn_values, a.monthly_churn, "--churn-values")
    H = a.horizon_months

    pb = payback(a.cac, a.arpa, a.gross_margin)
    ls = ltv_simple(a.arpa, a.gross_margin, a.monthly_churn)
    lc = ltv_capped(a.arpa, a.gross_margin, a.monthly_churn, H)
    print("Base case")
    print(f"  Monthly gross margin per customer = {a.arpa:,.2f} x {a.gross_margin:g} = {a.arpa * a.gross_margin:,.2f}")
    print(f"  CAC payback on gross margin       = {fmt(pb)} months")
    print(f"  Simple LTV (ARPA x GM / churn)    = {fmt(ls, 0, "unbounded (zero churn)")}")
    print(f"  {H}-month capped LTV             = {fmt(lc, 0)}")
    print(f"  LTV:CAC simple / capped           = {fmt(ls / a.cac, 2, "unbounded")} / {fmt(lc / a.cac, 2)}")
    if a.monthly_churn > 0:
        print(f"  Implied average lifetime          = {1 / a.monthly_churn:,.1f} months (1 / churn)")

    table("CAC payback (months) by CAC and gross margin", "CAC", cacs, "GM", gms,
          lambda r, c: fmt(payback(r, a.arpa, c)))
    table("CAC payback (months) by CAC and ARPA", "CAC", cacs, "ARPA", arpas,
          lambda r, c: fmt(payback(r, c, a.gross_margin)))
    table("Simple LTV by monthly churn and gross margin", "churn", churns, "GM", gms,
          lambda r, c: fmt(ltv_simple(a.arpa, c, r), 0, "unbounded"))
    table(f"LTV:CAC using {H}-month capped LTV, by monthly churn and CAC", "churn", churns, "CAC", cacs,
          lambda r, c: fmt(ltv_capped(a.arpa, a.gross_margin, r, H) / c, 2))

    if a.cohort_csv:
        cohort_payback(a.cohort_csv, a.cac)

    print("\nNotes: grid values are what-if inputs, not forecasts. Simple LTV assumes constant churn "
          "forever; prefer cohort-observed cumulative margin where it exists.")


if __name__ == "__main__":
    main()
