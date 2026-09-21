/**
 * The brand context pack — everything Okwe states about itself, as Markdown.
 *
 * A projection, not a document. Six sections are the playbook, converted; five
 * are the rules that live only in TypeScript and were never readable as prose:
 * the publishing gate, the template codes, the logo rule, the profiles and the
 * question register. Change any of those sources and the pack changes with
 * them, which is the point — a brand brief that drifts from the code that
 * enforces it is worse than none.
 *
 * Pure: no React, no DOM, no storage. Same discipline as `quality.ts`, and for
 * the same reason — this runs at build time, so a malformed corpus fails
 * `next build` instead of shipping an empty page.
 */

import DOCS from "@/content/playbook-docs.json";
import { LOGO_MANIFEST } from "@/content/brand";
import { BUSINESS } from "@/content/business";
import { SECTION_NOTE, TASKS } from "@/content/context";
import { MASTHEAD } from "@/content/entries";
import { PROFILES } from "@/content/profiles";
import { COSTS, SOURCES } from "@/content/register";
import { TEMPLATES } from "@/content/templates";
import {
  BANNED_WORDS,
  CRITERIA,
  FLOOR,
  HARD_STOP,
  ILLUSTRATIVE,
  MAX_TOTAL,
  THRESHOLD,
} from "@/lib/quality";
import { htmlToMarkdown } from "@/lib/markdown";

export interface PackSection {
  id: string;
  /** Two digits, matching the numbering the whole system uses. */
  num: string;
  title: string;
  /** One line: what this section is for. */
  note: string;
  /** Where it came from. Shown in the margin and written into the pack. */
  source: string;
  markdown: string;
}

interface PlaybookDoc {
  slug: string;
  title: string;
  num: string;
  heading: string;
  html: string;
}

const docs = DOCS as PlaybookDoc[];

const doc = (slug: string): PlaybookDoc => {
  const found = docs.find((d) => d.slug === slug);
  // A missing document would silently shorten the pack, so refuse instead.
  if (!found) throw new Error(`pack: playbook-docs.json has no "${slug}" document.`);
  return found;
};

