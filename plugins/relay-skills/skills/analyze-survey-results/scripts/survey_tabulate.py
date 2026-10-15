#!/usr/bin/env python3
"""Tabulate survey results with top-2-box, crosstabs, and small-cell suppression.

Usage:
  python3 survey_tabulate.py responses.csv --likert Q1,Q2 [options]
  cat responses.csv | python3 survey_tabulate.py - --choice role --group campus

Input: a CSV export with one row per response and a header row.

What it prints:
  1. Cleaning summary: rows read, duplicates removed (--id-col), speeders
     removed (--duration-col with --min-seconds), partials removed
     (--min-answered), rows kept.
  2. For each single-choice column (--choice): counts and percentages overall,
     and by group when --group is set.
  3. For each Likert column (--likert): the full distribution in scale order,
     valid n, off-scale or blank answers, and top-2-box share
     (top-2-box = responses in the top two scale points / valid responses).
     By group when --group is set.
  4. Matched pre/post (when --wave-col and --pair-col are set): per Likert
     item, pairs with valid answers in both waves, improved / same / declined
     counts, top-2-box before and after among the pairs, and an exact McNemar
     test on the top-2-box change.

Suppression (always on):
  --min-cell N (default 10, an assumption to replace with the organization's
  own threshold). Any count from 1 to N-1 is shown as "suppressed" with its
  percentage hidden. A group whose total is below N is suppressed entirely
  and its n shown only as "<N".
  Complementary rule: if exactly one nonzero cell in a row is suppressed, the
  next smallest nonzero cell in that row is also suppressed so the hidden
  value cannot be recovered by subtraction. Zero counts are shown as 0.
  Top-2-box is hidden when the group is hidden, when the top-2 count or the
  remainder is between 1 and N-1, or when it would let a hidden cell be
  recovered. These rules are standard primary and complementary suppression;
  they do not guarantee protection against every combination of equations
  across tables. For sensitive items, report fewer breakdowns or collapse
  categories as well.

Options:
  --likert COLS          comma-separated Likert column names
  --choice COLS          comma-separated single-choice column names
  --group COL            grouping column for crosstabs
  --scale LABELS         comma-separated scale labels from lowest to highest.
                         Default: numeric values if every answer is a number,
                         otherwise "Strongly disagree,Disagree,Neither agree nor
                         disagree,Agree,Strongly agree". Matching ignores case.
  --top K                number of top scale points in the top box (default 2)
  --min-cell N           suppression threshold (default 10)
  --id-col COL           respondent id; later duplicates are removed
  --duration-col COL     completion time in seconds
  --min-seconds S        drop responses faster than S seconds (speeders)
  --min-answered F       drop responses that answered less than fraction F of
                         the --likert and --choice columns (default 0)
  --wave-col COL         column holding the wave label (for example pre/post)
  --pre-label VALUE      wave value for the first wave (default pre)
  --post-label VALUE     wave value for the second wave (default post)
  --pair-col COL         code that links a person's pre and post responses
  --out PATH             also write every printed table to this CSV path

Standard library only. Reads the CSV from a path or stdin, prints results,
and writes a file only when --out is given.
"""

import argparse
import csv
import io
import math
import sys
from collections import Counter, OrderedDict

DEFAULT_SCALE = [
    "Strongly disagree",
    "Disagree",
    "Neither agree nor disagree",
    "Agree",
    "Strongly agree",
]


def split_cols(value):
    return [c.strip() for c in value.split(",") if c.strip()] if value else []


def read_rows(path):
    if path == "-":
        text = sys.stdin.read()
    else:
        with open(path, newline="", encoding="utf-8-sig") as handle:
            text = handle.read()
    reader = csv.DictReader(io.StringIO(text))
    return reader.fieldnames or [], [dict(r) for r in reader]


def is_number(value):
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False


def build_scale(rows, column, labels):
    """Return (ordered list of scale labels, function mapping answer -> index or None)."""
    if labels:
        ordered = labels
    else:
        answers = [r.get(column, "").strip() for r in rows if r.get(column, "").strip()]
        if answers and all(is_number(a) for a in answers):
            ordered = [fmt_num(v) for v in sorted({float(a) for a in answers})]
            print(f"  Note: scale for {column} inferred from answers seen ({', '.join(ordered)}); "
                  "if any scale point was never chosen, rerun with --scale so top-2-box uses the real top points.")
            lookup = {v: i for i, v in enumerate(ordered)}
            return ordered, lambda a: lookup.get(fmt_num(float(a))) if is_number(a) else None
        ordered = DEFAULT_SCALE
    lookup = {label.lower(): i for i, label in enumerate(ordered)}
    return ordered, lambda a: lookup.get(a.strip().lower())


def fmt_num(value):
    return str(int(value)) if float(value).is_integer() else str(value)


