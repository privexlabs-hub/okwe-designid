"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/design-system/components/brand/Logo";
import { DEFAULT_DOC, DOCS, LAUNCH_LINKS } from "@/content/playbook";
import styles from "./playbook.module.css";

/**
 * The playbook browser — a port of Playbook.dc.html.
 *
 * 280px nav rail against a scrolling reading field. The active document is
 * marked by a 3px sulphur left bar and a 5% ink wash, exactly as the source
 * does it. Deep links use the `<slug>--<heading>` anchor scheme that docs.js
 * already bakes into the rendered HTML.
 */
export function Playbook() {
  const [active, setActive] = useState<string>(DEFAULT_DOC);
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const doc = useMemo(() => DOCS.find((d) => d.slug === active) ?? DOCS[0], [active]);

  const scrollToId = useCallback((id: string) => {
    const c = scrollRef.current;
    const el = document.getElementById(id);
    if (!c || !el) return;
    c.scrollTop = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 20;
  }, []);

  /** Read the hash on mount and on every hashchange, as the source does. */
  useEffect(() => {
    const apply = () => {
      const h = (location.hash || "").replace(/^#/, "");
      if (!h) return;
      const slug = h.split("--")[0];
      if (!DOCS.some((d) => d.slug === slug)) return;
      setActive(slug);
      if (h.includes("--")) requestAnimationFrame(() => scrollToId(h));
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [scrollToId]);

  const go = (slug: string, anchor?: string) => {
    try {
      history.replaceState(null, "", "#" + (anchor || slug));
    } catch {
      /* replaceState can throw in sandboxed contexts; navigation still works. */
    }
    setActive(slug);
    requestAnimationFrame(() => {
      if (anchor) scrollToId(anchor);
      else if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
  };

  /**
   * In-page search across all six documents. Matches are counted from the
   * rendered HTML with tags stripped, so a hit in a table cell counts too.
   */
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    const counts = new Map<string, number>();
    for (const d of DOCS) {
      const text = d.html.replace(/<[^>]+>/g, " ").toLowerCase();
      let n = 0;
      let i = text.indexOf(q);
      while (i !== -1) {
        n++;
        i = text.indexOf(q, i + q.length);
      }
      if (n) counts.set(d.slug, n);
    }
    return counts;
  }, [query]);

  return (
    <div className={styles.shell}>
      <nav className={styles.rail} aria-label="Playbook contents">
        <div className={styles.railHead}>
          {/* The source rail sets size 17; at Archivo's real metrics the 125%-width
              wordmark overruns the 280px rail and the rail's scroll container
              clips it. 15 fits the same lockup inside the measure. */}
          <Logo variant="horizontal" knowledge size={15} style={{ maxWidth: "100%" }} />
          <div className={styles.callNumber}>OKW-DOC-PLAYBOOK-01 · 19 AUG 2026</div>
        </div>
        <div className={styles.railRule} />

        <label className={styles.searchWrap}>
          <span className={styles.railLabel}>Search the playbooks</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="landed cost, tally, tier 1…"
            className={styles.search}
          />
        </label>

        <div className={styles.railLabel} style={{ padding: "18px 24px 8px" }}>
          The playbooks
        </div>
        <div className={styles.navRow}>
        {DOCS.map((d) => {
          const on = d.slug === doc.slug;
          const n = hits?.get(d.slug);
          return (
            <button
              key={d.slug}
              type="button"
              onClick={() => go(d.slug)}
              aria-current={on ? "page" : undefined}
              className={`${styles.navItem} ${on ? styles.navItemOn : ""}`}
            >
              <span className={styles.navNum}>{d.num}</span>
              <span className={styles.navTitle}>{d.title}</span>
              {hits && (
                <span className={styles.navCount}>{n ? `${n}` : "—"}</span>
              )}
            </button>
          );
        })}
        </div>

        <div className={styles.railLabel} style={{ padding: "22px 24px 8px" }}>
          Launch
        </div>
        {LAUNCH_LINKS.map((l) => (
          <button
            key={l.anchor}
            type="button"
            onClick={() => go(l.slug, l.anchor)}
            className={styles.navItem}
          >
            <span className={styles.navNum}>§</span>
            <span className={styles.navTitle}>{l.label}</span>
          </button>
        ))}

        <div className={styles.railFoot}>
          <Link href="/">← OPERATING SYSTEM</Link>
        </div>
      </nav>

      <div ref={scrollRef} className={styles.field}>
        <article className={styles.column}>
          <div className={styles.docHead}>
            {doc.num} · {doc.title}
          </div>
          {/* docs.js ships these documents already rendered to HTML, with the
              heading ids the deep links depend on. Rendering the same payload
              keeps the anchors and the markup identical to the source. */}
          <div className="okwe-doc" dangerouslySetInnerHTML={{ __html: doc.html }} />
        </article>
      </div>
    </div>
  );
}
