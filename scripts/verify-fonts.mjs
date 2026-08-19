/**
 * Asserts the committed font files still match fonts.manifest.json, and that the
 * required variable axes are recorded. Cheap, offline, no font parsing — the axis
 * check happened once at download time in fetch-fonts.mjs.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public/assets/fonts");
const manifest = JSON.parse(await readFile(path.join(DIR, "fonts.manifest.json"), "utf8"));

const problems = [];
for (const f of manifest.fonts) {
  let buf;
  try {
    buf = await readFile(path.join(DIR, f.file));
  } catch {
    problems.push(`${f.file}: missing`);
    continue;
  }
  const got = createHash("sha256").update(buf).digest("hex");
  if (got !== f.sha256) problems.push(`${f.file}: sha256 mismatch`);
}

for (const [family, axis] of Object.entries(manifest.requiredAxes)) {
  const faces = manifest.fonts.filter((f) => f.family === family);
  if (!faces.length) problems.push(`${family}: no faces in manifest`);
  else if (!faces.every((f) => f.axes && axis in f.axes))
    problems.push(`${family}: variable axis "${axis}" missing — the width contrast would be lost`);
}

if (problems.length) {
  console.error("Font verification FAILED:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log(`Fonts OK — ${manifest.fonts.length} files, hashes match, required axes present.`);
