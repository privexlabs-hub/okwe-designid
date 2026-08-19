import type { CSSProperties } from "react";
import { CANVASES, PostCanvas } from "./PostCanvas";
import type { CanvasName, CanvasSpec, PostCanvasProps, ThemeName } from "./PostCanvas";

export interface StatCardProps
  extends Omit<
    PostCanvasProps,
    "canvas" | "theme" | "renderWidth" | "series" | "issue" | "date" | "classMark" | "tally" | "children" | "style"
  > {
  figure: string | number;
  unit?: string;
  label?: string;
  /** A statistic cannot be published without its source line. */
  source?: string;
  tally?: number;
  total?: number;
  canvas?: CanvasName;
  theme?: ThemeName;
  series?: string;
  issue?: number | string;
  date?: string;
  renderWidth?: number;
  style?: CSSProperties;
}

export function StatCard({
  figure,
  unit,
  label,
  source,
  tally,
  total = 100,
  canvas = "square",
  theme = "plate",
  series = "Numbers",
  issue,
  date,
  renderWidth = 320,
  style,
  ...rest
}: StatCardProps) {
  const c: CanvasSpec = CANVASES[canvas] || CANVASES.square;
  const u = c.w / 1080;
  const inverse = theme === "plate" || theme === "plateMid" || theme === "system";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";
  const empty = inverse ? "rgba(241,243,241,.22)" : "var(--chalk-300)";
  const filled =
    tally === undefined
      ? Math.min(total, Math.round(Number(String(figure).replace(/[^0-9.]/g, "")) || 0))
      : tally;
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
      <div style={{ display: "flex", flexDirection: "column", gap: 24 * u }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14 * u,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            fontSize: 200 * u,
            lineHeight: 0.9,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {figure}
          {unit && <span style={{ fontSize: 62 * u, color: muted }}>{unit}</span>}
        </div>
        <div
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateRows: `repeat(5,${16 * u}px)`,
            gap: 4 * u,
            width: "fit-content",
          }}
          aria-hidden="true"
        >
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 16 * u,
                height: 16 * u,
                background: i < filled ? "var(--sulphur-400)" : empty,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 500,
            fontSize: 38 * u,
            lineHeight: 1.3,
            maxWidth: "22ch",
          }}
        >
          {label}
        </div>
        {source && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontStretch: "87.5%",
              fontSize: 22 * u,
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

export default StatCard;
