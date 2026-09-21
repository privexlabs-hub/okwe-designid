"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "@/design-system/components/core/Dialog";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import type { CanvasName } from "@/design-system/components/social/PostCanvas";
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
import { assetName, baseName } from "./naming";
import { activeCanvas } from "./canvas";
import { DraftsDialog } from "./DraftsDialog";
import { useAutosave } from "@/lib/useAutosave";
import { HANDOFF_KEY, readAutosave, readOnce, saveDraft } from "@/lib/store";
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
  if (kind === "cover" || kind === "thumb" || kind === "article") return "plate" as const;
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
  const [shelf, setShelf] = useState(false);

  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const registerNode = useCallback((i: number, node: HTMLDivElement | null) => {
    nodes.current[i] = node;
  }, []);
  /** Offscreen copies at every size except the active one, keyed "canvas:index". */
  const sizeNodes = useRef<Record<string, HTMLDivElement | null>>({});
  const registerSizeNode = useCallback(
    (i: number, canvas: CanvasName, node: HTMLDivElement | null) => {
      sizeNodes.current[`${canvas}:${i}`] = node;
    },
    [],
  );
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
      const canvas = activeCanvas(doc);
      const spec = CANVASES[canvas];
      return { node, width: spec.w, height: spec.h, name: assetName(doc, i, canvas) };
    },
    [doc],
  );

  /** One slide at a named size — the active size uses the node above. */
  const targetForSize = useCallback(
    (i: number, canvas: CanvasName): ExportTarget | null => {
      if (canvas === activeCanvas(doc)) return targetFor(i);
      const node = sizeNodes.current[`${canvas}:${i}`];
      if (!node) return null;
      const spec = CANVASES[canvas];
      return { node, width: spec.w, height: spec.h, name: assetName(doc, i, canvas) };
    },
    [doc, targetFor],
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
        // Labelled rows: comparison carries verdicts, compare and rank carry values.
        options:
          k === "comparison"
            ? d.slides.find((s) => s.options)?.options || [
                { title: "Invoice + margin", body: "Fast. Usually wrong." },
                { title: "Landed cost + margin", body: "Slower. Defensible." },
              ]
            : k === "compare"
              ? d.slides.find((s) => s.options)?.options || [
                  { title: "Invoice only", value: "61" },
                  { title: "Landed cost", value: "100" },
                ]
              : k === "rank"
                ? d.slides.find((s) => s.options)?.options || [
                    { title: "Unit cost", value: "4.10" },
                    { title: "Duty, levies, VAT", value: "1.35" },
                    { title: "Freight and origin", value: "0.90" },
                    { title: "Clearing and terminal", value: "0.42" },
                    { title: "Inland and losses", value: "0.30" },
                  ]
                : undefined,
        events:
          k === "timeline"
            ? d.slides.find((s) => s.events)?.events || [
                { date: "D+0", label: "Ex-works" },
                { date: "D+6", label: "Loaded" },
                { date: "D+36", label: "Berthed", mark: true },
                { date: "D+41", label: "Cleared" },
                { date: "D+54", label: "In warehouse" },
              ]
            : undefined,
        /*
         * Always empty for a data asset — never inherited.
         *
         * Carrying another slide's source forward would attach a provenance
         * line to a figure it does not describe, and would quietly satisfy the
         * export gate. Each data asset earns its own source.
         */
        source:
          k === "stat" || k === "compare" || k === "rank" || k === "timeline"
            ? ""
            : undefined,
      }));
      nodes.current = [];
      sizeNodes.current = {};
      // A size belongs to a template; never carry one across.
      return { ...d, template: t, slides, active: 0, size: undefined };
    });

  /**
   * Replace the whole document.
   *
   * `nodes.current` MUST be cleared alongside it. The staging refs are keyed by
   * slide index, so a document swap without a reset exports the previous deck —
   * a silently wrong file, which is worse than a crash. `pick()` already does
   * this; every other whole-document path has to as well.
   */
  const replaceDoc = useCallback((next: EditorDoc) => {
    nodes.current = [];
    setDoc(next);
  }, []);

  /**
   * First load owns the document exactly once: either the question register's
   * seed or the autosaved working document, never both.
   *
   * The search check and the handoff read are deliberately in the SAME effect.
   * Splitting them across two effects would make correctness depend on hook
   * declaration order, which is a trap for whoever reorders them next.
   */
  useEffect(() => {
    if (window.location.search.includes("seed=register")) {
      const handoff = readOnce<{
        kind: string;
        seed: { title?: string; eyebrow?: string; date?: string };
      }>(HANDOFF_KEY);
      // Clear the flag so a reload does not try to seed again.
      window.history.replaceState({}, "", window.location.pathname);
      if (handoff?.seed) {
        nodes.current = [];
        setDoc((d) => ({
          ...d,
          active: 0,
          slides: d.slides.map((s, i) =>
            i === 0
              ? {
                  ...s,
                  title: handoff.seed.title ?? s.title,
                  eyebrow: handoff.seed.eyebrow ?? s.eyebrow,
                }
              : s,
          ),
        }));
        return; // the seed wins over yesterday's working document
      }
    }

    const stored = readAutosave<EditorDoc>("post");
    if (stored) {
      nodes.current = [];
      setDoc(stored);
    }
  }, []);

  // Restore is handled above, so the hook is used purely as the debounced writer.
  useAutosave<EditorDoc>("post", doc, () => {}, { skipRestore: true });

  const saveTemplate = () => {
    const result = saveDraft("post", baseName(doc), doc);
    setSaved(result.ok);
    window.setTimeout(() => setSaved(false), 2400);
  };

  const previewWidth = Math.round(CANVASES[activeCanvas(doc)].w * 0.4);

  return (
    <div className={styles.shell}>
      <TopBar
        doc={doc}
        saved={saved}
        onExport={() => setExporting(true)}
        onSaveTemplate={saveTemplate}
        onOpenShelf={() => setShelf(true)}
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
            onSize={(size) => set({ size })}
            action={
              <DownloadControl
                label={`slide ${String(doc.active + 1).padStart(2, "0")}`}
                getTarget={() => targetFor(doc.active)}
              />
            }
          />
          <SlideStrip doc={doc} set={set} targetFor={targetFor} />
        </div>
        <Inspector
          doc={doc}
          slide={slide}
          set={set}
          setSlide={setSlide}
          setActive={(i) => set({ active: i })}
          onScore={(id, value) =>
            setDoc((d) => ({ ...d, score: { ...(d.score ?? {}), [id]: value } }))
          }
        />
      </div>

      {/* Laid out offscreen so every slide can be captured, not just the active one. */}
      <StagingArea doc={doc} registerNode={registerNode} registerSizeNode={registerSizeNode} />

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
          targetForSize={targetForSize}
        />
      )}

      {shelf && (
        <DraftsDialog<EditorDoc>
          kind="post"
          current={doc}
          suggestedName={baseName(doc)}
          onOpen={(next) => {
            replaceDoc(next);
            setShelf(false);
          }}
          onClose={() => setShelf(false)}
        />
      )}
    </div>
  );
}
