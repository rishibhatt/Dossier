import { messages } from "@/config/messages"
import type { PortfolioSectionType } from "@/types/dossier"

/**
 * Section catalogue: default order, headings, nav labels and the add-section gallery copy.
 * Add a row here (plus a module in components/portfolio/sections) to register a new section type.
 */
export const sectionConfig = [
  { type: "hero" as const, label: messages.dossier.sectionHero, nav: "Top", blurb: "Your name, role and one line about your work." },
  { type: "highlights" as const, label: "Highlights", nav: "Highlights", blurb: "A few real numbers from your work, each with what it measures." },
  { type: "about" as const, label: messages.dossier.sectionAbout, nav: "About", blurb: "A short introduction in your own words." },
  { type: "education" as const, label: "Education", nav: "Education", blurb: "Degrees, courses and qualifications." },
  { type: "projects" as const, label: messages.dossier.sectionProjects, nav: "Work", blurb: "Things you made, led or shipped, with links." },
  { type: "experience" as const, label: messages.dossier.sectionExperience, nav: "Experience", blurb: "Roles, dates and what changed because of you." },
  { type: "skills" as const, label: messages.dossier.sectionSkills, nav: "Skills", blurb: "Tools, methods and strengths." },
  { type: "certifications" as const, label: "Certifications", nav: "Certifications", blurb: "Licences and certificates with issuer and year." },
  { type: "contact" as const, label: messages.dossier.sectionContact, nav: "Contact", blurb: "Email, phone, location and profile links." },
] as const satisfies readonly { type: PortfolioSectionType; label: string; nav: string; blurb: string }[]

export const PORTFOLIO_SECTION_ORDER: readonly PortfolioSectionType[] = sectionConfig.map((s) => s.type)

const byType = Object.fromEntries(sectionConfig.map((s) => [s.type, s])) as Record<
  PortfolioSectionType,
  (typeof sectionConfig)[number]
>

export function getPortfolioSectionLabel(type: PortfolioSectionType): string {
  return byType[type]?.label ?? type
}

export function getPortfolioNavLabel(type: PortfolioSectionType): string {
  return byType[type]?.nav ?? getPortfolioSectionLabel(type)
}

export function getPortfolioSectionBlurb(type: PortfolioSectionType): string {
  return byType[type]?.blurb ?? ""
}
