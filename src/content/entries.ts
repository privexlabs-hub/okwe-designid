/**
 * The ten register entries on the index page.
 * Copy is verbatim from "Okwe Knowledge.dc.html"; only the hrefs are rewritten
 * from Design Canvas file paths to Next routes.
 */
export interface RegisterEntry {
  num: string;
  title: string;
  body: string;
  meta: string;
  href: string;
}

export const ENTRIES: RegisterEntry[] = [
  {
    num: "01",
    title: "Brand playbook",
    body: "How Okwe looks, sounds and decides. Brand strategy, voice and writing rules, the social and content playbooks, the template library and the visual thesis — browsable in one place.",
    meta: "SIX DOCUMENTS · READ FIRST",
    href: "/playbook",
  },
  {
    num: "02",
    title: "Post editor",
    body: "The production tool. Pick a named template, enter the copy, pass the quality gate, export PNG, PDF or ZIP. Every published asset comes from here — no ad-hoc canvases.",
    meta: "OKW-TOOL-EDITOR-01 · PROTOTYPE",
    href: "/post-editor",
  },
  {
    num: "03",
    title: "Social profile kit",
    body: "Avatars, banners, bios and pinned content for every platform, tiered for a two-person team. Eight profiles, one institution.",
    meta: "TIER 1–3 · ALL PLATFORMS",
    href: "/social-kit",
  },
  {
    num: "04",
    title: "Example content",
    body: "The identity tested on twelve real pieces — a definition, a statistic, a thread, a thumbnail, an A4 report cover. The acceptance test for any change to the system.",
    meta: "TWELVE PROOFS · ALL FORMATS",
    href: "/content-proofs",
  },
  {
    num: "05",
    title: "Carousel template",
    body: "The standard six-part set — cover, problem, framework, comparison, conclusion, CTA — at 1080×1350. Duplicate it, replace the copy, keep the structure.",
    meta: "OKW-SOC-IG-CAROUSEL-01 · EDITABLE",
    href: "/carousel",
  },
  {
    num: "06",
    title: "Launch plan",
    body: "The first 30 days week by week, then the 90-day framework: three themes, one research question a week, and the evidence bar a topic must clear before it becomes a paid product.",
    meta: "30 + 90 DAYS · IN THE PLAYBOOK",
    href: "/playbook#content-playbook--30-day-launch-plan",
  },
  {
    num: "07",
    title: "Question register",
    body: "The most valuable file in the company. Every question from a comment, DM, workshop or conversation — where it came from, when it arrived, how often it has appeared, and whether we can answer it with evidence. Priority is frequency times the cost of getting it wrong.",
    meta: "OKW-REG-01 · KEPT IN THIS BROWSER",
    href: "/register",
  },
  {
    num: "08",
    title: "Brand assets",
    body: "Every mark for Okwe, its three processes — Okwe Knows, Okwe Coms and Okwe Move — and the Okwe Knowledge imprint, with the rule that governs them. Stacked, horizontal, wordmark and avatar lockups, app icons and document watermarks, downloadable as vector, raster or one kit.",
    meta: "OKW-BRAND-01 · FIVE MARKS",
    href: "/brand",
  },
  {
    num: "09",
    title: "Brand context",
    body: "Everything above, as plain Markdown you can paste into any model. Strategy, voice, the playbooks, the template codes, the publishing gate and the profiles — eleven sections, each copyable on its own, or downloadable as one file.",
    meta: "OKW-CTX-01 · ELEVEN SECTIONS",
    href: "/context",
  },
  {
    num: "10",
    title: "Brand guidelines",
    body: "How Okwe looks and sounds, in one place: the business and its three processes, the marks, every colour and when to use it — info, success, warning, error, highlight — type, space, the recurring devices, the voice, components, slides, UI kits and governance. Every value is read from the design tokens.",
    meta: "OKW-GUIDE-01 · TWELVE SECTIONS",
    href: "/guidelines",
  },
];

/** Header line and register foot, verbatim from the source document. */
export const MASTHEAD = {
  callNumber: "OKW·OS/01 · OPERATING SYSTEM · 19 AUG 2026",
  strapline: "TWO PEOPLE · THREE PILLARS · ONE REGISTER",
  headline: "The publishing operating system",
  lede: "How Okwe looks, how it sounds, what it publishes, how one idea becomes many assets, and how content becomes products. Ten entries. Everything a two-person team needs to publish from day one.",
  destination: "okweknowledge.com · one idea a week",
} as const;
