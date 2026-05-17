import type { PortfolioDocument, PortfolioProfileKind, ProjectEntry, StructuredResume } from "@/types/dossier"
import { findSectionByType } from "@/lib/portfolio/findSection"

export type PortfolioProfileInference = {
  type: PortfolioProfileKind
  tone: string
  emphasis: string[]
}

const DEV_SIGNALS = /\b(react|node|typescript|javascript|python|java|go|rust|kubernetes|docker|aws|api|graphql|sql|git|frontend|backend|full[\s-]?stack|engineer|developer|devops|sre|\.net|rails|spring)\b/i
const DESIGN_SIGNALS = /\b(figma|sketch|ui|ux|user experience|visual design|brand|illustration|photoshop|illustrator|indesign|creative director|graphic|motion|typography|design system)\b/i
const PRODUCT_SIGNALS = /\b(product manager|product owner|pm\b|roadmap|stakeholder|okr|discovery|prd|go[\s-]?to[\s-]?market|growth|analytics|a\/b|strategy)\b/i
const STUDENT_SIGNALS = /\b(student|intern|graduate|university|college|bachelor|master'?s|msc|bsc|fresh graduate|campus|thesis)\b/i

function normalizeSkill(s: string) {
  return s.trim().toLowerCase()
}

function scoreDeveloper(skills: string[], title: string, projects: ProjectEntry[]) {
  let s = 0
  const blob = [title, ...skills, ...projects.flatMap((p) => [p.name, p.description, ...p.tech])]
    .join(" ")
    .toLowerCase()
  for (const part of skills.map(normalizeSkill)) {
    if (DEV_SIGNALS.test(part)) s += 2
  }
  if (DEV_SIGNALS.test(blob)) s += 3
  for (const p of projects) {
    if (p.tech.some((t) => DEV_SIGNALS.test(t))) s += 2
  }
  return s
}

function scoreDesigner(skills: string[], title: string, projects: ProjectEntry[]) {
  let s = 0
  const blob = [title, ...skills, ...projects.flatMap((p) => [p.name, p.description])].join(" ").toLowerCase()
  for (const part of skills.map(normalizeSkill)) {
    if (DESIGN_SIGNALS.test(part)) s += 2
  }
  if (DESIGN_SIGNALS.test(blob)) s += 3
  return s
}

function scoreProduct(skills: string[], title: string, projects: ProjectEntry[]) {
  let s = 0
  const blob = [title, ...skills, ...projects.map((p) => p.description)].join(" ")
  if (PRODUCT_SIGNALS.test(blob)) s += 4
  if (PRODUCT_SIGNALS.test(title)) s += 2
  return s
}

function scoreStudent(skills: string[], title: string, projects: ProjectEntry[]) {
  const blob = [title, ...projects.map((p) => p.name)].join(" ")
  if (STUDENT_SIGNALS.test(blob)) return 6
  if (projects.length <= 1 && skills.length <= 6 && title.length < 60) return 1
  return 0
}

function defaultEmphasis(kind: PortfolioProfileKind): string[] {
  switch (kind) {
    case "developer":
      return ["systems", "craft", "clarity"]
    case "designer":
      return ["visual narrative", "taste", "motion"]
    case "product":
      return ["outcomes", "users", "strategy"]
    case "student":
      return ["learning", "potential", "curiosity"]
    default:
      return ["balance", "clarity", "presence"]
  }
}

function defaultTone(kind: PortfolioProfileKind): string {
  switch (kind) {
    case "developer":
      return "precise and understated"
    case "designer":
      return "bold and expressive"
    case "product":
      return "clear and narrative"
    case "student":
      return "friendly and optimistic"
    default:
      return "confident and approachable"
  }
}

/**
 * Heuristic profile classification from resume extraction output (no model call).
 */
export function inferPortfolioProfileFromStructured(structured: StructuredResume): PortfolioProfileInference {
  const skills = structured.skills ?? []
  const title = structured.title ?? ""
  const projects = structured.projects ?? []

  const scores: Record<PortfolioProfileKind, number> = {
    developer: scoreDeveloper(skills, title, projects),
    designer: scoreDesigner(skills, title, projects),
    product: scoreProduct(skills, title, projects),
    student: scoreStudent(skills, title, projects),
    general: 0,
  }

  const order: Exclude<PortfolioProfileKind, "general">[] = ["developer", "designer", "product", "student"]
  let type: PortfolioProfileKind = "general"
  let best = 0
  for (const k of order) {
    const s = scores[k]
    if (s > best) {
      best = s
      type = k
    }
  }
  if (best < 2) type = "general"

  return {
    type,
    tone: defaultTone(type),
    emphasis: defaultEmphasis(type),
  }
}

/**
 * Infer profile when only the portfolio document is available (e.g. client hydration).
 */
export function inferPortfolioProfileFromDocument(document: PortfolioDocument): PortfolioProfileInference {
  const hero = findSectionByType(document.sections, "hero")
  const skillsSection = findSectionByType(document.sections, "skills")
  const projectsSection = findSectionByType(document.sections, "projects")

  const title = hero?.type === "hero" ? `${hero.data.title} ${hero.data.tagline}` : document.meta.title
  const skills = skillsSection?.type === "skills" ? skillsSection.data.items : []
  const projects = projectsSection?.type === "projects" ? projectsSection.data.items : []

  const pseudo: StructuredResume = {
    name: hero?.type === "hero" ? hero.data.name : "Portfolio",
    title,
    summary: document.meta.description,
    skills,
    experience: [],
    projects,
    education: [],
    contact: { email: "", phone: "", links: [] },
  }

  return inferPortfolioProfileFromStructured(pseudo)
}

/** @alias Heuristic profile classification (skills, title, projects). */
export const inferPortfolioType = inferPortfolioProfileFromStructured

export function isPortfolioProfileKind(v: string | undefined): v is PortfolioProfileKind {
  return (
    v === "developer" ||
    v === "designer" ||
    v === "product" ||
    v === "student" ||
    v === "general"
  )
}
