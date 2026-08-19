import Link from "next/link";
import { Logo } from "../design-system/components/brand/Logo";
import { Seeds } from "../design-system/components/brand/Seeds";
import { ENTRIES, MASTHEAD } from "../content/entries";
import styles from "./page.module.css";

/**
 * The index — a direct port of "Okwe Knowledge.dc.html".
 *
 * A "card" in Okwe is a register entry: opened by a 3px ink rule, indexed by a
 * mono number, closed by a hairline meta line. No box, no radius, no shadow.
 * The opening rule turns sulphur on hover — and on focus, so the keyboard gets
 * the same signal the mouse does.
 */
export default function IndexPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-page)",
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <a className="okwe-skip" href="#register">
        Skip to the register
      </a>
      <div
        style={{
          width: "100%",
          maxWidth: "var(--page-max)",
          padding: "40px var(--page-margin) 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-7)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              font: "var(--type-label)",
              fontStretch: "var(--stretch-mono)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              fontWeight: "var(--weight-bold)" as unknown as number,
              color: "var(--text-primary)",
            }}
          >
            {MASTHEAD.callNumber}
          </div>
          <div
            style={{
              font: "var(--type-label)",
              fontStretch: "var(--stretch-mono)",
              fontWeight: "var(--weight-regular)" as unknown as number,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}
          >
            {MASTHEAD.strapline}
          </div>
        </header>

        <div
          style={{
            borderTop: "var(--rule-thick) solid var(--rule-ink)",
            marginTop: "var(--space-4)",
            paddingTop: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          <Logo variant="stacked" knowledge size={28} />
          <h1
            style={{
              fontSize: 56,
              lineHeight: 0.98,
              maxWidth: "18ch",
              textWrap: "pretty",
            }}
          >
            {MASTHEAD.headline}
          </h1>
          <p
            style={{
              font: "var(--type-lede)",
              color: "var(--text-body)",
              maxWidth: "56ch",
            }}
          >
            {MASTHEAD.lede}
          </p>
        </div>

        <nav id="register" style={{ marginTop: 56, display: "flex", flexDirection: "column" }}>
          {ENTRIES.map((e) => (
            <Link key={e.num} href={e.href} className={`okwe-block-link ${styles.entry}`}>
              <div className={styles.num}>{e.num}</div>
              <div className={styles.entryBody}>
                <div className={styles.entryTitle}>{e.title}</div>
                <div className={styles.entryText}>{e.body}</div>
              </div>
              <div className={styles.entryMeta}>{e.meta}</div>
            </Link>
          ))}
        </nav>

        <footer
          style={{
            marginTop: "auto",
            borderTop: "var(--rule-thin) solid var(--rule-ink)",
            paddingTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-7)",
            flexWrap: "wrap",
          }}
        >
          <Seeds size={10} filled={3} total={6} />
          <div
            style={{
              font: "var(--type-label)",
              fontStretch: "var(--stretch-mono)",
              fontWeight: "var(--weight-regular)" as unknown as number,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}
          >
            {MASTHEAD.destination}
          </div>
        </footer>
      </div>
    </div>
  );
}
