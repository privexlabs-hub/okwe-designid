import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import "../playbook/doc.css";
import { Logo } from "@/design-system/components/brand/Logo";
import { Seeds } from "@/design-system/components/brand/Seeds";
import { Badge } from "@/design-system/components/core/Badge";
import { CallNumber } from "@/design-system/components/notation/CallNumber";
import { ManifestDiagram } from "@/design-system/components/notation/ManifestDiagram";
import { MarginNote } from "@/design-system/components/notation/MarginNote";
import { Tally } from "@/design-system/components/notation/Tally";
import { CarouselSlide } from "@/design-system/components/social/CarouselSlide";
import { CANVASES } from "@/design-system/components/social/PostCanvas";
import type { CanvasName } from "@/design-system/components/social/PostCanvas";
import { LOGO_MANIFEST } from "@/content/brand";
import type { LogoBrand } from "@/content/brand";
import { BUSINESS } from "@/content/business";
import {
  ALIAS_GROUPS,
  ALIAS_NOTES,
  COLOUR_DONTS,
  COLOUR_DOS,
  COLOUR_EXCEPTIONS,
  COLOUR_ROLES,
  COMPONENTS,
  FRAME_NOTES,
  GUARDS,
  GUIDELINES_INTRO,
  LOCKUP_USE,
  LOGO_DONTS,
  MOTIF_DEVICES,
  MOTIF_RULES,
  PRIMARY_SECONDARY,
  RADIUS_RULES,
  SECTIONS,
  SHADOW_RULES,
  SLIDE_RULES,
  SOURCES_OF_TRUTH,
  SPACING_RULES,
  STATES,
  TYPE_FACES,
  TYPE_ROLES,
  TYPE_RULES,
  UI_KITS,
  VOICE_SECTIONS,
} from "@/content/guidelines";
import type { SectionId } from "@/content/guidelines";
import { playbookSection } from "@/content/playbook";
import { TEMPLATES } from "@/content/templates";
import { contrast, grade, isHex, ratioLabel } from "@/lib/contrast";
import { CRITERIA, FLOOR, HARD_STOP, MAX_TOTAL, THRESHOLD } from "@/lib/quality";
import { isAlias, tokenUsage } from "@/lib/tokens";
import type { Token, TokenSet } from "@/lib/tokens";
import s from "./guidelines.module.css";

/* ------------------------------------------------------------- helpers ---- */

const num = (id: SectionId) =>
  String(SECTIONS.findIndex((x) => x.id === id) + 1).padStart(2, "0");
const titleOf = (id: SectionId) => SECTIONS.find((x) => x.id === id)?.title ?? id;

/** `var(--chalk-100)` → `chalk-100`; anything else as written. */
const refName = (v: string) => v.match(/^var\(--([\w-]+)\)$/)?.[1] ?? v;

function Section({ id, lead, children }: { id: SectionId; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      <div className={s.sectionHead}>
        <span className={s.num}>{num(id)}</span>
        <h2 id={`${id}-h`} className={s.h2}>
          {titleOf(id)}
        </h2>
      </div>
      {lead && <div className={s.lead}>{lead}</div>}
      {children}
    </section>
  );
}

function Sub({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className={s.sub}>
      <h3 className={s.h3}>{title}</h3>
      {note && <p className={s.note}>{note}</p>}
      {children}
    </div>
  );
}

function Rules({ items }: { items: ReadonlyArray<{ rule: string; source: string }> }) {
  return (
    <ul className={s.rules}>
      {items.map((r) => (
        <li key={r.rule} className={s.ruleRow}>
          <span className={s.ruleText}>{r.rule}</span>
          <span className={s.source}>{r.source}</span>
        </li>
      ))}
    </ul>
  );
}

function Swatch({ value }: { value: string }) {
  if (!isHex(value) && !value.startsWith("rgba")) return null;
  return <span className={s.swatch} style={{ background: value }} aria-hidden="true" />;
}

function Table({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={`okwe-scroll-x ${s.tableWrap}`} role="region" aria-label={label} tabIndex={0}>
      <table className={s.table}>{children}</table>
    </div>
  );
}

function Grade({ r }: { r: number | null }) {
  const g = grade(r);
  return (
    <span className={`${s.grade} ${g === "Fail" ? s.gradeFail : ""}`}>
      {ratioLabel(r)} {g !== "—" && <b>{g}</b>}
    </span>
  );
}

