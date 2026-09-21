/**
 * OKW-CTX-01 — copy for the brand context pack.
 *
 * The pack itself is assembled in `src/lib/pack.ts` from sources that already
 * exist: the six playbook documents, the publishing gate, the template
 * library, the profiles and the question register. This file holds only what
 * the page says about them — the header, one line per section, and the three
 * task prompts.
 *
 * The task prompts are the only instructions here. Every constraint they name
 * is documented elsewhere in the repo and cited in the comment above it, so a
 * reader can check that none of it was invented for the occasion.
 */

export const CONTEXT_INTRO = {
  code: "OKW-CTX-01",
  title: "Brand context",
  lede: "Everything Okwe knows about itself, as plain text you can paste into any model. Nothing here is new — every section is quoted from the playbook or from the code that enforces it. Take the whole pack, or take the sections the job needs.",
  foot: "EVERY SECTION IS QUOTED FROM THE PLAYBOOK OR THE CODE THAT ENFORCES IT",
} as const;

/** One line per section, shown beside its number in the ledger. */
export const SECTION_NOTE = {
  start: "What this pack is, what Okwe is, and how to use the sections below.",
  strategy: "Belief, positioning, essence, promise, mission, values, archetype, audience, messaging pillars — and what this brand is not.",
  voice: "How we write. Voice attributes, person and tone, the writing rules, the banned constructions, headlines, hooks and calls to action.",
  social: "Platform tiers and cadence, per-platform writing rules, the four launch series, the atomisation framework, metrics.",
  content: "How an idea becomes a piece. The editorial operating system, batching, the three pillars, the 30-day launch plan and the 90-day framework.",
  templates: "The naming scheme and every template code, with the canvas it renders at and whether the editor can produce it.",
  visual: "Why the brand looks like this. Palette, typography, the seven theses, the decision record — and the rule that governs the marks.",
  gate: "The ten criteria a piece is scored against before it publishes, the thresholds, the hard stops and the banned vocabulary.",
  profiles: "Every platform surface: handle, tier, what it is for, and the bio it carries.",
  register: "How reader questions are recorded and ranked, and the formula that decides what gets written next.",
  tasks: "Three prompts to paste after the sections above.",
} as const;

export interface PackTask {
  id: string;
  label: string;
  prompt: string;
}

/**
 * The three tasks the pack is built for.
 *
 * Sources for every constraint named below:
 *   voice attributes, writing rules, claim classes  — playbook doc 02
 *   ten criteria, 35/50, floor 3, accuracy/evidence — src/lib/quality.ts
 *   "Illustrative example…"                         — quality.ts ILLUSTRATIVE, verbatim
 *   three pillars and their weights                 — playbook doc 04
 *   four launch series, tiers, cadence              — playbook doc 03
 *   30-day launch plan, batching table              — playbook doc 04
 *   template codes                                  — src/content/templates.ts
 */
export const TASKS: PackTask[] = [
  {
    id: "piece",
    label: "Write one piece",
    prompt:
      "Using the sections above, draft one [content type] for [platform] on [topic]. Follow the voice attributes and writing rules in 02. Give every claim a class — fact, interpretation, opinion or unknown. Every figure needs a source line; if it is not measured, label it “Illustrative example — not a measured figure.” Score it against the ten criteria in 07 and report the total. If it is under 35/50, or accuracy or evidence is under 3, say so and stop.",
  },
  {
    id: "strategy",
    label: "Build a content strategy",
    prompt:
      "Using the sections above, propose a content strategy for the next quarter. Use only the three documented pillars and their weights in 04, and only the four launch series in 03. Respect the platform tiers and cadences in 03. Do not add a platform, pillar or series that is not listed.",
  },
  {
    id: "calendar",
    label: "Build a 30-day calendar",
    prompt:
      "Using the sections above, lay out a 30-day publishing calendar for a two-person team. Follow the 30-day launch plan and the batching table in 04, and the per-platform cadence in 03. For every entry give the date, series, pillar, platform, template code from 05, and the question it answers. Mark anything that would need research we have not done.",
  },
];
