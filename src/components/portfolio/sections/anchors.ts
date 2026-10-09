import type { PortfolioDocument, PortfolioSection, PortfolioSectionType } from "@/types/dossier"

/** First section of a type keeps the stable `portfolio-section-<type>` id; later duplicates use their own id. */
export function anchorFor(section: PortfolioSection, doc: PortfolioDocument): string {
  const first = doc.sections.find((s) => s.type === section.type)
  return first?.id === section.id ? `portfolio-section-${section.type}` : `portfolio-section-${section.id}`
}

export function firstOfType<K extends PortfolioSectionType>(doc: PortfolioDocument, type: K) {
  return doc.sections.find((s): s is Extract<PortfolioSection, { type: K }> => s.type === type)
}
