import type { CSSProperties } from "react";
import { CANVASES, PostCanvas } from "./PostCanvas";
import type { CanvasName, CanvasSpec, PostCanvasProps, ThemeName } from "./PostCanvas";

export interface TimelineEvent {
  date: string;
  label: string;
  /** Marks the event in sulphur — the tick and its date, never a surface. */
  mark?: boolean;
}

export interface TimelineCardProps
  extends Omit<
    PostCanvasProps,
    "canvas" | "theme" | "renderWidth" | "series" | "issue" | "date" | "classMark" | "tally" | "children" | "style"
  > {
  eyebrow?: string;
  title?: string;
  /** A data card cannot be published without its source line. */
  source?: string;
  events: TimelineEvent[];
  canvas?: CanvasName;
  theme?: ThemeName;
  series?: string;
  issue?: number | string;
  date?: string;
  renderWidth?: number;
  style?: CSSProperties;
}

/** Six columns is the most the field can carry before the labels collide. */
const MAX_EVENTS = 6;

/**
 * OKW-DAT-TIMELINE-01 — one hairline, square-ended ticks at even fractions.
 *
 * No dots and no arrowheads: each tick is a vertical rule that meets the
 * hairline at a square joint. Every label sits below the line — alternating
 * above and below reads as decoration, not as measurement.
 */
export function TimelineCard({
  eyebrow,
  title,
  source,
  events,
  canvas = "landscape",
  theme = "chalk",
  renderWidth = 480,
  series = "Field Notes",
  issue,
  date,
  style,
  ...rest
}: TimelineCardProps) {
  const c: CanvasSpec = CANVASES[canvas] || CANVASES.landscape;
  const u = c.w / 1080;
  const inverse = theme === "plate" || theme === "plateMid" || theme === "system";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";

  // Clamped here, not by the caller.
  const shown = events.slice(0, MAX_EVENTS);
  // The date band is a fixed height so the hairline can be laid across every
  // column at exactly the height where the ticks begin.
  const dateBand = 34 * u;

  return (
    <PostCanvas
      canvas={canvas}
      theme={theme}
      renderWidth={renderWidth}
      series={series}
      issue={issue}
      date={date}
      classMark="Sequence"
      style={style}
      {...rest}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 * u }}>
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
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(1, shown.length)},1fr)`,
            marginTop: 12 * u,
          }}
        >
          {/* One hairline across the whole field, at the ticks' shoulder. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: dateBand,
              height: 1 * u,
              background: "currentColor",
            }}
          />
          {shown.map((ev, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 0,
                paddingInline: 8 * u,
              }}
            >
              <span
                style={{
                  height: dateBand,
                  display: "flex",
                  alignItems: "flex-end",
                  fontFamily: "var(--font-mono)",
                  fontStretch: "87.5%",
                  fontSize: 22 * u,
                  letterSpacing: "0.08em",
                  fontVariantNumeric: "tabular-nums",
                  color: ev.mark ? "var(--rule-mark)" : muted,
                }}
              >
                {ev.date}
              </span>
              <span
                aria-hidden="true"
                style={{
                  width: 3 * u,
                  height: 22 * u,
                  background: ev.mark ? "var(--rule-mark)" : "currentColor",
                }}
              />
              <span
                style={{
                  marginTop: 14 * u,
                  width: "100%",
                  textAlign: "center",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 600,
                  fontSize: 26 * u,
                  lineHeight: 1.25,
                  overflowWrap: "break-word",
                }}
              >
                {ev.label}
              </span>
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

export default TimelineCard;
