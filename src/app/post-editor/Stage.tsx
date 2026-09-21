"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CanvasName } from "@/design-system/components/social/PostCanvas";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import type { CarouselSlideKind } from "@/design-system/components/social/CarouselSlide";
import { StatCard } from "@/design-system/components/social/StatCard";
import { ThumbnailCard } from "@/design-system/components/social/ThumbnailCard";
import { ComparisonCard } from "@/design-system/components/social/ComparisonCard";
import { RankCard } from "@/design-system/components/social/RankCard";
import { TimelineCard } from "@/design-system/components/social/TimelineCard";
import { ArticleCard, isArticleCanvas } from "@/design-system/components/social/ArticleCard";
import type { EditorDoc, Slide } from "@/content/templates";
import { activeCanvas, sizesOf } from "./canvas";
import styles from "./editor.module.css";

/** On-screen render width for a canvas, from the source's Stage.jsx. */
export function renderWidthFor(canvas: CanvasName): number {
  if (canvas === "story") return 300;
  if (canvas === "slide" || canvas === "landscape" || canvas === "share" || canvas === "wide")
    return 640;
  if (canvas === "thumb") return 560;
  return 420;
}

export interface SlideArtProps {
  doc: EditorDoc;
  slide: Slide;
  /** Position in the deck, 1-based — the source used `doc.active + 1`. */
  index: number;
  width: number;
  /**
   * The size to draw. Defaults to the document's active size; the staging area
   * passes every size so a multi-size template can export all of them.
   */
  canvas?: CanvasName;
}

/**
 * The rendered asset for one slide. Shared by the visible stage, the feed
 * preview and the offscreen staging area the exporter captures from, so all
 * three are guaranteed to be the same artwork.
 */
export function SlideArt({ doc, slide, index, width, canvas: size }: SlideArtProps) {
  const canvas = size ?? activeCanvas(doc);
  const common = {
    renderWidth: width,
    series: doc.series,
    issue: doc.issue,
    date: doc.date,
    showSafeZone: doc.safe,
  };

  if (slide.kind === "stat") {
    return (
      <StatCard
        {...common}
        canvas={canvas === "thumb" ? "landscape" : canvas}
        theme={slide.theme}
        figure={slide.figure || ""}
        unit={slide.unit}
        label={slide.title}
        source={slide.source}
      />
    );
  }

  if (slide.kind === "thumb") {
    return (
      <ThumbnailCard
        renderWidth={width}
        title={slide.title}
        duration={slide.unit}
        theme={
          slide.theme === "chalk" || slide.theme === "field"
            ? "plate"
            : slide.theme
        }
        series={doc.series}
        issue={doc.issue}
        question={slide.body}
      />
    );
  }

  if (slide.kind === "compare") {
    const [a, b] = slide.options ?? [];
    return (
      <ComparisonCard
        {...common}
        canvas={canvas === "thumb" ? "portrait" : canvas}
        theme={slide.theme}
        eyebrow={slide.eyebrow}
        title={slide.title}
        unit={slide.unit}
        source={slide.source}
        a={{ label: a?.title ?? "A", value: Number(a?.value ?? 0) }}
        b={{ label: b?.title ?? "B", value: Number(b?.value ?? 0) }}
      />
    );
  }

  if (slide.kind === "rank") {
    return (
      <RankCard
        {...common}
        canvas={canvas === "thumb" ? "portrait" : canvas}
        theme={slide.theme}
        eyebrow={slide.eyebrow}
        title={slide.title}
        source={slide.source}
        rows={(slide.options ?? []).map((o) => ({ label: o.title, value: o.value }))}
      />
    );
  }

  if (slide.kind === "timeline") {
    return (
      <TimelineCard
        {...common}
        canvas={canvas === "thumb" ? "landscape" : canvas}
        theme={slide.theme}
        eyebrow={slide.eyebrow}
        title={slide.title}
        source={slide.source}
        events={slide.events ?? []}
      />
    );
  }

  if (slide.kind === "article") {
    return (
      <ArticleCard
        {...common}
        canvas={isArticleCanvas(canvas) ? canvas : "slide"}
        theme={slide.theme}
        classMark={doc.contentType}
        eyebrow={slide.eyebrow}
        title={slide.title}
        lede={slide.body}
        brand={doc.brand}
        destination={doc.destination || undefined}
      />
    );
  }

  /*
   * Every remaining kind is a carousel slide.
   *
   * The branches above return early, so by here `slide.kind` has been narrowed
   * to what they did not handle. Assigning it to `CarouselSlideKind` with no
   * cast is the guard: a member added to `SlideKind` without a branch leaves a
   * kind that is not a carousel kind, and `tsc` fails on this line — where the
   * wrong card would otherwise have rendered. (It used to be an `Exclude<>`
   * followed by an `as` cast, which accepted anything and guarded nothing.)
   */
  const remaining: CarouselSlideKind = slide.kind;

  return (
    <CarouselSlide
      {...common}
      canvas={canvas}
      kind={remaining}
      theme={slide.theme}
      index={index}
      total={doc.slides.length}
      eyebrow={slide.eyebrow}
      title={slide.title}
      body={slide.body}
      /* `options` carries labelled rows (comparison); `items` carries plain
         lines (framework). Both reach CarouselSlide, which accepts either. */
      items={slide.options ?? (slide.items || []).filter(Boolean)}
      principle={slide.principle}
      /* Both of these were declared, edited and gated, but never passed —
         source copy on a content slide was invisible on the canvas. */
      source={slide.source}
      cta={slide.cta}
    />
  );
}

