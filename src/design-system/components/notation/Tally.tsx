"use client";

import React from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface TallyProps extends HTMLAttributes<HTMLDivElement> {
  filled?: number;
  total?: number;
  rows?: number;
  unit?: string;
  gap?: string;
  label?: ReactNode;
  tone?: "ink" | "inverse";
  animate?: boolean;
  style?: CSSProperties;
}

/** Counts in sulphur squares against chalk. */
export function Tally({
  filled = 0,
  total = 100,
  rows = 2,
  unit,
  gap,
  label,
  tone = "ink",
  animate = false,
  style,
  ...rest
}: TallyProps) {
  const [shown, setShown] = React.useState(animate ? 0 : filled);
  React.useEffect(() => {
    if (!animate) {
      setShown(filled);
      return;
    }
    let n = 0;
    const step = Math.max(1, Math.round(filled / 24));
    const id = setInterval(() => {
      n = Math.min(filled, n + step);
      setShown(n);
      if (n >= filled) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [filled, animate]);
  const units = Array.from({ length: total });
  const empty = tone === "inverse" ? "rgba(241,243,241,.22)" : "var(--tally-empty)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        ...style,
      }}
      {...rest}
    >
      <div
        role="img"
        aria-label={`${filled} of ${total}`}
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(${rows},${unit || "var(--tally-unit)"})`,
          gap: gap || "var(--tally-gap)",
          width: "fit-content",
        }}
      >
        {units.map((_, i) => (
          <span
            key={i}
            style={{
              width: unit || "var(--tally-unit)",
              height: unit || "var(--tally-unit)",
              background: i < shown ? "var(--tally-filled)" : empty,
              transition: "background var(--duration-snap) var(--ease-flat)",
            }}
          />
        ))}
      </div>
      {label && (
        <span
          className="okwe-source"
          style={{
            color: tone === "inverse" ? "var(--text-inverse-muted)" : "var(--text-muted)",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
