import { z } from "zod"

import { apiError, consumeQuota, resolveCaller } from "@/lib/api/guard"
import { runLLMTask } from "@/lib/llm/router"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * AI polish for the free resume tools (summary and bullet generators). The rule-based draft stays the default;
 * this rewrites one draft for flow. Anonymous callers share a small per-IP daily cap (usage kind "polish").
 * The model may not add facts: an answer with a number that is not in the draft is rejected and the next model tries.
 */
const bodySchema = z.object({
  kind: z.enum(["summary", "bullet"]),
  text: z.string().trim().min(12).max(700),
  role: z.string().trim().max(120).optional(),
})

const answerSchema = z.object({ text: z.string().trim().min(12).max(700) })

const LIMITS = { summary: 600, bullet: 200 } as const

const SYSTEM: Record<"summary" | "bullet", string> = {
  summary: `You edit resume summaries. The draft was assembled from a template and reads stiffly. Rewrite it so it sounds like a capable person wrote it: vary the sentence structure, merge or reorder sentences, and choose sharper verbs. Two or three sentences, under ${LIMITS.summary} characters. Never return the draft unchanged.
Rules:
- Keep every fact, number, tool and job title from the draft. Add no new facts, numbers, employers, skills or claims about impact (no "delivering insights", "driving growth" and the like).
- Implied first person: no "I", "my" or "me". Start with the role or the strongest fact.
- Plain words. Never use: passionate, results-driven, dynamic, synergy, leverage, seasoned, proven track record, go-getter, detail-oriented.
- No em dashes, no exclamation marks.
Answer as JSON: {"text": "<the summary>"}`,
  bullet: `You edit resume bullet points. The draft was assembled from a template. Rewrite it as one tighter bullet under ${LIMITS.bullet} characters: keep the opening verb exactly, cut filler words, and keep the result at the end. Never return the draft unchanged.
Rules:
- Start with a strong past-tense action verb. End with the result.
- Keep every fact, number and tool from the draft. Add no new facts, numbers or claims. Write numbers as digits and keep the articles ("the").
- Implied first person: no "I", "my" or "me". No em dashes, no exclamation marks.
- Never use: spearheaded, leveraged, synergy, utilized, responsible for, helped.
Answer as JSON: {"text": "<the bullet>"}`,
}

/** Content words in `answer` with no match in `draft` (compared on the first five letters, so "reduced" matches "reduce"). */
const LINKING = new Set(
  "with which while that who whose after before through across using within from into than over under each every also both their this these those".split(" "),
)
const stems = (s: string) => (s.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !LINKING.has(w)).map((w) => w.slice(0, 5))
function novelWords(answer: string, draft: string) {
  const known = new Set(stems(draft))
  return new Set(stems(answer).filter((w) => !known.has(w))).size
}
/** A rewrite may swap a few verbs and linking words. More new words than this means it is adding claims. */
const MAX_NOVEL = { summary: 5, bullet: 3 } as const

const firstWord = (s: string) => (s.trim().split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z]/g, "")
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
const numbersIn = (s: string) => new Set((s.match(/\d[\d.,]*/g) ?? []).map((n) => n.replace(/[.,]+$/, "")))

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_input", 400)
  const { kind, text, role } = parsed.data

  const caller = await resolveCaller()
  const blocked = await consumeQuota(request, caller, "polish")
  if (blocked) return blocked

  const allowed = numbersIn(text)
  const limit = LIMITS[kind]
  try {
    const out = await runLLMTask("polish", `${role ? `Target role: ${role}\n` : ""}Draft:\n${text}`, {
      systemPrompt: SYSTEM[kind],
      mode: "balanced",
      zodSchema: answerSchema,
      accept: (a) =>
        squash(a.text) !== squash(text) &&
        // A bullet keeps its verb: "Managed" must not become "Optimized", a claim the person never made.
        (kind !== "bullet" || firstWord(a.text) === firstWord(text)) &&
        novelWords(a.text, text) <= MAX_NOVEL[kind] &&
        a.text.length <= limit + 40 &&
        [...numbersIn(a.text)].every((n) => allowed.has(n)) &&
        !/—|!/.test(a.text),
      temperature: 0.7,
      maxTokens: 400,
      budgetMs: 20_000,
      signal: request.signal,
    })
    if (!out.parsed) return apiError("polish_failed", 502)
    return Response.json({ text: out.parsed.text })
  } catch (e) {
    console.warn("[tools-polish]", e instanceof Error ? e.message.slice(0, 200) : String(e))
    return apiError("polish_failed", 502)
  }
}
