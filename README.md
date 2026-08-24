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
npm run verify        # 99 checks across four suites
npm run audit         # 48 viewport x route combinations
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
