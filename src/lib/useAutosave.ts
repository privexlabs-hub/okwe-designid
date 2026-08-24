"use client";

import { useEffect, useRef, useState } from "react";
import { quotaExhausted, readAutosave, writeAutosave, type DraftKind } from "./store";

export type AutosaveStatus = "idle" | "restored" | "saved" | "blocked";

export interface AutosaveOptions {
  /**
   * Skip the mount restore. Used when the editor is being seeded from the
   * question register — the seed must win over yesterday's working document.
   */
  skipRestore?: boolean;
  /** Debounce before writing. */
  delay?: number;
}

/**
 * Keep a tool's working document in the browser.
 *
 * The restore happens in an effect, never in `useState`'s initialiser. Seeding
 * state from `localStorage` would make the client's first render disagree with
 * the exported HTML, which is a hydration mismatch. The cost of doing it
 * correctly is one frame of the default document before a saved draft appears;
 * that is the right trade.
 */
export function useAutosave<T>(
  kind: DraftKind,
  doc: T,
  restore: (doc: T) => void,
  options: AutosaveOptions = {},
): AutosaveStatus {
  const { skipRestore = false, delay = 600 } = options;
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  /** Writes are suppressed until the restore pass has run. */
  const ready = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!skipRestore) {
      const stored = readAutosave<T>(kind);
      if (stored) {
        restore(stored);
        setStatus("restored");
      }
    }
    ready.current = true;
    // Restore runs once per mount. `restore` is a setState-style callback and
    // `doc` must not retrigger it, so neither belongs in the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, skipRestore]);

  useEffect(() => {
    if (!ready.current) return;
    if (quotaExhausted()) {
      setStatus("blocked");
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const result = writeAutosave(kind, doc);
      setStatus(result.ok ? "saved" : "blocked");
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [kind, doc, delay]);

  return status;
}
