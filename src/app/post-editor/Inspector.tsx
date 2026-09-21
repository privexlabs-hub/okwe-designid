"use client";

import type { CSSProperties } from "react";
import { Badge } from "@/design-system/components/core/Badge";
import { Field } from "@/design-system/components/forms/Field";
import { Input } from "@/design-system/components/forms/Input";
import { Select } from "@/design-system/components/forms/Select";
import { Switch } from "@/design-system/components/forms/Switch";
import { Checkbox } from "@/design-system/components/forms/Checkbox";
import { CONTENT_TYPES, SERIES, THEMES } from "@/content/templates";
import type { Brand, EditorDoc, Slide } from "@/content/templates";
import { ARM_WORD, IMPRINT_WORD, LOGO_ARMS } from "@/design-system/brand/geometry";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import type { CanvasName } from "@/design-system/components/social/PostCanvas";
import { LEDE_FIT } from "@/design-system/components/social/ArticleCard";
import { activeCanvas, isSized, sizesOf } from "./canvas";
import {
  CRITERIA,
  DATA_KINDS,
  FLOOR,
  ILLUSTRATIVE,
  MAX_TOTAL,
  SCORES,
  THRESHOLD,
  scanText,
  verdictFor,
  type CriterionId,
  type Score,
  type TextField,
} from "@/lib/quality";
import styles from "./editor.module.css";

const LABEL: CSSProperties = {
  font: "var(--type-label)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

/**
 * The marks a canvas can carry: the Okwe Knowledge imprint first (the default),
 * then the three processes read from the process list, then the parent.
 */
const BRANDS = [
  { value: "knowledge", label: `Okwe ${IMPRINT_WORD}` },
  ...LOGO_ARMS.map((arm) => ({ value: arm, label: `Okwe ${ARM_WORD[arm]}` })),
  { value: "okwe", label: "Okwe" },
];

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
  /** Jump to a slide from a language flag. */
  setActive?: (i: number) => void;
  /** Record one criterion. Functional, so rapid clicks do not overwrite each other. */
  onScore?: (id: CriterionId, value: Score) => void;
  doc: EditorDoc;
  slide: Slide;
  set: (patch: Partial<EditorDoc>) => void;
  setSlide: (patch: Partial<Slide>) => void;
}

