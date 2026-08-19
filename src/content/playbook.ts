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
