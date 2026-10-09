import type { TextPath } from "@/components/portfolio/sections/types"
import type { PortfolioDocument, PortfolioSection, PortfolioSectionType } from "@/types/dossier"

/** Pure document edits addressed by section id (never "first section of a type"). */

type AnyData = Record<string, unknown> & { items?: unknown[]; links?: string[] }

function mapSection(doc: PortfolioDocument, id: string, fn: (s: PortfolioSection) => PortfolioSection): PortfolioDocument {
  let hit = false
  const sections = doc.sections.map((s) => {
    if (s.id !== id) return s
    hit = true
    return fn(s)
  })
  return hit ? { ...doc, sections } : doc
}

const withData = (s: PortfolioSection, data: AnyData) => ({ ...s, data }) as PortfolioSection

export function patchSectionData(doc: PortfolioDocument, id: string, patch: Record<string, unknown>): PortfolioDocument {
  return mapSection(doc, id, (s) => withData(s, { ...(s.data as AnyData), ...patch }))
}

export function patchSectionItem(doc: PortfolioDocument, id: string, index: number, patch: Record<string, unknown>): PortfolioDocument {
  return mapSection(doc, id, (s) => {
    const data = s.data as AnyData
    if (!Array.isArray(data.items) || index < 0 || index >= data.items.length) return s
    const items = data.items.map((it, i) => (i === index && it && typeof it === "object" ? { ...it, ...patch } : it))
    return withData(s, { ...data, items })
  })
}

const splitList = (v: string) =>
  v
    .split(/\s*[·,]\s*/)
    .map((t) => t.trim())
    .filter(Boolean)

/** Write one edited string from the canvas (see TextPath). Empty list entries are removed. */
export function setTextField(doc: PortfolioDocument, path: TextPath, value: string): PortfolioDocument {
  const { sectionId, field, index, sub } = path
  return mapSection(doc, sectionId, (s) => {
    const data = s.data as AnyData
    if (s.type === "skills" && index != null) {
      const items = [...s.data.items]
      if (value) items[index] = value
      else items.splice(index, 1)
      return withData(s, { ...data, items })
    }
    if (s.type === "contact" && field === "link" && index != null) {
      const links = [...s.data.links]
      if (value) links[index] = value
      else links.splice(index, 1)
      return withData(s, { ...data, links })
    }
    if (index == null) return withData(s, { ...data, [field]: value })
    const items = [...((data.items ?? []) as Record<string, unknown>[])]
    const item = items[index]
    if (!item) return s
    if (field === "highlights" && sub != null) {
      const hl = [...((item.highlights as string[] | undefined) ?? [])]
      if (value) hl[sub] = value
      else hl.splice(sub, 1)
      items[index] = { ...item, highlights: hl }
    } else if (field === "tech") {
      items[index] = { ...item, tech: splitList(value) }
    } else {
      items[index] = { ...item, [field]: value }
    }
    return withData(s, { ...data, items })
  })
}

/** Index a new section should take: after `afterId` if given, hero first, otherwise just before contact. */
export function insertIndex(doc: PortfolioDocument, type: PortfolioSectionType, afterId?: string): number {
  if (type === "hero") return 0
  if (afterId) {
    const i = doc.sections.findIndex((s) => s.id === afterId)
    if (i >= 0) return i + 1
  }
  const contact = doc.sections.findIndex((s) => s.type === "contact")
  return type !== "contact" && contact >= 0 ? contact : doc.sections.length
}
