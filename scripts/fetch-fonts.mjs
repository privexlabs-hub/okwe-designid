/**
 * One-time asset acquisition — NOT a build step.
 *
 * Downloads the three Okwe families as variable WOFF2 from the exact css2 URL
 * declared in src/design-system/tokens/fonts.css, writes them into
 * public/assets/fonts/, and records provenance + SHA-256 + variable axes in
 * public/assets/fonts/fonts.manifest.json.
 *
 * The build must never depend on Google answering a sniffed UA a particular way,
 * so the downloaded files are committed and `verify-fonts.mjs` asserts the
 * committed bytes still match the manifest. Re-run this only to refresh.
 *
 *   node scripts/fetch-fonts.mjs
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/assets/fonts");
const TOKENS = path.join(ROOT, "src/design-system/tokens/fonts.css");

// A real modern-Chrome UA is required: Google serves variable WOFF2 only to UAs
// it believes support it, and legacy UAs get static TTF instances instead.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** Read the css2 URL out of the design system's own fonts.css — never retyped. */
async function css2Url() {
  const css = await readFile(TOKENS, "utf8");
  const m = css.match(/@import url\("([^"]+)"\)/);
  if (!m) throw new Error(`No @import url() found in ${TOKENS}`);
  return m[1];
}

/** Parse every @font-face block, keeping the unicode-range subsets intact. */
function parseFaces(css) {
  const faces = [];
  for (const block of css.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
    const get = (prop) => block.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1]?.trim();
    const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
    if (!url) continue;
    faces.push({
      family: get("font-family")?.replace(/['"]/g, ""),
      style: get("font-style"),
      weight: get("font-weight"),
      stretch: get("font-stretch"),
      unicodeRange: get("unicode-range"),
      url,
    });
  }
  return faces;
}

/**
 * Read the variable axes straight out of the font's `fvar` table.
 * WOFF2 stores tables Brotli-compressed as one stream, so this decompresses the
 * font data with Node's built-in Brotli — no third-party font parser, and no
 * standing build dependency, because it runs once and the result is recorded.
 */
async function readAxes(woff2) {
  const { brotliDecompressSync } = await import("node:zlib");
  if (woff2.subarray(0, 4).toString("ascii") !== "wOF2") return null;

  const numTables = woff2.readUInt16BE(12);
  let p = 48; // WOFF2 header is 48 bytes, then the table directory
  const readBase128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = woff2[p++];
      v = (v << 7) | (b & 0x7f);
      if (!(b & 0x80)) return v;
    }
    throw new Error("bad base128");
  };
  const KNOWN = [
    "cmap","head","hhea","hmtx","maxp","name","OS/2","post","cvt ","fpgm","glyf","loca",
    "prep","CFF ","VORG","EBDT","EBLC","gasp","hdmx","kern","LTSH","PCLT","VDMX","vhea",
    "vmtx","BASE","GDEF","GPOS","GSUB","EBSC","JSTF","MATH","CBDT","CBLC","COLR","CPAL",
    "SVG ","sbix","acnt","avar","bdat","bloc","bsln","cvar","fdsc","feat","fmtx","fvar",
    "gvar","hsty","just","lcar","mort","morx","opbd","prop","trak","Zapf","Silf","Glat",
    "Gloc","Feat","Sill",
  ];
  const dir = [];
  for (let i = 0; i < numTables; i++) {
    const flags = woff2[p++];
    const idx = flags & 0x3f;
    let tag;
    if (idx === 0x3f) { tag = woff2.subarray(p, p + 4).toString("ascii"); p += 4; }
    else tag = KNOWN[idx];
    const origLength = readBase128();
    let transformLength = null;
    const version = flags >> 6;
    const transformed = (tag === "glyf" || tag === "loca") ? version === 0 : version !== 0;
    if (transformed) transformLength = readBase128();
    dir.push({ tag, length: transformLength ?? origLength });
  }

  const data = brotliDecompressSync(woff2.subarray(p));
  let off = 0;
  for (const t of dir) {
    if (t.tag === "fvar") {
      const fvar = data.subarray(off, off + t.length);
      const axisOffset = fvar.readUInt16BE(4);
      const axisCount = fvar.readUInt16BE(8);
      const axisSize = fvar.readUInt16BE(10);
      const axes = {};
      for (let i = 0; i < axisCount; i++) {
        const a = axisOffset + i * axisSize;
        axes[fvar.subarray(a, a + 4).toString("ascii")] = {
          min: fvar.readInt32BE(a + 4) / 65536,
          def: fvar.readInt32BE(a + 8) / 65536,
          max: fvar.readInt32BE(a + 12) / 65536,
        };
      }
      return axes;
    }
    off += t.length;
  }
  return null; // static instance: no fvar table at all
}

const main = async () => {
  await mkdir(OUT, { recursive: true });
  const url = await css2Url();
  console.log(`css2  ${url}\n`);

  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`css2 request failed: ${res.status} ${res.statusText}`);
  const css = await res.text();

  const faces = parseFaces(css);
  if (!faces.length) throw new Error("No @font-face blocks parsed from the css2 response.");

  const seen = new Map();
  const entries = [];
  for (const face of faces) {
    // css2 emits one face per (family, style, unicode-range subset). Keep them all:
    // dropping the non-latin subsets would silently narrow glyph coverage.
    const slug = face.family.toLowerCase().replace(/\s+/g, "-");
    const italic = face.style === "italic" ? "-italic" : "";
    const n = (seen.get(slug + italic) ?? 0) + 1;
    seen.set(slug + italic, n);
    const file = `${slug}${italic}-${String(n).padStart(2, "0")}.woff2`;

    const r = await fetch(face.url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`font download failed: ${face.url} ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    await writeFile(path.join(OUT, file), buf);

    const axes = await readAxes(buf);
    entries.push({
      file,
      family: face.family,
      style: face.style ?? "normal",
      weight: face.weight ?? null,
      stretch: face.stretch ?? null,
      unicodeRange: face.unicodeRange ?? null,
      axes,
      bytes: buf.length,
      sha256: sha256(buf),
      sourceUrl: face.url,
    });
    const axisStr = axes
      ? Object.entries(axes).map(([t, a]) => `${t} ${a.min}–${a.max}`).join(", ")
      : "STATIC (no fvar)";
    console.log(`  ${file.padEnd(28)} ${String(buf.length).padStart(7)}B  ${axisStr}`);
  }

  // The width axis IS the identity. A static instance here would silently remove
  // the one behaviour the whole brand rests on, so fail rather than ship it.
  const required = { Archivo: "wdth", "Martian Mono": "wdth", Literata: "opsz" };
  const problems = [];
  for (const [family, axis] of Object.entries(required)) {
    const forFamily = entries.filter((e) => e.family === family);
    if (!forFamily.length) problems.push(`${family}: no faces downloaded`);
    else if (!forFamily.every((e) => e.axes && axis in e.axes))
      problems.push(`${family}: missing required variable axis "${axis}"`);
  }
  if (problems.length) {
    console.error("\nFAILED — variable axes missing:\n  " + problems.join("\n  "));
    process.exit(1);
  }

  await writeFile(
    path.join(OUT, "fonts.manifest.json"),
    JSON.stringify(
      {
        note: "Generated by scripts/fetch-fonts.mjs. Files are committed; the build only verifies these hashes.",
        generatedFrom: url,
        userAgent: UA,
        licence: "SIL Open Font License 1.1 (all three families)",
        requiredAxes: required,
        fonts: entries,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`\n${entries.length} files → public/assets/fonts/ (+ fonts.manifest.json)`);
};

main().catch((e) => { console.error(e); process.exit(1); });
