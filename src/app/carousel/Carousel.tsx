"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import { Button } from "@/design-system/components/core/Button";
import { Field } from "@/design-system/components/forms/Field";
import { Input } from "@/design-system/components/forms/Input";
import {
  CAROUSEL_START,
  INTRO,
  slideItems,
  type CarouselDraft,
  type CarouselSlideDraft,
} from "@/content/carousel";
import {
  download,
  ExportError,
  slugify,
  toPdf,
  toPng,
  toZip,
  type ExportTarget,
  type PackagedFile,
} from "@/lib/export";
import { DownloadControl } from "@/components/DownloadControl";
import { useAutosave } from "@/lib/useAutosave";
import styles from "./carousel.module.css";

const PREVIEW_WIDTH = 260;

export function Carousel() {
  const [deck, setDeck] = useState<CarouselDraft>(CAROUSEL_START);
  const [active, setActive] = useState(0);

  /*
   * Keep the working deck in this browser. The staging refs are keyed by slide
   * index, so a restored deck must clear them or an export would capture the
   * previous set.
   */
  useAutosave<CarouselDraft>("carousel", deck, (restored) => {
    stageRefs.current = [];
    setDeck(restored);
  });
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slide = deck.slides[active];
  const canvas = CANVASES.portrait;

  const setSlide = (patch: Partial<CarouselSlideDraft>) =>
    setDeck((d) => ({
      ...d,
      slides: d.slides.map((s, i) => (i === active ? { ...s, ...patch } : s)),
    }));

  const setOption = (i: number, patch: Partial<{ title: string; body: string }>) =>
    setSlide({
      options: (slide.options ?? []).map((o, j) => (j === i ? { ...o, ...patch } : o)),
    });

  const baseName = () =>
    `okwe-knowledge-${slugify(deck.series)}-${slugify(deck.slides[0].title)}`;

  /**
   * One slide's export target. The node comes from the offscreen staging area,
   * which is rendered at the true canvas width, so a single-slide download is
   * the same 1080×1350 asset the batch produces — not the on-screen preview.
   */
  const targetFor = (i: number): ExportTarget | null => {
    const node = stageRefs.current[i];
    if (!node) return null;
    return {
      node,
      width: canvas.w,
      height: canvas.h,
      name: `${baseName()}-slide-${String(i + 1).padStart(2, "0")}`,
    };
  };

  /** Export every slide at true 1080×1350, from the offscreen staging area. */
  async function runExport(mode: "png" | "pdf" | "zip") {
    if (busy) return;
    setBusy(true);
    setStatus({ text: "Preparing…" });
    const base = baseName();

    try {
      const targets: ExportTarget[] = deck.slides.map((s, i) => {
        const t = targetFor(i);
        if (!t) throw new ExportError(`Slide ${i + 1} is not rendered yet — try again.`);
        return t;
      });

      if (mode === "pdf") {
        setStatus({ text: `Rendering ${targets.length} slides…` });
        const pdf = await toPdf(targets);
        download(pdf, `${base}.pdf`);
        setStatus({ text: `${base}.pdf — done. The PDF holds images of the slides, not live text.` });
      } else {
        const files: PackagedFile[] = [];
        for (let i = 0; i < targets.length; i++) {
          setStatus({ text: `Rendering ${i + 1} of ${targets.length}…` });
          files.push({ name: `${targets[i].name}.png`, blob: await toPng(targets[i]) });
        }
        if (mode === "zip") {
          setStatus({ text: "Packaging…" });
          const pdf = await toPdf(targets);
          files.push({ name: `${base}.pdf`, blob: pdf });
          download(await toZip(files), `${base}-package.zip`);
          setStatus({ text: `${base}-package.zip — ${files.length} files.` });
        } else {
          for (const f of files) download(f.blob, f.name);
          setStatus({ text: `${files.length} PNGs at ${canvas.w}×${canvas.h}.` });
        }
      }
    } catch (e) {
      setStatus({
        text: e instanceof ExportError ? e.message : `Export failed: ${(e as Error).message}`,
        error: true,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.code}>{INTRO.code}</div>
        <h1 className={styles.title}>{INTRO.title}</h1>
        <p className={styles.intro}>{INTRO.body}</p>
      </header>

      <div className={styles.work}>
        <div className={styles.deck}>
          {deck.slides.map((s, i) => (
            <div key={i} className={`${styles.slot} ${i === active ? styles.slotOn : ""}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={styles.slotPick}
              >
                <span className={styles.slotMeta}>
                  <span>
                    {String(i + 1).padStart(2, "0")} / {String(deck.slides.length).padStart(2, "0")}
                  </span>
                  <span>{s.kind}</span>
                </span>
                <CarouselSlide
                  kind={s.kind}
                  canvas="portrait"
                  theme={s.theme}
                  index={i + 1}
                  total={deck.slides.length}
                  series={deck.series}
                  issue={deck.issue}
                  date={deck.date}
                  renderWidth={PREVIEW_WIDTH}
                  eyebrow={s.eyebrow}
                  title={s.title}
                  body={s.body}
                  items={slideItems(s)}
                  principle={s.principle}
                  cta={s.cta}
                />
              </button>
              {/* Every slide is individually downloadable, in any format —
                  you never have to take the whole set to get one asset. */}
              <DownloadControl
                size="sm"
                label={`slide ${String(i + 1).padStart(2, "0")}`}
                getTarget={() => targetFor(i)}
              />
            </div>
          ))}
        </div>

        <aside className={styles.editor} aria-label="Slide copy">
          <div className={styles.section}>
            <span className={styles.label}>
              Slide {String(active + 1).padStart(2, "0")} · {slide.kind}
            </span>
            <Field label="Eyebrow" htmlFor="c-eyebrow">
              <Input
                id="c-eyebrow"
                size="sm"
                value={slide.eyebrow ?? ""}
                onChange={(e) => setSlide({ eyebrow: e.target.value })}
              />
            </Field>
            <Field
              label="Headline"
              hint={
                slide.title.length > 62
                  ? "Too long for a phone — cut to 62."
                  : `${slide.title.length}/62 characters`
              }
              htmlFor="c-title"
            >
              <Input
                id="c-title"
                multiline
                rows={2}
                invalid={slide.title.length > 62}
                value={slide.title}
                onChange={(e) => setSlide({ title: e.target.value })}
              />
            </Field>
            {slide.body !== undefined && (
              <Field label="Body" htmlFor="c-body">
                <Input
                  id="c-body"
                  multiline
                  rows={3}
                  value={slide.body}
                  onChange={(e) => setSlide({ body: e.target.value })}
                />
              </Field>
            )}
            {slide.rows && (
              <Field label="Rows" hint="One per line. Five maximum." htmlFor="c-rows">
                <Input
                  id="c-rows"
                  multiline
                  rows={5}
                  value={slide.rows.join("\n")}
                  onChange={(e) => setSlide({ rows: e.target.value.split("\n") })}
                />
              </Field>
            )}
            {slide.options?.map((o, i) => (
              <div key={i} className={styles.section}>
                <Field label={`Option ${String.fromCharCode(65 + i)}`} htmlFor={`c-opt-${i}`}>
                  <Input
                    id={`c-opt-${i}`}
                    size="sm"
                    value={o.title}
                    onChange={(e) => setOption(i, { title: e.target.value })}
                  />
                </Field>
                <Field label="Its verdict" htmlFor={`c-optb-${i}`}>
                  <Input
                    id={`c-optb-${i}`}
                    size="sm"
                    value={o.body}
                    onChange={(e) => setOption(i, { body: e.target.value })}
                  />
                </Field>
              </div>
            ))}
            {slide.principle !== undefined && (
              <Field label="Principle" hint="The closing line." htmlFor="c-principle">
                <Input
                  id="c-principle"
                  multiline
                  rows={2}
                  value={slide.principle}
                  onChange={(e) => setSlide({ principle: e.target.value })}
                />
              </Field>
            )}
            {slide.cta !== undefined && (
              <Field label="Destination" htmlFor="c-cta">
                <Input
                  id="c-cta"
                  size="sm"
                  value={slide.cta}
                  onChange={(e) => setSlide({ cta: e.target.value })}
                />
              </Field>
            )}
          </div>

          <div className={`${styles.section} ${styles.sectionRule}`}>
            <span className={styles.label}>The set</span>
            <Field label="Series" htmlFor="c-series">
              <Input
                id="c-series"
                size="sm"
                value={deck.series}
                onChange={(e) => setDeck((d) => ({ ...d, series: e.target.value }))}
              />
            </Field>
            <Field label="No." htmlFor="c-issue">
              <Input
                id="c-issue"
                size="sm"
                value={deck.issue}
                onChange={(e) => setDeck((d) => ({ ...d, issue: e.target.value }))}
              />
            </Field>
          </div>

          <div className={`${styles.section} ${styles.sectionRule}`}>
            <span className={styles.label}>Export · {canvas.w}×{canvas.h}</span>
            <div className={styles.actions}>
              <Button size="sm" variant="mark" disabled={busy} onClick={() => runExport("zip")}>
                ZIP package
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => runExport("png")}>
                PNGs
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => runExport("pdf")}>
                PDF
              </Button>
            </div>
            {status && (
              <span className={`${styles.status} ${status.error ? styles.statusError : ""}`}>
                {status.text}
              </span>
            )}
          </div>
        </aside>
      </div>

      <footer className={styles.foot}>
        <span>{INTRO.foot}</span>
        <Link href="/">← OPERATING SYSTEM</Link>
      </footer>

      {/* Offscreen staging — the six slides at true canvas width, so an export
          captures 1080×1350 rather than the 260px preview. */}
      <div className={styles.stage} aria-hidden="true">
        {deck.slides.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              stageRefs.current[i] = el;
            }}
            style={{ width: canvas.w }}
          >
            <CarouselSlide
              kind={s.kind}
              canvas="portrait"
              theme={s.theme}
              index={i + 1}
              total={deck.slides.length}
              series={deck.series}
              issue={deck.issue}
              date={deck.date}
              renderWidth={canvas.w}
              eyebrow={s.eyebrow}
              title={s.title}
              body={s.body}
              items={slideItems(s)}
              principle={s.principle}
              cta={s.cta}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
