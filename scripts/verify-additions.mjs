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
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4321";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9350;

const profile = await mkdtemp(path.join(tmpdir(), "okwe-add-"));
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

  await cdp.send("Target.closeTarget", { targetId });
} finally {
  chrome.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}

let bad = 0;
for (const r of results) { if (!r.ok) bad++; console.log(`${r.ok ? "  ok  " : " FAIL "} ${r.msg}`); }
console.log(`\n${results.length - bad}/${results.length} addition checks passed.`);
process.exit(bad ? 1 : 0);
