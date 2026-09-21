import { slugify } from "@/lib/export";
import { brandWord } from "@/design-system/brand/geometry";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import type { CanvasName } from "@/design-system/components/social/PostCanvas";
import type { EditorDoc } from "@/content/templates";
import { isSized } from "./canvas";

/**
 * One naming rule for the whole editor: okwe-knowledge-[series]-[topic].
 * The bulk export, the per-slide controls in the strip and the single-file
 * rows in the export dialog all read from here so a slide keeps the same
 * filename however it was taken.
 */

/**
 * okwe-knowledge by default — the imprint, and the documented naming pattern.
 * okwe-knows, okwe-coms or okwe-move for a process; okwe for the parent.
 */
export function brandPrefix(doc: EditorDoc): string {
  const word = brandWord(doc.brand ?? "knowledge");
  return word ? `okwe-${slugify(word)}` : "okwe";
}

export function baseName(doc: EditorDoc): string {
  return `${brandPrefix(doc)}-${slugify(doc.series)}-${slugify(doc.slides[0]?.title || "")}`;
}

/** okwe-knowledge-[series]-[topic]-slide-NN, 1-based, zero-padded. */
export function slideName(doc: EditorDoc, index: number): string {
  return `${baseName(doc)}-slide-${String(index + 1).padStart(2, "0")}`;
}

/**
 * The file name for one slide at one size.
 *
 * A template with one size keeps `slideName` exactly. A template that leaves in
 * several sizes appends -WxH, so four sizes of the same slide never overwrite
 * each other in a download folder or a ZIP.
 */
export function assetName(doc: EditorDoc, index: number, canvas: CanvasName): string {
  const name = slideName(doc, index);
  if (!isSized(doc)) return name;
  const c = CANVASES[canvas];
  return `${name}-${c.w}x${c.h}`;
}
