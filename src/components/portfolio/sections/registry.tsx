import type { ComponentType } from "react"

import type { PortfolioSection, PortfolioSectionType } from "@/types/dossier"

import { aboutModule } from "./about"
import { certificationsModule } from "./certifications"
import { contactModule } from "./contact"
import { educationModule } from "./education"
import { experienceModule } from "./experience"
import { hero } from "./hero"
import { highlightsModule } from "./highlights"
import { projectsModule } from "./projects"
import { skillsModule } from "./skills"
import type { RenderCtx, SectionModule } from "./types"

type Modules = { [K in PortfolioSectionType]: SectionModule<K> }

export const SECTION_MODULES: Modules = {
  hero,
  about: aboutModule,
  skills: skillsModule,
  experience: experienceModule,
  projects: projectsModule,
  contact: contactModule,
  education: educationModule,
  highlights: highlightsModule,
  certifications: certificationsModule,
}

/** Variant ids per type, in cycle order. */
export const VARIANT_IDS = Object.fromEntries(
  Object.entries(SECTION_MODULES).map(([t, m]) => [t, Object.keys(m.variants)])
) as Record<PortfolioSectionType, string[]>

/** Exact-match aliases for ids saved by older configs (published payloads, drafts). */
const LEGACY: Partial<Record<PortfolioSectionType, Record<string, string>>> = {
  hero: {
    "terminal-hero": "terminal", "enterprise-hero": "centered", "split-bold": "split", "split-editorial-hero": "split",
    "editorial-pull-quote": "statement", "showcase-marquee-hero": "banner", "aurora-hero": "centered", "editorial-hero-v2": "statement",
    "brutalist-hero": "statement", "chaos-hero": "banner", "organic-hero": "split", "centered-minimal": "centered", editorial: "statement",
    "showcase-editorial": "banner", aurora: "centered", "split-media": "split", "split-editorial": "split",
    // layout.heroVariant enum
    "fullscreen-center": "centered", "split-left": "split", kinetic: "banner",
  },
  about: {
    "plain-about": "prose", "two-column-about": "columns", "pull-quote-about": "lead", "card-about": "prose", "rail-about": "prose",
    default: "prose", "two-column": "columns", "pull-editorial": "lead", card: "prose", "mono-rail": "prose",
  },
  skills: {
    "tech-strip-skills": "chips", "terminal-tags-skills": "chips", "tools-cloud-skills": "chips", "grouped-badges-skills": "columns",
    "split-skills": "columns", "chips-skills": "chips", "constellation-skills": "chips", "finance-category-skills": "columns",
    "skills-marquee-infinite": "inline", "terminal-tags": "chips", "constellation-pills": "chips", "finance-category": "columns",
    "tech-strip": "chips", "split-columns": "columns",
  },
  experience: {
    "numbered-list-exp": "list", "card-stack-exp": "cards", "branch-timeline-exp": "timeline", "case-rows-exp": "rows", "dots-exp": "timeline",
    "exp-horizontal-carousel": "cards", "finance-timeline-metrics": "rows", "design-process-row": "rows", "numbered-list": "list",
    "stagger-cards": "cards", "branch-timeline": "timeline", "case-rows": "rows",
  },
  projects: {
    "stack-projects": "list", "selected-work-projects": "cards", "horizontal-project-cards": "cards", "carousel-projects": "feature",
    "masonry-work": "gallery", "bento-projects": "feature", "glass-mosaic": "gallery", "horizontal-spotlight": "feature",
    "bento-grid": "feature", "stack-list": "list", "default-grid": "cards",
  },
  contact: {
    "terminal-contact": "list", "statement-cta-contact": "statement", "friendly-card-contact": "card", "dramatic-footer-contact": "footer",
    "plain-contact": "list", "minimal-links-contact": "list", "glow-contact": "statement", "default-block": "list", "split-inline": "list",
    "card-stack": "card", "dramatic-footer": "footer", "mono-links": "list",
  },
}

/** Exact id, then legacy alias, then the caller's preferred id (template), then the module fallback. */
export function resolveVariant(type: PortfolioSectionType, id: string | undefined, preferred?: string): string {
  const ids = VARIANT_IDS[type]
  for (const v of [id, id ? LEGACY[type]?.[id] : undefined, preferred]) if (v && ids.includes(v)) return v
  return SECTION_MODULES[type].fallback
}

export function isSectionEmpty(section: PortfolioSection): boolean {
  const m = SECTION_MODULES[section.type] as SectionModule<typeof section.type>
  return (m.isEmpty as (s: PortfolioSection) => boolean)(section)
}

export function renderSectionVariant(section: PortfolioSection, variant: string, ctx: RenderCtx) {
  const m = SECTION_MODULES[section.type]
  const Comp = (m.variants[resolveVariant(section.type, variant)] ?? m.variants[m.fallback]) as ComponentType<{
    section: PortfolioSection
    ctx: RenderCtx
  }>
  return <Comp section={section} ctx={ctx} />
}
