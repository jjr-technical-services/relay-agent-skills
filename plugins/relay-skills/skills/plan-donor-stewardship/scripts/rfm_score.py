#!/usr/bin/env python3
"""Score donors by RFM (recency, frequency, monetary) from a gifts CSV.

Usage:
  python3 rfm_score.py GIFTS.csv --as-of YYYY-MM-DD [options]
  cat GIFTS.csv | python3 rfm_score.py - --as-of YYYY-MM-DD [options]

Input: one row per counted gift (hard credit only unless you decide otherwise).
Default columns: donor_id, gift_date (YYYY-MM-DD), amount. Override with
--id-col, --date-col, --amount-col. Rows dated after --as-of are ignored.

Scoring (1 = lowest, 5 = highest):
  Recency   = days from last gift to --as-of (fewer days scores higher)
  Frequency = number of gifts in the lookback window
  Monetary  = total (default) or average gift in the window (--monetary)
  Default breakpoints are quintiles of this file. Pass fixed breakpoints as
  four ascending numbers, e.g. --r-breaks 90,180,365,730 (days),
  --f-breaks 1,2,4,8 (gifts), --m-breaks 50,100,250,1000 (currency).
  For R, a value at or below the first break scores 5. For F and M, a value
  at or below the first break scores 1.
  Weighted score = wR*R + wF*F + wM*M, weights from --weights (default 1,1,1).

Segments (first matching rule wins; thresholds are assumptions to tune):
  Lapsed      recency_days > --lapse-days (default 365)
  First-time  exactly one gift ever (lifetime, not only the window)
  Top         R>=4 and F>=4 and M>=4
  Loyal       F>=4
  High value  M>=4
  At risk     R<=2
  Active      everything else

Options:
  --lookback-days N     window for F and M (default: all history)
  --current-start/--current-end YYYY-MM-DD
                        also print retention metrics for this period versus the
                        immediately preceding period of equal length
  --upgrade-min X       minimum increase in a retained donor's total to count
                        as an upgrade (default 0.01)
  --out PATH            write the donor table as CSV to PATH (the only file
                        this script writes)

Quintile scores are relative to this file. Standard library only; no network.
"""
import argparse
import csv
import sys
from datetime import date, timedelta


def parse_date(text):
    return date.fromisoformat(text.strip()[:10])


def parse_breaks(text):
    if not text:
        return None
    values = [float(x) for x in text.split(",")]
    if len(values) != 4 or values != sorted(values):
        sys.exit("Breakpoints need four ascending numbers, e.g. 90,180,365,730")
    return values


def quintile_breaks(values):
    ordered = sorted(values)
    n = len(ordered)
    return [ordered[max(0, min(n - 1, int(round(n * q / 5.0)) - 1))] for q in (1, 2, 3, 4)]


def score_ascending(value, breaks):
    """Higher value -> higher score."""
    for i, b in enumerate(breaks):
        if value <= b:
            return i + 1
    return 5


def score_recency(days, breaks):
    """Fewer days -> higher score."""
    for i, b in enumerate(breaks):
        if days <= b:
            return 5 - i
    return 1


def segment(row, lapse_days):
    r, f, m = row["R"], row["F"], row["M"]
    if row["recency_days"] > lapse_days:
        return "Lapsed"
    if row["lifetime_count"] == 1:
        return "First-time"
    if r >= 4 and f >= 4 and m >= 4:
        return "Top"
    if f >= 4:
        return "Loyal"
    if m >= 4:
        return "High value"
    if r <= 2:
        return "At risk"
    return "Active"


def load(args):
    handle = sys.stdin if args.gifts == "-" else open(args.gifts, newline="", encoding="utf-8-sig")
    gifts = []
    skipped = 0
    with handle:
        for rec in csv.DictReader(handle):
            try:
                donor = rec[args.id_col].strip()
                when = parse_date(rec[args.date_col])
                amount = float(str(rec[args.amount_col]).replace(",", "").replace("$", ""))
            except (KeyError, ValueError, AttributeError):
                skipped += 1
                continue
            if not donor:
                skipped += 1
                continue
            gifts.append((donor, when, amount))
    return gifts, skipped


def period_totals(gifts, start, end):
    totals = {}
    for donor, when, amount in gifts:
        if start <= when <= end:
            totals[donor] = totals.get(donor, 0.0) + amount
    return totals


def pct(num, den):
    return "n/a" if den == 0 else f"{100.0 * num / den:.1f}%"


