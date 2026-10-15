"use client";

/**
 * SkeletonRow — a placeholder whose ONLY job is to hold the geometry.
 *
 * It must be exactly the real row's height. If it is not, the content jumps
 * when it swaps in and the user's aim is invalidated at the worst moment —
 * the instant they finally have something to click.
 *
 * Threshold (Nielsen's response-time limits):
 *   <100ms  → render nothing. The user perceives it as instantaneous.
 *   100ms–1s → keep the OLD content; dim it and show an indeterminate bar.
 *              Do not blank a populated list to show skeletons: you are
 *              removing information the user already had.
 *   >1s, shape known → skeletons. 3–8 rows, never a full page of them.
 *   >10s     → determinate progress + a cancel control.
 *
 * The shimmer is one opacity keyframe (`animate-shimmer`, 1.4s) defined in
 * foundation.css, and it stops under prefers-reduced-motion.
 */

import { cls } from "./utils";

interface SkeletonRowProps {
  /** Column widths as Tailwind classes — mirror the real table's columns so
   *  the skeleton reads as the same table, not as a generic loading state. */
  widths?: string[];
  rows?: number;
  hasCheckbox?: boolean;
  className?: string;
}

export function SkeletonRows({
  widths = ["w-[40%]", "w-[18%]", "w-[14%]", "w-[12%]"],
  rows = 6,
  hasCheckbox = true,
  className,
}: SkeletonRowProps) {
  return (
    <div role="status" aria-label="Loading rows" className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex h-band-row items-center gap-4 border-b border-border px-4"
          // Staggering the shimmer by row is the one acceptable per-row delay:
          // it is ambient, it does not gate the arrival of real content, and it
          // is capped so row 8 is not visibly later than row 1.
          style={{ animationDelay: `${Math.min(i, 4) * 60}ms` }}
        >
          {hasCheckbox && <span className="size-4 shrink-0 rounded-sm bg-border animate-shimmer" />}
          {widths.map((w, j) => (
            <span key={j} className={cls("h-3 rounded-sm bg-border animate-shimmer", w)} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Inline progress for the 100ms–1s window: keep the content, dim it, show
 *  motion at the top edge. Never a centred spinner over a populated list. */
export function InlineRefreshing({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden={!active}
      className={cls(
        "pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden transition-app",
        active ? "opacity-100" : "opacity-0"
      )}
    >
      <span className="block h-full w-1/3 bg-accent animate-shimmer" />
    </div>
  );
}