/**
 * Width the canvas may actually take: never more than the container it sits
 * in, never more than the design's preview width. Measured rather than
 * guessed, so the phone gets a canvas that fits instead of one that overlaps
 * the panel beside it. Aspect ratio is untouched — SlideArt derives its own
 * height from the width.
 */
function useFittedWidth(max: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const pad =
        parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
      setAvail(Math.max(160, Math.floor(el.clientWidth - pad)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width: avail === null ? max : Math.min(max, avail) };
}

export interface StageProps {
  doc: EditorDoc;
  slide: Slide;
  /** Download control for the slide on screen, rendered under the canvas. */
  action?: ReactNode;
  /** Switch the size on the stage. Only offered when the template has several. */
  onSize?: (canvas: CanvasName) => void;
}

/** Centre column: the active slide at preview size, with its measurements. */
export function Stage({ doc, slide, action, onSize }: StageProps) {
  const canvas = activeCanvas(doc);
  const sizes = sizesOf(doc);
  const { ref, width } = useFittedWidth(renderWidthFor(canvas));

  return (
    <div ref={ref} className={styles.stage}>
      <div className={styles.stageInner}>
        <SlideArt
          doc={doc}
          slide={slide}
          index={doc.active + 1}
          width={width}
        />
        <div className={styles.stageMeta}>
          <span>{doc.template.code}</span>
          <span>
            {CANVASES[canvas].w} × {CANVASES[canvas].h}
          </span>
          <span>
            {sizes.length > 1
              ? sizes.find((s) => s.canvas === canvas)?.use
              : doc.template.platform}
          </span>
        </div>
        {sizes.length > 1 && onSize && (
          <div className={styles.sizeRow}>
            {sizes.map((s) => (
              <button
                key={s.canvas}
                type="button"
                className={styles.sizeButton}
                aria-pressed={s.canvas === canvas}
                aria-label={`${CANVASES[s.canvas].w} by ${CANVASES[s.canvas].h} — ${s.use}`}
                title={s.use}
                onClick={() => onSize(s.canvas)}
              >
                {CANVASES[s.canvas].w}×{CANVASES[s.canvas].h}
              </button>
            ))}
          </div>
        )}
        {action}
      </div>
    </div>
  );
}

export interface StagingAreaProps {
  doc: EditorDoc;
  /** Called with the wrapper node for each slide, by index. */
  registerNode: (index: number, node: HTMLDivElement | null) => void;
  /** Called with the wrapper for each slide at every other size, for multi-size export. */
  registerSizeNode?: (index: number, canvas: CanvasName, node: HTMLDivElement | null) => void;
}

/**
 * Every slide, laid out offscreen.
 *
 * The exporter rasterises real DOM, so a multi-slide export needs every slide
 * actually laid out — `display:none` or unmounting would give html-to-image
 * nothing to measure. Parking the deck at left:-100000px keeps it laid out and
 * off every screen, and `aria-hidden` plus `inert` keeps it out of the
 * accessibility tree and the tab order.
 */
export function StagingArea({ doc, registerNode, registerSizeNode }: StagingAreaProps) {
  const active = activeCanvas(doc);
  const width = renderWidthFor(active);
  // Only a multi-size template has other sizes; everything else renders one pass, as before.
  const others = sizesOf(doc)
    .map((s) => s.canvas)
    .filter((c) => c !== active);
  return (
    <div
      aria-hidden="true"
      inert
      style={{
        position: "fixed",
        left: -100000,
        top: 0,
        pointerEvents: "none",
      }}
    >
      {doc.slides.map((s, i) => (
        <div key={i} ref={(node) => registerNode(i, node)} style={{ width }}>
          <SlideArt doc={doc} slide={s} index={i + 1} width={width} canvas={active} />
        </div>
      ))}
      {registerSizeNode &&
        others.flatMap((c) =>
          doc.slides.map((s, i) => (
            <div
              key={`${c}-${i}`}
              ref={(node) => registerSizeNode(i, c, node)}
              style={{ width: renderWidthFor(c) }}
            >
              <SlideArt doc={doc} slide={s} index={i + 1} width={renderWidthFor(c)} canvas={c} />
            </div>
          )),
        )}
    </div>
  );
}
