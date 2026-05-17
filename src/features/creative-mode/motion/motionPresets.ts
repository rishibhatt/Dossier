import type { Variants } from "framer-motion"

import type { MotionPresetId, ResolvedSceneMotion } from "@/features/creative-mode/types/experienceConfig"

const easeOut = [0.16, 1, 0.3, 1] as const

export const MOTION_PRESET_IDS: MotionPresetId[] = [
  "fadeUp",
  "staggerReveal",
  "parallaxSoft",
  "magneticHover",
  "scaleIn",
]

const fadeUp: ResolvedSceneMotion = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.06 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: easeOut },
    },
  },
}

const staggerReveal: ResolvedSceneMotion = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.75, ease: easeOut },
    },
  },
}

const parallaxSoft: ResolvedSceneMotion = {
  container: {
    hidden: { opacity: 0.85 },
    show: {
      opacity: 1,
      transition: { duration: 0.9, ease: easeOut },
    },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut },
    },
  },
}

const magneticHover: ResolvedSceneMotion = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  },
  item: {
    hidden: { opacity: 0, scale: 0.94 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 320, damping: 24 },
    },
  },
}

const scaleIn: ResolvedSceneMotion = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  },
  item: {
    hidden: { opacity: 0, scale: 0.88 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: easeOut },
    },
  },
}

const PRESET_MAP: Record<MotionPresetId, ResolvedSceneMotion> = {
  fadeUp,
  staggerReveal,
  parallaxSoft,
  magneticHover,
  scaleIn,
}

export function resolveMotionPreset(preset: string): ResolvedSceneMotion {
  const id = preset as MotionPresetId
  if (id in PRESET_MAP) return PRESET_MAP[id]
  return fadeUp
}

export function applyMotionTiming(
  resolved: ResolvedSceneMotion,
  motion: { duration?: number; stagger?: number }
): ResolvedSceneMotion {
  const d = motion.duration
  const s = motion.stagger
  if (d == null && s == null) return resolved
  const container = { ...resolved.container } as Variants
  const show = container.show as Record<string, unknown> | undefined
  if (show && typeof show === "object" && "transition" in show && show.transition && typeof show.transition === "object") {
    const t = { ...(show.transition as object) } as Record<string, unknown>
    if (s != null) t.staggerChildren = s
    if (d != null) t.delayChildren = (t.delayChildren as number | undefined) ?? 0
    ;(container as { show: unknown }).show = { ...show, transition: t }
  }
  const item = resolved.item
    ? ({
        ...resolved.item,
        show: {
          ...(resolved.item.show as object),
          transition: {
            ...((resolved.item.show as { transition?: object })?.transition ?? {}),
            ...(d != null ? { duration: d } : {}),
          },
        },
      } as Variants)
    : undefined
  return { container, item }
}