def pct(part, whole):
    return "" if not whole else f"{100.0 * part / whole:.0f}%"


def suppress_row(counts, min_cell):
    """counts: list of ints. Returns a list of booleans, True where the cell is hidden."""
    hidden = [0 < c < min_cell for c in counts]
    if sum(hidden) == 1:
        candidates = [(c, i) for i, c in enumerate(counts) if c > 0 and not hidden[i]]
        if candidates:
            hidden[min(candidates)[1]] = True
    return hidden


def render_table(title, header, rows, out_rows):
    widths = [max(len(str(x)) for x in col) for col in zip(header, *rows)] if rows else [len(h) for h in header]
    print(f"\n{title}")
    print("  " + "  ".join(str(h).ljust(w) for h, w in zip(header, widths)))
    for row in rows:
        print("  " + "  ".join(str(v).ljust(w) for v, w in zip(row, widths)))
    out_rows.append([title])
    out_rows.append(header)
    out_rows.extend(rows)
    out_rows.append([])


def group_rows(rows, group_col):
    groups = OrderedDict()
    groups["All respondents"] = rows
    if group_col:
        keys = sorted({(r.get(group_col) or "").strip() or "(blank)" for r in rows})
        for key in keys:
            groups[f"{group_col} = {key}"] = [
                r for r in rows if ((r.get(group_col) or "").strip() or "(blank)") == key
            ]
    return groups


def suppress_table(counts, sizes, rel_cols, min_cell):
    """Primary and complementary suppression for a table.

    counts: list of rows of ints; row 0 is "All respondents", rows 1.. are groups.
    sizes:  the n of each row (sum of the cells in rel_cols).
    rel_cols: column indexes whose cells add up to the row n.
    Returns (hidden cells as lists of booleans, hidden rows as booleans).
    A row is hidden entirely when its n is below min_cell. Then, repeatedly:
    - within a row, one hidden cell among rel_cols forces a second;
    - within a column, one hidden cell among All plus the groups forces a second
      (the All row equals the sum of the groups);
    - one hidden group row forces a second group row to be hidden.
    Only nonzero cells are chosen as complements, because hiding a zero does not
    protect the other value.
    """
    rows = len(counts)
    cols = len(counts[0]) if counts else 0
    row_hidden = [size < min_cell for size in sizes]
    hidden = [[row_hidden[r] or 0 < counts[r][c] < min_cell for c in range(cols)] for r in range(rows)]

    def hide_smallest(cells):
        options = [(counts[r][c], r, c) for r, c in cells if not hidden[r][c] and counts[r][c] > 0]
        if options:
            _, r, c = min(options)
            hidden[r][c] = True
            return True
        return False

    changed = True
    while changed:
        changed = False
        for r in range(rows):
            if row_hidden[r]:
                continue
            cells = [(r, c) for c in rel_cols]
            if sum(hidden[r][c] for c in rel_cols) == 1 and hide_smallest(cells):
                changed = True
        if rows > 1:
            for c in range(cols):
                cells = [(r, c) for r in range(rows)]
                if sum(hidden[r][c] for r in range(rows)) == 1:
                    if hide_smallest([(r, c) for r in range(1, rows)]) or hide_smallest([(0, c)]):
                        changed = True
            if sum(row_hidden[1:]) == 1:
                visible = [(sizes[r], r) for r in range(1, rows) if not row_hidden[r] and sizes[r] > 0]
                if visible:
                    _, r = min(visible)
                    row_hidden[r] = True
                    hidden[r] = [True] * cols
                    changed = True
    return hidden, row_hidden


def show(value, n, is_hidden):
    return "suppressed" if is_hidden else f"{value} ({pct(value, n)})"


def tabulate_choice(rows, column, group_col, min_cell, out_rows):
    categories = sorted({(r.get(column) or "").strip() or "(blank)" for r in rows})
    header = ["Group", "n"] + categories
    groups = group_rows(rows, group_col)
    names = list(groups)
    counts, sizes = [], []
    for name in names:
        tally = Counter((r.get(column) or "").strip() or "(blank)" for r in groups[name])
        counts.append([tally.get(c, 0) for c in categories])
        sizes.append(len(groups[name]))
    hidden, row_hidden = suppress_table(counts, sizes, list(range(len(categories))), min_cell)
    table = []
    for r, name in enumerate(names):
        size = f"<{min_cell}" if sizes[r] < min_cell else ("suppressed" if row_hidden[r] else sizes[r])
        table.append([name, size] + [show(v, sizes[r], h) for v, h in zip(counts[r], hidden[r])])
    render_table(f"Single choice: {column}", header, table, out_rows)


