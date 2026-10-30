/**
 * Real screenshot of the resume editor for the /resume landing page (never a mock-up).
 * Opens the running app in headless Chrome, starts a draft from the first sample resume, waits for the
 * typesetter to set the preview, and saves the viewport as WebP to public/resume-landing/.
 *
 * Needs a running dev or prod server and Google Chrome. Run:
 *   node scripts/resume/screenshot-editor.mjs [http://localhost:3000]
 */
import { spawn } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import sharp from "sharp"

const base = process.argv[2] ?? "http://localhost:3000"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const outDir = path.join(process.cwd(), "public/resume-landing")
const port = 9333
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dossier-shot-"))
const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" })

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
      const page = list.find((t) => t.type === "page")
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error("Chrome did not start")
}

let ws
let seq = 0
const pending = new Map()
function send(method, params = {}) {
  const id = ++seq
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value

async function waitFor(expression, ms = 30000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (await evaluate(expression)) return
    await sleep(250)
  }
  throw new Error(`Timed out waiting for: ${expression}`)
}

async function shot(name, width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: width < 768 })
  await sleep(1200)
  const { data } = await send("Page.captureScreenshot", { format: "png" })
  const png = Buffer.from(data, "base64")
  for (const w of [width, width * 2]) {
    const file = path.join(outDir, `${name}-${w}.webp`)
    const info = await sharp(png).resize({ width: w }).webp({ quality: 82 }).toFile(file)
    console.log(`${path.relative(process.cwd(), file)} ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB`)
  }
}

try {
  ws = new WebSocket(await target())
  await new Promise((r) => ws.addEventListener("open", r, { once: true }))
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data)
    const p = msg.id && pending.get(msg.id)
    if (!p) return
    pending.delete(msg.id)
    if (msg.error) p.reject(new Error(msg.error.message))
    else p.resolve(msg.result)
  })
  await send("Page.enable")
  await send("Runtime.enable")
  fs.mkdirSync(outDir, { recursive: true })

  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false })
  await send("Page.navigate", { url: `${base}/resume/new` })
  await waitFor(`!!document.querySelector(".rz-sample")`)
  await evaluate(`document.querySelector(".rz-sample").click()`)
  await waitFor(`location.pathname.startsWith("/resume/edit")`)
  // The preview is an <img> of the typeset SVG; wait until it has loaded.
  await waitFor(`[...document.images].some((i) => i.complete && i.naturalWidth > 300 && i.src.startsWith("blob:"))`, 60000)
  // The dev server's floating Next.js badge is not part of the product.
  await evaluate(`document.querySelectorAll("nextjs-portal").forEach((n) => n.remove())`)
  await shot("editor", 1440, 900)
} finally {
  ws?.close()
  proc.kill()
  await new Promise((r) => (proc.exitCode !== null ? r() : proc.once("exit", r)))
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
