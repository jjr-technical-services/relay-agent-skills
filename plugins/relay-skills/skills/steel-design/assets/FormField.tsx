"use client";

/**
 * FormField — one field, and the validation timing that goes with it.
 *
 * The timing rule, and why each half of it exists:
 *   onBlur   → raise the first error. Validating while the user types calls
 *              them wrong halfway through a valid entry; testing has found
 *              premature errors increase error rates, not reduce them.
 *   onChange → CLEAR an existing error, never create one. Once the user is
 *              fixing a field, live feedback rewards the fix instead of nagging.
 *   onSubmit → cross-field rules and server truth. Focus the first invalid
 *              control, because a summary the user has to hunt through is the
 *              failure mode NN/g calls out.
 *
 * Message rules: below the control, wired through aria-describedby, never in a
 * tooltip (alert icons are missed), never colour-only, and the message says
 * both what is wrong and what is accepted. The user's input is never cleared.
 */

import * as React from "react";
import { cls } from "./utils";

export type Validator = (value: string) => string | null;

export type FieldState = {
  value: string;
  error: string | null;
  touched: boolean;
};

export const emptyField = (value = ""): FieldState => ({ value, error: null, touched: false });

export function useField(initial = "", validate?: Validator) {
  const [state, setState] = React.useState<FieldState>(emptyField(initial));

  const onChange = (value: string) =>
    setState((s) => ({
      ...s,
      value,
      // clear-only: if there is an error and the new value validates, drop it.
      error: s.error && (!validate || !validate(value)) ? null : s.error,
    }));

  const onBlur = () =>
    setState((s) => ({ ...s, touched: true, error: validate ? validate(s.value) : null }));

  /** Call on submit. Returns true when valid. */
  const check = () => {
    const error = validate ? validate(state.value) : null;
    setState((s) => ({ ...s, touched: true, error }));
    return !error;
  };

  const setServerError = (error: string) => setState((s) => ({ ...s, touched: true, error }));

  return { ...state, onChange, onBlur, check, setServerError, bind: { value: state.value } };
}

interface FormFieldProps {
  id: string;
  label: string;
  field: ReturnType<typeof useField>;
  /** Shown at rest, above the control's error. Say the accepted format HERE,
   *  not only in the error — help that arrives after failure arrives late. */
  hint?: string;
  required?: boolean;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  /** Optional trailing control: a unit, a visibility toggle, a generate button. */
  suffix?: React.ReactNode;
  autoComplete?: string;
  disabled?: boolean;
}

export function FormField({
  id,
  label,
  field,
  hint,
  required,
  type = "text",
  placeholder,
  suffix,
  autoComplete,
  disabled,
}: FormFieldProps) {
  const errId = `${id}-error`;
  const hintId = `${id}-hint`;
  const invalid = !!field.error;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {/* "Optional" on the few is better than "*" on the many — but whichever
            you pick, mark one side only, and never mark both. */}
        {!required && <span className="ml-1 font-normal text-subtle">(optional)</span>}
      </label>

      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={cls(hint && hintId, invalid && errId) || undefined}
          className={cls(
            "h-ctl-md w-full rounded border bg-surface px-2 text-ui",
            "transition-app placeholder:text-subtle",
            "disabled:bg-bg-subtle disabled:text-subtle",
            suffix && "pr-16",
            invalid
              ? "border-danger focus-visible:outline-danger"
              : "border-border-control focus-visible:border-accent"
          )}
        />
        {suffix && <div className="absolute right-1 flex items-center">{suffix}</div>}
      </div>

      {hint && !invalid && (
        <p id={hintId} className="text-mini text-subtle">
          {hint}
        </p>
      )}

      {invalid && (
        // role=alert so the message is announced the moment it appears, and an
        // icon so the state is not carried by red alone.
        <p id={errId} role="alert" className="flex items-start gap-1 text-mini text-danger">
          <svg viewBox="0 0 16 16" aria-hidden className="mt-px size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.25" />
            <path d="M8 5v3.5M8 10.75h.01" strokeLinecap="round" />
          </svg>
          {field.error}
        </p>
      )}
    </div>
  );
}

/** Validators that produce messages saying what IS accepted, not just what failed. */
export const v = {
  required: (label: string): Validator => (val) =>
    val.trim() ? null : `${label} is required.`,
  email: (): Validator => (val) =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.trim())
      ? null
      : "Enter an email address in the form name@company.com.",
  minLen: (n: number): Validator => (val) =>
    val.length >= n ? null : `Use at least ${n} characters — currently ${val.length}.`,
  slug: (): Validator => (val) =>
    /^[a-z0-9-]+$/.test(val)
      ? null
      : "Use lowercase letters, numbers and hyphens only.",
  all:
    (...vs: Validator[]): Validator =>
    (val) => {
      for (const fn of vs) {
        const e = fn(val);
        if (e) return e;
      }
      return null;
    },
};

/** Focus the first invalid control after a failed submit. */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  const el = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
  el?.focus();
  el?.scrollIntoView({ block: "center", behavior: "smooth" });
}
