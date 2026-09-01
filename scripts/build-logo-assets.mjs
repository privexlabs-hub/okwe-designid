/**
 * Emits the Okwe brand assets into public/assets/logo/.
 *
 * There is no logo file anywhere in the source project — the mark is drawn by
 * code. So these files are GENERATED from the same numbers the React <Logo/>
 * component reads (src/design-system/brand/geometry.ts), which is why the
 * ratios below are duplicated from nowhere: they are parsed out of that module
 * at build time. One geometry, two renderers, no drift.
 *
 * One mark serves the whole ecosystem. The parent, Okwe, is the wordmark alone;
 * an arm is one qualifier word in muted ink beside or beneath it. Arms are never
 * differentiated by colour — every brand below uses the same four constants.
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

/** Read an exported `const NAME = 0.42` out of geometry.ts. */
const constNum = (name) => {
  const m = geomSrc.match(new RegExp(`const ${name}\\s*=\\s*([\\d.]+)`));
  if (!m) throw new Error(`geometry.ts: could not read const "${name}"`);
  return parseFloat(m[1]);
};

/*
 * Read straight from geometry.ts rather than duplicating. The LOCKUP table
 * below is duplicated-and-drift-checked because it is nested; these are flat,
 * so single-sourcing them is simpler and cannot drift at all.
 */
const WORD_ADVANCE = constNum("WORD_ADVANCE");
const AVATAR_WORD_FIT = constNum("AVATAR_WORD_FIT");
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

/**
 * The qualifier word per arm. Duplicated from geometry.ts for the same reason
 * the ratios are — this is .mjs, there is no TS loader — and cross-checked the
 * same way, so a word can only be changed in one place.
 */