/** Quote a playbook section in its own rendered form. */
function Quote({ html }: { html: string }) {
  return <div className={`okwe-doc ${s.quote}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function markProps(brand: LogoBrand) {
  return {
    arm: brand.kind === "process" ? (brand.arm ?? undefined) : undefined,
    knowledge: brand.kind === "imprint",
  };
}

const KIND_LABEL: Record<LogoBrand["kind"], string> = {
  parent: "Parent",
  process: "Process",
  imprint: "Publishing imprint",
};

/* ---------------------------------------------------------------- page ---- */

/** OKW-GUIDE-01 — the brand guidelines. */
export function Guidelines({ tokens }: { tokens: TokenSet }) {
  const { byFile, byName, ramps, resolve } = tokens;
  const hex = (name: string, plate = false) => resolve(name, plate);
  const chalk = hex("--chalk-100");
  const ink = hex("--cyanotype-900");

  const aliases = byFile.colors.filter((t) => isAlias(t.name));
  const usage = tokenUsage(aliases.map((a) => a.name));

  /** Which aliases point at a ramp step, by default and on the plate. */
  const pointsAt = (step: string, plate: boolean) =>
    aliases
      .filter((a) => (plate ? a.plate : a.value) === `var(${step})`)
      .map((a) => a.name.slice(2));

  const plateFlips = aliases.filter((a) => a.plate).length;
  const pb = contrast(hex("--cyanotype-800"), hex("--chalk-100"));

  const typeTokens = byFile.typography;
  const byPrefix = (list: Token[], p: string) => list.filter((t) => t.name.startsWith(p));
  const px = (v: string) => parseFloat(v);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link href="/" className={`okwe-block-link ${s.back}`}>
          ← Operating system
        </Link>
        <span className={s.eyebrow}>{GUIDELINES_INTRO.code} · Brand guidelines</span>
        <h1>{GUIDELINES_INTRO.title}</h1>
        <p className={s.lede}>{GUIDELINES_INTRO.lede}</p>
        <nav aria-label="Sections" className={s.index}>
          <ol className={s.indexList}>
            {SECTIONS.map((x) => (
              <li key={x.id}>
                <a href={`#${x.id}`} className={`okwe-block-link ${s.indexLink}`} data-guide-index>
                  <span className={s.indexNum}>{num(x.id)}</span>
                  {x.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {/* ------------------------------------------------------ 01 overview */}
      <Section
        id="overview"
        lead={BUSINESS.overview.map((p) => (
          <p key={p} className={s.prose}>
            {p}
          </p>
        ))}
      >
        <Sub title="The core idea" note={BUSINESS.core.lead}>
          <p className={s.journey} aria-label="Know, Coms, Move">
            {BUSINESS.core.journey.join(" → ")}
          </p>
          <ol className={s.steps}>
            {BUSINESS.core.steps.map((st) => (
              <li key={st.title} className={s.stepRow}>
                <span className={s.stepTitle}>{st.title}</span>
                <span className={s.stepBody}>{st.body}</span>
              </li>
            ))}
          </ol>
          <p className={s.prose}>{BUSINESS.core.close}</p>
        </Sub>

        <Sub title="Three processes, one business">
          <div className={s.processes}>
            {BUSINESS.processes.map((p) => {
              const brand = LOGO_MANIFEST.brands.find((b) => b.arm === p.id);
              return (
                <article key={p.id} className={s.process} data-process={p.id}>
                  {brand && <Logo variant="horizontal" size={20} {...markProps(brand)} />}
                  <span className={s.processRole}>{p.role}</span>
                  <p className={s.prose}>
                    {p.summary} {p.focus}
                  </p>
                  <ul className={s.activities}>
                    {p.activities.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <p className={s.purpose}>{p.purpose}</p>
                </article>
              );
            })}
          </div>
        </Sub>

        <Sub title="How the business works" note={BUSINESS.flow.lead}>
          <ol className={s.steps}>
            {BUSINESS.flow.steps.map((st, i) => (
              <li key={st.name} className={s.stepRow}>
                <span className={s.stepTitle}>
                  {String(i + 1).padStart(2, "0")} · {st.name}
                </span>
                <span className={s.stepBody}>{st.body}</span>
              </li>
            ))}
          </ol>
          <p className={s.prose}>{BUSINESS.flow.close}</p>
        </Sub>

        <Sub title="Brand architecture">
          <p className={s.umbrella}>{BUSINESS.architecture.umbrella}</p>
          <div className={s.archRow}>
            {BUSINESS.processes.map((p) => (
              <div key={p.id} className={s.archCell}>
                <span className={s.archName}>{p.name.toUpperCase()}</span>
                <span className={s.archRole}>{p.role}</span>
              </div>
            ))}
          </div>
          <p className={s.prose}>
            <b>{BUSINESS.architecture.together}</b> Or more commercially:{" "}
            <b>{BUSINESS.architecture.commercial}</b>
          </p>
          <p className={s.prose}>
            <b>Okwe Knowledge</b> is the publishing imprint of Okwe Knows. The playbook,
            okweknowledge.com, the social handles and the export file names carry it, exactly as
            the playbook documents them.
          </p>
        </Sub>

        <div className={s.grid2}>
          <Sub title="Who it serves">
            <ul className={s.list}>
              {BUSINESS.customers.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Sub>
          <Sub title="Value and promise">
            {BUSINESS.value.body.map((p) => (
              <p key={p} className={s.prose}>
                {p}
              </p>
            ))}
            <p className={s.promise}>{BUSINESS.value.promise}</p>
          </Sub>
        </div>

        <div className={s.grid2}>
          <Sub title="Positioning">
            <p className={s.prose}>{BUSINESS.positioning.statement}</p>
            <p className={s.formula}>{BUSINESS.positioning.formula}</p>
            <p className={s.note}>At the intersection of {BUSINESS.positioning.intersection.join(" · ")}.</p>
          </Sub>
          <Sub title="Long-term vision">
            {BUSINESS.vision.map((p) => (
              <p key={p} className={s.prose}>
                {p}
              </p>
            ))}
            <p className={s.promise}>{BUSINESS.philosophy}</p>
          </Sub>
        </div>
        <p className={s.source}>Source: the owner&apos;s business document, Okwe Import Export Solutions.</p>
      </Section>

      {/* ---------------------------------------------------------- 02 logo */}
      <Section
        id="logo"
        lead={<p className={s.rule}>{LOGO_MANIFEST.rule}</p>}
      >
        <Sub title="The five marks">
          <div className={s.marks}>
            {LOGO_MANIFEST.brands.map((b) => (
              <article key={b.id} className={s.mark} data-mark={b.id}>
                <div className={s.markSpecimens}>
                  <Logo variant="stacked" size={26} {...markProps(b)} />
                  <span className={s.markInk}>
                    <Logo variant="avatar" size={72} {...markProps(b)} />
                  </span>
                </div>
                <span className={s.markName}>{b.name}</span>
                <span className={s.kind}>{KIND_LABEL[b.kind]}</span>
                <p className={s.note}>{b.note}</p>
              </article>
            ))}
          </div>
        </Sub>

        <Sub title="Which lockup, where">
          <Table label="Lockups and where to use them">
            <thead>
              <tr>
                <th>Lockup</th>
                <th>Specimen</th>
                <th>Use it for</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {LOCKUP_USE.map((l) => (
                <tr key={l.variant}>
                  <td className={s.mono}>{l.label}</td>
                  <td className={l.variant === "avatar" ? s.inkCell : undefined}>
                    <Logo
                      variant={l.variant}
                      size={l.variant === "avatar" ? 56 : 18}
                      arm="knows"
                    />
                  </td>
                  <td>{l.use}</td>
                  <td className={s.source}>{l.source}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sub>

        <div className={s.grid2}>
          <Sub title="Size and space">
            <ul className={s.rules}>
              <li className={s.ruleRow}>
                <span className={s.ruleText}>
                  Avatar: 68px on screen at the least. Below that the process word falls under the
                  legibility floor the responsive audit enforces.
                </span>
                <span className={s.source}>/brand, measured</span>
              </li>
              <li className={s.ruleRow}>
                <span className={s.ruleText}>
                  Favicon: the seed row alone, shared by every mark. At 16px a qualifier word is
                  unreadable, and an unreadable word is noise.
                </span>
                <span className={s.source}>/brand</span>
              </li>
              <li className={s.ruleRow}>
                <span className={s.ruleText}>
                  Clear space: not yet specified. The system states no clear-space rule, and none is
                  invented here.
                </span>
                <span className={s.source}>Stated gap</span>
              </li>
            </ul>
          </Sub>
          <Sub title="Never">
            <Rules items={LOGO_DONTS} />
          </Sub>
        </div>
        <p className={s.note}>
          Every mark as vector, raster, app icon and watermark: <Link href="/brand">/brand</Link>.
        </p>
      </Section>

      {/* -------------------------------------------------------- 03 colour */}
      <Section id="colour" lead={<p className={s.prose}>{PRIMARY_SECONDARY}</p>}>
        <Sub title="The hierarchy">
          <div className={s.roles}>
            {COLOUR_ROLES.map((r) => {
              const ramp = ramps.find((x) => x.name === r.ramp);
              return (
                <article key={r.role} className={s.roleRow} data-colour-role={r.ramp}>
                  <div className={s.roleStrip} aria-hidden="true">
                    {ramp?.steps.map((st) => (
                      <span key={st.token} style={{ background: st.hex }} />
                    ))}
                  </div>
                  <div className={s.roleBody}>
                    <span className={s.roleName}>
                      {r.role} · <b>{r.ramp}</b>
                    </span>
                    <p className={s.quoteLine}>&ldquo;{r.quote}&rdquo;</p>
                    <p className={s.prose}>{r.use}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <p className={s.source}>Source: colors.css, the header comment.</p>
        </Sub>

        <Sub
          title="Scales"
          note="Every step of every ramp, read from colors.css. Contrast is computed per WCAG 2.1 against the page ground (chalk-100) and the ink (cyanotype-900): AA is 4.5:1 for body text, 3:1 for large text and UI marks."
        >
          {ramps.map((ramp) => (
            <div key={ramp.name} className={s.ramp} data-ramp={ramp.name}>
              <h4 className={s.h4}>{ramp.name}</h4>
              <Table label={`${ramp.name} scale`}>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Hex</th>
                    <th>On chalk-100</th>
                    <th>On cyanotype-900</th>
                    <th>Aliases</th>
                    <th>On the plate</th>
                  </tr>
                </thead>
                <tbody>
                  {ramp.steps.map((st) => {
                    const def = pointsAt(st.token, false);
                    const plate = pointsAt(st.token, true);
                    return (
                      <tr key={st.token} data-token={st.token}>
                        <td className={s.mono}>
                          <Swatch value={st.hex} /> {ramp.name}-{st.step}
                        </td>
                        <td className={s.mono}>{st.hex}</td>
                        <td>
                          <Grade r={contrast(st.hex, chalk)} />
                        </td>
                        <td>
                          <Grade r={contrast(st.hex, ink)} />
                        </td>
                        <td className={s.aliasList}>{def.join(" · ") || "—"}</td>
                        <td className={s.aliasList}>{plate.join(" · ") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ))}
        </Sub>

        <Sub
          title="Aliases"
          note={`Components never use a ramp step directly; they use these. Plate mode re-points ${plateFlips} of them — the cyanotype negative for covers, title cards and report covers: "Not 'dark mode for comfort': it is the second plate of the same document."`}
        >
          {ALIAS_GROUPS.map((g) => {
            const list = aliases.filter((a) => g.prefix.some((p) => a.name.startsWith(p)));
            return (
              <div key={g.title} className={s.ramp}>
                <h4 className={s.h4}>{g.title}</h4>
                {g.quote && <p className={s.quoteLine}>&ldquo;{g.quote}&rdquo;</p>}
                <Table label={`${g.title} aliases`}>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Default</th>
                      <th>Plate</th>
                      <th>For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a) => (
                      <tr key={a.name} data-alias={a.name}>
                        <td className={s.mono}>{a.name}</td>
                        <td className={s.mono}>
                          <Swatch value={hex(a.name)} /> {refName(a.value)}
                          {isHex(hex(a.name)) && refName(a.value) !== hex(a.name) && (
                            <span className={s.quiet}> {hex(a.name)}</span>
                          )}
                        </td>
                        <td className={s.mono}>
                          {a.plate ? (
                            <>
                              <Swatch value={hex(a.name, true)} /> {refName(a.plate)}
                            </>
                          ) : (
                            <span className={s.quiet}>same</span>
                          )}
                        </td>
                        <td>
                          {ALIAS_NOTES[a.name] ?? ""}
                          {a.note && <span className={s.quiet}> — &ldquo;{a.note}&rdquo;</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })}
        </Sub>

        <Sub
          title="States"
          note="Info, success, warning, error and highlight. Error is the system's danger token; highlight has no token — it is sulphur's marking role. Each example is a real line the app already shows."
        >
          <div className={s.states}>
            {STATES.map((st) => {
              const colour = st.token ? hex(st.token) : hex("--sulphur-400");
              const soft = st.soft ? hex(st.soft) : null;
              const onChalk = st.token ? contrast(colour, chalk) : null;
              const onSoft = st.token && soft ? contrast(colour, soft) : null;
              const used = st.token ? usage[st.token] : null;
              return (
                <article key={st.id} className={s.state} data-state={st.id}>
                  <div className={s.stateHead}>
                    <span className={s.stateLabel}>{st.label}</span>
                    {st.token ? (
                      <span className={s.mono}>
                        <Swatch value={colour} /> {st.token} → {refName(byName[st.token].value)} {colour}
                        {st.soft && (
                          <>
                            {" · "}
                            <Swatch value={soft ?? ""} /> {st.soft}
                          </>
                        )}
                      </span>
                    ) : (
                      <span className={s.mono}>
                        {st.carriers?.map((c) => (
                          <span key={c} className={s.carrier}>
                            <Swatch value={hex(c)} /> {c}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>

                  {st.token ? (
                    <p className={s.stateExample} style={{ color: `var(${st.token})` } as CSSProperties}>
                      {st.label} — {st.example}
                    </p>
                  ) : (
                    <p className={s.stateExample}>
                      <span style={{ background: "var(--selection-bg)" }}>{st.example}</span>
                      <span className={s.tabMark}>Selected</span>
                    </p>
                  )}
                  <p className={s.source}>Example: {st.exampleSource}</p>

                  <dl className={s.stateFacts}>
                    <dt>When</dt>
                    <dd>{st.when}</dd>
                    <dt>Where</dt>
                    <dd>{st.where}</dd>
                    {st.token && (
                      <>
                        <dt>Contrast</dt>
                        <dd>
                          On chalk-100 <Grade r={onChalk} />
                          {onSoft !== null && (
                            <>
                              {" "}
                              · on its soft ground <Grade r={onSoft} />
                            </>
                          )}
                          {grade(onChalk) !== "AA" && (
                            <span className={s.caution}>
                              {" "}
                              Below AA for body text: use it for large text, rules and marks, and
                              set body-size {st.label.toLowerCase()} text in ink beside a{" "}
                              {refName(byName[st.token].value)} marker.
                            </span>
                          )}
                        </dd>
                        <dt>In use</dt>
                        <dd data-usage={used}>
                          {used
                            ? `Referenced in ${used} source file${used === 1 ? "" : "s"}.`
                            : "Defined, not yet used by any component."}
                        </dd>
                      </>
                    )}
                  </dl>
                </article>
              );
            })}
          </div>
        </Sub>

        <Sub
          title="Contrast that decides the rules"
          note="Computed, not copied. These pairs are why the rules read as they do."
        >
          <Table label="Key contrast pairs">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Ratio</th>
                <th>What it means</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["--text-primary", "--surface-page", "Headlines on the page."],
                ["--text-body", "--surface-page", "Running text on the page."],
                ["--text-muted", "--surface-page", "Hints and meta."],
                ["--text-quiet", "--surface-page", "Index numbers and file meta — large or mono labels only."],
                ["--text-inverse", "--surface-ink", "Text on ink."],
                ["--sulphur-400", "--surface-page", "Why sulphur never carries text on chalk."],
                ["--sulphur-400", "--surface-ink", "Sulphur marks on ink."],
                ["--cyanotype-900", "--sulphur-400", "Ink text on the marked control."],
              ].map(([fg, bg, what]) => (
                <tr key={`${fg}${bg}`} data-pair={`${fg}|${bg}`}>
                  <td className={s.mono}>
                    <Swatch value={hex(fg)} /> {fg.slice(2)} on <Swatch value={hex(bg)} /> {bg.slice(2)}
                  </td>
                  <td>
                    <Grade r={contrast(hex(fg), hex(bg))} />
                  </td>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className={s.note} data-playbook-contrast>
            The visual thesis states &ldquo;cyanotype-800 on chalk-100 = 13.9:1&rdquo;. Computed per
            WCAG 2.1 the pair is <b>{ratioLabel(pb)}</b> — an arithmetic error in the source, which
            stays as written. Both figures clear AA comfortably; the rule it supports is unchanged.
          </p>
        </Sub>

        <div className={s.grid2}>
          <Sub title="Do">
            <Rules items={COLOUR_DOS} />
          </Sub>
          <Sub title="Don't">
            <Rules items={COLOUR_DONTS} />
          </Sub>
        </div>
        <Sub title="Exceptions" note="Where colour departs from the rules, stated rather than hidden.">
          <ul className={s.rules}>
            {COLOUR_EXCEPTIONS.map((e) => (
              <li key={e.what} className={s.ruleRow}>
                <span className={s.ruleText}>
                  <b>{e.kind}.</b> {e.what}
                </span>
                <span className={s.source}>{e.source}</span>
              </li>
            ))}
          </ul>
        </Sub>
      </Section>

      {/* ---------------------------------------------------------- 04 type */}
      <Section id="type" lead={<Rules items={TYPE_RULES} />}>
        <Sub title="Faces">
          <Table label="Type faces">
            <thead>
              <tr>
                <th>Token</th>
                <th>Specimen</th>
                <th>Job</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_FACES.map((f) => (
                <tr key={f.token}>
                  <td className={s.mono}>{f.token}</td>
                  <td style={{ fontFamily: `var(${f.token})`, fontSize: 20 }}>{f.face}</td>
                  <td>{f.job}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sub>

        <Sub title="The width axis" note="The identity lives here. The same line at every stretch the system defines.">
          <div className={s.widths}>
            {byPrefix(typeTokens, "--stretch-").map((t) => (
              <div key={t.name} className={s.widthRow} data-token={t.name}>
                <span className={s.mono}>
                  {t.name} · {t.value}
                  {t.note && <span className={s.quiet}> — {t.note}</span>}
                </span>
                <span
                  className={s.widthSample}
                  style={{
                    fontFamily: t.name === "--stretch-mono" ? "var(--font-mono)" : "var(--font-display)",
                    fontStretch: `var(${t.name})`,
                  }}
                >
                  Know the opportunity
                </span>
              </div>
            ))}
          </div>
        </Sub>

        <Sub title="Scale">
          <Table label="Type scale">
            <thead>
              <tr>
                <th>Token</th>
                <th>Size</th>
                <th>Range</th>
                <th>Sample</th>
              </tr>
            </thead>
            <tbody>
              {byPrefix(typeTokens, "--size-").map((t) => (
                <tr key={t.name} data-token={t.name}>
                  <td className={s.mono}>{t.name}</td>
                  <td className={s.mono}>{t.value}</td>
                  <td className={s.quiet}>{px(t.value) <= 25 ? "Reading" : "Register"}</td>
                  <td className={s.sampleCell}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: `var(${t.name})`, lineHeight: 1 }}>
                      Know
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sub>

        <Sub title="Composed roles" note="Each role is a token; font-stretch is applied beside it, as the file requires.">
          <Table label="Type roles">
            <thead>
              <tr>
                <th>Role</th>
                <th>Specimen</th>
                <th>Declared as</th>
                <th>For</th>
              </tr>
            </thead>
            <tbody>
              {byPrefix(typeTokens, "--type-").map((t) => {
                const role = TYPE_ROLES[t.name];
                return (
                  <tr key={t.name} data-token={t.name}>
                    <td className={s.mono}>{t.name}</td>
                    <td className={s.sampleCell}>
                      <span
                        style={{
                          font: `var(${t.name})`,
                          fontStretch: role ? `var(${role.stretch})` : undefined,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Know
                      </span>
                    </td>
                    <td className={`${s.mono} ${s.quiet}`}>
                      {t.value} · {role?.stretch.slice(2)}
                    </td>
                    <td>{role?.use}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Sub>

        <div className={s.grid2}>
          {[
            { title: "Leading", p: "--leading-" },
            { title: "Tracking and measure", p: "--tracking-|--measure-" },
          ].map((g) => (
            <Sub key={g.title} title={g.title}>
              <Table label={g.title}>
                <tbody>
                  {typeTokens
                    .filter((t) => g.p.split("|").some((p) => t.name.startsWith(p)))
                    .map((t) => (
                      <tr key={t.name} data-token={t.name}>
                        <td className={s.mono}>{t.name}</td>
                        <td className={s.mono}>{t.value}</td>
                        <td className={s.quiet}>{t.note ?? ""}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Sub>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- 05 spacing */}
      <Section id="spacing" lead={<Rules items={SPACING_RULES} />}>
        <Sub title="Space scale">
          <div className={s.spaces}>
            {byPrefix(byFile.spacing, "--space-").map((t) => (
              <div key={t.name} className={s.spaceRow} data-token={t.name}>
                <span className={s.mono}>{t.name}</span>
                <span className={s.mono}>{t.value}</span>
                <span className={s.spaceBar} style={{ width: t.value }} aria-hidden="true" />
              </div>
            ))}
          </div>
        </Sub>
        <div className={s.grid2}>
          <Sub title="The ledger frame">
            <Table label="Ledger frame">
              <tbody>
                {[...byFile.spacing, ...byFile.breakpoints]
                  .filter((t) => FRAME_NOTES[t.name])
                  .map((t) => (
                    <tr key={t.name} data-token={t.name}>
                      <td className={s.mono}>{t.name}</td>
                      <td className={s.mono}>{t.value}</td>
                      <td>{FRAME_NOTES[t.name]}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Sub>
          <Sub title="Breakpoints and controls">
            <Table label="Breakpoints and controls">
              <tbody>
                {[
                  ...byPrefix(byFile.breakpoints, "--bp-"),
                  ...byFile.spacing.filter((t) => /^--(control|tap|tally|stamp)-/.test(t.name)),
                ].map((t) => (
                  <tr key={t.name} data-token={t.name}>
                    <td className={s.mono}>{t.name}</td>
                    <td className={s.mono}>{t.value}</td>
                    <td className={s.quiet}>{t.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sub>
        </div>
      </Section>

      {/* ------------------------------------------------ 06 radius & shadow */}
      <Section id="radius-shadow">
        <div className={s.grid2}>
          <Sub title="Radius">
            <Rules items={RADIUS_RULES} />
            <Table label="Radius tokens">
              <tbody>
                {byPrefix(byFile.spacing, "--radius-").map((t) => (
                  <tr key={t.name} data-token={t.name}>
                    <td className={s.mono}>{t.name}</td>
                    <td className={s.mono}>{t.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sub>
          <Sub title="Shadow and elevation">
            <Rules items={SHADOW_RULES} />
            <Table label="Elevation tokens">
              <tbody>
                {byFile.elevation.map((t) => (
                  <tr key={t.name} data-token={t.name}>
                    <td className={s.mono}>{t.name}</td>
                    <td className={`${s.mono} ${s.quiet}`}>{t.value}</td>
                    <td className={s.quiet}>{t.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sub>
        </div>
      </Section>

      {/* --------------------------------------------------------- 07 motif */}
      <Section id="motif" lead={<Rules items={MOTIF_RULES} />}>
        <Sub title="The recurring devices">
          <div className={s.devices}>
            <div className={s.device}>
              <Seeds size={14} />
              <span className={s.deviceName}>{MOTIF_DEVICES[0].name}</span>
              <p className={s.note}>{MOTIF_DEVICES[0].what}</p>
            </div>
            <div className={s.device}>
              <Tally filled={13} total={20} rows={2} />
              <span className={s.deviceName}>{MOTIF_DEVICES[1].name}</span>
              <p className={s.note}>{MOTIF_DEVICES[1].what}</p>
            </div>
            <div className={s.device}>
              <CallNumber series="The Trade Desk" issue={14} part={2} />
              <span className={s.deviceName}>{MOTIF_DEVICES[2].name}</span>
              <p className={s.note}>{MOTIF_DEVICES[2].what}</p>
            </div>
            <div className={`${s.device} ${s.deviceWide}`}>
              <ManifestDiagram
                stages={[
                  { label: "Know", state: "Okwe Knows" },
                  { label: "Coms", state: "Okwe Coms" },
                  { label: "Move", state: "Okwe Move", mark: true },
                ]}
              />
              <span className={s.deviceName}>{MOTIF_DEVICES[3].name}</span>
              <p className={s.note}>{MOTIF_DEVICES[3].what}</p>
            </div>
            <div className={s.device}>
              <MarginNote role="source" items={["The owner's business document"]} />
              <span className={s.deviceName}>{MOTIF_DEVICES[4].name}</span>
              <p className={s.note}>{MOTIF_DEVICES[4].what}</p>
            </div>
            <div className={s.device}>
              <span className={s.badges}>
                <Badge tone="fact">Fact</Badge>
                <Badge tone="interpretation">Our reading</Badge>
                <Badge tone="opinion">Our view</Badge>
                <Badge tone="unknown">Unresolved</Badge>
              </span>
              <span className={s.deviceName}>{MOTIF_DEVICES[5].name}</span>
              <p className={s.note}>{MOTIF_DEVICES[5].what}</p>
            </div>
          </div>
        </Sub>
        <Sub title="Motion">
          <Table label="Motion tokens">
            <tbody>
              {byFile.motion
                .filter((t) => /^--(duration|ease)-/.test(t.name))
                .map((t) => (
                  <tr key={t.name} data-token={t.name}>
                    <td className={s.mono}>{t.name}</td>
                    <td className={s.mono}>{t.value}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <p className={s.note}>
            Every duration drops to zero when the reader asks for reduced motion.
          </p>
        </Sub>
      </Section>

      {/* --------------------------------------------------------- 08 voice */}
      <Section
        id="voice"
        lead={
          <p className={s.prose}>
            The business line: <b>{BUSINESS.philosophy}</b> The commercial line:{" "}
            <b>{BUSINESS.architecture.commercial}</b>
          </p>
        }
      >
        {VOICE_SECTIONS.map((id) => (
          <Quote key={id} html={playbookSection("voice-and-writing", id)} />
        ))}
        <p className={s.source}>
          Quoted from the playbook, Voice &amp; writing. The whole document:{" "}
          <Link href="/playbook">/playbook</Link>.
        </p>
      </Section>

      {/* ---------------------------------------------------- 09 components */}
      <Section
        id="components"
        lead={
          <p className={s.prose}>
            Every component the design system exports, what it is for, and where to see it
            specimened. Build from these; a surface that needs something new is a proposal, not a
            one-off.
          </p>
        }
      >
        <Table label="Components">
          <thead>
            <tr>
              <th>Group</th>
              <th>Component</th>
              <th>For</th>
              <th>Specimen</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.map((c) => (
              <tr key={c.name} data-component={c.name}>
                <td className={s.quiet}>{c.group}</td>
                <td className={s.mono}>{c.name}</td>
                <td>{c.purpose}</td>
                <td className={s.mono}>
                  {c.specimen ? (
                    <Link href="/design-system">/design-system · {c.specimen}</Link>
                  ) : (
                    <Link href="/post-editor">/post-editor</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* -------------------------------------------------------- 10 slides */}
      <Section id="slides" lead={<Rules items={SLIDE_RULES} />}>
        <Sub title="A set, part by part" note="The slide canvas, 1920×1080: the cover on the plate, the body on chalk, the close in sulphur.">
          <div className={s.slides}>
            <CarouselSlide
              kind="cover"
              canvas="slide"
              index={1}
              total={3}
              series="The Trade Desk"
              issue={14}
              title="Know the opportunity."
              renderWidth={300}
            />
            <CarouselSlide
              kind="content"
              canvas="slide"
              index={2}
              total={3}
              series="The Trade Desk"
              issue={14}
              title="Connect the trade."
              body="Communicate with the relevant parties, establish relationships, negotiate and facilitate the transaction."
              renderWidth={300}
            />
            <CarouselSlide
              kind="cta"
              canvas="slide"
              index={3}
              total={3}
              series="The Trade Desk"
              issue={14}
              title="Move the goods."
              cta="okweknowledge.com"
              renderWidth={300}
            />
          </div>
        </Sub>
        <Sub title="Slide templates">
          <Table label="Slide templates">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>For</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATES.filter((t) => t.canvas === "slide").map((t) => (
                <tr key={t.code}>
                  <td className={s.mono}>{t.code}</td>
                  <td>{t.name}</td>
                  <td className={s.quiet}>{t.platform}</td>
                  <td className={s.mono}>{t.status ?? "rendered"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className={s.note}>
            Build them in the <Link href="/post-editor">post editor</Link>.
          </p>
        </Sub>
      </Section>

      {/* ------------------------------------------------------- 11 ui kits */}
      <Section
        id="ui-kits"
        lead={
          <p className={s.prose}>
            The same tokens and components, arranged per surface. Every kit is the ledger — a rail,
            a field and a margin — at a different size.
          </p>
        }
      >
        <div className={s.kits}>
          {UI_KITS.map((k) => (
            <article key={k.name} className={s.kit}>
              <span className={s.kitName}>{k.name}</span>
              <p className={s.prose}>{k.what}</p>
              <p className={s.mono}>
                {k.routes.map((r, i) => (
                  <span key={r}>
                    {i > 0 && " · "}
                    <Link href={r}>{r}</Link>
                  </span>
                ))}
              </p>
              <p className={s.quiet}>Built from {k.built.join(", ")}.</p>
            </article>
          ))}
        </div>
        <Sub title="Canvases" note="Every social and print surface is PostCanvas at one of these sizes.">
          <Table label="Canvases">
            <thead>
              <tr>
                <th>Canvas</th>
                <th>Size</th>
                <th>For</th>
                <th>Templates</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(CANVASES) as CanvasName[]).map((c) => (
                <tr key={c} data-canvas={c}>
                  <td className={s.mono}>{c}</td>
                  <td className={s.mono}>
                    {CANVASES[c].w}×{CANVASES[c].h}
                  </td>
                  <td>{CANVASES[c].label}</td>
                  <td className={s.mono}>
                    {
                      TEMPLATES.filter(
                        (t) => t.canvas === c || t.sizes?.some((z) => z.canvas === c),
                      ).length
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sub>
      </Section>

      {/* ---------------------------------------------------- 12 governance */}
      <Section id="governance">
        <Quote html={playbookSection("content-playbook", "content-playbook--governance")} />
        <p className={s.source}>Quoted from the playbook, Content playbook.</p>

        <div className={s.grid2}>
          <Sub title="The publishing gate">
            <p className={s.prose}>
              Every piece is scored 0–5 on {CRITERIA.length} criteria. Threshold {THRESHOLD}/
              {MAX_TOTAL}, nothing below {FLOOR}; {HARD_STOP.map((h) => CRITERIA.find((c) => c.id === h)?.label).join(" or ")}{" "}
              below {FLOOR} is a hard stop. No data template renders without a source line.
            </p>
            <p className={s.source}>src/lib/quality.ts</p>
          </Sub>
          <Sub title="Sources of truth">
            <Table label="Sources of truth">
              <tbody>
                {SOURCES_OF_TRUTH.map((x) => (
                  <tr key={x.where}>
                    <td>{x.what}</td>
                    <td className={s.mono}>{x.where}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sub>
        </div>

        <Sub title="What keeps them in step" note="Checks that fail loudly when a copy drifts from its source. Run them with npm run verify.">
          <ul className={s.rules}>
            {GUARDS.map((g) => (
              <li key={g.name} className={s.ruleRow}>
                <span className={s.ruleText}>
                  <b>{g.name}.</b> {g.what}
                </span>
              </li>
            ))}
          </ul>
        </Sub>
      </Section>

      <p className={s.foot}>{GUIDELINES_INTRO.foot}</p>
    </main>
  );
}