/** Right rail: piece metadata, the active slide's copy, canvas, quality gate. */
export function Inspector({ doc, slide, set, setSlide, setActive, onScore }: InspectorProps) {
  const chars = (slide.title || "").length;
  // The article header reads Body as its subtitle and draws no principle.
  const article = slide.kind === "article";
  const ledeChars = (slide.body || "").length;

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
        <Field
          label={article ? "Subtitle" : "Body"}
          hint={
            article
              ? ledeChars > LEDE_FIT
                ? `Longer than the share card holds — cut to ${LEDE_FIT}.`
                : `${ledeChars}/${LEDE_FIT} characters`
              : undefined
          }
          htmlFor="bd"
        >
          <Input
            id="bd"
            multiline
            rows={3}
            invalid={article && ledeChars > LEDE_FIT}
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
              onChange={(e) =>
                setSlide({ items: e.target.value.split("\n").slice(0, 5) })
              }
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
        {/* Labelled rows. Same labels the carousel already uses, so the two
            tools speak the same language. */}
        {(slide.kind === "comparison" || slide.kind === "compare") && (
          <>
            {[0, 1].map((i) => (
              <div key={i} className={styles.pair}>
                <Field
                  label={`Option ${String.fromCharCode(65 + i)}`}
                  htmlFor={`opt-${i}`}
                >
                  <Input
                    id={`opt-${i}`}
                    size="sm"
                    value={slide.options?.[i]?.title ?? ""}
                    onChange={(e) => {
                      const next = [...(slide.options ?? [])];
                      next[i] = { ...(next[i] ?? { title: "" }), title: e.target.value };
                      setSlide({ options: next });
                    }}
                  />
                </Field>
                <Field
                  label={slide.kind === "compare" ? "Its value" : "Its verdict"}
                  htmlFor={`optb-${i}`}
                >
                  <Input
                    id={`optb-${i}`}
                    size="sm"
                    value={
                      slide.kind === "compare"
                        ? (slide.options?.[i]?.value ?? "")
                        : (slide.options?.[i]?.body ?? "")
                    }
                    onChange={(e) => {
                      const next = [...(slide.options ?? [])];
                      const row = next[i] ?? { title: "" };
                      next[i] =
                        slide.kind === "compare"
                          ? { ...row, value: e.target.value }
                          : { ...row, body: e.target.value };
                      setSlide({ options: next });
                    }}
                  />
                </Field>
              </div>
            ))}
          </>
        )}

        {slide.kind === "rank" && (
          <Field
            label="Rows"
            hint="One per line, label | value. Eight maximum."
            htmlFor="rk"
          >
            <Input
              id="rk"
              multiline
              rows={5}
              value={(slide.options ?? [])
                .map((o) => (o.value ? `${o.title} | ${o.value}` : o.title))
                .join("\n")}
              onChange={(e) =>
                setSlide({
                  options: e.target.value
                    .split("\n")
                    .slice(0, 8)
                    .map((line) => {
                      const [title, value] = line.split("|");
                      return {
                        title: (title ?? "").trim(),
                        value: value?.trim() || undefined,
                      };
                    }),
                })
              }
            />
          </Field>
        )}

        {slide.kind === "timeline" && (
          <Field
            label="Events"
            hint="One per line, date | label. Six maximum."
            htmlFor="tl"
          >
            <Input
              id="tl"
              multiline
              rows={5}
              value={(slide.events ?? []).map((ev) => `${ev.date} | ${ev.label}`).join("\n")}
              onChange={(e) =>
                setSlide({
                  events: e.target.value
                    .split("\n")
                    .slice(0, 6)
                    .map((line) => {
                      const [date, label] = line.split("|");
                      return { date: (date ?? "").trim(), label: (label ?? "").trim() };
                    }),
                })
              }
            />
          </Field>
        )}

        {needsSource(slide, doc.contentType) && (
          <>
            <Field
              label="Source"
              hint="Required. A data asset does not export without one."
              htmlFor="sc"
            >
              <Input
                id="sc"
                size="sm"
                value={slide.source || ""}
                onChange={(e) => setSlide({ source: e.target.value })}
              />
            </Field>
            {/* The playbook's exact wording for an unmeasured figure. */}
            <Checkbox
              label="This number is illustrative"
              checked={slide.source === ILLUSTRATIVE}
              onChange={(e) =>
                setSlide({
                  source: e.target.checked
                    ? ILLUSTRATIVE
                    : // Only clear what we put there — never clobber a real source.
                      slide.source === ILLUSTRATIVE
                      ? ""
                      : slide.source,
                })
              }
            />
          </>
        )}
        {!article && (
          <Field label="Principle" hint="Optional closing line." htmlFor="pr">
            <Input
              id="pr"
              size="sm"
              value={slide.principle || ""}
              onChange={(e) => setSlide({ principle: e.target.value })}
            />
          </Field>
        )}
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
        {/* Plain selects, never role="group": verify-additions.mjs reads the first
            ten role="group" elements on the page as the score scale. */}
        {isSized(doc) && (
          <>
            <Field
              label="Size"
              hint={sizesOf(doc).find((s) => s.canvas === activeCanvas(doc))?.use}
              htmlFor="sz"
            >
              <Select
                id="sz"
                size="sm"
                options={sizesOf(doc).map((s) => ({
                  value: s.canvas,
                  label: `${CANVASES[s.canvas].w} × ${CANVASES[s.canvas].h}`,
                }))}
                value={activeCanvas(doc)}
                onChange={(e) => set({ size: e.target.value as CanvasName })}
              />
            </Field>
            <Field label="Mark" hint="The mark named in the register foot." htmlFor="brand">
              <Select
                id="brand"
                size="sm"
                options={BRANDS}
                value={doc.brand ?? "knowledge"}
                onChange={(e) => set({ brand: e.target.value as Brand })}
              />
            </Field>
            <Field
              label="Destination"
              hint="Printed in the register foot. Only okweknowledge.com is documented."
              htmlFor="dest"
            >
              <Input
                id="dest"
                size="sm"
                value={doc.destination ?? "okweknowledge.com"}
                onChange={(e) => set({ destination: e.target.value })}
              />
            </Field>
          </>
        )}
        <Field
          label="Image"
          hint="Not wired up. Photography is placed in the thumbnail template."
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
        {/* The four automatic checks. Their rendered strings — including
            "Publishing threshold" and "N / 4" — are asserted verbatim by
            scripts/verify-interactions.mjs. Do not reword them. */}
        <span style={LABEL}>Automatic checks</span>
        <QualityGate doc={doc} slide={slide} />
      </div>

      <div style={SECTION_RULED}>
        <span style={LABEL}>Editorial score</span>
        <EditorialScore doc={doc} onScore={onScore ?? (() => {})} />
      </div>

      <div style={SECTION_RULED}>
        <span style={LABEL}>Language</span>
        <LanguageFlags doc={doc} setActive={setActive ?? (() => {})} />
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

/* ------------------------------------------------------------------------ */
/* The editorial score.                                                      */
/*                                                                           */
/* `voice-and-writing`: score 0-5 on ten criteria; publish at 35/50 with     */
/* nothing below 3; accuracy or evidence below 3 is a hard stop whatever the */
/* total. Below threshold "it becomes research, not a post."                 */
/* ------------------------------------------------------------------------ */

function ScoreRow({
  id,
  label,
  value,
  onPick,
}: {
  id: CriterionId;
  label: string;
  value: Score | undefined;
  onPick: (score: Score) => void;
}) {
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreScale} role="group" aria-label={label}>
        {SCORES.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            aria-label={`${label}: ${n}`}
            className={`${styles.scoreDot} ${value === n ? styles.scoreDotOn : ""}`}
            onClick={() => onPick(n)}
          >
            {n}
          </button>
        ))}
        <span className={styles.scoreValue}>{value === undefined ? "—" : value}</span>
      </div>
      <input type="hidden" name={id} value={value ?? ""} readOnly />
    </div>
  );
}

