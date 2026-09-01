import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import {
  ARM_WORD,
  INK,
  LOCKUP,
  MUTED,
  SEED_FILL,
  WORDMARK,
  avatarWordSize,
} from "../../brand/geometry";
import type { LogoArm } from "../../brand/geometry";
import { Seeds } from "./Seeds";

export type LogoVariant = "stacked" | "horizontal" | "wordmark" | "avatar";
export type LogoTone = "ink" | "inverse";

export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: LogoVariant;
  tone?: LogoTone;
  /** Append " Knowledge" (inline) or a second line (stacked/horizontal). */
  knowledge?: boolean;
  /**
   * Which arm of the ecosystem. Overrides `knowledge` when set; omit for the
   * parent mark, which is the wordmark alone.
   */
  arm?: LogoArm;
  size?: number;
  seedFill?: string;
  style?: CSSProperties;
}

export function Logo({
  variant = "stacked",
  tone = "ink",
  knowledge = true,
  arm,
  size = 44,
  seedFill = SEED_FILL,
  style,
  ...rest
}: LogoProps) {
  /**
   * The qualifier beside OKWE. `arm` wins; `knowledge` is consulted only when
   * no arm is given, so all fourteen existing call sites render unchanged.
   */
  const qualifier = arm ? ARM_WORD[arm] : knowledge ? "Knowledge" : null;
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
    /*
     * Deliberately `arm`, NOT `qualifier`. `knowledge` defaults to true, so
     * reading the qualifier here would make every existing
     * `<Logo variant="avatar"/>` sprout a second line and change /social-kit
     * and /design-system. The avatar names an arm only when asked to.
     */
    const avatarArm = arm ? ARM_WORD[arm] : null;
    return (
      <span
        role="img"
        aria-label={avatarArm ? `Okwe ${avatarArm}` : "Okwe"}
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
        {avatarArm && (
          /* MUTED.inverse — the same step the generator uses for the inverse
             qualifier. At 512 and 180 the word is legible; the favicon, which
             is not this component, stays the seed row alone. */
          <span
            style={{
              ...word,
              color: MUTED.inverse,
              // Fitted, not a flat ratio — "Knowledge" is twice the length of
              // "Move" and overruns the square at the same size.
              fontSize: avatarWordSize(size, avatarArm),
            }}
          >
            {avatarArm}
          </span>
        )}
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span style={{ ...word, fontSize: size, ...style }} {...rest}>
        Okwe
        {qualifier && <span style={{ color: muted }}> {qualifier}</span>}
      </span>
    );
  }

  const secondLine: ReactNode = qualifier && (
    <>
      <br />
      <span style={{ color: muted }}>{qualifier}</span>
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
          {qualifier && <span style={{ color: muted }}> {qualifier}</span>}
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
