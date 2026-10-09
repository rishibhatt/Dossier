import type { ContentRichness, CareerStage, PersonalityTone, ProfessionCluster, SeniorityLevel } from "@/lib/parseResume"
import type {
  ComponentBadgeStyle,
  ComponentButtonStyle,
  ComponentCardStyle,
  ComponentDividerStyle,
  DesignCanvasBackgroundType,
  DesignDirectionId,
  HeroVariant,
  LayoutType,
  MotionPreset,
  NavStyle,
} from "@/types/resolvedDesignConfig"
import type { PortfolioSectionType } from "@/types/dossier"

export type TemplateTone = "calm" | "bold" | "playful" | "formal" | "techy" | "warm"
export type TemplateEmphasis = "projects" | "experience" | "education" | "credentials"

/** Public template card — what a picker UI needs. Extra fields are optional extras. */
export type DesignTemplate = {
  id: string
  name: string
  tagline: string
  bestFor: string[]
  tones: string[]
  mode: "light" | "dark"
  swatch: { bg: string; surface: string; text: string; accent: string }
  displayFont: string
  layout: LayoutType
  hero: HeroVariant
  /** Extras (safe to ignore). */
  bodyFont: string
  direction: DesignDirectionId
  /** Section order the template prefers (hero first). */
  order: PortfolioSectionType[]
}

export type DesignBrief = {
  category?: ProfessionCluster | string
  tone?: TemplateTone
  mode?: "light" | "dark"
  emphasis?: TemplateEmphasis
  /** Soft bias: template ids to nudge up (e.g. from the upload style preset). */
  prefer?: string[]
  /** Soft bias toward templates built on this design direction. */
  direction?: DesignDirectionId
}

export type PaletteInput = {
  bg: string
  bg2: string
  text: string
  muted: string
  primary: string
  accent: string
}

/** Exact variant ids from components/portfolio/sections/registry (VARIANT_IDS). */
export type SectionVariants = Record<Exclude<PortfolioSectionType, "hero">, string>

export type TemplateMatch = {
  /** Primary professions / pseudo-categories (student, executive, academic, switcher, freelance, sparse). */
  clusters: string[]
  secondary?: string[]
  seniority?: SeniorityLevel[]
  stage?: CareerStage[]
  personality?: PersonalityTone[]
  richness?: ContentRichness[]
  emphasis: TemplateEmphasis
  /** Leads with projects: penalised when resume has none. */
  projectLed?: boolean
  /** Looks thin when content is sparse (carousels, bento, mosaics). */
  needsRich?: boolean
  designy?: boolean
  /** Baseline so generic templates always rank for unknown resumes. */
  base?: number
}

export type TemplateSpec = {
  id: string
  name: string
  tagline: string
  bestFor: string[]
  tones: TemplateTone[]
  mode: "light" | "dark"
  layout: LayoutType
  direction: DesignDirectionId
  hero: HeroVariant
  /** Hero variant id (statement | banner | centered | split | card | terminal). */
  heroSection: string
  nav: NavStyle
  bgType: DesignCanvasBackgroundType
  order: PortfolioSectionType[]
  variants: SectionVariants
  components: {
    card: ComponentCardStyle
    button: ComponentButtonStyle
    badge: ComponentBadgeStyle
    divider: ComponentDividerStyle
  }
  motion: { preset: MotionPreset; stagger: number; y: number }
  fonts: {
    display: string
    body: string
    mono: string
    displayWeight: number
    headingWeight: number
    tracking: string
    leading: number
    label: string
  }
  /** Tailwind-ish radius token mapped by buildDesignTokens: rounded-none | rounded-lg | rounded-md(0.75rem) | rounded-2xl | rounded-3xl */
  radius: string
  density: "compact" | "normal" | "airy"
  glow: boolean
  heroTiers: (0 | 1 | 2)[]
  /** First palette is canonical; others are same-family alternates used by variationSeed. */
  palettes: PaletteInput[]
  match: TemplateMatch
}
