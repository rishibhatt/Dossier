/**
 * PDF -> portfolio pipeline. The AI reads the resume and polishes copy; design is a deterministic rules engine.
 *
 * PER-UPLOAD TOKEN BUDGET (free-tier models, caveman style)
 *   LLM calls ........ 1 (0 for scanned PDFs, cache hits and when no key is set)
 *   Input ............ ~290-token system prompt + <= 8,000 chars of cleaned resume (~2k tokens)
 *   Output cap ....... 1,900 tokens, JSON mode, short keys expanded in code, reasoning off/low
 *   Fallback ......... next model only after a timeout/limit/outage/unusable answer, all inside one 30 s budget
 *   Cache ............ LRU 100 x 15 min on (prompt, text): re-uploads cost 0 tokens
 * When every model fails, the offline regex reader result is used (source "fallback"), so users never see an AI error.
 */
import "server-only"

import { cleanResumeLines, compactResumeText, meaningfulChars } from "@/lib/ai/compactResumeText"
import { buildPortfolioFromStructured } from "@/lib/ai/portfolioGenerator"
import {
  RESUME_BRIEF_MAX_OUTPUT_TOKENS,
  RESUME_BRIEF_SYSTEM,
  compactResumeSchema,
  expandCompactResume,
  isUsableCompact,
  type ResumeBriefSummary,
} from "@/lib/ai/resumeBrief"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import {
  STYLE_PRESET_TEMPLATE_BIAS,
  buildConfigFromTemplate,
  getTemplateSpec,
  normalizeCategory,
  orderSectionsForTemplate,
  recommendTemplates,
  reorderSectionsByTemplate,
  type DesignBrief,
} from "@/lib/design/templates"
import { runLLMTask } from "@/lib/llm/router"
import type { Mode } from "@/lib/llm/types"
import { readResume, type ResumeData } from "@/lib/pdf/extractSections"
import { parsePdfFromBuffer } from "@/lib/pdf/parsePdf"
import { parsedFromStructured, type ParsedResume, type ProfessionCluster } from "@/lib/parseResume"
import type { BuildPreview, BuildStage } from "@/types/buildStream"
import type { PortfolioDocument, PortfolioProfileKind } from "@/types/dossier"
import type { DesignConfig } from "@/types/resolvedDesignConfig"

export type PortfolioPipelineStage = Exclude<BuildStage, "stream_started" | "response_done">
export type StageListener = (stage: PortfolioPipelineStage, preview?: BuildPreview) => void

/** Thrown for problems the user can fix (e.g. a scanned PDF). The route maps `code` to a friendly message. */
export class PipelineError extends Error {
  readonly code: "scanned_pdf"
  constructor(code: "scanned_pdf", message: string) {
    super(message)
    this.name = "PipelineError"
    this.code = code
  }
}

/** Below this many letters/digits the PDF has no text layer worth reading (a scan or an image). */
const MIN_MEANINGFUL_CHARS = 200
/** Whole AI budget per upload; each model attempt gets min(its timeout, what is left). */
const LLM_BUDGET_MS = 30_000

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "")

/** AI read wins; the regex read fills whatever the model left empty (and vets the email). Nothing is invented. */
function mergeResume(ai: ResumeData, rx: ResumeData): ResumeData {
  const experience = ai.experience.length
    ? ai.experience.map((e) => {
        const twin = rx.experience.find((r) => r.company && e.company && (norm(r.company).includes(norm(e.company)) || norm(e.company).includes(norm(r.company))))
        return {
          ...e,
          location: e.location || twin?.location,
          highlights: e.highlights?.length ? e.highlights : twin?.highlights,
          duration: e.duration || twin?.duration || "",
        }
      })
    : rx.experience
  const projects = ai.projects.length
    ? ai.projects.map((p) => ({ ...p, link: p.link || rx.projects.find((r) => norm(r.name) === norm(p.name))?.link || null }))
    : rx.projects
  return {
    name: ai.name || rx.name,
    title: ai.title || rx.title,
    summary: ai.summary || rx.summary,
    about: ai.about,
    tagline: ai.tagline,
    location: ai.location || rx.location,
    skills: ai.skills.length ? ai.skills : rx.skills,
    experience,
    projects,
    education: ai.education.length ? ai.education : rx.education,
    certifications: ai.certifications.length ? ai.certifications : rx.certifications,
    highlights: ai.highlights.length ? ai.highlights : rx.highlights,
    extracurricular: rx.extracurricular,
    contact: {
      email: EMAIL_RE.test(ai.contact.email) ? ai.contact.email : rx.contact.email,
      phone: ai.contact.phone || rx.contact.phone,
      links: Array.from(new Set([...ai.contact.links, ...rx.contact.links].map((l) => l.trim()).filter(Boolean))).slice(0, 8),
    },
  }
}

