"use client";

import { DownloadControl } from "@/components/DownloadControl";
import { IconButton } from "@/design-system/components/core/IconButton";
import { Tooltip } from "@/design-system/components/core/Tooltip";
import type { ExportTarget } from "@/lib/export";
import type { EditorDoc } from "@/content/templates";
import styles from "./editor.module.css";

export interface SlideStripProps {
  doc: EditorDoc;
  set: (patch: Partial<EditorDoc>) => void;
  /**
   * Resolves the offscreen staging node for a slide at its TRUE canvas size,
   * so every slide can be taken on its own in any single format.
   */
  targetFor: (index: number) => ExportTarget | null;
}

/** Bottom strip: slide chips plus duplicate / delete. */
export function SlideStrip({ doc, set, targetFor }: SlideStripProps) {
  const dup = () => {
    const slides = [...doc.slides];
    slides.splice(doc.active + 1, 0, { ...doc.slides[doc.active] });
    set({ slides, active: doc.active + 1 });
  };

  const del = () => {
    if (doc.slides.length < 2) return;
    set({
      slides: doc.slides.filter((_, i) => i !== doc.active),
      active: Math.max(0, doc.active - 1),
    });
  };

  return (
    <div className={styles.strip}>
      <div className={styles.stripScroll}>
        {doc.slides.map((s, i) => (
          <div key={i} className={styles.stripItem}>
            <button
              type="button"
              onClick={() => set({ active: i })}
              aria-label={`Slide ${i + 1}`}
              aria-pressed={i === doc.active}
              style={{
                cursor: "pointer",
                flex: "none",
                width: "100%",
                height: 48,
                border:
                  "2px solid " +
                  (i === doc.active ? "var(--rule-ink)" : "var(--rule-quiet)"),
                borderRadius: "var(--radius-0)",
                background:
                  s.theme === "plate"
                    ? "var(--cyanotype-900)"
                    : s.theme === "mark"
                      ? "var(--sulphur-400)"
                      : s.theme === "system"
                        ? "var(--verdigris-700)"
                        : "var(--chalk-50)",
                color:
                  s.theme === "chalk" ||
                  s.theme === "field" ||
                  s.theme === "mark"
                    ? "var(--cyanotype-900)"
                    : "var(--chalk-50)",
                font: "var(--type-label)",
                display: "grid",
                placeItems: "center",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
            <DownloadControl
              size="sm"
              label={`slide ${String(i + 1).padStart(2, "0")}`}
              getTarget={() => targetFor(i)}
            />
          </div>
        ))}
      </div>
      <div className={styles.stripActions}>
        <Tooltip label="Duplicate slide">
          <IconButton label="Duplicate slide" variant="outline" onClick={dup}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="9" y="9" width="11" height="11" rx="1" />
              <path d="M5 15V5a1 1 0 0 1 1-1h9" />
            </svg>
          </IconButton>
        </Tooltip>
        <Tooltip label="Delete slide">
          <IconButton
            label="Delete slide"
            variant="outline"
            disabled={doc.slides.length < 2}
            onClick={del}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            </svg>
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
