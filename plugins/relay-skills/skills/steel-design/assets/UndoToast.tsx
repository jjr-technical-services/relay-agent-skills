"use client";

/**
 * UndoToast — the preferred pattern for destructive actions. The toast IS the
 * confirmation: the action already happened, and the user's escape hatch is one
 * click away instead of one click earlier.
 *
 * Why this beats a confirm dialog for routine deletes: a dialog taxes every
 * correct action to protect against the rare wrong one, and the tax is paid in
 * click-through — users learn to dismiss dialogs, including the one that
 * mattered. Undo taxes nothing and still recovers the mistake.
 *
 * Rules:
 *   window 8s — long enough to notice and react, short enough that the app is
 *     not holding a tombstone while the user walks away. (Extrapolated: no
 *     source gives a number; it sits between Nielsen's 10s attention limit and
 *     the point where a user has moved on.)
 *   never start the countdown before the request settles, or Undo can fire
 *     against a delete that has not happened yet
 *   pause the countdown on hover and on focus-within — a user reaching for
 *     Undo must not lose it mid-reach
 *   the toast is reachable by keyboard and announced politely; it is a status
 *     region, not an alert, because the user caused it
 *   if undo is NOT possible, do not show this. A toast that says "Deleted" with
 *     no action is a notification, and belongs at a lower prominence.
 */

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cls, MOTION_ENTER } from "./utils";

export type UndoItem = {
  id: string;
  /** "12 members removed" — past tense, states what happened. */
  message: string;
  onUndo: () => void | Promise<void>;
  /** ms. Default 8000. */
  ttl?: number;
};

export function useUndoQueue() {
  const [items, setItems] = React.useState<UndoItem[]>([]);
  const push = React.useCallback((item: UndoItem) => setItems((s) => [...s, item]), []);
  const dismiss = React.useCallback(
    (id: string) => setItems((s) => s.filter((i) => i.id !== id)),
    []
  );
  return { items, push, dismiss };
}

export function UndoToastStack({
  items,
  onDismiss,
}: {
  items: UndoItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      // One polite live region for the whole stack. Per-toast live regions
      // stack up announcements and talk over each other.
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 z-40 flex flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <UndoToast key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function UndoToast({ item, onDismiss }: { item: UndoItem; onDismiss: () => void }) {
  const ttl = item.ttl ?? 8000;
  const [paused, setPaused] = React.useState(false);
  const remaining = React.useRef(ttl);
  const startedAt = React.useRef(Date.now());

  React.useEffect(() => {
    if (paused) {
      remaining.current -= Date.now() - startedAt.current;
      return;
    }
    startedAt.current = Date.now();
    const t = setTimeout(onDismiss, Math.max(remaining.current, 0));
    return () => clearTimeout(t);
  }, [paused, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={MOTION_ENTER}
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cls(
        "pointer-events-auto flex h-ctl-lg items-center gap-3 rounded-lg border border-border-strong",
        "bg-surface pl-3 pr-1 text-sm shadow-lg"
      )}
    >
      <span>{item.message}</span>
      <button
        onClick={async () => {
          await item.onUndo();
          onDismiss();
        }}
        className="h-ctl-sm rounded px-2 font-medium text-accent transition-app hover:bg-accent-subtle"
      >
        Undo
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex size-ctl-sm items-center justify-center rounded text-subtle hover:bg-surface-hover hover:text-text"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </motion.div>
  );
}
