import { messages } from "@/config/messages"
import { ensurePortfolioMeta } from "@/lib/portfolio/ensurePortfolioMeta"
import type { ResumeData } from "@/lib/pdf/extractSections"
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  HighlightEntry,
  PortfolioDocument,
  PortfolioProfileKind,
  ProjectEntry,
  StructuredResume,
} from "@/types/dossier"

const BULLET_LEAD = /^[\s•●◦▪■►➢✓\-–—*>·]+/u

const clean = (s: string | undefined | null) =>
  (s ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()

/** First sentence-ish chunk up to `max` chars, cut on a boundary. */
function leadSentence(text: string, max: number): string {
  const t = clean(text)
  if (!t) return ""
  const m = t.match(/^(.{20,}?[.!?])(?:\s|$)/)
  const first = m?.[1] ?? t
  if (first.length <= max) return first
  const cut = first.slice(0, max)
  const sp = cut.lastIndexOf(" ")
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:\s]+$/, "")}…`
}

/** Break one long block into 2-3 readable paragraphs on sentence boundaries. */
function paragraphize(text: string): string {
  const t = text
    .split(/\n{2,}/)
    .map((p) => clean(p))
    .filter(Boolean)
  if (t.length > 1) return t.join("\n\n")
  const one = t[0] ?? ""
  if (one.length < 420) return one
  const sentences = one.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()) ?? [one]
  const paras: string[] = []
  let cur = ""
  for (const s of sentences) {
    if (cur && `${cur} ${s}`.length > 320 && paras.length < 2) {
      paras.push(cur)
      cur = s
    } else {
      cur = cur ? `${cur} ${s}` : s
    }
  }
  if (cur) paras.push(cur)
  return paras.join("\n\n")
}

function cleanDescription(text: string, max = 720): string {
  const joined = (text ?? "")
    .split(/\n+/)
    .map((l) => clean(l.replace(BULLET_LEAD, "")))
    .filter(Boolean)
    .join(" ")
  if (joined.length <= max) return joined
  const cut = joined.slice(0, max)
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "))
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`
}

function dedupe(items: string[], max: number, maxLen = 60): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of items) {
    const v = clean(raw.replace(BULLET_LEAD, ""))
    const k = v.toLowerCase()
    if (!v || v.length > maxLen || seen.has(k)) continue
    seen.add(k)
    out.push(v)
    if (out.length >= max) break
  }
  return out
}

const article = (w: string) => (/^[aeiou]/i.test(w) && !/^(?:uni|use|eu)/i.test(w) ? "an" : "a")
const startYear = (d: string) => d.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? ""
const isCurrent = (d: string) => /present|current|now|today|ongoing/i.test(d)

/** Hero line from the resume's own facts when the AI wrote none: "Staff Nurse at City Hospital Pune". */
function factTagline(d: Pick<ResumeData, "title" | "summary"> & { experience: ExperienceEntry[] }): string {
  const fromSummary = leadSentence(d.summary, 120)
  if (fromSummary) return fromSummary
  const e = d.experience[0]
  if (e?.role && e.company) return `${e.role} at ${e.company}`
  return clean(d.title)
}

/** First-person about text composed only from facts, used when the AI wrote none and there is no summary. */
function factAbout(experience: ExperienceEntry[], education: EducationEntry[], skills: string[]): string {
  const out: string[] = []
  const [now, prev] = experience
  if (now?.role && now.company) {
    const since = isCurrent(now.duration) ? startYear(now.duration) : ""
    out.push(
      since
        ? `I have worked as ${article(now.role)} ${now.role} at ${now.company} since ${since}.`
        : isCurrent(now.duration) || !now.duration
          ? `I work as ${article(now.role)} ${now.role} at ${now.company}.`
          : `I worked as ${article(now.role)} ${now.role} at ${now.company} (${now.duration}).`
    )
  }
  if (prev?.role && prev.company) out.push(`Before that I was ${article(prev.role)} ${prev.role} at ${prev.company}.`)
  if (skills.length >= 3) out.push(`I work with ${skills.slice(0, 2).join(", ")} and ${skills[2]}.`)
  const ed = education[0]
  if (ed?.degree && ed.institution) out.push(`I studied ${ed.degree} at ${ed.institution}.`)
  return out.join(" ")
}

export type BuildPortfolioOptions = {
  /** Hero line (AI pitch). Falls back to resume facts. */
  tagline?: string
  /** Brief-derived profile kind. */
  profileKind?: PortfolioProfileKind
  tone?: string
  emphasis?: string[]
}

