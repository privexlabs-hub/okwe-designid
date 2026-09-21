import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * The design tokens, read out of the token CSS at build time.
 *
 * The brand guidelines show every colour, size and rule the system defines.
 * Copying those values into a table would give the page a second source of
 * truth that could drift from the first, so it reads the CSS instead. Under
 * `output: "export"` this runs once, during `next build`; nothing ships to the
 * browser but the result.
 *
 * Node-only (`fs`). Import it from a server component — importing it into a
 * client component fails the build on `fs`, which is the intended failure.
 *
 * The files are compact `--name:value;` declarations inside one top-level
 * `:root{}` and, in colors.css, one `[data-theme="plate"]{}`. `@media` blocks
 * are removed before parsing: breakpoints.css overrides `--rail-*` inside media
 * queries, and those are responsive adjustments, not the canonical values.
 */

const TOKEN_DIR = path.join(process.cwd(), "src/design-system/tokens");

/** Read in this fixed order — never by glob — so the result never depends on file names. */
export const TOKEN_FILES = ["colors", "typography", "spacing", "elevation", "motion", "breakpoints"] as const;
export type TokenFile = (typeof TOKEN_FILES)[number];

export interface Token {
  name: string;
  file: TokenFile;
  /** The declared value, as written. */
  value: string;
  /** The plate-mode value, as written, when plate mode overrides it. */
  plate?: string;
  /** A trailing `/* … *\/` on the same line, if the file gives one. */
  note?: string;
}

export interface RampStep {
  token: string;
  step: string;
  hex: string;
}

export interface Ramp {
  name: string;
  steps: RampStep[];
}

export interface TokenSet {
  byName: Record<string, Token>;
  byFile: Record<TokenFile, Token[]>;
  ramps: Ramp[];
  /** Follow `var()` to a literal. Colour tokens resolve to `#hex` or `rgba(…)`. */
  resolve: (name: string, plate?: boolean) => string;
}

export const RAMP_NAMES = ["chalk", "cyanotype", "sulphur", "verdigris", "stamp"] as const;

/** Remove every `@media … { … }` block, braces balanced. */
function stripMedia(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf("@media", i);
    if (at === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, at);
    let j = css.indexOf("{", at);
    let depth = 0;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}" && --depth === 0) break;
    }
    i = j + 1;
  }
  return out;
}

const DECL = /--([\w-]+)\s*:\s*([^;]+);([ \t]*\/\*\s*(.*?)\s*\*\/)?/g;

function declarations(block: string): { name: string; value: string; note?: string }[] {
  return [...block.matchAll(DECL)].map((m) => ({
    name: `--${m[1]}`,
    value: m[2].trim(),
    note: m[4] || undefined,
  }));
}

function block(css: string, selector: RegExp): string {
  return [...css.matchAll(selector)].map((m) => m[1]).join("\n");
}

export function readTokens(): TokenSet {
  const byName: Record<string, Token> = {};
  const byFile = Object.fromEntries(TOKEN_FILES.map((f) => [f, [] as Token[]])) as Record<
    TokenFile,
    Token[]
  >;

  for (const file of TOKEN_FILES) {
    const css = stripMedia(readFileSync(path.join(TOKEN_DIR, `${file}.css`), "utf8"));
    for (const d of declarations(block(css, /:root\s*\{([^}]*)\}/g))) {
      // First declaration wins: the files are read in a fixed order.
      if (byName[d.name]) continue;
      const token: Token = { ...d, file };
      byName[d.name] = token;
      byFile[file].push(token);
    }
    for (const d of declarations(block(css, /\[data-theme="plate"\]\s*\{([^}]*)\}/g))) {
      if (byName[d.name]) byName[d.name].plate = d.value;
    }
  }

  const resolve = (name: string, plate = false): string => {
    let value = byName[name] ? (plate && byName[name].plate) || byName[name].value : name;
    for (let hops = 0; hops < 8; hops++) {
      const ref = value.match(/^var\((--[\w-]+)\)$/);
      if (!ref) break;
      const next = byName[ref[1]];
      if (!next) break;
      value = (plate && next.plate) || next.value;
    }
    return value;
  };

  const ramps: Ramp[] = RAMP_NAMES.map((name) => ({
    name,
    steps: byFile.colors
      .filter((t) => new RegExp(`^--${name}-\\d+$`).test(t.name))
      .map((t) => ({ token: t.name, step: t.name.split("-").pop() as string, hex: t.value })),
  }));

  return { byName, byFile, ramps, resolve };
}

/** A colour token that is not a ramp step: an alias with a job. */
export const isAlias = (name: string) =>
  !new RegExp(`^--(${RAMP_NAMES.join("|")})-\\d+$`).test(name);

/**
 * How many source files reference each token as `var(--name)` — so the page
 * can say "defined, not yet used by any component" as a measurement, not a
 * claim that goes stale. The token folder is skipped (tokens reference each
 * other), and so is the guidelines page itself, whose examples would otherwise
 * count as uses.
 */
export function tokenUsage(names: string[]): Record<string, number> {
  const root = path.join(process.cwd(), "src");
  const skip = [TOKEN_DIR, path.join(root, "app/guidelines"), path.join(root, "content/guidelines.ts")];
  const texts: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (skip.includes(p)) continue;
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(e.name)) texts.push(readFileSync(p, "utf8"));
    }
  };
  walk(root);
  return Object.fromEntries(
    names.map((n) => [n, texts.filter((txt) => txt.includes(`var(${n})`)).length]),
  );
}
