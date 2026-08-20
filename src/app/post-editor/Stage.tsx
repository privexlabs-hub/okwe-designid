"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CanvasName } from "@/design-system/components/social/PostCanvas";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import type { CarouselSlideKind } from "@/design-system/components/social/CarouselSlide";
import { StatCard } from "@/design-system/components/social/StatCard";
import { ThumbnailCard } from "@/design-system/components/social/ThumbnailCard";
import type { EditorDoc, Slide } from "@/content/templates";
import styles from "./editor.module.css";

/** On-screen render width for a canvas, from the source's Stage.jsx. */
export function renderWidthFor(canvas: CanvasName): number {
  if (canvas === "story") return 300;
  if (canvas === "slide" || canvas === "landscape") return 640;
  if (canvas === "thumb") return 560;
  return 420;
}

export interface SlideArtProps {
  doc: EditorDoc;
  slide: Slide;
  /** Position in the deck, 1-based — the source used `doc.active + 1`. */
  index: number;
  width: number;
}

/**
 * The rendered asset for one slide. Shared by the visible stage, the feed
 * preview and the offscreen staging area the exporter captures from, so all
 * three are guaranteed to be the same artwork.
 */
export function SlideArt({ doc, slide, index, width }: SlideArtProps) {
  const canvas = doc.template.canvas;
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

  return (
    <CarouselSlide
      {...common}
      canvas={canvas}
      kind={slide.kind as CarouselSlideKind}
      theme={slide.theme}
      index={index}
      total={doc.slides.length}
      eyebrow={slide.eyebrow}
      title={slide.title}
      body={slide.body}
      items={(slide.items || []).filter(Boolean)}
      principle={slide.principle}
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
}

/** Centre column: the active slide at preview size, with its measurements. */
export function Stage({ doc, slide, action }: StageProps) {
  const canvas = doc.template.canvas;
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
          <span>{doc.template.platform}</span>
        </div>
        {action}
      </div>
    </div>
  );
}

export interface StagingAreaProps {
  doc: EditorDoc;
  /** Called with the wrapper node for each slide, by index. */
  registerNode: (index: number, node: HTMLDivElement | null) => void;
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
export function StagingArea({ doc, registerNode }: StagingAreaProps) {
  const width = renderWidthFor(doc.template.canvas);
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
          <SlideArt doc={doc} slide={s} index={i + 1} width={width} />
        </div>
      ))}
    </div>
  );
}