/**
 * Deterministic resume data -> portfolio document. No LLM. Trims and dedupes copy, drops empty sections,
 * never invents. Section order here is canonical; the pipeline reorders per template afterwards.
 * Accepts plain StructuredResume (client/regenerate flows) or the fuller ResumeData from the pipeline.
 */
export function buildPortfolioFromStructured(structured: StructuredResume & Partial<ResumeData>, opts: BuildPortfolioOptions = {}): PortfolioDocument {
  const name = clean(structured.name) || "Portfolio"
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "portfolio"
  const skills = dedupe(structured.skills ?? [], 24)

  const experience: ExperienceEntry[] = (structured.experience ?? [])
    .map((e) => {
      const highlights = dedupe(e.highlights ?? [], 5, 220)
      const location = clean(e.location)
      return {
        company: clean(e.company),
        role: clean(e.role),
        duration: clean(e.duration),
        description: cleanDescription(e.description),
        ...(highlights.length ? { highlights } : {}),
        ...(location ? { location } : {}),
      }
    })
    .filter((e) => e.company || e.role || e.description)

  const title = clean(structured.title) || experience[0]?.role || ""

  const projects: ProjectEntry[] = (structured.projects ?? [])
    .map((p) => {
      const pname = clean(p.name)
      let desc = cleanDescription(p.description, 420)
      if (desc.toLowerCase() === pname.toLowerCase()) desc = ""
      const link = clean(p.link)
      return { name: pname || "Project", description: desc, tech: dedupe(p.tech ?? [], 8, 32), imageUrl: p.imageUrl ?? null, link: link || null }
    })
    .filter((p) => p.name !== "Project" || p.description)

  const education: EducationEntry[] = (structured.education ?? [])
    .map((ed) => ({ institution: clean(ed.institution), degree: clean(ed.degree), period: clean(ed.period), details: cleanDescription(ed.details, 240) }))
    .filter((ed) => ed.institution || ed.degree)

  const certifications: CertificationEntry[] = (structured.certifications ?? [])
    .map((c) => ({ name: clean(c.name), issuer: clean(c.issuer), year: clean(c.year) }))
    .filter((c) => c.name)
    .slice(0, 8)

  const highlights: HighlightEntry[] = (structured.highlights ?? [])
    .map((h) => ({ value: clean(h.value), label: clean(h.label) }))
    .filter((h) => h.value && h.label)
    .slice(0, 4)

  const summary = clean(structured.summary)
  const about = paragraphize(structured.about || summary || factAbout(experience, education, skills))
  const tagline = clean(opts.tagline || structured.tagline) || factTagline({ title, summary, experience })

  const email = clean(structured.contact?.email)
  const phone = clean(structured.contact?.phone)
  const links = dedupe(structured.contact?.links ?? [], 8, 160)
  const location = clean(structured.location)

  const sections: PortfolioDocument["sections"] = [{ id: `${slug}-hero`, type: "hero", data: { name, title, tagline } }]
  if (about) sections.push({ id: `${slug}-about`, type: "about", data: { body: about } })
  if (highlights.length) sections.push({ id: `${slug}-highlights`, type: "highlights", data: { items: highlights } })
  if (experience.length) sections.push({ id: `${slug}-experience`, type: "experience", data: { items: experience } })
  if (projects.length) sections.push({ id: `${slug}-projects`, type: "projects", data: { items: projects } })
  if (skills.length) sections.push({ id: `${slug}-skills`, type: "skills", data: { items: skills } })
  if (education.length) sections.push({ id: `${slug}-education`, type: "education", data: { items: education } })
  if (certifications.length) sections.push({ id: `${slug}-certifications`, type: "certifications", data: { items: certifications } })
  sections.push({
    id: `${slug}-contact`,
    type: "contact",
    data: { email, phone, links, headline: messages.dossier.sectionContact, ...(location ? { location } : {}) },
  })

  const doc: PortfolioDocument = {
    meta: {
      title: title ? `${name} — ${title}` : `${name} — Portfolio`,
      description: leadSentence(about, 160) || tagline || `${name}'s portfolio`,
    },
    sections,
  }

  const withMeta = ensurePortfolioMeta(doc, structured)
  if (!opts.profileKind && !opts.tone && !opts.emphasis) return withMeta
  const base = withMeta.portfolioMeta!
  return {
    ...withMeta,
    portfolioMeta: {
      type: opts.profileKind ?? base.type,
      tone: opts.tone?.trim() || base.tone,
      emphasis: opts.emphasis?.length ? opts.emphasis : base.emphasis,
    },
  }
}
