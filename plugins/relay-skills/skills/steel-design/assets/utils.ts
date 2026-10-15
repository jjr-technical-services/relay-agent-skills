import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes; later classes win. */
export function cls(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The one motion config, as a `motion` transition object. See foundation.css. */
export const MOTION = { duration: 0.14, ease: [0.2, 0, 0, 1] } as const;
export const MOTION_ENTER = { duration: 0.18, ease: [0.2, 0, 0, 1] } as const;

/** Format a count for chrome: 1,204 — always tabular, never "1.2k" in a
 *  toolbar where the user may be reconciling it against a total. */
export const fmtCount = (n: number) => n.toLocaleString();

/** Table cell for a missing value. One glyph, everywhere.
 *  Geist's rule: render an en dash, never "N/A", "null", or "". */
export const EMPTY_CELL = "–";

/** Relative time inside 7 days, absolute after — so "3d ago" never turns into
 *  "412d ago", which nobody can convert to a date. */
export function timeCell(iso: string, now = Date.now()) {
  const ms = now - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d <= 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Range label for pagination: "21–40 of 142". En dash inside the range. */
export function rangeLabel(page: number, pageSize: number, total: number) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return `${from}–${to} of ${fmtCount(total)}`;
}
