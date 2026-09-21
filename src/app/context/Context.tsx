"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/design-system/components/core/Button";
import { Badge } from "@/design-system/components/core/Badge";
import { CONTEXT_INTRO } from "@/content/context";
import { copyText } from "@/lib/clipboard";
import { downloadText } from "@/lib/export";
import { buildPack, joinPack } from "@/lib/pack";
import { SectionRow, type CopyState } from "./SectionRow";
import s from "./context.module.css";

/** OKW-CTX-01 — the brand, as text a model can read. */
export function Context() {
  /* Built in the render body, not lazily. The converter throws on a tag it
     does not handle, and a build that fails is better than a page that ships
     empty — under `output: "export"` this first pass runs at build time, so a
     malformed corpus never reaches a browser. `useMemo` still runs during that
     render; it only stops the 61 KB of HTML being re-converted on every
     checkbox click. */
  const sections = useMemo(() => buildPack(), []);

  const [selected, setSelected] = useState<string[]>(() => sections.map((x) => x.id));
  const [copied, setCopied] = useState<Record<string, CopyState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const chosen = useMemo(
    () => sections.filter((x) => selected.includes(x.id)),
    [sections, selected],
  );
  const composed = useMemo(() => joinPack(chosen), [chosen]);

  const flash = (key: string, state: CopyState) => {
    clearTimeout(timers.current[key]);
    setCopied((c) => ({ ...c, [key]: state }));
    timers.current[key] = setTimeout(
      () => setCopied((c) => ({ ...c, [key]: "idle" })),
      2000,
    );
  };

  const copy = async (key: string, text: string) => {
    flash(key, (await copyText(text)) ? "copied" : "manual");
  };

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const chars = composed.length;
  const allLabel =
    copied.all === "copied" ? "Copied" : copied.all === "manual" ? "Copy blocked" : "Copy selected";

  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link href="/" className={`okwe-block-link ${s.back}`}>
          ← Operating system
        </Link>
        <span className={s.eyebrow}>{CONTEXT_INTRO.code} · Brand context</span>
        <h1>{CONTEXT_INTRO.title}</h1>
        <p className={s.lede}>{CONTEXT_INTRO.lede}</p>

        <div className={s.actions}>
          <Button
            variant="mark"
            onClick={() => copy("all", composed)}
            disabled={chosen.length === 0}
          >
            {allLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadText(composed, "okwe-brand-context.md")}
            disabled={chosen.length === 0}
          >
            Download .md
          </Button>
          <Button variant="ghost" onClick={() => setSelected(sections.map((x) => x.id))}>
            All
          </Button>
          <Button variant="ghost" onClick={() => setSelected([])}>
            None
          </Button>
        </div>

        <span className={s.mono} data-pack-total>
          {chosen.length} of {sections.length} sections · {chars.toLocaleString()} characters ·
          ~{Math.round(chars / 4).toLocaleString()} tokens (estimate)
        </span>

        {copied.all === "manual" && (
          <Badge tone="unknown">
            This browser will not let a page write to the clipboard. Open a section, select the text
            and copy it by hand.
          </Badge>
        )}
        {chosen.length === 0 && <Badge tone="unknown">Nothing selected — the pack is empty.</Badge>}
      </header>

      <section className={s.section}>
        <h2 className={s.h2}>The pack</h2>
        <p className={s.body}>
          Each section is quoted from the source named beside it. Section 06 is the largest and the
          first to drop when you are writing rather than designing.
        </p>

        <div className={s.list}>
          {sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              selected={selected.includes(section.id)}
              copyState={copied[section.id] ?? "idle"}
              onToggle={() => toggle(section.id)}
              onCopy={() => copy(section.id, section.markdown)}
            />
          ))}
        </div>
      </section>

      <p className={s.mono}>{CONTEXT_INTRO.foot}</p>
    </main>
  );
}