const ARM_WORD = {
  knowledge: "Knowledge",
  comms: "Comms",
  move: "Move",
};
{
  const block = geomSrc.match(/ARM_WORD[^=]*=\s*\{([^}]*)\}/)?.[1] ?? "";
  for (const [arm, expected] of Object.entries(ARM_WORD)) {
    const got = block.match(new RegExp(`${arm}:\\s*"([^"]*)"`))?.[1] ?? null;
    if (got !== expected)
      throw new Error(`arm drift: ARM_WORD.${arm} is ${got === null ? "absent" : `"${got}"`} in geometry.ts, "${expected}" here`);
  }
  // and no arm may exist in geometry.ts that this script does not emit
  for (const arm of [...block.matchAll(/(\w+):\s*"/g)].map((m) => m[1])) {
    if (!(arm in ARM_WORD)) throw new Error(`arm drift: ARM_WORD.${arm} exists in geometry.ts but not here`);
  }
}

const INK = "#05161F";           // --cyanotype-900
const CHALK = "#F1F3F1";         // --chalk-50
const MUTED = "#1A5570";         // --cyanotype-600
const MUTED_INVERSE = "#86B6C7"; // --cyanotype-300 — the qualifier on the ink plate
const SULPHUR = "#E3CB2A";       // --sulphur-400
const WATERMARK_CHALK = "#DEEAEF"; // --cyanotype-100
const WATERMARK_PLATE = "#0B2B3A"; // --cyanotype-800

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

/* Every file announces its own brand: `okwe-move-stacked.svg` must not claim to
   be Okwe Knowledge. Defaulted to the parent. */
const svg = (w, h, body, ariaLabel = "Okwe") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${ariaLabel}">${fontStyle}
${body}
</svg>\n`;

/* Archivo at 125% width, weight 700: measured advance ≈ 0.86em per uppercase glyph
   run for "OKWE". Used only to size the artboard, never to position the baseline. */
const wordWidth = (fontSize, text) => Math.round(fontSize * 0.86 * text.length * 0.72);

/* ---- The four brands. `arm: null` is the parent: the wordmark alone. ---- */
const BRANDS = [
  {
    id: "okwe",
    name: "Okwe",
    arm: null,
    prefix: "okwe-",
    note: "The ecosystem mark. The wordmark alone, with no qualifier.",
  },
  {
    id: "okwe-knowledge",
    name: "Okwe Knowledge",
    arm: "knowledge",
    prefix: "okwe-knowledge-",
    note: "The publishing arm: one idea a week, written down.",
  },
  {
    id: "okwe-comms",
    name: "Okwe Comms",
    arm: "comms",
    prefix: "okwe-comms-",
    note: "The messaging arm, carrying the same mark and a different word.",
  },
  {
    id: "okwe-move",
    name: "Okwe Move",
    arm: "move",
    prefix: "okwe-move-",
    note: "The logistics arm, carrying the same mark and a different word.",
  },
];

const RULE =
  "One mark serves the whole ecosystem. The seed row never changes between arms: six counters from the okwe " +
  "board, three sown in sulphur, three open. OKWE is always set in Archivo at 125% width — the expansion is " +
  "the identity. An arm is one qualifier word in muted ink, beside the wordmark or beneath it; the parent, " +
  "Okwe, is the wordmark alone, and the absence of a word is what makes it the parent. Arms are never " +
  "differentiated by colour: verdigris and stamp red already carry meanings, and sulphur never carries type. " +
  "If you cannot tell two arms apart in greyscale, the lockup is wrong.";

/**
 * Every file for one brand. The five lockups are the same five geometry for all
 * four; only the qualifier word (and its absence) changes.
 */
function buildBrand({ name, arm, prefix }) {
  const word = arm ? ARM_WORD[arm] : null;
  const full = word ? `Okwe ${word}` : "Okwe";
  const out = [];

  /* ---- stacked: seeds above, name under (the primary mark) ---- */
  {
    const size = 48;
    const seed = size * LOCKUP.stacked.seed;
    const gap = size * LOCKUP.stacked.gap;
    const lines = word ? 2 : 1;
    const w = Math.round(Math.max(seedRowWidth(seed), wordWidth(size, word ?? "Okwe")) + 8);
    const h = Math.round(seed + gap + size * lines * 0.98 + 8);
    const base = seed + gap + size * 0.78;
    const qualifier = word
      ? `\n    <text class="word" x="0" y="${(base + size * 0.98).toFixed(1)}" font-size="${size}" fill="${MUTED}">${word}</text>`
      : "";
    out.push({
      file: `${prefix}stacked.svg`,
      label: "Stacked",
      variant: "stacked",
      tone: "ink",
      w,
      h,
      body: svg(
        w,
        h,
        `  <g>${seedsSvg(seed, 0, 0, { color: INK, fill: SULPHUR })}
    <text class="word" x="0" y="${base.toFixed(1)}" font-size="${size}" fill="${INK}">Okwe</text>${qualifier}
  </g>`,
        name,
      ),
    });
  }

  /* ---- inverse lockup, for the cyanotype plate ---- */
  {
    const size = 48;
    const seed = size * LOCKUP.stacked.seed;
    const gap = size * LOCKUP.stacked.gap;
    const lines = word ? 2 : 1;
    const w = Math.round(Math.max(seedRowWidth(seed), wordWidth(size, word ?? "Okwe")) + 32);
    const h = Math.round(seed + gap + size * lines * 0.98 + 32);
    const base = seed + gap + size * 0.78;
    const qualifier = word
      ? `\n    <text class="word" x="0" y="${(base + size * 0.98).toFixed(1)}" font-size="${size}" fill="${MUTED_INVERSE}">${word}</text>`
      : "";
    out.push({
      file: `${prefix}stacked-inverse.svg`,
      label: "Stacked, inverse",
      variant: "stacked",
      tone: "inverse",
      w,
      h,
      body: svg(
        w,
        h,
        `  <rect width="${w}" height="${h}" fill="${INK}"/>
  <g transform="translate(16,16)">${seedsSvg(seed, 0, 0, { color: CHALK, fill: SULPHUR })}
    <text class="word" x="0" y="${base.toFixed(1)}" font-size="${size}" fill="${CHALK}">Okwe</text>${qualifier}
  </g>`,
        name,
      ),
    });
  }

  /* ---- horizontal: seeds beside the name ---- */
  {
    const size = 40;
    const seed = size * LOCKUP.horizontal.seed;
    const gap = size * LOCKUP.horizontal.gap;
    const sw = seedRowWidth(seed);
    const w = Math.round(sw + gap + wordWidth(size, full) + 8);
    const h = Math.round(size * 1.3);
    const qualifier = word ? ` <tspan fill="${MUTED}">${word}</tspan>` : "";
    out.push({
      file: `${prefix}horizontal.svg`,
      label: "Horizontal",
      variant: "horizontal",
      tone: "ink",
      w,
      h,
      body: svg(
        w,
        h,
        `  <g>${seedsSvg(seed, 0, (h - seed) / 2, { color: INK, fill: SULPHUR })}
    <text class="word" x="${(sw + gap).toFixed(1)}" y="${(h / 2 + size * 0.35).toFixed(1)}" font-size="${size}" fill="${INK}">Okwe${qualifier}</text>
  </g>`,
        name,
      ),
    });
  }

  /* ---- wordmark: the name alone ---- */
  {
    const size = 48;
    const w = Math.round(wordWidth(size, full) + 8);
    const h = Math.round(size * 1.3);
    const qualifier = word ? ` <tspan fill="${MUTED}">${word}</tspan>` : "";
    out.push({
      file: `${prefix}wordmark.svg`,
      label: "Wordmark",
      variant: "wordmark",
      tone: "ink",
      w,
      h,
      body: svg(
        w,
        h,
        `  <text class="word" x="0" y="${(h / 2 + size * 0.35).toFixed(1)}" font-size="${size}" fill="${INK}">Okwe${qualifier}</text>`,
        name,
      ),
    });
  }

  /* ---- avatar: the mark on an ink square, for profile pictures ---- */
  {
    const size = 512;
    out.push({
      file: `${prefix}avatar.svg`,
      label: "Avatar",
      variant: "avatar",
      tone: "inverse",
      w: size,
      h: size,
      body: avatarSvg(size, { word, name }),
    });
  }

  return out;
}

/**
 * Font size for the arm word inside the square.
 *
 * Mirrors `avatarWordSize` in src/design-system/brand/geometry.ts, which the
 * React component uses — this script cannot import TypeScript. A flat ratio
 * clips: "Knowledge" is more than twice the length of "Move" and ran off both
 * edges of the 512px icon. Take the smaller of the design ratio and what fits.
 */
function avatarWordSize(size, word) {
  const byRatio = size * LOCKUP.avatar.word * 0.62;
  const byFit = (size * AVATAR_WORD_FIT) / (WORD_ADVANCE * word.length);
  return Math.min(byRatio, byFit);
}

/** The avatar, shared by the brand loop and by the PNG rasteriser. */
function avatarSvg(size, { word = null, name = "Okwe" } = {}) {
  const l = LOCKUP.avatar;
  const seed = size * l.seed;
  const gap = size * l.gap;
  const font = size * l.word;
  const qFont = word ? avatarWordSize(size, word) : 0;
  const blockH = seed + gap + font * 0.98 + (word ? qFont * 1.1 : 0);
  const top = (size - blockH) / 2;
  const base = top + seed + gap + font * 0.78;
  // On the plate the qualifier takes cyanotype-300, the same muted step the
  // inverse lockup uses. Still not a per-arm colour: every arm gets this one.
  const qualifier = word
    ? `\n    <text class="word" x="${size / 2}" y="${(base + qFont * 1.02).toFixed(1)}" font-size="${qFont.toFixed(1)}" fill="${MUTED_INVERSE}" text-anchor="middle">${word}</text>`
    : "";
  return svg(
    size,
    size,
    `  <rect width="${size}" height="${size}" fill="${INK}"/>
  <g>${seedsSvg(seed, (size - seedRowWidth(seed)) / 2, top, { color: CHALK, fill: SULPHUR })}
    <text class="word" x="${size / 2}" y="${base.toFixed(1)}" font-size="${font.toFixed(1)}" fill="${CHALK}" text-anchor="middle">Okwe</text>${qualifier}
  </g>`,
    name,
  );
}

const files = {};
const brandEntries = [];

for (const brand of BRANDS) {
  const lockups = buildBrand(brand);
  for (const l of lockups) files[l.file] = l.body;
  brandEntries.push({ brand, lockups });
}

/**
 * favicon: the seed row alone.
 * At 16px the wordmark is unreadable, and the seed row is the part of the mark
 * that survives — three sown, three open. Pure geometry, so it needs no font.
 * Shared across the whole ecosystem for the same reason: at that size a
 * qualifier word could not be read, so there is nothing to distinguish.
 */
{
  const S = 64;
  const seed = 8;
  const rowW = seedRowWidth(seed);
  const rows = `<g>${seedsSvg(seed, (S - rowW) / 2, (S - seed) / 2, { color: CHALK, fill: SULPHUR })}</g>`;
  files["favicon.svg"] =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="Okwe">
  <rect width="${S}" height="${S}" fill="${INK}"/>
  ${rows}
</svg>\n`;
}

