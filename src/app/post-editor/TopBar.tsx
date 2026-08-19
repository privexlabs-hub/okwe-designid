"use client";

import { Badge } from "@/design-system/components/core/Badge";
import { Button } from "@/design-system/components/core/Button";
import { Logo } from "@/design-system/components/brand/Logo";
import type { EditorDoc } from "@/content/templates";

export interface TopBarProps {
  doc: EditorDoc;
  onExport: () => void;
  onSaveTemplate: () => void;
  onPreview: () => void;
  saved: boolean;
}

export function TopBar({ doc, onExport, onSaveTemplate, onPreview, saved }: TopBarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-7)",
        padding: "var(--space-4) var(--space-7)",
        borderBottom: "1px solid var(--rule-quiet)",
        background: "var(--surface-field)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)" }}>
        <Logo variant="horizontal" size={15} knowledge={false} />
        <span className="okwe-label" style={{ color: "var(--text-muted)" }}>
          POST EDITOR
        </span>
        <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
          {doc.template.code}
        </span>
        <Badge tone="interpretation">Draft</Badge>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        {saved && <Badge tone="fact">Template saved</Badge>}
        <Button variant="ghost" size="sm" onClick={onSaveTemplate}>
          Save as template
        </Button>
        <Button variant="outline" size="sm" onClick={onPreview}>
          Preview in feed
        </Button>
        <Button variant="mark" size="sm" onClick={onExport}>
          Export
        </Button>
      </div>
    </header>
  );
}
