import { buildDesignConfig, mapPresetToDesignDirection } from "@/lib/designEngine"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { portfolioDocumentToParsedResume, suggestDesignDirection } from "@/lib/parseResume"
import type { DesignConfig, DesignUserType } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

/**
 * Resolved design system — deterministic concrete tokens (no abstract LLM labels).
 * Style preset maps to a mood vector; variationSeed drives structural diversity
 * (hero scale tier, section variants, carousel vs bento, generative placeholders).
 */
export async function generateDesignSystem(
  portfolioData: PortfolioDocument,
  userType: DesignUserType,
  ctx?: PortfolioGenerationContext
): Promise<DesignConfig> {
  const parsed = portfolioDocumentToParsedResume(portfolioData, userType)
  const fromPreset =
    ctx?.portfolioStylePreset != null ? mapPresetToDesignDirection(ctx.portfolioStylePreset) : null
  const direction = fromPreset ?? suggestDesignDirection(parsed.signals)
  const seed = ctx?.variationSeed ?? 0
  return buildDesignConfig(parsed, direction, seed)
}
