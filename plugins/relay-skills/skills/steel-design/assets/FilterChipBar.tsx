"use client";

/**
 * FilterChipBar — filter state visible at rest.
 *
 * Every chip carries its own LABEL and VALUE ("Status: Active"), never a bare
 * value. Failure mode of bare values: with two or more dimensions in play,
 * "Active" is ambiguous — subscription status? user status? — and the user
 * cannot tell which chip to remove to widen the result.
 *
 * The bar renders only when at least one filter is active or the surface is
 * filter-first. A permanently present, empty filter band is a band of chrome
 * paying for nothing. Clear-all appears only when count > 0, for the same
 * reason: a disabled "Clear" is a control that has never once been useful.
 */

import * as React from "react";
import { cls } from "./utils";

export type ActiveFilter = {
  id: string;
  /** Dimension name, shown before the colon. */
  label: string;
  /** Human value. For multi-select use "3 selected", not a comma list that
   *  overflows the chip and truncates in the middle of a word. */
  value: string;
  /** Rendered in a popover when the chip body is clicked. */
  editor?: React.ReactNode;
};

interface FilterChipBarProps {
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  /** "+ Add filter" trigger — a popover listing the dimensions. */
  addFilter?: React.ReactNode;
  /** Sort control belongs here, not in the toolbar: it is a query parameter,
   *  same as a filter, and it should share the row that shows query state. */
  sortControl?: React.ReactNode;
  /** Render even with zero filters (filter-first surfaces: search, reports). */
  alwaysVisible?: boolean;
  className?: string;
}

export function FilterChipBar({
  filters,
  onRemove,
  onClearAll,
  addFilter,
  sortControl,
  alwaysVisible = false,
  className,
}: FilterChipBarProps) {
  if (filters.length === 0 && !alwaysVisible) return null;

  return (
    <div
      className={cls(
        "flex h-band-filters shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-bg px-4",
        className
      )}
      role="group"
      aria-label="Active filters"
    >
      {filters.map((f) => (
        <FilterChip key={f.id} filter={f} onRemove={() => onRemove(f.id)} />
      ))}

      {addFilter}

      {filters.length > 0 && (
        <button
          onClick={onClearAll}
          className="ml-1 shrink-0 rounded px-2 py-1 text-sm text-muted transition-app hover:bg-surface-hover hover:text-text"
        >
          Clear all
        </button>
      )}

      <div className="flex-1" />
      {sortControl}
    </div>
  );
}

function FilterChip({ filter, onRemove }: { filter: ActiveFilter; onRemove: () => void }) {
  return (
    <span
      className={cls(
        "inline-flex h-ctl-sm shrink-0 items-center rounded border border-border-control bg-surface",
        "text-sm transition-app"
      )}
    >
      <span className="flex h-full items-center gap-1 pl-2 pr-1">
        <span className="text-subtle">{filter.label}:</span>
        <span className="max-w-[160px] truncate font-medium text-text">{filter.value}</span>
      </span>
      {/* Own hit box, ≥24px, and ≥4px clear of the chip body's own target so
          the SC 2.5.8 spacing exception holds for both. */}
      <button
        onClick={onRemove}
        aria-label={`Remove filter ${filter.label}: ${filter.value}`}
        className="mr-0.5 flex size-6 items-center justify-center rounded-sm text-subtle hover:bg-surface-hover hover:text-text"
      >
        <svg viewBox="0 0 16 16" className="size-3" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </span>
  );
}

/**
 * Decision rule for the filter mechanism — do not mix these on one surface:
 *   ≤2 dimensions, each ≤7 fixed options  → inline selects in the Toolbar
 *   3–6 dimensions, or user-created values → this chip bar + "Add filter"
 *   >6 dimensions with facet counts        → left sidebar, and only if the
 *                                            surface is search-first and the
 *                                            240px it costs is earned
 */
export const FILTER_MECHANISM_RULE = {
  inlineSelects: (dimensions: number, maxOptions: number) => dimensions <= 2 && maxOptions <= 7,
  chipBar: (dimensions: number, userCreatedValues: boolean) =>
    (dimensions >= 3 && dimensions <= 6) || userCreatedValues,
  sidebar: (dimensions: number, hasFacetCounts: boolean, searchFirst: boolean) =>
    dimensions > 6 && hasFacetCounts && searchFirst,
} as const;
