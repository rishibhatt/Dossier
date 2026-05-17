"use client"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { ProjectCardArt } from "@/components/portfolio/ui/ProjectCardArt"
import { PortfolioCard } from "@/components/portfolio/ui/PortfolioCard"
import { portfolioTypo, SectionTitleFromConfig } from "@/components/portfolio/ui/PortfolioTypography"
import { messages } from "@/config/messages"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { getDirectionOverrides, resolvePortfolioCardVariant } from "@/lib/portfolio/directionOverrides"
import { cn } from "@/lib/utils"
import type { PortfolioProjectsSection } from "@/types/dossier"

type Props = { section: PortfolioProjectsSection; sectionIndex?: number }

export function ProjectsSpotlight({ section, sectionIndex = 0 }: Props) {
  const items = section.data.items
  const label = getPortfolioSectionLabel("projects")
  const studio = messages.dossier.studio
  const { designConfig } = useDesignEngine()
  const cardV = resolvePortfolioCardVariant(designConfig)
  const stagger = designConfig.motion.staggerDelay ?? 0.07
  const ease = (designConfig.motion.transitionEase ?? [0.16, 1, 0.3, 1]) as [number, number, number, number]
  const o = getDirectionOverrides(designConfig)

  return (
    <section id="portfolio-section-projects" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={cn(portfolioTypo.label(), "text-[var(--de-muted)]")}>{studio.projectsEyebrow}</p>
            <div className="mt-1">
              <SectionTitleFromConfig config={designConfig}>
                {o.showSectionNumbers ? (
                  <span className="de-font-display mr-3 inline-block min-w-[2.25ch] text-left text-sm font-bold tabular-nums text-[var(--color-text-muted,var(--de-muted))]">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                ) : null}
                {label}
              </SectionTitleFromConfig>
            </div>
          </div>
        </div>
        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-[var(--color-bg,var(--de-bg))] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-[var(--color-bg,var(--de-bg))] to-transparent" />
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((p, i) => (
              <PortfolioCard
                key={`${p.name}-${i}`}
                variant={cardV}
                className="w-[min(88vw,22rem)] shrink-0 snap-center p-6 md:w-[26rem]"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease, delay: i * stagger }}
                hoverEffect
              >
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg border border-[var(--de-border)] bg-[color-mix(in_oklab,var(--dt-accent)_12%,transparent)]">
                  {p.imageUrl?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl.trim()} alt="" className="size-full object-cover" />
                  ) : (
                    <ProjectCardArt project={p} index={i} />
                  )}
                </div>
                <CanvasText
                  as="h3"
                  sectionType="projects"
                  field="name"
                  value={p.name}
                  projectIndex={i}
                  className="text-lg font-semibold text-[var(--de-fg)]"
                />
                <CanvasText
                  as="p"
                  sectionType="projects"
                  field="description"
                  value={p.description}
                  projectIndex={i}
                  className="de-body-text mt-2 line-clamp-4"
                />
                <CanvasText
                  as="p"
                  sectionType="projects"
                  field="tech"
                  value={p.tech.join(", ")}
                  projectIndex={i}
                  className="mt-3 text-xs text-[var(--color-primary,var(--de-accent))]"
                />
              </PortfolioCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
