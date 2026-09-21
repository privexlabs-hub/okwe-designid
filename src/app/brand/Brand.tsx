"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Seeds } from "@/design-system/components/brand/Seeds";
import {
  BRAND_INTRO,
  LOGO_MANIFEST,
  assetUrl,
  readableBytes,
} from "@/content/brand";
import type { LogoBrand } from "@/content/brand";
import {
  ExportError,
  download,
  downloadAsset,
  exportOne,
  fetchAsset,
  toZip,
  type ExportTarget,
  type PackagedFile,
} from "@/lib/export";
import { AssetRow, type RegisterTarget, type TargetGetter } from "./AssetRow";
import s from "./brand.module.css";

/** One unit of packaging work: fetch a static file, or raster a live specimen. */
type Job = () => Promise<PackagedFile>;

const SHARED = Object.fromEntries(LOGO_MANIFEST.shared.map((a) => [a.file, a])) as Record<
  string,
  (typeof LOGO_MANIFEST.shared)[number]
>;

/* ------------------------------------------------------------------ ZIPs -- */

interface ZipButtonProps {
  label: string;
  filename: string;
  /** Resolved on click, so every specimen is mounted by the time it runs. */
  plan: () => { jobs: Job[]; extra: PackagedFile[] };
  tone?: "mark" | "quiet";
}

