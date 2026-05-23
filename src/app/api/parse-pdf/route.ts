import { devUser } from "@/config/devUser"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { DEFAULT_GENERATION_CONTEXT, type PortfolioGenerationContext } from "@/lib/design/generationContext"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import { runPdfToPortfolioPipeline } from "@/services/api/pdf-portfolio.pipeline"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export const runtime = "nodejs"
export const maxDuration = 120

type ParsePdfStreamChunk =
  | { type: "progress"; requestId: string; stage: string; elapsedMs: number }
  | { type: "heartbeat"; requestId: string; elapsedMs: number }
  | { type: "result"; requestId: string; data: unknown }
  | { type: "error"; requestId: string; error: string; message: string; elapsedMs: number }

const encoder = new TextEncoder()

function logParseStage(requestId: string, stage: string, startedAt: number, fields: Record<string, unknown> = {}) {
  console.info("[parse-pdf]", {
    requestId,
    stage,
    elapsedMs: Date.now() - startedAt,
    ...fields,
  })
}

function encodeChunk(chunk: ParsePdfStreamChunk) {
  return encoder.encode(`${JSON.stringify(chunk)}\n`)
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  logParseStage(requestId, "request_received", startedAt)

  try {
    const formData = await request.formData()
    logParseStage(requestId, "form_data_read", startedAt)

    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "fileRequired" }, { status: 400 })
    }

    if (!PDF_ALLOWED_MIME_TYPES.includes(file.type as (typeof PDF_ALLOWED_MIME_TYPES)[number])) {
      return Response.json({ error: "invalidFileType" }, { status: 400 })
    }

    if (file.size > PDF_UPLOAD_MAX_BYTES) {
      return Response.json({ error: "fileTooLarge" }, { status: 413 })
    }

    const styleRaw = formData.get("portfolioStyle")?.toString()
    const preset: PortfolioStylePreset = PORTFOLIO_STYLE_PRESETS.includes(styleRaw as PortfolioStylePreset)
      ? (styleRaw as PortfolioStylePreset)
      : DEFAULT_GENERATION_CONTEXT.portfolioStylePreset

    const variationRaw = formData.get("variationSeed")
    const variationParsed = variationRaw != null ? Number(variationRaw) : NaN
    const variationSeed = Number.isFinite(variationParsed) ? variationParsed : 0

    const dirRaw = formData.get("designDirection")?.toString()
    const designDirectionOk =
      dirRaw && (DESIGN_DIRECTION_IDS as readonly string[]).includes(dirRaw) ? (dirRaw as DesignDirectionId) : undefined

    const generationContext: PortfolioGenerationContext = {
      portfolioStylePreset: preset,
      designNotes: formData.get("designNotes")?.toString() ?? "",
      variationSeed,
      ...(designDirectionOk ? { designDirection: designDirectionOk } : {}),
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    logParseStage(requestId, "pdf_buffer_ready", startedAt, { bytes: buffer.byteLength })

    let stopHeartbeat: (() => void) | null = null

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false

        const write = (chunk: ParsePdfStreamChunk) => {
          if (closed) return
          controller.enqueue(encodeChunk(chunk))
        }

        const emitProgress = (stage: string) => {
          logParseStage(requestId, stage, startedAt)
          write({ type: "progress", requestId, stage, elapsedMs: Date.now() - startedAt })
        }

        write({ type: "progress", requestId, stage: "stream_started", elapsedMs: Date.now() - startedAt })

        const heartbeat = setInterval(() => {
          logParseStage(requestId, "heartbeat", startedAt)
          write({ type: "heartbeat", requestId, elapsedMs: Date.now() - startedAt })
        }, 5000)
        stopHeartbeat = () => {
          closed = true
          clearInterval(heartbeat)
        }

        void (async () => {
          try {
            const result = await runPdfToPortfolioPipeline(buffer, generationContext, {
              onStage: emitProgress,
            })

            const responseBody = {
              ...result,
              user: devUser,
              appliedStyle: preset,
            }

            try {
              JSON.stringify(responseBody)
            } catch (serErr) {
              const message = serErr instanceof Error ? serErr.message : "serialize_error"
              logParseStage(requestId, "error", startedAt, { error: "responseSerializeFailed", message })
              write({
                type: "error",
                requestId,
                error: "responseSerializeFailed",
                message,
                elapsedMs: Date.now() - startedAt,
              })
              return
            }

            logParseStage(requestId, "response_done", startedAt)
            write({ type: "result", requestId, data: responseBody })
          } catch (err) {
            const message = err instanceof Error ? err.message : "unknown_error"
            const code =
              message.includes("GROQ_API_KEY") || message.includes("Groq")
                ? "groqMissing"
                : "pipelineFailed"
            logParseStage(requestId, "error", startedAt, { error: code, message })
            write({ type: "error", requestId, error: code, message, elapsedMs: Date.now() - startedAt })
          } finally {
            const wasClosed = closed
            stopHeartbeat?.()
            stopHeartbeat = null
            if (!wasClosed) controller.close()
          }
        })()
      },
      cancel() {
        stopHeartbeat?.()
        stopHeartbeat = null
        logParseStage(requestId, "stream_cancelled", startedAt)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      }
    })
  } catch (outer) {
    const message = outer instanceof Error ? outer.message : String(outer)
    logParseStage(requestId, "error", startedAt, { error: "requestFailed", message })
    return Response.json(
      {
        error: "requestFailed",
        message,
      },
      { status: 500 }
    )
  }
}
