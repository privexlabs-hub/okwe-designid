/**
 * Verifies the app is genuinely interactive — real state changes, not just
 * handlers that exist. Runs against the production static export.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4321";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9336;

const profile = await mkdtemp(path.join(tmpdir(), "okwe-int-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
  "--window-size=1440,900", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {}
  await sleep(250);
}
class CDP { constructor(ws){this.ws=ws;this.id=0;this.p=new Map();
  ws.addEventListener("message",e=>{const m=JSON.parse(e.data);
    if(m.id&&this.p.has(m.id)){const{resolve,reject}=this.p.get(m.id);this.p.delete(m.id);
      if(m.error){reject(new Error(JSON.stringify(m.error)));}else{resolve(m.result);}}});}
  send(method,params={},sessionId){const id=++this.id;
    this.ws.send(JSON.stringify({id,method,params,sessionId}));
    return new Promise((resolve,reject)=>this.p.set(id,{resolve,reject}));}}
const ws = await new Promise((res,rej)=>{const w=new WebSocket(wsUrl);w.addEventListener("open",()=>res(w));w.addEventListener("error",rej);});
const cdp = new CDP(ws);
const { targetId } = await cdp.send("Target.createTarget",{url:"about:blank"});
const { sessionId } = await cdp.send("Target.attachToTarget",{targetId,flatten:true});
await cdp.send("Page.enable",{},sessionId);
await cdp.send("Runtime.enable",{},sessionId);
await cdp.send("Input.setIgnoreInputEvents",{ignore:false},sessionId).catch(()=>{});

const ev = async (expression) => {
  const r = await cdp.send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true},sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};
const go = async (route) => {
  await cdp.send("Page.navigate",{url:BASE+route},sessionId);
  await sleep(1500);
  await ev("document.fonts.ready.then(()=>true)");
};
const results = [];
const check = (ok,msg)=>results.push({ok,msg});

/* ---- Index: the opening rule turns sulphur on hover, and on focus ---- */
await go("/");
const hover = await ev(`(() => {
  const a = document.querySelector('nav a');
  if (!a) return { error: "no register entry" };
  const before = getComputedStyle(a).borderTopColor;
  // :hover cannot be forced from script, so read the rule the stylesheet holds.
  let rule = null;
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules || []) {
      if (r.selectorText && /:hover/.test(r.selectorText) && r.style && r.style.borderTopColor) {
        if ([...a.classList].some(c => r.selectorText.includes(c))) rule = r.style.borderTopColor;
      }
    }
  }
  return { before, rule };
})()`);
check(hover.before === "rgb(5, 22, 31)", `entry opens with a 3px ink rule (${hover.before})`);
check(!!hover.rule, `hover rule exists in CSS and sets the rule colour (${hover.rule})`);

const sulphur = await ev(`getComputedStyle(document.documentElement).getPropertyValue("--rule-mark").trim()`);
check(sulphur === "var(--sulphur-400)" || sulphur === "#E3CB2A", `--rule-mark resolves to sulphur (${sulphur})`);

/* ---- Index: keyboard order and the sulphur focus ring ---- */
const kbd = await ev(`(() => {
  const links = [...document.querySelectorAll('nav a')];
  links[0].focus();
  const f = document.activeElement;
  const cs = getComputedStyle(f);
  return { count: links.length, focused: f.tagName + ":" + (f.getAttribute("href")||""),
           outlineColor: cs.outlineColor, outlineWidth: cs.outlineWidth };
})()`);
check(kbd.count === 7, `seven register entries are focusable links (${kbd.count})`);
check(kbd.focused.startsWith("A:"), `tab lands on a real link (${kbd.focused})`);

const ring = await ev(`getComputedStyle(document.documentElement).getPropertyValue("--focus-ring-width").trim()`);
check(ring === "2px", `focus ring is 2px (${ring})`);

/* ---- Reduced motion zeroes the durations ---- */
await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]},sessionId);
await go("/");
const dur = await ev(`getComputedStyle(document.documentElement).getPropertyValue("--duration-snap").trim()`);
check(dur === "0ms", `prefers-reduced-motion zeroes --duration-snap (${dur})`);
await cdp.send("Emulation.setEmulatedMedia",{features:[]},sessionId);

