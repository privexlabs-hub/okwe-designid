"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  selected?: boolean;
  style?: CSSProperties;
}

/** Left-ruled keyword tag, optionally removable. */
export function Tag({
  children,
  removable = false,
  onRemove,
  selected = false,
  style,
  ...rest
}: TagProps) {
  return (
    <span
      style={{
        font: "var(--type-ui-sm)",
        fontFamily: "var(--font-mono)",
        fontStretch: "var(--stretch-mono)",
        letterSpacing: "var(--tracking-call)",
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-1) var(--space-3)",
        borderRadius: 0,
        borderLeft:
          "var(--rule-thick) solid " + (selected ? "var(--rule-mark)" : "var(--rule-quiet)"),
        background: selected ? "var(--surface-inset)" : "transparent",
        color: selected ? "var(--text-primary)" : "var(--text-secondary)",
        ...style,
      }}
      {...rest}
    >
      {children}
      {removable && (
        <button
          aria-label="Remove"
          onClick={onRemove}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            cursor: "pointer",
            color: "inherit",
            font: "var(--type-label)",
            lineHeight: 1,
          }}
        >
          {"×"}
        </button>
      )}
    </span>
  );
}
