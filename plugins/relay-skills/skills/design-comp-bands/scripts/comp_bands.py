#!/usr/bin/env python3
"""Build salary bands from market data, or place employees in existing bands.

Standard library only. Reads CSV from a path argument or stdin ("-").
Prints results to stdout. Writes a CSV only when --output PATH is given.

USAGE

  Build bands from aged market data:
    python3 comp_bands.py build MARKET.csv --target-date 2026-07-01 \
        --aging-rate 0.03 [--aging-method compound|simple] \
        [--spread 0.50] [--round 100] [--output bands.csv]

    MARKET.csv columns (header required):
      level            level label, rows in ascending level order
      market_value     market reference value at your chosen percentile
      effective_date   YYYY-MM-DD date the survey data is effective
      spread           optional per-level range spread, e.g. 0.40
                       (overrides --spread for that row)

    Aging: aged = market_value x factor, where
      compound factor = (1 + rate) ** (days / 365.25)
      simple factor   = 1 + rate * days / 365.25
    The annual aging rate must be supplied by the user; there is no default.

    Band math: midpoint = aged market value (pay philosophy at 100% of the
    chosen percentile), range spread s = (max - min) / min, so
      min = 2 * midpoint / (2 + s),  max = min * (1 + s).
    Midpoint progression = (mid_n - mid_{n-1}) / mid_{n-1}.
    Overlap with the level below =
      (max_{n-1} - min_n) / (max_{n-1} - min_{n-1}), floored at 0.

  Place employees in bands:
    python3 comp_bands.py place --bands BANDS.csv EMPLOYEES.csv [--output out.csv]

    BANDS.csv columns: level, min, midpoint, max
    EMPLOYEES.csv columns: employee_id, level, salary

    Compa-ratio        = salary / midpoint
    Range penetration  = (salary - min) / (max - min)
    Status             = below minimum | within range | above maximum
    Cost to minimum    = max(0, min - salary)

Outputs are arithmetic only. They do not decide pay, and they do not replace
a pay equity review or legal advice.
"""

import argparse
import csv
import datetime as dt
import sys


def read_rows(path):
    handle = sys.stdin if path == "-" else open(path, newline="", encoding="utf-8-sig")
    try:
        reader = csv.DictReader(handle)
        rows = [{(k or "").strip().lower(): (v or "").strip() for k, v in r.items()} for r in reader]
    finally:
        if handle is not sys.stdin:
            handle.close()
    return rows


def num(value, field, row_no):
    try:
        return float(str(value).replace(",", "").replace("$", ""))
    except ValueError:
        sys.exit(f"Row {row_no}: '{field}' is not a number: {value!r}")


def rnd(value, step):
    return round(value / step) * step if step else value


def write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8") as out:
        writer = csv.writer(out)
        writer.writerow(header)
        writer.writerows(rows)


def print_table(header, rows):
    widths = [max(len(str(h)), *(len(str(r[i])) for r in rows)) if rows else len(str(h)) for i, h in enumerate(header)]
    print("  ".join(str(h).ljust(w) for h, w in zip(header, widths)))
    print("  ".join("-" * w for w in widths))
    for r in rows:
        print("  ".join(str(c).ljust(w) for c, w in zip(r, widths)))


def pct(x):
    return "" if x is None else f"{x * 100:.1f}%"


def money(x):
    return f"{x:,.0f}"