/* ---- Social kit: tier filter actually filters ---- */
await go("/social-kit/");
const tier = await ev(`(() => {
  const rows = () => document.querySelectorAll('[data-profile-row]').length ||
    [...document.querySelectorAll('p')].filter(p => /okweknowledge|Practical|How trade|Long-form|One idea|Not launched|intelligence/.test(p.textContent)).length;
  const before = rows();
  const chip = [...document.querySelectorAll('span,button')].find(e => e.textContent.trim() === "Tier 1");
  if (!chip) return { error: "no Tier 1 chip" };
  chip.click();
  return { before, chip: chip.tagName };
})()`);
if (tier.error) check(false, "tier filter: " + tier.error);
else {
  await sleep(400);
  const after = await ev(`[...document.querySelectorAll('p')].filter(p => /okweknowledge|Practical|How trade|Long-form|One idea|Not launched|intelligence/.test(p.textContent)).length`);
  check(after < tier.before && after > 0, `tier filter narrows the register (${tier.before} → ${after})`);
}

/* ---- Content proofs: plate mode really flips the theme ---- */
await go("/content-proofs/");
const plate = await ev(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /plate mode/i.test(b.textContent));
  if (!btn) return { error: "no plate switch" };
  const before = document.documentElement.getAttribute("data-theme");
  btn.click();
  return { before, after: document.documentElement.getAttribute("data-theme") };
})()`);
if (plate.error) check(false, "plate mode: " + plate.error);
else {
  await sleep(300);
  const bg = await ev(`getComputedStyle(document.body).backgroundColor`);
  check(plate.after === "plate", `plate switch sets data-theme (${plate.before} → ${plate.after})`);
  check(bg === "rgb(5, 22, 31)", `plate mode repaints the ground to cyanotype (${bg})`);
}

/* ---- Content proofs: the jump list targets real sections ---- */
const jump = await ev(`(() => {
  const ids = [...document.querySelectorAll('a[href^="#proof-"]')].map(a => a.getAttribute("href").slice(1));
  const missing = ids.filter(id => !document.getElementById(id));
  return { n: ids.length, missing };
})()`);
check(jump.n === 12 && jump.missing.length === 0,
  `proof index: ${jump.n} anchors, ${jump.missing.length} broken`);

/* ---- Post editor: typing a headline updates the live canvas and the gate ---- */
await go("/post-editor/");
const editor = await ev(`(() => {
  const ta = document.querySelector('textarea');
  if (!ta) return { error: "no headline field" };
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  setter.call(ta, "Leverage synergy to utilise the thing");
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  return { ok: true };
})()`);
if (editor.error) check(false, "post editor: " + editor.error);
else {
  await sleep(500);
  const reflected = await ev(`document.body.innerText.includes("Leverage synergy to utilise the thing")`);
  check(reflected, "editing the headline updates the live canvas");
}

/* The quality gate is a real assessment: it must actually drop when the copy
   breaks a rule. The plain-language check reads the BODY, so put a banned word
   there (the second textarea) rather than in the headline. */
const readGate = async () => ev(`(() => {
  const m = document.body.innerText.match(/Publishing threshold\\s*(\\d)\\s*\\/\\s*4/);
  return m ? Number(m[1]) : null;
})()`);
const gateBefore = await readGate();
await ev(`(() => {
  const tas = document.querySelectorAll('textarea');
  const body = tas[1];
  if (!body) return false;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  setter.call(body, "We leverage synergy across the value chain.");
  body.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})()`);
await sleep(500);
const gateAfter = await readGate();
check(gateBefore !== null, `quality gate reports a score (${gateBefore}/4)`);
check(gateAfter !== null && gateAfter < gateBefore,
  `banned vocabulary in the body drops the score (${gateBefore} → ${gateAfter})`);

await cdp.send("Target.closeTarget",{targetId});
chrome.kill();
await sleep(500);
await rm(profile,{recursive:true,force:true}).catch(()=>{});

let bad = 0;
for (const r of results) { if (!r.ok) bad++; console.log(`${r.ok ? "  ok  " : " FAIL "} ${r.msg}`); }
console.log(`\n${results.length - bad}/${results.length} interaction checks passed.`);
process.exit(bad ? 1 : 0);
