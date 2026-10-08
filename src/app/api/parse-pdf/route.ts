import { consumeQuota, resolveCaller } from "@/lib/api/guard"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import { DEFAULT_GENERATION_CONTEXT, type PortfolioGenerationContext } from "@/lib/design/generationContext"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { PipelineError } from "@/lib/pipeline/generatePortfolio"
import { runPdfToPortfolioPipeline } from "@/services/api/pdf-portfolio.pipeline"
import type { BuildPreview, BuildStage, BuildStreamEvent } from "@/types/buildStream"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export const runtime = "nodejs"
export const maxDuration = 120

/** Every NDJSON line carries the request id for log correlation. */
type Chunk = BuildStreamEvent & { requestId: string; elapsedMs?: number }

const encoder = new TextEncoder()
const encodeChunk = (chunk: Chunk) => encoder.encode(`${JSON.stringify(chunk)}\n`)

/** Friendly copy for errors the user can act on (the client also maps `error` codes through messages.dossier.errors). */
const FRIENDLY: Record<string, string> = {
  scanned_pdf: "This PDF looks like a scan, so there is no text to read. Export your resume as a PDF with selectable text and try again.",
  pipelineFailed: "We could not read that PDF. Try again, or export it again from your editor.",
}

function logParseStage(requestId: string, stage: string, startedAt: number, fields: Record<string, unknown> = {}) {
  console.info("[parse-pdf]", { requestId, stage, elapsedMs: Date.now() - startedAt, ...fields })
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  logParseStage(requestId, "request_received", startedAt)

  // Preview-first: anonymous callers may parse, but under a tight per-IP daily cap (LLM quota protection).
  const caller = await resolveCaller()
  const blocked = await consumeQuota(request, caller, "parse")
  if (blocked) return blocked

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!file || !(file instanceof File)) return Response.json({ error: "fileRequired" }, { status: 400 })
    if (!PDF_ALLOWED_MIME_TYPES.includes(file.type as (typeof PDF_ALLOWED_MIME_TYPES)[number])) {
      return Response.json({ error: "invalidFileType" }, { status: 400 })
    }
    if (file.size > PDF_UPLOAD_MAX_BYTES) return Response.json({ error: "fileTooLarge" }, { status: 413 })

    const styleRaw = formData.get("portfolioStyle")?.toString()
    const preset: PortfolioStylePreset = PORTFOLIO_STYLE_PRESETS.includes(styleRaw as PortfolioStylePreset)
      ? (styleRaw as PortfolioStylePreset)
      : DEFAULT_GENERATION_CONTEXT.portfolioStylePreset

    const variationRaw = formData.get("variationSeed")
    const variationParsed = variationRaw != null ? Number(variationRaw) : NaN
    const variationSeed = Number.isFinite(variationParsed) ? variationParsed : 0

    const dirRaw = formData.get("designDirection")?.toString()
    const designDirection =
      dirRaw && (DESIGN_DIRECTION_IDS as readonly string[]).includes(dirRaw) ? (dirRaw as DesignDirectionId) : undefined

    const generationContext: PortfolioGenerationContext = {
      portfolioStylePreset: preset,
      designNotes: formData.get("designNotes")?.toString() ?? "",
      variationSeed,
      ...(["1", "true"].includes(formData.get("autoStyle")?.toString() ?? "") ? { autoStyle: true } : {}),
      ...(designDirection ? { designDirection } : {}),
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    logParseStage(requestId, "pdf_buffer_ready", startedAt, { bytes: buffer.byteLength })

    // Client gone -> the in-flight AI call is aborted (no tokens spent on an answer nobody reads).
    const cancel = new AbortController()
    let stop: (() => void) | null = null

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false
        const write = (chunk: Chunk) => {
          if (!closed) controller.enqueue(encodeChunk(chunk))
        }
        const progress = (stage: BuildStage, preview?: BuildPreview) => {
          logParseStage(requestId, stage, startedAt, preview?.source ? { source: preview.source } : {})
          write({ type: "progress", requestId, stage, elapsedMs: Date.now() - startedAt, ...(preview ? { preview } : {}) })
        }

        progress("stream_started")
        const heartbeat = setInterval(() => write({ type: "heartbeat", requestId, elapsedMs: Date.now() - startedAt }), 5000)
        stop = () => {
          closed = true
          clearInterval(heartbeat)
        }

        void (async () => {
          try {
            const result = await runPdfToPortfolioPipeline(buffer, generationContext, { onStage: progress, signal: cancel.signal })
            const data = { ...result, appliedStyle: preset }
            progress("response_done")
            write({ type: "result", requestId, data })
          } catch (err) {
            const code = err instanceof PipelineError ? err.code : "pipelineFailed"
            const detail = err instanceof Error ? err.message : "unknown_error"
            logParseStage(requestId, "error", startedAt, { error: code, message: detail })
            write({ type: "error", requestId, error: code, message: FRIENDLY[code] ?? FRIENDLY.pipelineFailed!, elapsedMs: Date.now() - startedAt })
          } finally {
            const wasClosed = closed
            stop?.()
            stop = null
            if (!wasClosed) controller.close()
          }
        })()
      },
      cancel() {
        cancel.abort()
        stop?.()
        stop = null
        logParseStage(requestId, "stream_cancelled", startedAt)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (outer) {
    const message = outer instanceof Error ? outer.message : String(outer)
    logParseStage(requestId, "error", startedAt, { error: "requestFailed", message })
    return Response.json({ error: "requestFailed", message: "The upload did not go through. Try again." }, { status: 500 })
  }
}
