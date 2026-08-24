/**
 * Renders every route at a ladder of viewport widths and reports the two
 * failures that matter: horizontal overflow (the page scrolls sideways) and
 * elements spilling outside the viewport.
 *
 * node scripts/audit-responsive.mjs [baseUrl] [--shots]
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:4321";
const SHOTS = process.argv.includes("--shots");
const OUT = "/private/tmp/claude-501/-Users-mac-Downloads-start-building-okwe-okwe-knows/65a404e3-a918-45d8-9c79-1a36bae3b71e/scratchpad/responsive";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9337;

const ROUTES = ["/", "/playbook/", "/post-editor/", "/social-kit/", "/content-proofs/", "/carousel/", "/design-system/", "/register/"];
const WIDTHS = [
  { w: 320, h: 720, name: "320-small-phone" },
  { w: 390, h: 844, name: "390-phone" },
  { w: 768, h: 1024, name: "768-tablet" },
  { w: 1024, h: 768, name: "1024-tablet-land" },
  { w: 1440, h: 900, name: "1440-laptop" },
  { w: 1920, h: 1080, name: "1920-desktop" },
];

const profile = await mkdtemp(path.join(tmpdir(), "okwe-resp-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
  "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {}
  await sleep(250);
}
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map();
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
      if (m.id && this.p.has(m.id)) { const { resolve, reject } = this.p.get(m.id); this.p.delete(m.id);
        if (m.error) { reject(new Error(JSON.stringify(m.error))); } else { resolve(m.result); } } }); }
  send(method, params = {}, sessionId) { const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.p.set(id, { resolve, reject })); }
}
const ws = await new Promise((res, rej) => { const w = new WebSocket(wsUrl);
  w.addEventListener("open", () => res(w)); w.addEventListener("error", rej); });
const cdp = new CDP(ws);
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
await cdp.send("Page.enable", {}, sessionId);
await cdp.send("Runtime.enable", {}, sessionId);
if (SHOTS) await mkdir(OUT, { recursive: true });

const ev = async (expression) => {
  const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

const rows = [];
for (const vp of WIDTHS) {
  await cdp.send("Emulation.setDeviceMetricsOverride",
    { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 768 }, sessionId);
  for (const route of ROUTES) {
    await cdp.send("Page.navigate", { url: BASE + route }, sessionId);
    await sleep(900);
    await ev("document.fonts.ready.then(()=>true)");
    await sleep(250);

    const r = await ev(`((deviceWidth) => {
      // Measure against the width we ASKED for. Under mobile emulation Chrome
      // can widen the layout viewport to the page's min-content width, which
      // makes window.innerWidth grow to match the overflow and report zero —
      // the page is really zoomed out and unreadable. This is the check that
      // was silently passing broken phone layouts.
      const vw = deviceWidth;
      const innerW = window.innerWidth;
      const zoomedOut = innerW > deviceWidth + 1;
      // Use BODY, not documentElement: documentElement.scrollWidth counts
      // content that a descendant scroll container has already clipped, so a
      // working horizontal scroller reads as a broken page. body.scrollWidth
      // answers the question we actually care about — does the PAGE scroll
      // sideways.
      const overflow = Math.max(0, document.body.scrollWidth - vw);

      // A visually-hidden element (the sr-only pattern) is 1px with overflow
      // hidden and a clip rect. It is SUPPOSED to clip its content, so counting
      // it as a layout failure is a false positive.
      const isVisuallyHidden = (el, cs) => {
        const b = el.getBoundingClientRect();
        if (b.width <= 1 || b.height <= 1) return true;
        if (cs.clipPath && cs.clipPath !== "none") return true;
        if (cs.clip && cs.clip !== "auto") return true;
        return false;
      };

      // Content inside a deliberate horizontal scroller is not a failure —
      // fixed-size artwork is meant to scroll in its own box.
      const inScroller = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "auto" || o === "scroll") return true;
        }
        return false;
      };
      // Which elements actually stick out past the right edge?
      const guilty = [];
      for (const el of document.querySelectorAll("body *")) {
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if (b.right > vw + 1) {
          const cs = getComputedStyle(el);
          // Ignore things deliberately parked offscreen for export staging.
          if (b.left < -10000) continue;
          if (cs.position === "fixed" && b.left < -1000) continue;
          if (isVisuallyHidden(el, cs)) continue;
          if (inScroller(el)) continue;
          guilty.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && String(el.className).slice(0, 40)) || "",
            over: Math.round(b.right - vw),
          });
        }
      }
      guilty.sort((a, b) => b.over - a.over);

      // Text that has become unreadably small
      let tiny = 0;
      for (const el of document.querySelectorAll("p,span,div,li,td")) {
        if (!el.childElementCount && el.textContent.trim()) {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < 9) tiny++;
        }
      }

      // CLIPPED CONTENT — the failure the page-overflow number hides.
      // A panel with overflow:hidden reports zero page overflow while silently
      // cutting off its own children, which is exactly how a squeezed
      // three-panel layout passes a naive audit.
      const clipped = [];
      let known = 0;
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        const hidesX = cs.overflowX === "hidden" || cs.overflow === "hidden";
        if (!hidesX) continue;
        if (isVisuallyHidden(el, cs)) continue;
        // Specimens that deliberately exhibit a documented component limit are
        // counted separately, not reported as a layout regression.
        if (el.closest("[data-known-limit]")) { known++; continue; }

        // A publishing canvas renders its sheet at TRUE pixel size and fits it
        // with transform: scale(). A transform does not change scrollWidth, so
        // the box looks like it is clipping 2000px of content when the content
        // is in fact scaled to fit. Discount by the child's scale factor.
        let childScale = 1;
        for (const kid of el.children) {
          const t = getComputedStyle(kid).transform;
          if (t && t !== "none") {
            const m = t.match(/matrix\\(([-\\d.]+)/);
            if (m) childScale = Math.min(childScale, parseFloat(m[1]) || 1);
          }
        }
        const cut = Math.round(el.scrollWidth * childScale) - el.clientWidth;
        if (cut > 4 && el.clientWidth > 0) {
          clipped.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && String(el.className).slice(0, 30)) || "",
            cut: Math.round(cut),
          });
        }
      }
      clipped.sort((a, b) => b.cut - a.cut);

      // OVERLAP — two visible panels occupying the same pixels, which is how
      // the editor's canvas ended up sitting on top of its inspector.
      const panels = [...document.querySelectorAll("aside,header,main,section,nav")]
        .map((el) => ({ el, b: el.getBoundingClientRect() }))
        .filter((p) => p.b.width > 40 && p.b.height > 40);
      let overlaps = 0;
      for (let i = 0; i < panels.length; i++) {
        for (let j = i + 1; j < panels.length; j++) {
          const a = panels[i], b = panels[j];
          if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const ox = Math.min(a.b.right, b.b.right) - Math.max(a.b.left, b.b.left);
          const oy = Math.min(a.b.bottom, b.b.bottom) - Math.max(a.b.top, b.b.top);
          if (ox > 8 && oy > 8) overlaps++;
        }
      }

      return { overflow, guilty: guilty.slice(0, 3), tiny, clipped: clipped.slice(0, 3), overlaps, innerW, zoomedOut, known };
    })(${vp.w})`);

    rows.push({ vp: vp.name, route, ...r });
    if (SHOTS) {
      const { data } = await cdp.send("Page.captureScreenshot", { format: "png" }, sessionId);
      const nm = `${vp.name}__${route.replace(/\//g, "_") || "index"}.png`;
      await writeFile(path.join(OUT, nm), Buffer.from(data, "base64"));
    }
  }
}

await cdp.send("Target.closeTarget", { targetId });
chrome.kill();
await sleep(500);
await rm(profile, { recursive: true, force: true }).catch(() => {});

let bad = 0;
console.log("viewport            route              overflow clip lap tiny  offenders");
console.log("-".repeat(110));
for (const r of rows) {
  const worstClip = r.clipped[0]?.cut ?? 0;
  const ok = r.overflow <= 1 && r.tiny === 0 && worstClip === 0 && r.overlaps === 0;
  if (!ok) bad++;
  const off = [
    ...(r.known ? [`(${r.known} known-limit specimen${r.known > 1 ? "s" : ""} skipped)`] : []),
    ...(r.zoomedOut && r.overflow > 1 ? [`ZOOMED-OUT(layout ${r.innerW}px)`] : []),
    ...r.guilty.map((g) => `${g.tag}.${g.cls.split(" ")[0]}(over+${g.over})`),
    ...r.clipped.map((c) => `${c.tag}.${c.cls.split(" ")[0]}(clip+${c.cut})`),
  ].join(" ");
  console.log(
    `${ok ? "  ok " : " FAIL"} ${r.vp.padEnd(18)} ${r.route.padEnd(17)} ${String(r.overflow).padStart(7)} ${String(worstClip).padStart(4)} ${String(r.overlaps).padStart(3)} ${String(r.tiny).padStart(4)}  ${off}`,
  );
}
console.log(`\n${rows.length - bad}/${rows.length} viewport×route combinations clean.`);
if (SHOTS) console.log(`shots → ${OUT}`);
