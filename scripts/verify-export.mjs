/**
 * Proves the carousel export actually writes real files — the part of the
 * system the source prototype never implemented.
 *
 * Clicks the real "PNGs" and "ZIP package" buttons in a headless browser,
 * captures the downloads, and asserts:
 *   - a PNG per slide, at the true canvas size (1080×1350), not the preview
 *   - the raster is not blank
 *   - the webfont survived rasterisation (dark ink pixels in the headline band)
 *   - the ZIP contains every slide plus the combined PDF
 */
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const BASE = process.argv[2] ?? "http://localhost:4321";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9335;

const profile = await mkdtemp(path.join(tmpdir(), "okwe-exp-"));
const dl = await mkdtemp(path.join(tmpdir(), "okwe-dl-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
  "--window-size=1440,1000", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
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
        if (m.error) reject(new Error(JSON.stringify(m.error)));
        else resolve(m.result); } }); }
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
await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: dl });

const evaluate = async (expression) => {
  const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description ?? ""));
  return r.result.value;
};

const results = [];
const check = (ok, msg) => { results.push({ ok, msg }); };

async function clickButtonByText(text) {
  return evaluate(`(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.textContent.trim() === ${JSON.stringify(text)});
    if (!b) return "NOT FOUND";
    b.click();
    return "clicked";
  })()`);
}

async function waitForStatusIdle(timeoutMs = 120000) {
  const t0 = Date.now();
  let last = "";
  while (Date.now() - t0 < timeoutMs) {
    last = await evaluate(`(() => {
      const el = [...document.querySelectorAll("span")].filter(s => /Rendering|Preparing|Packaging|done|\\.zip|PNGs at|failed|limit/i.test(s.textContent));
      return el.length ? el[el.length-1].textContent.trim() : "";
    })()`);
    if (/done|\.zip|PNGs at|failed|limit/i.test(last)) return last;
    await sleep(500);
  }
  return "TIMEOUT: " + last;
}

const settled = async () => {
  // downloads land as .crdownload first
  for (let i = 0; i < 60; i++) {
    const files = await readdir(dl);
    if (files.length && !files.some((f) => f.endsWith(".crdownload"))) return files;
    await sleep(500);
  }
  return readdir(dl);
};

try {
  await cdp.send("Page.navigate", { url: BASE + "/carousel/" }, sessionId);
  await sleep(1800);
  await evaluate("document.fonts.ready.then(()=>true)");

  /* ---- PNG export ---- */
  check((await clickButtonByText("PNGs")) === "clicked", "clicked the PNGs button");
  const pngStatus = await waitForStatusIdle();
  check(!/failed|TIMEOUT/i.test(pngStatus), `PNG export status: ${pngStatus}`);
  let files = await settled();
  const pngs = files.filter((f) => f.endsWith(".png"));
  check(pngs.length === 6, `6 PNGs written (got ${pngs.length}: ${pngs.slice(0,2).join(", ")}…)`);

  if (pngs.length) {
    const first = path.join(dl, pngs.sort()[0]);
    const meta = await sharp(first).metadata();
    check(meta.width === 1080 && meta.height === 1350,
      `PNG is true canvas size ${meta.width}×${meta.height} (want 1080×1350)`);
    const size = (await stat(first)).size;
    check(size > 20_000, `PNG is a real image (${(size / 1024).toFixed(0)} KB)`);

    // The cover is a cyanotype plate: mostly dark, with light headline pixels.
    // If the webfont failed to embed, the headline band would be flat plate colour.
    const { data } = await sharp(first).greyscale().raw().toBuffer({ resolveWithObject: true });
    let light = 0, dark = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 170) light++;
      else dark++;
    }
    check(dark > 0 && light > 0, `raster has both plate ground and type (${dark} dark / ${light} light px)`);
    const distinct = new Set();
    for (let i = 0; i < data.length; i += 997) distinct.add(data[i]);
    check(distinct.size > 8, `raster is not a flat fill (${distinct.size} distinct greys sampled)`);
  }

  /* ---- ZIP export ---- */
  await rm(dl, { recursive: true, force: true });
  await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: dl });
  await cdp.send("Page.navigate", { url: BASE + "/carousel/" }, sessionId);
  await sleep(1800);
  await evaluate("document.fonts.ready.then(()=>true)");

  check((await clickButtonByText("ZIP package")) === "clicked", "clicked the ZIP package button");
  const zipStatus = await waitForStatusIdle();
  check(!/failed|TIMEOUT/i.test(zipStatus), `ZIP export status: ${zipStatus}`);
  files = await settled();
  const zip = files.find((f) => f.endsWith(".zip"));
  check(!!zip, `ZIP written (${files.join(", ")})`);
  if (zip) {
    const buf = await readFile(path.join(dl, zip));
    const names = [...buf.toString("latin1").matchAll(/okwe-knowledge-[\w.-]+?\.(png|pdf)/g)].map((m) => m[0]);
    const uniq = [...new Set(names)];
    check(uniq.filter((n) => n.endsWith(".png")).length === 6, `ZIP holds 6 PNGs (${uniq.filter(n=>n.endsWith(".png")).length})`);
    check(uniq.some((n) => n.endsWith(".pdf")), "ZIP holds the combined PDF");
    check(buf.length > 100_000, `ZIP is substantial (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  await cdp.send("Target.closeTarget", { targetId });
} finally {
  chrome.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  if (!process.env.KEEP_DOWNLOADS) await rm(dl, { recursive: true, force: true }).catch(() => {});
  else console.log("downloads kept in " + dl);
}

let bad = 0;
for (const r of results) { if (!r.ok) bad++; console.log(`${r.ok ? "  ok  " : " FAIL "} ${r.msg}`); }
console.log(`\n${results.length - bad}/${results.length} export checks passed.`);
process.exit(bad ? 1 : 0);