/** Package a set of files, one at a time, reporting progress as it goes. */
function ZipButton({ label, filename, plan, tone = "mark" }: ZipButtonProps) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const run = async () => {
    if (state === "busy") return;
    setState("busy");
    try {
      const { jobs, extra } = plan();
      const files: PackagedFile[] = [];
      for (let i = 0; i < jobs.length; i++) {
        setMessage(`Packaging ${i + 1} of ${jobs.length}…`);
        files.push(await jobs[i]());
      }
      setMessage("Zipping…");
      download(await toZip([...files, ...extra]), filename);
      setState("done");
      setMessage(filename);
      timer.current = setTimeout(() => setState("idle"), 2600);
    } catch (e) {
      setState("error");
      setMessage(e instanceof ExportError ? e.message : `Failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className={s.zip}>
      <button
        type="button"
        className={`${s.zipButton} ${tone === "quiet" ? s.zipQuiet : ""}`}
        onClick={run}
        disabled={state === "busy"}
      >
        {state === "busy" ? "Packaging…" : state === "done" ? "Saved" : label}
      </button>
      {state !== "idle" && (
        <span
          className={`${s.status} ${state === "error" ? s.error : ""}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------- a static-file row -- */

interface StaticRowProps {
  specimen: React.ReactNode;
  label: string;
  hint?: string;
  file: string;
  bytes?: number;
  dimensions?: string;
  /** Sits the specimen on the ink plate the asset is drawn for. */
  inverse?: boolean;
}

function StaticRow({ specimen, label, hint, file, bytes, dimensions, inverse }: StaticRowProps) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const run = async () => {
    if (state === "busy") return;
    setState("busy");
    setMessage("Fetching…");
    try {
      const name = await downloadAsset(assetUrl(file));
      setState("done");
      setMessage(name);
      timer.current = setTimeout(() => setState("idle"), 2600);
    } catch (e) {
      setState("error");
      setMessage(e instanceof ExportError ? e.message : `Failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className={s.row}>
      <div className={`${s.spec} ${inverse ? s.specInverse : ""}`}>
        <div className={s.specInner}>{specimen}</div>
      </div>
      <div className={s.name}>
        <span className={s.nameLabel}>{label}</span>
        {hint && <span className={s.nameHint}>{hint}</span>}
      </div>
      <span className={s.meta}>
        {[file, bytes !== undefined ? readableBytes(bytes) : null, dimensions]
          .filter(Boolean)
          .join(" · ")}
      </span>
      <div className={s.controls}>
        <button
          type="button"
          className={s.button}
          onClick={run}
          disabled={state === "busy"}
          aria-label={`Download ${label}`}
        >
          {state === "busy" ? "…" : state === "done" ? "Saved" : "Download"}
        </button>
        {state !== "idle" && (
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

/* ------------------------------------------------------------------ page -- */

/** OKW-BRAND-01 — every mark: the parent, three processes and the imprint, with the rule that governs them. */
export function Brand() {
  const [compact, setCompact] = useState(false);
  const targets = useRef(new Map<string, TargetGetter>());

  // Read the viewport on mount, never during render: under `output: "export"`
  // the pre-rendered HTML has no window to measure.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)"); // --bp-sm
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const register = useCallback<RegisterTarget>((file, get) => {
    targets.current.set(file, get);
  }, []);

  /** A PNG at 2× of one lockup, rendered from the specimen on the page. */
  const rasterJob = useCallback(
    (file: string): Job =>
      async () => {
        const get = targets.current.get(file);
        const target: ExportTarget | null = get ? get() : null;
        if (!target) throw new ExportError(`${file}: the specimen is not on the page.`);
        return exportOne(target, "png", { scale: 2 });
      },
    [],
  );

  const staticJob = (file: string): Job => () => fetchAsset(assetUrl(file), file);

  /** Per brand: its 5 vector masters, its 2 app icons, and a PNG@2× per lockup. */
  const brandPlan = useCallback(
    (brand: LogoBrand) => () => ({
      jobs: [
        ...brand.lockups.map((l) => staticJob(l.file)),
        ...brand.icons.map((i) => staticJob(i.file)),
        ...brand.lockups.map((l) => rasterJob(l.file)),
      ],
      extra: [] as PackagedFile[],
    }),
    [rasterJob],
  );

  /** The whole kit: every master, every icon, both watermarks, a PNG@2× per
   *  lockup, the manifest, and the rule as USAGE.txt. */
  const kitPlan = useCallback(
    () => ({
      jobs: [
        ...LOGO_MANIFEST.brands.flatMap((b) => b.lockups.map((l) => staticJob(l.file))),
        ...LOGO_MANIFEST.brands.flatMap((b) => b.icons.map((i) => staticJob(i.file))),
        staticJob("watermark-chalk.svg"),
        staticJob("watermark-plate.svg"),
        ...LOGO_MANIFEST.brands.flatMap((b) => b.lockups.map((l) => rasterJob(l.file))),
        () => fetchAsset(assetUrl("logo.manifest.json"), "logo.manifest.json"),
      ],
      extra: [
        {
          name: "USAGE.txt",
          blob: new Blob([LOGO_MANIFEST.rule], { type: "text/plain" }),
        },
      ],
    }),
    [rasterJob],
  );

  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link href="/" className={`okwe-block-link ${s.back}`}>
          ← Operating system
        </Link>
        <span className={s.eyebrow}>{BRAND_INTRO.code} · Brand assets</span>
        <h1>{BRAND_INTRO.title}</h1>
        <p className={s.lede}>{BRAND_INTRO.lede}</p>
        <div className={s.headerActions}>
          <ZipButton label="Download the kit" filename="okwe-brand-kit.zip" plan={kitPlan} />
          <span className={s.mono}>
            The kit carries the vector masters and one PNG at 2× per lockup. 1×, 3× and PDF are
            per asset only — eighty renders in a single pass would exhaust mobile Safari.
          </span>
        </div>
      </header>

      <section className={s.section} aria-labelledby="the-rule">
        <h2 className={s.h2} id="the-rule">
          The rule
        </h2>
        <p className={s.rule}>{LOGO_MANIFEST.rule}</p>
        <div className={s.corollaries}>
          <div className={s.corollary}>
            <span className={s.corollaryHead}>The seed count is not a process</span>
            <p className={s.corollaryNote}>
              Three of six, everywhere: three sown, three still open. Changing the count to mark
              a process changes what the mark says about the work, not who made it.
            </p>
          </div>
          <div className={s.corollary}>
            <span className={s.corollaryHead}>One favicon, an app icon for each mark</span>
            <p className={s.corollaryNote}>
              The favicon is shared across the ecosystem because at 16px a qualifier word is
              unreadable, and an unreadable word is noise. The 180 and 512 icons have room to
              name their mark, so they do.
            </p>
          </div>
        </div>
      </section>

      {LOGO_MANIFEST.brands.map((brand) => (
        <section className={s.section} key={brand.id} aria-labelledby={`brand-${brand.id}`}>
          <div className={s.sectionHead}>
            <h2 className={s.h2} id={`brand-${brand.id}`}>
              {brand.name}
            </h2>
            <p className={s.note}>{brand.note}</p>
            <ZipButton
              label={`Download ${brand.name}`}
              filename={`${brand.id}-marks.zip`}
              plan={brandPlan(brand)}
              tone="quiet"
            />
          </div>
          <div className={s.rows}>
            {brand.lockups.map((l) => (
              <AssetRow
                key={l.id}
                brand={brand}
                lockup={l}
                compact={compact}
                register={register}
              />
            ))}
          </div>
        </section>
      ))}

      <section className={s.section} aria-labelledby="shared">
        <div className={s.sectionHead}>
          <h2 className={s.h2} id="shared">
            Shared and applied
          </h2>
          <p className={s.note}>
            The pieces that belong to no single mark, and the icons that belong to each.
          </p>
        </div>

        <div className={s.rows}>
          <StaticRow
            specimen={
              /* 582 bytes — small enough to show as the real file. */
              <Image src={assetUrl("favicon.svg")} alt="" width={32} height={32} />
            }
            label="Favicon"
            hint="The seed row alone. Shared across the ecosystem."
            file="favicon.svg"
            bytes={SHARED["favicon.svg"]?.bytes}
            dimensions="32×32"
          />
          <StaticRow
            specimen={
              <Image src={assetUrl("watermark-chalk.svg")} alt="" width={160} height={18} />
            }
            label="Watermark, chalk ground"
            hint="Chalk tint, for the page ground. A watermark is meant to be almost not there."
            file="watermark-chalk.svg"
            bytes={SHARED["watermark-chalk.svg"]?.bytes}
          />
          <StaticRow
            specimen={
              <Image src={assetUrl("watermark-plate.svg")} alt="" width={160} height={18} />
            }
            label="Watermark, ink plate"
            hint="Ink tint, for the plate. Shown on the plate here."
            file="watermark-plate.svg"
            bytes={SHARED["watermark-plate.svg"]?.bytes}
            inverse
          />
          <StaticRow
            specimen={
              /* The raster card is 47 KB; the SVG beside it is 121 KB, so the
                 preview uses the PNG and the vector is a download. */
              <Image
                src={assetUrl("og-default.png")}
                alt=""
                width={160}
                height={84}
                loading="lazy"
              />
            }
            label="Open Graph card"
            hint="The share card, raster."
            file="og-default.png"
            bytes={SHARED["og-default.png"]?.bytes}
            dimensions="1200×630"
          />
          <StaticRow
            specimen={
              <Image
                src={assetUrl("og-default.png")}
                alt=""
                width={160}
                height={84}
                loading="lazy"
              />
            }
            label="Open Graph card, vector"
            hint="Same card, editable."
            file="og-default.svg"
            bytes={SHARED["og-default.svg"]?.bytes}
            dimensions="1200×630"
          />

          {LOGO_MANIFEST.brands.flatMap((brand) =>
            brand.icons.map((icon) => (
              <StaticRow
                key={icon.file}
                specimen={
                  /* The icons are small rasters (5–28 KB) and they are what is
                     being handed over, so the specimen is the file itself —
                     including how the qualifier meets the icon's own edge. */
                  <Image
                    src={assetUrl(icon.file)}
                    alt=""
                    width={compact ? 56 : 72}
                    height={compact ? 56 : 72}
                    loading="lazy"
                  />
                }
                label={`${brand.name} — ${icon.use}`}
                file={icon.file}
                dimensions={`${icon.size}×${icon.size}`}
              />
            )),
          )}
        </div>
      </section>

      <footer className={s.footer}>
        <Seeds size={10} filled={3} total={6} />
        <span className={s.mono}>{BRAND_INTRO.foot}</span>
      </footer>
    </main>
  );
}
