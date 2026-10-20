/// <reference lib="webworker" />
/**
 * Resume typesetter worker. Owns one Typst compiler (wasm), compiles the resume JSON into an SVG preview or
 * a PDF, and extracts the PDF's text for the ATS check. Runs off the main thread so typing never stutters;
 * the client kills and respawns it if a compile hangs.
 *
 * Everything it loads is same-origin and content-hashed (public/typst/manifest.json). It never fetches a
 * package registry or font CDN.
 */
import * as compilerGlue from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler.mjs"
import * as rendererGlue from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer.mjs"

import { TypstEngine } from "./core"
import type { WorkerRequest, WorkerResponse } from "./protocol"

type Manifest = {
  wasm: { compiler: string; renderer: string }
  sources: Record<string, string>
  fonts: Record<string, string>
}

const ctx = self as unknown as DedicatedWorkerGlobalScope
let manifest: Manifest | null = null
let wasmReady: Promise<void> | null = null
let engine: TypstEngine | null = null
const loadedFonts = new Map<string, Uint8Array>()
let engineFonts = ""

const post = (msg: WorkerResponse, transfer: Transferable[] = []) => ctx.postMessage(msg, transfer)

async function fetchBytes(url: string) {
  const res = await fetch(url, { credentials: "same-origin" })
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`)
  return new Uint8Array(await res.arrayBuffer())
}

async function compileWasm(url: string) {
  // Streaming compile starts while the file downloads; fall back when the server sends the wrong MIME type.
  try {
    return await WebAssembly.compileStreaming(fetch(url, { credentials: "same-origin" }))
  } catch {
    return WebAssembly.compile(await fetchBytes(url))
  }
}

async function ensureWasm() {
  if (!wasmReady) {
    wasmReady = (async () => {
      const res = await fetch("/typst/manifest.json", { cache: "no-cache" })
      if (!res.ok) throw new Error("The typesetter files are missing. Run the asset sync script.")
      manifest = (await res.json()) as Manifest
      const [cm, rm] = await Promise.all([compileWasm(manifest.wasm.compiler), compileWasm(manifest.wasm.renderer)])
      compilerGlue.initSync({ module: cm })
      rendererGlue.initSync({ module: rm })
    })()
    wasmReady.catch(() => {
      wasmReady = null
    })
  }
  return wasmReady
}

/** Builds (or rebuilds) the compiler with every font loaded so far plus the ones this template needs. */
async function ensureEngine(fonts: string[]) {
  await ensureWasm()
  const m = manifest!
  const missing = fonts.filter((f) => !loadedFonts.has(f) && m.fonts[f])
  await Promise.all(missing.map(async (f) => loadedFonts.set(f, await fetchBytes(m.fonts[f]))))
  const key = [...loadedFonts.keys()].sort().join(",")
  if (engine && key === engineFonts) return engine
  const sources = await Promise.all(
    Object.entries(m.sources).map(async ([path, url]) => ({ path, text: new TextDecoder().decode(await fetchBytes(url)) })),
  )
  engine = await TypstEngine.create({
    compiler: compilerGlue,
    renderer: rendererGlue,
    fonts: [...loadedFonts.values()],
    sources,
  })
  engineFonts = key
  return engine
}

/** pdf.js in this same worker, with its "worker" running inline. Loaded only when the ATS check runs. */
async function extractText(bytes: Uint8Array) {
  const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs")
  ;(globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = workerModule
  const pdfjs = await import("pdfjs-dist/build/pdf.min.mjs")
  const doc = await pdfjs.getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: false }).promise
  const pages: string[] = []
  const links: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const tc = await page.getTextContent()
    pages.push(tc.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : "") : "")).join(""))
    for (const a of await page.getAnnotations()) if (typeof a.url === "string") links.push(a.url)
  }
  await doc.destroy()
  return { text: pages.join("\n\n"), pages: doc.numPages, links }
}

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data
  try {
    if (req.type === "extract") {
      const out = await extractText(req.bytes)
      post({ type: "text", id: req.id, ...out })
      return
    }
    if (req.type === "warm") {
      await ensureEngine(req.fonts)
      post({ type: "ready", id: req.id })
      return
    }
    const eng = await ensureEngine(req.fonts)
    const main = `/${req.templateId}.typ`
    if (req.type === "preview") {
      const r = eng.svg(main, req.data)
      if (!r.ok) post({ type: "error", id: req.id, error: r.error, line: r.line })
      else post({ type: "preview", id: req.id, svg: r.svg, ms: r.ms })
      return
    }
    const r = eng.pdf(main, req.data)
    if (!r.ok) {
      post({ type: "error", id: req.id, error: r.error, line: r.line })
      return
    }
    if (req.type === "pdf") {
      const bytes = r.bytes.slice()
      post({ type: "pdf", id: req.id, bytes, ms: r.ms }, [bytes.buffer])
      return
    }
    const out = await extractText(r.bytes.slice())
    post({ type: "text", id: req.id, ...out })
  } catch (e) {
    post({ type: "error", id: req.id, error: e instanceof Error ? e.message : String(e), line: null })
  }
}
