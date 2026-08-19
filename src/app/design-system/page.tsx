import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { Logo } from "@/design-system/components/brand/Logo";
import { Seeds } from "@/design-system/components/brand/Seeds";

import { CallNumber, callNumberString } from "@/design-system/components/notation/CallNumber";
import { ManifestDiagram } from "@/design-system/components/notation/ManifestDiagram";
import { MarginNote } from "@/design-system/components/notation/MarginNote";

import { Badge } from "@/design-system/components/core/Badge";
import { Button } from "@/design-system/components/core/Button";
import { Card } from "@/design-system/components/core/Card";

import { DefinitionCard } from "@/design-system/components/editorial/DefinitionCard";
import { FrameworkList } from "@/design-system/components/editorial/FrameworkList";
import { PullQuote } from "@/design-system/components/editorial/PullQuote";
import { StatBlock } from "@/design-system/components/editorial/StatBlock";

import { CANVASES, PostCanvas } from "@/design-system/components/social/PostCanvas";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import { StatCard } from "@/design-system/components/social/StatCard";
import { ThumbnailCard } from "@/design-system/components/social/ThumbnailCard";

import { ColourRamps } from "./Foundations";
import {
  DialogSpecimen,
  FormsSpecimen,
  IconButtonSpecimen,
  TabsSpecimen,
  TagSpecimen,
  TallySpecimen,
  TooltipSpecimen,
} from "./Interactive";

export const metadata = { title: "Design system" };

const COMPONENT_COUNT = 29;

/* ── page furniture ─────────────────────────────────────────────────────── */

const rule3: CSSProperties = {
  borderTop: "var(--rule-thick) solid var(--rule-ink)",
};

