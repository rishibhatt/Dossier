/**
 * Resolved design system (Phases 2–4) — concrete tokens only, no abstract style enums.
 */

import type { PortfolioSectionType } from "@/types/dossier"

export type DesignDirectionId =
  | "EDITORIAL_MONO"
  | "LUMINOUS_DARK"
  | "ORGANIC_GRADIENT"
  | "BRUTALIST_GRID"
  | "LIQUID_ENTERPRISE"
  | "CHROMATIC_CHAOS"

/** Framer Motion-compatible variant bag (serializable). */
export type MotionVariantJson = {
  initial: Record<string, number | string>
  animate: Record<string, number | string>
  transition: Record<string, number | number[] | string>
}

export type DesignConfigMeta = {
  direction: DesignDirectionId
  profession: string
  variationSeed: number
  generatedAt: string
}

export type DesignGradientTokens = {
  hero: string
  surface: string
  text: string
  border: string
  mesh: string
}

export type DesignColorTokens = {
  bg: string
  bgSecondary: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
  primary: string
  accent: string
  gradients: DesignGradientTokens
}

export type DesignTypographyScale = {
  hero: string
  h1: string
  h2: string
  h3: string
  body: string
  small: string
  mono: string
}

export type DesignTypographyTokens = {
  displayFont: string
  bodyFont: string
  monoFont: string
  scale: DesignTypographyScale
  weights: {
    display: number
    heading: number
    body: number
  }
  letterSpacing: {
    display: string
    heading: string
    body: string
    label: string
  }
  lineHeight: {
    display: number
    body: number
  }
}

export type DesignSpacingTokens = {
  sectionPadding: string
  containerMax: string
  cardPadding: string
  gap: string
}

export type DesignEffectsTokens = {
  cardBlur: string
  glowColor: string
  glowSize: string
  noiseOpacity: number
  borderRadius: string
  borderStyle: string
}

export type DesignTokenBundle = {
  colors: DesignColorTokens
  typography: DesignTypographyTokens
  spacing: DesignSpacingTokens
  effects: DesignEffectsTokens
}

export type LayoutType = "single-column" | "split-fixed" | "asymmetric" | "magazine" | "bento"

/** Canvas ambient background — mapped from design direction in `buildDesignConfig`. */
export type DesignCanvasBackgroundType =
  | "CLEAN_DARK"
  | "GRADIENT_MESH"
  | "EDITORIAL_FLAT"
  | "BRUTALIST_RAW"
  | "ENTERPRISE_GRADIENT"

export type HeroVariant =
  | "fullscreen-center"
  | "split-left"
  | "terminal"
  | "editorial"
  | "kinetic"

export type NavStyle = "floating-pill" | "full-width-bar" | "side-rail" | "none"

export type DesignLayoutBlock = {
  type: LayoutType
  heroVariant: HeroVariant
  navStyle: NavStyle
  sectionOrder: PortfolioSectionType[]
  gridSystem: string
  /** Ambient canvas treatment (clean dark, mesh, flat, grid, enterprise). */
  backgroundType?: DesignCanvasBackgroundType
}

export type MotionPreset = "fade-up" | "slide-reveal" | "stagger-grid" | "magnetic" | "parallax"

export type DesignMotionBlock = {
  preset: MotionPreset
  heroAnimation: MotionVariantJson
  cardAnimation: MotionVariantJson
  textAnimation: MotionVariantJson
  transitionEase: number[]
  staggerDelay: number
}

export type ComponentCardStyle = "glass" | "bordered" | "solid" | "flat" | "brutalist"
export type ComponentButtonStyle = "gradient-fill" | "outline-glow" | "solid" | "text-arrow" | "brutalist"
export type ComponentBadgeStyle = "pill-glass" | "square-mono" | "dot-prefix" | "outlined"
export type ComponentDividerStyle = "gradient-line" | "none" | "thick-ruled" | "dot-pattern"
export type ComponentCursorStyle = "default" | "custom-dot" | "magnetic"
export type ComponentScrollIndicator = "arrow" | "progress-line" | "none"

export type DesignComponentsBlock = {
  card: ComponentCardStyle
  button: ComponentButtonStyle
  badge: ComponentBadgeStyle
  divider: ComponentDividerStyle
  cursor: ComponentCursorStyle
  scrollIndicator: ComponentScrollIndicator
}

export type ProfessionSpecifics = {
  primaryCTA: string
  projectCardStyle: string
  socialLinks: string[]
  metricHighlights: boolean
}

/** Section variant plan — mirrors legacy `DesignSectionPlan` for rendering. */
export type DesignSectionPlan = {
  type: PortfolioSectionType
  variant: string
}

/**
 * Fully resolved portfolio design configuration (Phases 2–4).
 * `sections` is denormalized for the composer; `layout.sectionOrder` is source of truth.
 */
export type DesignConfig = {
  meta: DesignConfigMeta
  tokens: DesignTokenBundle
  layout: DesignLayoutBlock
  motion: DesignMotionBlock
  components: DesignComponentsBlock
  profession_specifics: ProfessionSpecifics
  /** Plans aligned with document sections (same order as layout flow). */
  sections: DesignSectionPlan[]
}

/** Legacy layout keys for shell components (derived from `layout.type`). */
export type DesignLayoutKey = "sidebar" | "centered" | "asymmetric"

export type DesignUserType = "developer" | "designer" | "product" | "student" | "general"
