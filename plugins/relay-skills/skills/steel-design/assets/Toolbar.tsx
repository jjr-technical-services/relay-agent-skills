"use client";

/**
 * Toolbar — the ONE band of chrome above a list surface.
 *
 * The chrome budget: page title, record count, view switcher, search and the
 * primary action all live in this single 40px band. Every additional
 * horizontal band you add above the first row of data costs every user on
 * every visit. See references/foundations.md § The chrome budget.
 *
 * Failure mode this component exists to prevent: a breadcrumb band, then a
 * title band, then a description paragraph, then a stats band, then a tab
 * band, then a filter band — 240px of chrome and six rows of data lost
 * before the user has done anything.
 */

import * as React from "react";
import { cls } from "./utils";

export type ToolbarView = { id: string; label: string; count?: number };

interface ToolbarProps {
  /** Short noun phrase. This is the page's h1 — it is chrome, so it is 20px. */
  title: string;
  /** Total matching records. Rendered as a muted sibling of the title, not as
   *  its own band and not as a big number. */
  count?: number;
  /** Count-tabs. This is where a "stats" band belongs: the numbers are
   *  filters, so make them behave like filters. */
  views?: ToolbarView[];
  activeView?: string;
  onViewChange?: (id: string) => void;
  /** Local filter over the loaded collection. Distinct from ⌘K global search. */
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  /** Exactly one primary action. A second one is a Menu, not a second button. */
  primaryAction?: React.ReactNode;
  /** Icon buttons: settings, export, refresh. Max three, then an overflow menu. */
  secondaryActions?: React.ReactNode;
  /** Set when this toolbar is inside a scroll container and must stay put. */
  sticky?: boolean;
  className?: string;
}

export function Toolbar({
  title,
  count,
  views,
  activeView,
  onViewChange,
  search,
  primaryAction,
  secondaryActions,
  sticky = true,
  className,
}: ToolbarProps) {
  const searchRef = React.useRef<HTMLInputElement>(null);

  // "/" focuses local filter — the convention users bring from every other
  // list surface. Guarded so it never steals a keystroke from a text field.
  React.useEffect(() => {
    if (!search) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [search]);

  return (
    <div
      className={cls(
        "flex h-band-toolbar shrink-0 items-center gap-3 border-b border-border bg-bg px-4",
        sticky && "sticky top-0 z-20",
        className
      )}
    >
      {/* identity: title + count, one line, count is never a headline */}
      <div className="flex min-w-0 items-baseline gap-2">
        <h1 className="truncate text-head font-semibold tracking-head">{title}</h1>
        {count !== undefined && (
          <span className="tnum shrink-0 text-sm text-subtle" aria-label={`${count} items`}>
            {count.toLocaleString()}
          </span>
        )}
      </div>

      {/* count-tabs: the stats band, collapsed into the toolbar */}
      {views && views.length > 0 && (
        <div role="tablist" aria-label="Views" className="ml-2 flex shrink-0 items-center gap-1">
          {views.map((v) => {
            const on = v.id === activeView;
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={on}
                onClick={() => onViewChange?.(v.id)}
                className={cls(
                  "flex h-ctl-sm items-center gap-1x rounded px-2 text-sm transition-app",
                  on
                    ? "bg-accent-subtle text-accent"
                    : "text-muted hover:bg-surface-hover hover:text-text"
                )}
              >
                {v.label}
                {v.count !== undefined && (
                  <span className="tnum text-mini text-subtle">{v.count.toLocaleString()}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1" />

      {search && (
        <div className="relative w-[240px] shrink-0">
          <input
            ref={searchRef}
            type="search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "Filter…"}
            aria-label="Filter this list"
            className={cls(
              "h-ctl-md w-full rounded border border-border-control bg-surface pl-2 pr-7 text-sm",
              "placeholder:text-subtle focus-visible:border-accent"
            )}
          />
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1 text-micro text-subtle"
          >
            /
          </kbd>
        </div>
      )}

      {secondaryActions && <div className="flex shrink-0 items-center gap-1">{secondaryActions}</div>}
      {primaryAction && <div className="shrink-0">{primaryAction}</div>}
    </div>
  );
}

/** The app's only button. Three sizes, three intents, one transition. */
export function Button({
  size = "md",
  intent = "secondary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  intent?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      {...props}
      className={cls(
        "inline-flex select-none items-center justify-center gap-1x rounded font-medium",
        "transition-app disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-ctl-sm px-2 text-sm",
        size === "md" && "h-ctl-md px-2.5 text-sm",
        size === "lg" && "h-ctl-lg px-3.5 text-ui",
        intent === "primary" && "bg-accent text-accent-fg hover:opacity-90",
        intent === "secondary" &&
          "border border-border-control bg-surface text-text hover:bg-surface-hover",
        intent === "ghost" && "text-muted hover:bg-surface-hover hover:text-text",
        intent === "danger" && "bg-danger text-danger-fg hover:opacity-90",
        className
      )}
    />
  );
}

/**
 * Icon-only button. A 20px glyph in a 28px box clears WCAG 2.2 SC 2.5.8 (24px)
 * because the TARGET is the padded box, not the glyph. Two of these side by
 * side need ≥4px between them or the 24px spacing-exception circles intersect.
 */
export function IconButton({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={cls(
        "inline-flex size-ctl-sm items-center justify-center rounded text-muted",
        "transition-app hover:bg-surface-hover hover:text-text",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
