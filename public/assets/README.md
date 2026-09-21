# Assets

Everything in this folder is either **downloaded** from a named upstream or
**generated** by a script in `../../scripts/`. Nothing here was drawn by hand,
and nothing is fetched at runtime — the app makes no third-party requests.

## `fonts/` — downloaded

24 variable WOFF2 files, plus `fonts.manifest.json` recording the source URL,
byte length, SHA-256 and variable axes of each one.

| Family | Axes | Role |
| --- | --- | --- |
| Archivo | `wght 100–900`, `wdth 62–125` | Display and UI. Headlines are set at **118%** width, covers at **125%**. |
| Literata | `opsz 7–72`, `wght 200–900` | Long-form reading. No width axis, so it uses `font-optical-sizing` instead. |
| Martian Mono | `wght 100–800`, `wdth 75–112.5` | The register: call numbers, labels, dates, figures, tallies. Set at **87.5%** width. |

Licence: **SIL Open Font License 1.1** for all three.
Source: the Google Fonts `css2` endpoint, at the exact URL declared in
`src/design-system/tokens/fonts.css` (kept verbatim as the upstream reference).

Every `unicode-range` subset is kept, not just latin — dropping the others would
quietly narrow glyph coverage.

**The width axis is the brand.** Okwe's identity is the contrast between an
expanded headline and a narrow mono call number. A static font instance would
remove that behaviour without any visible error, so `scripts/fetch-fonts.mjs`
reads the `fvar` table of every file it downloads and refuses to write one whose
required axis is missing.

- `npm run fonts:fetch` — re-download and re-verify (one-time / refresh only)
- `npm run fonts:verify` — check the committed bytes still match the manifest (runs on `prebuild`)
- `npm run assets:fontcss` — regenerate `tokens/fonts.local.css` from the manifest

## `logo/` — generated

There is **no logo file in the source project**: the Okwe mark is drawn by code.
These files are generated from the same constants the React `<Logo/>` component
reads (`src/design-system/brand/geometry.ts`), and the generator asserts the
ratios still match that module, so the two renderers cannot drift apart.

The mark is the **seed row** — six counters from the okwe board, three sown in
sulphur, three open — above the name in Archivo at 125% width.

### The marks

One mark serves the whole business, Okwe Import Export Solutions. The seed row
never changes between marks; OKWE is always set at 125% width. A **process** —
Knows, Coms or Move — is one qualifier word in muted ink, beside the wordmark or
beneath it. The parent, Okwe, is the wordmark **alone** — the absence of a word
is what makes it the parent. Okwe Knowledge, the publishing imprint of Okwe
Knows, follows the same rule with its own word. Marks are never differentiated
by colour: verdigris and stamp red already carry meanings, and sulphur never
carries type. If you cannot tell two marks apart in greyscale, the lockup is
wrong.

| Mark | Kind | Qualifier | Files |
| --- | --- | --- | --- |
| Okwe | parent | none | `okwe-*` |
| Okwe Knows | process | `Knows` | `okwe-knows-*` |
| Okwe Coms | process | `Coms` | `okwe-coms-*` |
| Okwe Move | process | `Move` | `okwe-move-*` |
| Okwe Knowledge | publishing imprint | `Knowledge` | `okwe-knowledge-*` |

The process words live in `ARM_WORD` in `geometry.ts` and the imprint's in
`IMPRINT_WORD`; the generator reads or copies both and **throws** if they
disagree, exactly as it does for the ratios.

Each of the five gets the same seven files, under its own prefix:

| File | What it is |
| --- | --- |
| `<prefix>stacked.svg` | The primary lockup: seeds above, name under. |
| `<prefix>stacked-inverse.svg` | The same on the cyanotype plate. |
| `<prefix>horizontal.svg` | Seeds beside the name. |
| `<prefix>wordmark.svg` | The name alone. |
| `<prefix>avatar.svg` | The mark on an ink square, for profile pictures. |
| `<prefix>apple-touch-icon.png` | 180×180, rasterised from the avatar. |
| `<prefix>icon-512.png` | 512×512, the same. |

`logo.manifest.json` records every one of them — brand, variant, tone, real
artboard size and byte length — plus the logo rule as one paragraph. The kit page
imports it, so its keys are a contract; do not edit it by hand.

### Shared across the ecosystem

| File | What it is |
| --- | --- |
| `favicon.svg` | The seed row alone — at 16px the wordmark is unreadable, and the counters are the part that survives. Pure geometry, so it needs no font, and no qualifier could be read at that size, so every mark shares it. |
| `watermark-chalk.svg` | The seed row flat in `--cyanotype-100`, for chalk grounds. |
| `watermark-plate.svg` | The same in `--cyanotype-800`, for the ink plate. |
| `og-default.svg` / `.png` | 1200×630 share card, built as the register sheet rather than a centred logo. |

The watermarks carry **no `opacity` and no alpha**: the tint is a real token
step, so the counters composite identically over any ground and the system stays
flat colour. They carry **no sulphur** either — the sown counters take the same
tint as the open ones, because sulphur never sits behind text and a watermark is
by definition behind text. Under 600 bytes each, and no font embed.

The lockup SVGs embed the Archivo latin subset as a base64 `@font-face`. Without
it the wordmark falls back to Helvetica wherever the file is opened and the
125% expansion — the entire point of the mark — disappears.

- `npm run assets:logo` — regenerate