/**
 * Watermarks: the seed row alone, flat, monochrome, no font embed.
 *
 * No `opacity` and no alpha anywhere. The tint is a real token step, so the
 * counters composite identically over any ground and the system stays flat
 * colour — an alpha wash would take a different value on every background.
 *
 * No sulphur. The sown counters take the same tint as the open ones: sulphur
 * never sits behind text, and a watermark is by definition behind text.
 *
 * No box, no rotation, no repeat. The row is the whole file.
 */
const watermarkSvg = (tint) => {
  const seed = 12;
  const w = seedRowWidth(seed);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${seed}" viewBox="0 0 ${w} ${seed}" role="img" aria-label="Okwe">
  <g>${seedsSvg(seed, 0, 0, { color: tint, fill: tint })}
  </g>
</svg>\n`;
};
files["watermark-chalk.svg"] = watermarkSvg(WATERMARK_CHALK);
files["watermark-plate.svg"] = watermarkSvg(WATERMARK_PLATE);

await mkdir(OUT, { recursive: true });
const bytes = {};
for (const [name, body] of Object.entries(files)) {
  await writeFile(path.join(OUT, name), body);
  bytes[name] = Buffer.byteLength(body);
  console.log(`  ${name.padEnd(34)} ${bytes[name]}B`);
}

/* ---- Rasters. Safari needs a PNG touch icon; OG cards must be raster. ---- */
const png = async (svgStr, w, h, name) => {
  const buf = await sharp(Buffer.from(svgStr), { density: 384 }).resize(w, h, { fit: "fill" }).png().toBuffer();
  await writeFile(path.join(OUT, name), buf);
  bytes[name] = buf.length;
  console.log(`  ${name.padEnd(34)} ${buf.length}B  ${w}x${h}`);
};

/* Each arm gets its own touch icon and its own 512: the avatar is the one place
   the qualifier is still legible at icon size. */
for (const { brand } of brandEntries) {
  const word = brand.arm ? ARM_WORD[brand.arm] : null;
  const art = avatarSvg(512, { word, name: brand.name });
  await png(art, 180, 180, `${brand.prefix}apple-touch-icon.png`);
  await png(art, 512, 512, `${brand.prefix}icon-512.png`);
}

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
  <text x="${W - M}" y="${H - M}" font-size="20" fill="${MUTED_INVERSE}" text-anchor="end" style="font-family:'Archivo',sans-serif;letter-spacing:1.6">okweknowledge.com · one idea a week</text>`,
    "Okwe Knowledge",
  );
  await writeFile(path.join(OUT, "og-default.svg"), og);
  bytes["og-default.svg"] = Buffer.byteLength(og);
  console.log(`  ${"og-default.svg".padEnd(34)} ${bytes["og-default.svg"]}B`);
  await png(og, 1200, 630, "og-default.png");
}

