import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Tally } from "../notation/Tally";

export interface StatBlockProps extends HTMLAttributes<HTMLDivElement> {
  figure?: ReactNode;
  unit?: ReactNode;
  label?: ReactNode;
  source?: ReactNode;
  tally?: number;
  total?: number;
  tone?: "ink" | "inverse";
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

/** A single figure above its tally, label and source. */
export function StatBlock({
  figure,
  unit,
  label,
  source,
  tally,
  total = 100,
  tone = "ink",
  size = "md",
  style,
  ...rest
}: StatBlockProps) {
  const inverse = tone === "inverse";
  const ink = inverse ? "var(--text-inverse)" : "var(--text-primary)";
  const quiet = inverse ? "var(--text-inverse-muted)" : "var(--text-muted)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        borderTop: `var(--rule-thick) solid ${inverse ? "var(--rule-inverse)" : "var(--rule-ink)"}`,
        paddingTop: "var(--space-4)",
        ...style,
      }}
      {...rest}
    >
      <div
        className="okwe-figure"
        style={{
          fontSize:
            size === "lg"
              ? "var(--size-8xl)"
              : size === "sm"
                ? "var(--size-4xl)"
                : "var(--size-6xl)",
          color: ink,
          display: "flex",
          alignItems: "baseline",
          gap: "var(--space-3)",
        }}
      >
        {figure}
        {unit && (
          <span
            style={{
              fontSize: size === "lg" ? "var(--size-2xl)" : "var(--size-lg)",
              color: quiet,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {tally !== undefined && (
        <Tally filled={tally} total={total} rows={2} tone={tone} />
      )}
      <div
        style={{
          font: "var(--type-body-sm)",
          color: inverse ? "var(--text-inverse)" : "var(--text-body)",
          maxWidth: "28ch",
        }}
      >
        {label}
      </div>
      {source && (
        <div className="okwe-source" style={{ color: quiet, maxWidth: "34ch" }}>
          {source}
        </div>
      )}
    </div>
  );
}
