"use client"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function HeroEditorial({ section }: Props) {
  const { name, title, tagline } = section.data

  return (
    <section
      id="portfolio-section-hero"
      className="flex min-h-screen flex-col justify-center border-b border-[var(--color-border,var(--de-border))] px-[var(--de-pad-x)] py-[var(--de-pad-y)]"
      style={{ backgroundColor: "var(--color-bg-secondary, var(--de-elevated))" }}
    >
      <div className="mx-auto max-w-5xl">
        <CanvasText
          as="p"
          sectionType="hero"
          field="title"
          value={title}
          className="de-font-body text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted,var(--de-muted))]"
        />
        <CanvasText
          as="h1"
          sectionType="hero"
          field="name"
          value={name}
          className="de-heading-xl mt-6 max-w-4xl text-balance text-[var(--color-text,var(--de-fg))]"
        />
        <CanvasText
          as="p"
          sectionType="hero"
          field="tagline"
          value={tagline}
          className="de-body-text de-font-body mt-8 max-w-2xl text-base text-[var(--color-text-muted,var(--de-muted))] sm:text-lg"
        />
      </div>
    </section>
  )
}
