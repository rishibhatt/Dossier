"use client"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function HeroSplitBold({ section }: Props) {
  const { name, title, tagline } = section.data

  return (
    <section
      id="portfolio-section-hero"
      className="flex min-h-screen items-center border-b border-[var(--color-border,var(--de-border))] px-[var(--de-pad-x)] py-[var(--de-pad-y)]"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-end">
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
        </div>
        <CanvasText
          as="p"
          sectionType="hero"
          field="tagline"
          value={tagline}
          className="de-body-text de-font-body text-lg text-[var(--color-text-muted,var(--de-muted))] lg:text-xl"
        />
      </div>
    </section>
  )
}
