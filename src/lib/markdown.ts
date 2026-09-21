/**
 * HTML → Markdown, for the brand context pack.
 *
 * The six playbook documents are stored as pre-rendered HTML
 * (`src/content/playbook-docs.json`) and injected into `/playbook` with
 * `dangerouslySetInnerHTML`. That is readable but not portable: to hand the
 * brand to a model you need plain text with its structure intact.
 *
 * This is a tokeniser, not a parser, and that is a decision the corpus earns.
 * Every document was scanned before this was written:
 *
 *   - well-formed throughout, no unclosed tags
 *   - list nesting depth 1, table nesting depth 1 — never deeper
 *   - no <br>, no HTML entities, no attributes except `id` on h1/h2/h3
 *   - inside <td>/<th>: only strong, code and em
 *   - not one cell contains a literal `|`
 *
 * A general HTML parser would be weight this corpus does not need. If the
 * corpus ever stops matching those invariants, `verify-additions.mjs` fails
 * with `tag drift:` and this function throws — see SUPPORTED_TAGS.
 *
 * Pure string in, string out. No DOMParser: client components are prerendered
 * by `next build` in Node, where DOMParser does not exist, so a DOM-based
 * converter would ship an empty page under `output: "export"`.
 */

/**
 * Every tag this converter understands.
 *
 * `scripts/verify-additions.mjs` reads this array out of this file as text and
 * checks the corpus against it, so the list lives in exactly one place. Adding
 * a tag here without handling it below will throw at the first document that
 * uses it — which is the intent.
 */
export const SUPPORTED_TAGS = [
  "h1", "h2", "h3", "p", "ul", "ol", "li",
  "table", "tr", "th", "td",
  "pre", "code", "strong", "em", "blockquote", "hr",
] as const;

const SUPPORTED = new Set<string>(SUPPORTED_TAGS);

/** Matches one tag or one run of text. Attributes are read and discarded. */
const TOKEN = /<(\/?)([a-zA-Z0-9]+)[^>]*>|([^<]+)/g;

/**
 * Convert one document's HTML to Markdown.
 *
 * Blocks are joined by a blank line; the lines *within* a table or a list are
 * joined by a single newline. That distinction is the whole game — a table
 * whose rows are separated by blank lines is not a table, it is a column of
 * pipes, and a model reads it as prose.
 *
 * @throws if the HTML contains a tag this converter does not handle. Leaking
 * raw markup into text somebody pastes into a model is worse than failing.
 */
export function htmlToMarkdown(html: string): string {
  const blocks: string[] = [];

  /** Inline text accumulates here until a block tag closes and claims it. */
  let buf = "";
  /** Rows of the table being read, then the cells of the current row. */
  let table: string[][] | null = null;
  let row: string[] | null = null;
  /** Lines of the list being read, and the ordered-list counter. */
  let items: string[] | null = null;
  let ordered = 0;
  /** Which list we are inside. Depth is 1, but a stack states that. */
  const lists: string[] = [];
  /** Inside <pre>, whitespace is content and must not be collapsed. */
  let preformatted = false;
  let quoted = false;

  const collapse = (s: string) => s.replace(/\s+/g, " ");
  const take = () => {
    const s = buf.trim();
    buf = "";
    return s;
  };

  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;

  while ((m = TOKEN.exec(html))) {
    const [, closing, tag, text] = m;

    if (text !== undefined) {
      buf += preformatted ? text : collapse(text);
      continue;
    }
    if (!SUPPORTED.has(tag)) {
      throw new Error(
        `htmlToMarkdown: <${tag}> is not supported. Add it to SUPPORTED_TAGS and handle it, ` +
          `or the pack would carry raw HTML into somebody's prompt.`,
      );
    }

    // hr is void — it never carries content and never pairs.
    if (tag === "hr") {
      blocks.push("---");
      continue;
    }

    if (!closing) {
      switch (tag) {
        case "strong": buf += "**"; break;
        case "em": buf += "_"; break;
        case "code": buf += "`"; break;
        case "pre": preformatted = true; buf = ""; break;
        case "table": table = []; break;
        case "tr": row = []; break;
        case "blockquote": quoted = true; break;
        case "ul":
        case "ol":
          lists.push(tag);
          items = [];
          ordered = 0;
          break;
        default: buf = "";
      }
      continue;
    }

    switch (tag) {
      case "strong": buf += "**"; break;
      case "em": buf += "_"; break;
      case "code": buf += "`"; break;

      case "h1": blocks.push(`# ${take()}`); break;
      case "h2": blocks.push(`## ${take()}`); break;
      case "h3": blocks.push(`### ${take()}`); break;

      case "p": {
        const s = take();
        if (s) blocks.push(quoted ? `> ${s}` : s);
        break;
      }

      case "pre": {
        // Fenced, so the atomisation tree keeps its box-drawing characters.
        blocks.push("```\n" + buf.replace(/^\n+|\n+$/g, "") + "\n```");
        preformatted = false;
        buf = "";
        break;
      }

      case "th":
      case "td": row?.push(take()); break;

      case "tr": {
        if (row) table?.push(row);
        row = null;
        break;
      }

      case "table": {
        if (table && table.length) {
          const [head, ...rest] = table;
          const lines = [
            `| ${head.join(" | ")} |`,
            `|${" --- |".repeat(head.length)}`,
            ...rest.map((r) => `| ${r.join(" | ")} |`),
          ];
          blocks.push(lines.join("\n"));
        }
        table = null;
        break;
      }

      case "li": {
        const s = take();
        const marker = lists[lists.length - 1] === "ol" ? `${++ordered}. ` : "- ";
        items?.push(marker + s);
        break;
      }

      case "ul":
      case "ol": {
        lists.pop();
        if (items && items.length) blocks.push(items.join("\n"));
        items = null;
        break;
      }

      case "blockquote": quoted = false; break;
    }
  }

  return blocks.join("\n\n");
}
