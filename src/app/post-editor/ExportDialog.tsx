"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/core/Button";
import { Dialog } from "@/design-system/components/core/Dialog";
import { Checkbox } from "@/design-system/components/forms/Checkbox";
import { Field } from "@/design-system/components/forms/Field";
import { Select } from "@/design-system/components/forms/Select";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import {
  ExportError,
  download,
  slugify,
  toJpg,
  toPdf,
  toPng,
  toSvgString,
  toZip,
} from "@/lib/export";
import type { ExportTarget } from "@/lib/export";
import type { EditorDoc } from "@/content/templates";

interface Formats {
  png: boolean;
  jpg: boolean;
  pdf: boolean;
  svg: boolean;
  zip: boolean;
}

const SCALES = ["1x — native", "2x — print/retina"];

export interface ExportDialogProps {
  doc: EditorDoc;
  onClose: () => void;
  /** The offscreen staging nodes, one per slide, in deck order. */
  getNodes: () => (HTMLElement | null)[];
}

export function ExportDialog({ doc, onClose, getNodes }: ExportDialogProps) {
  const [fmt, setFmt] = useState<Formats>({
    png: true,
    jpg: false,
    pdf: true,
    svg: false,
    zip: true,
  });
  const [scale, setScale] = useState(SCALES[0]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const base = `okwe-knowledge-${slugify(doc.series)}-${slugify(doc.slides[0]?.title || "")}`;
  const slideName = (i: number) => `${base}-slide-${String(i + 1).padStart(2, "0")}`;

  /** Exactly the files the Export button will produce, in the order it makes them. */
  const names: string[] = [];
  doc.slides.forEach((_, i) => {
    if (fmt.png) names.push(`${slideName(i)}.png`);
    if (fmt.jpg) names.push(`${slideName(i)}.jpg`);
    if (fmt.svg) names.push(`${slideName(i)}.svg`);
  });
  if (fmt.pdf) names.push(`${base}.pdf`);
  const delivered = fmt.zip && names.length > 0 ? [`${base}-package.zip`] : names;

  const toggle = (k: keyof Formats) => setFmt((f) => ({ ...f, [k]: !f[k] }));

  async function run() {
    setError("");
    setBusy(true);
    try {
      const nodes = getNodes();
      const spec = CANVASES[doc.template.canvas];
      const targets: ExportTarget[] = [];
      doc.slides.forEach((_, i) => {
        const node = nodes[i];
        if (node) {
          targets.push({ node, width: spec.w, height: spec.h, name: slideName(i) });
        }
      });
      if (!targets.length) throw new ExportError("Nothing was rendered to export.");

      const px = Math.max(1, SCALES.indexOf(scale) + 1);
      const files: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < targets.length; i++) {
        setProgress(`Exporting ${i + 1} of ${targets.length}…`);
        const t = targets[i];
        if (fmt.png) files.push({ name: `${t.name}.png`, blob: await toPng(t, { scale: px }) });
        if (fmt.jpg) files.push({ name: `${t.name}.jpg`, blob: await toJpg(t, { scale: px }) });
        if (fmt.svg) {
          const svg = await toSvgString(t);
          files.push({
            name: `${t.name}.svg`,
            blob: new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          });
        }
      }

      if (fmt.pdf) {
        setProgress("Building the PDF…");
        files.push({ name: `${base}.pdf`, blob: await toPdf(targets, { scale: px }) });
      }

      if (!files.length) throw new ExportError("Choose at least one format.");

      if (fmt.zip) {
        setProgress("Packaging…");
        download(await toZip(files), `${base}-package.zip`);
      } else {
        for (const f of files) download(f.blob, f.name);
      }

      setProgress("");
      onClose();
    } catch (e) {
      setProgress("");
      setError(
        e instanceof ExportError
          ? e.message
          : e instanceof Error
            ? `Export failed: ${e.message}`
            : "Export failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      callNumber="OKW · EXPORT"
      title="Export assets"
      description={`${doc.slides.length} slide${doc.slides.length > 1 ? "s" : ""} · ${doc.template.code} · ${doc.template.platform}`}
      onClose={busy ? undefined : onClose}
      width="620px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="mark" onClick={run} disabled={busy || delivered.length === 0}>
            {busy ? progress || "Exporting…" : `Export ${delivered.length} files`}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-7)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span
            style={{
              font: "var(--type-label)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Formats
          </span>
          <Checkbox label="PNG — every slide" checked={fmt.png} onChange={() => toggle("png")} />
          <Checkbox label="JPG — every slide" checked={fmt.jpg} onChange={() => toggle("jpg")} />
          <Checkbox label="PDF — combined" checked={fmt.pdf} onChange={() => toggle("pdf")} />
          <Checkbox
            label="SVG — type and rules only"
            checked={fmt.svg}
            onChange={() => toggle("svg")}
          />
          <Checkbox
            label="ZIP — whole package"
            checked={fmt.zip}
            onChange={() => toggle("zip")}
          />
          <Field label="Resolution" htmlFor="res">
            <Select
              id="res"
              size="sm"
              options={SCALES}
              value={scale}
              onChange={(e) => setScale(e.target.value)}
            />
          </Field>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <span
            style={{
              font: "var(--type-label)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            File names
          </span>
          <div
            style={{
              background: "var(--surface-inset)",
              border: "1px solid var(--rule-quiet)",
              borderRadius: "var(--radius-0)",
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              font: "var(--type-caption)",
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {names.length === 0 ? <span>Choose a format.</span> : names.map((n) => <span key={n}>{n}</span>)}
          </div>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
            Names follow <b>okwe-knowledge-[series]-[topic]-slide-NN</b>. Files are rendered in the
            browser and downloaded straight to this device — with ZIP checked they arrive as one
            archive. The PDF is a raster image of each slide, so its text is not selectable.
          </span>
          {error && (
            <span role="alert" style={{ font: "var(--type-caption)", color: "var(--status-danger)" }}>
              {error}
            </span>
          )}
        </div>
      </div>
    </Dialog>
  );
}
