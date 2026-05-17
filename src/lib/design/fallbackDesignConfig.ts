import { mergeDesignWithPattern } from "@/lib/design/mergeDesignConfig"
import type { DesignConfig, DesignUserType } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

/** Deterministic design config when the model is unavailable or invalid. */
export function buildFallbackDesignConfig(
  userType: DesignUserType,
  document: PortfolioDocument
): DesignConfig {
  return mergeDesignWithPattern(null, userType, document)
}
