"use client"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { NoiseBg } from "@/components/ui/NoiseBg"
import { ParticleField } from "@/components/ui/ParticleField"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function TerminalHero({ section }: Props) {
  const { name, title, tagline } = section.data

  return (
    <section
      id="portfolio-section-hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-[var(--color-border,var(--de-border))] px-[var(--de-pad-x)] py-[var(--de-pad-y)]"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      <NoiseBg opacity={0.025} className="absolute inset-0" />
      <ParticleField className="opacity-25" />
      <div className="relative z-[1] max-w-3xl">
        <div className="de-font-mono text-sm text-[var(--color-text-muted,var(--de-muted))] md:text-base">
          <p>
            <span className="text-[var(--color-primary,var(--de-accent))]">$</span> dossier --whoami
          </p>
        </div>
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
          field="title"
          value={title}
          className="de-font-body mt-4 text-[var(--color-text-muted,var(--de-muted))]"
          style={{ fontSize: "var(--size-h3, 1.125rem)" }}
        />
        <div className="de-font-mono mt-6 max-w-xl rounded-md border border-[var(--color-border,var(--de-border))] bg-[color-mix(in_srgb,var(--color-surface,var(--de-elevated))_92%,transparent)] p-4 text-sm leading-relaxed text-[var(--color-text-muted,var(--de-muted))] md:p-5 md:text-base">
          <CanvasText as="p" sectionType="hero" field="tagline" value={tagline} className="whitespace-pre-line" />
        </div>
      </div>
    </section>
  )
}
