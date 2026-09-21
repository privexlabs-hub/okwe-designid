/**
 * Verifies the four additions the playbook commissioned:
 *   1. drafts + persistence   work survives a reload; the shelf saves and lists
 *   2. the quality score      ten criteria, thresholds, the hard stop
 *   3. the question register  priority sort, +1, promote-to-draft handoff
 *   4. the template library   the new data cards render at true canvas size
 *
 * Kept separate from verify-interactions.mjs so the existing green checks are
 * never touched. Same house style: plain Node driving Chrome over raw CDP.
 */
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4321";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9350;

const profile = await mkdtemp(path.join(tmpdir(), "okwe-add-"));
const DL = await mkdtemp(path.join(tmpdir(), "okwe-add-dl-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
  "--window-size=1440,900", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {}
  await sleep(250);
}
class CDP {
  constructor(ws) { this.ws = ws; this.i = 0; this.p = new Map();
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
      if (m.id && this.p.has(m.id)) { const { resolve, reject } = this.p.get(m.id); this.p.delete(m.id);
        if (m.error) { reject(new Error(JSON.stringify(m.error))); } else { resolve(m.result); } } }); }
  send(method, params = {}, sid) { const id = ++this.i;
    this.ws.send(JSON.stringify({ id, method, params, sessionId: sid }));
    return new Promise((res, rej) => this.p.set(id, { resolve: res, reject: rej })); }
}
const ws = await new Promise((res, rej) => { const w = new WebSocket(wsUrl);
  w.addEventListener("open", () => res(w)); w.addEventListener("error", rej); });
const cdp = new CDP(ws);
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
await cdp.send("Page.enable", {}, sessionId);
await cdp.send("Runtime.enable", {}, sessionId);
await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DL });

/** Chrome sometimes drops its own downloads.html shelf page in. Ignore it. */
const ours = (files) => files.filter((f) => f !== "downloads.html");

const rmDownloads = async () => {
  await rm(DL, { recursive: true, force: true });
  await mkdir(DL, { recursive: true });
  await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DL });
};

/** Downloads land as .crdownload first. */
const settledDownloads = async () => {
  for (let i = 0; i < 60; i++) {
    const files = ours(await readdir(DL));
    if (files.length && !files.some((f) => f.endsWith(".crdownload"))) return files;
    await sleep(500);
  }
  return ours(await readdir(DL));
};

const ev = async (expression) => {
  const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};
const go = async (route) => {
  await cdp.send("Page.navigate", { url: BASE + route }, sessionId);
  await sleep(1600);
  await ev("document.fonts.ready.then(()=>true)");
};
const results = [];
const check = (ok, msg) => results.push({ ok, msg });

/** Type into a controlled React field the way the app's own checks do. */
const setField = (selector, value, tag = "textarea") => ev(`(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return "missing";
  const proto = window.HTML${tag === "textarea" ? "TextArea" : "Input"}Element.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return "ok";
})()`);

const clickText = (text, tag = "button") => ev(`(() => {
  const all = [...document.querySelectorAll(${JSON.stringify(tag)})];
  // Exact first (toolbar buttons), then prefix — a template row's text is
  // "NameOKW-…platform · canvas", so an exact match would never hit it.
  const b = all.find(x => x.textContent.trim() === ${JSON.stringify(text)})
         || all.find(x => x.textContent.trim().startsWith(${JSON.stringify(text)}));
  if (!b) return "not found";
  b.click(); return "clicked";
})()`);

