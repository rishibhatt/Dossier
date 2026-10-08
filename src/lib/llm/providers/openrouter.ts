import { LLMHttpError, toLLMError } from "@/lib/llm/errors"
import type { ProviderCall, ProviderResult } from "@/lib/llm/types"

/** Models that think before answering: keep the effort low and leave the reasoning out of the reply. */
const REASONING = /nemotron|deepseek-r1|qwq|gpt-oss/i

export async function openrouterComplete(p: ProviderCall): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new LLMHttpError("OPENROUTER_API_KEY is not configured", 503)

  const body: Record<string, unknown> = {
    model: p.model,
    messages: [
      { role: "system", content: p.system },
      { role: "user", content: p.user },
    ],
    temperature: p.temperature ?? 0.2,
    max_tokens: p.maxTokens ?? 2000,
  }
  if (p.jsonMode !== false) body.response_format = { type: "json_object" }
  if (REASONING.test(p.model)) body.reasoning = { effort: "low", exclude: true }

  const timeout = AbortSignal.timeout(p.timeoutMs)
  const signal = p.signal ? AbortSignal.any([p.signal, timeout]) : timeout

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Dossier",
      },
      body: JSON.stringify(body),
      signal,
    })
    if (!res.ok) {
      const t = await res.text().catch(() => "")
      throw new LLMHttpError(`OpenRouter HTTP ${res.status}: ${t.slice(0, 300)}`, res.status)
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string | null } }[]
      usage?: { prompt_tokens?: number; completion_tokens?: number }
    }
    const content = json.choices?.[0]?.message?.content
    if (!content) throw new LLMHttpError("Empty completion from OpenRouter", 502)
    const u = json.usage
    return { content, usage: u ? { prompt: u.prompt_tokens ?? 0, completion: u.completion_tokens ?? 0 } : undefined }
  } catch (e) {
    throw toLLMError(e, p.signal)
  }
}
