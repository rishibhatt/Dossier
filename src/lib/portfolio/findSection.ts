import type { PortfolioSection, PortfolioSectionType } from "@/types/dossier"

export function findSectionByType(
  sections: readonly PortfolioSection[],
  type: PortfolioSectionType
): PortfolioSection | undefined {
  return sections.find((s) => s.type === type)
}
