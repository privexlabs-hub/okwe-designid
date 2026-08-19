import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface PullQuoteProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  attribution?: ReactNode;
  role?: string;
  tone?: "ink" | "inverse";
  style?: CSSProperties;
}

/** A quote ruled top and bottom, with attribution and speaker role. */
export function PullQuote({
  children,
  attribution,
  role,
  tone = "ink",
  style,
  ...rest
}: PullQuoteProps) {
  const inverse = tone === "inverse";
  return (
    <figure
      style={{
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        borderTop: `var(--rule-thin) solid ${inverse ? "var(--rule-inverse)" : "var(--rule-ink)"}`,
        borderBottom: `var(--rule-thin) solid ${inverse ? "var(--rule-inverse)" : "var(--rule-ink)"}`,
        padding: "var(--space-6) 0",
        ...style,
      }}
      {...rest}
    >
      <blockquote
        style={{
          margin: 0,
          font: "var(--type-quote)",
          color: inverse ? "var(--text-inverse)" : "var(--text-primary)",
          maxWidth: "var(--measure-narrow)",
        }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption
          style={{
            display: "flex",
            gap: "var(--space-3)",
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <span
            className="okwe-label"
            style={{ color: inverse ? "var(--text-inverse)" : "var(--text-secondary)" }}
          >
            {attribution}
          </span>
          {role && (
            <span
              className="okwe-source"
              style={{ color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)" }}
            >
              {role}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
