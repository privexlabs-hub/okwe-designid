/**
 * The publishing gate, as the playbook defines it.
 *
 * `voice-and-writing` (02): "Score every proposed piece 0–5 on ten criteria:
 * usefulness, accuracy, originality, clarity, relevance, evidence, practical
 * application, audience fit, longevity, brand fit." Threshold 35/50 with no
 * single score below 3. Accuracy or evidence below 3 is a hard stop whatever
 * the total. Below threshold "it becomes research, not a post."
 *
 * `content-playbook` (04) adds the rule this module actually enforces at
 * export: "no data template renders without a source field filled. Illustrative
 * numbers must say 'Illustrative example — not a measured figure'."
 *
 * Pure on purpose: no DOM, no React, and no knowledge of `EditorDoc` or
 * `CarouselDraft`. Callers flatten their own model into the small shapes below.
 */

export const CRITERIA = [
  { id: "usefulness", label: "Usefulness" },
  { id: "accuracy", label: "Accuracy" },
  { id: "originality", label: "Originality" },
  { id: "clarity", label: "Clarity" },
  { id: "relevance", label: "Relevance" },
  { id: "evidence", label: "Evidence" },
  { id: "practical", label: "Practical application" },
  { id: "audience", label: "Audience fit" },
  { id: "longevity", label: "Longevity" },
  { id: "brand", label: "Brand fit" },
] as const;

export type CriterionId = (typeof CRITERIA)[number]["id"];
export type Score = 0 | 1 | 2 | 3 | 4 | 5;
export const SCORES: Score[] = [0, 1, 2, 3, 4, 5];

/**
 * Unscored criteria are ABSENT, not zero. "A piece nobody scored is a piece
 * nobody owns" — an unscored piece must read differently from a bad one.
 */
export type QualityScore = Partial<Record<CriterionId, Score>>;

export const THRESHOLD = 35;
export const MAX_TOTAL = CRITERIA.length * 5;
export const FLOOR = 3;
/** Below 3 on either of these stops the piece regardless of the total. */
export const HARD_STOP: CriterionId[] = ["accuracy", "evidence"];
export const ILLUSTRATIVE = "Illustrative example — not a measured figure";

export interface ScoreVerdict {
  total: number;
  scored: number;
  unscored: CriterionId[];
  belowFloor: CriterionId[];
  hardStop: CriterionId[];
  /** Fully scored, at or above threshold, nothing under the floor. */
  meetsThreshold: boolean;
}

export function verdictFor(score: QualityScore): ScoreVerdict {
  const unscored: CriterionId[] = [];
  const belowFloor: CriterionId[] = [];
  const hardStop: CriterionId[] = [];
  let total = 0;

  for (const { id } of CRITERIA) {
    const value = score[id];
    if (value === undefined) {
      unscored.push(id);
      continue;
    }
    total += value;
    if (value < FLOOR) {
      belowFloor.push(id);
      if (HARD_STOP.includes(id)) hardStop.push(id);
    }
  }

  const scored = CRITERIA.length - unscored.length;
  return {
    total,
    scored,
    unscored,
    belowFloor,
    hardStop,
    meetsThreshold:
      unscored.length === 0 && total >= THRESHOLD && belowFloor.length === 0,
  };
}

/* ------------------------------------------------------------- vocabulary */

/** The banned list, verbatim from `voice-and-writing`. */
export const BANNED_WORDS = [
  "leverage",
  "synergy",
  "utilise",
  "utilize",
  "unlock",
  "empower",
  "game-changer",
  "game changer",
  "revolutionary",
  "in today's fast-paced world",
  "the next generation of",
] as const;

export type FlagField =
  | "eyebrow"
  | "title"
  | "body"
  | "principle"
  | "cta"
  | "source"
  | "piece";

export interface Flag {
  /** 0-based slide index; -1 for a piece-level flag. */
  slide: number;
  field: FlagField;
  kind: "vocabulary" | "emoji" | "exclamation";
  detail: string;
}

export interface TextField {
  slide: number;
  field: FlagField;
  text: string;
}

/** Curly apostrophes must not smuggle a banned phrase past the check. */
const normalise = (s: string) => s.replace(/[‘’]/g, "'").toLowerCase();

const WORD_PATTERNS = BANNED_WORDS.map((phrase) => ({
  phrase,
  // Single words get word boundaries; multi-word phrases are matched literally.
  re: phrase.includes(" ")
    ? null
    : new RegExp(`\\b${phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i"),
}));

const EMOJI = /\p{Extended_Pictographic}/u;

/**
 * Scan every text field of every slide.
 *
 * The playbook bans emoji and exclamation marks outright, alongside the
 * vocabulary list, so all three are reported the same way.
 */
export function scanText(fields: TextField[]): Flag[] {
  const flags: Flag[] = [];

  for (const { slide, field, text } of fields) {
    if (!text) continue;
    const hay = normalise(text);

    for (const { phrase, re } of WORD_PATTERNS) {
      const hit = re ? re.test(text) : hay.includes(phrase);
      if (hit) flags.push({ slide, field, kind: "vocabulary", detail: phrase });
    }
    if (EMOJI.test(text)) {
      flags.push({ slide, field, kind: "emoji", detail: "emoji" });
    }
    if (text.includes("!")) {
      flags.push({ slide, field, kind: "exclamation", detail: "exclamation mark" });
    }
  }

  return flags;
}

/* --------------------------------------------------------- the hard rule */

/** Slide kinds that publish a figure and therefore owe a source. */
export const DATA_KINDS = ["stat", "compare", "rank", "timeline"] as const;

export interface DataGateSlide {
  kind: string;
  source?: string;
}

export interface DataGateInput {
  slides: DataGateSlide[];
  contentType: string;
}

/**
 * The one rule that blocks an export: a data asset with no source line.
 *
 * Everything else in this module advises. This refuses, because the brand's
 * whole position rests on it — "a statistic cannot render without a source
 * line."
 */
export function blockedReasons({ slides, contentType }: DataGateInput): string[] {
  const reasons: string[] = [];
  slides.forEach((slide, i) => {
    const isData =
      (DATA_KINDS as readonly string[]).includes(slide.kind) || contentType === "Numbers";
    if (!isData) return;
    if (!slide.source || !slide.source.trim()) {
      reasons.push(`Slide ${String(i + 1).padStart(2, "0")} shows a figure with no source line.`);
    }
  });
  return reasons;
}
