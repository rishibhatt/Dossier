import { PDFParse } from "pdf-parse"

/**
 * Extract plain text from a PDF buffer (Node runtime).
 */
export async function parsePdfFromBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    const text = typeof result.text === "string" ? result.text : ""
    return text.replace(/\r\n/g, "\n").trim()
  } finally {
    await parser.destroy()
  }
}
