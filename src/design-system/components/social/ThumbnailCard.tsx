import type { CSSProperties } from "react";
import { CANVASES, PostCanvas } from "./PostCanvas";
import type { CanvasSpec, PostCanvasProps, ThemeName } from "./PostCanvas";
import { callNumberString } from "../notation/CallNumber";

export interface ThumbnailCardProps
  extends Omit<
    PostCanvasProps,
    "canvas" | "theme" | "renderWidth" | "showRegister" | "children" | "style"
  > {
  title?: string;
  series?: string;
  issue?: number | string;
  duration?: string;
  theme?: ThemeName;
  imageLabel?: string;
  question?: string;
  renderWidth?: number;
  style?: CSSProperties;
}

export function ThumbnailCard({
  title,
  series = "How It Works",
  issue,
  duration,
  theme = "plate",
  imageLabel,
  question,
  renderWidth = 420,
  style,
  ...rest
}: ThumbnailCardProps) {
  const c: CanvasSpec = CANVASES.thumb;
  const u = c.w / 1080;
  const inverse = theme !== "chalk" && theme !== "mark";
  const fg = inverse ? "var(--chalk-50)" : "var(--cyanotype-900)";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";
  return (
    <PostCanvas
      canvas="thumb"
      theme={theme}
      renderWidth={renderWidth}
      showRegister={false}
      style={style}
      {...rest}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "1fr 380px",
        }}
      >
        <div
          style={{
            padding: 64 * u,
            display: "flex",
            flexDirection: "column",
            gap: 18 * u,
            justifyContent: "space-between",
            color: fg,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18 * u,
              borderBottom: `${4 * u}px solid currentColor`,
              paddingBottom: 12 * u,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontStretch: "87.5%",
                fontWeight: 700,
                fontSize: 26 * u,
                letterSpacing: "0.08em",
              }}
            >
              {callNumberString(series, issue)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontStretch: "87.5%",
                fontSize: 24 * u,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: muted,
              }}
            >
              {series}
            </span>
            {duration && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-mono)",
                  fontStretch: "87.5%",
                  fontSize: 24 * u,
                  letterSpacing: "0.08em",
                  border: `${2 * u}px solid currentColor`,
                  padding: `${5 * u}px ${9 * u}px`,
                }}
              >
                {duration}
              </span>
            )}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStretch: "125%",
              fontWeight: 700,
              fontSize: 104 * u,
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
              margin: 0,
              // Same fix as CarouselSlide: base.css's `h2` rule would otherwise
              // override the inherited plate colour and hide the title.
              color: inverse ? "var(--chalk-50)" : "var(--cyanotype-900)",
            }}
          >
            {title}
          </h2>
          {question && (
            <span
              style={{
                fontFamily: "var(--font-read)",
                fontStyle: "italic",
                fontSize: 32 * u,
                color: muted,
                maxWidth: "30ch",
              }}
            >
              {question}
            </span>
          )}
        </div>
        <div
          style={{
            background: inverse ? "var(--cyanotype-700)" : "var(--chalk-200)",
            display: "grid",
            placeItems: "center",
            borderLeft: `${8 * u}px solid var(--sulphur-400)`,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontStretch: "87.5%",
              fontSize: 22 * u,
              letterSpacing: "0.10em",
              textAlign: "center",
              padding: 32 * u,
              color: inverse ? "var(--cyanotype-200)" : "var(--cyanotype-600)",
              textTransform: "uppercase",
            }}
          >
            {imageLabel || "Field photograph — subject, right third"}
          </span>
        </div>
      </div>
    </PostCanvas>
  );
}

export default ThumbnailCard;
