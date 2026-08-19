"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/design-system/components/core/Badge";
import { Button } from "@/design-system/components/core/Button";
import { Tag } from "@/design-system/components/core/Tag";
import { Logo } from "@/design-system/components/brand/Logo";
import { PROFILES, TIER_FILTERS } from "@/content/profiles";
import type { ProfileTier, SocialProfile } from "@/content/profiles";

type Filter = "All" | ProfileTier;
type CopyState = "idle" | "copied" | "manual";

function toneFor(tier: ProfileTier) {
  if (tier === "Tier 1") return "ink" as const;
  if (tier === "Deprioritised") return "unknown" as const;
  return "neutral" as const;
}

function ProfileRow({ d }: { d: SocialProfile }) {
  const [copy, setCopy] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flash = useCallback((state: CopyState) => {
    setCopy(state);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopy("idle"), 2000);
  }, []);

  const onCopy = useCallback(() => {
    // Clipboard access can be blocked (insecure context, permission policy):
    // say so in the register voice rather than failing silently.
    if (!navigator.clipboard?.writeText) {
      flash("manual");
      return;
    }
    navigator.clipboard.writeText(d.bio).then(
      () => flash("copied"),
      () => flash("manual"),
    );
  }, [d.bio, flash]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr 200px",
        gap: "var(--space-6)",
        padding: "var(--space-6) 0",
        borderTop: "1px solid var(--rule-quiet)",
        alignItems: "start",
      }}
    >
      <Logo variant="avatar" size={88} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ font: "var(--type-h4)" }}>{d.platform}</span>
          <span style={{ font: "var(--type-data)", color: "var(--text-muted)" }}>{d.handle}</span>
          <Badge tone={toneFor(d.tier)}>{d.tier}</Badge>
        </div>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-body)", maxWidth: "64ch" }}>
          {d.bio}
        </p>
        <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
          Role — {d.role}
        </span>
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            aria-label={`Copy the ${d.platform} bio`}
          >
            Copy the bio
          </Button>
          <span aria-live="polite">
            {copy === "copied" && <Badge tone="fact">Copied</Badge>}
            {copy === "manual" && <Badge tone="unknown">Blocked — press ⌘C</Badge>}
          </span>
        </div>
      </div>
      <span style={{ font: "var(--type-data)", color: "var(--text-secondary)" }}>{d.link}</span>
    </div>
  );
}

/** The profile register, filtered by tier. */
export function ProfileRegister() {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = filter === "All" ? PROFILES : PROFILES.filter((p) => p.tier === filter);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <h2 style={{ font: "var(--type-h2)", fontSize: "var(--size-2xl)" }}>Profiles and bios</h2>
      <div
        role="group"
        aria-label="Filter profiles by tier"
        style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}
      >
        {TIER_FILTERS.map((t) => (
          <Tag
            key={t}
            role="button"
            tabIndex={0}
            aria-pressed={filter === t}
            selected={filter === t}
            onClick={() => setFilter(t)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFilter(t);
              }
            }}
            style={{ cursor: "pointer", textTransform: "uppercase" }}
          >
            {t}
          </Tag>
        ))}
        <span
          style={{
            font: "var(--type-data)",
            color: "var(--text-muted)",
            marginLeft: "var(--space-3)",
          }}
        >
          {shown.length} of {PROFILES.length} surfaces
        </span>
      </div>
      <div>
        {shown.map((d) => (
          <ProfileRow key={d.platform} d={d} />
        ))}
      </div>
    </section>
  );
}