def tabulate_likert(rows, column, group_col, scale_labels, top, min_cell, out_rows):
    ordered, index_of = build_scale(rows, column, scale_labels)
    k = len(ordered)
    top = max(1, min(top, k))
    header = ["Group", "valid n", "off-scale or blank"] + ordered + [f"top-{top}-box"]
    groups = group_rows(rows, group_col)
    names = list(groups)
    counts, sizes = [], []
    for name in names:
        indices = [index_of(r.get(column) or "") for r in groups[name]]
        valid = [i for i in indices if i is not None]
        # column 0 is off-scale or blank; columns 1..k are the scale points
        counts.append([len(indices) - len(valid)] + [sum(1 for i in valid if i == j) for j in range(k)])
        sizes.append(len(valid))
    scale_cols = list(range(1, k + 1))
    hidden, row_hidden = suppress_table(counts, sizes, scale_cols, min_cell)

    top_cols = scale_cols[-top:]
    bottom_cols = scale_cols[:-top]
    t2b_hidden = []
    for r in range(len(names)):
        n = sizes[r]
        top_count = sum(counts[r][c] for c in top_cols)
        rest = n - top_count
        hide = row_hidden[r]
        # one hidden cell inside the top box or inside the remainder would be recoverable
        hide = hide or sum(hidden[r][c] for c in top_cols) == 1 or sum(hidden[r][c] for c in bottom_cols) == 1
        if 0 < top_count < min_cell or 0 < rest < min_cell:
            hide = True
        t2b_hidden.append(hide)
    if len(names) > 1 and sum(t2b_hidden) == 1:
        visible = [(sizes[r], r) for r in range(1, len(names)) if not t2b_hidden[r]]
        if visible:
            t2b_hidden[min(visible)[1]] = True
        else:
            t2b_hidden[0] = True

    table = []
    for r, name in enumerate(names):
        n = sizes[r]
        size = f"<{min_cell}" if n < min_cell else ("suppressed" if row_hidden[r] else n)
        off = "suppressed" if hidden[r][0] else str(counts[r][0])
        cells = [show(counts[r][c], n, hidden[r][c]) for c in scale_cols]
        top_count = sum(counts[r][c] for c in top_cols)
        if t2b_hidden[r]:
            t2b = "suppressed"
        else:
            t2b = f"{top_count}/{n} ({pct(top_count, n)})"
            if top_count in (0, n):
                t2b += " all-or-none"
        table.append([name, size, off] + cells + [t2b])
    render_table(f"Likert: {column} (scale low to high)", header, table, out_rows)


def mcnemar_exact(b, c):
    n = b + c
    if n == 0:
        return None
    k = min(b, c)
    tail = sum(math.comb(n, i) for i in range(k + 1)) / (2 ** n)
    return min(1.0, 2 * tail)


