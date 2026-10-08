import { buildConfigFromTemplate, getTemplateSpec, orderSectionsForTemplate, reorderSectionsByTemplate } from "@/lib/design/templates"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"

import { SAMPLE_RICH, SAMPLE_SPARSE } from "./sampleDocument"

/** Dev QA: the sample document ordered and styled exactly as the pipeline would for template `id`. */
export function buildSample(id: string, sample: string | undefined, seed: number) {
  const spec = getTemplateSpec(id)
  if (!spec) return null
  const base = sample === "sparse" ? SAMPLE_SPARSE : SAMPLE_RICH
  const parsed = portfolioDocumentToParsedResume(base, "general")
  const document = reorderSectionsByTemplate(base, orderSectionsForTemplate(spec, base.sections.map((s) => s.type)))
  const designConfig = buildConfigFromTemplate(parsed, id, seed, { sectionTypes: document.sections.map((s) => s.type) })
  return { document, designConfig }
}

export const seedFrom = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}
