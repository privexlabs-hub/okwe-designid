"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { copyText } from "@/lib/clipboard";
import s from "./guidelines.module.css";

type CopyState = "idle" | "copied" | "selected";

export interface CopyValueProps {
  /** Exactly what lands on the clipboard. */
  value: string;
  /** What the button shows. Defaults to the value itself. */
  children?: ReactNode;
  /** Accessible name when the shown text is not the value (a long quote, say). */
  label?: string;
  className?: string;
}

/**
 * One value you can take with a click — a hex, a token, a ratio, a quote.
 *
 * Uses the same clipboard helper as the context pack. When the browser refuses
 * clipboard access, the shown text is selected instead, so ⌘/Ctrl+C still
 * works; the button says which happened and never claims a copy it did not make.
 */
export function CopyValue({ value, children, label, className }: CopyValueProps) {
  const [state, setState] = useState<CopyState>("idle");
  const shown = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    const ok = await copyText(value);
    if (!ok && shown.current) {
      const range = document.createRange();
      range.selectNodeContents(shown.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    setState(ok ? "copied" : "selected");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  };

  const name = label ?? value;
  return (
    <button
      type="button"
      className={`${s.copy} ${className ?? ""}`}
      onClick={onClick}
      title={`Copy ${name}`}
      aria-label={`Copy ${name}`}
      data-copy={value}
    >
      <span ref={shown} className={s.copyText}>
        {children ?? value}
      </span>
      <span className={s.copyState} aria-live="polite">
        {state === "copied" ? "Copied" : state === "selected" ? "Selected — ⌘/Ctrl+C" : ""}
      </span>
    </button>
  );
}
