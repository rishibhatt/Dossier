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

/**
 * pdfjs fake worker must load with a `file:` URL in Node (https: is rejected by the ESM loader).
 * Path is resolved from installed `pdfjs-dist` (keep `outputFileTracingIncludes` in next.config for serverless).
 */
function getPdfWorkerFileUrl(): string {
  if (cachedWorkerSrc) return cachedWorkerSrc
  // Resolve from app root — `import.meta.url` points at `.next/server/chunks/...` under Turbopack,
  // so `createRequire(import.meta.url)` often cannot see `node_modules` and breaks local dev.
  const require = createRequire(path.join(process.cwd(), "package.json"))
  const pkgJsonPath = require.resolve("pdfjs-dist/package.json")
  const legacyBuild = path.join(path.dirname(pkgJsonPath), "legacy", "build")
  const primary = path.join(legacyBuild, "pdf.worker.mjs")
  const fallback = path.join(legacyBuild, "pdf.worker.min.mjs")
  const workerFsPath = existsSync(primary) ? primary : fallback
  if (!existsSync(workerFsPath)) {
    throw new Error(`pdfjs worker not found (checked ${primary} and ${fallback})`)
  }
  cachedWorkerSrc = pathToFileURL(workerFsPath).href
  return cachedWorkerSrc
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
