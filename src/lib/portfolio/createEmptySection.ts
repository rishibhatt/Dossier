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
      return { id: id("contact"), type, data: { email: "", phone: "", links: [], headline: "Get in touch", showSocialInHero: true } }
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
    // Pictures and videos start empty: the page never shows a stand-in image, only the person's own work.
    case "gallery":
      return { id: id("gallery"), type, data: { items: [] } }
    case "showreel":
      return { id: id("showreel"), type, data: { items: [] } }
    case "credits":
      return { id: id("credits"), type, data: { items: [{ title: "Production name", role: "Your part", company: "Director, theatre or studio", year: "Year" }] } }
    case "services":
      return { id: id("services"), type, data: { items: [{ name: "What clients book you for", description: "Who it is for and what they get.", price: "" }] } }
    case "testimonials":
      return { id: id("testimonials"), type, data: { items: [{ quote: "Paste words a client or colleague wrote about you.", name: "Their name", role: "Their role or company" }] } }
    case "press":
      return { id: id("press"), type, data: { items: [{ title: "Headline of the feature", outlet: "Magazine or site", year: "Year", link: null }] } }
    case "publications":
      return { id: id("publications"), type, data: { items: [{ title: "Title of the paper or talk", outlet: "Journal, book or event", year: "Year", link: null }] } }
    case "practice":
      return { id: id("practice"), type, data: { name: "Clinic, chambers or studio name", address: "Street, area, city", hours: [], bookingUrl: "", mapUrl: "" } }
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
