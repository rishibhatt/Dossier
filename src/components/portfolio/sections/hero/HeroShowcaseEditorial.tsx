"use client"

import { motion } from "framer-motion"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { TechMarquee } from "@/components/portfolio/motion/TechMarquee"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { PortfolioHeroSection } from "@/types/dossier"

type Props = { section: PortfolioHeroSection }

export function HeroShowcaseEditorial({ section }: Props) {
  const { name, title, tagline } = section.data
  const { document } = useDesignEngine()
  const editMode = usePortfolioStore((s) => s.editMode)
  const skills = document.sections.find((s) => s.type === "skills")
  const marqueeItems =
    skills?.type === "skills" && skills.data.items.length > 0
      ? skills.data.items.slice(0, 20)
      : ["React", "Next.js", "TypeScript", "Tailwind CSS", "Web APIs", "Performance", "A11y", "Design systems"]

  const paragraphs = tagline.split(/\n\n+/).filter(Boolean)
  const [lead, ...rest] = paragraphs.length ? paragraphs : [tagline]
  const nameParts = name.trim().split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] ?? name
  const restName = nameParts.slice(1).join(" ")

  return (
    <section
      id="portfolio-section-hero"
      className="relative overflow-hidden border-b border-[var(--color-border,var(--de-border))] pb-0"
      style={{ backgroundColor: "var(--color-bg, var(--de-bg))" }}
    >
      <div
        className="pointer-events-none absolute -right-20 top-0 h-[min(70vh,520px)] w-[min(90vw,640px)] rounded-full opacity-[0.14] blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--color-accent, var(--de-accent)) 55%, transparent), transparent 62%)",
        }}
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-6xl px-[var(--de-pad-x)] pb-10 pt-[var(--de-pad-y)] md:pb-14 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <CanvasText
            as="p"
            sectionType="hero"
            field="title"
            value={title}
            className="de-font-body text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-primary,var(--de-accent))]"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="de-font-display mt-6 max-w-5xl text-[var(--color-text,var(--de-fg))]"
          style={{
            fontSize: "clamp(2.75rem, 7vw, 5.25rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
          }}
        >
          {editMode ? (
            <CanvasText as="span" sectionType="hero" field="name" value={name} />
          ) : (
            <>
              <span className="italic text-[color-mix(in_oklab,var(--color-primary,var(--de-accent))_88%,var(--color-text,var(--de-fg)))]">
                {firstName}
                {restName ? " " : ""}
              </span>
              {restName ? <span>{restName}</span> : null}
            </>
          )}
        </motion.h1>

        <div className="mt-10 grid max-w-5xl gap-8 md:grid-cols-2 md:gap-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12, duration: 0.5 }}>
            <CanvasText
              as="p"
              sectionType="hero"
              field="tagline"
              value={lead}
              className="de-font-body text-base leading-relaxed text-[var(--color-text-muted,var(--de-muted))] md:text-lg"
            />
          </motion.div>
          {rest.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <p className="de-font-body text-base leading-relaxed text-[var(--color-text-muted,var(--de-muted))] md:text-lg">
                {rest.join("\n\n")}
              </p>
            </motion.div>
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}
        </div>
      </div>

      <TechMarquee items={marqueeItems} durationSec={26} />
    </section>
  )
}
