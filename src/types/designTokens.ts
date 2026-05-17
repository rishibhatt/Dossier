/**
 * Full design token contract for the portfolio canvas (injected as CSS variables).
 * Derived from DesignConfig + preview theme + variation seed — not persisted as JSON from Groq.
 */

export type PortfolioMotionProfile = "minimal" | "smooth" | "experimental"

export type DesignTokens = {
  colors: {
    background: string
    elevated: string
    foreground: string
    muted: string
    accent: string
    accentSoft: string
    border: string
    /** Mesh / hero wash */
    gradientMesh: string
    /** Linear accent strip */
    gradientAccent: string
  }
  typography: {
    fontHeading: string
    /** Display / body families from resolved design engine */
    fontBody: string
    displaySize: string
    headingLgSize: string
    bodySize: string
    lineHeight: string
  }
  space: {
    padX: string
    padY: string
    stack: string
    sectionGap: string
  }
  effects: {
    blurGlass: string
    glowAccent: string
    shadowElevated: string
    radiusLg: string
    radiusXl: string
  }
  motion: {
    staggerMs: number
    revealDistance: number
    parallaxFactor: number
  }
}
