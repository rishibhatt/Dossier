import DOMMatrixPolyfill from "dommatrix"

const g = globalThis as typeof globalThis & { DOMMatrix?: unknown }
if (typeof g.DOMMatrix === "undefined") {
  g.DOMMatrix = DOMMatrixPolyfill
}

/**
 * pdfjs-dist worker is omitted from some serverless traces; without it, fake worker setup throws.
 * CDN URL must match the `pdfjs-dist` version shipped with `pdf-parse` (see package-lock).
 */
const PDFJS_WORKER_VERSION = "5.4.296"

/**
 * Extract plain text from a PDF buffer (Node runtime).
 * Dynamic import runs after the DOMMatrix polyfill above (pdf-parse v2 → pdfjs needs it on Netlify).
 */
export async function parsePdfFromBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse")
  PDFParse.setWorker(
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_WORKER_VERSION}/legacy/build/pdf.worker.mjs`
  )
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    const text = typeof result.text === "string" ? result.text : ""
    return text.replace(/\r\n/g, "\n").trim()
  } finally {
    await parser.destroy()
  }
}
