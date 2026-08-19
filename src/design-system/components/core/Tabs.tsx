"use client";

import { useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  count?: number;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  items?: TabItem[];
  value?: string;
  onChange?: (id: string) => void;
  variant?: "register" | "block";
  style?: CSSProperties;
}

/** Register-rule or block tab strip; uncontrolled unless `value` is supplied. */
export function Tabs({
  items = [],
  value,
  onChange,
  variant = "register",
  style,
  ...rest
}: TabsProps) {
  const [internal, setInternal] = useState<string | undefined>(items[0] && items[0].id);
  const active = value !== undefined ? value : internal;
  const select = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };
  const block = variant === "block";
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: block ? "var(--rule-thin)" : "var(--space-7)",
        borderBottom: block ? "none" : "var(--rule-thin) solid var(--rule-ink)",
        ...style,
      }}
      {...rest}
    >
      {items.map((it, i) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={on}
            onClick={() => select(it.id)}
            style={{
              font: "var(--type-ui)",
              fontFamily: "var(--font-mono)",
              fontStretch: "var(--stretch-mono)",
              letterSpacing: "var(--tracking-call)",
              textTransform: "uppercase",
              fontSize: "var(--size-2xs)",
              background: block ? (on ? "var(--surface-mark)" : "var(--surface-inset)") : "transparent",
              color: on ? "var(--text-primary)" : "var(--text-muted)",
              border: 0,
              borderRadius: 0,
              borderBottom: block
                ? "none"
                : `var(--rule-thick) solid ${on ? "var(--rule-mark)" : "transparent"}`,
              padding: block ? "var(--space-3) var(--space-5)" : "0 0 var(--space-4)",
              marginBottom: block ? 0 : "calc(var(--rule-thin) * -1)",
              cursor: "pointer",
              transition: "var(--transition-control)",
              display: "inline-flex",
              gap: "var(--space-3)",
              alignItems: "baseline",
            }}
          >
            <span style={{ opacity: 0.55 }}>{String(i + 1).padStart(2, "0")}</span>
            {it.label}
            {it.count !== undefined && (
              <span style={{ opacity: 0.55 }}>[{it.count}]</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
