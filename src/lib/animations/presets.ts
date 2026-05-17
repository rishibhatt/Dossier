import type { Transition } from "framer-motion"

import type { DesignConfig } from "@/types/designEngine"

export type MotionPreset = {
  initial: Record<string, number | string>
  animate: Record<string, number | string>
  transition: Transition
}

function easeFromConfig(config: DesignConfig): [number, number, number, number] {
  const e = config.motion.transitionEase
  return e && e.length >= 4 ? [e[0]!, e[1]!, e[2]!, e[3]!] : [0.16, 1, 0.3, 1]
}

function staggerFromConfig(config: DesignConfig, index: number): number {
  const step = config.motion.staggerDelay ?? 0.07
  return index * step
}

/**
 * Section reveal presets — prefers resolved `motion.cardAnimation` when present;
 * otherwise maps motion preset → entrance timing aligned with `getMotionVariants` defaults.
 */
export function getSectionMotionPreset(config: DesignConfig, sectionIndex = 0): MotionPreset {
  const delay = staggerFromConfig(config, sectionIndex)
  const ease = easeFromConfig(config)
  const ca = config.motion.cardAnimation

  if (ca?.initial && ca?.animate) {
    return {
      initial: ca.initial as Record<string, number | string>,
      animate: ca.animate as Record<string, number | string>,
      transition: {
        ...(ca.transition as Transition),
        delay,
        ease: (ca.transition as Transition)?.ease ?? ease,
      },
    }
  }

  const preset = config.motion.preset

  if (preset === "magnetic" || preset === "parallax") {
    return {
      initial: { opacity: 0, y: 32, scale: 0.96 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.58, delay, ease },
    }
  }

  if (preset === "slide-reveal") {
    return {
      initial: { opacity: 0, x: -60 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.7, delay, ease },
    }
  }

  if (preset === "stagger-grid") {
    return {
      initial: { opacity: 0, y: 32 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay, ease },
    }
  }

  return {
    initial: { opacity: 0, y: 48 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  }
}
