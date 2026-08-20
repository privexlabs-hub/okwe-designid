"use client";

import type { MouseEvent } from "react";
import { proofId } from "./proofId";
import css from "./proofs.module.css";

export interface ProofRef {
  n: number;
  title: string;
}

/** Jump list over the twelve proofs. Plain anchors, so the keyboard gets it free. */
export function ProofIndex({ proofs }: { proofs: ProofRef[] }) {
  function jump(e: MouseEvent<HTMLAnchorElement>, n: number) {
    const el = document.getElementById(proofId(n));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.focus({ preventScroll: true });
    history.replaceState(null, "", `#${proofId(n)}`);
  }

  return (
    <nav aria-label="Proof index" className={`${css.index} okwe-scroll-x`}>
      {proofs.map((p) => (
        <a
          key={p.n}
          href={`#${proofId(p.n)}`}
          className="okwe-block-link okwe-call"
          onClick={(e) => jump(e, p.n)}
          style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}
        >
          <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {String(p.n).padStart(2, "0")}
          </span>{" "}
          {p.title}
        </a>
      ))}
    </nav>
  );
}