def cmd_build(args):
    rows = read_rows(args.market)
    if not rows:
        sys.exit("No rows found in market file.")
    target = dt.date.fromisoformat(args.target_date)
    bands = []
    for i, r in enumerate(rows, start=2):
        for field in ("level", "market_value", "effective_date"):
            if not r.get(field):
                sys.exit(f"Row {i}: missing '{field}'.")
        value = num(r["market_value"], "market_value", i)
        eff = dt.date.fromisoformat(r["effective_date"])
        years = (target - eff).days / 365.25
        if args.aging_method == "compound":
            factor = (1 + args.aging_rate) ** years
        else:
            factor = 1 + args.aging_rate * years
        spread = num(r["spread"], "spread", i) if r.get("spread") else args.spread
        if spread is None:
            sys.exit(f"Row {i}: no spread; pass --spread or add a spread column.")
        if spread <= 0:
            sys.exit(f"Row {i}: spread must be positive.")
        mid = rnd(value * factor, args.round)
        lo = rnd(2 * mid / (2 + spread), args.round)
        hi = rnd(lo * (1 + spread), args.round)
        bands.append({"level": r["level"], "market": value, "years": years, "factor": factor,
                      "mid": mid, "min": lo, "max": hi, "spread": spread})

    header = ["level", "market_value", "years_aged", "aging_factor", "min", "midpoint", "max",
              "spread", "mid_progression", "overlap_below"]
    out = []
    for n, b in enumerate(bands):
        prog = overlap = None
        if n > 0:
            prev = bands[n - 1]
            prog = (b["mid"] - prev["mid"]) / prev["mid"]
            width = prev["max"] - prev["min"]
            overlap = max(0.0, (prev["max"] - b["min"]) / width) if width else None
        actual_spread = (b["max"] - b["min"]) / b["min"]
        out.append([b["level"], money(b["market"]), f"{b['years']:.2f}", f"{b['factor']:.4f}",
                    money(b["min"]), money(b["mid"]), money(b["max"]), pct(actual_spread),
                    pct(prog), pct(overlap)])
    print(f"Aging: {args.aging_method}, annual rate {args.aging_rate:.4f} (user supplied), target date {target}")
    print_table(header, out)
    flags = []
    for n in range(1, len(bands)):
        if bands[n]["mid"] <= bands[n - 1]["mid"]:
            flags.append(f"Level {bands[n]['level']}: midpoint not above level {bands[n-1]['level']}; check matching or level order.")
    for f in flags:
        print("FLAG:", f)
    if args.output:
        write_csv(args.output, ["level", "min", "midpoint", "max"],
                  [[b["level"], f"{b['min']:.2f}", f"{b['mid']:.2f}", f"{b['max']:.2f}"] for b in bands])
        print(f"Wrote bands to {args.output}")


def cmd_place(args):
    bands = {}
    for i, r in enumerate(read_rows(args.bands), start=2):
        bands[r["level"]] = (num(r["min"], "min", i), num(r["midpoint"], "midpoint", i), num(r["max"], "max", i))
    emps = read_rows(args.employees)
    header = ["employee_id", "level", "salary", "min", "midpoint", "max", "compa_ratio",
              "range_penetration", "status", "cost_to_min"]
    out, unmatched = [], []
    total_cost = 0.0
    by_level = {}
    counts = {"below minimum": 0, "within range": 0, "above maximum": 0}
    for i, r in enumerate(emps, start=2):
        level = r.get("level", "")
        if level not in bands:
            unmatched.append(r.get("employee_id", f"row {i}"))
            continue
        lo, mid, hi = bands[level]
        pay = num(r["salary"], "salary", i)
        cr = pay / mid
        pen = (pay - lo) / (hi - lo) if hi > lo else 0.0
        status = "below minimum" if pay < lo else "above maximum" if pay > hi else "within range"
        cost = max(0.0, lo - pay)
        total_cost += cost
        counts[status] += 1
        by_level.setdefault(level, []).append(cr)
        out.append([r.get("employee_id", ""), level, money(pay), money(lo), money(mid), money(hi),
                    f"{cr:.3f}", pct(pen), status, money(cost)])
    print_table(header, out)
    print()
    print("Summary")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    print(f"  total annual cost to bring everyone to minimum: {money(total_cost)}")
    for level, crs in by_level.items():
        print(f"  level {level}: n={len(crs)}, average compa-ratio {sum(crs) / len(crs):.3f}")
    if unmatched:
        print(f"  not placed (level not in bands): {', '.join(unmatched)}")
    if args.output:
        write_csv(args.output, header, out)
        print(f"Wrote placements to {args.output}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    b = sub.add_parser("build", help="build bands from market data")
    b.add_argument("market", help="market CSV path or - for stdin")
    b.add_argument("--target-date", required=True, help="common effective date YYYY-MM-DD")
    b.add_argument("--aging-rate", type=float, required=True, help="annual aging rate as a decimal, supplied by the user")
    b.add_argument("--aging-method", choices=["compound", "simple"], default="compound")
    b.add_argument("--spread", type=float, default=None, help="default range spread as a decimal, e.g. 0.50")
    b.add_argument("--round", type=float, default=0, help="round values to this step, e.g. 100")
    b.add_argument("--output", help="optional path to write bands CSV")
    p = sub.add_parser("place", help="place employees in existing bands")
    p.add_argument("--bands", required=True, help="bands CSV with level,min,midpoint,max")
    p.add_argument("employees", help="employees CSV path or - for stdin")
    p.add_argument("--output", help="optional path to write placements CSV")
    args = parser.parse_args()
    if args.command == "build":
        cmd_build(args)
    else:
        cmd_place(args)


if __name__ == "__main__":
    main()
