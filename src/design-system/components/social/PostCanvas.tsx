import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { callNumberString } from "../notation/CallNumber";
import { brandWord } from "../../brand/geometry";
import type { BrandMark } from "../../brand/geometry";

/**
 * Canvas registry — every social/publishing surface is the same ledger sheet
 * drawn at a platform size. All type and rule sizes below are authored against
 * a 1080px baseline width and scaled by `u = c.w / 1080`.
 */
export const CANVASES = {
  square: { w: 1080, h: 1080, label: "1:1 feed" },
  portrait: { w: 1080, h: 1350, label: "4:5 feed" },
  story: { w: 1080, h: 1920, label: "9:16 story" },
  landscape: { w: 1600, h: 900, label: "16:9 card" },
  thumb: { w: 1280, h: 720, label: "YouTube thumbnail" },
  slide: { w: 1920, h: 1080, label: "Slide / video graphic" },
  banner: { w: 1500, h: 500, label: "X header" },
  report: { w: 1240, h: 1754, label: "A4 report page" },
  share: { w: 1200, h: 630, label: "Share card" },
  wide: { w: 1500, h: 600, label: "X article · 5:2" },
} as const;

export type CanvasName = keyof typeof CANVASES;

export interface CanvasSpec {
  w: number;
  h: number;
  label: string;
}

export interface ThemeSpec {
  bg: string;
  fg: string;
  muted: string;
  rule: string;
  mark: string;
}

export const THEMES = {
  chalk: {
    bg: "var(--chalk-100)",
    fg: "var(--cyanotype-900)",
    muted: "var(--cyanotype-600)",
    rule: "var(--cyanotype-900)",
    mark: "var(--sulphur-400)",
  },
  field: {
    bg: "var(--chalk-50)",
    fg: "var(--cyanotype-900)",
    muted: "var(--cyanotype-600)",
    rule: "var(--cyanotype-900)",
    mark: "var(--sulphur-400)",
  },
  plate: {
    bg: "var(--cyanotype-900)",
    fg: "var(--chalk-50)",
    muted: "var(--cyanotype-300)",
    rule: "var(--chalk-50)",
    mark: "var(--sulphur-400)",
  },
  plateMid: {
    bg: "var(--cyanotype-700)",
    fg: "var(--chalk-50)",
    muted: "var(--cyanotype-200)",
    rule: "var(--chalk-50)",
    mark: "var(--sulphur-400)",
  },
  system: {
    bg: "var(--verdigris-700)",
    fg: "var(--chalk-50)",
    muted: "var(--verdigris-300)",
    rule: "var(--chalk-50)",
    mark: "var(--sulphur-400)",
  },
  mark: {
    bg: "var(--sulphur-400)",
    fg: "var(--cyanotype-900)",
    muted: "var(--sulphur-600)",
    rule: "var(--cyanotype-900)",
    mark: "var(--cyanotype-900)",
  },
} as const satisfies Record<string, ThemeSpec>;

export type ThemeName = keyof typeof THEMES;

export interface PostCanvasProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "style" | "part"> {
  canvas?: CanvasName;
  theme?: ThemeName;
  renderWidth?: number;
  series?: string;
  issue?: number | string;
  part?: number | string;
  date?: string;
  classMark?: string;
  tally?: number;
  tallyTotal?: number;
  destination?: string;
  /**
   * The mark the register foot names. Defaults to "knowledge" — the Okwe
   * Knowledge imprint every canvas has always carried — so existing canvases
   * render exactly as they did. A process names Knows, Coms or Move; "okwe" is
   * the parent, the wordmark alone.
   */
  brand?: BrandMark;
  showRegister?: boolean;
  showSafeZone?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function PostCanvas({
  canvas = "portrait",
  theme = "chalk",
  renderWidth = 360,
  series,
  issue,
  part,
  date,
  classMark,
  tally,
  tallyTotal = 100,
  destination = "okweknowledge.com",
  brand = "knowledge",
  showRegister = true,
  showSafeZone = false,
  children,
  style,
  ...rest
}: PostCanvasProps) {
  const c: CanvasSpec = CANVASES[canvas] || CANVASES.portrait;
  const t: ThemeSpec = THEMES[theme] || THEMES.chalk;
  const scale = renderWidth / c.w;
  const u = c.w / 1080;
  // Margins are 5.5% of the canvas width — 8% on stories.
  const margin = (canvas === "story" ? 0.08 : 0.055) * c.w;
  return (
    <div
      style={{
        width: renderWidth,
        height: c.h * scale,
        position: "relative",
        flex: "none",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          width: c.w,
          height: c.h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          background: t.bg,
          color: t.fg,
          fontFamily: "var(--font-ui)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: margin,
          gap: 38 * u,
        }}
      >
        {showSafeZone && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: margin,
              outline: `${3 * u}px dashed ${t.mark}`,
              opacity: 0.55,
              pointerEvents: "none",
            }}
          />
        )}
        {(series || classMark || date) && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 24 * u,
              borderBottom: `${3 * u}px solid ${t.rule}`,
              paddingBottom: 16 * u,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontStretch: "87.5%",
                fontWeight: 700,
                fontSize: 24 * u,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {callNumberString(series, issue, part)}
            </span>
            {series && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontStretch: "87.5%",
                  fontSize: 24 * u,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: t.muted,
                }}
              >
                {series}
              </span>
            )}
            {classMark && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontStretch: "87.5%",
                  fontSize: 22 * u,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  border: `${2 * u}px solid currentColor`,
                  padding: `${6 * u}px ${10 * u}px`,
                }}
              >
                {classMark}
              </span>
            )}
            {date && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-mono)",
                  fontStretch: "87.5%",
                  fontSize: 22 * u,
                  letterSpacing: "0.08em",
                  color: t.muted,
                }}
              >
                {date}
              </span>
            )}
          </div>
        )}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28 * u,
          }}
        >
          {children}
        </div>
        {showRegister && (
          <div
            data-register-foot
            style={{
              borderTop: `${1 * u}px solid ${t.rule}`,
              paddingTop: 16 * u,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24 * u,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 16 * u }}>
              <span aria-hidden="true" style={{ display: "inline-flex", gap: 7 * u }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 13 * u,
                      height: 13 * u,
                      borderRadius: "50%",
                      display: "block",
                      background: i < 3 ? t.mark : "transparent",
                      boxShadow: i < 3 ? "none" : `inset 0 0 0 ${2 * u}px currentColor`,
                    }}
                  />
                ))}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontStretch: "118%",
                  fontWeight: 600,
                  fontSize: 30 * u,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                }}
              >
                Okwe {brandWord(brand) && <span style={{ color: t.muted }}>{brandWord(brand)}</span>}
              </span>
            </span>
            {tally !== undefined && (
              <span
                style={{
                  display: "grid",
                  gridAutoFlow: "column",
                  gridTemplateRows: `repeat(2,${9 * u}px)`,
                  gap: 3 * u,
                }}
                aria-hidden="true"
              >
                {Array.from({ length: tallyTotal }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 9 * u,
                      height: 9 * u,
                      background:
                        i < tally
                          ? t.mark
                          : theme === "plate" || theme === "plateMid" || theme === "system"
                            ? "rgba(241,243,241,.22)"
                            : "var(--chalk-300)",
                    }}
                  />
                ))}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontStretch: "87.5%",
                fontSize: 22 * u,
                letterSpacing: "0.08em",
                color: t.muted,
              }}
            >
              {destination}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCanvas;
