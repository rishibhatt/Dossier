import { bulletsToDescription, type ResumeData } from "@/lib/pdf/extractSections"
import { compactResumeSchema, type CompactResume } from "@/lib/schemas/resumeBrief.schema"
import type { HighlightEntry } from "@/types/dossier"

/**
 * The one AI call per upload: read the resume, polish only the hero line and the about text.
 * Caveman prompt, short keys expanded in code. About 290 tokens.
 */
export const RESUME_BRIEF_SYSTEM = `Resume text -> one JSON object. Only facts in the text, never invent. Unknown: "" or [].
n name; t current title; loc city/region
pitch: hero line <=90 chars, what they do + one concrete fact, plain words, no name, no buzzwords
ab: about, 2-4 short first-person sentences from the facts, plain words, no buzzwords
k: skills <=20
e:[{c company,r role,d dates,l location,b:[<=5 bullets as written, <=130 chars, keep numbers]}]
p:[{n name,d what it is <=150 chars,t:[tech],u url}]
ed:[{i school,d degree,p years,x honors/GPA}]
cert:[{n name,i issuer,y year}]
h:[{v number exactly as written,l what it measures <=40 chars}] <=4 measurable results, else []
ct:{e email,p phone,l:[urls]}
b:{c dev|design|fin|mkt|health|legal|edu|culin|eng|sales|hr|creative|academic|exec|freelance|student|switcher|other,t calm|bold|playful|formal|techy|warm,m projects|experience|education|credentials}`

/** Completion cap: a dense resume compacts to ~1.2-1.5k output tokens; gpt-oss adds a little low-effort reasoning. */
export const RESUME_BRIEF_MAX_OUTPUT_TOKENS = 1_900

export { compactResumeSchema }

export type DesignBriefTone = "calm" | "bold" | "playful" | "formal" | "techy" | "warm"
export type DesignBriefEmphasis = "projects" | "experience" | "education" | "credentials"

export type ResumeBriefSummary = {
  /** Compact category code ("dev", "fin", "student" ...), "other" when unknown. */
  category: string
  tone?: DesignBriefTone
  emphasis?: DesignBriefEmphasis
  /** Hero one-liner (<=110 chars). */
  line: string
}

const TONES: readonly DesignBriefTone[] = ["calm", "bold", "playful", "formal", "techy", "warm"]
const EMPH: readonly DesignBriefEmphasis[] = ["projects", "experience", "education", "credentials"]

function oneOf<T extends string>(v: string, allowed: readonly T[]): T | undefined {
  const x = v.trim().toLowerCase()
  return (allowed as readonly string[]).includes(x) ? (x as T) : undefined
}

const PLACEHOLDER = /^(n\/?a|none|null|unknown|pitch|-+)?$/i
/** Words that make a portfolio sound generated. A sentence carrying one is dropped, not rewritten. */
export const BUZZWORDS = /\b(passionate|results[- ]driven|dynamic|synerg\w*|innovative|cutting[- ]edge|go-getter|self[- ]starter|detail[- ]oriented|team player|thought leader|guru|ninja|rockstar|leverag\w+|seasoned|visionary|world[- ]class)\b/i

const trimTo = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/[\s,;:]+\S*$/, "")}…`)
const cleanBullet = (b: string) => b.replace(/^[-•*\s]+/, "").replace(/\s+/g, " ").trim()

function dropBuzz(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? []
  return sentences.filter((s) => !BUZZWORDS.test(s)).join(" ")
}

const withScheme = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`)

const digitsOf =(s: string) => s.replace(/[^\d.]/g, "").replace(/^\.+|\.+$/g, "")

/** A highlight survives only if its number is literally in the resume. Models sometimes round or invent. */
export function verifyHighlights(items: HighlightEntry[], source: string): HighlightEntry[] {
  const hay = source.replace(/(\d),(\d)/g, "$1$2")
  const seen = new Set<string>()
  const out: HighlightEntry[] = []
  for (const h of items) {
    const value = h.value.trim()
    const label = h.label.replace(/\s+/g, " ").trim()
    const d = digitsOf(value)
    if (!d || !label || value.length > 12 || label.length > 60 || seen.has(value)) continue
    if (!new RegExp(`(?:^|[^\\d.])${d.replace(/\./g, "\\.")}(?![\\d])`).test(hay)) continue
    seen.add(value)
    out.push({ value, label: trimTo(label, 48) })
    if (out.length >= 4) break
  }
  return out
}

/** Expand short-key LLM output into the app's resume data + design brief. `source` is the text the model read. */
export function expandCompactResume(c: CompactResume, source: string): { data: ResumeData; brief: ResumeBriefSummary } {
  const data: ResumeData = {
    name: c.n,
    title: c.t,
    summary: c.ab,
    about: dropBuzz(c.ab),
    tagline: PLACEHOLDER.test(c.pitch) || BUZZWORDS.test(c.pitch) ? "" : trimTo(c.pitch, 110),
    location: c.loc,
    skills: c.k,
    experience: c.e.map((x) => {
      const highlights = x.b.map(cleanBullet).filter(Boolean).slice(0, 5).map((b) => trimTo(b, 160))
      return { company: x.c, role: x.r, duration: x.d, location: x.l || undefined, highlights, description: bulletsToDescription(highlights) }
    }),
    projects: c.p.map((x) => ({ name: x.n, description: x.d, tech: x.t, link: /^https?:\/\/|^[\w-]+\.[\w.-]+\//i.test(x.u) ? withScheme(x.u) : null })),
    education: c.ed.map((x) => ({ institution: x.i, degree: x.d, period: x.p, details: x.x })),
    certifications: c.cert.filter((x) => x.n).map((x) => ({ name: x.n, issuer: x.i, year: x.y })),
    highlights: verifyHighlights(c.h.map((x) => ({ value: x.v, label: x.l })), source),
    extracurricular: [],
    contact: { email: c.ct.e, phone: c.ct.p, links: c.ct.l.filter((l) => !l.includes("@")).map(withScheme) },
  }
  const brief: ResumeBriefSummary = {
    category: c.b.c.trim().toLowerCase() || "other",
    tone: oneOf(c.b.t, TONES),
    emphasis: oneOf(c.b.m, EMPH),
    line: data.tagline ?? "",
  }
  return { data, brief }
}

/** Is there enough to build a portfolio? Used as the router's `accept` so an empty answer falls through to the next model. */
export function isUsableCompact(c: CompactResume): boolean {
  const hasName = c.n.trim().length > 1
  const hasBody = c.e.length + c.p.length + c.ed.length > 0 || c.k.length >= 3
  return hasName && hasBody
}
