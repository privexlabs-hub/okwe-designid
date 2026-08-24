import type { CSSProperties } from "react";
import { CANVASES, PostCanvas } from "./PostCanvas";
import type { CanvasName, CanvasSpec, PostCanvasProps, ThemeName } from "./PostCanvas";
import { Tally } from "../notation/Tally";

export interface ComparisonSide {
  label: string;
  value: number;
  caption?: string;
}

export interface ComparisonCardProps
  extends Omit<
    PostCanvasProps,
    "canvas" | "theme" | "renderWidth" | "series" | "issue" | "date" | "classMark" | "tally" | "children" | "style"
  > {
  eyebrow?: string;
  title?: string;
  unit?: string;
  /** A data card cannot be published without its source line. */
  source?: string;
  a: ComparisonSide;
  b: ComparisonSide;
  canvas?: CanvasName;
  theme?: ThemeName;
  series?: string;
  issue?: number | string;
  date?: string;
  renderWidth?: number;
  style?: CSSProperties;
}

/**
 * OKW-DAT-COMPARE-01 — two tallies, ink against sulphur.
 *
 * Both sides are counted against one shared total so the comparison is honest,
 * and that total is clamped here rather than trusted from the caller: an
 * unclamped count renders hundreds of squares and overruns the sheet.
 */
export function ComparisonCard({
  eyebrow,
  title,
  unit,
  source,
  a,
  b,
  canvas = "portrait",
  theme = "chalk",
  renderWidth = 320,
  series = "Numbers",
  issue,
  date,
  style,
  ...rest
}: ComparisonCardProps) {
  const c: CanvasSpec = CANVASES[canvas] || CANVASES.portrait;
  const u = c.w / 1080;
  const inverse = theme === "plate" || theme === "plateMid" || theme === "system";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";

  // Never trust the caller with the square count.
  const total = Math.min(40, Math.max(a.value, b.value, 10));
  const aFilled = Math.max(0, Math.min(total, Math.round(a.value)));
  const bFilled = Math.max(0, Math.min(total, Math.round(b.value)));

  const cell = 14 * u;
  const cellGap = 4 * u;

  const labelStyle: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontStretch: "87.5%",
    fontWeight: 700,
    fontSize: 24 * u,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: muted,
  };
  const figureStyle: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    gap: 12 * u,
    fontFamily: "var(--font-mono)",
    fontWeight: 500,
    fontSize: 120 * u,
    lineHeight: 0.95,
    fontVariantNumeric: "tabular-nums",
  };
  const captionStyle: CSSProperties = {
    fontFamily: "var(--font-read)",
    fontSize: 28 * u,
    lineHeight: 1.4,
    maxWidth: "30ch",
    color: muted,
  };

  return (
    <PostCanvas
      canvas={canvas}
      theme={theme}
      renderWidth={renderWidth}
      series={series}
      issue={issue}
      date={date}
      classMark="Measured"
      style={style}
      {...rest}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 * u }}>
        {eyebrow && <div style={labelStyle}>{eyebrow}</div>}
        {title && (
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "118%",
              fontWeight: 600,
              fontSize: 64 * u,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: 0,
              color: inverse ? "var(--chalk-50)" : "var(--cyanotype-900)",
            }}
          >
            {title}
          </h2>
        )}

        {/* Side A — counted in ink. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 * u }}>
          <span style={labelStyle}>{a.label}</span>
          <span style={figureStyle}>
            {a.value}
            {unit && <span style={{ fontSize: 44 * u, color: muted }}>{unit}</span>}
          </span>
          {/*
            Drawn locally rather than with <Tally>: Tally can only fill in
            sulphur (--tally-filled), and the pair has to read as ink against
            sulphur. Same cell size, same gap, same two rows as the Tally below,
            so the two grids still read as one system.
          */}
          <div
            aria-hidden="true"
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(2,${cell}px)`,
              gap: cellGap,
              width: "fit-content",
            }}
          >
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: cell,
                  height: cell,
                  background: i < aFilled ? "currentColor" : "var(--tally-empty)",
                }}
              />
            ))}
          </div>
          {a.caption && <span style={captionStyle}>{a.caption}</span>}
        </div>

        <div style={{ borderTop: `${3 * u}px solid currentColor` }} />

        {/* Side B — counted in sulphur. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 * u }}>
          <span style={labelStyle}>{b.label}</span>
          <span style={figureStyle}>
            {b.value}
            {unit && <span style={{ fontSize: 44 * u, color: muted }}>{unit}</span>}
          </span>
          <Tally
            filled={bFilled}
            total={total}
            rows={2}
            unit={`${cell}px`}
            gap={`${cellGap}px`}
            tone={inverse ? "inverse" : "ink"}
          />
          {b.caption && <span style={captionStyle}>{b.caption}</span>}
        </div>

        {source && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontStretch: "87.5%",
              fontSize: 21 * u,
              letterSpacing: "0.08em",
              color: muted,
              maxWidth: "42ch",
            }}
          >
            {source}
          </div>
        )}
      </div>
    </PostCanvas>
  );
}

export default ComparisonCard;
