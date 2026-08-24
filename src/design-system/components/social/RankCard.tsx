import type { CSSProperties } from "react";
import { CANVASES, PostCanvas } from "./PostCanvas";
import type { CanvasName, CanvasSpec, PostCanvasProps, ThemeName } from "./PostCanvas";

export interface RankRow {
  label: string;
  value?: string;
}

export interface RankCardProps
  extends Omit<
    PostCanvasProps,
    "canvas" | "theme" | "renderWidth" | "series" | "issue" | "date" | "classMark" | "tally" | "children" | "style"
  > {
  eyebrow?: string;
  title?: string;
  /** A data card cannot be published without its source line. */
  source?: string;
  rows: RankRow[];
  canvas?: CanvasName;
  theme?: ThemeName;
  series?: string;
  issue?: number | string;
  date?: string;
  renderWidth?: number;
  style?: CSSProperties;
}

/** How many rows the sheet can hold before the list stops being readable. */
const MAX_ROWS = 8;

/**
 * OKW-DAT-RANK-01 — a numbered list, 01–08.
 *
 * The row grid is deliberately the same geometry `CarouselSlide` uses for its
 * item list (`62u | 1fr | auto`, 20u gutter, 20u vertical padding, a 3u rule
 * on the first row and 1u hairlines after) so a ranking and a framework list
 * read as one system.
 */
export function RankCard({
  eyebrow,
  title,
  source,
  rows,
  canvas = "portrait",
  theme = "chalk",
  renderWidth = 320,
  series = "Numbers",
  issue,
  date,
  style,
  ...rest
}: RankCardProps) {
  const c: CanvasSpec = CANVASES[canvas] || CANVASES.portrait;
  const u = c.w / 1080;
  const inverse = theme === "plate" || theme === "plateMid" || theme === "system";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";

  // Clamped here, not by the caller: nine rows overrun the sheet.
  const shown = rows.slice(0, MAX_ROWS);

  return (
    <PostCanvas
      canvas={canvas}
      theme={theme}
      renderWidth={renderWidth}
      series={series}
      issue={issue}
      date={date}
      classMark="Ranked"
      style={style}
      {...rest}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 * u }}>
        {eyebrow && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontStretch: "87.5%",
              fontWeight: 700,
              fontSize: 24 * u,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: muted,
            }}
          >
            {eyebrow}
          </div>
        )}
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
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 * u }}>
          {shown.map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: `${62 * u}px 1fr auto`,
                gap: 20 * u,
                alignItems: "baseline",
                padding: `${20 * u}px 0`,
                borderTop: `${i === 0 ? 3 * u : 1 * u}px solid currentColor`,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontStretch: "87.5%",
                  fontSize: 26 * u,
                  letterSpacing: "0.08em",
                  fontVariantNumeric: "tabular-nums",
                  color: muted,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 600,
                  fontSize: 34 * u,
                  lineHeight: 1.2,
                }}
              >
                {row.label}
              </span>
              {row.value && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 30 * u,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {row.value}
                </span>
              )}
            </div>
          ))}
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

export default RankCard;
