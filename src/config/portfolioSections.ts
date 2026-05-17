import { messages } from "@/config/messages"
import type { PortfolioSectionType } from "@/types/dossier"

/**
 * Declarative section order and keys. Add a row here to register a new section type in the renderer.
 */
export const sectionConfig = [
  { type: "hero" as const },
  { type: "about" as const },
  { type: "skills" as const },
  { type: "projects" as const },
  { type: "experience" as const },
  { type: "contact" as const },
] as const satisfies readonly { type: PortfolioSectionType }[]

export const PORTFOLIO_SECTION_ORDER: readonly PortfolioSectionType[] = sectionConfig.map((s) => s.type)

const labels: Record<PortfolioSectionType, string> = {
  hero: messages.dossier.sectionHero,
  about: messages.dossier.sectionAbout,
  skills: messages.dossier.sectionSkills,
  experience: messages.dossier.sectionExperience,
  projects: messages.dossier.sectionProjects,
  contact: messages.dossier.sectionContact,
}

export function getPortfolioSectionLabel(type: PortfolioSectionType): string {
  return labels[type]
}
