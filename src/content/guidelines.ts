/**
 * OKW-GUIDE-01 — the brand guidelines: the words.
 *
 * Values — hex, sizes, durations, radii — are NOT here. The page reads them
 * from the token CSS at build (src/lib/tokens.ts), so a changed token changes
 * the page. This file holds only what a value is FOR and when to use it.
 *
 * Every rule is quoted or derived from a named source: the token files, the
 * playbook, geometry.ts, the logo manifest, or the owner's business document.
 * Where the system is silent the page says so; nothing here fills a gap.
 */

export const GUIDELINES_INTRO = {
  code: "OKW-GUIDE-01",
  title: "Brand guidelines",
  lede: "How Okwe looks and sounds: the marks, the colours and when each is used, type, space, the recurring devices, the voice, and the rules that keep them from drifting. Every value on this page is read from the design tokens at build; every rule is quoted from its source.",
  foot: "VALUES READ FROM THE TOKENS AT BUILD · RULES QUOTED FROM THEIR SOURCE",
} as const;

/** The twelve sections, in the order the owner set them. */
export const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "logo", title: "Logo" },
  { id: "colour", title: "Colour" },
  { id: "type", title: "Type" },
  { id: "spacing", title: "Spacing" },
  { id: "radius-shadow", title: "Radius & shadow" },
  { id: "motif", title: "Motif" },
  { id: "voice", title: "Voice" },
  { id: "components", title: "Components" },
  { id: "slides", title: "Slides" },
  { id: "ui-kits", title: "UI kits" },
  { id: "governance", title: "Governance" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/* ------------------------------------------------------------------ logo -- */

/** When to use each lockup. Sources: the generator's own comments and where the app uses each. */
export const LOCKUP_USE = [
  {
    variant: "stacked",
    label: "Stacked",
    use: "The primary mark: seeds above, name under. Covers, the kit, anywhere the mark stands on its own.",
    source: "build-logo-assets.mjs — “stacked: seeds above, name under (the primary mark)”",
  },
  {
    variant: "horizontal",
    label: "Horizontal",
    use: "Seeds beside the name, for a header bar or any short, wide slot.",
    source: "build-logo-assets.mjs; the post editor's top bar uses it",
  },
  {
    variant: "wordmark",
    label: "Wordmark",
    use: "The name alone, where the seed row would crowd the line.",
    source: "build-logo-assets.mjs — “wordmark: the name alone”",
  },
  {
    variant: "avatar",
    label: "Avatar",
    use: "The mark on an ink square: profile pictures and app icons. The one place a process word is still legible at icon size.",
    source: "build-logo-assets.mjs — “avatar: the mark on an ink square, for profile pictures”",
  },
] as const;

export const LOGO_DONTS = [
  { rule: "Never differentiate the marks by colour.", source: "The logo rule" },
  { rule: "Never change the seed row: six counters, three sown in sulphur, three open.", source: "The logo rule; geometry.ts" },
  { rule: "Never set OKWE at any width but 125%. The expansion is the identity.", source: "The logo rule" },
  { rule: "Never set the qualifier word in sulphur. Sulphur never carries type.", source: "The logo rule" },
  { rule: "If you cannot tell two marks apart in greyscale, the lockup is wrong.", source: "The logo rule" },
  { rule: "No gradients, no soft shadows, no rounded corners behind the mark.", source: "Visual thesis, test results" },
] as const;

/* ---------------------------------------------------------------- colour -- */

/** The hierarchy, in the token file's own words. */
export const COLOUR_ROLES = [
  {
    role: "Ground",
    ramp: "chalk",
    quote:
      "mineral ground. Cool, faintly green-grey. The ground of a working document, not “premium cream”. Never #FFFFFF, never warm off-white.",
    use: "Page, field and inset surfaces. Every document starts on chalk.",
  },
  {
    role: "Primary ink",
    ramp: "cyanotype",
    quote:
      "the primary ink. A blue-black with a cyan-green cast, taken from the cyanotype/blueprint — the drawing that explains how a system works. Not navy (no violet), not academic blue (not bright).",
    use: "All text and rules, the solid control, and the plate: the second printing plate for covers and title cards.",
  },
  {
    role: "Signature",
    ramp: "sulphur",
    quote:
      "the signature. A mineral yellow: a traded bulk commodity, the ferric chemistry of a blueprint, and the colour of an annotation. It marks and counts; it never fills a surface or carries text.",
    use: "Marks, rules, tallies, the focus ring, selection, and one control per surface.",
  },
  {
    role: "Functional — systems",
    ramp: "verdigris",
    quote:
      "oxidised copper — the metal that wires an economy, changed by exposure. Systems diagrams and the second data series.",
    use: "Systems diagrams, the comparison part of a set, the second data series; interpretation and success.",
  },
  {
    role: "Functional — authority",
    ramp: "stamp",
    quote:
      "the ink of paperwork authority. Rationed to corrections, opinion and the stamp device. Never a brand-wide red.",
    use: "Corrections, opinion and errors. Rationed.",
  },
] as const;

export const PRIMARY_SECONDARY =
  "Primary is cyanotype on chalk: ink on ground. There is no brand-wide secondary colour, and that is deliberate. Sulphur is the signature — it marks, it never fills. Verdigris and stamp are functional, each already bound to meanings: verdigris to interpretation, success and the second data series; stamp to opinion, correction and error. Giving either a decorative job would make it say something it does not mean.";

/** What every colour alias is for. The page fails its own check if a token in colors.css has no entry here. */
export const ALIAS_NOTES: Record<string, string> = {
  "--surface-page": "The page ground.",
  "--surface-field": "One step lighter than the page ground: the reading field.",
  "--surface-inset": "One step darker than the page ground: insets such as previews and wells.",
  "--surface-ink": "The ink ground. Inverse text sits on it.",
  "--surface-ink-soft": "A softer ink ground, one step up from surface-ink.",
  "--surface-plate": "The plate colour — the third of the three grounds.",
  "--surface-mark":
    "Sulphur as a ground: the one marked control, checked states, and the documented closing part and announcement. Text on it is ink.",
  "--surface-system": "Verdigris as a ground: the system theme, used for comparisons.",
  "--text-primary": "Headlines and primary text.",
  "--text-body": "Running text.",
  "--text-secondary": "Supporting text: ledes and secondary lines.",
  "--text-muted": "Muted text: hints, captions and meta lines.",
  "--text-quiet": "The quietest text: index numbers and file meta in the margin.",
  "--text-inverse": "Text on ink.",
  "--text-inverse-muted": "Muted text on ink.",
  "--text-mark":
    "Sulphur as text. The rule says sulphur never carries text; its one use in code is listed below as a known exception.",
  "--text-link": "Links. On the plate, links turn sulphur.",
  "--text-link-hover": "Links on hover.",
  "--rule-hair": "Hairline rule weight.",
  "--rule-thin": "Thin rule weight: row separators and control borders.",
  "--rule-thick": "Thick rule weight: section openers, headers and the frame.",
  "--rule-ink": "Ink rules: openers, frames, strong separators.",
  "--rule-quiet": "Quiet rules between rows.",
  "--rule-mark": "Sulphur rules: the active marker under a selected tab or size, and link hovers.",
  "--rule-inverse": "Rules on ink.",
  "--rule-inverse-quiet": "Quiet rules on ink.",
  "--interactive-bg": "The solid control's ground.",
  "--interactive-bg-hover": "The solid control's ground on hover.",
  "--interactive-fg": "Text on the solid control.",
  "--interactive-mark-bg": "The marked control's ground — sulphur, one per surface.",
  "--interactive-mark-bg-hover": "The marked control on hover.",
  "--interactive-mark-fg": "Text on the marked control — ink.",
  "--interactive-quiet-hover": "A quiet control's hover wash.",
  "--interactive-quiet-active": "A quiet control's pressed wash.",
  "--interactive-disabled-bg": "A disabled control's ground.",
  "--interactive-disabled-fg": "A disabled control's text.",
  "--focus-ring": "The focus ring.",
  "--focus-ring-width": "Focus ring weight.",
  "--focus-ring-offset": "Focus ring offset.",
  "--selection-bg": "The text selection ground.",
  "--class-fact": "Fact.",
  "--class-interpretation": "Interpretation.",
  "--class-opinion": "Opinion.",
  "--class-unknown": "Unknown.",
  "--status-success": "Success.",
  "--status-success-soft": "A tint ground for a success line.",
  "--status-warning": "Warning.",
  "--status-warning-soft": "A tint ground for a warning line.",
  "--status-danger": "Error.",
  "--status-danger-soft": "A tint ground for an error line.",
  "--status-info": "Info.",
  "--status-info-soft": "A tint ground for an info line.",
  "--data-1": "Series one. Ink first: charts are documents, not decoration.",
  "--data-2": "Series two.",
  "--data-3": "Series three.",
  "--data-4": "Series four.",
  "--data-5": "Series five.",
  "--data-6": "Series six.",
  "--data-grid": "Chart gridlines.",
  "--data-zero": "The zero line.",
  "--tally-filled": "A counted square.",
  "--tally-empty": "An uncounted square.",
};

/** Alias groups, in the order colors.css declares them, with the file's own heading. */
export const ALIAS_GROUPS = [
  { prefix: ["--surface-"], title: "Surfaces", quote: "Three grounds only: chalk, ink, and one plate colour." },
  { prefix: ["--text-"], title: "Text", quote: null },
  { prefix: ["--rule-"], title: "Rules", quote: "The system is drawn with rules, never boxes with shadows." },
  { prefix: ["--interactive-", "--focus-", "--selection-"], title: "Interactive", quote: null },
  { prefix: ["--class-"], title: "Evidence classes", quote: "The trust system, in colour." },
  { prefix: ["--status-"], title: "Status", quote: null },
  { prefix: ["--data-", "--tally-"], title: "Data", quote: "Data, in series order. Ink first: charts are documents, not decoration." },
] as const;

export interface StateGuide {
  id: string;
  label: string;
  token: string | null;
  soft: string | null;
  when: string;
  where: string;
  example: string;
  exampleSource: string;
  /** For highlight: the tokens that carry it. */
  carriers?: string[];
}

/** The five states. Examples are real strings the app already shows. */
export const STATES: StateGuide[] = [
  {
    id: "info",
    label: "Info",
    token: "--status-info",
    soft: "--status-info-soft",
    when: "A neutral fact about the system the reader should know, with nothing to do about it.",
    where: "Notices, empty states, explanations of how something works.",
    example: "Kept in this browser. Nothing is uploaded.",
    exampleSource: "The drafts shelf",
  },
  {
    id: "success",
    label: "Success",
    token: "--status-success",
    soft: "--status-success-soft",
    when: "Something the reader did has completed.",
    where: "Confirmations after saving, copying or exporting.",
    example: "Saved as “Landed cost explainer”.",
    exampleSource: "The drafts shelf",
  },
  {
    id: "warning",
    label: "Warning",
    token: "--status-warning",
    soft: "--status-warning-soft",
    when: "Something needs attention but does not block. The reader may go on and own the decision.",
    where: "The export gate's warnings: an unscored piece, a language flag.",
    example: "10 of 10 criteria are unscored.",
    exampleSource: "The export gate",
  },
  {
    id: "error",
    label: "Error",
    token: "--status-danger",
    soft: "--status-danger-soft",
    when: "Something failed, is invalid, or refuses to proceed.",
    where: "Invalid fields, failed downloads and exports.",
    example: "Slide 02 shows a figure with no source line.",
    exampleSource: "The export gate",
  },
  {
    id: "highlight",
    label: "Highlight",
    token: null,
    soft: null,
    when: "Marking, not meaning: what is selected, focused or counted. There is no highlight token — it is sulphur's marking role.",
    where: "Text selection, the focus ring, the active tab or size, the tally, the seed row.",
    example: "Know the opportunity.",
    exampleSource: "The business document",
    carriers: ["--selection-bg", "--focus-ring", "--rule-mark", "--tally-filled"],
  },
];

export const COLOUR_DOS = [
  { rule: "One accent per surface.", source: "Visual thesis, colour thesis" },
  {
    rule: "Cover parts take the cyanotype plate, comparisons verdigris, the closing part sulphur, everything else chalk.",
    source: "Visual thesis, social-content thesis",
  },
  { rule: "Plate mode is a second printing plate, not a comfort mode.", source: "Visual thesis; colors.css" },
  { rule: "Charts put ink first: series one is cyanotype.", source: "colors.css" },
  {
    rule: "A state always carries its word. Success shares verdigris with interpretation, and error shares stamp with opinion — colour alone cannot tell them apart.",
    source: "geometry.ts; colors.css",
  },
] as const;

export const COLOUR_DONTS = [
  { rule: "Never #FFFFFF, never warm off-white.", source: "colors.css, chalk" },
  { rule: "Sulphur never fills a surface or carries text.", source: "colors.css, sulphur" },
  { rule: "Stamp red is never a brand-wide red.", source: "colors.css, stamp" },
  { rule: "Never differentiate the processes by colour.", source: "The logo rule" },
  { rule: "No warm neutral, no terracotta, no gradients, no soft shadows.", source: "Visual thesis, test results" },
  { rule: "No gold, no marble, no letterpress texture. Valuable, not luxurious.", source: "Visual thesis, test results" },
] as const;

/** Where the code departs from the rules. Stated, not hidden. */
export const COLOUR_EXCEPTIONS = [
  {
    kind: "Documented",
    what: "The closing part of a set takes a sulphur ground.",
    source: "Visual thesis — “the closing part sulphur”",
  },
  {
    kind: "Documented",
    what: "The announcement template takes a sulphur ground.",
    source: "Template library — OKW-SOC-ALL-ANNOUNCE-01, “Sulphur ground”",
  },
  {
    kind: "Documented",
    what: "One marked control per surface takes a sulphur ground, with ink text.",
    source: "Visual thesis — “marks, rules, tallies and one control”",
  },
  {
    kind: "Not documented",
    what: "CallNumber's mark tone sets its text in sulphur (--text-mark).",
    source: "CallNumber.tsx — contradicts “never carries text”",
  },
] as const;

/* ------------------------------------------------------------------ type -- */

export const TYPE_FACES = [
  { token: "--font-display", face: "Archivo", job: "Statements, at expanded width (118–125%)." },
  { token: "--font-read", face: "Literata", job: "Reading: ledes, body, captions, quotes." },
  { token: "--font-ui", face: "Archivo", job: "Interface, at normal width." },
  { token: "--font-mono", face: "Martian Mono", job: "The register, at 87.5% width: call numbers, labels, figures, tallies." },
] as const;

/** What each composed role is for, and which width it takes (the shorthand omits font-stretch). */
export const TYPE_ROLES: Record<string, { use: string; stretch: string }> = {
  "--type-cover": { use: "One-line covers and title cards.", stretch: "--stretch-display-max" },
  "--type-h1": { use: "Page title.", stretch: "--stretch-display" },
  "--type-h2": { use: "Section heading.", stretch: "--stretch-display" },
  "--type-h3": { use: "Sub-heading.", stretch: "--stretch-ui" },
  "--type-h4": { use: "Row title.", stretch: "--stretch-ui" },
  "--type-lede": { use: "The opening paragraph.", stretch: "--stretch-ui" },
  "--type-body": { use: "Running text.", stretch: "--stretch-ui" },
  "--type-body-sm": { use: "Smaller running text.", stretch: "--stretch-ui" },
  "--type-ui": { use: "Controls and interface text.", stretch: "--stretch-ui" },
  "--type-ui-sm": { use: "Small interface text.", stretch: "--stretch-ui" },
  "--type-caption": { use: "Captions and hints.", stretch: "--stretch-ui" },
  "--type-label": { use: "Mono labels: uppercase, widely tracked.", stretch: "--stretch-mono" },
  "--type-call": { use: "Call numbers.", stretch: "--stretch-mono" },
  "--type-data": { use: "Data and meta in mono.", stretch: "--stretch-mono" },
  "--type-figure": { use: "Oversized numerals.", stretch: "--stretch-figure" },
  "--type-figure-xl": { use: "The largest numerals.", stretch: "--stretch-figure" },
  "--type-quote": { use: "Pull quotes.", stretch: "--stretch-ui" },
};

export const TYPE_RULES = [
  { rule: "Three faces, three jobs, one behaviour: width contrast.", source: "Visual thesis, typography thesis" },
  {
    rule: "Two ranges: reading (13–25px) and register (31–160px). Nothing lives between 25 and 31 — documents are either being read or being catalogued.",
    source: "typography.css",
  },
  { rule: "Numbers are always tabular mono and usually oversized.", source: "Visual thesis" },
  { rule: "Apply font-stretch alongside a composed role: the shorthand omits it.", source: "typography.css" },
  { rule: "Sentence case everywhere except mono labels and the wordmark.", source: "Voice & writing" },
  { rule: "A headline is the subject, plainly, in 62 characters or fewer.", source: "Voice & writing" },
] as const;

/* --------------------------------------------------------- space & shape -- */

export const SPACING_RULES = [
  {
    rule: "Not a 12-column grid. Every surface is an index rail plus a content field, divided by rules that run edge to edge. Corners are square. Nothing floats.",
    source: "spacing.css",
  },
  { rule: "Every vertical measure is a multiple of 8.", source: "spacing.css, --block-step" },
  { rule: "Controls sit on a 4px rhythm and stay rectangular.", source: "spacing.css" },
  {
    rule: "Order of collapse, widest to narrowest: the annotation margin folds under the field, the index rail folds above it, multi-column grids become one column. Rules never fold.",
    source: "breakpoints.css",
  },
  { rule: "On a coarse pointer every control is at least the tap minimum.", source: "breakpoints.css" },
] as const;

export const FRAME_NOTES: Record<string, string> = {
  "--rail-index": "Left rail: call numbers, class stamps, dates.",
  "--rail-margin": "Right margin: annotations, sources, method notes.",
  "--field-gutter": "Between rail, field and margin.",
  "--page-margin": "The page inset at full width.",
  "--page-margin-fluid": "The page inset, shrinking with the viewport.",
  "--page-max": "The widest the ledger runs.",
  "--read-max": "The reading field — narrower than the page, hung to the rail.",
  "--block-step": "The vertical unit.",
};

export const RADIUS_RULES = [
  { rule: "Corners: zero.", source: "spacing.css" },
  {
    rule: "Circles are reserved for the seed row and the radio dot; data tallies stay square.",
    source: "Seeds.tsx",
  },
  {
    rule: "The token file mentions a 1px optical relief on inputs. No token carries it and no input uses it — every input is square.",
    source: "spacing.css; Input.tsx",
  },
] as const;

export const SHADOW_RULES = [
  {
    rule: "Okwe has no elevation system. Information is separated by rules and by ground, not by height.",
    source: "elevation.css",
  },
  {
    rule: "Two exceptions, both functional: a modal must detach from the page, and a photograph needs its type protected.",
    source: "elevation.css",
  },
  { rule: "One dialog shadow; no blur anywhere.", source: "Visual thesis, decision record" },
] as const;

/* ----------------------------------------------------------------- motif -- */

export const MOTIF_DEVICES = [
  { name: "Seed row", what: "Six counters from the okwe board, three sown, three open. The mark, and the only circles in the system." },
  { name: "Tally", what: "Counted in sulphur squares, from okwe's seeds." },
  { name: "Call number", what: "The index of every piece: series, issue, part." },
  { name: "Manifest diagram", what: "One ruled baseline, square joints — no arrows, no nodes." },
  { name: "Margin note", what: "Sources, method and stated gaps, hung beside the claim." },
  { name: "Class stamp", what: "Fact, our reading, our view, unresolved." },
] as const;

export const MOTIF_RULES = [
  {
    rule: "Five recurring devices: call number, tally, manifest, margin note and the class stamp. Nothing decorative is permitted to recur.",
    source: "Visual thesis, graphic language",
  },
  {
    rule: "The name: okwe is a sowing-and-reaping board game where seeds are counted, moved and compounded — which is where the tally comes from. Grounded in subject matter and photography, never in pattern.",
    source: "Brand strategy, visual territory",
  },
  {
    rule: "Photography: documentary field images of real operations, shot cool, mid-contrast, unfiltered, square-cornered, always captioned in mono with place and date. No illustration, no stock optimism, no orange-and-teal grade.",
    source: "Visual thesis, photography thesis",
  },
  {
    rule: "Motion is mechanical: short, flat, and where something is counted, stepped. No bounce, no spring, no scale-in, no parallax.",
    source: "motion.css; visual thesis",
  },
] as const;

/* ----------------------------------------------------------------- voice -- */

/** The voice sections, quoted from the playbook in its own rendered form. */
export const VOICE_SECTIONS = [
  "voice-and-writing--the-voice-in-one-line",
  "voice-and-writing--voice-attributes-and-how-they-show-up",
  "voice-and-writing--person-and-tone",
  "voice-and-writing--writing-rules",
  "voice-and-writing--headlines-and-hooks",
  "voice-and-writing--calls-to-action",
] as const;

/* ------------------------------------------------------------ components -- */

export interface ComponentRow {
  name: string;
  group: "Brand" | "Core" | "Forms" | "Notation" | "Editorial" | "Social";
  /** What it is for — the /design-system specimen note, or the component's own docblock. */
  purpose: string;
  /** Its specimen on /design-system, when it has one. */
  specimen: string | null;
}

export const COMPONENTS: ComponentRow[] = [
  { name: "Logo", group: "Brand", purpose: "Four variants, two tones. The inverse tone is shown on ink.", specimen: "01.1" },
  { name: "Seeds", group: "Brand", purpose: "Six counters: three sown, three open. The only circles in the system, alongside the radio dot.", specimen: "01.2" },
  { name: "Badge", group: "Core", purpose: "Eight tones. unknown is dashed; inverse only reads on ink.", specimen: "03.1" },
  { name: "Button", group: "Core", purpose: "Five variants, three sizes, plus disabled, indexed and full-width forms.", specimen: "03.2" },
  { name: "Card", group: "Core", purpose: "A card is a register entry, not a box: a top rule opens it, a hairline meta line closes it.", specimen: "03.3" },
  { name: "Dialog", group: "Core", purpose: "Opens on click, closes on the scrim or either footer control.", specimen: "03.4" },
  { name: "IconButton", group: "Core", purpose: "Square, label-required. Sizes, variants, a selected toggle and a disabled state.", specimen: "03.5" },
  { name: "Tabs", group: "Core", purpose: "A register strip or a block strip; the caller owns the panels.", specimen: "03.6" },
  { name: "Tag", group: "Core", purpose: "Selectable and removable.", specimen: "03.7" },
  { name: "Tooltip", group: "Core", purpose: "Shows on hover and on keyboard focus, above or below.", specimen: "03.8" },
  { name: "Field", group: "Forms", purpose: "Supplies the index, hint and error; the controls supply nothing but themselves.", specimen: "04.1" },
  { name: "Input", group: "Forms", purpose: "Text, one line or many; turns error-coloured when invalid.", specimen: "04.1" },
  { name: "Select", group: "Forms", purpose: "A choice from a list; turns error-coloured when invalid.", specimen: "04.1" },
  { name: "Checkbox", group: "Forms", purpose: "On or off, checked in sulphur.", specimen: "04.1" },
  { name: "Radio", group: "Forms", purpose: "One of several; the radio dot is one of the system's two circles.", specimen: "04.1" },
  { name: "Switch", group: "Forms", purpose: "A setting that takes effect at once.", specimen: "04.1" },
  { name: "CallNumber", group: "Notation", purpose: "Series codes are looked up, then abbreviated.", specimen: "02.1" },
  { name: "Tally", group: "Notation", purpose: "Counts in sulphur squares.", specimen: "02.2" },
  { name: "ManifestDiagram", group: "Notation", purpose: "One ruled baseline, square joints, never arrows.", specimen: "02.3" },
  { name: "MarginNote", group: "Notation", purpose: "Five roles, each carrying its own class colour.", specimen: "02.4" },
  { name: "StatBlock", group: "Editorial", purpose: "A figure without a source line is a bug.", specimen: "05.1" },
  { name: "PullQuote", group: "Editorial", purpose: "Attribution and role are separate lines.", specimen: "05.2" },
  { name: "DefinitionCard", group: "Editorial", purpose: "Term, pronunciation, definition, and the two disambiguation lines.", specimen: "05.3" },
  { name: "FrameworkList", group: "Editorial", purpose: "Three markers, an optional closing principle, and an inverse tone.", specimen: "05.4" },
  { name: "PostCanvas", group: "Social", purpose: "Every social and publishing surface is the same ledger sheet drawn at a platform size.", specimen: "06.1" },
  { name: "CarouselSlide", group: "Social", purpose: "Six kinds, each composed on a PostCanvas.", specimen: "06.2" },
  { name: "StatCard", group: "Social", purpose: "A statistic cannot publish without its source line.", specimen: "06.3" },
  { name: "ThumbnailCard", group: "Social", purpose: "A 16:9 thumbnail; titles past three lines are clipped.", specimen: "06.4" },
  { name: "ArticleCard", group: "Social", purpose: "OKW-EDI-ARTICLE-01 — call number, headline, lede, class stamp; one design at every size.", specimen: "06.5" },
  { name: "ComparisonCard", group: "Social", purpose: "OKW-DAT-COMPARE-01 — two tallies, ink against sulphur.", specimen: null },
  { name: "RankCard", group: "Social", purpose: "OKW-DAT-RANK-01 — numbered rows, capped at eight.", specimen: null },
  { name: "TimelineCard", group: "Social", purpose: "OKW-DAT-TIMELINE-01 — one hairline, square-ended ticks, capped at six.", specimen: null },
];

/* ---------------------------------------------------------------- slides -- */

export const SLIDE_RULES = [
  {
    rule: "Every canvas is the same ledger sheet at platform size: index band (call number, series, class stamp, date), content field, register foot (wordmark, tally, destination).",
    source: "Visual thesis, social-content thesis",
  },
  {
    rule: "A title slide takes the plate: index band, title at 125% width, register foot.",
    source: "Template library — OKW-VID-YT-TITLE-01",
  },
  {
    rule: "Cover parts take the cyanotype plate, comparisons verdigris, the closing part sulphur, everything else chalk.",
    source: "Visual thesis, social-content thesis",
  },
  { rule: "The business deck is built on the presentation slide.", source: "Template library — OKW-BUS-DECK-01" },
  { rule: "Export at 1× native for social, 2× for print and retina decks.", source: "Template library, export system" },
  { rule: "A statistic cannot render without a source line.", source: "Visual thesis; the export gate" },
] as const;

/* --------------------------------------------------------------- ui kits -- */

export const UI_KITS = [
  {
    name: "Publishing web",
    what: "The ledger at page width: an index rail, a reading field and an annotation margin, opened by rules.",
    routes: ["/", "/playbook", "/content-proofs", "/context", "/guidelines"],
    built: ["Logo", "Seeds", "Card", "MarginNote", "DefinitionCard", "PullQuote", "FrameworkList", "StatBlock"],
  },
  {
    name: "Tools",
    what: "The production surfaces: three panels that fold to one column, every control on the 4px rhythm.",
    routes: ["/post-editor", "/register", "/carousel"],
    built: ["Button", "IconButton", "Tabs", "Tag", "Field", "Input", "Select", "Checkbox", "Switch", "Dialog", "Tooltip", "Badge"],
  },
  {
    name: "Social",
    what: "Every canvas is PostCanvas at a platform size.",
    routes: ["/social-kit", "/post-editor"],
    built: ["PostCanvas", "CarouselSlide", "StatCard", "ThumbnailCard", "ArticleCard", "ComparisonCard", "RankCard", "TimelineCard"],
  },
  {
    name: "Documents and print",
    what: "A4 pages on the report canvas: covers, reports, workbooks.",
    routes: ["/post-editor", "/content-proofs"],
    built: ["PostCanvas", "CallNumber", "Tally", "MarginNote"],
  },
  {
    name: "Brand assets",
    what: "Every mark as vector and raster, the app icons, favicon and watermarks — and the specimen sheet that checks the system.",
    routes: ["/brand", "/design-system"],
    built: ["Logo", "Seeds"],
  },
] as const;

/* ------------------------------------------------------------ governance -- */

export const SOURCES_OF_TRUTH = [
  { what: "Colour, type, space, radius, elevation, motion", where: "src/design-system/tokens/*.css" },
  { what: "The mark's geometry and the process words", where: "src/design-system/brand/geometry.ts" },
  { what: "Every generated mark, and the logo rule", where: "public/assets/logo/logo.manifest.json" },
  { what: "Strategy, voice, the playbooks, the template library, the visual thesis", where: "src/content/playbook-docs.json" },
  { what: "The business, its three processes and its architecture", where: "src/content/business.ts" },
  { what: "The publishing gate", where: "src/lib/quality.ts" },
] as const;

export const GUARDS = [
  { name: "geometry drift", what: "The logo generator reads the mark's ratios from geometry.ts and fails if its copy disagrees." },
  { name: "arm drift", what: "The generator's process words must equal geometry.ts's, word for word." },
  { name: "tag drift", what: "The brand context pack's converter must support every tag the playbook uses." },
  { name: "token coverage", what: "Every colour token must be described on this page, and every description must name a real token." },
  { name: "retired wording", what: "Copy written in this repo may not use the retired mark names." },
] as const;
