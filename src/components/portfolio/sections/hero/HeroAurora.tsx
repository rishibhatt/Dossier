"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { NoiseBg } from "@/components/ui/NoiseBg"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function HeroAurora({ section }: Props) {
  const { name, title, tagline } = section.data
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <section
      ref={ref}
      id="portfolio-section-hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-[var(--color-border,var(--de-border))] px-[var(--de-pad-x)] py-[min(18vh,var(--de-pad-y))]"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      <NoiseBg opacity={0.025} className="absolute inset-0" />
      <motion.div style={{ y: y1 }} className="de-floating-orb -left-20 top-10 size-72 bg-[var(--dt-accent)]" aria-hidden />
      <motion.div style={{ y: y2 }} className="de-floating-orb right-0 top-32 size-96 bg-[color-mix(in_oklab,var(--dt-accent)_40%,var(--dt-fg))]" aria-hidden />

      <div className="relative z-[1] mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CanvasText
            as="p"
            sectionType="hero"
            field="title"
            value={title}
            className="de-font-body text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted,var(--de-muted))]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="de-heading-xl mt-6 max-w-4xl text-balance"
        >
          <CanvasText as="span" sectionType="hero" field="name" value={name} className="de-text-gradient" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }}>
          <CanvasText
            as="p"
            sectionType="hero"
            field="tagline"
            value={tagline}
            className="de-body-text de-font-body mt-8 max-w-2xl text-lg text-[var(--color-text-muted,var(--de-muted))] lg:text-xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
