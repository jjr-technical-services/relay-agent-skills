#!/usr/bin/env python3
"""Total a grant budget, apply an indirect cost rate to a chosen base, and check a funder cap.

Usage:
    python3 grant_budget.py BUDGET.csv [options]
    cat BUDGET.csv | python3 grant_budget.py - [options]

Input CSV columns (header row required; names are case-insensitive):
    line_item      short name of the budget line (required)
    category       cost category (required); see the category list below
    amount         amount requested from this funder (required; numbers, commas allowed)
    cost_share     optional cash or in-kind match for the same line (default 0)
    match_type     optional: cash or in-kind (reported only)
    subaward_id    optional: identifier that groups lines belonging to one subaward
    year           optional: budget year label (e.g. 1, 2, 3); totals are shown per year
    justification  optional: one-line basis for the amount (e.g. "0.5 FTE x 60,000")

Categories recognised for the modified total direct cost (MTDC) base:
    personnel, fringe, travel, supplies, contractual, other   -> included in MTDC
    subaward                                                  -> first SUBAWARD_LIMIT per subaward_id included
    equipment, capital, rental, tuition, scholarships,
    participant_support, patient_care                         -> excluded from MTDC
    indirect                                                  -> ignored in base and direct totals (the script computes indirect)
Any other category is treated as included and reported as "unrecognised" so you can reclassify it.

Options:
    --rate R            indirect rate as a decimal (e.g. 0.15). Required.
    --base B            base for the rate: mtdc (default), tdc, or salaries
                        (salaries = personnel only; salaries_fringe = personnel + fringe)
    --subaward-limit N  amount of each subaward counted in MTDC (default 50000; confirm the current rule)
    --exclude CAT,...   extra categories to exclude from the base (e.g. a funder's own exclusions)
    --cap R             funder cap on indirect as a decimal (e.g. 0.10). Optional.
    --cap-base C        what the cap applies to: tdc (default), mtdc, or total
                        (total = cap is a share of the whole award including indirect)

Output: a category summary, the base calculation with every exclusion listed, the indirect amount,
the cap check ("Within cap" or "Exceeds cap by ..."), cost share totals, per-year totals, and a
line-by-line justification table. Nothing is written to disk.

Rules this script does not decide: whether a cost is allowable, the correct category for an
ambiguous line, or which rate the organization is entitled to. Those are judgement calls to
record in the budget narrative and confirm with the funder and the organization's accountant.
"""

from __future__ import annotations

import argparse
import csv
import io
import sys
from collections import OrderedDict, defaultdict

INCLUDED = {"personnel", "fringe", "travel", "supplies", "contractual", "other"}
MTDC_EXCLUDED = {
    "equipment",
    "capital",
    "rental",
    "tuition",
    "scholarships",
    "participant_support",
    "patient_care",
}
SPECIAL = {"subaward", "indirect"}
# Common spellings mapped to the category names above.
ALIASES = {
    "rent": "rental",
    "space_rental": "rental",
    "participant_support_costs": "participant_support",
    "stipends": "participant_support",
    "scholarship": "scholarships",
}


def parse_amount(raw: str, label: str) -> float:
    text = (raw or "").strip().replace(",", "").replace("$", "")
    if text == "":
        return 0.0
    try:
        return float(text)
    except ValueError as exc:
        raise SystemExit(f"error: {label} is not a number: {raw!r}") from exc


def money(value: float) -> str:
    return f"{value:,.2f}"


