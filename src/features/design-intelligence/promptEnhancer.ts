import type { ColorSpec, LayoutSpec, MotionSpec, TypographySpec } from "@/types/design"

import type { ParsedDesignIntent } from "@/features/design-intelligence/intentParser"

export type EnhancerInput = {
  rawUserPrompt: string
  parsed: ParsedDesignIntent
  layout: LayoutSpec
  color: ColorSpec
  typography: TypographySpec
  motion: MotionSpec
}

/**
 * Converts vague user language + structured systems into a single authoritative LLM brief.
 * Downstream models must treat this as the source of truth (not the raw prompt).
 */
export function enhanceDesignPrompt(input: EnhancerInput): string {
  const { rawUserPrompt, parsed, layout, color, typography, motion } = input

  const lines: string[] = [
    "You are generating a premium portfolio section. Follow this design intelligence brief exactly.",
    "",
    "## Visual direction",
    `- Intelligence style: ${parsed.inferredStyle}`,
    `- Layout strategy: ${layout.strategy}; asymmetry bias: ${layout.asymmetryBias}`,
    layout.hero
      ? `- Hero target: ~${layout.hero.minHeightVh}vh minimum height; emphasis: ${layout.hero.emphasis}`
      : "",
    layout.timeline
      ? `- Timeline: ${layout.timeline.alignment} alignment; connectors: ${layout.timeline.connectors}`
      : "",
    layout.projectsPresentation
      ? `- Projects presentation: ${layout.projectsPresentation} (avoid small uniform card grids)`
      : "",
    "",
    "## Color tokens (map to Tailwind-like palette / arbitrary values where needed)",
    `- Background: ${color.background}`,
    `- Foreground: ${color.foreground}`,
    `- Accent: ${color.accent}`,
    `- Muted: ${color.muted}`,
    `- Card: ${color.card}`,
    `- Border: ${color.border}`,
    color.gradient ? `- Gradient suggestion: ${color.gradient}` : "",
    `- Contrast: ${color.contrastNotes.join(" | ")}`,
    "",
    "## Typography",
    `- Heading stack: ${typography.fontFamily.heading}`,
    `- Body stack: ${typography.fontFamily.body}`,
    `- Heading scale (fluid): ${typography.headingScale}`,
    `- Body scale (fluid): ${typography.bodyScale}`,
    `- Tracking heading/body: ${typography.tracking.heading} / ${typography.tracking.body}`,
    `- Line heights: ${typography.lineHeight.heading} / ${typography.lineHeight.body}`,
    "",
    "## Motion system",
    `- Primary motion type: ${motion.type}`,
    `- Duration: ${motion.duration}s; easing: ${motion.easing}`,
    `- Extras: ${motion.extras.join(", ")}`,
    `- Scroll-linked: ${Boolean(motion.scrollLinked)}; stagger: ${Boolean(motion.stagger)}; parallax: ${Boolean(motion.parallax)}; line draw: ${Boolean(motion.lineDraw)}`,
    "",
    "## Interaction rules (mandatory)",
    "- At least one hover interaction must reveal new information (text, meta, secondary layer), not only scale.",
    "- Prefer whileInView / stagger for grouped elements when scroll-linked motion is enabled.",
    "- Strong typographic hierarchy: oversized hero headline where section is hero.",
    "- Intentional whitespace; avoid cramped card stacks.",
    "",
    "## Original user wording (context only — do not mirror vagueness)",
    `"${rawUserPrompt.trim().slice(0, 400)}"`,
  ]

  return lines.filter(Boolean).join("\n")
}
