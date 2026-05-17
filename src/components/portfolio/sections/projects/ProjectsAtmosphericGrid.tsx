"use client"

import { motion } from "framer-motion"
import { ArrowRight, Maximize2 } from "lucide-react"

import { CanvasText } from "@/components/portfolio/canvas/CanvasText"
import { ProjectCardArt } from "@/components/portfolio/ui/ProjectCardArt"
import { portfolioTypo, SectionTitleFromConfig } from "@/components/portfolio/ui/PortfolioTypography"
import { messages } from "@/config/messages"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { getDirectionOverrides } from "@/lib/portfolio/directionOverrides"
import { cn } from "@/lib/utils"
import type { PortfolioProjectsSection } from "@/types/dossier"

type Props = { section: PortfolioProjectsSection; sectionIndex?: number }

export function ProjectsAtmosphericGrid({ section, sectionIndex = 0 }: Props) {
  const items = section.data.items
  const label = getPortfolioSectionLabel("projects")
  const studio = messages.dossier.studio
  const { designConfig } = useDesignEngine()
  const stagger = designConfig.motion.staggerDelay ?? 0.1
  const ease = (designConfig.motion.transitionEase ?? [0.16, 1, 0.3, 1]) as [number, number, number, number]
  const o = getDirectionOverrides(designConfig)
  const slice = items.slice(0, 3)

  return (
    <section id="portfolio-section-projects" className="px-[var(--de-pad-x)] py-[var(--de-pad-y)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={cn(portfolioTypo.label(), "mb-2 text-[var(--color-primary,var(--de-accent))]")}>
              {studio.projectsEyebrow}
            </p>
            <SectionTitleFromConfig config={designConfig}>
              {o.showSectionNumbers ? (
                <span className="de-font-display mr-3 inline-block min-w-[2.25ch] text-left text-sm font-bold tabular-nums text-[var(--color-text-muted,var(--de-muted))]">
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
              ) : null}
              {label}
            </SectionTitleFromConfig>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[var(--color-primary,var(--de-accent))]"
            onClick={() => document.getElementById("portfolio-section-projects")?.scrollIntoView({ behavior: "smooth" })}
          >
            View all projects <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: stagger } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {slice.map((project, i) => (
            <AtmosphericProjectCard key={`${project.name}-${i}`} project={project} index={i} ease={ease} delay={i * stagger} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

type CardProps = {
  project: PortfolioProjectsSection["data"]["items"][number]
  index: number
  ease: [number, number, number, number]
  delay: number
}

function AtmosphericProjectCard({ project, index, ease, delay }: CardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease, delay } },
      }}
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "var(--color-surface, var(--de-elevated))",
        border: "1px solid var(--color-border, var(--de-border))",
      }}
      whileHover={{ y: -6, transition: { duration: 0.28 } }}
    >
      <div className="absolute inset-0">
        {project.imageUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.imageUrl.trim()} alt="" className="size-full object-cover" />
        ) : (
          <ProjectCardArt project={project} index={index} />
        )}
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-between p-6"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.22) 50%, transparent 100%)",
        }}
      >
        <div className="flex items-start justify-between">
          <span className="font-mono text-xs text-white/60">{String(index + 1).padStart(2, "0")}</span>
          <span className="flex size-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Maximize2 className="size-3.5 text-white" aria-hidden />
          </span>
        </div>

        <div>
          <CanvasText
            as="h3"
            sectionType="projects"
            field="name"
            value={project.name}
            projectIndex={index}
            className="mb-1 text-lg font-bold text-white de-font-display"
          />
          <CanvasText
            as="p"
            sectionType="projects"
            field="description"
            value={project.description}
            projectIndex={index}
            className="line-clamp-2 text-sm leading-snug text-white/75"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 3).map((tech) => (
              <span key={tech} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/85">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
