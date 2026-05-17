import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

import DOMMatrixPolyfill from "dommatrix"

const g = globalThis as typeof globalThis & { DOMMatrix?: unknown }
if (typeof g.DOMMatrix === "undefined") {
  g.DOMMatrix = DOMMatrixPolyfill
}

let cachedWorkerSrc: string | null = null

const WORKER_NAMES = ["pdf.worker.mjs", "pdf.worker.min.mjs"] as const

/**
 * pdfjs fake worker must use a `file:` URL in Node (https: is rejected by the ESM loader).
 * Netlify often has no top-level `pdfjs-dist` on the require graph from `/var/task/package.json`,
 * so we probe hoisted + nested paths and only then try `require.resolve` from known anchors.
 */
function getPdfWorkerFileUrl(): string {
  if (cachedWorkerSrc) return cachedWorkerSrc
  const cwd = process.cwd()

  const legacyRoots = [
    path.join(cwd, "node_modules", "pdfjs-dist", "legacy", "build"),
    path.join(cwd, "node_modules", "pdf-parse", "node_modules", "pdfjs-dist", "legacy", "build"),
  ]
  for (const legacyBuild of legacyRoots) {
    for (const name of WORKER_NAMES) {
      const full = path.join(legacyBuild, name)
      if (existsSync(full)) {
        cachedWorkerSrc = pathToFileURL(full).href
        return cachedWorkerSrc
      }
    }
  }

  const anchors = [path.join(cwd, "package.json"), path.join(cwd, "node_modules", "pdf-parse", "package.json")]
  for (const anchor of anchors) {
    if (!existsSync(anchor)) continue
    try {
      const require = createRequire(anchor)
      const pkgJsonPath = require.resolve("pdfjs-dist/package.json")
      const legacyBuild = path.join(path.dirname(pkgJsonPath), "legacy", "build")
      for (const name of WORKER_NAMES) {
        const full = path.join(legacyBuild, name)
        if (existsSync(full)) {
          cachedWorkerSrc = pathToFileURL(full).href
          return cachedWorkerSrc
        }
      }
    } catch {
      /* try next anchor */
    }
  }

  throw new Error(
    `pdfjs worker not found under node_modules (checked hoisted pdfjs-dist, nested pdf-parse/pdfjs-dist, require.resolve from package.json and pdf-parse)`
  )
}

/**
 * Extract plain text from a PDF buffer (Node runtime).
 * Dynamic import runs after the DOMMatrix polyfill above (pdf-parse v2 → pdfjs needs it on Netlify).
 */
export async function parsePdfFromBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse")
  PDFParse.setWorker(getPdfWorkerFileUrl())
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    const text = typeof result.text === "string" ? result.text : ""
    return text.replace(/\r\n/g, "\n").trim()
  } finally {
    await parser.destroy()
  }
}
