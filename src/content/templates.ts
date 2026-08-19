/**
 * Template catalogue for the post editor — ported verbatim from the
 * prototype's `TemplateRail.jsx` module constants.
 */
import type { CanvasName, ThemeName } from "@/design-system/components/social/PostCanvas";

/** Slide kinds the editor can produce. Superset of `CarouselSlideKind`. */
export type SlideKind =
  | "cover"
  | "content"
  | "framework"
  | "comparison"
  | "conclusion"
  | "cta"
  | "stat"
  | "thumb";

export interface Template {
  code: string;
  name: string;
  platform: string;
  canvas: CanvasName;
  kinds: SlideKind[];
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
}

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
