"use client";

import { useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  label?: ReactNode;
  placement?: "top" | "bottom";
  children?: ReactNode;
  style?: CSSProperties;
}

/** Hover/focus tooltip anchored above or below its trigger. */
export function Tooltip({ label, placement = "top", children, style, ...rest }: TooltipProps) {
  const [show, setShow] = useState(false);
  const pos: CSSProperties =
    placement === "bottom"
      ? {
          top: "calc(100% + var(--space-2))",
        }
      : {
          bottom: "calc(100% + var(--space-2))",
        };
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        ...style,
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      {...rest}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className="okwe-call"
          style={{
            position: "absolute",
            left: 0,
            ...pos,
            background: "var(--surface-ink)",
            color: "var(--text-inverse)",
            padding: "var(--space-2) var(--space-3)",
            whiteSpace: "nowrap",
            zIndex: 40,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