/* ---- The manifest. The kit page imports this, so the keys are a contract. ---- */
const logoManifest = {
  note: "Generated by scripts/build-logo-assets.mjs. Do not edit by hand.",
  generatedBy: "scripts/build-logo-assets.mjs",
  rule: RULE,
  brands: brandEntries.map(({ brand, lockups }) => ({
    id: brand.id,
    name: brand.name,
    arm: brand.arm,
    note: brand.note,
    lockups: lockups.map((l) => ({
      id: l.file.slice(brand.prefix.length).replace(/\.svg$/, ""),
      label: l.label,
      variant: l.variant,
      tone: l.tone,
      file: l.file,
      width: l.w,
      height: l.h,
      bytes: bytes[l.file],
    })),
    icons: [
      { file: `${brand.prefix}apple-touch-icon.png`, size: 180, use: "Apple touch icon" },
      { file: `${brand.prefix}icon-512.png`, size: 512, use: "PWA / maskable icon" },
    ],
  })),
  shared: [
    { file: "favicon.svg", label: "Favicon", bytes: bytes["favicon.svg"] },
    { file: "watermark-chalk.svg", label: "Watermark, chalk ground", bytes: bytes["watermark-chalk.svg"] },
    { file: "watermark-plate.svg", label: "Watermark, ink plate", bytes: bytes["watermark-plate.svg"] },
    { file: "og-default.svg", label: "Open Graph card", bytes: bytes["og-default.svg"] },
    { file: "og-default.png", label: "Open Graph card, raster", bytes: bytes["og-default.png"] },
  ],
};
const manifestJson = JSON.stringify(logoManifest, null, 2) + "\n";
await writeFile(path.join(OUT, "logo.manifest.json"), manifestJson);
console.log(`  ${"logo.manifest.json".padEnd(34)} ${Buffer.byteLength(manifestJson)}B`);

console.log(`\n→ ${path.relative(ROOT, OUT)}`);
