/**
 * Template catalogue for the post editor — ported verbatim from the
 * prototype's `TemplateRail.jsx` module constants.
 */
import type { CanvasName, ThemeName } from "@/design-system/components/social/PostCanvas";
import type { QualityScore } from "@/lib/quality";
import type { BrandMark } from "@/design-system/brand/geometry";

/**
 * Slide kinds the editor can produce. Superset of `CarouselSlideKind`.
 *
 * NAMING HAZARD — `comparison` and `compare` are different things:
 *   comparison  a CAROUSEL slide: two labelled options on verdigris.
 *   compare     a DATA card (OKW-DAT-COMPARE-01): two tallies, ink vs sulphur.
 * Different renderers. Do not swap them.
 */
export type SlideKind =
  | "cover"
  | "content"
  | "framework"
  | "comparison"
  | "conclusion"
  | "cta"
  | "stat"
  | "thumb"
  | "compare"
  | "rank"
  | "timeline"
  | "article";

/**
 * Every kind, named. This exists for the build as much as for the UI: adding a
 * member to `SlideKind` without a label fails `tsc` here, which is a cheap
 * second guard alongside the `never` check in `SlideArt`'s dispatch.
 */
export const SLIDE_KIND_LABEL: Record<SlideKind, string> = {
  cover: "Cover",
  content: "Content",
  framework: "Framework",
  comparison: "Comparison",
  conclusion: "Conclusion",
  cta: "Call to action",
  stat: "Statistic",
  thumb: "Thumbnail",
  compare: "Two tallies",
  rank: "Ranking",
  timeline: "Timeline",
  article: "Article header",
};

/** One size a template leaves in, and what that size is for. */
export interface TemplateSize {
  canvas: CanvasName;
  /** Shown beside the size in the editor, so a size is never just a number. */
  use: string;
}

export interface Template {
  code: string;
  name: string;
  platform: string;
  canvas: CanvasName;
  kinds: SlideKind[];
  /**
   * "rendered"   the editor can honestly produce it (the default when absent).
   * "documented" in the library, no renderer yet — listed, never faked.
   * "held"       deliberately withheld by the playbook itself.
   */
  status?: "rendered" | "documented" | "held";
  /** Why it is not rendered. Shown in the rail, so the gap is stated. */
  note?: string;
  /**
   * Every size this one design leaves in. Absent means the single `canvas`,
   * which is every template except the article header. The first entry is the
   * default and matches `canvas`.
   */
  sizes?: TemplateSize[];
}

export interface Slide {
  kind: SlideKind;
  theme: ThemeName;
  eyebrow?: string;
  title?: string;
  body?: string;
  items?: string[];
  principle?: string;
  figure?: string;
  unit?: string;
  source?: string;
  cta?: string;
  /**
   * Labelled rows. Read by `comparison` (title + body), `compare` and `rank`
   * (title + value). Matches what `CarouselSlide.items` already accepts.
   */
  options?: { title: string; body?: string; value?: string }[];
  /** Timeline events, capped at six by the renderer. */
  events?: { date: string; label: string; mark?: boolean }[];
}

export interface EditorDoc {
  template: Template;
  series: string;
  issue: string;
  date: string;
  contentType: string;
  safe: boolean;
  active: number;
  slides: Slide[];
  /**
   * The editorial score, 0-5 on ten criteria. Absent until someone scores it —
   * "a piece nobody scored is a piece nobody owns".
   */
  score?: QualityScore;
  /** The size on the stage. Absent, or not one of the template's sizes, means `template.canvas`. */
  size?: CanvasName;
  /** The mark the register foot names. Absent means the Okwe Knowledge imprint; "okwe" is the parent. */
  brand?: Brand;
  /**
   * The destination in the register foot. Absent means okweknowledge.com — the
   * only documented domain, so the other marks' addresses are typed, not guessed.
   */
  destination?: string;
}

/** Which mark a canvas carries: the parent, the Okwe Knowledge imprint, or a process. */
export type Brand = BrandMark;