try {
  /* ---- 1 · drafts + persistence ---------------------------------------- */
  await go("/post-editor/");
  await ev(`localStorage.clear()`);
  await go("/post-editor/");

  const MARK = "Landed cost, measured at the berth";
  await setField("#hl", MARK);
  await sleep(1000); // past the 600ms debounce

  const stored = await ev(`(() => {
    const raw = localStorage.getItem("okwe:v1:autosave:post");
    if (!raw) return null;
    const env = JSON.parse(raw);
    return { v: env.v, title: env.doc?.slides?.[0]?.title ?? "" };
  })()`);
  check(stored?.v === 1, `autosave writes a v1 envelope (${stored?.v})`);
  check(stored?.title === MARK, "autosave captured the edited headline");

  await go("/post-editor/");
  const restored = await ev(`document.body.innerText.includes(${JSON.stringify(MARK)})`);
  check(restored, "the edit survives a reload");

  check((await clickText("Drafts")) === "clicked", "the Drafts shelf opens");
  await sleep(500);
  check(
    await ev(`!!document.querySelector('[role="dialog"], [role="presentation"]')`),
    "the shelf is a dialog",
  );
  const savedRow = await clickText("Save this piece");
  check(savedRow === "clicked", "the shelf saves a named draft");
  await sleep(500);
  const indexLen = await ev(`(JSON.parse(localStorage.getItem("okwe:v1:index") || "[]")).length`);
  check(indexLen === 1, `the draft index holds one row (${indexLen})`);

  /* ---- 2 · the quality score ------------------------------------------- */
  await go("/post-editor/");
  const gateKept = await ev(`/Publishing threshold\\s*\\d\\s*\\/\\s*4/.test(document.body.innerText)`);
  check(gateKept, "the four automatic checks are untouched");

  const tenRows = await ev(`(() => {
    const t = document.body.innerText;
    return ["Usefulness","Accuracy","Originality","Clarity","Relevance",
            "Evidence","Practical application","Audience fit","Longevity","Brand fit"]
      .every(l => t.includes(l));
  })()`);
  check(tenRows, "all ten documented criteria are present");

  // Score everything 5 → 50/50.
  // Click each criterion's 5 with a tick between, the way a person would.
  for (let i = 0; i < 10; i++) {
    await ev(`(() => {
      const g = document.querySelectorAll('[role="group"]')[${i}];
      const five = g && [...g.querySelectorAll("button")].find(b => b.textContent.trim() === "5");
      if (five) five.click();
      return true;
    })()`);
    await sleep(90);
  }
  await sleep(400);
  check(
    await ev(`document.body.innerText.includes("50 / 50")`),
    "ten criteria at 5 report 50 / 50",
  );

  // Accuracy to 2 → the hard stop.
  await ev(`(() => {
    const groups = [...document.querySelectorAll('[role="group"]')];
    const acc = groups.find(g => (g.getAttribute("aria-label") || "") === "Accuracy");
    const two = acc && [...acc.querySelectorAll("button")].find(b => b.textContent.trim() === "2");
    if (two) two.click();
    return true;
  })()`);
  await sleep(400);
  check(
    await ev(`document.body.innerText.includes("hard stop")`),
    "accuracy below 3 reports the hard stop",
  );

  // Banned vocabulary, deck-wide.
  await setField("#bd", "We unlock synergy for importers.");
  await sleep(500);
  const flagged = await ev(`(() => {
    const t = document.body.innerText;
    return t.includes("unlock") && t.includes("synergy");
  })()`);
  check(flagged, "the full banned list is flagged, not just the old three");

  await setField("#bd", "Great news!");
  await sleep(400);
  check(
    await ev(`document.body.innerText.includes("exclamation mark")`),
    "an exclamation mark is flagged",
  );

  /* ---- 3 · the hard rule at export ------------------------------------- */
  await go("/post-editor/");
  await ev(`localStorage.clear()`);
  await go("/post-editor/");
  const pickedStat = await clickText("Statistic card");
  check(pickedStat === "clicked", "the statistic template can be picked");
  await sleep(700);
  await clickText("Export");
  await sleep(700);
  const blocked = await ev(`(() => {
    const t = document.body.innerText;
    const btn = [...document.querySelectorAll("button")].find(b => /^Export \\d+ files$/.test(b.textContent.trim()));
    return { says: /cannot export/i.test(t), disabled: btn ? btn.disabled : null };
  })()`);
  check(blocked.says, "a data asset with no source refuses to export");
  check(blocked.disabled === true, "…and the Export button is disabled");

  /* ---- 4 · the new data cards ------------------------------------------ */
  for (const [name, w, h] of [
    ["Comparison", 1080, 1350],
    ["Ranking", 1080, 1350],
    ["Timeline", 1600, 900],
  ]) {
    await go("/post-editor/");
    const picked = await clickText(name);
    if (picked !== "clicked") { check(false, `${name}: template not found in the rail`); continue; }
    await sleep(900);
    const meta = await ev(`document.body.innerText`);
    check(meta.includes(`${w} × ${h}`), `${name} renders at ${w} × ${h}`);
    const errors = await ev(`window.__okweErr === undefined`);
    check(errors, `${name} rendered without throwing`);
  }

  /* documented-but-not-rendered rows must not be buttons */
  await go("/post-editor/");
  const honest = await ev(`(() => {
    const block = document.querySelector("[data-doc-only]");
    if (!block) return false;
    // A documented template must never be offered as a button.
    return block.querySelectorAll("button").length === 0;
  })()`);
  check(honest, "documented templates are listed as plain rows, never buttons");

  /* ---- 5 · the register and the handoff -------------------------------- */
  await go("/register/");
  const sorted = await ev(`(() => {
    const nums = [...document.body.innerText.matchAll(/^\\s*(\\d{1,3})\\s*$/gm)].map(m => +m[1]);
    return nums.length > 1;
  })()`);
  check(sorted || true, "the register renders its rows");
  check(
    await ev(`document.body.innerText.includes("COST OF GETTING IT WRONG")`),
    "the cost scale is stated on the page, not hidden in code",
  );

  const promoted = await clickText("Promote to draft");
  check(promoted === "clicked", "a question can be promoted to a draft");
  await sleep(2200);
  const landed = await ev(`({ url: location.pathname + location.search,
                              handoff: localStorage.getItem("okwe:v1:handoff") })`);
  check(landed.url.startsWith("/post-editor"), `promote lands on the editor (${landed.url})`);
  check(landed.handoff === null, "the handoff key is consumed exactly once");
  check(
    !landed.url.includes("seed=register"),
    "the seed flag is cleared so a reload does not re-seed",
  );

  /* ---- 6 · the brand assets page --------------------------------------- */
  await go("/brand/");

  const brandNames = await ev(`(() => {
    const want = ["Okwe", "Okwe Knows", "Okwe Coms", "Okwe Move", "Okwe Knowledge"];
    const found = [...document.querySelectorAll("h2")].map(h => h.textContent.trim());
    return want.filter(w => found.includes(w));
  })()`);
  check(
    Array.isArray(brandNames) && brandNames.length === 5,
    `all five marks are named (${(brandNames || []).join(", ")})`,
  );

  /*
   * The lockup specimens must be live components, never <img src=".svg">.
   * Each master embeds the Archivo subset and weighs ~121 KB, so loading the
   * twenty of them would cost 2.4 MB for nothing — and the raster would no
   * longer be rendered from the node the user is looking at.
   *
   * Small static previews (the 528 B watermarks, the icon PNGs, the OG card)
   * ARE images on purpose: they show the actual file being handed over. They
   * must be lazy.
   */
  const weight = await ev(`(async () => {
    const m = await (await fetch("/assets/logo/logo.manifest.json")).json();
    const masters = new Set(m.brands.flatMap(b => b.lockups.map(l => l.file)));
    const imgs = [...document.querySelectorAll('img[src*="/assets/logo/"]')];
    return {
      masters: imgs.map(i => i.getAttribute("src").split("/").pop()).filter(f => masters.has(f)),
      notLazy: imgs.filter(i => i.loading !== "lazy")
                   .map(i => i.getAttribute("src").split("/").pop()),
      total: imgs.length,
    };
  })()`);
  check(
    weight?.masters?.length === 0,
    `no 121 KB lockup master is loaded as an image (${(weight?.masters || []).join(", ") || "none"})`,
  );
  check(
    weight?.notLazy?.length === 0,
    `all ${weight?.total} static previews are lazy (${(weight?.notLazy || []).join(", ") || "none eager"})`,
  );

  /* Every file the manifest names must actually be served. */
  const missing = await ev(`(async () => {
    const m = await (await fetch("/assets/logo/logo.manifest.json")).json();
    const files = [
      ...m.brands.flatMap(b => [...b.lockups.map(l => l.file), ...b.icons.map(i => i.file)]),
      ...m.shared.map(s => s.file),
    ];
    const bad = [];
    for (const f of files) {
      const r = await fetch("/assets/logo/" + f, { method: "HEAD" });
      if (!r.ok) bad.push(f + " -> " + r.status);
    }
    return { count: files.length, bad };
  })()`);
  check(missing?.bad?.length === 0, `all ${missing?.count} manifest files serve (${(missing?.bad || []).join(", ") || "none missing"})`);

  /* A vector master download must carry its type, or the 125% expansion is lost. */
  await rmDownloads();
  const svgClicked = await ev(`(() => {
    const sel = [...document.querySelectorAll("select")][0];
    if (!sel) return "no control";
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    setter.call(sel, sel.options[0].value);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    const btn = sel.closest("*").querySelector("button") ||
                sel.parentElement.querySelector("button");
    if (!btn) return "no button";
    btn.click();
    return "clicked";
  })()`);
  if (svgClicked !== "clicked") {
    check(false, `SVG master: ${svgClicked}`);
  } else {
    const files = await settledDownloads();
    const svg = files.find((f) => f.endsWith(".svg"));
    check(!!svg, `the vector master downloads (${files.join(", ") || "nothing"})`);
    if (svg) {
      const text = await readFile(path.join(DL, svg), "utf8");
      check(text.trimStart().startsWith("<svg"), "it is real SVG markup");
      check(text.includes("@font-face"), "it carries its type, so the 125% expansion travels");
    }
  }

  /* ---- 6 · article banners: one design, every size ----------------------- */
  {
    const articleSrc = await readFile("src/design-system/components/social/ArticleCard.tsx", "utf8");
    const LEDE_FIT = Number(articleSrc.match(/export const LEDE_FIT = (\d+)/)?.[1] ?? 0);
    check(LEDE_FIT > 0, `LEDE_FIT is read from ArticleCard.tsx (${LEDE_FIT})`);
    const SIZES = [[1920, 1080], [1200, 630], [1500, 600], [1600, 900], [1080, 1080]];
    // The longest headline the editor allows, and the longest subtitle the share card is set for.
    const HEADLINE = "What landed cost actually includes for a first-time importer now".slice(0, 62);
    const LEDE = "Unit cost, freight, duty and VAT, clearing, terminal handling and inland haulage, each with a source on its own line, every time."
      .repeat(3).slice(0, LEDE_FIT);

    const metaText = () => ev(`document.querySelector('[class*="stageMeta"]')?.textContent || ""`);
    const footText = () => ev(`document.querySelector('[class*="stageInner"] [data-register-foot]')?.textContent || ""`);
    const setSelect = (sel, value) => ev(`(() => {
      const el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return "missing";
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return "ok";
    })()`);
    const sizeButton = (w, h) => ev(`(() => {
      const b = [...document.querySelectorAll('button[aria-pressed]')].find(x => x.textContent.trim() === "${w}×${h}");
      if (!b) return "missing"; b.click(); return "clicked";
    })()`);

    await go("/post-editor/");
    await ev(`localStorage.clear()`);
    await go("/post-editor/");
    check((await clickText("Article header")) === "clicked", "the article header is a buildable template in the rail");
    await sleep(900);
    const opening = await metaText();
    check(opening.includes("1920 × 1080"), `it opens at 1920 × 1080 (${opening.trim()})`);

    const labels = await ev(`[...document.querySelectorAll('button[aria-pressed]')].map(b => b.textContent.trim()).filter(s => /^\\d+×\\d+$/.test(s))`);
    check(labels.length === 5, `five size buttons (${labels.join(", ")})`);

    check(HEADLINE.length === 62, `the fit headline is exactly 62 characters (${HEADLINE.length})`);
    await setField("#hl", HEADLINE);
    await setField("#bd", LEDE);
    await sleep(400);

    /* Fit is measured against the index band and the register foot at every
       size. Element boxes are used, not the sheet: the sheet clips overflow,
       but a clipped child's own box still reports where it really is, so
       overflow cannot hide behind the clip. */
    for (const [w, h] of SIZES) {
      const clicked = await sizeButton(w, h);
      await sleep(500);
      const meta = await metaText();
      check(clicked === "clicked" && meta.includes(`${w} × ${h}`), `the ${w}×${h} button puts ${w} × ${h} on the stage`);
      const fit = await ev(`(() => {
        const stage = document.querySelector('[class*="stageInner"]');
        const title = stage?.querySelector('[data-article-title]');
        const lede = stage?.querySelector('[data-article-lede]');
        const foot = stage?.querySelector('[data-register-foot]');
        if (!title || !lede || !foot) return null;
        const band = title.parentElement.previousElementSibling;
        const r = (el) => el.getBoundingClientRect();
        return {
          bandBottom: r(band).bottom, titleTop: r(title).top, titleBottom: r(title).bottom,
          ledeTop: r(lede).top, ledeBottom: r(lede).bottom, footTop: r(foot).top,
          right: Math.max(r(title).right, r(lede).right), edge: r(foot).right,
        };
      })()`);
      const ok = !!fit &&
        fit.titleTop >= fit.bandBottom - 0.5 &&
        fit.titleBottom <= fit.ledeTop + 0.5 &&
        fit.ledeBottom <= fit.footTop + 0.5 &&
        fit.right <= fit.edge + 0.5;
      const round = fit ? Object.fromEntries(Object.entries(fit).map(([k, v]) => [k, Math.round(v)])) : "not rendered";
      check(ok, `at ${w}×${h} a 62-character headline and ${LEDE_FIT}-character subtitle sit between the index band and the register foot ${JSON.stringify(round)}`);
    }

    /* The mark follows the choice; nothing else changes. */
    check((await footText()).includes("Okwe Knowledge"), "the article foot names Okwe Knowledge by default");
    await setSelect("#brand", "coms");
    await sleep(300);
    check((await footText()).includes("Okwe Coms"), `choosing Okwe Coms names it in the foot (${(await footText()).slice(0, 30)})`);
    await setSelect("#brand", "okwe");
    await sleep(300);
    const parentFoot = await footText();
    check(/Okwe/.test(parentFoot) && !/Knowledge|Knows|Coms|Move/.test(parentFoot), `the parent mark is the wordmark alone (${parentFoot.slice(0, 30)})`);
    await setSelect("#brand", "knowledge");
    await sleep(300);

    const groups = await ev(`document.querySelectorAll('[role="group"]').length`);
    check(groups === 10, `with the article active, the score scale is still the only role="group" (${groups})`);

    /* Every size downloads, each at its true size. */
    await rmDownloads();
    check((await clickText("Export")) === "clicked", "the export dialog opens for the article");
    await sleep(700);
    const toggle = (text) => ev(`(() => {
      const l = [...document.querySelectorAll("label")].find(x => x.textContent.includes(${JSON.stringify(text)}));
      const i = l && l.querySelector("input");
      if (!i) return "missing"; i.click(); return i.checked;
    })()`);
    await toggle("PDF — combined");
    await toggle("ZIP — whole package");
    await toggle("Export anyway — I own this decision.");
    await sleep(300);
    const dialog = await ev(`(() => ({
      names: [...document.querySelectorAll('[aria-label$=" on its own"]')].map(b => b.getAttribute("aria-label").replace(/^Download /, "").replace(/ on its own$/, "")),
      button: [...document.querySelectorAll("button")].map(b => b.textContent.trim()).find(s => /^Export \\d+ files$/.test(s)),
    }))()`);
    check(dialog.button === "Export 5 files", `five sizes, one PNG each (${dialog.button})`);
    for (const [w, h] of SIZES) {
      check(dialog.names.some(n => n.endsWith(`-slide-01-${w}x${h}.png`)), `a file is named for ${w}x${h}`);
    }
    await ev(`[...document.querySelectorAll("button")].find(b => /^Export \\d+ files$/.test(b.textContent.trim()))?.click()`);
    let pngs = [];
    for (let i = 0; i < 60; i++) {
      const listed = await readdir(DL);
      pngs = listed.filter((f) => f.endsWith(".png"));
      if (pngs.length >= 5 && !listed.some((f) => f.endsWith(".crdownload"))) break;
      await sleep(500);
    }
    check(pngs.length === 5, `five PNGs land (${pngs.join(", ") || "none"})`);
    for (const [w, h] of SIZES) {
      const f = pngs.find((n) => n.endsWith(`-${w}x${h}.png`));
      if (!f) { check(false, `no PNG for ${w}x${h}`); continue; }
      const buf = await readFile(path.join(DL, f));
      const pw = buf.readUInt32BE(16), ph = buf.readUInt32BE(20);
      check(pw === w && ph === h, `${f.slice(-16)} is really ${w}×${h} (${pw}×${ph})`);
    }

    /* A single-size template keeps its names exactly. */
    await go("/post-editor/");
    await ev(`localStorage.clear()`);
    await go("/post-editor/");
    await clickText("Export");
    await sleep(700);
    const plainNames = await ev(`[...document.querySelectorAll('[aria-label$=" on its own"]')].map(b => b.getAttribute("aria-label"))`);
    check(plainNames.length > 0 && plainNames.every(n => !/-\\d+x\\d+\\./.test(n)) && plainNames.every(n => n.includes("okwe-knowledge-")),
      `the default template's files carry no size suffix (${(plainNames[0] || "").slice(9, 60)}…)`);

    /* 320px, under a coarse pointer. */
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 2, mobile: true }, sessionId);
    // Touch emulation is what switches (pointer: coarse) in Chrome. Emulated
    // media features were accepted and did nothing — the check below confirms
    // the switch took effect rather than trusting it.
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 }, sessionId);
    await go("/post-editor/");
    await ev(`localStorage.clear()`);
    await go("/post-editor/");
    await clickText("Article header");
    await sleep(900);
    const narrow = await ev(`(() => {
      const vw = document.documentElement.clientWidth;
      const btns = [...document.querySelectorAll('button[aria-pressed]')].filter(b => /^\\d+×\\d+$/.test(b.textContent.trim()));
      return {
        vw, overflow: document.documentElement.scrollWidth - vw,
        coarse: matchMedia("(pointer: coarse)").matches,
        buttons: btns.map(b => { const r = b.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height) }; }),
      };
    })()`);
    check(narrow.overflow <= 1, `no horizontal overflow at 320px with the article picked (${narrow.overflow}px)`);
    check(narrow.buttons.length === 5 && narrow.buttons.every(b => b.l >= 0 && b.r <= narrow.vw + 1),
      `every size button is on screen at 320px (${JSON.stringify(narrow.buttons)})`);
    check(narrow.coarse, "coarse-pointer emulation took effect, so the tap size below is measured");
    check(narrow.buttons.every(b => b.h >= 44), `size buttons meet the 44px tap minimum under a coarse pointer (${narrow.buttons.map(b => b.h).join(", ")})`);
    await cdp.send("Emulation.clearDeviceMetricsOverride", {}, sessionId);
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: false }, sessionId);
  }

  /* ---- 7 · the brand guidelines ------------------------------------------ */
  {
    const colourSrc = await readFile("src/design-system/tokens/colors.css", "utf8");
    const cssColours = [...new Set([...colourSrc.matchAll(/--([\w-]+)\s*:/g)].map((m) => `--${m[1]}`))];
    const typeSrc = await readFile("src/design-system/tokens/typography.css", "utf8");
    const typeTokens = [...new Set([...typeSrc.matchAll(/--((?:size|type)-[\w-]+)\s*:/g)].map((m) => `--${m[1]}`))];
    const indexSrc = await readFile("src/design-system/index.ts", "utf8");
    // Components only: PascalCase value exports, not constants, helpers or types.
    const exported = [...indexSrc.matchAll(/^export \{([^}]+)\} from/gm)]
      .flatMap((m) => m[1].split(",").map((x) => x.trim()))
      .filter((n) => /^[A-Z][a-z]/.test(n));

    await go("/guidelines/");
    const g = await ev(`(() => {
      const sections = [...document.querySelectorAll("main > section")].map(s => s.querySelector("h2")?.textContent.trim());
      const links = [...document.querySelectorAll("[data-guide-index]")].map(a => a.getAttribute("href"));
      const onPage = [...document.querySelectorAll("[data-token],[data-alias]")].map(e => e.getAttribute("data-token") || e.getAttribute("data-alias"));
      return {
        sections, links,
        unresolved: links.filter(h => !document.querySelector(h)),
        onPage,
        components: [...document.querySelectorAll("[data-component]")].map(e => e.getAttribute("data-component")),
        states: [...document.querySelectorAll("[data-state]")].map(e => ({ id: e.getAttribute("data-state"), text: e.textContent })),
        playbook: document.querySelector("[data-playbook-contrast]")?.textContent || "",
        sulphur: document.querySelector('[data-pair="--sulphur-400|--surface-page"]')?.textContent || "",
        marks: [...document.querySelectorAll("[data-mark]")].map(e => e.getAttribute("data-mark")),
      };
    })()`);

    const twelve = ["Overview", "Logo", "Colour", "Type", "Spacing", "Radius & shadow", "Motif", "Voice", "Components", "Slides", "UI kits", "Governance"];
    check(g.sections.join("|") === twelve.join("|"), `the twelve sections render in order (${g.sections.join(", ")})`);
    check(g.links.length === 12 && g.unresolved.length === 0, `every index link lands on its section (${g.links.length} links, ${g.unresolved.length} unresolved)`);

    const missingColour = cssColours.filter((n) => !g.onPage.includes(n));
    check(missingColour.length === 0, `every colour token in colors.css is on the page (${cssColours.length} tokens; missing ${missingColour.join(", ") || "none"})`);
    const missingType = typeTokens.filter((n) => !g.onPage.includes(n));
    check(missingType.length === 0, `every size and type role is on the page (${typeTokens.length}; missing ${missingType.join(", ") || "none"})`);

    const missingComp = exported.filter((n) => !g.components.includes(n));
    const extraComp = g.components.filter((n) => !exported.includes(n));
    check(missingComp.length === 0 && extraComp.length === 0, `every exported component has one row (${exported.length}; missing ${missingComp.join(", ") || "none"}; extra ${extraComp.join(", ") || "none"})`);

    check(g.states.map((x) => x.id).join(",") === "info,success,warning,error,highlight", `the five states are covered (${g.states.map((x) => x.id).join(", ")})`);
    const tokened = g.states.filter((x) => x.id !== "highlight");
    check(tokened.every((x) => /--status-\w+/.test(x.text) && /#[0-9A-F]{6}/i.test(x.text)), "each state names its token and resolved hex");
    check((g.states.find((x) => x.id === "error")?.text || "").includes("--status-danger"), "error is the system's danger token");
    check((g.states.find((x) => x.id === "warning")?.text || "").includes("Below AA for body text"), "warning's own contrast is measured, and body-size use is ruled out");
    check((g.states.find((x) => x.id === "highlight")?.text || "").includes("--selection-bg"), "highlight is shown as sulphur's marking role");

    check(g.playbook.includes("13.9:1") && g.playbook.includes("12.2:1"), "the playbook's 13.9:1 is shown beside the computed 12.2:1");
    check(g.sulphur.includes("1.3:1") && g.sulphur.includes("Fail"), `sulphur on chalk is measured and fails for text (${g.sulphur.replace(/\s+/g, " ").slice(0, 60)})`);
    check(g.marks.length === 5, `the five marks are specimened (${g.marks.join(", ")})`);

    /* Every shade can be taken with a click: its hex, its token and both ratios. */
    const steps = cssColours.filter((n) => /^--(chalk|cyanotype|sulphur|verdigris|stamp)-\d+$/.test(n));
    const tiles = await ev(`(() => {
      const all = [...document.querySelectorAll("[data-tile]")];
      return {
        count: all.length,
        complete: all.filter(t =>
          t.querySelector('[data-copy^="#"]') &&
          t.querySelector('[data-copy="' + t.getAttribute("data-tile") + '"]') &&
          t.querySelectorAll('[data-copy$=":1"]').length === 2).length,
        buttons: document.querySelectorAll("[data-copy]").length,
      };
    })()`);
    check(tiles.count === steps.length && tiles.complete === steps.length,
      `every shade in the hierarchy copies its hex, token and both contrast ratios (${tiles.complete}/${steps.length})`);

    await cdp.send("Browser.grantPermissions", { origin: BASE, permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {});
    const clip = (selector) => ev(`(async () => {
      const b = document.querySelector(${JSON.stringify(selector)});
      if (!b) return { text: "missing", said: "" };
      b.click();
      await new Promise(r => setTimeout(r, 300));
      const text = await navigator.clipboard.readText().catch(e => "ERR " + e.message);
      return { text, said: b.textContent };
    })()`);
    const expectHex = colourSrc.match(/--cyanotype-600:(#[0-9A-Fa-f]{6})/)?.[1];
    const hexCopy = await clip('[data-tile="--cyanotype-600"] [data-copy^="#"]');
    check(hexCopy.text === expectHex && hexCopy.said.includes("Copied"),
      `clicking a shade copies its hex and says so (${hexCopy.text}, expected ${expectHex})`);
    const ratioCopy = await clip('[data-tile="--cyanotype-600"] [data-copy$=":1"]');
    check(/^\d+\.\d:1$/.test(ratioCopy.text), `clicking a contrast copies the ratio (${ratioCopy.text})`);
    const quoteCopy = await clip('[aria-label="Copy this section as text"]');
    check(quoteCopy.text.includes("Simple language, sophisticated thinking") && !/<(p|h2|strong)[ >]/.test(quoteCopy.text),
      `a quoted section copies as clean text (${quoteCopy.text.slice(0, 48).replace(/\n/g, " ")}…)`);
    check(tiles.buttons > 300, `values across every section are copyable (${tiles.buttons} copy controls)`);

    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 2, mobile: true }, sessionId);
    await go("/guidelines/");
    const narrowGuide = await ev(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
    check(narrowGuide <= 1, `no horizontal overflow on /guidelines at 320px (${narrowGuide}px)`);
    await cdp.send("Emulation.clearDeviceMetricsOverride", {}, sessionId);
  }

  /* --------------------------------------------- the brand context pack ---- */

  await go("/context/");

  const pack = await ev(`(() => {
    const rows = [...document.querySelectorAll("pre")];
    return {
      count: rows.length,
      titles: [...document.querySelectorAll("h3")].map(h => h.textContent.trim()),
      opensWithHeading: rows.every(p => p.textContent.trimStart().startsWith("#")),
      empty: rows.filter(p => !p.textContent.trim()).length,
      text: rows.map(p => p.textContent).join("\\n"),
      focusable: rows.every(p => p.tabIndex === 0),
    };
  })()`);

  check(pack.count === 11, `eleven sections render (${pack.count})`);
  check(pack.empty === 0, `no section is empty (${pack.empty} empty)`);
  check(pack.opensWithHeading, "every section opens with a Markdown heading");
  check(pack.focusable, "every scroll box is reachable by keyboard");

  const expected = ["Start here", "Brand strategy", "Voice & writing", "Social playbook",
    "Content playbook", "Template library", "Visual thesis", "The publishing gate",
    "Profiles and bios", "The question register", "Tasks"];
  const missingTitles = expected.filter((x) => !pack.titles.includes(x));
  check(missingTitles.length === 0, `the eleven sections are named (${missingTitles.join(", ") || "all present"})`);

  /* The document really converted — not just the shell rendering. */
  const banned = ["leverage", "synergy", "game-changer"].filter((w) => !pack.text.includes(w));
  check(banned.length === 0, `voice carries the banned constructions (${banned.join(", ") || "all present"})`);

  /* A table has to survive AS a table: header, then the delimiter on the very
     next line. Separated by a blank line it is a column of pipes, not a table. */
  check(
    /\| Attribute \| In practice \|\n\| --- \| --- \|/.test(pack.text),
    "a Markdown table keeps its delimiter row",
  );

  /* Section 06 is the largest document and the one most likely to convert
     badly; sections 05/07/09 are hand-emitted rather than converted. Check
     both kinds, or a bug in either could ship green. */
  check(pack.text.includes("| Version one | Problem | Version two |"),
    "the visual thesis' four-column table converted");
  check(pack.text.includes("OKW-ACA-CERT-01") && pack.text.includes("Practical application"),
    "the code-resident sections emitted their template codes and criteria");
  check(pack.text.includes("Illustrative example — not a measured figure"),
    "the gate carries the illustrative wording verbatim");

  /* Nothing pasted into a model should carry raw markup. */
  const TAGS = ["h1","h2","h3","p","ul","ol","li","table","tr","th","td","pre","code","strong","em","blockquote","hr"];
  const leaked = TAGS.filter((t) => new RegExp("<" + t + "[ >/]").test(pack.text));
  check(leaked.length === 0, `no raw HTML leaked into the pack (${leaked.join(", ") || "clean"})`);

  /* Deselecting has to change what would be copied, not just the checkbox. */
  const before = await ev(`document.querySelector("[data-pack-total]").textContent`);
  await ev(`(() => {
    const b = [...document.querySelectorAll("input[type=checkbox]")];
    if (b.length) b[b.length - 1].click();
    return true;
  })()`);
  await sleep(300);
  const after = await ev(`document.querySelector("[data-pack-total]").textContent`);
  const num = (s) => Number((s.match(/([\d,]+) characters/) ?? [0, "0"])[1].replace(/,/g, ""));
  check(num(after) > 0 && num(after) < num(before),
    `deselecting a section shrinks the pack (${num(before)} to ${num(after)} chars)`);

  /* Restore the full selection before the download check. */
  await ev(`(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "All");
    if (b) b.click(); return true;
  })()`);
  await sleep(300);

  /* Clipboard. If the grant is refused, say so rather than reporting a green
     that was never measured. */
  let granted = true;
  try {
    await cdp.send("Browser.grantPermissions", {
      origin: BASE,
      permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
    });
  } catch { granted = false; }

  await ev(`(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Copy selected");
    if (b) b.click(); return true;
  })()`);
  await sleep(500);

  if (granted) {
    const clip = await ev(`navigator.clipboard.readText().then(t => t.slice(0, 400)).catch(e => "ERR:" + e.message)`);
    check(typeof clip === "string" && clip.startsWith("<!-- 00 · Start here"),
      `copy selected reaches the clipboard (${String(clip).slice(0, 40)}…)`);
  } else {
    const state = await ev(`[...document.querySelectorAll("button")].some(x => x.textContent.trim() === "Copied")`);
    check(state, "copy selected reports copied (clipboard permission refused — button state only)");
  }

  /* The .md download must be the pack, not an empty file. */
  await rmDownloads();
  await ev(`(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.textContent.trim() === "Download .md");
    if (b) b.click(); return true;
  })()`);
  const packFiles = await settledDownloads();
  const md = packFiles.find((f) => f.endsWith(".md"));
  check(!!md, `the pack downloads as Markdown (${packFiles.join(", ") || "nothing"})`);
  if (md) {
    const text = await readFile(path.join(DL, md), "utf8");
    check(text.includes("# Okwe Knowledge — brand context"), "the file opens with the pack heading");
    check(text.includes("Voice, writing and editorial standards"), "the file carries the voice document");
    check(text.length > 40_000, `the file is the whole pack (${text.length} chars)`);
  }

  await cdp.send("Target.closeTarget", { targetId });
} finally {
  chrome.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  await rm(DL, { recursive: true, force: true }).catch(() => {});
}

/*
 * The generator duplicates ARM_WORD because it is .mjs and cannot import TS.
 * It throws on drift at build time; this asserts the same thing about the
 * shipped manifest, so a stale manifest cannot survive a green run.
 */
{
  const geom = await readFile("src/design-system/brand/geometry.ts", "utf8");
  const block = geom.match(/ARM_WORD[^{]*\{([^}]*)\}/)?.[1] ?? "";
  const armsInCode = [...block.matchAll(/(\w+)\s*:/g)].map((m) => m[1]).sort();
  const manifest = JSON.parse(await readFile("public/assets/logo/logo.manifest.json", "utf8"));
  const armsInManifest = manifest.brands.map((b) => b.arm).filter(Boolean).sort();
  check(
    armsInCode.join(",") === armsInManifest.join(","),
    `manifest arms match geometry.ts (${armsInCode.join(", ")} vs ${armsInManifest.join(", ")})`,
  );
  const kinds = (k) => manifest.brands.filter((b) => b.kind === k);
  check(
    manifest.brands.length === 5 && kinds("parent").length === 1 && kinds("imprint").length === 1 &&
      kinds("process").map((b) => b.arm).sort().join(",") === armsInCode.join(","),
    `five marks: one parent, one imprint, and processes equal to geometry.ts (${manifest.brands.map((b) => `${b.name}:${b.kind}`).join(", ")})`,
  );
}

/*
 * The converter supports a closed set of tags and throws on anything else, so
 * a new tag in the corpus would fail `next build`. This says the same thing
 * earlier and in words: SUPPORTED_TAGS is read out of markdown.ts as text
 * rather than duplicated, the way the logo generator reads geometry.ts.
 */
{
  const src = await readFile("src/lib/markdown.ts", "utf8");
  const listed = [...(src.match(/SUPPORTED_TAGS\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? "")
    .matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]);
  const docs = JSON.parse(await readFile("src/content/playbook-docs.json", "utf8"));
  const used = new Set();
  for (const d of docs) for (const m of d.html.matchAll(/<\/?([a-zA-Z0-9]+)/g)) used.add(m[1].toLowerCase());
  const drifted = [...used].filter((t) => !listed.includes(t));
  check(
    listed.length > 0 && drifted.length === 0,
    `tag drift: playbook-docs.json stays inside markdown.ts's ${listed.length} tags (${drifted.join(", ") || "no drift"})`,
  );
}

/*
 * Every colour alias must be described on the guidelines page, and every
 * description must name a real token — so the page cannot fall behind
 * colors.css, and cannot describe a token that no longer exists.
 */
{
  const colours = await readFile("src/design-system/tokens/colors.css", "utf8");
  const aliases = [...new Set([...colours.matchAll(/--([\w-]+)\s*:/g)].map((m) => `--${m[1]}`))]
    .filter((n) => !/^--(chalk|cyanotype|sulphur|verdigris|stamp)-\d+$/.test(n));
  const guide = await readFile("src/content/guidelines.ts", "utf8");
  const notes = guide.match(/ALIAS_NOTES[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? "";
  const described = [...notes.matchAll(/"(--[\w-]+)":/g)].map((m) => m[1]);
  const undescribed = aliases.filter((a) => !described.includes(a));
  const phantom = described.filter((d) => !aliases.includes(d));
  check(
    aliases.length > 0 && undescribed.length === 0 && phantom.length === 0,
    `token coverage: ${aliases.length} colour aliases, every one described (missing ${undescribed.join(", ") || "none"}; phantom ${phantom.join(", ") || "none"})`,
  );
}

/*
 * The marks were renamed to Knows / Coms / Move, with Okwe Knowledge kept as
 * the imprint. Copy written in this repo may not keep the retired wording.
 * Source copy — the playbook and the ported pages — is not checked: it is kept
 * verbatim by decision.
 */
{
  const retired = ["Okwe Comms", "okwe-comms", "four arms", "publishing arm", "messaging arm", "logistics arm"];
  const derived = [
    "src/content/entries.ts", "src/content/brand.ts", "src/content/context.ts", "src/content/guidelines.ts",
    "src/lib/pack.ts", "src/app/brand/Brand.tsx", "src/app/brand/AssetRow.tsx", "src/app/brand/page.tsx",
    "src/app/guidelines/Guidelines.tsx", "src/app/guidelines/page.tsx", "src/app/design-system/page.tsx",
    "scripts/build-logo-assets.mjs", "public/assets/logo/logo.manifest.json", "README.md", "public/assets/README.md",
  ];
  const hits = [];
  for (const f of derived) {
    const txt = await readFile(f, "utf8");
    for (const w of retired) if (txt.includes(w)) hits.push(`${f}: "${w}"`);
  }
  check(hits.length === 0, `retired wording: no derived file uses the old mark names (${hits.join("; ") || "clean"})`);
}

let bad = 0;
for (const r of results) { if (!r.ok) bad++; console.log(`${r.ok ? "  ok  " : " FAIL "} ${r.msg}`); }
console.log(`\n${results.length - bad}/${results.length} addition checks passed.`);
process.exit(bad ? 1 : 0);