def retention(gifts, start, end, upgrade_min):
    length = (end - start).days + 1
    p0_end = start - timedelta(days=1)
    p0_start = p0_end - timedelta(days=length - 1)
    p1 = period_totals(gifts, start, end)
    p0 = period_totals(gifts, p0_start, p0_end)
    before_p0 = {d for d, w, _ in gifts if w < p0_start}
    retained = set(p0) & set(p1)
    upgraded = [d for d in retained if p1[d] - p0[d] >= upgrade_min]
    lapsed_pool = before_p0 - set(p0)
    reactivated = (set(p1) - set(p0)) & before_p0
    new = set(p1) - set(p0) - before_p0
    p1_gifts = [a for d, w, a in gifts if start <= w <= end]
    print(f"\nPeriod metrics: prior {p0_start}..{p0_end} (P0) vs current {start}..{end} (P1)")
    print(f"  Donors P0: {len(p0)}   Donors P1: {len(p1)}")
    print(f"  Retained: {len(retained)}   Reactivated: {len(reactivated)}   New: {len(new)}"
          f"   (check: {len(retained) + len(reactivated) + len(new)} = {len(p1)})")
    print(f"  Donor retention = retained / donors P0 = {len(retained)}/{len(p0)} = {pct(len(retained), len(p0))}")
    kept = sum(p1[d] for d in retained)
    base = sum(p0.values())
    print(f"  Dollar retention = P1 amount from retained / P0 amount = {kept:,.2f}/{base:,.2f} = {pct(kept, base)}")
    print(f"  Upgrade rate = upgraded / retained = {len(upgraded)}/{len(retained)} = {pct(len(upgraded), len(retained))}")
    print(f"  Reactivation rate = reactivated / lapsed pool = {len(reactivated)}/{len(lapsed_pool)} = {pct(len(reactivated), len(lapsed_pool))}")
    if p1_gifts:
        print(f"  Average gift P1 = {sum(p1_gifts):,.2f}/{len(p1_gifts)} = {sum(p1_gifts) / len(p1_gifts):,.2f}")
        print(f"  Average donor total P1 = {sum(p1.values()):,.2f}/{len(p1)} = {sum(p1.values()) / len(p1):,.2f}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("gifts", help="gifts CSV path, or - for stdin")
    ap.add_argument("--as-of", required=True)
    ap.add_argument("--id-col", default="donor_id")
    ap.add_argument("--date-col", default="gift_date")
    ap.add_argument("--amount-col", default="amount")
    ap.add_argument("--lookback-days", type=int)
    ap.add_argument("--monetary", choices=["total", "average"], default="total")
    ap.add_argument("--r-breaks")
    ap.add_argument("--f-breaks")
    ap.add_argument("--m-breaks")
    ap.add_argument("--weights", default="1,1,1")
    ap.add_argument("--lapse-days", type=int, default=365)
    ap.add_argument("--current-start")
    ap.add_argument("--current-end")
    ap.add_argument("--upgrade-min", type=float, default=0.01)
    ap.add_argument("--out")
    args = ap.parse_args()

    as_of = parse_date(args.as_of)
    gifts, skipped = load(args)
    gifts = [g for g in gifts if g[1] <= as_of]
    if not gifts:
        sys.exit("No usable gift rows on or before --as-of.")
    weights = [float(x) for x in args.weights.split(",")]
    if len(weights) != 3:
        sys.exit("--weights needs three numbers: R,F,M")

    window_start = as_of - timedelta(days=args.lookback_days) if args.lookback_days else date.min
    donors = {}
    for donor, when, amount in gifts:
        d = donors.setdefault(donor, {"last": when, "count": 0, "total": 0.0, "lifetime": 0})
        d["last"] = max(d["last"], when)
        d["lifetime"] += 1
        if when >= window_start:
            d["count"] += 1
            d["total"] += amount

    rows = []
    for donor, d in donors.items():
        monetary = d["total"] if args.monetary == "total" else (d["total"] / d["count"] if d["count"] else 0.0)
        rows.append({"donor_id": donor, "last_gift": d["last"].isoformat(),
                     "recency_days": (as_of - d["last"]).days, "gift_count": d["count"],
                     "lifetime_count": d["lifetime"],
                     "monetary": round(monetary, 2)})

    r_breaks = parse_breaks(args.r_breaks) or quintile_breaks([r["recency_days"] for r in rows])
    f_breaks = parse_breaks(args.f_breaks) or quintile_breaks([r["gift_count"] for r in rows])
    m_breaks = parse_breaks(args.m_breaks) or quintile_breaks([r["monetary"] for r in rows])
    for r in rows:
        r["R"] = score_recency(r["recency_days"], r_breaks)
        r["F"] = score_ascending(r["gift_count"], f_breaks)
        r["M"] = score_ascending(r["monetary"], m_breaks)
        r["weighted"] = round(weights[0] * r["R"] + weights[1] * r["F"] + weights[2] * r["M"], 2)
        r["segment"] = segment(r, args.lapse_days)
    rows.sort(key=lambda r: (-r["weighted"], r["donor_id"]))

    cols = ["donor_id", "last_gift", "recency_days", "gift_count", "monetary", "R", "F", "M", "weighted", "segment"]
    print(f"As of {as_of}; {len(gifts)} gifts, {len(rows)} donors; rows skipped: {skipped}")
    print(f"Monetary basis: {args.monetary}; weights R,F,M = {weights}")
    print(f"Breaks R (days) {r_breaks} | F (gifts) {f_breaks} | M {m_breaks}")
    print(",".join(cols))
    for r in rows:
        print(",".join(str(r[c]) for c in cols))

    print("\nSegment summary: segment, donors, total monetary, average weighted score")
    summary = {}
    for r in rows:
        s = summary.setdefault(r["segment"], [0, 0.0, 0.0])
        s[0] += 1
        s[1] += r["monetary"]
        s[2] += r["weighted"]
    for name, (n, total, w) in sorted(summary.items(), key=lambda kv: -kv[1][0]):
        print(f"  {name}: {n}, {total:,.2f}, {w / n:.2f}")

    if args.current_start and args.current_end:
        retention(gifts, parse_date(args.current_start), parse_date(args.current_end), args.upgrade_min)

    if args.out:
        with open(args.out, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=cols)
            writer.writeheader()
            for r in rows:
                writer.writerow({c: r[c] for c in cols})
        print(f"\nDonor table written to {args.out}")


if __name__ == "__main__":
    main()
