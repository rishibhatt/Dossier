"use client"

import { motion, useReducedMotion } from "framer-motion"

export function TextReveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion()
  const words = text.split(/\s+/)
  if (reduce) {
    return <p className={className}>{text}</p>
  }
  return (
    <p className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.9 }}
            transition={{ duration: 0.55, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : null}
          </motion.span>
        </span>
      ))}
    </p>
  )
}