def read_rows(path: str) -> list[dict]:
    if path == "-":
        handle = io.StringIO(sys.stdin.read())
    else:
        handle = open(path, newline="", encoding="utf-8-sig")
    with handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise SystemExit("error: the CSV has no header row")
        rows = []
        for index, raw in enumerate(reader, start=2):
            row = {(k or "").strip().lower(): (v or "").strip() for k, v in raw.items()}
            if not any(row.values()):
                continue
            for required in ("line_item", "category", "amount"):
                if not row.get(required):
                    raise SystemExit(f"error: row {index} is missing {required}")
            row["category"] = row["category"].lower().replace(" ", "_").replace("-", "_")
            row["category"] = ALIASES.get(row["category"], row["category"])
            row["amount"] = parse_amount(row["amount"], f"row {index} amount")
            row["cost_share"] = parse_amount(row.get("cost_share", ""), f"row {index} cost_share")
            row["_row"] = index
            rows.append(row)
    if not rows:
        raise SystemExit("error: no budget lines found")
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("csv_path", help="budget CSV path, or - for stdin")
    parser.add_argument("--rate", type=float, required=True)
    parser.add_argument("--base", default="mtdc", choices=["mtdc", "tdc", "salaries", "salaries_fringe"])
    parser.add_argument("--subaward-limit", type=float, default=50000.0)
    parser.add_argument("--exclude", default="")
    parser.add_argument("--cap", type=float, default=None)
    parser.add_argument("--cap-base", default="tdc", choices=["tdc", "mtdc", "total"])
    args = parser.parse_args()

    if not 0 <= args.rate < 1:
        raise SystemExit("error: --rate must be a decimal between 0 and 1 (e.g. 0.15)")
    if args.cap is not None and not 0 <= args.cap < 1:
        raise SystemExit("error: --cap must be a decimal between 0 and 1 (e.g. 0.10)")

    extra_excluded = {c.strip().lower().replace(" ", "_") for c in args.exclude.split(",") if c.strip()}
    rows = read_rows(args.csv_path)

    by_category: "OrderedDict[str, float]" = OrderedDict()
    by_year: dict[str, float] = defaultdict(float)
    share_by_type: dict[str, float] = defaultdict(float)
    unrecognised: set[str] = set()
    subaward_seen: dict[str, float] = defaultdict(float)
    base_lines: list[tuple[str, float, float, str]] = []  # line, amount, in_base, reason

    tdc = 0.0
    for row in rows:
        cat = row["category"]
        amount = row["amount"]
        if cat == "indirect":
            base_lines.append((row["line_item"], amount, 0.0, "indirect line ignored; computed below"))
            continue
        by_category[cat] = by_category.get(cat, 0.0) + amount
        tdc += amount
        by_year[row.get("year") or "all"] += amount
        if row["cost_share"]:
            share_by_type[(row.get("match_type") or "unspecified").lower()] += row["cost_share"]

        if args.base == "tdc":
            in_base, reason = amount, "included (total direct costs)"
            if cat in extra_excluded:
                in_base, reason = 0.0, "excluded by funder rule (--exclude)"
        elif args.base == "salaries":
            in_base, reason = (amount, "personnel") if cat == "personnel" else (0.0, "not personnel")
        elif args.base == "salaries_fringe":
            in_base, reason = (amount, "personnel or fringe") if cat in ("personnel", "fringe") else (0.0, "not personnel or fringe")
        else:
            if cat in extra_excluded:
                in_base, reason = 0.0, "excluded by funder rule (--exclude)"
            elif cat in MTDC_EXCLUDED:
                in_base, reason = 0.0, f"excluded from MTDC ({cat})"
            elif cat == "subaward":
                key = row.get("subaward_id") or row["line_item"]
                remaining = max(args.subaward_limit - subaward_seen[key], 0.0)
                in_base = min(amount, remaining)
                subaward_seen[key] += amount
                reason = f"subaward {key}: first {money(args.subaward_limit)} counted"
            else:
                in_base, reason = amount, "included in MTDC"
                if cat not in INCLUDED:
                    unrecognised.add(cat)
        base_lines.append((row["line_item"], amount, in_base, reason))

    base = sum(line[2] for line in base_lines)
    indirect = round(args.rate * base, 2)
    total = tdc + indirect

    print("GRANT BUDGET SUMMARY")
    print("=" * 60)
    for cat, amount in by_category.items():
        print(f"{cat:<28}{money(amount):>20}")
    print("-" * 60)
    print(f"{'Total direct costs (TDC)':<28}{money(tdc):>20}")
    print()
    print(f"INDIRECT COST BASE: {args.base.upper()}")
    print("-" * 60)
    for name, amount, in_base, reason in base_lines:
        print(f"{name[:26]:<28}{money(amount):>14}{money(in_base):>14}  {reason}")
    print("-" * 60)
    print(f"{'Base':<28}{'':>14}{money(base):>14}")
    print(f"Indirect = {args.rate:.4f} x {money(base)} = {money(indirect)}")
    print(f"Total request (TDC + indirect) = {money(total)}")
    if unrecognised:
        print(f"Note: unrecognised categories treated as included: {', '.join(sorted(unrecognised))}")

    if args.cap is not None:
        print()
        print("INDIRECT COST CHECK")
        print("-" * 60)
        if args.cap_base == "tdc":
            allowed = args.cap * tdc
            rule = f"cap {args.cap:.4f} x TDC {money(tdc)}"
        elif args.cap_base == "mtdc":
            mtdc = sum(line[2] for line in base_lines) if args.base == "mtdc" else None
            if mtdc is None:
                raise SystemExit("error: --cap-base mtdc requires --base mtdc")
            allowed = args.cap * mtdc
            rule = f"cap {args.cap:.4f} x MTDC {money(mtdc)}"
        else:
            allowed = args.cap * tdc / (1 - args.cap)
            rule = f"cap {args.cap:.4f} of total award: max = cap x TDC / (1 - cap) = {args.cap:.4f} x {money(tdc)} / {1 - args.cap:.4f}"
        allowed = round(allowed, 2)
        print(f"Maximum indirect allowed: {money(allowed)}  ({rule})")
        if indirect > allowed + 0.005:
            print(f"Result: Exceeds cap by {money(indirect - allowed)}; request at most {money(allowed)} "
                  f"or move the difference to cost share if the funder allows it")
        else:
            print(f"Result: Within cap (headroom {money(allowed - indirect)})")

    if share_by_type:
        print()
        print("COST SHARE / MATCH")
        print("-" * 60)
        for kind, amount in sorted(share_by_type.items()):
            print(f"{kind:<28}{money(amount):>20}")
        print(f"{'Total cost share':<28}{money(sum(share_by_type.values())):>20}")

    if len(by_year) > 1 or "all" not in by_year:
        print()
        print("DIRECT COSTS BY YEAR")
        print("-" * 60)
        for year in sorted(by_year):
            print(f"Year {year:<23}{money(by_year[year]):>20}")

    print()
    print("JUSTIFICATION TABLE")
    print("-" * 60)
    print("line_item | category | amount | cost_share | justification")
    for row in rows:
        just = row.get("justification") or "MISSING: add the calculation basis"
        print(f"{row['line_item']} | {row['category']} | {money(row['amount'])} | {money(row['cost_share'])} | {just}")


if __name__ == "__main__":
    main()
