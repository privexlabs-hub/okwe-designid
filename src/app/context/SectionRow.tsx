"use client";

import { Button } from "@/design-system/components/core/Button";
import { Checkbox } from "@/design-system/components/forms/Checkbox";
import type { PackSection } from "@/lib/pack";
import s from "./context.module.css";

export type CopyState = "idle" | "copied" | "manual";

export interface SectionRowProps {
  section: PackSection;
  selected: boolean;
  copyState: CopyState;
  onToggle: () => void;
  onCopy: () => void;
}

/**
 * One row of the pack ledger.
 *
 * A register entry, not a card: a hairline opens it, the index number sits in
 * the rail, the file facts sit in the annotation margin, and the text itself
 * scrolls inside its own box so a Markdown table keeps its columns.
 */
export function SectionRow({ section, selected, copyState, onToggle, onCopy }: SectionRowProps) {
  const chars = section.markdown.length;
  const label = copyState === "copied" ? "Copied" : copyState === "manual" ? "Select it" : "Copy";

  return (
    <div className={s.row}>
      <div className={s.rail}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          aria-label={`Include ${section.title} in the pack`}
        />
        <span className={s.num}>{section.num}</span>
      </div>

      <div className={s.field}>
        <h3 className={s.title}>{section.title}</h3>
        <p className={s.note}>{section.note}</p>
        {/* Focusable: a scroll box a keyboard cannot reach is a table a
            keyboard cannot read. */}
        <pre
          className={`okwe-scroll-x ${s.preview}`}
          tabIndex={0}
          role="region"
          aria-label={`${section.title} — Markdown source`}
        >
          {section.markdown}
        </pre>
      </div>

      <div className={s.margin}>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {label}
        </Button>
        <span className={s.meta}>{chars.toLocaleString()} chars</span>
        <span className={s.meta}>{section.source}</span>
      </div>
    </div>
  );
}
