import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type MarginNoteRole = "source" | "method" | "unknown" | "correction" | "note";

const ROLE: Record<MarginNoteRole, string> = {
  source: "Sources",
  method: "Method",
  unknown: "What we do not know",
  correction: "Correction",
  note: "Note",
};
const COLOR: Record<MarginNoteRole, string> = {
  source: "var(--class-fact)",
  method: "var(--class-interpretation)",
  unknown: "var(--class-unknown)",
  correction: "var(--class-opinion)",
  note: "var(--text-muted)",
};

export interface MarginNoteItem {
  href?: string;
  label?: ReactNode;
}

export interface MarginNoteProps extends Omit<HTMLAttributes<HTMLElement>, "role"> {
  role?: MarginNoteRole;
  items?: Array<string | MarginNoteItem>;
  children?: ReactNode;
  tone?: "ink" | "inverse";
  style?: CSSProperties;
}

/** A note that hangs on a single rule in the margin. */
export function MarginNote({
  role = "note",
  items = [],
  children,
  tone = "ink",
  style,
  ...rest
}: MarginNoteProps) {
  const inverse = tone === "inverse";
  return (
    <aside
      style={{
        borderLeft: `var(--rule-thin) solid ${inverse ? "var(--rule-inverse)" : "var(--rule-ink)"}`,
        paddingLeft: "var(--space-4)",
        maxWidth: "var(--measure-note)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        ...style,
      }}
      {...rest}
    >
      <span className="okwe-label" style={{ color: COLOR[role] }}>
        {ROLE[role] || role}
      </span>
      {items.length > 0 && (
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {items.map((it, i) => (
            <li
              key={i}
              style={{
                font: "var(--type-caption)",
                color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)",
                display: "flex",
                gap: "var(--space-3)",
              }}
            >
              <span
                className="okwe-call"
                style={{
                  color: inverse ? "var(--text-inverse-muted)" : "var(--text-quiet)",
                  flex: "none",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{typeof it === "string" ? it : <a href={it.href}>{it.label}</a>}</span>
            </li>
          ))}
        </ol>
      )}
      {children && (
        <div
          style={{
            font: "var(--type-caption)",
            color: inverse ? "var(--text-inverse-muted)" : "var(--text-muted)",
          }}
        >
          {children}
        </div>
      )}
    </aside>
  );
}
