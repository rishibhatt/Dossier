/**
 * Reference-driven style directions for portfolio JSON, design brain, and JSX engine.
 * Keys map to the five choices in the upload flow modal.
 */
export const PORTFOLIO_STYLE_PRESETS = [
  "minimal_dev",
  "creative_dev",
  "designer",
  "editorial",
  "experimental",
] as const

export type PortfolioStylePreset = (typeof PORTFOLIO_STYLE_PRESETS)[number]

export const stylePrompts: Record<PortfolioStylePreset, string> = {
  minimal_dev: `
    Clean typography-first engineering portfolio.
    Large hero headline, restrained color, strong whitespace, mono or neo-grotesk feel.
    Inspired by modern senior developer sites — sharp hierarchy, almost no decoration.
    Avoid card clutter; prefer rails, timelines, and typographic rhythm.
  `,
  creative_dev: `
    Interactive developer portfolio: motion with purpose, layered depth, subtle gradients.
    Non-linear section rhythm, scroll-linked reveals, hover states that expose detail.
    Bold but disciplined color accents; avoid generic three-column icon grids.
  `,
  designer: `
    UI/UX craft portfolio: visual weight, case-study framing, generous imagery placeholders.
    Asymmetry, overlapping planes, gallery-like project presentation.
    Motion choreographed to storytelling — stagger, parallax hints, cursor-reactive hovers.
  `,
  editorial: `
    Magazine-grade editorial: oversized type, pull quotes, high-contrast spacing.
    Asymmetric grids, strong vertical rhythm, serif-leaning hierarchy where appropriate.
    Projects read like features, not thumbnails in a mall grid.
  `,
  experimental: `
    Awwwards-adjacent experimentation: unexpected breakpoints, split panels, kinetic type hints.
    Risk-taking layout (still readable), dramatic negative space, avant-garde motion curves.
    Explicitly reject templated SaaS landing tropes.
  `,
}

export const PROJECTS_LAYOUT_CONSTRAINTS = `
Projects section MUST follow ONE of these archetypes (never a basic dense card grid):
- Full-width row with hover reveal (image/title/description layers swapping opacity or height)
- Image-forward cards with gradient or scrim overlay and text sliding up on hover
- Horizontal scroll gallery (snap, peek of next item, editorial captions)
- Split layout: dominant typographic column + preview / media column

FORBIDDEN for projects:
- Uniform small cards in grid-cols-3 with only scale hover
- Icon + title + three bullets repeated tiles
`

export const INTERACTION_QUALITY_RULES = `
Interaction quality bar:
- Hover must reveal NEW information (description, tech list, secondary image, or meta) — not only scale or shadow.
- Prefer opacity/mask/clip/height transitions combined with motion.div whileHover or layout.
- At least one scroll- or view-based motion (whileInView / staggerChildren) on section groups where it fits.
`

/** Curator narrative for the selected preset only (no structural duplicates). */
export function getStylePromptBlock(preset: PortfolioStylePreset): string {
  return stylePrompts[preset].trim()
}

/** Shared structural rules — append once per LLM call (portfolio JSON, design brain, JSX). */
export function getGenerationConstraintBlock(): string {
  return [PROJECTS_LAYOUT_CONSTRAINTS, INTERACTION_QUALITY_RULES].join("\n\n")
}

export const PORTFOLIO_STYLE_LABELS: Record<PortfolioStylePreset, string> = {
  minimal_dev: "Minimal Developer",
  creative_dev: "Creative Developer",
  designer: "UI/UX Designer",
  editorial: "Premium Editorial",
  experimental: "Experimental",
}
