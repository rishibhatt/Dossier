import { buildDesignConfig } from "@/lib/designEngine"
import { portfolioDocumentToParsedResume, suggestDesignDirection } from "@/lib/parseResume"
import type { DesignConfig, DesignUserType } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

function isResolvedDesign(c: unknown): c is DesignConfig {
  return (
    typeof c === "object" &&
    c !== null &&
    "tokens" in c &&
    "meta" in c &&
    typeof (c as DesignConfig).tokens?.colors?.bg === "string"
  )
}

/**
 * If the model returned a valid resolved config, use it; otherwise build deterministically
 * from portfolio content + inferred signals.
 */
export function mergeDesignWithPattern(
  brain: DesignConfig | null,
  userType: DesignUserType,
  document: PortfolioDocument
): DesignConfig {
  if (isResolvedDesign(brain)) return brain
  const parsed = portfolioDocumentToParsedResume(document, userType)
  return buildDesignConfig(parsed, suggestDesignDirection(parsed.signals), 0)
}
