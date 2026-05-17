"use client"

import { motion } from "framer-motion"
import { ArrowRight, Download } from "lucide-react"

import { AbstractAiPlaceholder } from "@/components/portfolio/ui/AbstractAiPlaceholder"
import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { getDirectionImageOverlayStyle } from "@/lib/portfolio/portfolioImageSystem"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function HeroSplitEditorial({ section }: Props) {
  const { name, title, tagline, imageUrl } = section.data
  const { designConfig, document } = useDesignEngine()
  const editMode = usePortfolioStore((s) => s.editMode)
  const profession = document.portfolioMeta?.type ?? "general"
  const words = name.split(/\s+/).filter(Boolean)
  const ty = designConfig.tokens.typography

  return (
    <section
      id="portfolio-section-hero"
      className="relative flex min-h-screen items-stretch overflow-hidden border-b border-[var(--color-border,var(--de-border))]"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      <div className="relative z-[2] flex w-full flex-col justify-center px-[var(--de-pad-x)] py-[var(--de-pad-y)] md:w-[55%] md:max-w-none md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <CanvasText
            as="span"
            sectionType="hero"
            field="title"
            value={title}
            className="de-font-body text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary,var(--de-accent))]"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="de-font-display text-[var(--color-text,var(--de-fg))]"
          style={{
            fontSize: ty.scale.hero,
            fontWeight: ty.weights.display,
            lineHeight: ty.lineHeight.display,
            letterSpacing: ty.letterSpacing.display,
          }}
        >
          {editMode ? (
            <CanvasText as="span" sectionType="hero" field="name" value={name} className="block" />
          ) : (
            words.map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))
          )}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-8 max-w-md"
        >
          <CanvasText
            as="p"
            sectionType="hero"
            field="tagline"
            value={tagline}
            className="de-font-body text-[var(--color-text-muted,var(--de-muted))]"
            style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", lineHeight: 1.65 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#portfolio-section-projects"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--color-text, var(--de-fg))",
              color: "var(--color-bg, var(--de-bg))",
            }}
          >
            View my work <ArrowRight className="size-4" aria-hidden />
          </a>
          <a
            href="#portfolio-section-contact"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              borderColor: "var(--color-border, var(--de-border))",
              color: "var(--color-text, var(--de-fg))",
            }}
          >
            <Download className="size-4" aria-hidden />
            Download CV
          </a>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[45%] md:block" aria-hidden>
        <HeroVisualBlock profession={profession} imageUrl={imageUrl ?? undefined} />
      </div>
      <div className="relative mt-10 h-56 w-full md:hidden" aria-hidden>
        <HeroVisualBlock profession={profession} imageUrl={imageUrl ?? undefined} />
      </div>
    </section>
  )
}

function HeroVisualBlock({ profession, imageUrl }: { profession: string; imageUrl?: string }) {
  const { designConfig } = useDesignEngine()
  const primary = designConfig.tokens.colors.primary
  const overlayStyle = getDirectionImageOverlayStyle(designConfig.meta.direction, primary)
  const trimmed = imageUrl?.trim()

  return (
    <div className="relative size-full overflow-hidden">
      {trimmed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trimmed} alt="" className="size-full object-cover" />
      ) : (
        <AbstractAiPlaceholder seed={`hero-${designConfig.meta.variationSeed}-${profession}`} />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, var(--color-bg, var(--de-bg)) 0%, transparent 32%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, var(--color-bg, var(--de-bg)), transparent)" }}
      />
      <div className="absolute inset-0" style={overlayStyle} />
    </div>
  )
}
