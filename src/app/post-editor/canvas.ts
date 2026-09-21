import type { CanvasName } from "@/design-system/components/social/PostCanvas";
import type { EditorDoc, TemplateSize } from "@/content/templates";

/**
 * The only readers of a document's size.
 *
 * Every template except the article header has one size — its `canvas` — so a
 * document written before sizes existed reads exactly as it always did.
 */
export function sizesOf(doc: EditorDoc): TemplateSize[] {
  return doc.template.sizes?.length
    ? doc.template.sizes
    : [{ canvas: doc.template.canvas, use: doc.template.platform }];
}

/** The size on the stage. A stale or foreign size falls back to the template's own canvas. */
export function activeCanvas(doc: EditorDoc): CanvasName {
  return doc.size && sizesOf(doc).some((s) => s.canvas === doc.size)
    ? doc.size
    : doc.template.canvas;
}

/** More than one size: the editor shows the size switch and names files by size. */
export function isSized(doc: EditorDoc): boolean {
  return (doc.template.sizes?.length ?? 0) > 1;
}
