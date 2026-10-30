import { autoLabel } from "./links"
import { PERSONAL_LABELS, PRESETS, SECTION_LABELS, formatMonth, formatRange } from "./presets"
import type { Accent, Density, ResumeDesign, ResumeDocument, ResumeSection } from "./schema"

/**
 * The view model handed to Typst through `sys.inputs.data`.
 * Dates, labels, link targets and density are resolved here, once, in tested TypeScript, so templates only lay
 * things out. Templates read this JSON and never build markup from strings, so user text can't inject Typst.
 */

export type RenderEntry = {
  id: string
  title: string
  subtitle: string
  meta: string
  date: string
  link: string
  bullets: { id: string; text: string }[]
  detail: string
}

export type RenderSection =
  | { id: string; type: string; kind: "entries"; title: string; entries: RenderEntry[] }
  | { id: string; type: "skills"; kind: "skills"; title: string; groups: { id: string; label: string; items: string }[] }
  | { id: string; type: "languages"; kind: "pairs"; title: string; pairs: { id: string; label: string; value: string }[] }

export type RenderModel = {
  doc: {
    name: string
    headline: string
    summary: string
    contact: { text: string; url: string }[]
    personal: { label: string; value: string }[]
    sections: RenderSection[]
  }
  style: {
    paper: "a4" | "us-letter"
    docName: string
    accent: string
    density: Density
    /** Base body size in pt, margins in mm, gap scale. Templates multiply from these. */
    size: number
    leading: number
    margin: number
    gap: number
  }
  meta: { title: string; author: string; keywords: string[] }
}

export const ACCENT_HEX: Record<Accent, string> = {
  ink: "#101114",
  violet: "#5847e8",
  navy: "#1f3a68",
  forest: "#1f5c3f",
  oxblood: "#7a2430",
  slate: "#3d4a5c",
}

const DENSITY: Record<Density, { size: number; leading: number; margin: number; gap: number }> = {
  comfortable: { size: 10.5, leading: 0.72, margin: 20, gap: 1.15 },
  standard: { size: 10, leading: 0.62, margin: 16, gap: 1 },
  compact: { size: 9.5, leading: 0.52, margin: 12, gap: 0.78 },
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim()
const nonEmpty = <T extends { text: string }>(xs: T[]) => xs.filter((b) => clean(b.text))

/** Only https, mailto and tel reach the PDF. A bare domain gets https://; anything else becomes plain text. */
export function safeUrl(raw: string) {
  const v = raw.trim()
  if (/^(https:\/\/|mailto:|tel:)\S+$/i.test(v)) return v
  if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v)) return `https://${v}`
  return ""
}

