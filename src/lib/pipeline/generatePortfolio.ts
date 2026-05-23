import "server-only"

import { buildDesignConfig, mapPresetToDesignDirection } from "@/lib/designEngine"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { generatePortfolioFromStructuredResume } from "@/lib/ai/portfolioGenerator"
import { runLLMTask } from "@/lib/llm/router"
import type { Mode } from "@/lib/llm/types"
import { extractStructuredResume } from "@/lib/pdf/extractSections"
import { parsePdfFromBuffer } from "@/lib/pdf/parsePdf"
import { parseResume } from "@/lib/parseResume"
import { extractResumeSchema } from "@/lib/schemas/extract.schema"
import { intentProfileSchema } from "@/lib/schemas/intent.schema"
import type { StructuredResume } from "@/types/dossier"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export type PortfolioPipelineStage =
  | "pdf_text_extracted"
  | "llm_extract_done"
  | "llm_intent_done"
  | "layout_done"

const EXTRACT_SYSTEM = `You extract structured résumé data from raw text.
Return ONLY a JSON object matching this shape:
{ "name", "title", "summary", "skills": [], "experience": [{company,role,duration,description}], "projects": [{name,description,tech:[]}], "education": [{institution,degree,period,details}], "contact": {email,phone,links:[]} }
Rules:
- Do not invent employers or degrees; infer cautiously from text.
- Use empty string "" for unknown scalar fields; use [] for unknown arrays.
- summary: 2–4 sentences max.
- Return valid JSON only (no markdown fences).`

const INTENT_SYSTEM = `You infer portfolio creative intent from résumé / profile text.
Return ONLY JSON with:
{ "toneKeywords": string[] (max 12), "seniority"?: "junior"|"mid"|"senior"|"lead"|"executive", "personality"?: string[] (max 10), "positioningLine"?: string (max 220 chars) }
No markdown fences.`

function mergeIntentNotes(ctx: PortfolioGenerationContext, intent: unknown): PortfolioGenerationContext {
  const block = typeof intent === "object" && intent !== null ? JSON.stringify(intent, null, 2) : String(intent)
  return {
    ...ctx,
    designNotes: `${ctx.designNotes}\n\n--- intent profile ---\n${block}`.trim(),
  }
}

/**
 * Full PDF → portfolio orchestration with parallel extract + intent, then layout + deterministic design engine.
 */
export async function executePortfolioPipeline(
  buffer: Buffer,
  generationContext: PortfolioGenerationContext,
  options?: { mode?: Mode; onStage?: (stage: PortfolioPipelineStage) => void }
) {
  const mode: Mode = options?.mode ?? generationContext.llmMode ?? "balanced"
  const rawText = await parsePdfFromBuffer(buffer)
  options?.onStage?.("pdf_text_extracted")

  const [extracted, intented] = await Promise.all([
    runLLMTask("extract", rawText.slice(0, 24_000), {
      systemPrompt: EXTRACT_SYSTEM,
      mode,
      zodSchema: extractResumeSchema,
    })
      .catch(() => null)
      .finally(() => options?.onStage?.("llm_extract_done")),
    runLLMTask("intent", rawText.slice(0, 24_000), {
      systemPrompt: INTENT_SYSTEM,
      mode,
      zodSchema: intentProfileSchema,
    })
      .catch(() => null)
      .finally(() => options?.onStage?.("llm_intent_done")),
  ])

  let structuredData: StructuredResume = extractStructuredResume(rawText)
  if (extracted?.parsed) {
    structuredData = extracted.parsed as StructuredResume
  }

  const parsedResume = parseResume(rawText)
  const ctxWithIntent = mergeIntentNotes(generationContext, intented?.parsed ?? { toneKeywords: [] })

  const portfolioData = await generatePortfolioFromStructuredResume(structuredData, {
    ...ctxWithIntent,
    llmMode: mode,
  })
  options?.onStage?.("layout_done")

  const direction: DesignDirectionId =
    generationContext.designDirection ?? mapPresetToDesignDirection(generationContext.portfolioStylePreset)
  const designConfig = buildDesignConfig(parsedResume, direction, generationContext.variationSeed)

  return { rawText, structuredData, parsedResume, portfolioData, designConfig }
}
