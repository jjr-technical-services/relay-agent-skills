"use client";

/**
 * DataTable — the default list surface. TanStack Table for state, a plain
 * semantic <table> for the DOM.
 *
 * Why a <table> and not role="grid": role="grid" is a promise. It means one tab
 * stop for the whole table and full arrow-key cell navigation (ARIA APG). Half
 * of that is worse than none — you have removed the tab stops the user had and
 * not given them the arrow keys you implied. Use this component's `rowNav`
 * option for up/down row navigation, which is a smaller, keepable promise.
 *
 * Column contract:
 *   identifier first, and human-readable — never an auto-generated ID (NN/g)
 *   text left-aligned, always; never centred (Spectrum)
 *   numbers right-aligned + tabular figures, EXCEPT nominal numbers
 *     (zip, IP, phone, order number) which are identifiers and go left
 *   headers follow the alignment of their data
 *   status as a badge; dates relative inside 7 days, absolute after
 *   actions last, in a fixed-width column whose space is reserved
 *   exactly ONE column may truncate — the name. Numbers, dates and status
 *     never truncate; drop or resize the column instead.
 */

import * as React from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cls } from "./utils";

export type Density = "dense" | "default" | "comfortable";

const ROW_H: Record<Density, string> = {
  dense: "h-[32px]",
  default: "h-[40px]",
  comfortable: "h-[48px]",
};

/** Put this in a column's `meta` to drive alignment and truncation. */
export type ColMeta = {
  /** "num" → right + tabular. "nominal" → left, even though it is digits. */
  align?: "text" | "num" | "nominal";
  /** The one column allowed to truncate. */
  truncate?: boolean;
  /** Hide below this viewport width; surfaced in the column menu instead. */
  priority?: 1 | 2 | 3;
  /** Fixed width, e.g. "w-[88px]". Actions and status columns should be fixed. */
  width?: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  /** Stable row id — required for selection to survive re-sorting and paging. */
  getRowId: (row: T) => string;
  density?: Density;
  selection?: {
    value: RowSelectionState;
    onChange: (next: RowSelectionState) => void;
    /** Label for a row's checkbox: "Select Acme Inc", never "Select row 4". */
    rowLabel: (row: T) => string;
  };
  /** Row click opens the record. Keep it separate from selection: clicking a
   *  row should not toggle its checkbox, or bulk selection becomes unusable. */
  onRowActivate?: (row: T) => void;
  /** Row actions, revealed on hover AND focus-within. Reserve the column. */
  rowActions?: (row: T) => React.ReactNode;
  rowActionsWidth?: string;
  /** Up/down arrow navigation between rows. Cheap, and it is the shortcut
   *  users actually want; full grid navigation is usually not. */
  rowNav?: boolean;
  /** Offset for the sticky header: sum of the bands above the table. */
  stickyHeaderTop?: string;
  /** Alternating row colour. Decision rule in the comment below. */
  zebra?: boolean;
  sorting?: SortingState;
  onSortingChange?: (s: SortingState) => void;
  caption: string;
  className?: string;
}

/**
 * Zebra striping — the sources disagree, so here is the rule.
 *   NN/g recommends alternating row colours to help horizontal scanning.
 *   Adobe Spectrum explicitly forbids them ("Don't use zebra stripes"), on the
 *   grounds that row dividers already do that job.
 *   IBM Carbon ships them as an optional modifier.
 * Decide by column count and by what else is competing for the row background:
 *   >6 columns, or no row dividers        → zebra earns its keep
 *   ≤6 columns with a 1px divider + hover → skip it
 *   selection uses a row background       → skip it. Three row backgrounds
 *     (zebra, hover, selected) at similar lightness make selection unreadable,
 *     which is the actual failure this rule prevents.
 */
