import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import { executePortfolioPipeline, type StageListener } from "@/lib/pipeline/generatePortfolio"

/** PDF -> regex read -> one AI read -> deterministic document + template. */
export async function runPdfToPortfolioPipeline(
  buffer: Buffer,
  generationContext: PortfolioGenerationContext = DEFAULT_GENERATION_CONTEXT,
  options?: { onStage?: StageListener; signal?: AbortSignal }
) {
  return executePortfolioPipeline(buffer, generationContext, options)
}