async function readWithAI(text: string, mode: Mode, signal: AbortSignal): Promise<{ data: ResumeData; brief: ResumeBriefSummary } | null> {
  try {
    const out = await runLLMTask("resume", text, {
      systemPrompt: RESUME_BRIEF_SYSTEM,
      mode,
      zodSchema: compactResumeSchema,
      accept: isUsableCompact,
      temperature: 0.1,
      maxTokens: RESUME_BRIEF_MAX_OUTPUT_TOKENS,
      budgetMs: LLM_BUDGET_MS,
      signal,
    })
    return out.parsed ? expandCompactResume(out.parsed, text) : null
  } catch (e) {
    console.warn("[resume-llm] using the offline reader:", e instanceof Error ? e.message.slice(0, 200) : String(e))
    return null
  }
}

const CATEGORY_TO_CLUSTER: Record<string, ProfessionCluster> = {
  software: "software",
  design: "design",
  finance: "finance",
  marketing: "marketing",
  healthcare: "healthcare",
  legal: "legal",
  education: "education",
  culinary: "culinary",
  engineering: "engineering",
  sales: "sales",
  hr: "hr",
  creative: "creative",
}

const CATEGORY_TO_PROFILE: Record<string, PortfolioProfileKind> = {
  software: "developer",
  engineering: "developer",
  design: "designer",
  creative: "designer",
  marketing: "product",
  sales: "product",
  student: "student",
}

/** The AI's category/tone override the keyword guesses; everything else comes from the resume data itself. */
function applyBrief(parsed: ParsedResume, category: string, brief: ResumeBriefSummary | null): ParsedResume {
  const signals = { ...parsed.signals }
  const cluster = CATEGORY_TO_CLUSTER[category]
  if (cluster) signals.professionCluster = cluster
  if (category === "executive") signals.seniorityLevel = "executive"
  if (category === "student") signals.seniorityLevel = "student"
  if (category === "switcher") signals.careerStage = "pivoting"
  if (brief?.tone === "techy") signals.personalityTone = "technical"
  else if (brief?.tone === "formal") signals.personalityTone = "corporate"
  else if (brief?.tone === "bold" || brief?.tone === "playful") signals.personalityTone = "creative"
  return { ...parsed, signals }
}

/** What the live-build view can show already. Only data read from the resume. */
export function previewOf(doc: PortfolioDocument): BuildPreview {
  const hero = doc.sections.find((s) => s.type === "hero")
  const count = (type: string) => {
    const s = doc.sections.find((x) => x.type === type)
    return s && "items" in s.data && Array.isArray(s.data.items) ? s.data.items.length : 0
  }
  return {
    name: hero?.type === "hero" ? hero.data.name : undefined,
    title: hero?.type === "hero" ? hero.data.title : undefined,
    sections: doc.sections.map((s) => s.type),
    counts: { roles: count("experience"), projects: count("projects"), skills: count("skills"), education: count("education"), highlights: count("highlights") },
  }
}

export type TemplateRecommendation = { id: string; name: string; reason: string }

export type PortfolioBriefOut = {
  category: string
  tone: string | null
  emphasis: string | null
  line: string
  source: "ai" | "fallback"
}