/** A grid for specimens whose items differ in height — flex-wrap staggers them. */
const grid = (min: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill,minmax(${min}px,1fr))`,
  gap: "var(--space-7)",
  alignItems: "start",
});

const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: "var(--space-7)",
};

function Section({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        ...rule3,
        paddingTop: "var(--space-5)",
        marginTop: "var(--space-11)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-9)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "baseline" }}>
        <span className="okwe-call" style={{ color: "var(--text-quiet)" }}>
          {index}
        </span>
        <span className="okwe-label" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}

/** One specimen: a mono index, a name, an optional note, and the thing itself. */
function Specimen({
  index,
  name,
  note,
  children,
}: {
  index: string;
  name: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <article
      style={{
        borderTop: "var(--rule-thin) solid var(--rule-quiet)",
        paddingTop: "var(--space-5)",
        display: "grid",
        gridTemplateColumns: "var(--rail-index) 1fr",
        columnGap: "var(--field-gutter)",
        rowGap: "var(--space-5)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <span className="okwe-call" style={{ color: "var(--text-quiet)" }}>
          {index}
        </span>
        <span className="okwe-label" style={{ color: "var(--text-primary)" }}>
          {name}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", minWidth: 0 }}>
        {note && (
          <p
            style={{
              font: "var(--type-caption)",
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: "var(--measure-body)",
            }}
          >
            {note}
          </p>
        )}
        {children}
      </div>
    </article>
  );
}

/** A labelled variant slot, so a broken variant is attributable at a glance. */
function Variant({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 0 }}>
      <span className="okwe-call" style={{ color: "var(--text-quiet)" }}>
        {name}
      </span>
      {children}
    </div>
  );
}

/* ── foundations data ───────────────────────────────────────────────────── */

const TYPE_ROLES: Array<{ token: string; name: string; stretch?: string }> = [
  { token: "--type-cover", name: "cover", stretch: "var(--stretch-display-max)" },
  { token: "--type-h1", name: "h1", stretch: "var(--stretch-display)" },
  { token: "--type-h2", name: "h2", stretch: "var(--stretch-display)" },
  { token: "--type-h3", name: "h3" },
  { token: "--type-h4", name: "h4" },
  { token: "--type-lede", name: "lede" },
  { token: "--type-body", name: "body" },
  { token: "--type-body-sm", name: "body-sm" },
  { token: "--type-ui", name: "ui" },
  { token: "--type-caption", name: "caption" },
  { token: "--type-quote", name: "quote" },
];

const WIDTHS = ["87.5%", "100%", "118%", "125%"];

const MANIFEST_STAGES = [
  { input: "brief", label: "Register", state: "One idea enters the ledger.", value: "01" },
  { input: "draft", label: "Draft", state: "Written against sources.", value: "02" },
  { input: "check", label: "Classify", state: "Fact, interpretation, opinion.", value: "03", mark: true },
  { input: "cut", label: "Publish", state: "One entry, many assets.", value: "04" },
];

export default function DesignSystemPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "var(--page-max)",
          padding: "40px var(--page-margin) 96px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── header ─────────────────────────────────────────────────── */}
        <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <span className="okwe-call" style={{ color: "var(--text-primary)" }}>
            OKW·DS/01 · DESIGN SYSTEM · {COMPONENT_COUNT} COMPONENTS
          </span>
          <div style={rule3} />
          <h1
            className="okwe-display"
            style={{
              font: "var(--type-h1)",
              fontStretch: "var(--stretch-display)",
              letterSpacing: "var(--tracking-display)",
              color: "var(--text-primary)",
              margin: 0,
              paddingTop: "var(--space-4)",
            }}
          >
            The component register
          </h1>
          <p
            style={{
              font: "var(--type-lede)",
              color: "var(--text-body)",
              margin: 0,
              maxWidth: "var(--measure-body)",
            }}
          >
            Every component in the system, set once on one sheet, so drift between them is
            visible without opening a single file. If something here renders broken, it is
            broken everywhere.
          </p>
          <div style={{ paddingTop: "var(--space-4)" }}>
            <Link href="/" className="okwe-block-link">
              <span className="okwe-call" style={{ color: "var(--text-primary)" }}>
                ← OPERATING SYSTEM
              </span>
            </Link>
          </div>
        </header>

        {/* ── 00 foundations ─────────────────────────────────────────── */}
        <Section index="00" label="Foundations">
          <Specimen
            index="00.1"
            name="Colour ramps"
            note="Five materials. Hex values are read back from the CSS custom properties at runtime — a blank value means the token is gone."
          >
            <ColourRamps />
          </Specimen>

          <Specimen index="00.2" name="Type scale" note="The composed roles, each set in its own token.">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              {TYPE_ROLES.map((r) => (
                <div
                  key={r.token}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "var(--space-5)",
                    alignItems: "baseline",
                    borderTop: "var(--rule-thin) solid var(--rule-quiet)",
                    paddingTop: "var(--space-3)",
                  }}
                >
                  <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
                    {r.name}
                  </span>
                  <span
                    style={{
                      font: `var(${r.token})`,
                      fontStretch: r.stretch,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                    }}
                  >
                    Okwe knows the register
                  </span>
                </div>
              ))}
            </div>
          </Specimen>

          <Specimen
            index="00.3"
            name="Width contrast"
            note="The identity lives on the width axis. If these four lines are the same width, the variable font failed to load and every headline in the system is wrong."
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {WIDTHS.map((w) => (
                <div key={w} style={{ display: "flex", gap: "var(--space-6)", alignItems: "baseline" }}>
                  <span className="okwe-call" style={{ color: "var(--text-quiet)", flex: "none", width: 56 }}>
                    {w}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
                      fontSize: "var(--size-2xl)",
                      lineHeight: "var(--leading-heading)",
                      letterSpacing: "var(--tracking-display)",
                      fontStretch: w,
                      color: "var(--text-primary)",
                    }}
                  >
                    Width is the signature
                  </span>
                </div>
              ))}
            </div>
          </Specimen>
        </Section>

        {/* ── 01 brand ───────────────────────────────────────────────── */}
        <Section index="01" label="Brand">
          <Specimen index="01.1" name="Logo" note="Four variants, two tones. The inverse tone is shown on ink.">
            <div style={row}>
              <Variant name="stacked">
                <Logo variant="stacked" size={32} />
              </Variant>
              <Variant name="horizontal">
                <Logo variant="horizontal" size={26} />
              </Variant>
              <Variant name="wordmark">
                <Logo variant="wordmark" size={26} />
              </Variant>
              <Variant name="wordmark · no knowledge">
                <Logo variant="wordmark" size={26} knowledge={false} />
              </Variant>
              <Variant name="avatar">
                <Logo variant="avatar" size={72} />
              </Variant>
            </div>
            <div style={{ ...row, background: "var(--surface-ink)", padding: "var(--space-7)" }}>
              <Variant name="stacked · inverse">
                <Logo variant="stacked" tone="inverse" size={32} />
              </Variant>
              <Variant name="horizontal · inverse">
                <Logo variant="horizontal" tone="inverse" size={26} />
              </Variant>
              <Variant name="wordmark · inverse">
                <Logo variant="wordmark" tone="inverse" size={26} />
              </Variant>
            </div>
          </Specimen>

          <Specimen index="01.2" name="Seeds" note="Six counters: three sown, three open. The only circles in the system, alongside the radio dot.">
            <div style={{ ...row, alignItems: "center", color: "var(--text-primary)" }}>
              <Variant name="10px">
                <Seeds />
              </Variant>
              <Variant name="18px">
                <Seeds size={18} />
              </Variant>
              <Variant name="filled 6/6">
                <Seeds size={18} filled={6} />
              </Variant>
              <Variant name="filled 0/6">
                <Seeds size={18} filled={0} />
              </Variant>
              <Variant name="sulphur fill">
                <Seeds size={18} fill="var(--sulphur-400)" />
              </Variant>
              <Variant name="total 9">
                <Seeds size={12} total={9} filled={4} />
              </Variant>
            </div>
          </Specimen>
        </Section>

        {/* ── 02 notation ────────────────────────────────────────────── */}
        <Section index="02" label="Notation">
          <Specimen
            index="02.1"
            name="CallNumber"
            note={`Series codes are looked up, then abbreviated. callNumberString("Field Notes", 4, 2) → ${callNumberString("Field Notes", 4, 2)}`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <CallNumber series="The Trade Desk" issue={12} className="Fact" date="2026-04-18" />
              <CallNumber series="Field Notes" issue={4} part={2} className="Interpretation" date="2026-05-02" />
              <CallNumber series="Numbers" issue={31} tone="mark" style={{ background: "var(--surface-ink)", padding: "var(--space-4)" }} />
            </div>
            <div style={{ ...row, alignItems: "stretch" }}>
              <Variant name="vertical">
                <div style={{ height: 200 }}>
                  <CallNumber orientation="vertical" series="Research" issue={7} className="Method" date="2026-06-01" />
                </div>
              </Variant>
              <Variant name="inverse on ink">
                <div style={{ background: "var(--surface-ink)", padding: "var(--space-5)" }}>
                  <CallNumber tone="inverse" series="Okwe Explains" issue={2} date="2026-06-09" />
                </div>
              </Variant>
            </div>
          </Specimen>

          <Specimen index="02.2" name="Tally" note="Counts in sulphur squares. The third specimen animates on mount.">
            <TallySpecimen />
          </Specimen>

          <Specimen index="02.3" name="ManifestDiagram" note="One ruled baseline, square joints, never arrows.">
            <ManifestDiagram
              stages={MANIFEST_STAGES}
              caption="Fig. 01 — one idea through the register."
            />
            <div style={{ background: "var(--surface-ink)", padding: "var(--space-7)" }}>
              <ManifestDiagram
                tone="inverse"
                showIndex={false}
                stages={MANIFEST_STAGES.slice(0, 3)}
                caption="Fig. 02 — inverse tone, no index."
              />
            </div>
          </Specimen>

          <Specimen index="02.4" name="MarginNote" note="Five roles, each carrying its own class colour.">
            <div style={row}>
              <MarginNote
                role="source"
                items={["UNCTAD, Review of Maritime Transport 2025", { href: "#", label: "Port of Lagos, monthly throughput" }]}
              />
              <MarginNote role="method" items={["Three-month rolling mean.", "Volumes normalised to TEU."]} />
              <MarginNote role="unknown">
                We do not know how much of the queue is bonded cargo.
              </MarginNote>
              <MarginNote role="correction" items={["2026-05-02 · figure corrected from 4.1 to 3.8."]} />
              <MarginNote role="note">A plain note, no items.</MarginNote>
            </div>
          </Specimen>
        </Section>

        {/* ── 03 core ────────────────────────────────────────────────── */}
        <Section index="03" label="Core">
          <Specimen index="03.1" name="Badge" note="Eight tones. `unknown` is dashed; `inverse` only reads on ink.">
            <div style={row}>
              {(["fact", "interpretation", "opinion", "unknown", "neutral", "mark", "ink"] as const).map((t) => (
                <Badge key={t} tone={t}>
                  {t}
                </Badge>
              ))}
            </div>
            <div style={{ ...row, background: "var(--surface-ink)", padding: "var(--space-5)" }}>
              <Badge tone="inverse">inverse</Badge>
            </div>
          </Specimen>

          <Specimen index="03.2" name="Button" note="Five variants, three sizes, plus disabled, indexed and full-width forms.">
            <div style={row}>
              {(["solid", "mark", "outline", "ghost", "link"] as const).map((v) => (
                <Variant key={v} name={v}>
                  <Button variant={v}>Publish entry</Button>
                </Variant>
              ))}
            </div>
            <div style={row}>
              {(["sm", "md", "lg"] as const).map((s) => (
                <Variant key={s} name={s}>
                  <Button size={s}>Size {s}</Button>
                </Variant>
              ))}
              <Variant name="disabled">
                <Button disabled>Disabled</Button>
              </Variant>
              <Variant name="index + icons">
                <Button variant="outline" index={3} leadingIcon="←" trailingIcon="→">
                  Indexed
                </Button>
              </Variant>
              <Variant name="href">
                <Button variant="ghost" href="#03-2">
                  Anchor
                </Button>
              </Variant>
            </div>
            <Button variant="outline" fullWidth>
              Full width
            </Button>
          </Specimen>

          <Specimen index="03.3" name="Card" note="Three variants. A card is a register entry, not a box: a top rule opens it, a hairline meta line closes it.">
            <div style={{ display: "grid", gap: "var(--space-8)", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              <Card
                variant="field"
                index={1}
                eyebrow="The Trade Desk"
                title="Why the port queue is a pricing signal"
                meta="TD·012"
                footer="2026-04-18"
              >
                <p style={{ font: "var(--type-body-sm)", margin: 0 }}>
                  A field card: transparent ground, ink rule, indexed.
                </p>
              </Card>
              <Card variant="plate" index={2} eyebrow="Numbers" title="Freight, twelve months" meta="NM·031" footer="2026-05-02">
                <p style={{ font: "var(--type-body-sm)", margin: 0 }}>
                  A plate card inverts its own ground and text.
                </p>
              </Card>
              <Card variant="inset" index={3} eyebrow="Field Notes" title="What we do not know" meta="FN·004" footer="2026-06-09" interactive>
                <p style={{ font: "var(--type-body-sm)", margin: 0 }}>
                  An inset card, marked interactive — its opening rule turns sulphur on hover.
                </p>
              </Card>
            </div>
          </Specimen>

          <Specimen index="03.4" name="Dialog" note="Opens on click, closes on the scrim or either footer control.">
            <DialogSpecimen />
          </Specimen>

          <Specimen index="03.5" name="IconButton" note="Square, label-required. Sizes, variants, a selected toggle and a disabled state.">
            <IconButtonSpecimen />
          </Specimen>

          <Specimen index="03.6" name="Tabs" note="Both variants are controlled; the selected ids are printed underneath.">
            <TabsSpecimen />
          </Specimen>

          <Specimen index="03.7" name="Tag" note="Selectable and removable. Remove them all to see the restore control.">
            <TagSpecimen />
          </Specimen>

          <Specimen index="03.8" name="Tooltip" note="Shows on hover and on keyboard focus, above or below.">
            <TooltipSpecimen />
          </Specimen>
        </Section>

        {/* ── 04 forms ───────────────────────────────────────────────── */}
        <Section index="04" label="Forms">
          <Specimen
            index="04.1"
            name="Field · Input · Select · Checkbox · Radio · Switch"
            note="Every control is controlled by real state, printed at the foot of the column. Field supplies the index, hint and error; the controls supply nothing but themselves."
          >
            <FormsSpecimen />
          </Specimen>
        </Section>

        {/* ── 05 editorial ───────────────────────────────────────────── */}
        <Section index="05" label="Editorial">
          <Specimen index="05.1" name="StatBlock" note="Three sizes, an optional tally, and an inverse tone. A figure without a source line is a bug.">
            <div style={row}>
              {(["sm", "md", "lg"] as const).map((s) => (
                <Variant key={s} name={s}>
                  <StatBlock
                    size={s}
                    figure="3.8"
                    unit="m TEU"
                    label="Annual throughput"
                    source="UNCTAD, 2025"
                  />
                </Variant>
              ))}
              <Variant name="with tally">
                <StatBlock figure="62" unit="%" label="Entries sourced" source="Okwe register, 2026-06" tally={62} />
              </Variant>
            </div>
            <div style={{ background: "var(--surface-ink)", padding: "var(--space-7)", ...row }}>
              <StatBlock tone="inverse" figure="41" unit="days" label="Median queue" source="Port authority, 2026-04" tally={41} />
            </div>
          </Specimen>

          <Specimen index="05.2" name="PullQuote" note="Attribution and role are separate lines.">
            <PullQuote attribution="Ada Okwe" role="Editor">
              A number without its source is decoration.
            </PullQuote>
            <div style={{ background: "var(--surface-ink)", padding: "var(--space-7)" }}>
              <PullQuote tone="inverse" attribution="The register" role="Rule 01">
                Publish the gap as well as the finding.
              </PullQuote>
            </div>
          </Specimen>

          <Specimen index="05.3" name="DefinitionCard" note="Term, pronunciation, definition, and the two disambiguation lines.">
            <DefinitionCard
              callNumber="AC·009"
              term="Demurrage"
              pronunciation="/dɪˈmʌrɪdʒ/"
              definition="The charge a carrier levies when cargo sits in the terminal beyond its free time."
              alsoKnownAs="Detention (when the charge follows the container out of the yard)"
              notThis="Storage — which the terminal, not the carrier, bills for."
            />
          </Specimen>

          <Specimen index="05.4" name="FrameworkList" note="Three markers, an optional closing principle, and an inverse tone.">
            <div style={row}>
              <Variant name="numbered">
                <FrameworkList
                  steps={[
                    { title: "Register", body: "One idea enters the ledger." },
                    { title: "Source", body: "Every claim gets a line.", value: "2d" },
                    { title: "Classify", body: "Fact, interpretation, opinion." },
                  ]}
                  principle="Nothing publishes without a class."
                />
              </Variant>
              <Variant name="lettered">
                <FrameworkList variant="lettered" steps={["Read the register", "Cut the assets", "Ship the entry"]} />
              </Variant>
              <Variant name="dashed">
                <FrameworkList variant="dashed" steps={["No shadows", "No radii", "No boxes"]} />
              </Variant>
            </div>
            <div style={{ background: "var(--surface-ink)", padding: "var(--space-7)" }}>
              <FrameworkList
                tone="inverse"
                steps={[{ title: "Plate", body: "The second plate of the same document." }]}
                principle="Inverse is not dark mode."
              />
            </div>
          </Specimen>
        </Section>

        {/* ── 06 social ──────────────────────────────────────────────── */}
        <Section index="06" label="Social">
          <Specimen
            index="06.1"
            name="PostCanvas"
            note={`Eight canvases, each a fixed ratio: ${Object.entries(CANVASES)
              .map(([k, v]) => `${k} ${v.w}×${v.h}`)
              .join(" · ")}. Rendered here at a reduced width.`}
          >
            <div style={grid(240)}>
              {(Object.keys(CANVASES) as Array<keyof typeof CANVASES>).map((name) => (
                <Variant key={name} name={`${name} · ${CANVASES[name].label}`}>
                  <PostCanvas
                    canvas={name}
                    renderWidth={200}
                    series="Okwe Explains"
                    issue={2}
                    part={1}
                    date="2026-06-09"
                    classMark="Fact"
                    tally={62}
                  />
                </Variant>
              ))}
            </div>
            <div style={row}>
              {(["chalk", "field", "plate", "system", "mark"] as const).map((t) => (
                <Variant key={t} name={`theme · ${t}`}>
                  <PostCanvas canvas="square" theme={t} renderWidth={180} series="Numbers" issue={31} date="2026-05-02" />
                </Variant>
              ))}
              <Variant name="safe zone, no register">
                <PostCanvas canvas="square" renderWidth={180} showSafeZone showRegister={false} />
              </Variant>
            </div>
          </Specimen>

          <Specimen index="06.2" name="CarouselSlide" note="Six kinds, each composed on a PostCanvas.">
            <div style={row}>
              <Variant name="cover">
                <CarouselSlide
                  kind="cover"
                  index={1}
                  total={6}
                  issue={12}
                  date="2026-04-18"
                  classMark="Fact"
                  eyebrow="The Trade Desk"
                  title="Why the port queue is a pricing signal"
                  renderWidth={220}
                />
              </Variant>
              <Variant name="content">
                <CarouselSlide
                  kind="content"
                  index={2}
                  total={6}
                  title="The queue is the price"
                  body="When a berth is scarce, the waiting time is charged forward into the landed cost of everything on the ship."
                  renderWidth={220}
                />
              </Variant>
              <Variant name="framework">
                <CarouselSlide
                  kind="framework"
                  index={3}
                  total={6}
                  title="Three checks"
                  items={["Berth availability", { title: "Free time", body: "Days before demurrage" }, "Inland haulage"]}
                  principle="Cost accrues where cargo waits."
                  renderWidth={220}
                />
              </Variant>
              <Variant name="comparison">
                <CarouselSlide
                  kind="comparison"
                  index={4}
                  total={6}
                  title="Demurrage vs storage"
                  items={["Demurrage · billed by the carrier", "Storage · billed by the terminal"]}
                  renderWidth={220}
                />
              </Variant>
              <Variant name="conclusion">
                <CarouselSlide
                  kind="conclusion"
                  index={5}
                  total={6}
                  title="Read the queue"
                  figure="3.8"
                  unit="m TEU"
                  source="UNCTAD, 2025"
                  renderWidth={220}
                />
              </Variant>
              <Variant name="cta">
                <CarouselSlide kind="cta" index={6} total={6} title="Okwe knows" cta="Read the entry" renderWidth={220} />
              </Variant>
            </div>
          </Specimen>

          <Specimen index="06.3" name="StatCard" note="A statistic cannot publish without its source line.">
            <div style={row}>
              <Variant name="plate · square">
                <StatCard figure="3.8" unit="m TEU" label="Annual throughput" source="UNCTAD, 2025" issue={31} renderWidth={240} />
              </Variant>
              <Variant name="chalk · with tally">
                <StatCard
                  theme="chalk"
                  figure="62"
                  unit="%"
                  label="Entries sourced"
                  source="Okwe register, 2026-06"
                  tally={62}
                  issue={32}
                  date="2026-06-01"
                  renderWidth={240}
                />
              </Variant>
              <Variant name="mark · portrait">
                <StatCard theme="mark" canvas="portrait" figure="41" unit="days" label="Median queue" source="Port authority, 2026-04" renderWidth={200} />
              </Variant>
            </div>
          </Specimen>

          <Specimen index="06.4" name="ThumbnailCard" note="A 16:9 thumbnail. The title is set at a fixed 104u with no clamp, so anything past three lines is clipped by the card — the third specimen shows the limit.">
            <div style={row}>
              <Variant name="plate">
                <ThumbnailCard
                  title="Who pays for the wait"
                  issue={9}
                  duration="12:40"
                  imageLabel="Portrait · Lagos"
                  question="A queue is a price."
                  renderWidth={300}
                />
              </Variant>
              <Variant name="chalk">
                <ThumbnailCard theme="chalk" title="What demurrage actually is" series="Okwe Explains" issue={2} duration="06:15" renderWidth={300} />
              </Variant>
              <Variant name="long title · clips (known limit)">
                <ThumbnailCard
                  title="How a port queue sets your price"
                  issue={10}
                  duration="14:02"
                  question="This question is pushed out of the card."
                  renderWidth={300}
                />
              </Variant>
            </div>
          </Specimen>
        </Section>

        {/* ── 07 plate mode ──────────────────────────────────────────── */}
        <Section index="07" label="Plate mode">
          <Specimen
            index="07.1"
            name="[data-theme=plate]"
            note="The same components inside a plate-mode block. Every colour below comes from the same tokens as the sections above — only the token values change."
          >
            <div
              data-theme="plate"
              style={{
                background: "var(--surface-page)",
                color: "var(--text-primary)",
                padding: "var(--space-9)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-8)",
              }}
            >
              <div style={rule3} />
              <CallNumber series="Okwe Explains" issue={2} className="Interpretation" date="2026-06-09" />
              <div style={row}>
                <Logo variant="horizontal" tone="inverse" size={26} />
                <Seeds size={18} fill="var(--sulphur-400)" />
              </div>
              <div style={row}>
                {(["fact", "interpretation", "opinion", "unknown", "neutral", "mark"] as const).map((t) => (
                  <Badge key={t} tone={t}>
                    {t}
                  </Badge>
                ))}
              </div>
              <div style={row}>
                <Button variant="solid">Solid</Button>
                <Button variant="mark">Mark</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button disabled>Disabled</Button>
              </div>
              <StatBlock figure="3.8" unit="m TEU" label="Annual throughput" source="UNCTAD, 2025" tally={38} />
              <Card variant="field" index={1} eyebrow="Plate" title="A card on the second plate" meta="OKW·DS/01" footer="2026-06-09">
                <p style={{ font: "var(--type-body-sm)", margin: 0 }}>
                  If this text is dark on dark, the plate tokens are not reaching the component.
                </p>
              </Card>
              <MarginNote role="unknown">
                What we do not know, on the plate.
              </MarginNote>
            </div>
          </Specimen>
        </Section>

        <footer style={{ ...rule3, marginTop: "var(--space-11)", paddingTop: "var(--space-5)" }}>
          <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
            END · OKW·DS/01 · {COMPONENT_COUNT} COMPONENTS
          </span>
        </footer>
      </div>
    </div>
  );
}