def matched_pairs(rows, args, likert_cols, scale_labels, out_rows):
    pre = {}
    post = {}
    for r in rows:
        code = (r.get(args.pair_col) or "").strip()
        wave = (r.get(args.wave_col) or "").strip().lower()
        if not code:
            continue
        if wave == args.pre_label.lower():
            pre.setdefault(code, r)
        elif wave == args.post_label.lower():
            post.setdefault(code, r)
    matched = sorted(set(pre) & set(post))
    print(
        f"\nMatched pre/post: {len(pre)} pre codes, {len(post)} post codes, "
        f"{len(matched)} matched pairs, {len(pre) - len(matched)} pre-only, "
        f"{len(post) - len(matched)} post-only"
    )
    header = ["Item", "pairs", "improved", "same", "declined",
              f"top-{args.top}-box pre", f"top-{args.top}-box post",
              "moved into top box", "moved out of top box", "McNemar exact p"]
    table = []
    for column in likert_cols:
        ordered, index_of = build_scale(rows, column, scale_labels)
        cut = len(ordered) - args.top
        pairs = []
        for code in matched:
            a = index_of(pre[code].get(column) or "")
            b = index_of(post[code].get(column) or "")
            if a is not None and b is not None:
                pairs.append((a, b))
        n = len(pairs)
        if n < args.min_cell:
            table.append([column, f"<{args.min_cell}"] + ["suppressed"] * 8)
            continue
        improved = sum(1 for a, b in pairs if b > a)
        declined = sum(1 for a, b in pairs if b < a)
        same = n - improved - declined
        move_counts = [improved, same, declined]
        hidden = suppress_row(move_counts, args.min_cell)
        moves = ["suppressed" if h else str(v) for v, h in zip(move_counts, hidden)]
        pre_top = sum(1 for a, _ in pairs if a >= cut)
        post_top = sum(1 for _, b in pairs if b >= cut)
        into = sum(1 for a, b in pairs if a < cut <= b)
        out = sum(1 for a, b in pairs if b < cut <= a)
        p = mcnemar_exact(into, out)
        small = lambda v, total: 0 < v < args.min_cell or 0 < total - v < args.min_cell
        boxes = [
            "suppressed" if small(x, n) else f"{x}/{n} ({pct(x, n)})" for x in (pre_top, post_top)
        ]
        # If a movement count or a top-box share is hidden, hide both movement counts
        # and the p-value: post top-box = pre top-box + moved in - moved out.
        if any(0 < v < args.min_cell for v in (into, out)) or "suppressed" in boxes:
            disc = ["suppressed", "suppressed"]
            p_text = "suppressed"
        else:
            disc = [str(into), str(out)]
            p_text = "" if p is None else f"{p:.3f}"
        table.append([column, n] + moves + boxes + disc + [p_text])
    render_table("Matched pre/post change (pairs with valid answers in both waves)", header, table, out_rows)
    print("  Note: change among matched pairs describes only people who answered both waves;"
          " it does not by itself show the program caused the change.")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input")
    parser.add_argument("--likert", default="")
    parser.add_argument("--choice", default="")
    parser.add_argument("--group", default="")
    parser.add_argument("--scale", default="")
    parser.add_argument("--top", type=int, default=2)
    parser.add_argument("--min-cell", type=int, default=10)
    parser.add_argument("--id-col", default="")
    parser.add_argument("--duration-col", default="")
    parser.add_argument("--min-seconds", type=float, default=None)
    parser.add_argument("--min-answered", type=float, default=0.0)
    parser.add_argument("--wave-col", default="")
    parser.add_argument("--pre-label", default="pre")
    parser.add_argument("--post-label", default="post")
    parser.add_argument("--pair-col", default="")
    parser.add_argument("--out", default="")
    args = parser.parse_args()

    likert_cols = split_cols(args.likert)
    choice_cols = split_cols(args.choice)
    scale_labels = split_cols(args.scale)
    if not likert_cols and not choice_cols:
        parser.error("give at least one --likert or --choice column")
    if args.min_cell < 1:
        parser.error("--min-cell must be at least 1")

    try:
        fields, rows = read_rows(args.input)
    except OSError as error:
        parser.error(f"cannot read input: {error}")
    needed = likert_cols + choice_cols + [c for c in (args.group, args.id_col, args.duration_col,
                                                        args.wave_col, args.pair_col) if c]
    missing = [c for c in needed if c not in fields]
    if missing:
        parser.error(f"column(s) not found in the header: {', '.join(missing)}")

    total = len(rows)
    dupes = speeders = partials = 0
    if args.id_col:
        seen = set()
        kept = []
        for r in rows:
            ident = (r.get(args.id_col) or "").strip()
            if not ident:
                kept.append(r)
                continue
            key = (ident, (r.get(args.wave_col) or "").strip().lower()) if args.wave_col else ident
            if key in seen:
                dupes += 1
                continue
            seen.add(key)
            kept.append(r)
        rows = kept
    if args.duration_col and args.min_seconds is not None:
        kept = []
        for r in rows:
            value = (r.get(args.duration_col) or "").strip()
            if is_number(value) and float(value) < args.min_seconds:
                speeders += 1
            else:
                kept.append(r)
        rows = kept
    if args.min_answered > 0:
        analysis_cols = likert_cols + choice_cols
        kept = []
        for r in rows:
            answered = sum(1 for c in analysis_cols if (r.get(c) or "").strip())
            if answered / len(analysis_cols) < args.min_answered:
                partials += 1
            else:
                kept.append(r)
        rows = kept

    print("Cleaning summary")
    print(f"  Rows read: {total}")
    print(f"  Duplicates removed: {dupes}")
    print(f"  Speeders removed: {speeders}")
    print(f"  Partials removed: {partials}")
    print(f"  Rows kept: {len(rows)}")
    print(f"  Suppression threshold: cells below {args.min_cell} are hidden"
          " (confirm this value with the organization)")

    out_rows = []
    group_col = args.group
    if args.wave_col and not group_col:
        group_col = args.wave_col
        print(f"  Tables are split by {args.wave_col}; the 'All respondents' row mixes waves and"
              " should not be reported as a single result.")
    elif args.wave_col:
        print(f"  Tables mix waves in {args.wave_col}; rerun on one wave's rows to report by group.")
    for column in choice_cols:
        tabulate_choice(rows, column, group_col, args.min_cell, out_rows)
    for column in likert_cols:
        tabulate_likert(rows, column, group_col, scale_labels, args.top,
                        args.min_cell, out_rows)
    if args.wave_col and args.pair_col and likert_cols:
        matched_pairs(rows, args, likert_cols, scale_labels, out_rows)

    if args.out:
        with open(args.out, "w", newline="", encoding="utf-8") as handle:
            csv.writer(handle).writerows(out_rows)
        print(f"\nWrote tables to {args.out}")


if __name__ == "__main__":
    main()
