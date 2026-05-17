"use client"

import { useCallback, useRef, useState, type PropsWithChildren } from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"

type GlowCardProps = PropsWithChildren<{
  className?: string
}>

/**
 * Glass surface with mouse-reactive inner glow — tokens from CSS vars only.
 */
export function GlowCard({ children, className }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const [hover, setHover] = useState(false)

  const bg = useMotionTemplate`radial-gradient(420px circle at ${mx} ${my}, color-mix(in oklab, var(--de-accent) 22%, transparent), transparent 55%)`

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width)
      my.set((e.clientY - r.top) / r.height)
    },
    [mx, my]
  )

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMove}
      className={[
        "relative overflow-hidden rounded-[var(--dt-radius-xl,1rem)] border border-[var(--de-border)]",
        "bg-[color-mix(in_oklab,var(--de-elevated)_88%,transparent)] backdrop-blur-[var(--dt-blur-glass,16px)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      whileHover={{ scale: hover ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: bg }} />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
