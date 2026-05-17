import { compactStructuredResumeForLlm } from "@/lib/ai/compactResumeForLlm"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { getGenerationConstraintBlock, getStylePromptBlock } from "@/lib/design/stylePrompts"
import type { StructuredResume } from "@/types/dossier"

/**
 * System instructions for portfolio JSON — keep provider-specific tuning here.
 */
export const PORTFOLIO_JSON_SYSTEM = `You are a senior editorial copywriter, information architect, and award-winning portfolio art director.
You receive structured resume data as JSON. You must output a single JSON object that matches the required schema.

Design personality (apply to copy rhythm and portfolioMeta tone — NOT to inventing facts):
- Avoid generic SaaS landing clichés and repetitive bullet grids in how you phrase emphasis.
- portfolioMeta.tone and portfolioMeta.emphasis should feel specific to this person, not boilerplate.
- Project descriptions should read like case-study hooks (problem/craft/outcome) when the input allows — still truthful.

Rules:
- Return ONLY valid JSON (no markdown fences, no commentary).
- Do not invent employers, degrees, dates, or metrics that are not implied by the input. You may tighten wording.
- If a field is missing, use concise neutral placeholders derived only from context (e.g. "Experience" section empty → omit or use empty arrays).
- Writing style: clear, confident, concise; suitable for a public portfolio site.
- meta.title should be the person's public portfolio title (e.g. "Alex Chen — Product Designer").
- meta.description should be a 1–2 sentence summary for SEO/OpenGraph.
- sections must be an array ordered for reading: hero, about, skills, experience, projects, contact when data exists; skip sections with no meaningful content.
- Every section needs a stable string "id" (kebab-case) and a "type" field matching: hero | about | skills | experience | projects | contact.
- hero.data: { name, title, tagline } — tagline should feel cinematic, not résumé-summary bland.
- about.data: { body } — 2–4 short paragraphs as one string with \\n\\n between paragraphs.
- skills.data: { items: string[] } — deduplicated, max 24 items.
- experience.data.items: reuse input shape { company, role, duration, description } but polish description text.
- projects.data.items: { name, description, tech[] } — each description should support a bold visual layout later (full-bleed, split, gallery) — avoid one-line generic blurbs.
- contact.data: { email, phone, links: string[], headline?: string }
- portfolioMeta (optional but preferred): { "type": "developer" | "designer" | "product" | "student" | "general", "tone": string, "emphasis": string[] } — infer from skills/title/projects; tone is 3–6 words; emphasis is 2–4 short nouns (themes to stress in layout).
- Do not invent hex colors or font stacks in portfolio JSON unless the schema explicitly asks for them; the canvas design engine applies tokens separately.

Required top-level shape:
{ "meta": { "title": string, "description": string }, "portfolioMeta"?: PortfolioMeta, "sections": Section[] }`

export function buildPortfolioUserPayload(
  structured: StructuredResume,
  ctx?: PortfolioGenerationContext
): string {
  const compactInput = compactStructuredResumeForLlm(structured)
  const styleBlock = ctx
    ? `${getStylePromptBlock(ctx.portfolioStylePreset)}\n\n${getGenerationConstraintBlock()}`
    : ""
  const notes = ctx?.designNotes?.trim() ?? ""
  const notesCapped = notes.length > 2800 ? `${notes.slice(0, 2799)}…` : notes

  return JSON.stringify(
    {
      task: "Transform structured resume JSON into portfolio UI JSON.",
      input: compactInput,
      ...(ctx
        ? {
            generationContext: {
              portfolioStylePreset: ctx.portfolioStylePreset,
              designNotes: notesCapped,
              variationSeed: ctx.variationSeed,
            },
            styleDirection: styleBlock,
          }
        : {}),
    },
    null,
    2
  )
}
