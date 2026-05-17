"use client"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { ProjectCardArt } from "@/components/portfolio/ui/ProjectCardArt"
import { PortfolioCard } from "@/components/portfolio/ui/PortfolioCard"
import { portfolioTypo } from "@/components/portfolio/ui/PortfolioTypography"
import { messages } from "@/config/messages"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { getDirectionOverrides, resolvePortfolioCardVariant } from "@/lib/portfolio/directionOverrides"
import { cn } from "@/lib/utils"
import type { PortfolioProjectsSection } from "@/types/dossier"

type Props = { section: PortfolioProjectsSection; sectionIndex?: number }

export function ProjectsGlassMosaic({ section, sectionIndex = 0 }: Props) {
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
          <h2 className={portfolioTypo.label()}>
            {o.showSectionNumbers ? (
              <span className="de-font-display mr-2 font-bold tabular-nums text-[var(--color-text-muted)]">
                {String(sectionIndex + 1).padStart(2, "0")}
              </span>
            ) : null}
            {label}
          </h2>
          <span className={cn(portfolioTypo.label(), "text-[var(--de-fg)]")}>{studio.projectsViewAll}</span>
        </div>
        <div className="mt-12 grid auto-rows-[minmax(10rem,auto)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => {
            const featured = i === 0
            return (
              <PortfolioCard
                key={`${p.name}-${i}`}
                variant={cardV}
                className={cn("p-5", featured ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : "")}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease, delay: i * stagger }}
                hoverEffect
              >
                <div
                  className={`relative mb-4 overflow-hidden rounded-lg border border-[var(--de-border)] bg-[color-mix(in_oklab,var(--dt-accent)_10%,transparent)] ${featured ? "aspect-[21/10] lg:aspect-auto lg:min-h-[12rem]" : "aspect-video"}`}
                >
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
                  className={`font-semibold text-[var(--de-fg)] ${featured ? "text-2xl" : "text-lg"}`}
                />
                <CanvasText
                  as="p"
                  sectionType="projects"
                  field="description"
                  value={p.description}
                  projectIndex={i}
                  className={`de-body-text mt-2 ${featured ? "line-clamp-5" : "line-clamp-3"}`}
                />
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-primary,var(--de-accent))]">
                  <CanvasText
                    as="span"
                    sectionType="projects"
                    field="tech"
                    value={p.tech.join(", ")}
                    projectIndex={i}
                    className="inline-block min-w-0"
                  />
                </div>
              </PortfolioCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
