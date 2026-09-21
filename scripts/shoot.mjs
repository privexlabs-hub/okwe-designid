/** Screenshot every route from the production export, for visual review. */
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:4321";
const OUT = process.argv[3] ?? "/private/tmp/claude-501/-Users-mac-Downloads-start-building-okwe-okwe-knows/65a404e3-a918-45d8-9c79-1a36bae3b71e/scratchpad/shots";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const ROUTES = { index:"/", playbook:"/playbook/", editor:"/post-editor/", social:"/social-kit/", proofs:"/content-proofs/", carousel:"/carousel/", ds:"/design-system/", register:"/register/", brand:"/brand/", context:"/context/", guidelines:"/guidelines/" };

const profile = await mkdtemp(path.join(tmpdir(), "okwe-shot-"));
const chrome = spawn(CHROME, ["--headless=new",`--remote-debugging-port=${PORT}`,`--user-data-dir=${profile}`,"--no-first-run","--no-default-browser-check","--window-size=1440,900","--hide-scrollbars","--force-device-scale-factor=1","about:blank"], { stdio:"ignore" });
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

let wsUrl;
for (let i=0;i<60;i++){ try{const r=await fetch(`http://127.0.0.1:${PORT}/json/version`); if(r.ok){wsUrl=(await r.json()).webSocketDebuggerUrl;break;}}catch{} await sleep(250); }

class CDP{constructor(ws){this.ws=ws;this.id=0;this.p=new Map();ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(m.id&&this.p.has(m.id)){const{resolve,reject}=this.p.get(m.id);this.p.delete(m.id);if(m.error){reject(new Error(JSON.stringify(m.error)));}else{resolve(m.result);}}});}
 send(method,params={},sessionId){const id=++this.id;this.ws.send(JSON.stringify({id,method,params,sessionId}));return new Promise((resolve,reject)=>this.p.set(id,{resolve,reject}));}}
const ws = await new Promise((res,rej)=>{const w=new WebSocket(wsUrl);w.addEventListener("open",()=>res(w));w.addEventListener("error",rej);});
const cdp = new CDP(ws);
const { targetId } = await cdp.send("Target.createTarget",{url:"about:blank"});
const { sessionId } = await cdp.send("Target.attachToTarget",{targetId,flatten:true});
await cdp.send("Page.enable",{},sessionId);
await cdp.send("Runtime.enable",{},sessionId);
await mkdir(OUT,{recursive:true});

for (const [name,route] of Object.entries(ROUTES)) {
  await cdp.send("Page.navigate",{url:BASE+route},sessionId);
  await sleep(1500);
  await cdp.send("Runtime.evaluate",{expression:"document.fonts.ready.then(()=>true)",awaitPromise:true},sessionId);
  await sleep(400);
  const { data } = await cdp.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false},sessionId);
  const f = path.join(OUT, `${name}.png`);
  await writeFile(f, Buffer.from(data,"base64"));
  console.log(f);
}
chrome.kill(); await new Promise(r=>setTimeout(r,500));
await rm(profile,{recursive:true,force:true}).catch(()=>{});