/**
 * Full PDF -> portfolio orchestration: fast regex read (live preview), one compact AI read, deterministic
 * document build, deterministic template choice. `signal` cancels the AI call when the client goes away.
 */
export async function executePortfolioPipeline(
  buffer: Buffer,
  generationContext: PortfolioGenerationContext,
  options?: { mode?: Mode; onStage?: StageListener; signal?: AbortSignal }
) {
  const mode: Mode = options?.mode ?? generationContext.llmMode ?? "balanced"
  const emit = options?.onStage ?? (() => {})

  const rawText = await parsePdfFromBuffer(buffer)
  // Clean once; the regex reader and the AI see the same lines.
  const lines = cleanResumeLines(rawText)
  if (meaningfulChars(lines) < MIN_MEANINGFUL_CHARS) {
    throw new PipelineError("scanned_pdf", "This PDF has no readable text (it looks like a scan or an image).")
  }
  const cleanedText = lines.join("\n")
  const regex = readResume(lines)
  emit("pdf_text_extracted", previewOf(buildPortfolioFromStructured(regex)))

  const compact = compactResumeText(lines)
  const ai = await readWithAI(compact, mode, options?.signal ?? new AbortController().signal)
  const source: "ai" | "fallback" = ai ? "ai" : "fallback"
  const data = ai ? mergeResume(ai.data, regex) : regex
  const brief = ai?.brief ?? null
  const category = normalizeCategory(brief?.category)

  let document = buildPortfolioFromStructured(data, {
    tagline: brief?.line,
    profileKind: CATEGORY_TO_PROFILE[category],
    tone: brief?.tone ? `${brief.tone}, ${category === "unknown" ? "professional" : category}` : undefined,
    emphasis: brief?.emphasis ? [brief.emphasis] : undefined,
  })
  emit("llm_extract_done", { ...previewOf(document), source })

  const parsedResume = applyBrief(parsedFromStructured(data, cleanedText), category, brief)

  // --- deterministic template selection (0 tokens) ---
  const designBrief: DesignBrief = {
    category: category === "unknown" ? undefined : category,
    tone: brief?.tone,
    emphasis: brief?.emphasis,
    prefer: generationContext.autoStyle ? undefined : STYLE_PRESET_TEMPLATE_BIAS[generationContext.portfolioStylePreset],
    direction: generationContext.designDirection ?? undefined,
  }
  const ranked = recommendTemplates(parsedResume, designBrief, 8)
  let top = ranked[0]!
  if (generationContext.designDirection) {
    const match = ranked.find((r) => r.template.direction === generationContext.designDirection)
    if (match && match.score >= top.score - 35) top = match
  }

  const spec = getTemplateSpec(top.template.id)
  if (spec) {
    const order = orderSectionsForTemplate(spec, document.sections.map((s) => s.type))
    document = reorderSectionsByTemplate(document, order)
  }

  const designConfig: DesignConfig = buildConfigFromTemplate(parsedResume, top.template.id, generationContext.variationSeed, {
    sectionTypes: document.sections.map((s) => s.type),
  })
  const c = designConfig.tokens.colors
  emit("layout_done", {
    ...previewOf(document),
    source,
    template: { id: top.template.id, name: top.template.name, display: designConfig.tokens.typography.displayFont, bg: c.bg, text: c.text, accent: c.accent },
  })

  const recommendations: TemplateRecommendation[] = ranked.slice(0, 6).map((r) => ({ id: r.template.id, name: r.template.name, reason: r.reason }))

  const briefOut: PortfolioBriefOut = {
    category: category === "unknown" ? "other" : category,
    tone: brief?.tone ?? null,
    emphasis: brief?.emphasis ?? null,
    line: brief?.line ?? "",
    source,
  }

  return {
    structuredData: data,
    parsedResume,
    portfolioData: document,
    designConfig,
    templateId: top.template.id,
    recommendations,
    brief: briefOut,
    source,
  }
}
