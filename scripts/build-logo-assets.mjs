/**
 * Emits the Okwe brand assets into public/assets/logo/.
 *
 * There is no logo file anywhere in the source project — the mark is drawn by
 * code. So these files are GENERATED from the same numbers the React <Logo/>
 * component reads (src/design-system/brand/geometry.ts), which is why the
 * ratios below are duplicated from nowhere: they are parsed out of that module
 * at build time. One geometry, two renderers, no drift.
 *
 *   node scripts/build-logo-assets.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/assets/logo");
const FONTS = path.join(ROOT, "public/assets/fonts");

/* ---- Read the geometry from the TS module so the two renderers cannot drift ---- */
const geomSrc = await readFile(path.join(ROOT, "src/design-system/brand/geometry.ts"), "utf8");
const num = (name) => {
  const m = geomSrc.match(new RegExp(`${name}:\\s*([\\d.]+)`));
  if (!m) throw new Error(`geometry.ts: could not read "${name}"`);
  return parseFloat(m[1]);
};
const GAP_RATIO = num("gapRatio");
const RING_RATIO = num("ringRatio");
const FILLED = num("filled");
const TOTAL = num("total");
const LOCKUP = {
  stacked: { gap: 0.34, seed: 0.28 },
  horizontal: { gap: 0.55, seed: 0.42 },
  avatar: { gap: 0.11, seed: 0.088, word: 0.26 },
};
// Cross-check the lockup ratios against geometry.ts rather than trusting the copy above.
for (const [variant, vals] of Object.entries(LOCKUP)) {
  const block = geomSrc.match(new RegExp(`${variant}:\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  for (const [key, expected] of Object.entries(vals)) {
    const got = parseFloat(block.match(new RegExp(`${key}:\\s*([\\d.]+)`))?.[1] ?? "NaN");
    if (got !== expected)
      throw new Error(`geometry drift: LOCKUP.${variant}.${key} is ${got} in geometry.ts, ${expected} here`);
  }
}

const INK = "#05161F";      // --cyanotype-900
const CHALK = "#F1F3F1";    // --chalk-50
const MUTED = "#1A5570";    // --cyanotype-600
const SULPHUR = "#E3CB2A";  // --sulphur-400

const seedGap = (s) => Math.round(s * GAP_RATIO);
const seedRing = (s) => Math.max(1, Math.round(s * RING_RATIO));

/** The seed row as SVG circles. Filled counters are sown; open ones are rings. */
function seedsSvg(size, x, y, { color, fill }) {
  const gap = seedGap(size);
  const r = size / 2;
  const ring = seedRing(size);
  let out = "";
  for (let i = 0; i < TOTAL; i++) {
    const cx = x + i * (size + gap) + r;
    const cy = y + r;
    out +=
      i < FILLED
        ? `\n    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`
        : `\n    <circle cx="${cx}" cy="${cy}" r="${r - ring / 2}" fill="none" stroke="${color}" stroke-width="${ring}"/>`;
  }
  return out;
}
const seedRowWidth = (size) => TOTAL * size + (TOTAL - 1) * seedGap(size);

/**
 * Archivo, embedded. Without this the wordmark falls back to Helvetica wherever
 * the SVG is opened and the 125%-width expansion — the whole point — disappears.
 * Uses the latin subset only: the wordmark is five ASCII letters.
 */
const manifest = JSON.parse(await readFile(path.join(FONTS, "fonts.manifest.json"), "utf8"));
const latinArchivo = manifest.fonts.find(
  (f) => f.family === "Archivo" && f.style === "normal" && /U\+0000-00FF/.test(f.unicodeRange ?? ""),
);
if (!latinArchivo) throw new Error("Could not find the Archivo latin subset in the font manifest.");
const archivoB64 = (await readFile(path.join(FONTS, latinArchivo.file))).toString("base64");

const fontStyle = `
  <style>
    @font-face{
      font-family:"Archivo";
      font-style:normal;
      font-weight:${latinArchivo.weight};
      font-stretch:${latinArchivo.axes.wdth.min}% ${latinArchivo.axes.wdth.max}%;
      src:url("data:font/woff2;base64,${archivoB64}") format("woff2");
    }
    .word{font-family:"Archivo",Helvetica,sans-serif;font-weight:700;font-stretch:125%;letter-spacing:-0.02em;text-transform:uppercase}
  </style>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Okwe Knowledge">${fontStyle}
${body}
</svg>\n`;

/* Archivo at 125% width, weight 700: measured advance ≈ 0.86em per uppercase glyph
   run for "OKWE". Used only to size the artboard, never to position the baseline. */
const wordWidth = (fontSize, text) => Math.round(fontSize * 0.86 * text.length * 0.72);

const files = {};

/* ---- stacked: seeds above, name under (the primary mark) ---- */
{
  const size = 48;
  const seed = size * LOCKUP.stacked.seed;
  const gap = size * LOCKUP.stacked.gap;
  const w = Math.max(seedRowWidth(seed), wordWidth(size, "Knowledge")) + 8;
  const h = seed + gap + size * 2 * 0.98 + 8;
  files["okwe-stacked.svg"] = svg(
    Math.round(w),
    Math.round(h),
    `  <g>${seedsSvg(seed, 0, 0, { color: INK, fill: SULPHUR })}
    <text class="word" x="0" y="${(seed + gap + size * 0.78).toFixed(1)}" font-size="${size}" fill="${INK}">Okwe</text>
    <text class="word" x="0" y="${(seed + gap + size * 0.78 + size * 0.98).toFixed(1)}" font-size="${size}" fill="${MUTED}">Knowledge</text>
  </g>`,
  );
}

/* ---- horizontal: seeds beside the name ---- */
{
  const size = 40;
  const seed = size * LOCKUP.horizontal.seed;
  const gap = size * LOCKUP.horizontal.gap;
  const sw = seedRowWidth(seed);
  const w = sw + gap + wordWidth(size, "Okwe Knowledge") + 8;
  const h = size * 1.3;
  files["okwe-horizontal.svg"] = svg(
    Math.round(w),
    Math.round(h),
    `  <g>${seedsSvg(seed, 0, (h - seed) / 2, { color: INK, fill: SULPHUR })}
    <text class="word" x="${(sw + gap).toFixed(1)}" y="${(h / 2 + size * 0.35).toFixed(1)}" font-size="${size}" fill="${INK}">Okwe <tspan fill="${MUTED}">Knowledge</tspan></text>
  </g>`,
  );
}

/* ---- wordmark: the name alone ---- */
{
  const size = 48;
  const w = wordWidth(size, "Okwe Knowledge") + 8;
  const h = size * 1.3;
  files["okwe-wordmark.svg"] = svg(
    Math.round(w),
    Math.round(h),
    `  <text class="word" x="0" y="${(h / 2 + size * 0.35).toFixed(1)}" font-size="${size}" fill="${INK}">Okwe <tspan fill="${MUTED}">Knowledge</tspan></text>`,
  );
}

/* ---- avatar: the mark on an ink square, for profile pictures ---- */
const avatarSvg = (size) => {
  const l = LOCKUP.avatar;
  const seed = size * l.seed;
  const gap = size * l.gap;
  const font = size * l.word;
  const blockH = seed + gap + font * 0.98;
  const top = (size - blockH) / 2;
  return svg(
    size,
    size,
    `  <rect width="${size}" height="${size}" fill="${INK}"/>
  <g>${seedsSvg(seed, (size - seedRowWidth(seed)) / 2, top, { color: CHALK, fill: SULPHUR })}
    <text class="word" x="${size / 2}" y="${(top + seed + gap + font * 0.78).toFixed(1)}" font-size="${font.toFixed(1)}" fill="${CHALK}" text-anchor="middle">Okwe</text>
  </g>`,
  );
};
files["okwe-avatar.svg"] = avatarSvg(512);

/* ---- inverse lockup, for the cyanotype plate ---- */
{
  const size = 48;
  const seed = size * LOCKUP.stacked.seed;
  const gap = size * LOCKUP.stacked.gap;
  const w = Math.round(Math.max(seedRowWidth(seed), wordWidth(size, "Knowledge")) + 32);
  const h = Math.round(seed + gap + size * 2 * 0.98 + 32);
  files["okwe-stacked-inverse.svg"] = svg(
    w,
    h,
    `  <rect width="${w}" height="${h}" fill="${INK}"/>
  <g transform="translate(16,16)">${seedsSvg(seed, 0, 0, { color: CHALK, fill: SULPHUR })}
    <text class="word" x="0" y="${(seed + gap + size * 0.78).toFixed(1)}" font-size="${size}" fill="${CHALK}">Okwe</text>
    <text class="word" x="0" y="${(seed + gap + size * 0.78 + size * 0.98).toFixed(1)}" font-size="${size}" fill="#86B6C7">Knowledge</text>
  </g>`,
  );
}

/**
 * favicon: the seed row alone.
 * At 16px the wordmark is unreadable, and the seed row is the part of the mark
 * that survives — three sown, three open. Pure geometry, so it needs no font.
 */
{
  const S = 64;
  const seed = 8;
  const gap = seedGap(seed);
  const rowW = seedRowWidth(seed);
  const rows = `<g>${seedsSvg(seed, (S - rowW) / 2, (S - seed) / 2, { color: CHALK, fill: SULPHUR })}</g>`;
  files["favicon.svg"] =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="Okwe">
  <rect width="${S}" height="${S}" fill="${INK}"/>
  ${rows}
</svg>\n`;
  void gap;
}

await mkdir(OUT, { recursive: true });
for (const [name, body] of Object.entries(files)) {
  await writeFile(path.join(OUT, name), body);
  console.log(`  ${name.padEnd(30)} ${body.length}B`);
}

/* ---- Rasters. Safari needs a PNG touch icon; OG cards must be raster. ---- */
const png = async (svgStr, w, h, name) => {
  const buf = await sharp(Buffer.from(svgStr), { density: 384 }).resize(w, h, { fit: "fill" }).png().toBuffer();
  await writeFile(path.join(OUT, name), buf);
  console.log(`  ${name.padEnd(30)} ${buf.length}B  ${w}x${h}`);
};

await png(avatarSvg(512), 180, 180, "apple-touch-icon.png");
await png(files["favicon.svg"], 512, 512, "icon-512.png");

/* Open Graph card, 1200x630: the register sheet, not a centred logo. */
{
  const W = 1200, H = 630, M = 64;
  const seed = 22;
  const og = svg(
    W,
    H,
    `  <rect width="${W}" height="${H}" fill="${INK}"/>
  <text class="word" x="${M}" y="${M + 20}" font-size="17" fill="${CHALK}" font-stretch="87.5%" letter-spacing="2.4" style="font-family:'Archivo',sans-serif;font-weight:700">OKW·OS/01 · OPERATING SYSTEM</text>
  <rect x="${M}" y="${M + 44}" width="${W - M * 2}" height="3" fill="${CHALK}"/>
  <text class="word" x="${M}" y="${H / 2 + 10}" font-size="86" fill="${CHALK}">The publishing</text>
  <text class="word" x="${M}" y="${H / 2 + 106}" font-size="86" fill="${CHALK}">operating system</text>
  <g>${seedsSvg(seed, M, H - M - seed, { color: CHALK, fill: SULPHUR })}</g>
  <text x="${W - M}" y="${H - M}" font-size="20" fill="#86B6C7" text-anchor="end" style="font-family:'Archivo',sans-serif;letter-spacing:1.6">okweknowledge.com · one idea a week</text>`,
  );
  await writeFile(path.join(OUT, "og-default.svg"), og);
  await png(og, 1200, 630, "og-default.png");
}

console.log(`\n→ ${path.relative(ROOT, OUT)}`);
