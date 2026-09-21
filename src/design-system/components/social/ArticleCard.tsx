import type { CSSProperties } from "react";
import { PostCanvas } from "./PostCanvas";
import type { PostCanvasProps } from "./PostCanvas";

/**
 * OKW-EDI-ARTICLE-01 — the article header.
 *
 * The playbook's definition: "Site header: call number, headline, lede, class
 * stamps." Composed on PostCanvas like every other card, so the index band
 * (call number, series, class stamp, date) and the register foot (seeds,
 * wordmark, destination) are inherited, never redrawn.
 */

/** The sizes an article leaves in. */
export const ARTICLE_CANVASES = ["slide", "share", "wide", "landscape", "square"] as const;
export type ArticleCanvas = (typeof ARTICLE_CANVASES)[number];

export const isArticleCanvas = (c: string): c is ArticleCanvas =>
  (ARTICLE_CANVASES as readonly string[]).includes(c);

/**
 * Type per size, in true canvas pixels.
 *
 * Deliberately not scaled by width like the other cards: a 1200×630 share card
 * is wide but short, so width-based scaling would set type the sheet cannot
 * hold. Each size is set against the longest headline the editor allows (62
 * characters) and LEDE_FIT, and scripts/verify-additions.mjs measures the text's
 * own line boxes against the index band and the register foot at every size.
 */
export const ARTICLE_TYPE: Record<
  ArticleCanvas,
  { title: number; lede: number; eyebrow: number; measure: string }
> = {
  slide: { title: 120, lede: 40, eyebrow: 30, measure: "46ch" },
  landscape: { title: 104, lede: 34, eyebrow: 26, measure: "46ch" },
  share: { title: 72, lede: 26, eyebrow: 20, measure: "46ch" },
  /*
   * 5:2 is the shortest sheet in the set at 600px, and the widest relative to
   * its height. At a 46ch measure the subtitle wrapped to three lines and the
   * pair overran the band and the foot by about 14px. The fix is the sheet's
   * own shape: a wider measure drops the subtitle to two lines, which buys back
   * more room than shrinking the headline would — so the headline keeps its size.
   */
  wide: { title: 68, lede: 25, eyebrow: 19, measure: "72ch" },
  square: { title: 92, lede: 32, eyebrow: 24, measure: "46ch" },
};

/**
 * The longest subtitle that fits the tightest sheet — the 5:2 X article, 600px
 * tall — beside a 62-character headline. A layout limit, not a brand rule: the
 * playbook sets none for a lede. Every size is checked, not just that one.
 */
export const LEDE_FIT = 120;

export interface ArticleCardProps extends Omit<PostCanvasProps, "canvas" | "children" | "style"> {
  canvas?: ArticleCanvas;
  /** Optional mono line above the headline. */
  eyebrow?: string;
  title?: string;
  /** The subtitle. */
  lede?: string;
  style?: CSSProperties;
}

export function ArticleCard({
  canvas = "slide",
  theme = "plate",
  eyebrow,
  title,
  lede,
  style,
  ...rest
}: ArticleCardProps) {
  const type = ARTICLE_TYPE[canvas] ?? ARTICLE_TYPE.slide;
  const inverse = theme === "plate" || theme === "plateMid" || theme === "system";
  const muted = inverse ? "var(--cyanotype-300)" : "var(--cyanotype-600)";

  return (
    <PostCanvas canvas={canvas} theme={theme} style={style} {...rest}>
      {eyebrow && (
        <div
          data-article-eyebrow
          style={{
            fontFamily: "var(--font-mono)",
            fontStretch: "87.5%",
            fontSize: type.eyebrow,
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
          data-article-title
          style={{
            fontFamily: "var(--font-display)",
            fontStretch: "125%",
            fontWeight: 600,
            fontSize: type.title,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
            margin: 0,
            textTransform: "none",
            // base.css sets `h2 { color }`, and an element rule beats an
            // inherited value — left to inheritance, this headline would be
            // dark-on-dark on the plate. The colour is explicit for that reason.
            color: inverse ? "var(--chalk-50)" : "var(--cyanotype-900)",
          }}
        >
          {title}
        </h2>
      )}
      {lede && (
        <p
          data-article-lede
          style={{
            fontFamily: "var(--font-read)",
            fontSize: type.lede,
            lineHeight: 1.3,
            margin: 0,
            maxWidth: type.measure,
            color: inverse ? "var(--cyanotype-200)" : "var(--cyanotype-700)",
          }}
        >
          {lede}
        </p>
      )}
    </PostCanvas>
  );
}

export default ArticleCard;
