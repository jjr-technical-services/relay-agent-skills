"use client";

/**
 * EmptyState — one component, six distinct situations.
 *
 * The situations are NOT interchangeable, and conflating them is the most
 * common list-surface bug: a user whose filters exclude everything is told
 * "Create your first order", and goes looking for a create button when the
 * fix was to clear a filter.
 *
 *   first-run   never had data          → teach + one primary action
 *   no-results  filters/search exclude  → name the query + Clear filters
 *   error       request failed           → what failed + Retry
 *   partial     some sources failed      → show what loaded, flag what didn't
 *   permission  data exists, no access   → who to ask, not "something went wrong"
 *   cleared     user emptied it          → confirm success, offer Undo
 *
 * Carbon's structural rule, and the one people miss: the empty state REPLACES
 * the element it stands in — for a table that means the column headers go too.
 * Otherwise a screen reader reads the entire empty table before reaching the
 * message that says there is nothing in it.
 */

import * as React from "react";
import { cls } from "./utils";

export type EmptyKind =
  | "first-run"
  | "no-results"
  | "error"
  | "partial"
  | "permission"
  | "cleared";

interface EmptyStateProps {
  kind: EmptyKind;
  /** Short, and phrased as a positive where honest: "Start by adding a source"
   *  beats "You have no sources" (Carbon). Never end it in an exclamation. */
  title: string;
  /** One or two sentences. Say what will appear here and what to do next. */
  body?: string;
  /** The single next step. Two primary buttons in an empty state means you
   *  have not decided what the user should do. */
  action?: React.ReactNode;
  /** Documentation link, "Learn more" — a link, never a second button. */
  secondary?: React.ReactNode;
  /** Small containers (tiles, side panels) get the compact layout. */
  size?: "compact" | "page";
  className?: string;
}

const TONE: Record<EmptyKind, string> = {
  "first-run": "text-muted",
  "no-results": "text-muted",
  error: "text-danger",
  partial: "text-warn",
  permission: "text-muted",
  cleared: "text-success",
};

export function EmptyState({
  kind,
  title,
  body,
  action,
  secondary,
  size = "page",
  className,
}: EmptyStateProps) {
  return (
    <div
      // Errors are announced; the other kinds are a visible layout result and
      // announcing them would talk over the user's own action.
      role={kind === "error" ? "alert" : "status"}
      className={cls(
        // Left-aligned block (Carbon): centred text in a product surface reads
        // as marketing and gets skipped.
        "flex flex-col items-start gap-3",
        size === "page" ? "mx-auto max-w-[420px] px-4 py-12" : "p-4",
        className
      )}
    >
      <Glyph kind={kind} className={TONE[kind]} />
      <div className="flex flex-col gap-1">
        <p className={cls("font-semibold", size === "page" ? "text-title" : "text-ui")}>{title}</p>
        {body && <p className="prose-ui text-sm">{body}</p>}
      </div>
      {(action || secondary) && (
        <div className="mt-1 flex items-center gap-3">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}

function Glyph({ kind, className }: { kind: EmptyKind; className?: string }) {
  const d =
    kind === "error" || kind === "partial"
      ? "M12 9v4m0 3h.01M10.3 4.3 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"
      : kind === "permission"
        ? "M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5z"
        : kind === "no-results"
          ? "M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM15.5 15.5 21 21"
          : "M4 7h16M4 12h10M4 17h7";
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cls("size-5 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d={d} />
    </svg>
  );
}

/** Ready-made copy for the two states teams most often merge by accident. */
export function NoResults({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <EmptyState
      kind="no-results"
      title="No matches"
      body={`Nothing matches ${query ? `“${query}”` : "the current filters"}. Widen or clear the filters to see more.`}
      action={
        <button
          onClick={onClear}
          className="h-ctl-md rounded border border-border-control px-2.5 text-sm hover:bg-surface-hover"
        >
          Clear filters
        </button>
      }
    />
  );
}
