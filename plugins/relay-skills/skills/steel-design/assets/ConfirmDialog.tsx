"use client";

/**
 * ConfirmDialog — for the destructive actions that genuinely need one.
 *
 * The default for a destructive action is UNDO, not confirm. NN/g's position is
 * that designers should "go to great lengths to provide undo", and that
 * confirmation dialogs are for actions with serious consequences — routine
 * confirms get click-through, which trains the user to dismiss the one that
 * mattered. Use `needsConfirm()` below rather than reaching for this by reflex.
 *
 * When this component is the right answer, four rules apply:
 *   1. restate the object BY NAME and by count. "Are you sure?" gets a reflex
 *      click; "Delete 12 members from Acme?" gets read.
 *   2. label the buttons with their outcomes — "Delete 12 members" / "Keep
 *      them" — never Yes/No, which forces the user to re-read the question to
 *      decide which button they want.
 *   3. initial focus goes to the SAFE button. A destructive default turns a
 *      stray Enter into data loss.
 *   4. type-to-confirm only when the blast radius is a whole resource (a
 *      workspace, a production database). Used more often than that, it is
 *      friction theatre and users paste the name from the dialog itself.
 */

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cls } from "./utils";

/** The decision rule. Confirm only when at least one is true. */
export function needsConfirm(a: {
  /** No undo path exists at all. */
  irreversible: boolean;
  /** Other people see the effect before the actor could undo it. */
  affectsOthers?: boolean;
  /** Costs money, quota, or a rate-limited external call. */
  costsMoney?: boolean;
  /** Blast radius is a whole resource, not a row. */
  wholeResource?: boolean;
}) {
  return !!(a.irreversible || a.affectsOthers || a.costsMoney || a.wholeResource);
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Delete 12 members?" — the object and the count, in the title. */
  title: string;
  /** What will happen, and what will NOT be recoverable. Be specific: the
   *  vague version is the one users click through. */
  body: React.ReactNode;
  /** Verb + noun. This is also the button label. */
  confirmLabel: string;
  /** Names the safe outcome, not "Cancel" where a clearer word exists. */
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  /** Set to the exact string the user must type. Whole-resource actions only. */
  typeToConfirm?: string;
  tone?: "danger" | "neutral";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  typeToConfirm,
  tone = "danger",
}: ConfirmDialogProps) {
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const armed = !typeToConfirm || typed === typeToConfirm;

  React.useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          // Radix supplies the focus trap, restore-on-close, and Escape. What it
          // cannot decide for you is WHERE focus lands — put it on the safe control.
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            cancelRef.current?.focus();
          }}
          className={cls(
            "fixed left-1/2 top-1/2 z-50 w-[min(440px,92vw)] -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-border-strong bg-surface p-4 shadow-2xl"
          )}
        >
          <Dialog.Title className="text-title font-semibold tracking-title">{title}</Dialog.Title>
          <Dialog.Description asChild>
            <div className="prose-ui mt-2 text-sm">{body}</div>
          </Dialog.Description>

          {typeToConfirm && (
            <label className="mt-4 flex flex-col gap-1 text-sm">
              <span>
                Type <span className="font-mono text-mini font-semibold">{typeToConfirm}</span> to
                confirm
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="h-ctl-md rounded border border-border-control bg-bg px-2 font-mono text-mini"
              />
            </label>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              ref={cancelRef}
              onClick={() => onOpenChange(false)}
              className="h-ctl-md rounded border border-border-control px-2.5 text-sm hover:bg-surface-hover"
            >
              {cancelLabel}
            </button>
            <button
              disabled={!armed || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  onOpenChange(false);
                } finally {
                  setBusy(false);
                }
              }}
              className={cls(
                "h-ctl-md rounded px-2.5 text-sm font-medium transition-app",
                "disabled:opacity-50 hover:opacity-90",
                tone === "danger" ? "bg-danger text-danger-fg" : "bg-accent text-accent-fg"
              )}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
