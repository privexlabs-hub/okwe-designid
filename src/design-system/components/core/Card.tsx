"use client";

import { useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type CardVariant = "field" | "plate" | "inset";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: CardVariant;
  index?: number;
  eyebrow?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
  interactive?: boolean;
  padding?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Editorial card: a top rule, optional call number, and an optional meta/footer band. */
export function Card({
  variant = "field",
  index,
  eyebrow,
  title,
  meta,
  footer,
  interactive = false,
  padding = "var(--space-6) 0 var(--space-5)",
  children,
  style,
  ...rest
}: CardProps) {
  const [hover, setHover] = useState(false);
  const inverse = variant === "plate";
  const ruleColor = inverse ? "var(--rule-inverse)" : "var(--rule-ink)";
  const css: CSSProperties = {
    background: inverse
      ? "var(--surface-ink)"
      : variant === "inset"
        ? "var(--surface-inset)"
        : "transparent",
    color: inverse ? "var(--text-inverse)" : "var(--text-body)",
    borderTop: `var(--rule-thick) solid ${interactive && hover ? "var(--rule-mark)" : ruleColor}`,
    borderRadius: 0,
    boxShadow: "none",
    padding: inverse || variant === "inset" ? "var(--space-6)" : padding,
    display: "grid",
    gridTemplateColumns: index !== undefined ? "36px 1fr" : "1fr",
    columnGap: "var(--space-4)",
    rowGap: "var(--space-4)",
    transition: "var(--transition-control)",
    cursor: interactive ? "pointer" : "default",
    ...style,
  };
  return (
    <div
      style={css}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}
    >
      {index !== undefined && (
        <span
          className="okwe-call"
          style={{
            color: inverse ? "var(--text-inverse-muted)" : "var(--text-quiet)",
            paddingTop: 2,
          }}
        >
          {String(index).padStart(2, "0")}
        </span>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          minWidth: 0,
        }}
      >
        {eyebrow && (
          <span
            className="okwe-call"
            style={{ color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)" }}
          >
            {eyebrow}
          </span>
        )}
        {title && (
          <h3
            style={{
              font: "var(--type-h2)",
              fontSize: "var(--size-lg)",
              fontStretch: "var(--stretch-display)",
              letterSpacing: "var(--tracking-heading)",
              color: inverse ? "var(--text-inverse)" : "var(--text-primary)",
            }}
          >
            {title}
          </h3>
        )}
        {children}
        {(meta || footer) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "var(--space-4)",
              marginTop: "var(--space-2)",
              paddingTop: "var(--space-3)",
              borderTop: `var(--rule-thin) solid ${inverse ? "var(--rule-inverse-quiet)" : "var(--rule-quiet)"}`,
            }}
          >
            <span
              className="okwe-source"
              style={{ color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)" }}
            >
              {meta}
            </span>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
