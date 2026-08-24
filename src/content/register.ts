/**
 * OKW-REG-01 — the question register.
 *
 * The playbook calls this "the most valuable file in the company" and it is the
 * front of the loop: Question → Research → Content → Audience → Product.
 * Documented fields, verbatim: the question · where it came from · the date ·
 * how many times it has appeared · whether we can answer it with evidence.
 */

export const SOURCES = ["Comment", "DM", "Workshop", "Conversation"] as const;
export type QuestionSource = (typeof SOURCES)[number];

/** The documented formula needs a cost term; the playbook does not define a
 *  scale, so this is ours — and it is shown on the page, not hidden here. */
export const COSTS = [
  { value: 1, label: "Low", note: "Getting it wrong costs an hour." },
  { value: 2, label: "Moderate", note: "Getting it wrong costs a decision." },
  { value: 3, label: "High", note: "Getting it wrong costs money on a shipment." },
  { value: 4, label: "Severe", note: "Getting it wrong costs a business its margin." },
] as const;

export type Cost = 1 | 2 | 3 | 4;

export interface Question {
  id: string;
  text: string;
  source: QuestionSource;
  /** ISO yyyy-mm-dd. */
  date: string;
  /** How many times it has appeared. Always at least 1. */
  count: number;
  /** Can we answer it with evidence, today? */
  answerable: boolean;
  cost: Cost;
  note?: string;
}

/** priority = frequency × cost of getting it wrong. */
export const priority = (q: Question) => q.count * q.cost;

export const costLabel = (c: Cost) => COSTS.find((x) => x.value === c)?.label ?? "Low";

export const REGISTER_INTRO = {
  code: "OKW-REG-01",
  title: "The most valuable file in the company",
  lede: "Every question a reader asks — in a comment, a DM, a workshop or a conversation. Where it came from, when it arrived, how often it has appeared, and whether we can answer it with evidence. Priority is frequency times the cost of getting it wrong.",
  foot: "KEPT IN THIS BROWSER · NOTHING LEAVES THIS MACHINE",
} as const;

export const REGISTER_SEED: Question[] = [
  {
    id: "q-landed-cost",
    text: "What is the real landed cost of a container from Guangzhou to Lagos?",
    source: "DM",
    date: "2026-07-14",
    count: 11,
    answerable: true,
    cost: 4,
    note: "Asked with different ports every week. The answer is a worked example, not a number.",
  },
  {
    id: "q-port-wait",
    text: "Why do containers sit at the port for weeks after they arrive?",
    source: "Comment",
    date: "2026-07-29",
    count: 8,
    answerable: true,
    cost: 3,
  },
  {
    id: "q-hs-code",
    text: "Who decides the HS code on my goods, and what happens if it is wrong?",
    source: "Workshop",
    date: "2026-08-03",
    count: 5,
    answerable: false,
    cost: 4,
    note: "We can describe the process. We cannot yet cite a ruling.",
  },
  {
    id: "q-docs-delay",
    text: "Which document is usually missing when a shipment is held?",
    source: "Conversation",
    date: "2026-08-11",
    count: 4,
    answerable: false,
    cost: 2,
  },
  {
    id: "q-price-first",
    text: "How do I price a product before I have bought a single unit?",
    source: "Comment",
    date: "2026-08-18",
    count: 2,
    answerable: true,
    cost: 2,
  },
];
