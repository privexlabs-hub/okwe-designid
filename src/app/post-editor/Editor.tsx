"use client";

import { useCallback, useRef, useState } from "react";
import { Dialog } from "@/design-system/components/core/Dialog";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import { TEMPLATES } from "@/content/templates";
import type {
  EditorDoc,
  Slide,
  SlideKind,
  Template,
} from "@/content/templates";
import { ExportDialog } from "./ExportDialog";
import { Inspector } from "./Inspector";
import { SlideArt, Stage, StagingArea } from "./Stage";
import { SlideStrip } from "./SlideStrip";
import { TemplateRail } from "./TemplateRail";
import { TopBar } from "./TopBar";
import { DownloadControl } from "@/components/DownloadControl";
import type { ExportTarget } from "@/lib/export";
import { slideName } from "./naming";
import styles from "./editor.module.css";

const START: EditorDoc = {
  template: TEMPLATES[0],
  series: "The Trade Desk",
  issue: "12",
  date: "18 AUG 2026",
  contentType: "Framework",
  safe: false,
  active: 0,
  slides: [
    {
      kind: "cover",
      theme: "plate",
      title: "What landed cost actually includes",
      body: "Five numbers most importers forget.",
    },
    {
      kind: "framework",
      theme: "chalk",
      eyebrow: "The components",
      title: "Five numbers",
      items: [
        "Unit cost",
        "Freight and origin charges",
        "Duty, levies and VAT",
        "Clearing and terminal",
        "Inland movement and losses",
      ],
      principle: "A price you cannot decompose is a price you cannot defend.",
    },
    {
      kind: "content",
      theme: "chalk",
      eyebrow: "Why it matters",
      title: "The invoice was 61% of the real cost",
      body: "On the shipment we tracked, the four lines after the invoice decided the margin.",
      source: "Okwe measurement, single shipment, Oct 2026",
    },
    {
      kind: "cta",
      theme: "mark",
      title: "One idea a week.",
      body: "Written from real shipments, not theory.",
      cta: "okweknowledge.com",
    },
  ],
};

/** Theme a freshly templated slide takes, by kind. */
function themeFor(kind: SlideKind) {
  if (kind === "cover" || kind === "thumb") return "plate" as const;
  if (kind === "cta") return "mark" as const;
  // The source wrote `k === "chalk"` here — comparing a slide *kind* against a
  // *theme* name, which is never true and left the theme undefined. The intent
  // was plainly the literal "chalk".
  return "chalk" as const;
}

export function Editor() {
  const [doc, setDoc] = useState<EditorDoc>(START);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const registerNode = useCallback((i: number, node: HTMLDivElement | null) => {
    nodes.current[i] = node;
  }, []);
  const getNodes = useCallback(
    () => nodes.current.slice(0, doc.slides.length),
    [doc.slides.length],
  );

  /**
   * One slide as an export target. The size is the TRUE canvas from CANVASES,
   * never the on-screen preview — exactly what the bulk export does — and the
   * node is the offscreen staging copy, which is always laid out.
   */
  const targetFor = useCallback(
    (i: number): ExportTarget | null => {
      const node = nodes.current[i];
      if (!node) return null;
      const spec = CANVASES[doc.template.canvas];
      return { node, width: spec.w, height: spec.h, name: slideName(doc, i) };
    },
    [doc],
  );

  const set = (patch: Partial<EditorDoc>) =>
    setDoc((d) => ({ ...d, ...patch }));
  const slide = doc.slides[doc.active];
  const setSlide = (patch: Partial<Slide>) =>
    setDoc((d) => ({
      ...d,
      slides: d.slides.map((s, i) => (i === d.active ? { ...s, ...patch } : s)),
    }));

  const pick = (t: Template) =>
    setDoc((d) => {
      const slides: Slide[] = t.kinds.map((k, i) => ({
        ...(d.slides[i] || d.slides[0]),
        kind: k,
        theme: themeFor(k),
        figure: k === "stat" ? "18" : undefined,
        unit: k === "stat" ? "days" : k === "thumb" ? "14 MIN" : undefined,
        items:
          k === "framework"
            ? d.slides.find((s) => s.items)?.items || [
                "Unit cost",
                "Freight",
                "Duty and VAT",
              ]
            : undefined,
      }));
      nodes.current = [];
      return { ...d, template: t, slides, active: 0 };
    });

  const saveTemplate = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  const previewWidth = Math.round(CANVASES[doc.template.canvas].w * 0.4);

  return (
    <div className={styles.shell}>
      <TopBar
        doc={doc}
        saved={saved}
        onExport={() => setExporting(true)}
        onSaveTemplate={saveTemplate}
        onPreview={() => setPreviewing(true)}
        onToggleRail={() => setRailOpen((o) => !o)}
        railOpen={railOpen}
      />
      <div className={styles.body}>
        {railOpen && (
          <button
            type="button"
            aria-label="Close templates"
            className={styles.backdropOpen}
            onClick={() => setRailOpen(false)}
          />
        )}
        <div
          className={`${styles.railSlot} ${railOpen ? styles.railOpen : ""}`}
        >
          <TemplateRail
            active={doc.template.code}
            onPick={pick}
            onPicked={() => setRailOpen(false)}
          />
        </div>
        <div className={styles.centre}>
          <Stage
            doc={doc}
            slide={slide}
            action={
              <DownloadControl
                label={`slide ${String(doc.active + 1).padStart(2, "0")}`}
                getTarget={() => targetFor(doc.active)}
              />
            }
          />
          <SlideStrip doc={doc} set={set} targetFor={targetFor} />
        </div>
        <Inspector doc={doc} slide={slide} set={set} setSlide={setSlide} />
      </div>

      {/* Laid out offscreen so every slide can be captured, not just the active one. */}
      <StagingArea doc={doc} registerNode={registerNode} />

      {previewing && (
        <Dialog
          callNumber="OKW · PREVIEW"
          title="Preview in feed"
          description={`Slide ${doc.active + 1} of ${doc.slides.length} at 40% — roughly how it lands in a phone feed.`}
          onClose={() => setPreviewing(false)}
          width="auto"
        >
          <div style={{ display: "grid", placeItems: "center" }}>
            <SlideArt
              doc={doc}
              slide={slide}
              index={doc.active + 1}
              width={previewWidth}
            />
          </div>
        </Dialog>
      )}

      {exporting && (
        <ExportDialog
          doc={doc}
          onClose={() => setExporting(false)}
          getNodes={getNodes}
          targetFor={targetFor}
        />
      )}
    </div>
  );
}
