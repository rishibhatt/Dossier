"use client"

import { motion } from "framer-motion"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function HeroSplitMedia({ section }: Props) {
  const { name, title, tagline, imageUrl } = section.data
  const src = imageUrl?.trim()

  return (
    <section
      id="portfolio-section-hero"
      className="relative flex min-h-screen items-center overflow-hidden border-b border-[var(--color-border,var(--de-border))] px-[var(--de-pad-x)] py-[var(--de-pad-y)]"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 85% 20%, color-mix(in srgb, var(--color-primary, var(--de-accent)) 12%, transparent), transparent 55%)`,
        }}
        aria-hidden
      />
      <div className="relative z-[1] mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <CanvasText
            as="p"
            sectionType="hero"
            field="title"
            value={title}
            className="de-font-body text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted,var(--de-muted))]"
          />
          <CanvasText
            as="h1"
            sectionType="hero"
            field="name"
            value={name}
            className="de-heading-xl mt-6 text-balance text-[var(--color-text,var(--de-fg))]"
          />
          <CanvasText
            as="p"
            sectionType="hero"
            field="tagline"
            value={tagline}
            className="de-body-text de-font-body mt-6 text-lg text-[var(--color-text-muted,var(--de-muted))] lg:text-xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="de-gradient-border mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="de-gradient-border-inner overflow-hidden">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- portfolio user-supplied URL
              <img src={src} alt="" className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]" />
            ) : (
              <div
                className="flex aspect-[4/5] items-center justify-center bg-[color-mix(in_oklab,var(--dt-accent)_16%,var(--dt-bg))] text-sm text-[var(--de-muted)] lg:aspect-[5/6]"
                aria-hidden
              >
                Image
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
