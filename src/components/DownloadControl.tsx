"use client";

import { useEffect, useRef, useState } from "react";
import {
  downloadOne,
  ExportError,
  FORMAT_LABEL,
  SINGLE_FORMATS,
  type ExportTarget,
  type SingleFormat,
} from "@/lib/export";
import styles from "./DownloadControl.module.css";

export interface DownloadControlProps {
  /** Resolved lazily so the node exists by the time the user clicks. */
  getTarget: () => ExportTarget | null;
  /** 1 = native canvas size, 2 = retina/print. */
  scale?: number;
  /** Compact form for a dense strip; full form shows the format names. */
  size?: "sm" | "md";
  /** Accessible context, e.g. "slide 03". */
  label: string;
  defaultFormat?: SingleFormat;
}

/**
 * Download ONE asset in ONE format.
 *
 * Every canvas in the app carries one of these, so nothing is only available
 * as part of a bulk export — you can take a single slide as PNG, JPG, PDF or
 * SVG without touching the batch dialog.
 */
export function DownloadControl({
  getTarget,
  scale = 1,
  size = "md",
  label,
  defaultFormat = "png",
}: DownloadControlProps) {
  const [format, setFormat] = useState<SingleFormat>(defaultFormat);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const run = async () => {
    if (state === "busy") return;
    const target = getTarget();
    if (!target) {
      setState("error");
      setMessage("Not ready — try again.");
      return;
    }
    setState("busy");
    setMessage("Rendering…");
    try {
      const name = await downloadOne(target, format, { scale });
      setState("done");
      setMessage(name);
      timer.current = setTimeout(() => setState("idle"), 2600);
    } catch (e) {
      setState("error");
      setMessage(e instanceof ExportError ? e.message : `Failed: ${(e as Error).message}`);
    }
  };

  const id = `fmt-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={`${styles.wrap} ${size === "sm" ? styles.sm : ""}`}>
      <label className={styles.srOnly} htmlFor={id}>
        Format for {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={format}
        onChange={(e) => setFormat(e.target.value as SingleFormat)}
        disabled={state === "busy"}
      >
        {SINGLE_FORMATS.map((f) => (
          <option key={f} value={f} title={FORMAT_LABEL[f]}>
            {f.toUpperCase()}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={styles.button}
        onClick={run}
        disabled={state === "busy"}
        aria-label={`Download ${label} as ${format.toUpperCase()}`}
      >
        {state === "busy" ? "…" : state === "done" ? "Saved" : "Download"}
      </button>
      {(state === "error" || state === "done") && (
        <span
          className={`${styles.status} ${state === "error" ? styles.error : ""}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </span>
      )}
    </div>
  );
}
