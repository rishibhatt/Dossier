import { inferPortfolioProfileFromDocument } from "@/lib/ai/inferPortfolioType"
import type { DesignUserType } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

/**
 * Maps portfolio inference to the four design-brain user types.
 */
export function inferUserType(portfolioData: PortfolioDocument): DesignUserType {
  const inferred = inferPortfolioProfileFromDocument(portfolioData)
  const t = portfolioData.portfolioMeta?.type ?? inferred.type

  if (t === "developer" || t === "designer" || t === "product" || t === "student") {
    return t
  }

  return "product"
}
