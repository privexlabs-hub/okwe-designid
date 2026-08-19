"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/**
 * The colour ramps, read back from the CSS custom properties at runtime rather
 * than transcribed — if a token is renamed or dropped, the swatch reads blank
 * and the break is visible on the page instead of hiding in a stale copy.
 */
const RAMPS: Array<{ name: string; steps: number[] }> = [
  { name: "chalk", steps: [50, 100, 200, 300, 400, 500] },
  { name: "cyanotype", steps: [900, 800, 700, 600, 500, 400, 300, 200, 100] },
  { name: "sulphur", steps: [600, 500, 400, 300, 100] },
  { name: "verdigris", steps: [700, 600, 500, 300, 100] },
  { name: "stamp", steps: [700, 600, 400, 100] },
];

const swatch: CSSProperties = {
  width: 56,
  height: 56,
  display: "block",
  border: "var(--rule-thin) solid var(--rule-quiet)",
};

export function ColourRamps() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const ramp of RAMPS) {
      for (const step of ramp.steps) {
        const token = `--${ramp.name}-${step}`;
        next[token] = cs.getPropertyValue(token).trim().toUpperCase();
      }
    }
    setValues(next);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
      {RAMPS.map((ramp) => (
        <div key={ramp.name} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <span className="okwe-label" style={{ color: "var(--text-muted)" }}>
            {ramp.name}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)" }}>
            {ramp.steps.map((step) => {
              const token = `--${ramp.name}-${step}`;
              const hex = values[token];
              return (
                <div
                  key={step}
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
                >
                  <span style={{ ...swatch, background: `var(${token})` }} />
                  <span className="okwe-call" style={{ color: "var(--text-primary)" }}>
                    {step}
                  </span>
                  <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
                    {hex || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
