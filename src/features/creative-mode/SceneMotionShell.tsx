"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { CSSProperties } from "react"

import { applyMotionTiming, resolveMotionPreset } from "@/features/creative-mode/motion/motionPresets"
import type { Scene } from "@/features/creative-mode/types/experienceConfig"

export function SceneMotionShell({
  scene,
  children,
  className,
}: {
  scene: Scene
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const base = resolveMotionPreset(scene.motion.preset)
  const { container } = applyMotionTiming(base, scene.motion)

  if (reduce) {
    return <section className={className}>{children}</section>
  }

  return (
    <motion.section
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px", amount: 0.2 }}
    >
      {children}
    </motion.section>
  )
}

export function SceneMotionItem({
  scene,
  children,
  className,
  style,
}: {
  scene: Scene
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}) {
  const reduce = useReducedMotion()
  const base = resolveMotionPreset(scene.motion.preset)
  const { item } = applyMotionTiming(base, scene.motion)
  if (reduce || !item) return (
    <div className={className} style={style}>
      {children}
    </div>
  )
  return (
    <motion.div variants={item} className={className} style={style}>
      {children}
    </motion.div>
  )
}