export const TEMPLATES: Template[] = [
  {
    code: "OKW-SOC-IG-CAROUSEL-01",
    name: "Framework carousel",
    platform: "Instagram",
    canvas: "portrait",
    kinds: ["cover", "framework", "content", "cta"],
  },
  {
    code: "OKW-SOC-IG-QUOTE-01",
    name: "Quote card",
    platform: "Instagram",
    canvas: "square",
    kinds: ["content"],
  },
  {
    code: "OKW-SOC-X-INSIGHT-01",
    name: "Single insight",
    platform: "X",
    canvas: "landscape",
    kinds: ["content"],
  },
  {
    code: "OKW-SOC-LI-FRAMEWORK-01",
    name: "Document post",
    platform: "LinkedIn",
    canvas: "square",
    kinds: ["cover", "framework", "conclusion"],
  },
  {
    code: "OKW-DAT-STAT-01",
    name: "Statistic card",
    platform: "All feeds",
    canvas: "square",
    kinds: ["stat"],
  },
  {
    code: "OKW-VID-YT-THUMB-01",
    name: "YouTube thumbnail",
    platform: "YouTube",
    canvas: "thumb",
    kinds: ["thumb"],
  },
  {
    code: "OKW-VID-SHORT-HOOK-01",
    name: "Short-form hook",
    platform: "TikTok / Reels",
    canvas: "story",
    kinds: ["cover", "content", "cta"],
  },
  {
    code: "OKW-EDI-SLIDE-01",
    name: "Presentation slide",
    platform: "Deck / video",
    canvas: "slide",
    kinds: ["cover", "content"],
  },
  {
    code: "OKW-SOC-LI-INSIGHT-01",
    name: "Professional insight",
    platform: "LinkedIn",
    canvas: "square",
    kinds: ["content"],
  },
  {
    code: "OKW-SOC-ALL-ANNOUNCE-01",
    name: "Announcement",
    platform: "All feeds",
    canvas: "square",
    kinds: ["cta"],
  },
  {
    code: "OKW-DAT-COMPARE-01",
    name: "Comparison",
    platform: "All feeds",
    canvas: "portrait",
    kinds: ["compare"],
  },
  {
    code: "OKW-DAT-TIMELINE-01",
    name: "Timeline",
    platform: "All feeds",
    canvas: "landscape",
    kinds: ["timeline"],
  },
  {
    code: "OKW-DAT-RANK-01",
    name: "Ranking",
    platform: "All feeds",
    canvas: "portrait",
    kinds: ["rank"],
  },
  {
    code: "OKW-VID-YT-TITLE-01",
    name: "Title card",
    platform: "YouTube",
    canvas: "slide",
    kinds: ["cover"],
  },
  {
    code: "OKW-VID-YT-CHAPTER-01",
    name: "Chapter card",
    platform: "YouTube",
    canvas: "slide",
    kinds: ["content"],
  },
  {
    code: "OKW-VID-YT-OUTRO-01",
    name: "Outro",
    platform: "YouTube",
    canvas: "slide",
    kinds: ["cta"],
  },
  {
    code: "OKW-VID-SHORT-END-01",
    name: "Short end card",
    platform: "TikTok / Reels",
    canvas: "story",
    kinds: ["cta"],
  },
  {
    code: "OKW-ACA-COURSE-COVER-01",
    name: "Course cover",
    platform: "Academy",
    canvas: "landscape",
    kinds: ["cover"],
  },
  {
    code: "OKW-ACA-LESSON-01",
    name: "Lesson card",
    platform: "Academy",
    canvas: "portrait",
    kinds: ["content"],
  },
  {
    code: "OKW-ACA-WORKBOOK-01",
    name: "Workbook cover",
    platform: "Academy",
    canvas: "report",
    kinds: ["cover"],
  },
  {
    code: "OKW-BUS-REPORT-01",
    name: "Research report",
    platform: "Business",
    canvas: "report",
    kinds: ["cover", "content", "conclusion"],
  },
  {
    code: "OKW-BUS-PROPOSAL-01",
    name: "Proposal",
    platform: "Business",
    canvas: "report",
    kinds: ["cover", "framework", "content"],
  },
  {
    code: "OKW-BUS-DECK-01",
    name: "Business deck",
    platform: "Business",
    canvas: "slide",
    kinds: ["cover", "content", "framework", "conclusion"],
  },

  // Documented, not rendered. Listed so the gap is stated, never faked.
  {
    code: "OKW-SOC-IG-DEF-01",
    name: "Definition card",
    platform: "Instagram",
    canvas: "portrait",
    kinds: ["content"],
    status: "documented",
    note: "Needs a term / definition / not-this renderer. DefinitionCard exists on the page, not on a canvas.",
  },
  {
    code: "OKW-SOC-X-BANNER-01",
    name: "Profile header",
    platform: "X",
    canvas: "banner",
    kinds: ["cover"],
    status: "documented",
    note: "1500×500 leaves too little field between the index band and the register foot; needs its own reduced composition.",
  },
  {
    code: "OKW-VID-YT-LOWER-01",
    name: "Lower third",
    platform: "YouTube",
    canvas: "slide",
    kinds: ["content"],
    status: "documented",
    note: "A lower third is a partial overlay. PostCanvas draws a full sheet.",
  },
  {
    code: "OKW-VID-SHORT-SUB-01",
    name: "Subtitle frame",
    platform: "TikTok / Reels",
    canvas: "story",
    kinds: ["content"],
    status: "documented",
    note: "Needs a mono caption band inside the 9% story safe zone.",
  },
  {
    code: "OKW-EDI-ARTICLE-01",
    name: "Article header",
    platform: "Editorial",
    /*
     * "Site header: call number, headline, lede, class stamps" — the playbook's
     * definition. It gives no pixel size, so the sizes are the platforms' own:
     * LinkedIn Help (article cover 1920×1080; link preview 1.91:1), the brand's
     * existing 1200×630 share card, the playbook's X size (OKW-SOC-X-INSIGHT-01)
     * which also meets Medium Help's ≥1400px-wide 16:9 guidance, X's recommended
     * 5:2 for an article image, and the feed square.
     */
    canvas: "slide",
    kinds: ["article"],
    sizes: [
      { canvas: "slide", use: "LinkedIn article cover" },
      { canvas: "share", use: "Share card · site, X and LinkedIn links" },
      { canvas: "wide", use: "X article header · 5:2" },
      { canvas: "landscape", use: "X post · Medium header" },
      { canvas: "square", use: "Feed post" },
    ],
  },
  {
    code: "OKW-EDI-QUOTE-01",
    name: "Pull quote",
    platform: "Editorial",
    canvas: "square",
    kinds: ["content"],
    status: "documented",
    note: "Rendered on the page by PullQuote, not as an exportable canvas.",
  },
  {
    code: "OKW-EDI-MARGIN-01",
    name: "Margin note",
    platform: "Editorial",
    canvas: "square",
    kinds: ["content"],
    status: "documented",
    note: "Rendered on the page by MarginNote, not as an exportable canvas.",
  },
  {
    code: "OKW-EDI-FRAMEWORK-01",
    name: "Framework block",
    platform: "Editorial",
    canvas: "square",
    kinds: ["framework"],
    status: "documented",
    note: "Rendered on the page by FrameworkList, not as an exportable canvas.",
  },
  {
    code: "OKW-BUS-LETTER-01",
    name: "Letterhead",
    platform: "Business",
    canvas: "report",
    kinds: ["cover"],
    status: "documented",
    note: "A4 letterhead needs an address block and a body text flow, not a single field.",
  },

  // Held by the playbook's own decision.
  {
    code: "OKW-ACA-CERT-01",
    name: "Certificate",
    platform: "Academy",
    canvas: "landscape",
    kinds: ["cover"],
    status: "held",
    note: "Held back until outcomes are assessable.",
  },
];

export const SERIES: string[] = [
  "The Trade Desk",
  "The Logistics Desk",
  "Business Anatomy",
  "How It Works",
  "Field Notes",
  "Numbers",
  "Okwe Explains",
];

export const CONTENT_TYPES: string[] = [
  "Explainer",
  "Framework",
  "Case file",
  "Myth",
  "Numbers",
  "Definition",
  "Field note",
  "Commentary",
];

export const THEMES: { id: ThemeName; label: string }[] = [
  { id: "chalk", label: "Chalk" },
  { id: "field", label: "Field" },
  { id: "plate", label: "Cyanotype plate" },
  { id: "system", label: "Verdigris" },
  { id: "mark", label: "Sulphur" },
];
