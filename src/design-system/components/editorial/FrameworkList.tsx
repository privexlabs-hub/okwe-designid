import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface FrameworkStep {
  title?: ReactNode;
  body?: ReactNode;
  value?: ReactNode;
}

export interface FrameworkListProps extends HTMLAttributes<HTMLDivElement> {
  steps?: Array<string | FrameworkStep>;
  variant?: "numbered" | "lettered" | "dashed";
  principle?: ReactNode;
  tone?: "ink" | "inverse";
  style?: CSSProperties;
}

/** Numbered / lettered steps on rules, with an optional closing Okwe principle. */
export function FrameworkList({
  steps = [],
  variant = "numbered",
  principle,
  tone = "ink",
  style,
  ...rest
}: FrameworkListProps) {
  const inverse = tone === "inverse";
  const ink = inverse ? "var(--text-inverse)" : "var(--text-primary)";
  const quiet = inverse ? "var(--text-inverse-muted)" : "var(--text-secondary)";
  const rule = inverse ? "var(--rule-inverse-quiet)" : "var(--rule-quiet)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
      {...rest}
    >
      {steps.map((s, i) => {
        const title = typeof s === "string" ? s : s.title;
        const body = typeof s === "string" ? null : s.body;
        const value = typeof s === "string" ? null : s.value;
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr auto",
              gap: "var(--space-5)",
              alignItems: "baseline",
              padding: "var(--space-4) 0",
              borderTop: `var(--rule-thin) solid ${i === 0 ? (inverse ? "var(--rule-inverse)" : "var(--rule-ink)") : rule}`,
            }}
          >
            <span
              className="okwe-call"
              style={{ color: inverse ? "var(--text-inverse-muted)" : "var(--text-quiet)" }}
            >
              {variant === "numbered"
                ? String(i + 1).padStart(2, "0")
                : variant === "lettered"
                  ? String.fromCharCode(65 + i)
                  : "—"}
            </span>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <span
                style={{
                  font: "var(--type-h4)",
                  fontSize: "var(--size-md)",
                  color: ink,
                }}
              >
                {title}
              </span>
              {body && (
                <span
                  style={{
                    font: "var(--type-body-sm)",
                    color: quiet,
                    maxWidth: "var(--measure-body)",
                  }}
                >
                  {body}
                </span>
              )}
            </span>
            {value && (
              <span
                className="okwe-figure"
                style={{ fontSize: "var(--size-lg)", color: ink }}
              >
                {value}
              </span>
            )}
          </div>
        );
      })}
      {principle && (
        <div
          style={{
            marginTop: "var(--space-6)",
            borderTop: "var(--rule-thick) solid var(--rule-mark)",
            paddingTop: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <span
            className="okwe-label"
            style={{ color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)" }}
          >
            Okwe principle
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "var(--stretch-display)",
              fontWeight: "var(--weight-semibold)",
              fontSize: "var(--size-xl)",
              lineHeight: "var(--leading-heading)",
              letterSpacing: "var(--tracking-heading)",
              color: ink,
              maxWidth: "var(--measure-narrow)",
            }}
          >
            {principle}
          </span>
        </div>
      )}
    </div>
  );
}
