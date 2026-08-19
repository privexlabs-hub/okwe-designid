import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type BadgeTone =
  | "fact"
  | "interpretation"
  | "opinion"
  | "unknown"
  | "neutral"
  | "mark"
  | "ink"
  | "inverse";

const TONES: Record<BadgeTone, { fg: string; dashed: boolean; bg?: string }> = {
  fact: {
    fg: "var(--class-fact)",
    dashed: false,
  },
  interpretation: {
    fg: "var(--class-interpretation)",
    dashed: false,
  },
  opinion: {
    fg: "var(--class-opinion)",
    dashed: false,
  },
  unknown: {
    fg: "var(--class-unknown)",
    dashed: true,
  },
  neutral: {
    fg: "var(--text-muted)",
    dashed: false,
  },
  mark: {
    fg: "var(--cyanotype-900)",
    dashed: false,
    bg: "var(--surface-mark)",
  },
  ink: {
    fg: "var(--text-inverse)",
    dashed: false,
    bg: "var(--surface-ink)",
  },
  inverse: {
    fg: "var(--text-inverse)",
    dashed: false,
  },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Small classification stamp; tone maps to the epistemic class colours. */
export function Badge({ tone = "neutral", children, style, ...rest }: BadgeProps) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      className="okwe-stamp"
      style={{
        color: t.fg,
        background: t.bg || "transparent",
        borderStyle: t.dashed ? "dashed" : "solid",
        borderColor: t.bg ? "transparent" : "currentColor",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
