import { Award, BarChart3, Briefcase, FolderOpen, GraduationCap, Info, Mail, User, Zap, type LucideIcon } from "lucide-react"

import type { PortfolioSection, PortfolioSectionType } from "@/types/dossier"

type Entry = { label: string; blurb: string; Icon: LucideIcon; unit: [string, string] }

/** Every section type the studio knows: name, one-line purpose, icon and the noun for its items. */
export const SECTION_CATALOG: Record<PortfolioSectionType, Entry> = {
  hero: { label: "Intro", blurb: "Your name, role and one line about you.", Icon: User, unit: ["line", "lines"] },
  about: { label: "About", blurb: "A short paragraph in your own words.", Icon: Info, unit: ["paragraph", "paragraphs"] },
  highlights: { label: "Highlights", blurb: "Numbers from your resume, each with what it measures.", Icon: BarChart3, unit: ["number", "numbers"] },
  experience: { label: "Experience", blurb: "Roles, dates and what you did in each.", Icon: Briefcase, unit: ["role", "roles"] },
  projects: { label: "Projects", blurb: "Work you shipped, with links and tools.", Icon: FolderOpen, unit: ["project", "projects"] },
  skills: { label: "Skills", blurb: "Tools and strengths, set as tags.", Icon: Zap, unit: ["skill", "skills"] },
  education: { label: "Education", blurb: "Schools, degrees and years.", Icon: GraduationCap, unit: ["entry", "entries"] },
  certifications: { label: "Certifications", blurb: "Licences and certificates with the issuer.", Icon: Award, unit: ["certificate", "certificates"] },
  contact: { label: "Contact", blurb: "Email, phone and links, at the end of the page.", Icon: Mail, unit: ["way", "ways"] },
}

export const ALL_SECTION_TYPES = Object.keys(SECTION_CATALOG) as PortfolioSectionType[]

export function sectionLabel(type: PortfolioSectionType): string {
  return SECTION_CATALOG[type]?.label ?? type
}

/** How many items a section holds, or null when it is a single block. */
export function sectionCount(section: PortfolioSection): number | null {
  switch (section.type) {
    case "hero":
    case "about":
      return null
    case "contact":
      return [section.data.email, section.data.phone, ...section.data.links].filter((v) => v?.trim()).length
    default:
      return section.data.items.length
  }
}

/** "4 roles", "1 skill", or "" for single blocks. */
export function countLabel(type: PortfolioSectionType, n: number | null | undefined): string {
  if (n == null) return ""
  const [one, many] = SECTION_CATALOG[type].unit
  return `${n} ${n === 1 ? one : many}`
}
