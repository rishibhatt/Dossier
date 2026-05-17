"use client"

import { useRef, type PropsWithChildren } from "react"
import { motion, useSpring } from "framer-motion"

type MagneticButtonProps = PropsWithChildren<{
  type?: "button" | "submit"
  className?: string
  onClick?: () => void
  disabled?: boolean
}>

const stiff = { stiffness: 400, damping: 30 }

export function MagneticButton({ children, className, type = "button", onClick, disabled }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useSpring(0, stiff)
  const y = useSpring(0, stiff)

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ x, y }}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el || disabled) return
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        x.set(dx * 0.12)
        y.set(dy * 0.12)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className={className}
    >
      {children}
    </motion.button>
  )
}
