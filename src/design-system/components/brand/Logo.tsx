import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { INK, LOCKUP, MUTED, SEED_FILL, WORDMARK } from "../../brand/geometry";
import { Seeds } from "./Seeds";

export type LogoVariant = "stacked" | "horizontal" | "wordmark" | "avatar";
export type LogoTone = "ink" | "inverse";

export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: LogoVariant;
  tone?: LogoTone;
  /** Append " Knowledge" (inline) or a second line (stacked/horizontal). */
  knowledge?: boolean;
  size?: number;
  seedFill?: string;
  style?: CSSProperties;
}

export function Logo({
  variant = "stacked",
  tone = "ink",
  knowledge = true,
  size = 44,
  seedFill = SEED_FILL,
  style,
  ...rest
}: LogoProps) {
  const inverse = tone === "inverse";
  const ink = inverse ? INK.inverse : INK.normal;
  const muted = inverse ? MUTED.inverse : MUTED.normal;
  const word: CSSProperties = {
    fontFamily: WORDMARK.fontFamily,
    fontStretch: WORDMARK.fontStretch,
    fontWeight: WORDMARK.fontWeight,
    textTransform: WORDMARK.textTransform,
    letterSpacing: WORDMARK.letterSpacing,
    lineHeight: WORDMARK.lineHeight,
    color: ink,
    whiteSpace: "nowrap",
  };

  if (variant === "avatar") {
    const l = LOCKUP.avatar;
    return (
      <span
        role="img"
        aria-label="Okwe"
        style={{
          width: size,
          height: size,
          flex: "none",
          background: "var(--cyanotype-900)",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: size * l.gap,
          ...style,
        }}
        {...rest}
      >
        <Seeds size={size * l.seed} filled={3} color="var(--chalk-50)" fill={seedFill} />
        <span style={{ ...word, color: "var(--chalk-50)", fontSize: size * l.word }}>Okwe</span>
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span style={{ ...word, fontSize: size, ...style }} {...rest}>
        Okwe
        {knowledge && <span style={{ color: muted }}> Knowledge</span>}
      </span>
    );
  }

  const secondLine: ReactNode = knowledge && (
    <>
      <br />
      <span style={{ color: muted }}>Knowledge</span>
    </>
  );

  if (variant === "horizontal") {
    const l = LOCKUP.horizontal;
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: size * l.gap, ...style }}
        {...rest}
      >
        <Seeds size={size * l.seed} filled={3} color={ink} fill={seedFill} />
        <span style={{ ...word, fontSize: size }}>
          Okwe
          {knowledge && <span style={{ color: muted }}> Knowledge</span>}
        </span>
      </span>
    );
  }

  /* stacked — the primary mark: seeds above, name under */
  const l = LOCKUP.stacked;
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: size * l.gap,
        ...style,
      }}
      {...rest}
    >
      <Seeds size={size * l.seed} filled={3} color={ink} fill={seedFill} />
      <span style={{ ...word, fontSize: size }}>
        Okwe
        {secondLine}
      </span>
    </span>
  );
}
