"use client";

import type { CSSProperties } from "react";
import { Badge } from "@/design-system/components/core/Badge";
import { Field } from "@/design-system/components/forms/Field";
import { Input } from "@/design-system/components/forms/Input";
import { Select } from "@/design-system/components/forms/Select";
import { Switch } from "@/design-system/components/forms/Switch";
import { CONTENT_TYPES, SERIES, THEMES } from "@/content/templates";
import type { EditorDoc, Slide } from "@/content/templates";
import styles from "./editor.module.css";

const LABEL: CSSProperties = {
  font: "var(--type-label)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const SECTION: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
};

const SECTION_RULED: CSSProperties = {
  ...SECTION,
  borderTop: "1px solid var(--rule-quiet)",
  paddingTop: "var(--space-5)",
};

export interface InspectorProps {
  doc: EditorDoc;
  slide: Slide;
  set: (patch: Partial<EditorDoc>) => void;
  setSlide: (patch: Partial<Slide>) => void;
}

/** Right rail: piece metadata, the active slide's copy, canvas, quality gate. */
export function Inspector({ doc, slide, set, setSlide }: InspectorProps) {
  const chars = (slide.title || "").length;

  return (
    <aside aria-label="Inspector" className={styles.inspector}>
      <div style={SECTION}>
        <span style={LABEL}>Piece</span>
        <Field label="Series" htmlFor="series">
          <Select
            id="series"
            options={SERIES}
            value={doc.series}
            onChange={(e) => set({ series: e.target.value })}
          />
        </Field>
        <div className={styles.pair}>
          <Field label="No." htmlFor="no">
            <Input
              id="no"
              size="sm"
              value={doc.issue}
              onChange={(e) => set({ issue: e.target.value })}
            />
          </Field>
          <Field label="Type" htmlFor="ct">
            <Select
              id="ct"
              size="sm"
              options={CONTENT_TYPES}
              value={doc.contentType}
              onChange={(e) => set({ contentType: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div style={SECTION_RULED}>
        <span style={LABEL}>Slide {doc.active + 1}</span>
        <Field label="Eyebrow" htmlFor="eb">
          <Input
            id="eb"
            size="sm"
            value={slide.eyebrow || ""}
            onChange={(e) => setSlide({ eyebrow: e.target.value })}
          />
        </Field>
        <Field
          label="Headline"
          hint={
            chars > 62
              ? "Too long for a phone — cut to 62."
              : `${chars}/62 characters`
          }
          htmlFor="hl"
        >
          <Input
            id="hl"
            multiline
            rows={2}
            invalid={chars > 62}
            value={slide.title || ""}
            onChange={(e) => setSlide({ title: e.target.value })}
          />
        </Field>
        <Field label="Body" htmlFor="bd">
          <Input
            id="bd"
            multiline
            rows={3}
            value={slide.body || ""}
            onChange={(e) => setSlide({ body: e.target.value })}
          />
        </Field>
        {slide.items && (
          <Field label="Rows" hint="One per line. Five maximum." htmlFor="it">
            <Input
              id="it"
              multiline
              rows={5}
              value={slide.items.join("\n")}
              onChange={(e) => setSlide({ items: e.target.value.split("\n") })}
            />
          </Field>
        )}
        {slide.kind === "stat" && (
          <div className={styles.pair}>
            <Field label="Figure" htmlFor="fg">
              <Input
                id="fg"
                size="sm"
                value={slide.figure || ""}
                onChange={(e) => setSlide({ figure: e.target.value })}
              />
            </Field>
            <Field label="Unit" htmlFor="un">
              <Input
                id="un"
                size="sm"
                value={slide.unit || ""}
                onChange={(e) => setSlide({ unit: e.target.value })}
              />
            </Field>
          </div>
        )}
        {(slide.kind === "stat" || doc.contentType === "Numbers") && (
          <Field
            label="Source"
            hint="Required. Say so if illustrative."
            htmlFor="sc"
          >
            <Input
              id="sc"
              size="sm"
              value={slide.source || ""}
              onChange={(e) => setSlide({ source: e.target.value })}
            />
          </Field>
        )}
        <Field label="Principle" hint="Optional closing line." htmlFor="pr">
          <Input
            id="pr"
            size="sm"
            value={slide.principle || ""}
            onChange={(e) => setSlide({ principle: e.target.value })}
          />
        </Field>
      </div>

      <div style={SECTION_RULED}>
        <span style={LABEL}>Canvas</span>
        <div
          style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => setSlide({ theme: t.id })}
              aria-label={t.label}
              aria-pressed={slide.theme === t.id}
              style={{
                width: 32,
                height: 32,
                cursor: "pointer",
                borderRadius: "var(--radius-0)",
                border:
                  "2px solid " +
                  (slide.theme === t.id
                    ? "var(--rule-ink)"
                    : "var(--rule-quiet)"),
                background:
                  t.id === "plate"
                    ? "var(--cyanotype-900)"
                    : t.id === "system"
                      ? "var(--verdigris-700)"
                      : t.id === "mark"
                        ? "var(--sulphur-400)"
                        : t.id === "field"
                          ? "var(--chalk-50)"
                          : "var(--chalk-100)",
              }}
            />
          ))}
        </div>
        <Field
          label="Image"
          hint="Drop a photograph — right third on thumbnails."
          htmlFor="im"
        >
          <div
            id="im"
            style={{
              height: 64,
              border: "1px dashed var(--rule-quiet)",
              borderRadius: "var(--radius-0)",
              display: "grid",
              placeItems: "center",
              font: "var(--type-caption)",
              color: "var(--text-muted)",
              background: "var(--surface-inset)",
            }}
          >
            No image · optional
          </div>
        </Field>
        <Switch
          label="Show safe zones"
          checked={doc.safe}
          onChange={(e) => set({ safe: e.target.checked })}
        />
      </div>

      <div style={SECTION_RULED}>
        <span style={LABEL}>Quality gate</span>
        <QualityGate doc={doc} slide={slide} />
      </div>
    </aside>
  );
}

function QualityGate({ doc, slide }: { doc: EditorDoc; slide: Slide }) {
  const checks = [
    {
      label: "Teaches one idea",
      ok: (slide.title || "").length > 0 && (slide.title || "").length <= 62,
    },
    {
      label: "Claim has a source",
      ok: !!slide.source || doc.contentType !== "Numbers",
    },
    {
      label: "Plain language",
      ok: !/leverage|synergy|utili[sz]e/i.test(slide.body || ""),
    },
    { label: "Series set", ok: !!doc.series },
  ];
  const score = checks.filter((c) => c.ok).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {checks.map((c) => (
        <div
          key={c.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            font: "var(--type-body-sm)",
            color: "var(--text-secondary)",
          }}
        >
          <span>{c.label}</span>
          <Badge tone={c.ok ? "fact" : "unknown"}>
            {c.ok ? "Pass" : "Check"}
          </Badge>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid var(--rule-quiet)",
          paddingTop: "var(--space-3)",
          font: "var(--type-data)",
          // The source wrote `var(--fact)`, which is not a defined token; the
          // real one is `--class-fact`.
          color: score === 4 ? "var(--class-fact)" : "var(--text-muted)",
        }}
      >
        <span>Publishing threshold</span>
        <span>{score} / 4</span>
      </div>
    </div>
  );
}
