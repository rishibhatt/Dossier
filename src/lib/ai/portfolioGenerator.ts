import { messages } from "@/config/messages"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { runLLMTask } from "@/lib/llm/router"
import { PORTFOLIO_JSON_SYSTEM, buildPortfolioUserPayload } from "@/lib/ai/prompts"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import { layoutPortfolioSchema } from "@/lib/schemas/layout.schema"
import { portfolioDocumentSchema } from "@/lib/validations/portfolioDocument"
import type { PortfolioDocument, StructuredResume } from "@/types/dossier"
import type { z } from "zod"

type PortfolioDocumentParsed = z.infer<typeof portfolioDocumentSchema>

function stripJsonFence(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
  }
  return trimmed
}

function parseModelJson(text: string): unknown {
  const cleaned = stripJsonFence(text)
  return JSON.parse(cleaned) as unknown
}

/** Deterministic fallback if model output fails validation. */
export function buildFallbackPortfolio(structured: StructuredResume): PortfolioDocument {
  const slug = structured.name.toLowerCase().replace(/\s+/g, "-")

  const doc: PortfolioDocument = {
    meta: {
      title: `${structured.name} — Portfolio`,
      description: structured.summary.slice(0, 220),
    },
    sections: [
      {
        id: `${slug}-hero`,
        type: "hero",
        data: {
          name: structured.name,
          title: structured.title,
          tagline: structured.summary.split(/\n+/)[0]?.slice(0, 160) ?? "",
        },
      },
      {
        id: `${slug}-about`,
        type: "about",
        data: { body: structured.summary },
      },
      {
        id: `${slug}-skills`,
        type: "skills",
        data: { items: structured.skills },
      },
      {
        id: `${slug}-experience`,
        type: "experience",
        data: { items: structured.experience },
      },
      {
        id: `${slug}-projects`,
        type: "projects",
        data: { items: structured.projects },
      },
      {
        id: `${slug}-contact`,
        type: "contact",
        data: {
          email: structured.contact.email,
          phone: structured.contact.phone,
          links: structured.contact.links,
          headline: messages.dossier.sectionContact,
        },
      },
    ],
  }

  return ensurePortfolioMeta(doc, structured)
}

export async function generatePortfolioFromStructuredResume(
  structured: StructuredResume,
  ctx?: PortfolioGenerationContext
): Promise<PortfolioDocument> {
  const temp = ctx
    ? Math.min(0.62, 0.36 + (Math.abs(ctx.variationSeed) % 12) * 0.022)
    : 0.35

  const mode = ctx?.llmMode ?? "balanced"

  try {
    const out = await runLLMTask<PortfolioDocumentParsed>("layout", buildPortfolioUserPayload(structured, ctx), {
      systemPrompt: PORTFOLIO_JSON_SYSTEM,
      temperature: temp,
      zodSchema: layoutPortfolioSchema,
      mode,
    })
    if (out.parsed) {
      return ensurePortfolioMeta(out.parsed as PortfolioDocument, structured)
    }
  } catch {
    /* fall through */
  }

  try {
    const raw = await runLLMTask("layout", buildPortfolioUserPayload(structured, ctx), {
      systemPrompt: PORTFOLIO_JSON_SYSTEM,
      temperature: temp,
      mode,
    })
    const parsed = parseModelJson(raw.content)
    const validated = portfolioDocumentSchema.safeParse(parsed)
    if (validated.success) {
      return ensurePortfolioMeta(validated.data as PortfolioDocument, structured)
    }
  } catch {
    /* fall through */
  }

  return buildFallbackPortfolio(structured)
}
