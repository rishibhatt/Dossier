import { cleanResumeLines, compactResumeText } from "@/lib/ai/compactResumeText"
import { buildPortfolioFromStructured } from "@/lib/ai/portfolioGenerator"
import { RESUME_BRIEF_MAX_OUTPUT_TOKENS, RESUME_BRIEF_SYSTEM, compactResumeSchema, expandCompactResume, isUsableCompact } from "@/lib/ai/resumeBrief"
import { resolveModelChain } from "@/lib/llm/registry"
import { runLLMTask } from "@/lib/llm/router"

export const runtime = "nodejs"

const SAMPLE = `Priya Nair
Staff Nurse, City Hospital Pune
priya.nair@example.com | +91 98765 43210
EXPERIENCE
Staff Nurse, City Hospital Pune, 2017 - present. ICU care, patient triage, handover notes, mentoring 6 junior nurses.
Nurse Intern, District Hospital Satara, 2016 - 2017. Ward rounds, vitals, medication charts.
SKILLS BLS, ACLS, EHR, triage, patient education
EDUCATION B.Sc Nursing, Pune University, 2016`

/**
 * Dev only. Runs one real resume call and reports which model answered and the tokens it used.
 * Try a broken chain to watch the fallback work:
 *   /api/dev/llm?chain=groq:not-a-real-model,groq:openai/gpt-oss-20b
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 })

  const chainParam = new URL(request.url).searchParams.get("chain")
  const previous = process.env.LLM_MODELS_RESUME
  if (chainParam) process.env.LLM_MODELS_RESUME = chainParam

  const started = Date.now()
  try {
    const chain = resolveModelChain("resume").map((r) => `${r.provider}:${r.model}`)
    const text = compactResumeText(cleanResumeLines(SAMPLE))
    const out = await runLLMTask("resume", text, {
      systemPrompt: RESUME_BRIEF_SYSTEM,
      zodSchema: compactResumeSchema,
      accept: isUsableCompact,
      temperature: 0.1,
      maxTokens: RESUME_BRIEF_MAX_OUTPUT_TOKENS,
      skipCache: true,
    })
    const expanded = out.parsed ? expandCompactResume(out.parsed, text) : null
    const doc = expanded ? buildPortfolioFromStructured(expanded.data, { tagline: expanded.brief.line }) : null
    return Response.json({ ok: true, chain, usedModel: `${out.provider}:${out.model}`, tried: out.tried, usage: out.usage, ms: Date.now() - started, brief: expanded?.brief, document: doc })
  } catch (e) {
    return Response.json({ ok: false, ms: Date.now() - started, error: e instanceof Error ? e.message : String(e) }, { status: 502 })
  } finally {
    if (chainParam) {
      if (previous === undefined) delete process.env.LLM_MODELS_RESUME
      else process.env.LLM_MODELS_RESUME = previous
    }
  }
}
