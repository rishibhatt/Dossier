/**
 * Structured contract for the Design Intelligence Engine → JSX / composer consumers.
 * Raw user prompts are never passed to generation; they are parsed into this spec first.
 */

export type DesignIntelligenceStyle = "minimal" | "creative" | "editorial" | "experimental" | "corporate"

export type TimelineAlignment = "left" | "right" | "alternating"

export type TimelineConnectors = "line" | "animated-line" | "dots"

export interface LayoutSpec {
  strategy: "hero-fullscreen" | "split-hero" | "vertical-timeline" | "horizontal-scroll" | "showcase" | "asymmetric-split"
  hero?: { minHeightVh: number; emphasis: "typography" | "media" | "balanced" }
  timeline?: { alignment: TimelineAlignment; connectors: TimelineConnectors }
  /** How non-hero sections should avoid repetitive grids */
  projectsPresentation?: "showcase" | "horizontal-scroll" | "hover-reveal" | "split-media"
  asymmetryBias: "low" | "medium" | "high"
}

export interface ColorSpec {
  background: string
  foreground: string
  accent: string
  muted: string
  /** Optional CSS gradient (linear / radial / layered) */
  gradient?: string
  card: string
  border: string
  /** Human-readable contrast / usage notes for the LLM */
  contrastNotes: string[]
}

export interface TypographySpec {
  fontFamily: { heading: string; body: string }
  /** CSS values, often clamp() */
  headingScale: string
  bodyScale: string
  tracking: { heading: string; body: string }
  lineHeight: { heading: string; body: string }
}

export interface MotionSpec {
  type: string
  duration: number
  easing: string
  extras: string[]
  scrollLinked?: boolean
  lineDraw?: boolean
  stagger?: boolean
  parallax?: boolean
}

export interface DesignSpec {
  style: DesignIntelligenceStyle
  layout: LayoutSpec
  color: ColorSpec
  typography: TypographySpec
  motion: MotionSpec
  /** Section identifiers this spec optimizes for (max 4–5 recommended) */
  sections: string[]
  interactionRules: string[]
  constraints: string[]
  /**
   * Curated multi-paragraph brief for downstream LLM (JSX). Replaces raw user text.
   */
  enrichedPrompt: string
}
