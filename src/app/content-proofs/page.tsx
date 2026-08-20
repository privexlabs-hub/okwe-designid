import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/design-system/components/core/Badge";
import { DefinitionCard } from "@/design-system/components/editorial/DefinitionCard";
import { FrameworkList } from "@/design-system/components/editorial/FrameworkList";
import { PullQuote } from "@/design-system/components/editorial/PullQuote";
import { StatBlock } from "@/design-system/components/editorial/StatBlock";
import { CallNumber } from "@/design-system/components/notation/CallNumber";
import { ManifestDiagram } from "@/design-system/components/notation/ManifestDiagram";
import { MarginNote } from "@/design-system/components/notation/MarginNote";
import { Tally } from "@/design-system/components/notation/Tally";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import { PostCanvas } from "@/design-system/components/social/PostCanvas";
import { StatCard } from "@/design-system/components/social/StatCard";
import { ThumbnailCard } from "@/design-system/components/social/ThumbnailCard";
import { PLATE_KEY, PlateSwitch } from "./PlateSwitch";
import { ProofIndex } from "./ProofIndex";
import { proofId } from "./proofId";
import css from "./proofs.module.css";

export const metadata: Metadata = { title: "Content proofs" };

const PROOFS = [
  { n: 1, title: "Definition" },
  { n: 2, title: "Framework" },
  { n: 3, title: "Statistic" },
  { n: 4, title: "Complex diagram" },
  { n: 5, title: "Case study" },
  { n: 6, title: "Quotation" },
  { n: 7, title: "Research finding" },
  { n: 8, title: "YouTube thumbnail" },
  { n: 9, title: "Instagram carousel" },
  { n: 10, title: "LinkedIn document" },
  { n: 11, title: "Course cover" },
  { n: 12, title: "Report cover" },
];

/** Restores plate mode before first paint, so the page never flashes chalk. */
const BOOT = `try{if(localStorage.getItem(${JSON.stringify(PLATE_KEY)})==="1")document.documentElement.setAttribute("data-theme","plate")}catch(e){}`;

function Proof({
  n,
  title,
  note,
  children,
  wide = false,
}: {
  n: number;
  title: string;
  note?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      id={proofId(n)}
      tabIndex={-1}
      aria-label={`Proof ${String(n).padStart(2, "0")} — ${title}`}
      className={wide ? `${css.proof} ${css.proofWide}` : css.proof}
    >
      <div className={wide ? css.proofRailWide : css.proofRail}>
        <span className="okwe-call" style={{ fontWeight: 700 }}>
          {String(n).padStart(2, "0")}
        </span>
        <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
          {title}
        </span>
        {note && !wide && (
          <span className="okwe-source" style={{ color: "var(--text-quiet)" }}>
            {note}
          </span>
        )}
      </div>
      <div className={css.proofBody}>{children}</div>
    </section>
  );
}

