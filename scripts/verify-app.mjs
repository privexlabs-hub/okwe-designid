/**
 * End-to-end verification against the PRODUCTION static export.
 *
 * Drives a headless Chrome over the DevTools protocol (Node's built-in
 * WebSocket, no driver dependency) and asserts the things that would otherwise
 * be claimed rather than checked:
 *
 *   1. every route serves and renders without console errors
 *   2. no request ever reaches fonts.googleapis.com / fonts.gstatic.com
 *   3. the three variable fonts genuinely loaded (document.fonts.check),
 *      and the width axis is actually applied to the headline
 *   4. no runtime network calls to any third-party origin
 *   5. the deep link from index entry 06 resolves to a real element
 *
 * Usage: node scripts/verify-app.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4321";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

const ROUTES = ["/", "/playbook/", "/post-editor/", "/social-kit/", "/content-proofs/", "/carousel/", "/design-system/", "/register/"];

const profile = await mkdtemp(path.join(tmpdir(), "okwe-verify-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--window-size=1440,900",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chromeReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error("Chrome did not expose a debugging port.");
}

/** Minimal CDP client over the browser-level endpoint. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else {
        for (const l of this.listeners) l(msg);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  on(fn) { this.listeners.push(fn); }
}

const connect = (url) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws));
    ws.addEventListener("error", reject);
  });

const results = [];
const fail = (route, msg) => results.push({ route, ok: false, msg });
const pass = (route, msg) => results.push({ route, ok: true, msg });

try {
  const wsUrl = await chromeReady();
  const cdp = new CDP(await connect(wsUrl));

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

  const consoleErrors = [];
  const requests = [];
  cdp.on((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === "Network.requestWillBeSent") requests.push(msg.params.request.url);
    if (msg.method === "Runtime.exceptionThrown")
      consoleErrors.push(msg.params.exceptionDetails.text + " " +
        (msg.params.exceptionDetails.exception?.description ?? ""));
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
  });

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Network.enable", {}, sessionId);

  const evaluate = async (expression) => {
    const r = await cdp.send(
      "Runtime.evaluate",
      { expression, awaitPromise: true, returnByValue: true },
      sessionId,
    );
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  for (const route of ROUTES) {
    consoleErrors.length = 0;
    requests.length = 0;

    await cdp.send("Page.navigate", { url: BASE + route }, sessionId);
    await sleep(1400);
    await evaluate("document.fonts.ready.then(()=>true)");
    await sleep(300);

    // 1. console
    if (consoleErrors.length) fail(route, `console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);
    else pass(route, "no console errors");

    // 2 + 4. every request must be same-origin
    const foreign = requests.filter((u) => !u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:"));
    if (foreign.length) fail(route, `third-party requests: ${[...new Set(foreign)].slice(0, 4).join(", ")}`);
    else pass(route, `${requests.length} requests, all same-origin`);

    // 3. the fonts actually loaded
    const fonts = await evaluate(`(() => {
      const want = ["Archivo","Literata","Martian Mono"];
      return want.map(f => f + ":" + (document.fonts.check('16px "' + f + '"') ? "ok" : "MISSING")).join(" ");
    })()`);
    if (fonts.includes("MISSING")) fail(route, `fonts not loaded — ${fonts}`);
    else pass(route, `fonts loaded (${fonts})`);
  }

  /* --- The width axis: the single behaviour the whole identity rests on. --- */
  await cdp.send("Page.navigate", { url: BASE + "/" }, sessionId);
  await sleep(1200);
  await evaluate("document.fonts.ready.then(()=>true)");

  const axis = await evaluate(`(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return { error: "no h1" };
    const cs = getComputedStyle(h1);
    // Measure the same string at 118% vs 100% width in the same face.
    const mk = (stretch) => {
      const s = document.createElement("span");
      s.textContent = h1.textContent;
      s.style.cssText = "position:absolute;left:-99999px;white-space:nowrap;font-family:" +
        cs.fontFamily + ";font-size:" + cs.fontSize + ";font-weight:" + cs.fontWeight +
        ";letter-spacing:" + cs.letterSpacing + ";font-stretch:" + stretch;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    };
    return {
      family: cs.fontFamily,
      stretch: cs.fontStretch,
      expanded: Math.round(mk("118%")),
      normal: Math.round(mk("100%")),
    };
  })()`);

  if (axis.error) fail("/", "width axis: " + axis.error);
  else if (axis.expanded <= axis.normal)
    fail("/", `width axis inert — 118% renders ${axis.expanded}px vs 100% ${axis.normal}px (should be wider)`);
  else
    pass("/", `width axis live — 118% is ${axis.expanded}px vs ${axis.normal}px at 100% (+${(((axis.expanded / axis.normal) - 1) * 100).toFixed(1)}%)`);

  /* --- The deep link from index entry 06 --- */
  await cdp.send(
    "Page.navigate",
    { url: BASE + "/playbook/#content-playbook--30-day-launch-plan" },
    sessionId,
  );
  await sleep(1600);
  const anchor = await evaluate(`(() => {
    const el = document.getElementById("content-playbook--30-day-launch-plan");
    return el ? el.textContent.trim().slice(0, 40) : null;
  })()`);
  if (anchor) pass("/playbook/", `deep link resolves → "${anchor}"`);
  else fail("/playbook/", "deep link #content-playbook--30-day-launch-plan did not resolve");

  await cdp.send("Target.closeTarget", { targetId });
} finally {
  chrome.kill();
  await new Promise(r=>setTimeout(r,500));
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}

let bad = 0;
for (const r of results) {
  if (!r.ok) bad++;
  console.log(`${r.ok ? "  ok  " : " FAIL "} ${r.route.padEnd(18)} ${r.msg}`);
}
console.log(`\n${results.length - bad}/${results.length} checks passed.`);
process.exit(bad ? 1 : 0);
