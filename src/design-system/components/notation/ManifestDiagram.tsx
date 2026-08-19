import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface ManifestStage {
  input?: ReactNode;
  label?: ReactNode;
  state?: ReactNode;
  value?: ReactNode;
  mark?: boolean;
}

export interface ManifestDiagramProps extends HTMLAttributes<HTMLElement> {
  stages?: ManifestStage[];
  tone?: "ink" | "inverse";
  showIndex?: boolean;
  caption?: ReactNode;
  style?: CSSProperties;
}

/** Stages on ONE ruled baseline with solid square joints. Never arrows, never curves. */
export function ManifestDiagram({
  stages = [],
  tone = "ink",
  showIndex = true,
  caption,
  style,
  ...rest
}: ManifestDiagramProps) {
  const inverse = tone === "inverse";
  const ink = inverse ? "var(--text-inverse)" : "var(--text-primary)";
  const quiet = inverse ? "var(--text-inverse-muted)" : "var(--text-muted)";
  const rule = inverse ? "var(--rule-inverse)" : "var(--rule-ink)";
  return (
    <figure
      style={{
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${stages.length},1fr)`,
          alignItems: "stretch",
        }}
      >
        {stages.map((s, i) => {
          const mark = s.mark;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
                paddingRight: "var(--space-4)",
              }}
            >
              <span className="okwe-call" style={{ color: quiet }}>
                {showIndex ? String(i + 1).padStart(2, "0") : ""}
                {s.input ? " · " + s.input : ""}
              </span>
              <div
                style={{
                  borderTop: `var(--rule-thick) solid ${mark ? "var(--rule-mark)" : rule}`,
                  paddingTop: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                  position: "relative",
                  minHeight: 74,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -9,
                    left: 0,
                    width: 8,
                    height: 8,
                    background: mark ? "var(--surface-mark)" : ink,
                  }}
                />
                <span style={{ font: "var(--type-h4)", color: ink }}>{s.label}</span>
                {s.state && (
                  <span
                    style={{
                      font: "var(--type-caption)",
                      color: quiet,
                      maxWidth: "22ch",
                    }}
                  >
                    {s.state}
                  </span>
                )}
                {s.value !== undefined && (
                  <span
                    className="okwe-figure"
                    style={{
                      fontSize: "var(--size-xl)",
                      color: ink,
                      marginTop: "var(--space-2)",
                    }}
                  >
                    {s.value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="okwe-source">{caption}</figcaption>}
    </figure>
  );
}