/** `| a | b |` with the delimiter row. Cells never contain a pipe — checked. */
function table(head: string[], rows: string[][]): string {
  return [
    `| ${head.join(" | ")} |`,
    `|${" --- |".repeat(head.length)}`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");
}

/* ------------------------------------------------------------ sections ---- */

function startHere(index: Array<{ num: string; title: string; note: string }>): string {
  const marks = LOGO_MANIFEST.brands.map((b) => `- **${b.name}** — ${b.note}`).join("\n");
  return [
    "# Okwe Knowledge — brand context",
    "This document is the whole of what Okwe has written down about itself: strategy, voice, the social and content playbooks, the template library, the visual thesis, and the rules its own publishing tool enforces. Every section is quoted from a source named at the top of that section. Nothing has been summarised or rewritten for this file.",
    "Paste the sections you need, then a task from section 10. If you only have room for some of it, section 06 (the visual thesis) is the one to drop when you are writing rather than designing.",
    "## The institution",
    table(
      ["Field", "Value"],
      [
        ["Business", BUSINESS.name],
        ["Name", "Okwe Knowledge"],
        ["Line", MASTHEAD.headline],
        ["Shape", MASTHEAD.strapline.toLowerCase()],
        ["Home", MASTHEAD.destination],
      ],
    ),
    MASTHEAD.lede,
    "## The business",
    ...BUSINESS.overview,
    `The trade journey: ${BUSINESS.core.journey.join(" → ")}.`,
    BUSINESS.core.steps.map((s) => `- **${s.title}** ${s.body}`).join("\n"),
    table(
      ["Process", "Role", "Purpose"],
      BUSINESS.processes.map((p) => [p.name, p.role, p.purpose]),
    ),
    `The promise: ${BUSINESS.value.promise} The philosophy: ${BUSINESS.philosophy}`,
    "## The marks",
    "Okwe is the parent; Okwe Knows, Okwe Coms and Okwe Move are its three processes; Okwe Knowledge is the publishing imprint of Okwe Knows.",
    marks,
    "## What is in this pack",
    table(
      ["#", "Section", "What it covers"],
      index.map((s) => [s.num, s.title, s.note]),
    ),
  ].join("\n\n");
}

function templateLibrary(): string {
  const rows = TEMPLATES.map((t) => [
    `\`${t.code}\``,
    t.name,
    t.platform,
    t.canvas,
    // `status` is optional and absent means rendered — templates.ts says so.
    t.status ?? "rendered",
    t.note ?? "",
  ]);
  return [
    htmlToMarkdown(doc("template-library").html),
    "## The library as the editor holds it",
    `${TEMPLATES.length} codes. "rendered" means the editor can honestly produce it; "documented" means it is in the library with no renderer yet; "held" means the playbook itself withholds it.`,
    table(["Code", "Name", "Platform", "Canvas", "Status", "Note"], rows),
  ].join("\n\n");
}

function visualThesis(): string {
  return [
    htmlToMarkdown(doc("visual-thesis").html),
    "## The rule for the marks",
    "Stated honestly: the playbook documents no sub-brand marks. The rule below is derived from rules the design system does state; the process names come from the owner's business document.",
    `> ${LOGO_MANIFEST.rule}`,
  ].join("\n\n");
}

function publishingGate(): string {
  return [
    "# The publishing gate",
    "The score every piece is measured against before it publishes. This is not advice in a document — it is enforced in the post editor, and the source-line rule below is the one check that refuses an export outright.",
    "## The ten criteria",
    `Each scored 0–5. Threshold ${THRESHOLD}/${MAX_TOTAL}, with nothing below ${FLOOR}. Unscored is absent, not zero — a piece nobody scored must read differently from a bad one.`,
    CRITERIA.map((c) => `- ${c.label}`).join("\n"),
    "## Hard stops",
    `- ${HARD_STOP.map((h) => CRITERIA.find((c) => c.id === h)?.label ?? h).join(" or ")} below ${FLOOR} stops the piece whatever the total.`,
    "- No data template renders without a source field filled. A figure without a source line is a bug, not a style choice.",
    `- A number that was not measured carries these exact words: "${ILLUSTRATIVE}"`,
    "## Banned vocabulary",
    "Checked across the whole piece, not the active slide. Emoji and exclamation marks are refused alongside these:",
    BANNED_WORDS.map((w) => `- ${w}`).join("\n"),
  ].join("\n\n");
}

function profiles(): string {
  return [
    "# Profiles and bios",
    `${PROFILES.length} surfaces, one institution. The platform changes the format; the notation never changes.`,
    table(
      ["Platform", "Handle", "Tier", "What it is for", "Bio"],
      PROFILES.map((p) => [p.platform, p.handle, p.tier, p.role, p.bio]),
    ),
  ].join("\n\n");
}

function questionRegister(): string {
  return [
    "# The question register",
    "Every question a reader asks, recorded and ranked. It sits at the front of the loop: Question → Research → Content → Audience → Product.",
    "## The five fields",
    [
      `- **Question** — in the reader's words, not ours.`,
      `- **Source** — ${SOURCES.join(", ")}.`,
      "- **Date** — when it arrived.",
      "- **Count** — how many times it has appeared.",
      "- **Answerable** — can we answer it with evidence, today?",
    ].join("\n"),
    "## Priority",
    "`priority = frequency × cost of getting it wrong`",
    "The playbook does not define a cost scale, so this one is ours — stated here rather than hidden, because a formula with an undocumented term is not a formula:",
    table(
      ["Cost", "Level", "Meaning"],
      COSTS.map((c) => [String(c.value), c.label, c.note]),
    ),
  ].join("\n\n");
}

function tasks(): string {
  return [
    "# Tasks",
    "Paste one of these after the sections above.",
    ...TASKS.flatMap((t) => [`## ${t.label}`, t.prompt]),
  ].join("\n\n");
}

/* ---------------------------------------------------------------- pack ---- */

/**
 * Build every section, in reading order.
 *
 * Called at the top of the page's render body, never lazily — so if the corpus
 * ever grows a tag the converter does not handle, `next build` fails loudly
 * instead of the page shipping blank.
 */
export function buildPack(): PackSection[] {
  const fromDoc = (num: string, slug: string, note: string, body?: string): PackSection => {
    const d = doc(slug);
    return {
      id: slug,
      num,
      title: d.title,
      note,
      source: `playbook-docs.json · ${slug}`,
      markdown: body ?? htmlToMarkdown(d.html),
    };
  };

  /* Section 00 lists the sections, so the rest are built first and it is
     composed from them — a contents page cannot be written before the book. */
  const rest: PackSection[] = [
    fromDoc("01", "brand-strategy", SECTION_NOTE.strategy),
    fromDoc("02", "voice-and-writing", SECTION_NOTE.voice),
    fromDoc("03", "social-playbook", SECTION_NOTE.social),
    fromDoc("04", "content-playbook", SECTION_NOTE.content),
    {
      ...fromDoc("05", "template-library", SECTION_NOTE.templates, templateLibrary()),
      source: "playbook-docs.json · template-library + templates.ts",
    },
    {
      ...fromDoc("06", "visual-thesis", SECTION_NOTE.visual, visualThesis()),
      source: "playbook-docs.json · visual-thesis + logo.manifest.json",
    },
    {
      id: "gate",
      num: "07",
      title: "The publishing gate",
      note: SECTION_NOTE.gate,
      source: "src/lib/quality.ts",
      markdown: publishingGate(),
    },
    {
      id: "profiles",
      num: "08",
      title: "Profiles and bios",
      note: SECTION_NOTE.profiles,
      source: "src/content/profiles.ts",
      markdown: profiles(),
    },
    {
      id: "register",
      num: "09",
      title: "The question register",
      note: SECTION_NOTE.register,
      source: "src/content/register.ts",
      markdown: questionRegister(),
    },
    {
      id: "tasks",
      num: "10",
      title: "Tasks",
      note: SECTION_NOTE.tasks,
      source: "src/content/context.ts",
      markdown: tasks(),
    },
  ];

  return [
    {
      id: "start",
      num: "00",
      title: "Start here",
      note: SECTION_NOTE.start,
      source: "entries.ts · business.ts · logo.manifest.json",
      markdown: startHere(rest.map(({ num, title, note }) => ({ num, title, note }))),
    },
    ...rest,
  ];
}

/** Join selected sections into one pasteable document, each keeping its source. */
export function joinPack(sections: PackSection[]): string {
  return sections
    .map((s) => `<!-- ${s.num} · ${s.title} · source: ${s.source} -->\n\n${s.markdown}`)
    .join("\n\n---\n\n");
}
