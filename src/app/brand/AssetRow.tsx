"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/design-system/components/brand/Logo";
import type { LogoVariant } from "@/design-system/components/brand/Logo";
import { assetUrl, readableBytes } from "@/content/brand";
import type { LogoAssetLockup, LogoBrand } from "@/content/brand";
import {
  ExportError,
  download,
  downloadAsset,
  exportOne,
  type ExportTarget,
} from "@/lib/export";
import s from "./brand.module.css";

/** A getter, registered with the page so the ZIP builders can raster this row. */
export type TargetGetter = () => ExportTarget | null;
export type RegisterTarget = (file: string, get: TargetGetter) => void;

/**
 * The formats one lockup can be taken in.
 *
 * Deliberately local, NOT `SINGLE_FORMATS` from the export library. That list
 * is the canvas set (png/jpg/pdf/svg at one scale); a logo needs three raster
 * densities and its SVG served from disk rather than screenshotted.
 */
const FORMATS = [
  { id: "svg", label: "SVG — vector master" },
  { id: "png1", label: "PNG — 1×" },
  { id: "png2", label: "PNG — 2×" },
  { id: "png3", label: "PNG — 3×" },
  { id: "pdf", label: "PDF — one page, raster" },
] as const;

type FormatId = (typeof FORMATS)[number]["id"];

/** Specimen sizes match /design-system, clamped down on a phone. */
const SPECIMEN: Record<LogoVariant, { full: number; compact: number }> = {
  stacked: { full: 32, compact: 22 },
  horizontal: { full: 26, compact: 15 },
  wordmark: { full: 26, compact: 18 },
  /*
   * The compact avatar is 68, not 56: the arm word is fitted to the square, so
   * at 56 "Knowledge" lands at 8.4px — below the legibility floor the
   * responsive audit enforces. 68 puts it just over 10px.
   */
  avatar: { full: 72, compact: 68 },
};

export const specimenSize = (variant: LogoVariant, compact: boolean) =>
  compact ? SPECIMEN[variant].compact : SPECIMEN[variant].full;

export interface AssetRowProps {
  brand: LogoBrand;
  lockup: LogoAssetLockup;
  /** Below --bp-sm (600px) the specimen steps down a size. */
  compact: boolean;
  register: RegisterTarget;
}

/**
 * One ledger row: a live specimen, the lockup's name, its file line, and a
 * single format control.
 *
 * The specimen is a live `<Logo>`, never `<img src="/assets/logo/….svg">` —
 * each master embeds the Archivo subset and weighs ~121 KB, so twenty of them
 * would cost 2.4 MB on page view. The component costs nothing, and the raster
 * the reader downloads is rendered from the very node they are looking at.
 */
export function AssetRow({ brand, lockup, compact, register }: AssetRowProps) {
  const node = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<FormatId>("svg");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = lockup.file.replace(/\.svg$/, "");

  const getTarget = useCallback<TargetGetter>(
    () =>
      node.current
        ? { node: node.current, width: lockup.width, height: lockup.height, name }
        : null,
    [lockup.width, lockup.height, name],
  );

  useEffect(() => register(lockup.file, getTarget), [register, getTarget, lockup.file]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const run = async () => {
    if (state === "busy") return;
    setState("busy");
    setMessage("Rendering…");
    try {
      let saved: string;
      if (format === "svg") {
        /* Serve the pre-generated master. NEVER `toSvgString` here:
           html-to-image wraps the DOM in a <foreignObject> — a screenshot in
           SVG clothing, not a logo. The file on disk is real vector. */
        saved = await downloadAsset(assetUrl(lockup.file));
      } else {
        const target = getTarget();
        if (!target) throw new ExportError("The specimen is not on screen yet — try again.");
        const scale = format === "png3" ? 3 : format === "png2" ? 2 : 1;
        const file = await exportOne(target, format === "pdf" ? "pdf" : "png", { scale });
        download(file.blob, file.name);
        saved = file.name;
      }
      setState("done");
      setMessage(saved);
      timer.current = setTimeout(() => setState("idle"), 2600);
    } catch (e) {
      setState("error");
      setMessage(e instanceof ExportError ? e.message : `Failed: ${(e as Error).message}`);
    }
  };

  const inverse = lockup.tone === "inverse";
  const id = `fmt-${lockup.file.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div className={s.row}>
      <div className={`${s.spec} ${inverse ? s.specInverse : ""}`}>
        <div className={s.specInner} ref={node}>
          <Logo
            variant={lockup.variant}
            tone={lockup.tone}
            arm={brand.arm ?? undefined}
            knowledge={false}
            size={specimenSize(lockup.variant, compact)}
          />
        </div>
      </div>

      <div className={s.name}>
        <span className={s.nameLabel}>{lockup.label}</span>
        {inverse && <span className={s.nameHint}>Shown on the ink ground it is drawn for.</span>}
      </div>

      <span className={s.meta}>
        {lockup.file} · {readableBytes(lockup.bytes)} · {lockup.width}×{lockup.height}
      </span>

      <div className={s.controls}>
        <label className={s.srOnly} htmlFor={id}>
          Format for {brand.name} {lockup.label}
        </label>
        <select
          id={id}
          className={s.select}
          value={format}
          disabled={state === "busy"}
          onChange={(e) => setFormat(e.target.value as FormatId)}
        >
          {FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={s.button}
          onClick={run}
          disabled={state === "busy"}
          aria-label={`Download ${brand.name} ${lockup.label}`}
        >
          {state === "busy" ? "…" : state === "done" ? "Saved" : "Download"}
        </button>
        {(state === "busy" || state === "done" || state === "error") && (
          <span
            className={`${s.status} ${state === "error" ? s.error : ""}`}
            role={state === "error" ? "alert" : "status"}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
