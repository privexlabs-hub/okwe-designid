import docsJson from "./playbook-docs.json";

/**
 * The six playbook documents, pre-rendered to HTML.
 *
 * This is the exact `window.OKWE_DOCS` payload from the source project's
 * `playbook/docs.js`, extracted to JSON. Heading ids already follow the
 * `<slug>--<heading-slug>` scheme, which is what makes deep links such as
 * `#content-playbook--30-day-launch-plan` resolve — the index page's sixth
 * register entry depends on it.
 */
export interface PlaybookDoc {
  slug: string;
  title: string;
  num: string;
  heading: string;
  html: string;
}

export const DOCS: PlaybookDoc[] = docsJson;

export const DEFAULT_DOC = "brand-strategy";

/** The two named jumps the source's nav rail offers under "Launch". */
export const LAUNCH_LINKS = [
  { label: "30-day launch plan", slug: "content-playbook", anchor: "content-playbook--30-day-launch-plan" },
  { label: "90-day framework", slug: "content-playbook", anchor: "content-playbook--90-day-framework" },
] as const;

/**
 * One section of one playbook document, as its rendered HTML: the `<h2>` with
 * this id and everything after it up to the next `<h2>` (or the end).
 *
 * Lets another page quote the playbook rather than paraphrase it — the brand
 * guidelines render these slices in the same `.okwe-doc` styles /playbook uses,
 * so a rule reads identically wherever it appears. Throws on an id that does
 * not exist, so a renamed heading fails the build instead of quietly vanishing.
 */
export function playbookSection(slug: string, headingId: string): string {
  const doc = DOCS.find((d) => d.slug === slug);
  if (!doc) throw new Error(`playbookSection: no document "${slug}"`);
  const start = doc.html.indexOf(`<h2 id="${headingId}">`);
  if (start === -1) throw new Error(`playbookSection: no heading "${headingId}" in "${slug}"`);
  const next = doc.html.indexOf("<h2", start + 4);
  return doc.html.slice(start, next === -1 ? undefined : next);
}
