# Okwe Knowledge

The publishing operating system for **Okwe Knowledge** — a frontend-only Next.js
app ported from the Claude Design project
[`02418c77-e7a2-445f-86ef-3e457e131818`](https://claude.ai/design/p/02418c77-e7a2-445f-86ef-3e457e131818).

Two people · three pillars · one register.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → out/
npm start            # serve the export on :3000
```

## What this is

The source project is a complete brand and publishing system authored as Design
Canvas HTML plus React JSX, which only runs inside Claude Design's canvas runtime
(`support.js`, `<x-dc>`, `<x-import>`, `<sc-for>`). This repository is that system
rebuilt as a standalone static site: same design system, same copy, same
notation — no runtime, no backend, no third-party requests.

| Route | Ported from | What it does |
| --- | --- | --- |
| `/` | `Okwe Knowledge.dc.html` | The index register — six entries, each opened by a 3px ink rule that turns sulphur on hover. |
| `/playbook` | `Playbook.dc.html` + `playbook/docs.js` | The six brand documents, with working deep links and cross-document search. |
| `/post-editor` | `post-editor/*.jsx` | The production tool: template → copy → quality gate → **real** PNG / JPG / PDF / SVG / ZIP export. |
| `/social-kit` | `social-kit/SocialKit.jsx` | Eight profiles with tier filtering and copy-to-clipboard bios, plus the template set at true canvas sizes. |
| `/content-proofs` | `content-proofs/Proofs.jsx` | The twelve proofs, with a working plate-mode switch and a jump index. |
| `/carousel` | `carousel/SocialCarousel.dc.html` | The six-part set at 1080×1350, editable in place and exportable. |
| `/register` | `content-playbook` (04) | The question register — *"the most valuable file in the company"*. Five documented fields, priority = frequency × cost of getting it wrong, promote-a-question-into-a-draft. |
| `/brand` | derived from the design system's own rules | Every mark — Okwe, its three processes Okwe Knows, Okwe Coms and Okwe Move, and the Okwe Knowledge imprint — with the rule that governs them. SVG masters, PNG at 1×/2×/3×, PDF, app icons, watermarks, and a kit ZIP. |
| `/guidelines` | the token CSS, the playbook, and the owner's business document | The brand guidelines in twelve sections — Overview, Logo, Colour, Type, Spacing, Radius & shadow, Motif, Voice, Components, Slides, UI kits, Governance. Every value is read from the tokens at build. |
| `/context` | derived from the playbook and the code that enforces it | The brand as plain Markdown — eleven sections, each copyable on its own, downloadable as one file. Built to be pasted into a model. |
| `/design-system` | `_ds/…/_ds_bundle.js` | Every component on one specimen sheet, so consistency is checked rather than assumed. Includes the five colour ramps (hex read back from the live custom properties), the type scale, a width-contrast specimen, and a plate-mode block. |

## How it is built

**Next.js 15 App Router · React 19 · TypeScript strict · `output: "export"`.**
No API routes, no server actions, no middleware, no ISR, no `next/image`
optimizer — it is a pure static site that runs from any file server.

**No Tailwind.** The design system is token- and rule-based; its own CSS custom
properties are the styling layer. Tailwind's defaults (radii, shadows, its own
scale) would fight a system whose whole position is *square corners, rules not
boxes, no elevation*.

```
src/
  app/                    one folder per route
  design-system/
    tokens/*.css          the 8 token files, copied verbatim from the source
    styles.css            the single entry point
    brand/geometry.ts     the mark, as numbers — one source of truth
    components/           29 components ported from the bundle
  content/                copy and data, separated from layout
  lib/export.ts           client-side PNG / PDF / ZIP
public/assets/            fonts and logo — see public/assets/README.md
scripts/                  asset generation and verification
```

### The design system

All 29 components were **ported by transcription** from the design system
bundle, which ships unminified. Every style value, ratio and CSS variable is the
source's own; nothing was redesigned. Two Design Canvas runtime behaviours were
reproduced after reading `support.js` rather than guessing at them:

- `style-hover="…"` compiles to a generated CSS class carrying the declaration
  under a `:hover` selector — a real CSS rule, so it is a real CSS rule here,
  not React state.
- `sc-for list as` is a plain `.map()`.

### Typography is the identity

The brand's owned behaviour is **width contrast**: headlines in Archivo at
118–125% width against Martian Mono at 87.5%. That only works with genuine
variable fonts, so the build refuses to ship a static instance —
`scripts/fetch-fonts.mjs` reads the `fvar` table of every file it downloads and
fails if the required axis is missing, and `npm run verify` asserts in a real
browser that the axis is actually applied.

All three families are self-hosted from `public/assets/fonts`. Nothing is
fetched from Google at runtime.

## Responsive

The design system defines one structure — an index rail (104px), a reading field,
and an annotation margin (216px). That frame is what has to survive a narrow
screen, so the app folds it in a fixed order rather than inventing a second design:

1. the **annotation margin** folds under the field — it is commentary
2. the **index rail** folds above the field — it is a label
3. **content grids** become one column

Rules still run edge to edge, corners stay square, and headlines keep their 118%
stretch — they scale with the viewport rather than dropping the width axis, because
the expansion is the identity, not the absolute size.

Breakpoints live in `src/design-system/tokens/breakpoints.css`:

| Token | Width | What changes |
| --- | --- | --- |
| `--bp-xs` | 400px | small phone; fixed-size artwork scrolls in its own box |
| `--bp-sm` | 600px | index rail folds; single column throughout |
| `--bp-md` | 860px | headlines clamp; the playbook rail becomes a header band |
| `--bp-lg` | 1100px | annotation margin folds; the tool layouts collapse |
| `--bp-xl` | 1320px | the full ledger (`--page-max`) |

Fixed-size publishing canvases (1080×1350 slides, 1500×500 banners, A4 report pages)
are artwork at true pixel size — they are never squeezed. They scroll inside their
own container so the page itself never scrolls sideways.

Under `@media (pointer: coarse)` every control is raised to `--tap-min` (44px); the
system's own controls are 26–46px, which is below the touch minimum on the small sizes.

## Exporting

Two paths, one implementation — `src/lib/export.ts`:

- **One asset, one format.** Every canvas carries a `<DownloadControl>`: pick
  **PNG**, **JPG**, **PDF** or **SVG** and take just that file. You never have to
  export a whole set to get a single slide.
- **The whole set.** The post editor's export dialog still batches every slide,
  builds the combined PDF and packages a ZIP.

Both render from the same offscreen staging node at the **true canvas size**, so a
single-slide download is the same 1080×1350 asset the batch produces — not the
on-screen preview. `exportOne()` is the primitive; the batch helpers call it per asset.

## Verification

Everything runs against the **production static export**, not the dev server.

```bash
npm run build
npx serve out -l 4321
npm run verify        # 111 checks across four suites
npm run audit         # 54 viewport x route combinations
```

- `scripts/verify-app.mjs` — every route renders, no console errors, **zero
  third-party requests**, all three fonts genuinely loaded (`document.fonts.check`),
  the width axis measurably applied, and the index's deep link into the playbook resolves.
- `scripts/verify-interactions.mjs` — real state changes: hover and focus rules,
  keyboard order, `prefers-reduced-motion`, tier filtering, plate mode repainting
  the ground, and the quality gate's score actually dropping on banned vocabulary.
- `scripts/verify-export.mjs` — clicks the real export buttons and checks the
  downloaded files: six PNGs at true 1080×1350, non-blank rasters with the
  webfont embedded, and a ZIP containing every slide plus the combined PDF.
  It also drives the **per-asset** control — deliberately the *second* slide's,
  to prove it is per-slide and not just "whatever is active" — and verifies each
  of PNG / JPG / PDF / SVG arrives as exactly one correctly-named file, at true
  canvas size, with a valid header and its type embedded.

- `scripts/audit-responsive.mjs` — renders all seven routes at 320 / 390 / 768 /
  1024 / 1440 / 1920 and reports page overflow, **clipped content**, **overlapping
  panels** and sub-9px text. The clipping and overlap checks matter: a panel with
  `overflow: hidden` reports zero page overflow while silently cutting off its own
  children, so an unusable three-panel layout can pass a naive audit. Pass `--shots`
  to write a screenshot per viewport×route.

- `scripts/verify-additions.mjs` — the four additions: autosave survives a reload and the shelf
  saves/lists/deletes; the ten criteria render, score 50/50, and report the hard stop; the full
  banned list, emoji and exclamation marks are flagged deck-wide; a data asset with no source
  refuses to export; each new data card renders at its true canvas size; documented-but-unrendered
  templates are plain rows, never buttons; and promoting a question lands on the editor with the
  handoff key consumed exactly once.

`npm run shots` screenshots every route for visual review.

## The editorial operating system

The playbook does not only describe a brand — it commissions tools, and specifies most of them
down to field names and thresholds. These are those tools:

**The question register** (`/register`) sits at the front of the
`Question → Research → Content → Audience → Product` loop. Five documented fields, sorted by the
documented formula `priority = frequency × cost of getting it wrong`. The playbook gives no cost
scale, so ours is four levels — and it is **rendered on the page**, not hidden in code. A question
can be promoted straight into a draft.

**The publishing gate** (`src/lib/quality.ts`) implements the score as written: ten criteria at
0–5, threshold ≥35/50, nothing below 3, and a hard stop if accuracy or evidence falls under 3.
Unscored criteria are *absent*, not zero — *"a piece nobody scored is a piece nobody owns."* The
banned vocabulary is the full documented list plus emoji and exclamation marks, checked across the
whole deck rather than the active slide.

Exactly **one rule refuses an export**: *"no data template renders without a source field filled."*
Everything else warns and asks a person to tick *"Export anyway — I own this decision."* The score
is an editorial act, not an automated lock; the source line is non-negotiable. A figure that was
never measured gets the playbook's exact words via a checkbox —
*"Illustrative example — not a measured figure."*

**Drafts** (`src/lib/store.ts`) keep work in the browser. A versioned envelope stores an opaque
document per kind, so the editor's and the carousel's incompatible models are served side by side
without being merged. Autosave restores in an effect, never from `useState` — seeding state from
storage is a hydration mismatch, and the honest cost is one frame of the default document.

**The template library** grew from 8 to 33 of the 30 documented codes plus variants: 23 the editor
can honestly render, 9 listed as *documented, not yet rendered* with the reason, and 1 held —
`OKW-ACA-CERT-01`, which the playbook itself withholds *"until outcomes are assessable."* The
unrendered ones are plain rows, never buttons, so nothing offers to open a template that does not
exist.

Three new data cards complete the `DAT` domain, each composed on `PostCanvas` like `StatCard`:
`ComparisonCard` (two tallies, ink versus sulphur), `RankCard` (numbered rows, capped at eight) and
`TimelineCard` (one hairline, square-ended ticks, capped at six). No arrows, no curves, no dots.

## Article banners

The post editor renders `OKW-EDI-ARTICLE-01`, the playbook's *"Article header — call number,
headline, lede, class stamps"*, which until now was listed as documented but not rendered. Pick
**Article header** under the rail's **Editorial** chip, type the headline and subtitle once, and the
same design leaves in four sizes:

| Size | Use | Where the number comes from |
| --- | --- | --- |
| 1920×1080 | LinkedIn article / newsletter cover | LinkedIn Help, *Cover images in articles* |
| 1200×630 | Share card — site Open Graph, LinkedIn and X link previews | LinkedIn Help (1.91:1); the brand's own share card is already 1200×630 |
| 1500×600 | X article header | X recommends 5:2 for an article image; 1500 is the width the X header canvas already uses |
| 1600×900 | X in-post image · Medium header | the playbook's X size (`OKW-SOC-X-INSIGHT-01`); meets Medium Help's ≥1400px wide, 16:9 |
| 1080×1080 | Feed post | the playbook's feed square |

The playbook gives no article pixel sizes, so these are the platforms' own. X states 5:2 for an
article image, which 1500×600 hits exactly. For link previews X's card documentation could not be
retrieved; secondary guides give 2:1, and a 2:1 crop of the share card removes about 15px top and
bottom — inside the canvas margin.

**The mark is the register foot**, as on every canvas: six seeds and the wordmark. The foot names
the mark — Okwe Knowledge by default, or Okwe Knows, Okwe Coms, Okwe Move, or the parent Okwe alone — through a
new `brand` prop on `PostCanvas` that defaults to Knowledge, so every existing canvas is unchanged.
The destination is an editable field defaulting to `okweknowledge.com`, because that is the only
documented domain; the other arms' addresses are typed, not guessed.

**Type is set per size** (`ARTICLE_TYPE` in `ArticleCard.tsx`) rather than scaled by width, because a
1200×630 sheet is wide but short. `LEDE_FIT` is the longest subtitle measured to fit the share card
beside a 62-character headline; the Inspector shows it the way it shows the headline's 62 — a layout
limit, not a brand rule. `verify-additions.mjs` measures the headline and subtitle against the index
band and the register foot at every size.

**Export** takes any size or all of them, in PNG, JPG, PDF or SVG at 1× or 2×, one by one or as a
ZIP. Files keep the documented pattern and gain the size, so four sizes never overwrite each other:
`okwe-knowledge-the-trade-desk-what-landed-cost-includes-slide-01-1200x630.png`. Every other
template's names are unchanged.

One guard was also made real. `SlideArt`'s dispatch claimed a `never` check, but it was an
`Exclude<>` followed by an `as` cast that accepted anything — a new slide kind would have rendered
silently as a carousel slide. It now narrows through the early returns and assigns to
`CarouselSlideKind` with no cast, so an unhandled kind fails `tsc`.

## The context pack

`/context` answers a question the rest of the app could not: how do you get the brand *out*?

The six playbook documents are stored as pre-rendered HTML and injected into `/playbook` with
`dangerouslySetInnerHTML` — readable, but not portable. The rules that actually *enforce* the brand
were worse off: the ten-criterion gate, the banned vocabulary, the source-line rule, the template
codes, the profiles and the question register existed only as TypeScript, rendered as UI controls
and never as prose. There was no Markdown serialisation anywhere in the repo.

The pack is a **projection, not a document**. Eleven sections: six are the playbook converted, five
are the code, and two — `00 · Start here` and `10 · Tasks` — are the only new prose in the feature.
Nothing is summarised or rewritten, and every section prints the source it came from, because a
brand whose first rule is *"show where you got it"* cannot ship an unsourced brief.

Two sections carry an honesty flag rather than laundering a local decision into fact: the arm rule
says the source documents no sub-brand marks, and the question register's cost scale says the
playbook defines no scale, so that one is ours. Both disclosures already exist in the code
(`geometry.ts`, `register.ts:14`); the pack repeats them.

`src/lib/markdown.ts` is a tokeniser, not a parser, and the corpus earns it: scanned end to end it
is well-formed, nests lists and tables no deeper than one, and contains no `<br>`, no entities, no
attributes but heading `id`s, and not one cell with a literal `|`. It is **pure string in, string
out** — no `DOMParser`, because client components are prerendered by `next build` in Node, where
`DOMParser` does not exist, and a DOM-based converter would ship a blank page under
`output: "export"`. It throws on any tag it does not handle, and `verify-additions.mjs` reads
`SUPPORTED_TAGS` back out of the file as text to check the corpus against it — the same
read-the-constant-from-source trick the logo generator uses on `geometry.ts`.

One rule is easy to get wrong and is worth stating: a table and a list are each **one block whose
lines are joined by a single newline**, and blocks are joined by a blank line. Separate a header row
from its delimiter with a blank line and it stops being a table and becomes a column of pipes. A
check pins it.

The whole pack is ~60,500 characters, roughly 15,000 tokens. Section 06, the visual thesis, is
nearly a third of that and is the first to drop when you are writing rather than designing — which
is why sections are individually selectable rather than one blob.

## Okwe, its processes and the imprint

The business is **Okwe Import Export Solutions** — in the owner's words, "an integrated trade and
logistics business focused on facilitating the movement of goods from opportunity to destination",
run through three processes that "are not separate businesses": **Okwe Knows** (knowledge &
intelligence), **Okwe Coms** (communication & commerce) and **Okwe Move** (movement & logistics).
Know → Coms → Move. The document lives verbatim in `src/content/business.ts`.

**Okwe Knowledge is kept** as the publishing imprint of Okwe Knows. The playbook, okweknowledge.com,
the social handles and the documented export names all carry it, so none of them was rewritten; the
imprint simply stops being counted as a process.

There are five marks: **Okwe** (the parent), the three processes, and the imprint. The playbook
documents no sub-brand marks, so the rule is **derived from what the design system does state**:

> One mark serves the whole business. The seed row never changes between marks. OKWE is always
> Archivo at 125% width. A process is one qualifier word in muted ink; the parent is the wordmark
> alone. **Marks are never differentiated by colour.**

No process colour, because nothing is left unclaimed: verdigris is bound to `--class-interpretation`,
`--status-success` and `--data-3`; stamp red to `--class-opinion` and `--status-danger`; sulphur
never carries type. A process coloured verdigris would read as "interpretation" wherever the two met.

In code the processes are `LOGO_ARMS = ["knows", "coms", "move"]` — a closed union, not free text —
and one helper, `brandWord()` in `geometry.ts`, names every mark, so the register foot, the export
file prefix and the editor's mark picker cannot disagree. `Logo`'s `knowledge` prop is the imprint;
its fourteen existing call sites render unchanged, and so does every canvas foot and every
`okwe-knowledge-…` file name.

### The assets

`npm run assets:logo` emits **41 files (3.4 MB)** into `public/assets/logo/`, manifest
included, which `/brand` imports at build time — so the page can never list a file that was not
written. 35 brand files (5 marks × stacked, stacked-inverse, horizontal, wordmark, avatar,
and two app icons each), a shared favicon, two watermarks and the OG pair. The superseded Comms
files were removed when the mark was renamed to Coms.

**The favicon is shared.** At 16px a qualifier is unreadable, and an unreadable word is noise; the
180 and 512 icons have room to name their mark, so they do.

**The watermark** is the seed row alone in a real tint step (`--cyanotype-100` on chalk,
`--cyanotype-800` on the plate) — no opacity and no alpha, so it composites flat over any ground,
and no sulphur, because sulphur never sits behind text.

Rasters are **not** pre-generated. PNG at 1×/2×/3× and PDF are rendered in the browser from the live
`<Logo>` you are looking at, via the export library that already existed. The SVG download serves
the **master file** rather than `toSvgString`, which wraps the DOM in a `foreignObject` — a
screenshot in SVG clothing.

## Brand guidelines

`/guidelines` covers the twelve sections the owner named. It is a projection, like `/context`:
**values are read from the token CSS at build** (`src/lib/tokens.ts`, from a server component), so a
changed token changes the page, and the words live in `src/content/guidelines.ts`, each with its
source.

- **Colour** shows every step of every ramp with the aliases that point at it, every alias with its
  plate value, and WCAG 2.1 contrast computed from the hex (`src/lib/contrast.ts`). The five states —
  info, success, warning, error, highlight — map to real tokens; error is `--status-danger`, and
  highlight has no token because it is sulphur's marking role. Whether a status token is used is
  **measured** at build, not asserted: today only `--status-danger` is.
- **The arithmetic corrected one number.** The visual thesis says "cyanotype-800 on chalk-100 =
  13.9:1"; computed, it is 12.2:1. The playbook stays verbatim and the page states both.
- **The arithmetic also explains two rules.** Sulphur-400 on chalk measures about 1.3:1, which is why
  sulphur never carries text. `--status-warning` (sulphur-600) measures 3.3:1, enough for large text
  and marks but not body text, so the page says body-size warning text stays in ink.
- **Gaps are stated, not filled**: no clear-space rule exists, and the "1px optical relief on inputs"
  the radius comment mentions is not implemented.

## Known limits

- **The PDF is raster.** Each page is an image of the slide at true canvas size,
  not selectable or searchable text. A vector PDF would need the type re-laid-out
  by a PDF engine.
- **Image upload and template persistence are not implemented.** The source
  prototype listed both as unbuilt; only its export gap was filled.
- **No photography exists.** The source shipped none, so image wells are labelled
  placeholders, as they are upstream.
- **`ThumbnailCard` clips long titles.** Its heading is a fixed `104 * u` with no
  clamp inside a fixed 16:9 box, so a four-line title overruns the card and pushes
  `question` out of view. This is the source's own geometry, left as-is; the
  `/design-system` sheet shows a deliberately labelled failing specimen next to two
  that fit, rather than hiding it.
- The seed mark is the design system's own proposal, not a client-supplied logo —
  see the "Open items" section of the source `readme.md`.

## Deviations from the source

Deliberate, and each one is commented at the site of the change:

1. **`CarouselSlide` and `ThumbnailCard` headings had no explicit colour.** The
   design system's `base.css` sets `h2 { color: var(--text-primary) }`, and an
   element rule beats an inherited one — so on a cyanotype plate the cover
   headline rendered dark-on-dark and disappeared. Both now pick their colour
   from `inverse`, as every sibling element in those components already did.
2. **`pick()` in the post editor set `theme: k === "chalk"`** — comparing a slide
   *kind* to a *theme* name, always false, yielding `theme: undefined`. Corrected
   to the literal `"chalk"`.
3. **The quality gate referenced `var(--fact)`,** which is not a defined token.
   Corrected to `var(--class-fact)`.
4. **Export is implemented.** The source README describes it as "one export
   library away"; that gap is filled rather than mocked.
5. **The playbook rail logo is `size={15}`, not `17`** — at Archivo's real metrics
   the 125%-width wordmark overran the 280px rail and was clipped by its scroll
   container.
6. **The radio is round again.** The bundle sets `borderRadius: 0` on both the radio
   box and its dot, making it visually identical to a checkbox. The design system
   contradicts that in two places — its readme ("Circles exist only for the seed mark
   and the radio dot") and the comment in `Seeds.tsx` — and ships `--radius-circle`
   solely for those two cases. Followed the stated rule.

Checked, and deliberately *not* changed:

- **`Dialog`'s shadow** is not a violation. `elevation.css` says two exceptions exist,
  both functional, and `--shadow-dialog` is one of them: "a modal must detach from the page".
- **`Logo` ignores `[data-theme="plate"]`** because its colours come from `tone`, which
  is the component's declared API — not a bug, just a prop the caller must pass.

7. **Inline `font` shorthands were made fluid.** `font: var(--type-h1)` hardcodes
   `--size-4xl`, which beats the global clamp in `breakpoints.css`, so headlines on
   `/` and `/design-system` ran off a 320px screen. The size is now restated as a
   longhand after the shorthand. An inline style always wins — a global rule cannot
   rescue it.
8. **`minmax(280px, 1fr)` grids became `minmax(min(280px, 100%), 1fr)`.** A fixed
   track floor cannot shrink, so those grids overflowed narrow viewports.
9. **The `ThumbnailCard` specimen carries `data-known-limit`.** It exists to display
   a documented component limitation, and the audit counts it separately rather than
   reporting the same known clip on every run — a permanently-red check gets ignored.

### Contract check

The design system ships `_adherence.oxlintrc.json`, an oxlint config encoding every
component's declared props and enum values. The port was validated against it: all 24
constrained components match, including all 8 canvas sizes and all 6 canvas themes.
