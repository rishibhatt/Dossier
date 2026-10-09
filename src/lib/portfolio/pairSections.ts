import { getTemplateSpec } from "@/lib/design/templates/build"
import type { DesignConfig, DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioDocument, PortfolioSection, PortfolioSectionType } from "@/types/dossier"

/** The template's own variant for a type (used when a plan is missing, e.g. a section added later). */
export function templateVariant(config: DesignConfig, type: PortfolioSectionType): string | undefined {
  const spec = config.meta.templateId ? getTemplateSpec(config.meta.templateId) : undefined
  if (!spec) return undefined
  return type === "hero" ? spec.heroSection : spec.variants[type]
}

/**
 * Pair every document section with a plan. Index-aligned when types match; otherwise the first
 * unused plan of the same type; otherwise the template default. Sections are never dropped.
 */
export function pairSections(doc: PortfolioDocument, config: DesignConfig): { section: PortfolioSection; plan: DesignSectionPlan }[] {
  const used = new Set<number>()
  return doc.sections.map((section, i) => {
    let j = config.sections[i]?.type === section.type && !used.has(i) ? i : -1
    if (j < 0) j = config.sections.findIndex((p, k) => p.type === section.type && !used.has(k))
    if (j >= 0) {
      used.add(j)
      return { section, plan: config.sections[j]! }
    }
    return { section, plan: { type: section.type, variant: templateVariant(config, section.type) ?? "" } }
  })
}
