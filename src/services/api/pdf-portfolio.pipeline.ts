import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { DEFAULT_GENERATION_CONTEXT } from "@/lib/design/generationContext"
import { executePortfolioPipeline, type PortfolioPipelineStage } from "@/lib/pipeline/generatePortfolio"

/**
 * Orchestrates PDF → multi-LLM extract/intent (parallel) → layout JSON → resolved design engine.
 */
export async function runPdfToPortfolioPipeline(
  buffer: Buffer,
  generationContext: PortfolioGenerationContext = DEFAULT_GENERATION_CONTEXT,
  options?: { onStage?: (stage: PortfolioPipelineStage) => void }
) {
  return executePortfolioPipeline(buffer, generationContext, options)
}