function sectionModel(section: ResumeSection, style: ReturnType<typeof styleOf>): RenderSection | null {
  const title = clean(section.title) || SECTION_LABELS[section.type]
  const ds = style.dateStyle
  switch (section.type) {
    case "experience":
    case "volunteering": {
      const entries = section.items
        .filter((i) => clean(i.role) || clean(i.org))
        .map((i) => ({
          id: i.id,
          title: clean(i.role),
          subtitle: clean(i.org),
          meta: clean(i.location),
          date: formatRange(i.start, i.end, i.current, ds),
          link: "",
          bullets: nonEmpty(i.bullets).map((b) => ({ id: b.id, text: clean(b.text) })),
          detail: "",
        }))
      return entries.length ? { id: section.id, type: section.type, kind: "entries", title, entries } : null
    }
    case "education": {
      const entries = section.items
        .filter((i) => clean(i.school) || clean(i.degree))
        .map((i) => ({
          id: i.id,
          title: clean(i.degree) || clean(i.school),
          subtitle: clean(i.degree) ? clean(i.school) : "",
          meta: clean(i.location),
          date: formatRange(i.start, i.end, i.current, ds),
          link: "",
          bullets: nonEmpty(i.bullets).map((b) => ({ id: b.id, text: clean(b.text) })),
          detail: "",
        }))
      return entries.length ? { id: section.id, type: section.type, kind: "entries", title, entries } : null
    }
    case "projects": {
      const entries = section.items
        .filter((i) => clean(i.name))
        .map((i) => {
          const url = safeUrl(i.link)
          return {
            id: i.id,
            title: clean(i.name),
            subtitle: clean(i.role),
            meta: url ? autoLabel(url, i.linkLabel) : "",
            date: formatRange(i.start, i.end, i.current, ds),
            link: url,
            bullets: nonEmpty(i.bullets).map((b) => ({ id: b.id, text: clean(b.text) })),
            detail: "",
          }
        })
      return entries.length ? { id: section.id, type: section.type, kind: "entries", title, entries } : null
    }
    case "skills": {
      const groups = section.items
        .map((g) => ({ id: g.id, label: clean(g.group), items: g.items.map(clean).filter(Boolean).join(", ") }))
        .filter((g) => g.items)
      return groups.length ? { id: section.id, type: "skills", kind: "skills", title, groups } : null
    }
    case "languages": {
      const pairs = section.items
        .filter((l) => clean(l.language))
        .map((l) => ({ id: l.id, label: clean(l.language), value: clean(l.level) }))
      return pairs.length ? { id: section.id, type: "languages", kind: "pairs", title, pairs } : null
    }
    default: {
      const entries = section.items
        .filter((i) => clean(i.title))
        .map((i) => {
          const url = safeUrl(i.link)
          return {
            id: i.id,
            title: clean(i.title),
            subtitle: clean(i.subtitle),
            meta: url ? autoLabel(url, i.linkLabel) : "",
            date: formatMonth(i.date, ds),
            link: url,
            bullets: [],
            detail: clean(i.detail),
          }
        })
      return entries.length ? { id: section.id, type: section.type, kind: "entries", title, entries } : null
    }
  }
}

function styleOf(design: ResumeDesign) {
  return PRESETS[design.preset] ?? PRESETS.us
}

export function toRenderModel(doc: ResumeDocument, design: ResumeDesign): RenderModel {
  const preset = styleOf(design)
  const b = doc.basics
  const contact: RenderModel["doc"]["contact"] = []
  // Only a plain address becomes a mailto link; "?bcc=" style extras stay as text.
  if (clean(b.email)) contact.push({ text: clean(b.email), url: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(clean(b.email)) ? `mailto:${clean(b.email)}` : "" })
  if (clean(b.phone)) contact.push({ text: clean(b.phone), url: `tel:${clean(b.phone).replace(/[^\d+]/g, "")}` })
  if (clean(b.location)) contact.push({ text: clean(b.location), url: "" })
  for (const l of b.links) {
    const url = safeUrl(l.url)
    if (url) contact.push({ text: autoLabel(url, l.label), url })
  }

  const personal = preset.personal
    .map((key) => ({ label: PERSONAL_LABELS[key], value: clean(doc.personal[key] ?? "") }))
    .filter((p) => p.value)

  const sections = doc.sections
    .filter((s) => !s.hidden)
    .map((s) => sectionModel(s, preset))
    .filter((s): s is RenderSection => s !== null)

  const keywords = sections.flatMap((s) => (s.kind === "skills" ? s.groups.flatMap((g) => g.items.split(", ")) : [])).slice(0, 30)

  return {
    doc: { name: clean(b.name) || "Your name", headline: clean(b.headline), summary: clean(b.summary), contact, personal, sections },
    style: {
      paper: design.paper ?? preset.paper,
      docName: preset.docName,
      accent: ACCENT_HEX[design.accent] ?? ACCENT_HEX.ink,
      density: design.density,
      ...DENSITY[design.density],
    },
    meta: {
      title: `${clean(b.name) || "Resume"}${clean(b.headline) ? ` – ${clean(b.headline)}` : ""}`,
      author: clean(b.name),
      keywords,
    },
  }
}
