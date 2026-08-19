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

| File | What it is |
| --- | --- |
| `okwe-stacked.svg` | The primary lockup: seeds above, name under. |
| `okwe-stacked-inverse.svg` | The same on the cyanotype plate. |
| `okwe-horizontal.svg` | Seeds beside the name. |
| `okwe-wordmark.svg` | The name alone. |
| `okwe-avatar.svg` | The mark on an ink square, for profile pictures. |
| `favicon.svg` | The seed row alone — at 16px the wordmark is unreadable, and the counters are the part that survives. Pure geometry, so it needs no font. |
| `apple-touch-icon.png` | 180×180, rasterised from the avatar. |
| `icon-512.png` | 512×512. |
| `og-default.svg` / `.png` | 1200×630 share card, built as the register sheet rather than a centred logo. |

The lockup SVGs embed the Archivo latin subset as a base64 `@font-face`. Without
it the wordmark falls back to Helvetica wherever the file is opened and the
125% expansion — the entire point of the mark — disappears.

- `npm run assets:logo` — regenerate