export default function ProofsPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <main className={css.page}>
        <header className={css.header}>
          <div className={css.headCall}>
            <CallNumber
              series="Research"
              issue={1}
              orientation="horizontal"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
              }}
            />
          </div>
          <div className={css.headTitle}>
            <Link
              href="/"
              className="okwe-block-link okwe-call"
              style={{ color: "var(--text-muted)" }}
            >
              ← Operating system
            </Link>
            <h1>Twelve content proofs</h1>
          </div>
          <div className={css.headAside}>
            <PlateSwitch />
            <p
              style={{
                font: "var(--type-caption)",
                color: "var(--text-muted)",
              }}
            >
              The identity tested on real content, not on a brand slide. The wordmark appears only
              in the register foot of published canvases — cover it and the system still reads as
              Okwe.
            </p>
          </div>
        </header>

        <ProofIndex proofs={PROOFS} />

        <Proof n={1} title="Definition" note="Term series">
          <DefinitionCard
            callNumber="TD·012 · TERM"
            term="Landed cost"
            pronunciation="LAN-did"
            definition="The total cost of getting one unit into your warehouse, ready to sell."
            alsoKnownAs="total delivered cost"
            notThis="the supplier's invoice price"
          />
        </Proof>

        <Proof n={2} title="Framework" note="Five lines maximum">
          <FrameworkList
            steps={[
              {
                title: "Unit cost",
                body: "What the supplier charges per unit, at the agreed Incoterm.",
                value: "$4.10",
              },
              {
                title: "Freight and origin",
                body: "Ocean or air, plus handling and documentation at origin.",
                value: "$0.90",
              },
              {
                title: "Duty, levies, VAT",
                body: "Set by HS classification, not by the supplier's description.",
                value: "$1.35",
              },
              {
                title: "Clearing and terminal",
                body: "Agent fees, terminal handling, demurrage risk.",
                value: "$0.42",
              },
              {
                title: "Inland and losses",
                body: "Haulage to the warehouse, plus expected damage.",
                value: "$0.30",
              },
            ]}
            principle="A price you cannot decompose is a price you cannot defend."
          />
        </Proof>

        <Proof n={3} title="Statistic" note="Counted, then sourced">
          <div className={css.stats}>
            <StatBlock
              figure="61"
              unit="%"
              tally={61}
              label="of landed cost sits on the supplier invoice"
              source="Okwe measurement · one shipment · Oct 2026"
            />
            <StatBlock
              figure="18"
              unit="days"
              tally={18}
              total={30}
              label="Port to warehouse, timed hourly"
              source="Two shipments · Apapa · Oct 2026"
            />
            <StatBlock
              figure="4"
              unit="/9"
              tally={4}
              total={9}
              label="Documents ready when the vessel berthed"
              source="Illustrative — not measured"
            />
          </div>
        </Proof>

        <Proof n={4} title="Complex diagram" note="The manifest" wide>
          <p className={css.scrollHint}>Wide manifest — scroll the diagram sideways</p>
          <div className={css.diagrams}>
            <div className="okwe-scroll-x">
              <ManifestDiagram
                stages={[
                  {
                    input: "Question",
                    label: "Research",
                    state: "Field measurement or primary source",
                  },
                  {
                    input: "Research",
                    label: "Content",
                    state: "Published with method and gaps",
                  },
                  {
                    input: "Content",
                    label: "Audience",
                    state: "Questions logged in the register",
                    mark: true,
                  },
                  {
                    input: "Questions",
                    label: "Product",
                    state: "Workshop, then course",
                  },
                  {
                    input: "Teaching",
                    label: "Knowledge",
                    state: "IP the next question starts from",
                  },
                ]}
                caption="The Okwe operating loop · each stage is only entered when the previous one produced evidence"
              />
            </div>
            <div className="okwe-scroll-x">
              <ManifestDiagram
                stages={[
                  { input: "Guangzhou", label: "Ex-works", value: "D+0" },
                  { input: "Yantian", label: "Loaded", value: "D+6" },
                  { input: "At sea", label: "In transit", value: "D+34" },
                  {
                    input: "Apapa",
                    label: "Berthed",
                    value: "D+36",
                    mark: true,
                  },
                  { input: "Customs", label: "Cleared", value: "D+41" },
                  { input: "Haulage", label: "In warehouse", value: "D+54" },
                ]}
                caption="One 20ft container, tracked hourly · the marked stage is where the schedule broke"
              />
            </div>
          </div>
        </Proof>

        <Proof n={5} title="Case study" note="Situation · decision · result · lesson">
          <div className={css.annotated}>
            <div className={css.claim}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <Badge tone="fact">Sourced</Badge>
                <Badge tone="unknown">One case</Badge>
                <span className="okwe-call" style={{ color: "var(--text-muted)" }}>
                  CF·002 · CASE FILE
                </span>
              </div>
              <h2 className={css.h2}>A distributor who priced from the invoice</h2>
              <FrameworkList
                variant="lettered"
                steps={[
                  {
                    title: "Situation",
                    body: "A Lagos distributor imported one container of finished goods and priced at invoice plus 35%.",
                  },
                  {
                    title: "Decision",
                    body: "They committed to a retail price before duty was classified.",
                  },
                  {
                    title: "Result",
                    body: "Duty landed at 20% rather than the 5% assumed. Gross margin fell to 4%.",
                  },
                  {
                    title: "Lesson",
                    body: "Classification is a pricing decision, not a customs formality.",
                  },
                ]}
              />
            </div>
            <MarginNote role="unknown">
              Single case, reported to us by the business. We could not verify the invoice or the
              assessment notice.
            </MarginNote>
          </div>
        </Proof>

        <Proof n={6} title="Quotation">
          <PullQuote attribution="Freight forwarder" role="Apapa, Lagos · interview, Oct 2026">
            Clearance is rarely the delay. Paperwork prepared late is the delay.
          </PullQuote>
        </Proof>

        <Proof n={7} title="Research finding" note="Method and gaps in the margin">
          <div className={css.annotated}>
            <div className={css.claim}>
              <span className="okwe-question">
                Does customs clearance explain port-to-warehouse time?
              </span>
              <p style={{ font: "var(--type-body)" }}>
                On the two shipments we tracked, clearance accounted for five of eighteen days.
                Documentation prepared after the vessel berthed accounted for nine. The remaining
                four were haulage scheduling.
              </p>
              <Tally
                filled={5}
                total={18}
                rows={2}
                unit="11px"
                label="5 of 18 days attributable to clearance"
              />
            </div>
            <div className={css.notes}>
              <MarginNote role="method">
                Hourly timestamps from berth to warehouse gate, two containers, same route and
                agent.
              </MarginNote>
              <MarginNote role="unknown">
                Two shipments cannot establish a route average. We publish it as a measurement, not
                a statistic.
              </MarginNote>
            </div>
          </div>
        </Proof>

        <Proof n={8} title="YouTube thumbnail" note="Reads at 210px" wide>
          <p className={css.scrollHint}>Fixed-size artwork — scroll the row sideways</p>
          <div className={`${css.canvasRow} okwe-scroll-x`}>
            <ThumbnailCard
              series="How It Works"
              issue={9}
              title="Why your container waits"
              question="Customs was not the delay."
              duration="14 MIN"
              renderWidth={420}
            />
            <div className={css.canvasSide}>
              <ThumbnailCard
                series="The Trade Desk"
                issue={12}
                title="Price it before you buy"
                duration="21 MIN"
                theme="system"
                renderWidth={210}
              />
              <span className="okwe-source">
                At 210px the call number, the expanded title and the sulphur edge are all still
                legible.
              </span>
            </div>
          </div>
        </Proof>

        <Proof n={9} title="Instagram carousel" note="Six parts, one document" wide>
          <div className={`${css.canvasRow} ${css.canvasRowTight} okwe-scroll-x`}>
            <CarouselSlide
              kind="cover"
              index={1}
              total={6}
              series="The Trade Desk"
              issue={12}
              date="18 AUG 2026"
              renderWidth={186}
              title="What landed cost actually includes"
              body="Five numbers most importers forget."
            />
            <CarouselSlide
              kind="content"
              index={2}
              total={6}
              series="The Trade Desk"
              issue={12}
              renderWidth={186}
              eyebrow="The problem"
              title="The invoice is not the cost"
              body="On the shipment we tracked, the invoice was 61% of the true cost per unit."
              source="Okwe measurement · one shipment"
            />
            <CarouselSlide
              kind="framework"
              index={3}
              total={6}
              series="The Trade Desk"
              issue={12}
              renderWidth={186}
              eyebrow="Decompose it"
              title="Five lines"
              items={[
                { title: "Unit cost", value: "4.10" },
                { title: "Freight", value: "0.90" },
                { title: "Duty & VAT", value: "1.35" },
                { title: "Clearing", value: "0.42" },
                { title: "Inland", value: "0.30" },
              ]}
            />
            <CarouselSlide
              kind="comparison"
              index={4}
              total={6}
              series="The Trade Desk"
              issue={12}
              renderWidth={186}
              eyebrow="Compare"
              title="Two ways to price"
              items={[
                { title: "Invoice + margin", body: "Fast. Usually wrong." },
                { title: "Landed + margin", body: "Slower. Defensible." },
              ]}
            />
            <CarouselSlide
              kind="conclusion"
              index={5}
              total={6}
              series="The Trade Desk"
              issue={12}
              renderWidth={186}
              eyebrow="Takeaway"
              title="Price the shipment, not the invoice"
              principle="A price you cannot decompose is a price you cannot defend."
            />
            <CarouselSlide
              kind="cta"
              index={6}
              total={6}
              series="The Trade Desk"
              issue={12}
              renderWidth={186}
              title="One idea a week."
              body="Written from real shipments, not theory."
              cta="okweknowledge.com"
            />
          </div>
        </Proof>

        <Proof n={10} title="LinkedIn document" note="1080² parts" wide>
          <div className={`${css.canvasRow} ${css.canvasRowTight} okwe-scroll-x`}>
            <CarouselSlide
              canvas="square"
              kind="cover"
              index={1}
              total={4}
              series="Business Anatomy"
              issue={3}
              date="18 AUG 2026"
              renderWidth={230}
              title="The five decisions inside a distribution business"
            />
            <CarouselSlide
              canvas="square"
              kind="framework"
              index={2}
              total={4}
              series="Business Anatomy"
              issue={3}
              renderWidth={230}
              eyebrow="Where margin is decided"
              title="Before the sale"
              items={[
                { title: "Sourcing" },
                { title: "Classification" },
                { title: "Credit terms" },
                { title: "Route design" },
              ]}
            />
            <CarouselSlide
              canvas="square"
              kind="conclusion"
              index={3}
              total={4}
              series="Business Anatomy"
              issue={3}
              renderWidth={230}
              eyebrow="Conclusion"
              title="Margin is an operating decision"
              principle="Nothing you do at the point of sale recovers a sourcing mistake."
            />
            <StatCard
              canvas="square"
              figure="4"
              unit="%"
              tally={4}
              total={100}
              label="Gross margin left after a misclassified duty line"
              source="Case file CF·002 · one business · reported"
              series="Numbers"
              issue={8}
              renderWidth={230}
            />
          </div>
        </Proof>

        <Proof n={11} title="Course cover" note="Academy" wide>
          <p className={css.scrollHint}>Fixed-size artwork — scroll the row sideways</p>
          <div className={`${css.canvasRow} okwe-scroll-x`}>
            <PostCanvas
              canvas="landscape"
              theme="plate"
              renderWidth={430}
              series="Okwe Academy"
              issue={1}
              classMark="Workshop"
              date="24 SEP 2026"
              tally={13}
              tallyTotal={20}
              destination="3 hours · online"
            >
              <span
                className="okwe-display"
                style={{
                  fontSize: 74,
                  lineHeight: 0.96,
                  color: "var(--chalk-50)",
                }}
              >
                Pricing an import before you buy
              </span>
              <span
                style={{
                  fontFamily: "var(--font-read)",
                  fontSize: 26,
                  color: "var(--cyanotype-200)",
                  maxWidth: "40ch",
                }}
              >
                You bring a real product. You leave with a landed-cost model you can defend to a
                buyer.
              </span>
            </PostCanvas>
            <div className={css.canvasSide}>
              <span className="okwe-source">
                The register tally shows seats taken — the counting device doing operational work,
                not decoration.
              </span>
              <PostCanvas
                canvas="square"
                theme="mark"
                renderWidth={200}
                series="Okwe Academy"
                issue={1}
                classMark="Lesson"
                destination="02 / 06"
              >
                <span className="okwe-display" style={{ fontSize: 44, lineHeight: 0.98 }}>
                  Classify the goods
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontStretch: "87.5%",
                    fontSize: 22,
                    letterSpacing: ".08em",
                  }}
                >
                  38 MIN · WORKBOOK P.11
                </span>
              </PostCanvas>
            </div>
          </div>
        </Proof>

        <Proof n={12} title="Report cover" note="A4" wide>
          <p className={css.scrollHint}>Fixed-size artwork — scroll the row sideways</p>
          <div className={`${css.canvasRow} okwe-scroll-x`}>
            <PostCanvas
              canvas="report"
              theme="plate"
              renderWidth={300}
              series="Research"
              issue={1}
              classMark="Research"
              date="NOV 2026"
              tally={2}
              tallyTotal={10}
              destination="okweknowledge.com/research"
            >
              <span className="okwe-call" style={{ color: "var(--cyanotype-300)" }}>
                FIELD MEASUREMENT · APAPA
              </span>
              <span
                className="okwe-display"
                style={{
                  fontSize: 62,
                  lineHeight: 0.95,
                  color: "var(--chalk-50)",
                }}
              >
                Where the eighteen days go
              </span>
              <span
                style={{
                  fontFamily: "var(--font-read)",
                  fontSize: 22,
                  color: "var(--cyanotype-200)",
                  maxWidth: "34ch",
                }}
              >
                Two containers, timed hourly from berth to warehouse gate.
              </span>
            </PostCanvas>
            <PostCanvas
              canvas="report"
              theme="chalk"
              renderWidth={300}
              series="Research"
              issue={1}
              part={4}
              classMark="Method"
              date="NOV 2026"
              destination="p. 04"
            >
              <span className="okwe-display" style={{ fontSize: 30 }}>
                Method
              </span>
              <p style={{ font: "var(--type-body-sm)", maxWidth: "38ch" }}>
                Timestamps were taken at berth, gate-out, clearance approval and warehouse receipt,
                on two containers moving the same route with the same agent.
              </p>
              <Tally
                filled={5}
                total={18}
                rows={2}
                unit="10px"
                label="5 of 18 days attributable to clearance"
              />
              <MarginNote role="unknown">
                Two shipments cannot establish an average. We publish measurements, not statistics.
              </MarginNote>
            </PostCanvas>
          </div>
        </Proof>
      </main>
    </>
  );
}
