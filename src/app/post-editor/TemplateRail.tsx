"use client";

import { useState } from "react";
import { Tag } from "@/design-system/components/core/Tag";
import { TEMPLATES } from "@/content/templates";
import type { Template } from "@/content/templates";
import styles from "./editor.module.css";

export interface TemplateRailProps {
  active: string;
  onPick: (t: Template) => void;
  /** Called after a pick so the drawer form can close itself. */
  onPicked?: () => void;
}

/** Left rail: platform filter, then the template register. */
export function TemplateRail({ active, onPick, onPicked }: TemplateRailProps) {
  const [platform, setPlatform] = useState("All");
  const platforms = ["All", ...new Set(TEMPLATES.map((t) => t.platform))];
  const list = TEMPLATES.filter(
    (t) => platform === "All" || t.platform === platform,
  );

  return (
    <aside id="template-rail" aria-label="Templates" className={styles.rail}>
      <div
        style={{
          padding: "var(--space-5)",
          borderBottom: "1px solid var(--rule-quiet)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <span
          style={{
            font: "var(--type-label)",
            letterSpacing: "var(--tracking-label)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Templates
        </span>
        <div
          style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}
        >
          {platforms.map((p) => (
            // The source used a bare <Tag> here; it needs to be a real button to
            // be reachable from the keyboard.
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              aria-pressed={p === platform}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
              }}
            >
              <Tag
                selected={p === platform}
                style={{
                  cursor: "pointer",
                  fontSize: "var(--size-2xs)",
                  padding: "2px 8px",
                }}
              >
                {p}
              </Tag>
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {list.map((t) => {
          const on = t.code === active;
          return (
            <button
              key={t.code}
              type="button"
              onClick={() => {
                onPick(t);
                onPicked?.();
              }}
              aria-pressed={on}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                background: on ? "var(--surface-inset)" : "transparent",
                border: 0,
                borderBottom: "1px solid var(--rule-quiet)",
                borderLeft:
                  "2px solid " + (on ? "var(--surface-mark)" : "transparent"),
                padding: "var(--space-5)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <span
                style={{ font: "var(--type-h4)", color: "var(--text-primary)" }}
              >
                {t.name}
              </span>
              <span
                style={{
                  font: "var(--type-label)",
                  letterSpacing: "0.04em",
                  color: "var(--text-muted)",
                }}
              >
                {t.code}
              </span>
              <span
                style={{
                  font: "var(--type-caption)",
                  color: "var(--text-secondary)",
                }}
              >
                {t.platform} · {t.canvas}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