export function EditorialScore({
  doc,
  onScore,
}: {
  doc: EditorDoc;
  /**
   * Functional on purpose. A patch built from the render-scope `score` would
   * lose every earlier click in the same tick, because ten clicks before a
   * re-render all compute from the same stale base.
   */
  onScore: (id: CriterionId, value: Score) => void;
}) {
  const score = doc.score ?? {};
  const v = verdictFor(score);

  return (
    <div className={styles.scoreBlock}>
      {CRITERIA.map((c) => (
        <ScoreRow
          key={c.id}
          id={c.id}
          label={c.label}
          value={score[c.id]}
          onPick={(n) => onScore(c.id, n)}
        />
      ))}

      <div className={`${styles.scoreTotal} ${v.meetsThreshold ? styles.scoreTotalClear : ""}`}>
        <span>Publishing score</span>
        <span>
          {v.total} / {MAX_TOTAL}
        </span>
      </div>

      {v.unscored.length > 0 && (
        <p className={styles.scoreNote}>
          {v.unscored.length} of {CRITERIA.length} criteria are unscored. A piece nobody scored is a
          piece nobody owns.
        </p>
      )}
      {v.hardStop.length > 0 && (
        <p className={styles.scoreNote}>
          {v.hardStop.map((id) => CRITERIA.find((c) => c.id === id)?.label).join(" and ")} below{" "}
          {FLOOR} is a hard stop, whatever the total.
        </p>
      )}
      {v.unscored.length === 0 && !v.meetsThreshold && v.total < THRESHOLD && (
        <p className={styles.scoreNote}>Below threshold — this is research, not a post.</p>
      )}
    </div>
  );
}

/** Every text field of every slide, flattened for the language scan. */
export function deckFields(doc: EditorDoc): TextField[] {
  const out: TextField[] = [];
  doc.slides.forEach((slide, i) => {
    (["eyebrow", "title", "body", "principle", "cta"] as const).forEach((field) => {
      // An article header draws neither; scanning them would flag words that
      // are not on the asset.
      if (slide.kind === "article" && (field === "principle" || field === "cta")) return;
      const text = slide[field];
      if (typeof text === "string" && text) out.push({ slide: i, field, text });
    });
  });
  return out;
}

export function LanguageFlags({
  doc,
  setActive,
}: {
  doc: EditorDoc;
  setActive: (i: number) => void;
}) {
  const flags = scanText(deckFields(doc));
  if (flags.length === 0) {
    return <p className={styles.scoreNote}>Nothing flagged.</p>;
  }
  return (
    <div className={styles.flagList}>
      {flags.map((f, i) => (
        <button
          key={`${f.slide}-${f.field}-${f.detail}-${i}`}
          type="button"
          className={styles.flagRow}
          onClick={() => setActive(f.slide)}
        >
          <span className={styles.flagWhere}>
            SLIDE {String(f.slide + 1).padStart(2, "0")} · {f.field.toUpperCase()}
          </span>
          <span className={styles.flagWhat}>{f.detail}</span>
        </button>
      ))}
    </div>
  );
}

/** True when this slide publishes a figure and therefore owes a source line. */
export function needsSource(slide: Slide, contentType: string): boolean {
  return (
    (DATA_KINDS as readonly string[]).includes(slide.kind) || contentType === "Numbers"
  );
}

