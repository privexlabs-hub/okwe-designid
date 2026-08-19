/**
 * The Okwe mark, as numbers.
 *
 * No logo file exists anywhere in the source project — the mark is drawn by code.
 * These constants are the single source of truth: the React `Logo`/`Seeds`
 * components read them, and so does scripts/build-logo-assets.mjs when it emits
 * the SVG files in public/assets/logo. Two renderers, one geometry, no drift.
 *
 * Transcribed from components/brand/Logo.jsx in the design-system bundle.
 */

/** The seed row: six counters from the okwe board, three sown, three open. */
export const SEEDS = {
  filled: 3,
  total: 6,
  /** Gap between counters, as a multiple of counter diameter. */
  gapRatio: 0.55,
  /** Ring thickness of an open counter, as a multiple of diameter (min 1px). */
  ringRatio: 0.15,
} as const;

export const seedGap = (size: number) => Math.round(size * SEEDS.gapRatio);
export const seedRing = (size: number) => Math.max(1, Math.round(size * SEEDS.ringRatio));

/** The wordmark: Archivo at maximum width. The expansion is the identity. */
export const WORDMARK = {
  fontFamily: "var(--font-display)",
  fontStretch: "125%",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "-0.02em",
  lineHeight: 0.98,
} as const;

/** Per-variant proportions, all relative to the `size` prop. */
export const LOCKUP = {
  stacked: { gap: 0.34, seed: 0.28 },
  horizontal: { gap: 0.55, seed: 0.42 },
  avatar: { gap: 0.11, seed: 0.088, word: 0.26 },
} as const;

export const INK = { normal: "var(--cyanotype-900)", inverse: "var(--chalk-50)" } as const;
export const MUTED = { normal: "var(--cyanotype-600)", inverse: "var(--cyanotype-300)" } as const;
export const SEED_FILL = "var(--sulphur-400)";
