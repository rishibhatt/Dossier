"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import type { ComponentCardStyle } from "@/types/designEngine"

type PortfolioCardProps = {
  children: React.ReactNode
  variant: ComponentCardStyle
  className?: string
  hoverEffect?: boolean
} & Omit<HTMLMotionProps<"article">, "children" | "style"> & {
  /** Optional style merge on top of variant shell */
  shellStyle?: CSSProperties
}

function variantStyle(variant: ComponentCardStyle): CSSProperties {
  switch (variant) {
    case "glass":
      return {
        background: "color-mix(in srgb, var(--color-surface, var(--de-elevated)) 88%, transparent)",
        backdropFilter: "blur(var(--dt-blur-glass, 20px))",
        WebkitBackdropFilter: "blur(var(--dt-blur-glass, 20px))",
        border: "1px solid var(--color-border, var(--de-border))",
        borderRadius: "var(--effect-radius, 1rem)",
      }
    case "bordered":
      return {
        background: "transparent",
        border: "1px solid var(--color-border, var(--de-border))",
        borderRadius: "var(--effect-radius, 0.75rem)",
      }
    case "solid":
      return {
        background: "var(--color-bg-secondary, var(--de-elevated))",
        border: "none",
        borderRadius: "var(--effect-radius, 0.75rem)",
      }
    case "flat":
      return {
        background: "transparent",
        borderBottom: "1px solid var(--color-border, var(--de-border))",
        borderRadius: 0,
      }
    case "brutalist":
      return {
        background: "var(--color-surface, var(--de-elevated))",
        border: "2px solid var(--color-text, var(--de-fg))",
        borderRadius: 0,
        boxShadow: "4px 4px 0 var(--color-text, var(--de-fg))",
      }
    default:
      return variantStyle("glass")
  }
}

export function PortfolioCard({
  children,
  variant,
  className,
  hoverEffect = true,
  shellStyle,
  ...rest
}: PortfolioCardProps) {
  const base = variantStyle(variant)
  const showGlowHover = hoverEffect && (variant === "glass" || variant === "bordered")

  return (
    <motion.article
      className={cn("group relative overflow-hidden", className)}
      style={{ ...base, ...shellStyle }}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2, ease: "easeOut" } } : undefined}
      {...rest}
    >
      {showGlowHover ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-primary, var(--de-accent)) 12%, transparent), transparent 70%)`,
          }}
          aria-hidden
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </motion.article>
  )
}
