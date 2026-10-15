"use client";

/**
 * BulkActionBar — docks at the BOTTOM, floating, over the list.
 *
 * Why not above the list: inserting a new band above the rows at the moment of
 * selection pushes every row down by the bar's height. The user has just aimed
 * at a row and their next click lands on a different record. The bar moves the
 * thing you are acting on.
 *
 * Two legal placements, and only two:
 *   1. Float at the bottom (this component) — adds no band, obscures nothing
 *      the user is aiming at, and reads as "a state you are in".
 *   2. Overlay the existing toolbar band in place at the SAME height — IBM
 *      Carbon's model. Legal because the layout height does not change.
 * Anything that inserts a new band is the bug.
 */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cls, MOTION_ENTER, fmtCount } from "./utils";

interface BulkActionBarProps {
  count: number;
  /** What the user selected, plural noun: "orders", "members". */
  noun: string;
  onClear: () => void;
  /** Up to three verbs. The fourth goes in an overflow menu. */
  children: React.ReactNode;
  /** Total matching the current query, when select-all-page ≠ select-all-query. */
  totalMatching?: number;
  onSelectAllMatching?: () => void;
  className?: string;
}

export function BulkActionBar({
  count,
  noun,
  onClear,
  children,
  totalMatching,
  onSelectAllMatching,
  className,
}: BulkActionBarProps) {
  // Escape clears the selection — the same key that closes every other
  // transient state in the app.
  React.useEffect(() => {
    if (count === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onClear]);

  const showSelectAll =
    onSelectAllMatching && totalMatching !== undefined && totalMatching > count;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={MOTION_ENTER}
          // role=region + aria-live so the count change is announced without
          // yanking focus out of the row the user is still working through.
          role="region"
          aria-label={`${count} ${noun} selected`}
          className={cls(
            "pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4",
            className
          )}
        >
          <div
            className={cls(
              "pointer-events-auto flex h-band-bulk items-center gap-3 rounded-lg border border-border-strong",
              "bg-surface px-3 shadow-lg"
            )}
          >
            <span aria-live="polite" className="tnum shrink-0 text-sm font-medium">
              {fmtCount(count)} {noun} selected
            </span>

            {showSelectAll && (
              <button
                onClick={onSelectAllMatching}
                className="shrink-0 rounded px-2 py-1 text-sm text-accent hover:bg-accent-subtle"
              >
                Select all {fmtCount(totalMatching!)} matching
              </button>
            )}

            <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
            <div className="flex items-center gap-1">{children}</div>
            <span aria-hidden className="h-5 w-px shrink-0 bg-border" />

            <button
              onClick={onClear}
              className="shrink-0 rounded px-2 py-1 text-sm text-muted hover:bg-surface-hover hover:text-text"
            >
              Clear
              <kbd className="ml-1 text-micro text-subtle">esc</kbd>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
