import type { MotionSpec } from "@/types/design"
import type { ParsedDesignIntent } from "@/features/design-intelligence/intentParser"

const DEFAULT_MOTION: MotionSpec = {
  type: "fade-reveal",
  duration: 0.45,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  extras: ["whileInView-once", "subtle-y-offset"],
  scrollLinked: true,
  stagger: false,
  parallax: false,
}

/**
 * Maps parsed intent (keywords / hints) into a concrete motion system for specs + LLM briefs.
 */
export function getMotionSystem(parsed: ParsedDesignIntent): MotionSpec {
  const k = parsed.keywords

  if (k.has("timeline") || k.has("scroll")) {
    return {
      type: "scroll-linked-stagger",
      duration: 0.65,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      extras: ["line-draw", "stagger-children", "whileInView"],
      scrollLinked: true,
      lineDraw: true,
      stagger: true,
      parallax: false,
    }
  }

  if (k.has("cool") || k.has("bold") || k.has("dynamic")) {
    return {
      type: "stagger-reveal",
      duration: 0.6,
      easing: "easeOut",
      extras: ["hover-lift", "fade-in", "layout-id-hint"],
      scrollLinked: true,
      stagger: true,
      parallax: k.has("parallax"),
    }
  }

  if (k.has("subtle") || k.has("calm") || parsed.inferredStyle === "minimal") {
    return {
      type: "soft-opacity",
      duration: 0.4,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      extras: ["whileInView-once"],
      scrollLinked: true,
      stagger: false,
      parallax: false,
    }
  }

  if (k.has("playful") || k.has("experimental")) {
    return {
      type: "springy-stagger",
      duration: 0.55,
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      extras: ["hover-scale-combined-with-opacity", "stagger"],
      scrollLinked: true,
      stagger: true,
      parallax: true,
    }
  }

  return DEFAULT_MOTION
}
