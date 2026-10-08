import { nanoid } from "nanoid"

import { getPortfolioSectionBlurb, getPortfolioSectionLabel, PORTFOLIO_SECTION_ORDER } from "@/config/portfolioSections"
import type { PortfolioDocument, PortfolioSection, PortfolioSectionType } from "@/types/dossier"

const id = (prefix: string) => `${prefix}-${nanoid(8)}`

/**
 * A new section with placeholder text that reads as an instruction, never as a fact about the person.
 */
export function createEmptySection(type: PortfolioSectionType): PortfolioSection {
  switch (type) {
    case "hero":
      return { id: id("hero"), type, data: { name: "Your name", title: "Your role", tagline: "One line about the work you do and who it helps." } }
    case "about":
      return { id: id("about"), type, data: { body: "A few sentences about you: what you do, who you do it for and what you care about." } }
    case "skills":
      return { id: id("skills"), type, data: { items: ["A skill", "A tool you use", "A method you know well"] } }
    case "experience":
      return {
        id: id("experience"),
        type,
        data: { items: [{ company: "Organisation", role: "Your role", duration: "Start – End", description: "What you did and what changed because of it." }] },
      }
    case "projects":
      return {
        id: id("projects"),
        type,
        data: { items: [{ name: "Project name", description: "What it is, your part in it and the result.", tech: [] }] },
      }
    case "contact":
      return { id: id("contact"), type, data: { email: "", phone: "", links: [], headline: "Get in touch" } }
    case "education":
      return {
        id: id("education"),
        type,
        data: { items: [{ institution: "School or university", degree: "Degree or qualification", period: "Years", details: "" }] },
      }
    case "highlights":
      return { id: id("highlights"), type, data: { items: [{ value: "Add a number", label: "What it measures, from your resume" }] } }
    case "certifications":
      return { id: id("certifications"), type, data: { items: [{ name: "Certificate or licence", issuer: "Issuing body", year: "Year" }] } }
  }
}

export type AddableSection = { type: PortfolioSectionType; label: string; description: string }

/** Section types the document does not have yet, in catalogue order (hero excluded). For the studio's add gallery. */
export function listAddableSections(document: PortfolioDocument | null | undefined): AddableSection[] {
  const present = new Set(document?.sections.map((s) => s.type) ?? [])
  return PORTFOLIO_SECTION_ORDER.filter((t) => t !== "hero" && !present.has(t)).map((type) => ({
    type,
    label: getPortfolioSectionLabel(type),
    description: getPortfolioSectionBlurb(type),
  }))
}
