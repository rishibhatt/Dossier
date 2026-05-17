import type { DesignConfig } from "@/types/designEngine"

/** Centralized Framer Motion variants driven by design config easing / stagger. */
export function getMotionVariants(config: DesignConfig) {
  const ease = (config.motion.transitionEase ?? [0.16, 1, 0.3, 1]) as [number, number, number, number]
  const stagger = config.motion.staggerDelay ?? 0.07

  return {
    section: {
      hidden: { opacity: 0, y: 48 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease },
      },
    },
    staggerContainer: {
      hidden: {},
      visible: {
        transition: { staggerChildren: stagger, delayChildren: 0.1 },
      },
    },
    staggerItem: {
      hidden: { opacity: 0, y: 32 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
    },
    textContainer: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.04 } },
    },
    textWord: {
      hidden: { opacity: 0, y: "110%", clipPath: "inset(0 0 100% 0)" },
      visible: {
        opacity: 1,
        y: "0%",
        clipPath: "inset(0 0 0% 0)",
        transition: { duration: 0.5, ease },
      },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } },
    },
    slideLeft: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
    },
    slideRight: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
    },
  }
}
