import type { CSSProperties } from "react";
import { CANVASES, PostCanvas } from "./PostCanvas";
import type { CanvasName, CanvasSpec, PostCanvasProps, ThemeName } from "./PostCanvas";

export type CarouselSlideKind =
  | "cover"
  | "content"
  | "framework"
  | "comparison"
  | "conclusion"
  | "cta";

/** A list row: either a bare string, or a titled row with optional body / value. */
export type CarouselSlideItem =
  | string
  | {
      title: string;
      body?: string;
      value?: string | number;
    };

export interface CarouselSlideProps
  extends Omit<
    PostCanvasProps,
    "canvas" | "theme" | "renderWidth" | "series" | "issue" | "part" | "date" | "classMark" | "destination" | "children" | "style"
  > {
  kind?: CarouselSlideKind;
  canvas?: CanvasName;
  theme?: ThemeName;
  index?: number;
  total?: number;
  series?: string;
  issue?: number | string;
  date?: string;
  classMark?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  items?: CarouselSlideItem[];
  principle?: string;
  figure?: string | number;
  unit?: string;
  source?: string;
  cta?: string;
  renderWidth?: number;
  style?: CSSProperties;
}

export function CarouselSlide({
  kind = "content",
  canvas = "portrait",
  theme,
  index,
  total,
  series = "Okwe Explains",
  issue,
  date,
  classMark,
  eyebrow,
  title,
  body,
  items = [],
  principle,
  figure,
  unit,
  source,
  cta,
  renderWidth = 320,
  style,
  ...rest
}: CarouselSlideProps) {
  const c: CanvasSpec = CANVASES[canvas] || CANVASES.portrait;
  const u = c.w / 1080;
  // Covers take the cyanotype plate, CTAs the sulphur mark, comparisons
  // verdigris; everything else stays on chalk.
  const resolved: ThemeName =
    theme ||
    (kind === "cover"
      ? "plate"
      : kind === "cta"
        ? "mark"
        : kind === "comparison"
          ? "system"
          : "chalk");
  const inverse = resolved === "plate" || resolved === "plateMid" || resolved === "system";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";
  return (
    <PostCanvas
      canvas={canvas}
      theme={resolved}
      renderWidth={renderWidth}
      series={series}
      issue={issue}
      part={index}
      date={date}
      classMark={classMark || (kind === "cover" ? "Explainer" : undefined)}
      destination={
        index && total
          ? `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
          : "okweknowledge.com"
      }
      style={style}
      {...rest}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontStretch: "87.5%",
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
            fontStretch: kind === "cover" ? "125%" : "118%",
            fontWeight: 600,
            fontSize: (kind === "cover" ? 92 : 64) * u,
            lineHeight: kind === "cover" ? 0.94 : 1.02,
            letterSpacing: "-0.03em",
            margin: 0,
            textTransform: "none",
            // The bundle leaves this heading's colour to inheritance, but the
            // design system's base.css sets `h2 { color: var(--text-primary) }`,
            // and an element rule beats an inherited value — so on a plate the
            // cover headline rendered dark-on-dark and vanished. Every sibling
            // in this component already picks its colour from `inverse`; the
            // heading was the one that did not.
            color: inverse ? "var(--chalk-50)" : "var(--cyanotype-900)",
          }}
        >
          {title}
        </h2>
      )}
      {figure !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12 * u,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            fontSize: 170 * u,
            lineHeight: 0.92,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {figure}
          {unit && <span style={{ fontSize: 56 * u, color: muted }}>{unit}</span>}
        </div>
      )}
      {body && (
        <p
          style={{
            fontFamily: "var(--font-read)",
            fontSize: 34 * u,
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "26ch",
            color: inverse ? "var(--chalk-100)" : "var(--cyanotype-800)",
          }}
        >
          {body}
        </p>
      )}
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 * u }}>
          {items.map((it, i) => {
            const t = typeof it === "string" ? it : it.title;
            const b = typeof it === "string" ? null : it.body;
            const v = typeof it === "string" ? null : it.value;
            return (
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
                    color: muted,
                  }}
                >
                  {kind === "comparison"
                    ? i === 0
                      ? "A"
                      : "B"
                    : String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 6 * u }}>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontWeight: 600,
                      fontSize: 34 * u,
                      lineHeight: 1.2,
                    }}
                  >
                    {t}
                  </span>
                  {b && (
                    <span
                      style={{
                        fontFamily: "var(--font-read)",
                        fontSize: 28 * u,
                        lineHeight: 1.4,
                        color: muted,
                      }}
                    >
                      {b}
                    </span>
                  )}
                </span>
                {v && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 30 * u,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {v}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {principle && (
        <div
          style={{
            marginTop: 10 * u,
            borderTop: `${5 * u}px solid var(--sulphur-400)`,
            paddingTop: 14 * u,
            display: "flex",
            flexDirection: "column",
            gap: 8 * u,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontStretch: "87.5%",
              fontSize: 22 * u,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: muted,
            }}
          >
            Okwe principle
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "118%",
              fontWeight: 600,
              fontSize: 44 * u,
              lineHeight: 1.06,
              letterSpacing: "-0.025em",
            }}
          >
            {principle}
          </span>
        </div>
      )}
      {source && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontStretch: "87.5%",
            fontSize: 21 * u,
            letterSpacing: "0.08em",
            color: muted,
            maxWidth: "40ch",
          }}
        >
          {source}
        </span>
      )}
      {cta && (
        <div
          style={{
            marginTop: "auto",
            fontFamily: "var(--font-mono)",
            fontStretch: "87.5%",
            fontWeight: 700,
            fontSize: 30 * u,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          {cta}
        </div>
      )}
    </PostCanvas>
  );
}

export default CarouselSlide;
