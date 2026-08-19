import type { CarouselSlideItem, CarouselSlideKind } from "@/design-system/components/social/CarouselSlide";

/**
 * The standard six-part carousel set — a port of carousel/SocialCarousel.dc.html.
 *
 * The source is a Design Canvas template whose editable props were `rows` (the
 * framework list) and the four comparison strings. Here every slide's copy is
 * editable, which is what the template was for.
 */
export interface CarouselSlideDraft {
  kind: CarouselSlideKind;
  theme?: "system";
  eyebrow?: string;
  title: string;
  body?: string;
  principle?: string;
  cta?: string;
  /** framework slides use `rows`; comparison slides use `options`. */
  rows?: string[];
  options?: { title: string; body: string }[];
}

export interface CarouselDraft {
  code: string;
  series: string;
  issue: string;
  date: string;
  slides: CarouselSlideDraft[];
}

export const CAROUSEL_START: CarouselDraft = {
  code: "OKW-SOC-IG-CAROUSEL-01",
  series: "The Trade Desk",
  issue: "12",
  date: "18 AUG 2026",
  slides: [
    {
      kind: "cover",
      title: "What landed cost actually includes",
      body: "Five numbers most importers forget.",
    },
    {
      kind: "content",
      eyebrow: "The problem",
      title: "The invoice is not the cost",
      body: "On the shipment we tracked, the invoice was 61% of the true cost per unit.",
    },
    {
      kind: "framework",
      eyebrow: "Decompose it",
      title: "Five lines",
      rows: [
        "Unit cost",
        "Freight and origin",
        "Duty, levies, VAT",
        "Clearing and terminal",
        "Inland and losses",
      ],
    },
    {
      kind: "comparison",
      theme: "system",
      eyebrow: "Compare",
      title: "Two ways to price",
      options: [
        { title: "Invoice + margin", body: "Fast. Usually wrong." },
        { title: "Landed cost + margin", body: "Slower. Defensible." },
      ],
    },
    {
      kind: "conclusion",
      eyebrow: "Takeaway",
      title: "Price the shipment, not the invoice",
      principle: "A price you cannot decompose is a price you cannot defend.",
    },
    {
      kind: "cta",
      title: "One idea a week.",
      body: "Written from real shipments, not theory.",
      cta: "okweknowledge.com",
    },
  ],
};

/** Fold a draft slide's editable fields into the shape CarouselSlide renders. */
export function slideItems(s: CarouselSlideDraft): CarouselSlideItem[] | undefined {
  if (s.rows) return s.rows.filter(Boolean);
  if (s.options) return s.options;
  return undefined;
}

export const INTRO = {
  code: "OKW-SOC-IG-CAROUSEL-01",
  title: "Six-slide carousel — edit the text in place",
  body: "Instagram and LinkedIn, 1080×1350. The cover takes the cyanotype plate, the comparison verdigris, the closing part sulphur; everything between stays chalk. Replace the copy, keep the structure. Every claim needs a source line before this publishes.",
  foot: "Export: okwe-knowledge-[series]-[topic]-slide-NN.png · combined PDF · ZIP",
} as const;
