"use client";

import { Badge } from "@/design-system/components/core/Badge";
import { Button } from "@/design-system/components/core/Button";
import { Logo } from "@/design-system/components/brand/Logo";
import type { EditorDoc } from "@/content/templates";
import styles from "./editor.module.css";

export interface TopBarProps {
  doc: EditorDoc;
  onExport: () => void;
  onSaveTemplate: () => void;
  onOpenShelf: () => void;
  onPreview: () => void;
  saved: boolean;
  /** Opens the template rail once it has folded into a drawer (<1100px). */
  onToggleRail: () => void;
  railOpen: boolean;
}

export function TopBar({
  doc,
  onExport,
  onSaveTemplate,
  onOpenShelf,
  onPreview,
  saved,
  onToggleRail,
  railOpen,
}: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <span className={styles.railToggle}>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleRail}
            aria-expanded={railOpen}
            aria-controls="template-rail"
          >
            Templates
          </Button>
        </span>
        <Logo variant="horizontal" size={15} knowledge={false} />
        <span
          className={`okwe-label ${styles.hideOnPhone}`}
          style={{ color: "var(--text-muted)" }}
        >
          POST EDITOR
        </span>
        <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
          {doc.template.code}
        </span>
        <span className={styles.hideOnPhone}>
          <Badge tone="interpretation">Draft</Badge>
        </span>
      </div>
      <div className={styles.topBarRight}>
        {saved && <Badge tone="fact">Template saved</Badge>}
        <span className={styles.hideOnPhone}>
          <Button variant="ghost" size="sm" onClick={onOpenShelf}>
            Drafts
          </Button>
        </span>
        <span className={styles.hideOnPhone}>
          <Button variant="ghost" size="sm" onClick={onSaveTemplate}>
            Save as template
          </Button>
        </span>
        <Button variant="outline" size="sm" onClick={onPreview}>
          Preview
        </Button>
        <Button variant="mark" size="sm" onClick={onExport}>
          Export
        </Button>
      </div>
    </header>
  );
}
