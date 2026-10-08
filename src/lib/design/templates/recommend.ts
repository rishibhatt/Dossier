import type { ParsedResume, PersonalityTone } from "@/lib/parseResume"

import { TEMPLATE_SPECS } from "./specs"
import type { DesignBrief, DesignTemplate, TemplateSpec, TemplateTone } from "./types"

function toPublic(s: TemplateSpec): DesignTemplate {
  const p = s.palettes[0]!
  return {
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    bestFor: s.bestFor,
    tones: s.tones,
    mode: s.mode,
    swatch: { bg: p.bg, surface: p.bg2, text: p.text, accent: p.primary },
    displayFont: s.fonts.display,
    layout: s.layout,
    hero: s.hero,
    bodyFont: s.fonts.body,
    direction: s.direction,
    order: s.order,
  }
}

export const TEMPLATES: readonly DesignTemplate[] = TEMPLATE_SPECS.map(toPublic)

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]))

export function getTemplate(id: string): DesignTemplate | undefined {
  return BY_ID.get(id)
}

const CATEGORY_ALIASES: [RegExp, string][] = [
  [/^(software|dev|developer|programmer|swe|frontend|backend|fullstack|full-stack|data|ml)\b/, "software"],
  [/^(design|designer|ux|ui|product-design)/, "design"],
  [/^(fin|finance|financial|accountant|accounting|banking|audit|tax)/, "finance"],
  [/^(mkt|marketing|growth|seo|content|brand|pr|comms)/, "marketing"],
  [/^(health|healthcare|nurse|nursing|medical|clinical|doctor|pharma)/, "healthcare"],
  [/^(legal|law|lawyer|attorney|paralegal|compliance)/, "legal"],
  [/^(edu|education|teacher|teaching|educator|tutor)/, "education"],
  [/^(culin|culinary|chef|cook|hospitality|food)/, "culinary"],
  [/^(eng|engineer|engineering|mechanical|civil|electrical|hardware)/, "engineering"],
  [/^(sales|bd|bizdev|account-exec|account)/, "sales"],
  [/^(hr|human|recruit|talent|people)/, "hr"],
  [/^(creative|artist|art|photo|writer|film|music)/, "creative"],
  [/^(academic|research|researcher|phd|professor|scientist|scholar)/, "academic"],
  [/^(exec|executive|ceo|cto|cfo|coo|vp|director|founder)/, "executive"],
  [/^(free|freelance|freelancer|consult|consultant|independent|contractor)/, "freelance"],
  [/^(student|fresher|graduate|grad|intern|junior-student)/, "student"],
  [/^(switch|switcher|pivot|career-change|changer|returner)/, "switcher"],
]

