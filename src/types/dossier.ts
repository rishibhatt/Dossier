export type ExperienceEntry = {
  company: string
  role: string
  duration: string
  description: string
  /** Individual resume bullets, kept separate so templates can list them. `description` stays as the joined fallback. */
  highlights?: string[]
  location?: string
}

export type ProjectEntry = {
  name: string
  description: string
  tech: string[]
  /** Optional cover image — enables bento / spotlight layouts when any project has one */
  imageUrl?: string | null
  /** Live site, repo or case study found next to the project in the resume. */
  link?: string | null
}

export type EducationEntry = {
  institution: string
  degree: string
  period: string
  details: string
}

/** Heuristic extraction output — consumed by AI layer. */
export type StructuredResume = {
  name: string
  title: string
  summary: string
  skills: string[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  education: EducationEntry[]
  contact: {
    email: string
    phone: string
    links: string[]
  }
}

export type PortfolioHeroSection = {
  id: string
  type: "hero"
  data: {
    name: string
    title: string
    tagline: string
    /** Optional hero / portrait image — enables split-media layouts when set */
    imageUrl?: string | null
  }
}

export type PortfolioAboutSection = {
  id: string
  type: "about"
  data: {
    body: string
  }
}

export type PortfolioSkillsSection = {
  id: string
  type: "skills"
  data: {
    items: string[]
  }
}

export type PortfolioExperienceSection = {
  id: string
  type: "experience"
  data: {
    items: ExperienceEntry[]
  }
}

export type PortfolioProjectsSection = {
  id: string
  type: "projects"
  data: {
    items: ProjectEntry[]
  }
}

export type PortfolioContactSection = {
  id: string
  type: "contact"
  data: {
    email: string
    phone: string
    links: string[]
    headline?: string
    location?: string
  }
}

export type PortfolioEducationSection = {
  id: string
  type: "education"
  data: {
    items: EducationEntry[]
  }
}

/** A number from the resume and what it measures, e.g. { value: "14", label: "clients closed each month" }. Never invented. */
export type HighlightEntry = { value: string; label: string }

export type PortfolioHighlightsSection = {
  id: string
  type: "highlights"
  data: {
    items: HighlightEntry[]
  }
}

export type CertificationEntry = { name: string; issuer: string; year: string }

export type PortfolioCertificationsSection = {
  id: string
  type: "certifications"
  data: {
    items: CertificationEntry[]
  }
}

export type PortfolioSection =
  | PortfolioHeroSection
  | PortfolioAboutSection
  | PortfolioSkillsSection
  | PortfolioExperienceSection
  | PortfolioProjectsSection
  | PortfolioContactSection
  | PortfolioEducationSection
  | PortfolioHighlightsSection
  | PortfolioCertificationsSection

export type PortfolioSectionType = PortfolioSection["type"]

/** Inferred or AI-provided design profile for the portfolio design engine. */
export type PortfolioProfileKind = "developer" | "designer" | "product" | "student" | "general"

export type PortfolioMeta = {
  type: PortfolioProfileKind
  tone: string
  emphasis: string[]
}

export type PortfolioDocument = {
  meta: {
    title: string
    description: string
  }
  /** Design intelligence — optional in raw JSON; always normalized after parse. */
  portfolioMeta?: PortfolioMeta
  sections: PortfolioSection[]
}
