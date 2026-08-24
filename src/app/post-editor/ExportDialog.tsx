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
  exportOne,
  toJpg,
  toPdf,
  toPng,
  toSvgString,
  toZip,
} from "@/lib/export";
import type { ExportTarget, SingleFormat } from "@/lib/export";
import type { EditorDoc } from "@/content/templates";
import { blockedReasons, scanText, verdictFor } from "@/lib/quality";
import { deckFields } from "./Inspector";
import { baseName, slideName } from "./naming";
import styles from "./editor.module.css";

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
  /** One slide as an export target, at its true canvas size. */
  targetFor: (index: number) => ExportTarget | null;
}

export function ExportDialog({
  doc,
  onClose,
  getNodes,
  targetFor,
}: ExportDialogProps) {
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
  const [one, setOne] = useState("");
  const [override, setOverride] = useState(false);

  /*
   * The gate.
   *
   * One rule refuses: "no data template renders without a source field filled."
   * Everything else warns and lets a human take responsibility — the playbook
   * frames the score as an editorial act, not an automated lock.
   */
  const reasons = blockedReasons({
    slides: doc.slides,
    contentType: doc.contentType,
  });
  const flags = scanText(deckFields(doc));
  const verdict = verdictFor(doc.score ?? {});
  const warns = !verdict.meetsThreshold || flags.length > 0;
  const gateHolds = reasons.length > 0 || (warns && !override);

  const base = baseName(doc);
  const name = (i: number) => slideName(doc, i);

  /**
   * Exactly the files the Export button will produce, in the order it makes
   * them — and each one is individually downloadable from its own row.
   */
  const files: { name: string; slide: number | null; format: SingleFormat }[] =
    [];
  doc.slides.forEach((_, i) => {
    if (fmt.png)
      files.push({ name: `${name(i)}.png`, slide: i, format: "png" });
    if (fmt.jpg)
      files.push({ name: `${name(i)}.jpg`, slide: i, format: "jpg" });
    if (fmt.svg)
      files.push({ name: `${name(i)}.svg`, slide: i, format: "svg" });
  });
  if (fmt.pdf) files.push({ name: `${base}.pdf`, slide: null, format: "pdf" });
  const names = files.map((f) => f.name);
  const delivered =
    fmt.zip && names.length > 0 ? [`${base}-package.zip`] : names;

  const px = () => Math.max(1, SCALES.indexOf(scale) + 1);

  /** Take one listed file on its own, leaving the batch flow untouched. */
  async function runOne(file: {
    name: string;
    slide: number | null;
    format: SingleFormat;
  }) {
    setError("");
    setOne(file.name);
    try {
      if (file.slide === null) {
        // The combined PDF spans every slide, so it is built from all targets.
        const targets = doc.slides
          .map((_, i) => targetFor(i))
          .filter((t): t is ExportTarget => t !== null);
        if (!targets.length)
          throw new ExportError("Nothing was rendered to export.");
        download(await toPdf(targets, { scale: px() }), file.name);
      } else {
        const target = targetFor(file.slide);
        if (!target) throw new ExportError("That slide is not rendered yet.");
        const packaged = await exportOne(target, file.format, { scale: px() });
        download(packaged.blob, packaged.name);
      }
    } catch (e) {
      setError(
        e instanceof ExportError
          ? e.message
          : `Export failed: ${(e as Error).message}`,
      );
    } finally {
      setOne("");
    }
  }

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
          targets.push({ node, width: spec.w, height: spec.h, name: name(i) });
        }
      });
      if (!targets.length)
        throw new ExportError("Nothing was rendered to export.");

      const px = Math.max(1, SCALES.indexOf(scale) + 1);
      const out: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < targets.length; i++) {
        setProgress(`Exporting ${i + 1} of ${targets.length}…`);
        const t = targets[i];
        if (fmt.png)
          out.push({
            name: `${t.name}.png`,
            blob: await toPng(t, { scale: px }),
          });
        if (fmt.jpg)
          out.push({
            name: `${t.name}.jpg`,
            blob: await toJpg(t, { scale: px }),
          });
        if (fmt.svg) {
          const svg = await toSvgString(t);
          out.push({
            name: `${t.name}.svg`,
            blob: new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
          });
        }
      }

      if (fmt.pdf) {
        setProgress("Building the PDF…");
        out.push({
          name: `${base}.pdf`,
          blob: await toPdf(targets, { scale: px }),
        });
      }

      if (!out.length) throw new ExportError("Choose at least one format.");

      if (fmt.zip) {
        setProgress("Packaging…");
        download(await toZip(out), `${base}-package.zip`);
      } else {
        for (const f of out) download(f.blob, f.name);
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
          <Button
            variant="mark"
            onClick={run}
            disabled={busy || delivered.length === 0 || gateHolds}
          >
            {busy
              ? progress || "Exporting…"
              : `Export ${delivered.length} files`}
          </Button>
        </>
      }
    >
      {reasons.length > 0 ? (
        <div className={styles.gateBlock}>
          <span className={styles.gateHeading}>Cannot export</span>
          {reasons.map((r) => (
            <p key={r} className={styles.gateReason}>
              {r}
            </p>
          ))}
          <p className={styles.gateNote}>
            Every data asset carries a source line. If the number is not measured, tick “this
            number is illustrative” in the inspector.
          </p>
        </div>
      ) : warns ? (
        <div className={styles.gateBlock}>
          <span className={styles.gateHeading}>Warnings</span>
          {!verdict.meetsThreshold && (
            <p className={styles.gateReason}>
              {verdict.unscored.length > 0
                ? `${verdict.unscored.length} of 10 criteria are unscored.`
                : verdict.hardStop.length > 0
                  ? "Accuracy or evidence is below 3 — a hard stop."
                  : `Editorial score ${verdict.total} / 50, below the 35 threshold.`}
            </p>
          )}
          {flags.map((f, i) => (
            <p key={`${f.slide}-${f.detail}-${i}`} className={styles.gateReason}>
              Slide {String(f.slide + 1).padStart(2, "0")} · {f.field} — {f.detail}
            </p>
          ))}
          <Checkbox
            label="Export anyway — I own this decision."
            checked={override}
            onChange={(e) => setOverride(e.target.checked)}
          />
        </div>
      ) : (
        <p className={styles.gateClear}>Clears the gate.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-7)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
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
          <Checkbox
            label="PNG — every slide"
            checked={fmt.png}
            onChange={() => toggle("png")}
          />
          <Checkbox
            label="JPG — every slide"
            checked={fmt.jpg}
            onChange={() => toggle("jpg")}
          />
          <Checkbox
            label="PDF — combined"
            checked={fmt.pdf}
            onChange={() => toggle("pdf")}
          />
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
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
            {files.length === 0 ? (
              <span>Choose a format.</span>
            ) : (
              files.map((f) => (
                <div key={f.name} className={styles.fileRow}>
                  <span className={styles.fileName}>{f.name}</span>
                  <button
                    type="button"
                    className={styles.fileButton}
                    onClick={() => runOne(f)}
                    disabled={busy || one !== ""}
                    aria-label={`Download ${f.name} on its own`}
                  >
                    {one === f.name ? "…" : "Get"}
                  </button>
                </div>
              ))
            )}
          </div>
          <span
            style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}
          >
            Any single file can be taken on its own with <b>Get</b>. Names
            follow <b>okwe-knowledge-[series]-[topic]-slide-NN</b>. Files are
            rendered in the browser and downloaded straight to this device —
            with ZIP checked they arrive as one archive. The PDF is a raster
            image of each slide, so its text is not selectable.
          </span>
          {error && (
            <span
              role="alert"
              style={{
                font: "var(--type-caption)",
                color: "var(--status-danger)",
              }}
            >
              {error}
            </span>
          )}
        </div>
      </div>
    </Dialog>
  );
}
