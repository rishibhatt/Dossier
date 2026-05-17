"use client"

import { motion } from "framer-motion"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { useDesignEngine } from "@/context/DesignEngineContext"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

const gradientDirections = new Set(["LUMINOUS_DARK", "ORGANIC_GRADIENT", "CHROMATIC_CHAOS"])

export function HeroCenteredMinimal({ section }: Props) {
  const { name, title, tagline } = section.data
  const { designConfig } = useDesignEngine()
  const dir = designConfig.meta.direction
  const showGlow = dir !== "EDITORIAL_MONO" && dir !== "BRUTALIST_GRID"
  const nameIsGradient = gradientDirections.has(dir)

  return (
    <section
      id="portfolio-section-hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b border-[var(--color-border,var(--de-border))] px-[var(--de-pad-x)] py-[var(--de-pad-y)]"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      {showGlow ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% -5%, color-mix(in srgb, var(--color-primary, var(--de-accent)) 18%, transparent), transparent 70%)`,
          }}
          aria-hidden
        />
      ) : null}
      <div className="relative z-[1] mx-auto max-w-5xl text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CanvasText
            as="p"
            sectionType="hero"
            field="title"
            value={title}
            className="de-font-body text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted,var(--de-muted))]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          <CanvasText
            as="h1"
            sectionType="hero"
            field="name"
            value={name}
            className="de-heading-xl text-balance"
            style={
              nameIsGradient
                ? {
                    background: "var(--gradient-text, var(--dt-gradient-accent))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
                : undefined
            }
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
        >
          <CanvasText
            as="p"
            sectionType="hero"
            field="tagline"
            value={tagline}
            className="de-body-text de-font-body mx-auto mt-6 max-w-xl text-[var(--color-text-muted,var(--de-muted))]"
            style={{ fontSize: "var(--size-h2, var(--dt-heading-lg-size))" }}
          />
        </motion.div>
      </div>
    </section>
  )
}