/** Map free-form category / LLM code onto template cluster keys. "unknown" when nothing matches. */
export function normalizeCategory(raw: string | undefined | null): string {
  const s = (raw ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-")
  if (!s || s === "other" || s === "unknown" || s === "general" || s === "generic") return "unknown"
  for (const [re, key] of CATEGORY_ALIASES) if (re.test(s)) return key
  return "unknown"
}

const PERSONALITY_TONES: Record<PersonalityTone, TemplateTone[]> = {
  technical: ["techy", "calm"],
  creative: ["bold", "playful"],
  corporate: ["formal", "calm"],
  academic: ["calm", "formal"],
}

type Factor = { label: string; weight: number }

function scoreTemplate(spec: TemplateSpec, parsed: ParsedResume, brief: DesignBrief | undefined): { score: number; factors: Factor[] } {
  const sig = parsed.signals
  const factors: Factor[] = []
  const add = (label: string, weight: number) => {
    if (weight !== 0) factors.push({ label, weight })
  }
  const m = spec.match

  const briefCat = brief?.category ? normalizeCategory(String(brief.category)) : "unknown"
  const resumeCat = normalizeCategory(sig.professionCluster)
  const category = briefCat !== "unknown" ? briefCat : resumeCat

  if (category !== "unknown") {
    if (m.clusters.includes(category)) add(`fits ${category}`, 50)
    else if (m.secondary?.includes(category)) add(`works for ${category}`, 22)
  }
  // The resume's own cluster as a lighter second opinion when the brief disagrees.
  if (briefCat !== "unknown" && resumeCat !== "unknown" && resumeCat !== briefCat && m.clusters.includes(resumeCat)) {
    add(`also fits ${resumeCat}`, 12)
  }

  // pseudo-categories derived from signals (stack on top of the profession)
  if (sig.seniorityLevel === "student" && m.clusters.includes("student")) add("student profile", 42)
  if (sig.seniorityLevel === "executive" && m.clusters.includes("executive")) add("executive seniority", 40)
  if (sig.personalityTone === "academic" && m.clusters.includes("academic") && category !== "software") add("academic profile", 30)
  if (sig.careerStage === "pivoting" && m.clusters.includes("switcher")) add("career change", 34)
  if (sig.contentRichness === "sparse" && m.clusters.includes("sparse")) add("short resume", 18)

  if (m.seniority?.includes(sig.seniorityLevel)) add(`${sig.seniorityLevel} level`, 8)
  if (m.stage?.includes(sig.careerStage)) add(`${sig.careerStage} career`, 6)
  if (m.personality?.includes(sig.personalityTone)) add(`${sig.personalityTone} personality`, 8)
  if (m.richness?.includes(sig.contentRichness)) add(`${sig.contentRichness} content`, 6)

  // projects / design work
  if (m.projectLed) {
    if (sig.hasProjects) add("projects up front", 6)
    else add("no projects to lead with", -14)
  }
  if (m.designy && sig.hasDesignWork) add("design work present", 10)

  // content volume
  if (sig.contentRichness === "sparse" && m.needsRich) add("needs more content", -10)
  if (sig.contentRichness === "dense" && m.clusters.includes("sparse")) add("resume is dense", -12)

  // brief hints
  if (brief?.tone && spec.tones.includes(brief.tone)) add(`${brief.tone} tone`, 14)
  else if (!brief?.tone) {
    const t = PERSONALITY_TONES[sig.personalityTone]
    if (t.some((x) => spec.tones.includes(x))) add("tone match", 5)
  }
  if (brief?.mode) {
    if (brief.mode === spec.mode) add(`${spec.mode} mode`, 10)
    else add("different mode", -14)
  }
  if (brief?.emphasis && brief.emphasis === m.emphasis) add(`${brief.emphasis}-first`, 10)
  if (brief?.prefer?.includes(spec.id)) add("style preference", 9)
  if (brief?.direction && brief.direction === spec.direction) add("preferred direction", 8)

  if (m.base) add("safe default", m.base)

  const score = Math.round(factors.reduce((a, f) => a + f.weight, 0))
  return { score, factors }
}

function reasonFrom(spec: TemplateSpec, factors: Factor[]): string {
  const top = factors
    .filter((f) => f.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2)
    .map((f) => f.label)
  if (top.length === 0) return `${spec.name}: versatile layout`
  const head = top.join(", ")
  return `${head.charAt(0).toUpperCase()}${head.slice(1)}`
}

/**
 * Pure and deterministic, zero tokens. Always returns `limit` templates (generic ones rank for
 * unknown/sparse resumes). Highest score first; ties fall back to catalogue order.
 */
export function recommendTemplates(
  parsed: ParsedResume,
  brief?: DesignBrief,
  limit = 6
): { template: DesignTemplate; score: number; reason: string }[] {
  const scored = TEMPLATE_SPECS.map((spec, idx) => {
    const { score, factors } = scoreTemplate(spec, parsed, brief)
    return { spec, idx, score, reason: reasonFrom(spec, factors) }
  })
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx)
  const n = Math.max(1, Math.min(limit, scored.length))
  return scored.slice(0, n).map((s) => ({ template: BY_ID.get(s.spec.id)!, score: s.score, reason: s.reason }))
}
