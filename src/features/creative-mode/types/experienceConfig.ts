import type { Variants } from "framer-motion"

export type ExperienceStyle = "minimal" | "cinematic" | "editorial" | "focused" | "experimental"

export type ExperienceMeta = {
  style: ExperienceStyle
  /** 0–1 creative motion weight */
  motionIntensity: number
  /** 0–1 content / scene density */
  density: number
}

export type MotionPresetId = "fadeUp" | "staggerReveal" | "parallaxSoft" | "magneticHover" | "scaleIn"

export type MotionConfig = {
  preset: MotionPresetId | string
  duration?: number
  stagger?: number
}

export type SceneType =
  | "hero"
  | "text-reveal"
  | "marquee"
  | "horizontal-scroll"
  | "projects-carousel"
  | "skills-cloud"
  | "sticky-stack"
  | "split-scroll"

export type Scene = {
  id: string
  type: SceneType
  /** Scene-specific props (validated per scene component) */
  props: Record<string, unknown>
  motion: MotionConfig
}

export type ExperienceGlobal = {
  nav: {
    sticky: boolean
    style: string
  }
}

export type ExperienceConfig = {
  meta: ExperienceMeta
  scenes: Scene[]
  global: ExperienceGlobal
}

/** Framer Motion variants bag derived from a motion preset */
export type ResolvedSceneMotion = {
  container: Variants
  item?: Variants
}
