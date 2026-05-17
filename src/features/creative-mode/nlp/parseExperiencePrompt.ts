import { nanoid } from "nanoid"

import type { ExperienceConfig, MotionPresetId, Scene, SceneType } from "@/features/creative-mode/types/experienceConfig"

function sceneStub(type: SceneType, props: Record<string, unknown> = {}): Scene {
  return {
    id: nanoid(10),
    type,
    props,
    motion: { preset: "fadeUp" as MotionPresetId, duration: 0.65, stagger: 0.08 },
  }
}

/**
 * Rule-based NLP: maps natural language to ExperienceConfig patches.
 * Merges onto existing config (mutates a clone).
 */
export function parseExperiencePrompt(input: string, base: ExperienceConfig): ExperienceConfig {
  const next = structuredClone(base)
  const t = input.toLowerCase()

  if (/(sticky\s*nav|nav\s*sticky|fixed\s*nav)/.test(t)) {
    next.global.nav.sticky = true
  }
  if (/(floating\s*nav|nav\s*float)/.test(t)) {
    next.global.nav.sticky = false
    next.global.nav.style = "floating"
  }

  if (/\bminimal\b/.test(t)) {
    next.meta.style = "minimal"
    next.meta.motionIntensity = Math.min(next.meta.motionIntensity, 0.45)
  }
  if (/\b(cinematic|film|dramatic)\b/.test(t)) {
    next.meta.style = "cinematic"
    next.meta.motionIntensity = Math.max(next.meta.motionIntensity, 0.72)
  }
  if (/\b(experimental|wild|chaos)\b/.test(t)) {
    next.meta.style = "experimental"
    next.meta.motionIntensity = Math.max(next.meta.motionIntensity, 0.85)
    next.meta.density = Math.min(1, next.meta.density + 0.15)
  }

  if (/\b(smooth|buttery|lenis)\b/.test(t)) {
    next.meta.motionIntensity = Math.min(1, next.meta.motionIntensity + 0.12)
  }

  const has = (type: SceneType) => next.scenes.some((s) => s.type === type)

  if (/\bmarquee\b/.test(t) && !has("marquee")) {
    next.scenes.splice(2, 0, sceneStub("marquee", { rows: 2, speed: 1 }))
  }
  if (/\b(carousel|slider)\b/.test(t) && !has("projects-carousel")) {
    const i = next.scenes.findIndex((s) => s.type === "projects-carousel")
    if (i < 0) {
      const ins = Math.max(1, next.scenes.findIndex((s) => s.type === "hero") + 1)
      next.scenes.splice(ins, 0, sceneStub("projects-carousel", { autoplay: true, centerScale: true }))
    }
  }
  if (/\bhorizontal\s*scroll\b/.test(t) && !has("horizontal-scroll")) {
    next.scenes.push(sceneStub("horizontal-scroll", { intensity: 0.6 }))
  }
  if (/\b(sticky\s*stack|stacked)\b/.test(t) && !has("sticky-stack")) {
    next.scenes.push(sceneStub("sticky-stack", { cards: 4 }))
  }
  if (/\b(text\s*reveal|line\s*by\s*line|reveal)\b/.test(t) && !has("text-reveal")) {
    next.scenes.splice(1, 0, sceneStub("text-reveal", { linesFrom: "about" }))
  }
  if (/\b(skills\s*cloud|cloud\s*skills)\b/.test(t) && !has("skills-cloud")) {
    const mi = next.scenes.findIndex((s) => s.type === "marquee")
    next.scenes.splice(mi >= 0 ? mi : 2, 0, sceneStub("skills-cloud", { spread: 1 }))
  }
  if (/\b(split\s*scroll)\b/.test(t) && !has("split-scroll")) {
    next.scenes.push(sceneStub("split-scroll", { balance: "even" }))
  }

  return next
}
