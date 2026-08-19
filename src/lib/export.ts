"use client";

/**
 * Client-side asset export: PNG / JPG / PDF / ZIP.
 *
 * The source prototype specified this and left it unimplemented — its README
 * says "one export library away — the canvas is already a single DOM node per
 * asset at true pixel size". That is exactly the shape this uses.
 *
 * Everything here is dynamically imported so html-to-image, jsPDF and JSZip
 * stay out of the initial page bundle; they only load when someone exports.
 */

/** Baseline: canvases are authored at 1080px wide and rendered smaller on screen. */
export type ExportFormat = "png" | "jpg" | "pdf" | "svg" | "zip";

export interface ExportTarget {
  /** The DOM node holding one asset, rendered at `renderWidth`. */
  node: HTMLElement;
  /** True pixel width of the asset (e.g. 1080). */
  width: number;
  /** True pixel height of the asset (e.g. 1350). */
  height: number;
  /** File name without extension. */
  name: string;
}

/**
 * Mobile Safari throws or silently returns a blank canvas past roughly 16.7M
 * pixels. Refuse loudly rather than handing back an empty image.
 */
const MAX_PIXELS = 16_777_216;

export class ExportError extends Error {}

function assertWithinCanvasLimits(width: number, height: number, scale: number) {
  const px = width * scale * height * scale;
  if (px > MAX_PIXELS) {
    throw new ExportError(
      `${width}×${height} at ${scale}× is ${(px / 1e6).toFixed(1)} megapixels, over the ` +
        `${(MAX_PIXELS / 1e6).toFixed(1)} MP browser canvas limit. Export at 1× instead.`,
    );
  }
}

/**
 * Webfonts do not survive rasterisation on their own — the snapshot is an
 * isolated document with no access to the page's font-face rules. Without this
 * every exported asset silently loses the width contrast the whole identity
 * rests on, so the embed CSS is computed once and reused for every asset.
 */
let fontEmbedCache: string | null = null;

export async function getFontEmbedCss(node: HTMLElement): Promise<string> {
  if (fontEmbedCache !== null) return fontEmbedCache;
  const { getFontEmbedCSS } = await import("html-to-image");
  // Fonts are same-origin, so this never taints the canvas.
  fontEmbedCache = await getFontEmbedCSS(node, { preferredFontFormat: "woff2" });
  return fontEmbedCache;
}

/** Wait for fonts, then let the browser settle one frame before capturing. */
async function settle() {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
}

interface RasterOptions {
  /** 1 = native canvas size, 2 = retina/print. */
  scale?: number;
  quality?: number;
}

/**
 * Rasterise one asset node at its true pixel size.
 *
 * The node is rendered on screen at `renderWidth`, so it is scaled back up to
 * the canvas's real dimensions rather than captured at preview resolution.
 */
async function rasterise(
  target: ExportTarget,
  type: "png" | "jpg",
  { scale = 1, quality = 0.94 }: RasterOptions = {},
): Promise<Blob> {
  assertWithinCanvasLimits(target.width, target.height, scale);
  await settle();

  const { toBlob } = await import("html-to-image");
  const fontEmbedCSS = await getFontEmbedCss(target.node);

  const rendered = target.node.getBoundingClientRect().width;
  const ratio = rendered > 0 ? target.width / rendered : 1;

  const blob = await toBlob(target.node, {
    type: type === "png" ? "image/png" : "image/jpeg",
    quality,
    fontEmbedCSS,
    cacheBust: false,
    pixelRatio: ratio * scale,
    // JPG has no alpha; give it the chalk ground rather than black.
    backgroundColor: type === "jpg" ? "#E6EAE7" : undefined,
    width: rendered,
    height: target.node.getBoundingClientRect().height,
  });

  if (!blob || blob.size === 0) {
    throw new ExportError(
      `${target.name}: the browser produced an empty image. This usually means the ` +
        `canvas exceeded a memory limit — try 1× resolution.`,
    );
  }
  return blob;
}

export const toPng = (t: ExportTarget, o?: RasterOptions) => rasterise(t, "png", o);
export const toJpg = (t: ExportTarget, o?: RasterOptions) => rasterise(t, "jpg", o);

/**
 * Combined PDF, one page per asset, each page sized to the asset.
 *
 * NOTE: this wraps the raster image. The text in the PDF is an image of text —
 * it is not selectable or searchable. A vector PDF would need the type
 * re-laid-out by a PDF engine, which is a different job.
 */
export async function toPdf(targets: ExportTarget[], o?: RasterOptions): Promise<Blob> {
  if (!targets.length) throw new ExportError("Nothing to export.");
  const { jsPDF } = await import("jspdf");

  let pdf: import("jspdf").jsPDF | null = null;
  for (const t of targets) {
    const blob = await rasterise(t, "png", o);
    const dataUrl = await blobToDataUrl(blob);
    const orientation = t.width >= t.height ? "landscape" : "portrait";
    if (!pdf) {
      pdf = new jsPDF({ orientation, unit: "px", format: [t.width, t.height], compress: true });
    } else {
      pdf.addPage([t.width, t.height], orientation);
    }
    pdf.addImage(dataUrl, "PNG", 0, 0, t.width, t.height, undefined, "FAST");
  }
  return pdf!.output("blob");
}

/** SVG export: type and rules only, as the source's export dialog describes it. */
export async function toSvgString(target: ExportTarget): Promise<string> {
  await settle();
  const { toSvg } = await import("html-to-image");
  const fontEmbedCSS = await getFontEmbedCss(target.node);
  const dataUrl = await toSvg(target.node, { fontEmbedCSS, cacheBust: false });
  return decodeURIComponent(dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ""));
}

export interface PackagedFile {
  name: string;
  blob: Blob;
}

/** ZIP with STORE — PNG, JPG and PDF are already compressed, so deflate only costs time. */
export async function toZip(files: PackagedFile[]): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new ExportError("Could not read the rendered image."));
    fr.readAsDataURL(blob);
  });
}

/** Hand a blob to the user as a download. */
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** okwe-knowledge-[series]-[topic]-slide-NN — the naming system from the source. */
export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
