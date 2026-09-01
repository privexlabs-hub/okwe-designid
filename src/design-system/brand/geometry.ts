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

/**
 * The arms of the Okwe ecosystem. The parent, Okwe, is the ABSENCE of an arm.
 *
 * A closed union, not free text: the wordmark is not a generic text renderer,
 * and nobody should be able to mint an arm by passing a string.
 *
 * The source documents no sub-brand marks at all, so this is derived from the
 * rules the system does state — one mark, one palette, the arm named in muted
 * ink. Arms are never differentiated by colour: verdigris and stamp red are
 * already bound to meanings (interpretation/success, opinion/danger), and
 * sulphur never carries type.
 */
export const LOGO_ARMS = ["knowledge", "comms", "move"] as const;
export type LogoArm = (typeof LOGO_ARMS)[number];

/** The qualifier word, set in MUTED beside or beneath OKWE. */
export const ARM_WORD: Record<LogoArm, string> = {
  knowledge: "Knowledge",
  comms: "Comms",
  move: "Move",
};

/**
 * Archivo at 125% width advances roughly this much per character, as a
 * fraction of the font size. Used only to FIT a word into a box, never to
 * position a baseline — the browser does the real typesetting.
 */
export const WORD_ADVANCE = 0.619;

/** The share of the avatar square the qualifier word may occupy. */
export const AVATAR_WORD_FIT = 0.84;

/**
 * Font size for the arm word inside an avatar square.
 *
 * A fixed ratio is not enough: "Knowledge" is more than twice the length of
 * "Move", and at the same size it runs off both edges of the square. This
 * takes the smaller of the design ratio and the size that actually fits.
 *
 * `scripts/build-logo-assets.mjs` mirrors this arithmetic — it cannot import
 * TypeScript — and checks itself against these constants at build time.
 */
export function avatarWordSize(size: number, word: string): number {
  const byRatio = size * 0.26 * 0.62;
  const byFit = (size * AVATAR_WORD_FIT) / (WORD_ADVANCE * word.length);
  return Math.min(byRatio, byFit);
}

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
