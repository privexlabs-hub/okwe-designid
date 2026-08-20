import { slugify } from "@/lib/export";
import type { EditorDoc } from "@/content/templates";

/**
 * One naming rule for the whole editor: okwe-knowledge-[series]-[topic].
 * The bulk export, the per-slide controls in the strip and the single-file
 * rows in the export dialog all read from here so a slide keeps the same
 * filename however it was taken.
 */
export function baseName(doc: EditorDoc): string {
  return `okwe-knowledge-${slugify(doc.series)}-${slugify(doc.slides[0]?.title || "")}`;
}

/** okwe-knowledge-[series]-[topic]-slide-NN, 1-based, zero-padded. */
export function slideName(doc: EditorDoc, index: number): string {
  return `${baseName(doc)}-slide-${String(index + 1).padStart(2, "0")}`;
}
