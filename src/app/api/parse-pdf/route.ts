import { devUser } from "@/config/devUser"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { DEFAULT_GENERATION_CONTEXT, type PortfolioGenerationContext } from "@/lib/design/generationContext"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import { runPdfToPortfolioPipeline } from "@/services/api/pdf-portfolio.pipeline"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export const runtime = "nodejs"
export const maxDuration = 120

const DEBUG_INGEST =
  "http://127.0.0.1:7748/ingest/3a8c5706-6a18-4a19-b604-20563b7dff34" as const
const DEBUG_SESSION = "1bdc3c" as const

function agentLog(payload: {
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
  runId?: string
}) {
  const line = JSON.stringify({
    sessionId: DEBUG_SESSION,
    timestamp: Date.now(),
    runId: payload.runId ?? "pre-fix",
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data ?? {},
  })
  // #region agent log
  fetch(DEBUG_INGEST, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": DEBUG_SESSION },
    body: line,
  }).catch(() => {})
  // Netlify/serverless cannot reach localhost ingest — mirror to function logs.
  console.error("[parse-pdf-debug]", line)
  // #endregion
}

export async function POST(request: Request) {
  // #region agent log
  agentLog({
    hypothesisId: "H1",
    location: "parse-pdf/route.ts:POST:entry",
    message: "POST handler entered",
    data: { hasRequest: Boolean(request) },
  })
  // #endregion

  try {
    const formData = await request.formData()
    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "parse-pdf/route.ts:POST:afterFormData",
      message: "formData parsed",
      data: {},
    })
    // #endregion

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

    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "parse-pdf/route.ts:POST:afterFileValidation",
      message: "file validation passed",
      data: { fileType: file.type, fileSize: file.size },
    })
    // #endregion

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
    // #region agent log
    agentLog({
      hypothesisId: "H2",
      location: "parse-pdf/route.ts:POST:afterBuffer",
      message: "PDF buffer ready",
      data: { bufferLength: buffer.length },
    })
    // #endregion

    try {
      // #region agent log
      agentLog({
        hypothesisId: "H3",
        location: "parse-pdf/route.ts:POST:pipelineStart",
        message: "runPdfToPortfolioPipeline starting",
        data: { preset, variationSeed },
      })
      // #endregion

      const result = await runPdfToPortfolioPipeline(buffer, generationContext)

      // #region agent log
      agentLog({
        hypothesisId: "H3",
        location: "parse-pdf/route.ts:POST:pipelineEnd",
        message: "pipeline finished OK",
        data: {
          rawTextLen: typeof result.rawText === "string" ? result.rawText.length : -1,
        },
      })
      // #endregion

      const responseBody = {
        ...result,
        user: devUser,
        appliedStyle: preset,
      }

      try {
        JSON.stringify(responseBody)
      } catch (serErr) {
        // #region agent log
        agentLog({
          hypothesisId: "H4",
          location: "parse-pdf/route.ts:POST:serializeFail",
          message: "JSON.stringify(responseBody) failed",
          data: {
            serMsg: serErr instanceof Error ? serErr.message : String(serErr),
          },
        })
        // #endregion
        return Response.json(
          {
            error: "responseSerializeFailed",
            message: serErr instanceof Error ? serErr.message : "serialize_error",
          },
          { status: 500 }
        )
      }

      return Response.json(responseBody)
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error"
      // #region agent log
      agentLog({
        hypothesisId: "H3",
        location: "parse-pdf/route.ts:POST:pipelineCatch",
        message: "pipeline catch",
        data: {
          errMsg: message.slice(0, 500),
        },
      })
      // #endregion
      const code =
        message.includes("GROQ_API_KEY") || message.includes("Groq")
          ? "groqMissing"
          : "pipelineFailed"
      return Response.json({ error: code, message }, { status: 500 })
    }
  } catch (outer) {
    const message = outer instanceof Error ? outer.message : String(outer)
    // #region agent log
    agentLog({
      hypothesisId: "H1",
      location: "parse-pdf/route.ts:POST:outerCatch",
      message: "outer catch (before pipeline or multipart)",
      data: { errMsg: message.slice(0, 500) },
    })
    // #endregion
    return Response.json(
      {
        error: "requestFailed",
        message,
      },
      { status: 500 }
    )
  }
}
