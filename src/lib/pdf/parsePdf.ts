import DOMMatrixPolyfill from "dommatrix"

const g = globalThis as typeof globalThis & { DOMMatrix?: unknown }
if (typeof g.DOMMatrix === "undefined") {
  g.DOMMatrix = DOMMatrixPolyfill
}

/**
 * Extract plain text from a PDF buffer (Node runtime).
 * Dynamic import runs after the DOMMatrix polyfill above (pdf-parse v2 → pdfjs needs it on Netlify).
 */
export async function parsePdfFromBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse")
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    const text = typeof result.text === "string" ? result.text : ""
    return text.replace(/\r\n/g, "\n").trim()
  } finally {
    await parser.destroy()
  }
}
