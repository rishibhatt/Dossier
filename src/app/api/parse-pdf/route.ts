import { devUser } from "@/config/devUser"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { DEFAULT_GENERATION_CONTEXT, type PortfolioGenerationContext } from "@/lib/design/generationContext"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import { runPdfToPortfolioPipeline } from "@/services/api/pdf-portfolio.pipeline"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  const formData = await request.formData()
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

  try {
    const result = await runPdfToPortfolioPipeline(buffer, generationContext)
    return Response.json({
      ...result,
      user: devUser,
      appliedStyle: preset,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error"
    const code =
      message.includes("GROQ_API_KEY") || message.includes("Groq")
        ? "groqMissing"
        : "pipelineFailed"
    return Response.json({ error: code, message }, { status: 500 })
  }
}
