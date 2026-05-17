import { devUser } from "@/config/devUser"
import { refineDesignFromPrompt } from "@/lib/design/refineDesignFromPrompt"
import { designConfigSchema } from "@/lib/validations/designConfig"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export const runtime = "nodejs"
export const maxDuration = 60

function isPortfolioDocument(value: unknown): value is PortfolioDocument {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.meta === "object" &&
    v.meta !== null &&
    typeof (v.meta as Record<string, unknown>).title === "string" &&
    Array.isArray(v.sections)
  )
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "invalidJson" }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const message = typeof record.message === "string" ? record.message.trim() : ""
  if (!message || message.length > 2000) {
    return Response.json({ error: "invalidMessage" }, { status: 400 })
  }

  const portfolioData = record.portfolioData
  if (!isPortfolioDocument(portfolioData)) {
    return Response.json({ error: "invalidPayload" }, { status: 400 })
  }

  const parsedConfig = designConfigSchema.safeParse(record.designConfig)
  if (!parsedConfig.success) {
    return Response.json({ error: "invalidPayload" }, { status: 400 })
  }

  const designConfig = parsedConfig.data as DesignConfig

  try {
    const next = await refineDesignFromPrompt({
      portfolioData,
      designConfig,
      message,
    })
    return Response.json({ designConfig: next, user: devUser })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error"
    const code =
      msg.includes("GROQ_API_KEY") || msg.includes("not configured") ? "groqMissing" : "refineFailed"
    return Response.json({ error: code, message: msg }, { status: 500 })
  }
}
