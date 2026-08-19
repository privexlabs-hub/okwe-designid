import type { Metadata } from "next";
import Link from "next/link";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import { PostCanvas } from "@/design-system/components/social/PostCanvas";
import { StatCard } from "@/design-system/components/social/StatCard";
import { ThumbnailCard } from "@/design-system/components/social/ThumbnailCard";
import { ProfileRegister } from "./ProfileRegister";

export const metadata: Metadata = { title: "Social profile kit" };

/** OKW-SOC-KIT-01 — the profile and template kit, ported from the prototype. */
export default function SocialKitPage() {
  return (
    <main
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "48px 32px 96px",
        display: "flex",
        flexDirection: "column",
        gap: "64px",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
          borderBottom: "2px solid var(--rule-ink)",
          paddingBottom: "var(--space-7)",
        }}
      >
        <Link
          href="/"
          className="okwe-block-link"
          style={{
            font: "var(--type-label)",
            fontStretch: "var(--stretch-mono)",
            letterSpacing: "var(--tracking-label)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          ← Operating system
        </Link>
        <span
          style={{
            font: "var(--type-label)",
            letterSpacing: "var(--tracking-label)",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          Social profile &amp; template kit
        </span>
        <h1 style={{ font: "var(--type-h1)", letterSpacing: "var(--tracking-display)" }}>
          One institution across eight surfaces
        </h1>
        <p
          style={{
            font: "var(--type-lede)",
            color: "var(--text-secondary)",
            maxWidth: "var(--measure-body)",
          }}
        >
          Same call number, same index band, same register foot. The platform changes the format;
          the notation never changes.
        </p>
      </header>

      <ProfileRegister />

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
        <h2 style={{ font: "var(--type-h2)", fontSize: "var(--size-2xl)" }}>
          Header and feed templates
        </h2>
        <div
          style={{
            display: "flex",
            gap: "var(--space-7)",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <figure
            style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
          >
            <PostCanvas
              canvas="banner"
              theme="plate"
              renderWidth={600}
              series="Okwe Knowledge"
              issue={1}
              classMark="Register"
              destination="okweknowledge.com"
            >
              <span
                className="okwe-display"
                style={{
                  fontSize: 70,
                  lineHeight: 0.98,
                  color: "var(--chalk-50)",
                  maxWidth: "24ch",
                }}
              >
                How trade, logistics and enterprise actually work.
              </span>
            </PostCanvas>
            <figcaption style={{ font: "var(--type-data)", color: "var(--text-muted)" }}>
              OKW-SOC-X-BANNER-01 · 1500×500
            </figcaption>
          </figure>
          <figure
            style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
          >
            <ThumbnailCard
              series="How It Works"
              title="Why your container waits"
              duration="14 MIN"
              renderWidth={400}
            />
            <figcaption style={{ font: "var(--type-data)", color: "var(--text-muted)" }}>
              OKW-VID-YT-THUMB-01 · 1280×720
            </figcaption>
          </figure>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
        <h2 style={{ font: "var(--type-h2)", fontSize: "var(--size-2xl)" }}>
          The six-slide carousel set
        </h2>
        <div style={{ display: "flex", gap: "var(--space-5)", flexWrap: "wrap" }}>
          <CarouselSlide
            kind="cover"
            index={1}
            total={6}
            series="The Trade Desk"
            issue={12}
            renderWidth={216}
            title="What landed cost actually includes"
            body="Five numbers most importers forget."
          />
          <CarouselSlide
            kind="content"
            index={2}
            total={6}
            series="The Trade Desk"
            issue={12}
            renderWidth={216}
            eyebrow="The problem"
            title="The invoice is not the cost"
            body="On the shipment we tracked, the invoice was 61% of the true cost per unit."
          />
          <CarouselSlide
            kind="framework"
            index={3}
            total={6}
            series="The Trade Desk"
            issue={12}
            renderWidth={216}
            eyebrow="Decompose it"
            title="Five lines"
            items={[
              "Unit cost",
              "Freight and origin",
              "Duty, levies, VAT",
              "Clearing and terminal",
              "Inland and losses",
            ]}
          />
          <CarouselSlide
            kind="comparison"
            index={4}
            total={6}
            series="The Trade Desk"
            issue={12}
            renderWidth={216}
            theme="system"
            eyebrow="Compare"
            title="Two ways to price"
            items={[
              { title: "Invoice + margin", body: "Fast. Usually wrong." },
              { title: "Landed cost + margin", body: "Slower. Defensible." },
            ]}
          />
          <CarouselSlide
            kind="conclusion"
            index={5}
            total={6}
            series="The Trade Desk"
            issue={12}
            renderWidth={216}
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
            renderWidth={216}
            title="One idea a week."
            body="Written from real shipments, not theory."
            cta="okweknowledge.com"
          />
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-7)" }}>
        <h2 style={{ font: "var(--type-h2)", fontSize: "var(--size-2xl)" }}>Data and short-form</h2>
        <div
          style={{
            display: "flex",
            gap: "var(--space-7)",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <StatCard
            figure="18"
            unit="days"
            label="Port to warehouse on the route we tracked"
            source="Okwe field measurement, 2 shipments, Oct 2026"
            series="Numbers"
            issue={7}
            renderWidth={260}
          />
          <CarouselSlide
            canvas="story"
            kind="cover"
            theme="plate"
            series="Okwe Explains"
            issue={3}
            renderWidth={180}
            eyebrow="Hook"
            title="Your margin dies after the invoice."
            body="Here is where it goes."
          />
          <PostCanvas
            canvas="landscape"
            theme="field"
            renderWidth={380}
            series="Okwe Explains"
            issue={3}
            classMark="Principle"
          >
            <span className="okwe-display" style={{ fontSize: 72, lineHeight: 1, maxWidth: "24ch" }}>
              A price you cannot decompose is a price you cannot defend.
            </span>
          </PostCanvas>
        </div>
      </section>
    </main>
  );
}
