"use client";

/**
 * DetailPanel — a NON-MODAL inspector docked to the right of the list.
 *
 * Why not a modal: NN/g's data-table guidance is explicit that a single record
 * should open in a non-modal side panel or a separate window, because a modal
 * obscures the very data the user is comparing against. A modal is for a
 * decision that must block; a panel is for a record you are reading while the
 * list stays visible.
 *
 * Width: 360px minimum (below that, label/value pairs wrap and the panel reads
 * as a column of orphans), 480px default, 560px when the panel holds an
 * editable form. Never more than 40% of the viewport — past that, make it a
 * route, because the list has stopped being usable and you are pretending.
 *
 * It does NOT trap focus and does NOT set aria-modal. It is `complementary`
 * with a label, so a screen-reader user can jump to it and back out again.
 */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cls, MOTION_ENTER } from "./utils";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  /** The record's name. This is the panel's accessible name too. */
  title: string;
  subtitle?: string;
  /** Prev/next through the list without closing — the single feature that makes
   *  an inspector better than a route for triage work. */
  onPrev?: () => void;
  onNext?: () => void;
  /** Actions for this record. Destructive last, and separated. */
  actions?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}

export function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  onPrev,
  onNext,
  actions,
  width = "w-[480px]",
  children,
}: DetailPanelProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "j") onNext?.();
      if (e.key === "k") onPrev?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          // Travel only on the axis it enters from, and only 12px of it. A panel
          // that flies 100px in feels like a page transition, which it is not.
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={MOTION_ENTER}
          role="complementary"
          aria-label={`Details: ${title}`}
          className={cls(
            "flex shrink-0 flex-col border-l border-border bg-surface",
            "max-w-[40vw] min-w-[360px]",
            width
          )}
        >
          <header className="flex h-band-toolbar shrink-0 items-center gap-2 border-b border-border px-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-ui font-semibold">{title}</h2>
              {subtitle && <p className="truncate text-mini text-subtle">{subtitle}</p>}
            </div>
            {(onPrev || onNext) && (
              <div className="flex shrink-0 items-center gap-1">
                <PanelIconButton label="Previous record (k)" onClick={onPrev} disabled={!onPrev}>
                  <path d="M10 4 6 8l4 4" />
                </PanelIconButton>
                <PanelIconButton label="Next record (j)" onClick={onNext} disabled={!onNext}>
                  <path d="M6 4l4 4-4 4" />
                </PanelIconButton>
              </div>
            )}
            <PanelIconButton label="Close details (esc)" onClick={onClose}>
              <path d="M4 4l8 8M12 4l-8 8" />
            </PanelIconButton>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

          {actions && (
            <footer className="flex h-band-footer shrink-0 items-center gap-2 border-t border-border px-3">
              {actions}
            </footer>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/**
 * Label/value pair. The definition-list shape is not decoration: it is what
 * lets a screen reader read "Owner, Dana Reyes" instead of two loose strings.
 * Two-column at ≥400px, stacked below — never a table, which a detail panel is
 * too narrow to hold.
 */
export function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-3 py-1.5">
      <dt className="pt-px text-sm text-subtle">{label}</dt>
      <dd className={cls("min-w-0 break-words text-sm", mono && "font-mono text-mini")}>
        {children}
      </dd>
    </div>
  );
}

export function FieldGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-3 first:pt-0 last:border-b-0">
      {title && (
        <h3 className="mb-1 text-micro font-semibold uppercase tracking-micro text-subtle">
          {title}
        </h3>
      )}
      <dl>{children}</dl>
    </section>
  );
}

function PanelIconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className="flex size-ctl-sm items-center justify-center rounded text-muted transition-app hover:bg-surface-hover hover:text-text disabled:opacity-40"
    >
      <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {children}
      </svg>
    </button>
  );
}
