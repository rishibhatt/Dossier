import type { ProfessionGroup } from "@/lib/portfolio/professions"

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
    /** Icon row of web links under the hero name. Missing (older documents) means on; false hides it. */
    /** Hero icon row. Missing = off (sites made before the row existed); new Contact sections set it to true. */
    showSocialInHero?: boolean
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

/** `number`: registration or licence number (doctors, CAs, lawyers). Optional; older documents never have it. */
export type CertificationEntry = { name: string; issuer: string; year: string; number?: string }

export type PortfolioCertificationsSection = {
  id: string
  type: "certifications"
  data: {
    items: CertificationEntry[]
  }
}

/** One picture of the work, by link or small upload. `beforeUrl` pairs it with a "before" shot for the compare layout. */
export type GalleryEntry = { imageUrl: string; caption: string; link?: string | null; beforeUrl?: string | null }

export type PortfolioGallerySection = { id: string; type: "gallery"; data: { items: GalleryEntry[] } }

/** A YouTube or Vimeo link, embedded; any other link shows as a titled card. */
export type ShowreelEntry = { videoUrl: string; title: string; note: string }

export type PortfolioShowreelSection = { id: string; type: "showreel"; data: { items: ShowreelEntry[] } }

/** Stage and screen credits: the production, the part played, who made it, when. */
export type CreditEntry = { title: string; role: string; company: string; year: string }

export type PortfolioCreditsSection = { id: string; type: "credits"; data: { items: CreditEntry[] } }

export type ServiceEntry = { name: string; description: string; price: string }

export type PortfolioServicesSection = { id: string; type: "services"; data: { items: ServiceEntry[] } }

/** Real words from a real client or colleague. Never generated. */
export type TestimonialEntry = { quote: string; name: string; role: string }

export type PortfolioTestimonialsSection = { id: string; type: "testimonials"; data: { items: TestimonialEntry[] } }

/** A feature, interview, paper or talk: where it appeared, its title, when, and a link. Shared by press and publications. */
export type MentionEntry = { title: string; outlet: string; year: string; link?: string | null }

export type PortfolioPressSection = { id: string; type: "press"; data: { items: MentionEntry[] } }

export type PortfolioPublicationsSection = { id: string; type: "publications"; data: { items: MentionEntry[] } }

/** Where and when clients can see the person: clinic, chambers, studio. */
export type PortfolioPracticeSection = {
  id: string
  type: "practice"
  data: { name: string; address: string; hours: string[]; bookingUrl: string; mapUrl: string }
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
  | PortfolioGallerySection
  | PortfolioShowreelSection
  | PortfolioCreditsSection
  | PortfolioServicesSection
  | PortfolioTestimonialsSection
  | PortfolioPressSection
  | PortfolioPublicationsSection
  | PortfolioPracticeSection

export type PortfolioSectionType = PortfolioSection["type"]

/** Inferred or AI-provided design profile for the portfolio design engine. */
export type PortfolioProfileKind = "developer" | "designer" | "product" | "student" | "general"

export type PortfolioMeta = {
  type: PortfolioProfileKind
  tone: string
  emphasis: string[]
  /** Profession id from lib/portfolio/professions.ts. Missing in documents made before professions existed. */
  profession?: string
  /** How the page shows work: visual | performer | licensed | builder. Derived from `type` when missing. */
  group?: ProfessionGroup
  /** The build could not tell the profession: the studio asks the person once. Cleared when they answer. */
  professionAsk?: boolean
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
