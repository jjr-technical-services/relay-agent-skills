"use client";

/**
 * MultiStepFlow — a wizard, and the test for whether you need one.
 *
 * Reach for a wizard only when BOTH hold (NN/g):
 *   1. the steps have a real order dependency — step 3 cannot be answered
 *      until step 2 is, or the system needs step 2 to decide what step 3 asks
 *   2. the user is a novice at this task, or does it infrequently (setup,
 *      configuration, migration)
 * If neither holds, one long form with labelled sections beats a wizard, because
 * an expert doing this weekly wants to see the whole shape and tab through it.
 *
 * Step count: ≤5. Past five, group into named phases and show the phase, not
 * "Step 7 of 9" — a count that large reads as a cost estimate, and users abandon.
 *
 * Structural rules encoded here:
 *   steps are named by OUTCOME ("Choose a source"), never "Step 2"
 *   forward is locked until the current step validates (NN/g: don't let users
 *     skip ahead), back is always free and never loses data
 *   a review step is mandatory when submit is irreversible or costs money
 *   state is serialisable so the flow can be left and resumed
 */

import * as React from "react";
import { cls } from "./utils";

export type Step = {
  id: string;
  /** Outcome-named: "Connect your warehouse", not "Configuration". */
  label: string;
  /** Optional one-line description shown under the heading, inside the step. */
  hint?: string;
  /** Return true when this step is complete enough to advance. */
  isComplete: () => boolean;
  render: () => React.ReactNode;
};

interface MultiStepFlowProps {
  steps: Step[];
  /** Always include a review step when the submit is irreversible or costly. */
  review?: { label: string; render: () => React.ReactNode };
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  /** Persist on every step change so "resume later" is real. */
  onPersist?: (stepIndex: number) => void;
  title: string;
}

export function MultiStepFlow({
  steps,
  review,
  onSubmit,
  onCancel,
  submitLabel,
  onPersist,
  title,
}: MultiStepFlowProps) {
  const all = React.useMemo(
    () =>
      review
        ? [...steps, { id: "__review", label: review.label, isComplete: () => true, render: review.render }]
        : steps,
    [steps, review]
  );
  const [i, setI] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const step = all[i];
  const last = i === all.length - 1;
  const canAdvance = step.isComplete();

  const go = (next: number) => {
    setI(next);
    onPersist?.(next);
    // Move focus to the new step's heading. Without this, a keyboard user who
    // presses Continue is left focused on a button that has changed meaning,
    // and a screen-reader user is told nothing happened at all.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8">
      {/* Progress is a list of named outcomes. A bare bar tells the user how far
          they are but not what is left, which is the part they care about. */}
      <nav aria-label={`${title} progress`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((s, idx) => {
            const state = idx < i ? "done" : idx === i ? "current" : "upcoming";
            return (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  // Backward is free, forward is locked.
                  disabled={idx > i}
                  onClick={() => idx < i && go(idx)}
                  aria-current={state === "current" ? "step" : undefined}
                  className={cls(
                    "flex h-ctl-sm items-center gap-1x rounded px-2 text-sm transition-app",
                    state === "current" && "bg-accent-subtle font-medium text-accent",
                    state === "done" && "text-muted hover:bg-surface-hover hover:text-text",
                    state === "upcoming" && "text-subtle"
                  )}
                >
                  <span
                    aria-hidden
                    className={cls(
                      "flex size-4 shrink-0 items-center justify-center rounded-full text-micro",
                      state === "done" && "bg-success text-bg",
                      state === "current" && "bg-accent text-accent-fg",
                      state === "upcoming" && "border border-border-control text-subtle"
                    )}
                  >
                    {state === "done" ? "✓" : idx + 1}
                  </span>
                  {s.label}
                </button>
                {idx < all.length - 1 && <span aria-hidden className="text-subtle">›</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <div>
        <h2 ref={headingRef} tabIndex={-1} className="text-title font-semibold tracking-title">
          {step.label}
        </h2>
        {"hint" in step && step.hint && <p className="prose-ui mt-1 text-sm">{step.hint}</p>}
      </div>

      <div className="flex flex-col gap-4">{step.render()}</div>

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-ctl-md rounded px-2.5 text-sm text-muted hover:bg-surface-hover hover:text-text"
        >
          Cancel
        </button>
        <div className="flex-1" />
        {i > 0 && (
          <button
            type="button"
            onClick={() => go(i - 1)}
            className="h-ctl-md rounded border border-border-control px-2.5 text-sm hover:bg-surface-hover"
          >
            Back
          </button>
        )}
        <button
          type="button"
          disabled={!canAdvance || submitting}
          onClick={async () => {
            if (!last) return go(i + 1);
            setSubmitting(true);
            try {
              await onSubmit();
            } finally {
              setSubmitting(false);
            }
          }}
          className="h-ctl-lg rounded bg-accent px-3.5 text-ui font-medium text-accent-fg transition-app hover:opacity-90 disabled:opacity-50"
        >
          {/* The final button names the outcome. "Finish" tells the user nothing
              about what is about to happen to their data. */}
          {last ? (submitting ? "Working…" : submitLabel) : "Continue"}
        </button>
      </div>
    </div>
  );
}

/**
 * Disclosure — progressive disclosure with the one rule people break: a
 * collapsed section that can hold a validation error must open itself and take
 * focus, or the user is told the form is invalid and cannot see where.
 */
export function Disclosure({
  label,
  summary,
  children,
  hasError = false,
  defaultOpen = false,
}: {
  label: string;
  /** What is inside, at rest: "3 rules, 1 exclusion". A disclosure with no
   *  summary makes the user open it just to find out whether they care. */
  summary?: string;
  children: React.ReactNode;
  hasError?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  React.useEffect(() => {
    if (hasError) setOpen(true);
  }, [hasError]);

  return (
    <div className="rounded border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-ctl-lg w-full items-center gap-2 px-3 text-left text-sm transition-app hover:bg-surface-hover"
      >
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={cls("size-3 shrink-0 text-subtle transition-app", open && "rotate-90")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
        <span className="font-medium">{label}</span>
        {summary && !open && <span className="truncate text-subtle">{summary}</span>}
        {hasError && <span className="ml-auto text-mini text-danger">Needs attention</span>}
      </button>
      {open && <div className="flex flex-col gap-3 border-t border-border p-3">{children}</div>}
    </div>
  );
}
