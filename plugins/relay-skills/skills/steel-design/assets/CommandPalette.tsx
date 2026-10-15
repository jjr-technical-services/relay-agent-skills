"use client";

/**
 * CommandPalette — ⌘K. Built on Radix Dialog + a filtered listbox, no extra
 * dependency. (`cmdk` is the shadcn default and is a drop-in swap; the ARIA
 * shape below is the same either way.)
 *
 * When a palette EARNS its place, and when it does not:
 *   destinations > ~30, or they are user-created objects (projects, docs,
 *     customers) that a sidebar cannot enumerate     → palette replaces nav
 *   the useful verbs act on the current selection    → palette, and it must
 *     show those verbs FIRST while a selection exists
 *   a fixed nav of 6 sections                        → a palette is a second
 *     way to do what the sidebar already does, and it will rot unmaintained
 *
 * The accessibility shape is the APG combobox pattern, and the part teams get
 * wrong: the INPUT keeps focus the whole time. Options are never focused; the
 * active option is pointed at with aria-activedescendant. Moving DOM focus into
 * the list breaks typing, which is the only input method this control has.
 *
 * Discoverability: every command shows its own shortcut in the row's right
 * rail, which is how users learn the shortcuts without a cheatsheet.
 */

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cls } from "./utils";

export type Command = {
  id: string;
  label: string;
  /** Group heading: "Go to", "Actions", "Recent". Ordered as given. */
  group: string;
  /** Extra match terms — synonyms and the thing users actually call it. */
  keywords?: string[];
  /** Rendered right-aligned, e.g. ["⌘", "⇧", "P"]. */
  shortcut?: string[];
  /** Shown muted after the label: a project name, a path. */
  detail?: string;
  icon?: React.ReactNode;
  run: () => void;
  /** Only offered while rows are selected. */
  requiresSelection?: boolean;
};

interface CommandPaletteProps {
  commands: Command[];
  /** >0 puts selection-scoped commands first. */
  selectionCount?: number;
  placeholder?: string;
}

export function CommandPalette({
  commands,
  selectionCount = 0,
  placeholder = "Search commands and pages…",
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const results = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pool = commands.filter((c) => !c.requiresSelection || selectionCount > 0);
    const scored = pool
      .map((c) => {
        const hay = [c.label, c.detail ?? "", ...(c.keywords ?? [])].join(" ").toLowerCase();
        if (!needle) return { c, score: 0 };
        const i = hay.indexOf(needle);
        if (i < 0) return null;
        // Prefix matches beat mid-string ones — "del" should surface "Delete"
        // above "Undelete".
        return { c, score: c.label.toLowerCase().startsWith(needle) ? 0 : i + 1 };
      })
      .filter(Boolean) as { c: Command; score: number }[];
    scored.sort(
      (a, b) =>
        Number(!!b.c.requiresSelection) - Number(!!a.c.requiresSelection) || a.score - b.score
    );
    return scored.map((s) => s.c).slice(0, 50);
  }, [commands, q, selectionCount]);

  const groups = React.useMemo(() => {
    const m = new Map<string, Command[]>();
    results.forEach((c) => m.set(c.group, [...(m.get(c.group) ?? []), c]));
    return [...m.entries()];
  }, [results]);

  const flat = groups.flatMap(([, cs]) => cs);
  const activeId = flat[active]?.id;

  React.useEffect(() => {
    if (!activeId) return;
    listRef.current
      ?.querySelector(`[data-cmd="${activeId}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = flat[active];
      if (cmd) {
        setOpen(false);
        cmd.run();
      }
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        {/* Radix portals to document.body, OUTSIDE any wrapper you scoped your
            tokens to. That is why foundation.css defines tokens on :root and
            not on an app wrapper class. See anti-patterns.md § 7. */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]" />
        <Dialog.Content
          aria-label="Command palette"
          className={cls(
            "fixed left-1/2 top-[15vh] z-50 w-[min(640px,92vw)] -translate-x-1/2",
            "overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
          )}
          onKeyDown={onKeyDown}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          <div className="flex h-ctl-lg items-center gap-2 border-b border-border px-3">
            <svg viewBox="0 0 16 16" aria-hidden className="size-4 shrink-0 text-subtle" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5 14 14" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              placeholder={placeholder}
              role="combobox"
              aria-expanded
              aria-controls="cmd-list"
              aria-activedescendant={activeId ? `cmd-${activeId}` : undefined}
              aria-autocomplete="list"
              className="h-full w-full bg-transparent text-ui outline-none placeholder:text-subtle"
            />
            {selectionCount > 0 && (
              <span className="shrink-0 rounded bg-accent-subtle px-1.5 py-0.5 text-mini text-accent">
                {selectionCount} selected
              </span>
            )}
          </div>

          <div ref={listRef} id="cmd-list" role="listbox" aria-label="Commands" className="max-h-[52vh] overflow-y-auto p-1">
            {flat.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-subtle">
                No commands match “{q}”.
              </p>
            )}
            {groups.map(([group, cs]) => (
              <div key={group} role="group" aria-label={group}>
                <div className="px-2 pb-1 pt-2 text-micro font-semibold uppercase tracking-micro text-subtle">
                  {group}
                </div>
                {cs.map((c) => {
                  const idx = flat.indexOf(c);
                  const on = idx === active;
                  return (
                    <div
                      key={c.id}
                      id={`cmd-${c.id}`}
                      data-cmd={c.id}
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => {
                        setOpen(false);
                        c.run();
                      }}
                      className={cls(
                        "flex h-ctl-lg cursor-pointer items-center gap-2 rounded px-2 text-sm",
                        on && "bg-surface-hover"
                      )}
                    >
                      {c.icon && <span className="shrink-0 text-subtle">{c.icon}</span>}
                      <span className="truncate">{c.label}</span>
                      {c.detail && <span className="truncate text-subtle">{c.detail}</span>}
                      <span className="flex-1" />
                      {c.shortcut && (
                        <span className="flex shrink-0 items-center gap-0.5">
                          {c.shortcut.map((k) => (
                            <kbd
                              key={k}
                              className="rounded border border-border bg-bg-subtle px-1 text-micro text-subtle"
                            >
                              {k}
                            </kbd>
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
