import { applyNlDesignHints } from "@/lib/design/applyNlDesignHints"
import { inferUserType } from "@/lib/design/inferType"
import { mergeDesignWithPattern } from "@/lib/design/mergeDesignConfig"
import { backgroundTypeForDirection, buildDesignConfig } from "@/lib/designEngine"
import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

/**
 * Applies NL-driven heuristics to the resolved design config (deterministic).
 * Falls back to a fresh deterministic build when the request implies a new mood direction.
 */
export async function refineDesignFromPrompt(input: {
  portfolioData: PortfolioDocument
  designConfig: DesignConfig
  message: string
}): Promise<DesignConfig> {
  const userType = inferUserType(input.portfolioData)
  const msg = input.message.toLowerCase()

  let cfg = applyNlDesignHints(input.designConfig, input.message)

  let direction: DesignDirectionId = cfg.meta.direction
  if (/(brutal|grid|raw)/i.test(msg)) direction = "BRUTALIST_GRID"
  else if (/(editorial|serif|magazine)/i.test(msg)) direction = "EDITORIAL_MONO"
  else if (/(neon|glow|dark tech|cyber)/i.test(msg)) direction = "LUMINOUS_DARK"
  else if (/(gradient|fluid|organic)/i.test(msg)) direction = "ORGANIC_GRADIENT"
  else if (/(corporate|navy|boardroom)/i.test(msg)) direction = "LIQUID_ENTERPRISE"
  else if (/(chaos|bold color|experimental)/i.test(msg)) direction = "CHROMATIC_CHAOS"

  if (direction !== cfg.meta.direction) {
    const parsed = portfolioDocumentToParsedResume(input.portfolioData, userType)
    let next = buildDesignConfig(parsed, direction, cfg.meta.variationSeed + 17)
    next = applyNlDesignHints(next, input.message)
    return next
  }

  cfg.layout.backgroundType = backgroundTypeForDirection(cfg.meta.direction)
  return mergeDesignWithPattern(cfg, userType, input.portfolioData)
}