export function zebraIsWorthIt(columns: number, hasDividers: boolean, selectionTintsRow: boolean) {
  if (selectionTintsRow) return false;
  return columns > 6 || !hasDividers;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  density = "default",
  selection,
  onRowActivate,
  rowActions,
  rowActionsWidth = "w-[76px]",
  rowNav = true,
  stickyHeaderTop = "0px",
  zebra = false,
  sorting,
  onSortingChange,
  caption,
  className,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      ...(sorting ? { sorting } : {}),
      ...(selection ? { rowSelection: selection.value } : {}),
    },
    onSortingChange: onSortingChange
      ? (updater) =>
          onSortingChange(typeof updater === "function" ? updater(sorting ?? []) : updater)
      : undefined,
    onRowSelectionChange: selection
      ? (updater) =>
          selection.onChange(
            typeof updater === "function" ? updater(selection.value) : updater
          )
      : undefined,
    enableRowSelection: !!selection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const allSelected = selection ? table.getIsAllRowsSelected() : false;
  const someSelected = selection ? table.getIsSomeRowsSelected() : false;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableSectionElement>) => {
    if (!rowNav) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const trs = Array.from(e.currentTarget.querySelectorAll<HTMLTableRowElement>("tr[tabindex]"));
    const i = trs.indexOf(document.activeElement?.closest("tr") as HTMLTableRowElement);
    const next = trs[e.key === "ArrowDown" ? i + 1 : i - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  return (
    <table className={cls("w-full border-separate border-spacing-0 text-sm", className)}>
      {/* A caption is the table's accessible name. Visually hidden is fine;
          absent is not — a screen reader then announces "table" with no idea
          which of the page's tables it landed in. */}
      <caption className="sr-only">{caption}</caption>

      <thead>
        <tr className="h-band-thead">
          {selection && (
            <th
              scope="col"
              className={cls(
                "sticky z-10 w-10 border-b border-border bg-bg px-4 text-left",
                "align-middle"
              )}
              style={{ top: stickyHeaderTop }}
            >
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={() => table.toggleAllRowsSelected(!allSelected)}
                label={allSelected ? "Deselect all rows on this page" : "Select all rows on this page"}
              />
            </th>
          )}

          {table.getHeaderGroups()[0]?.headers.map((header) => {
            const meta = (header.column.columnDef.meta ?? {}) as ColMeta;
            const sortDir = header.column.getIsSorted();
            const canSort = header.column.getCanSort();
            return (
              <th
                key={header.id}
                scope="col"
                // aria-sort belongs on the header cell, not the button.
                aria-sort={
                  sortDir === "asc" ? "ascending" : sortDir === "desc" ? "descending" : undefined
                }
                className={cls(
                  "sticky z-10 border-b border-border bg-bg px-4 font-medium text-muted",
                  "whitespace-nowrap align-middle",
                  meta.align === "num" ? "text-right" : "text-left",
                  meta.width,
                  meta.priority === 3 && "hidden xl:table-cell",
                  meta.priority === 2 && "hidden lg:table-cell"
                )}
                style={{ top: stickyHeaderTop }}
              >
                {canSort ? (
                  // A sortable header is a BUTTON. The arrow is decorative; the
                  // button's accessible name announces the next sort state.
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cls(
                      "group -mx-1 inline-flex h-6 max-w-full items-center gap-1 rounded px-1",
                      "transition-app hover:text-text",
                      meta.align === "num" && "flex-row-reverse"
                    )}
                  >
                    <span className="truncate">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    <SortArrow dir={sortDir || null} />
                  </button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </th>
            );
          })}

          {rowActions && (
            <th
              scope="col"
              className={cls("sticky z-10 border-b border-border bg-bg", rowActionsWidth)}
              style={{ top: stickyHeaderTop }}
            >
              <span className="sr-only">Row actions</span>
            </th>
          )}
        </tr>
      </thead>

      <tbody onKeyDown={onKeyDown}>
        {rows.map((row, i) => {
          const selected = row.getIsSelected();
          return (
            <tr
              key={row.id}
              // `scroll-clear-header` keeps a focused row out from under the
              // sticky header — WCAG 2.2 SC 2.4.11, Level AA.
              className={cls(
                "group scroll-clear-header transition-app",
                ROW_H[density],
                zebra && i % 2 === 1 && "bg-bg-subtle",
                selected ? "bg-row-selected" : "hover:bg-row-hover",
                onRowActivate && "cursor-pointer"
              )}
              tabIndex={rowNav ? 0 : undefined}
              aria-selected={selection ? selected : undefined}
              onClick={onRowActivate ? () => onRowActivate(row.original) : undefined}
              onKeyDown={
                onRowActivate
                  ? (e) => {
                      if (e.key === "Enter" && e.target === e.currentTarget) {
                        onRowActivate(row.original);
                      }
                    }
                  : undefined
              }
            >
              {selection && (
                <td
                  className="w-10 border-b border-border px-4 align-middle"
                  // The checkbox is not the row's activation target.
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selected}
                    onChange={() => row.toggleSelected()}
                    label={selection.rowLabel(row.original)}
                  />
                </td>
              )}

              {row.getVisibleCells().map((cell) => {
                const meta = (cell.column.columnDef.meta ?? {}) as ColMeta;
                return (
                  <td
                    key={cell.id}
                    className={cls(
                      "border-b border-border px-4 align-middle",
                      meta.align === "num" ? "tnum text-right" : "text-left",
                      // min-w-0 is what actually makes `truncate` work inside a
                      // table cell; without it the cell grows instead.
                      meta.truncate ? "min-w-0 max-w-0 truncate" : "whitespace-nowrap",
                      meta.width,
                      meta.priority === 3 && "hidden xl:table-cell",
                      meta.priority === 2 && "hidden lg:table-cell"
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}

              {rowActions && (
                <td
                  className={cls("border-b border-border pr-2 align-middle", rowActionsWidth)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Reserved space + opacity reveal: the column always occupies
                      its width, so revealing actions never reflows the row.
                      focus-within is not optional — without it these actions do
                      not exist for a keyboard user. Always-visible on coarse
                      pointers, because a touch device has no hover. */}
                  <div
                    className={cls(
                      "flex items-center justify-end gap-1 opacity-0 transition-app",
                      "group-hover:opacity-100 group-focus-within:opacity-100",
                      "[@media(pointer:coarse)]:opacity-100"
                    )}
                  >
                    {rowActions(row.original)}
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SortArrow({ dir }: { dir: "asc" | "desc" | null }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={cls(
        "size-3 shrink-0 transition-app",
        // Unsorted arrows appear on hover only (Carbon); the sorted column
        // keeps its arrow so the current sort is visible at rest.
        dir ? "opacity-100" : "opacity-0 group-hover:opacity-60"
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {dir === "desc" ? <path d="M6 2v8M3 7l3 3 3-3" /> : <path d="M6 10V2M3 5l3-3 3 3" />}
    </svg>
  );
}

/** Tri-state checkbox. aria-checked="mixed" is what makes "some selected"
 *  legible to a screen reader; a visually dashed box alone says nothing. */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      aria-checked={indeterminate ? "mixed" : checked}
      className={cls(
        "size-4 shrink-0 cursor-pointer rounded-sm border border-border-control",
        "accent-[var(--accent)] transition-app"
      )}
    />
  );
}

/** Status badge. The dot carries 3:1 non-text contrast (WCAG SC 1.4.11) so
 *  status is not conveyed by a pale tint alone. */
export function StatusBadge({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warn" | "danger" | "accent";
  children: React.ReactNode;
}) {
  const dot = {
    neutral: "bg-border-control",
    success: "bg-success",
    warn: "bg-warn",
    danger: "bg-danger",
    accent: "bg-accent",
  }[tone];
  return (
    <span className="inline-flex items-center gap-1x whitespace-nowrap text-sm text-muted">
      <span aria-hidden className={cls("size-1.5 shrink-0 rounded-full", dot)} />
      {children}
    </span>
  );
}

/** Zero and null are noise in a scan column. Zero goes muted; null gets an
 *  en dash — never "N/A", "null", or an empty cell you cannot tell from a
 *  render failure. */
export function NumCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-subtle">–</span>;
  if (value === 0) return <span className="text-subtle">0</span>;
  return <span>{value.toLocaleString()}</span>;
}
