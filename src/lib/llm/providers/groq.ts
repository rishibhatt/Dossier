import Groq from "groq-sdk"

import { LLMHttpError, toLLMError } from "@/lib/llm/errors"
import type { ProviderCall, ProviderResult } from "@/lib/llm/types"

let nextKey = 0
const clients = new Map<string, Groq>()

function groqKeys(): string[] {
  const raw = [process.env.GROQ_API_KEYS, process.env.GROQ_API_KEY].filter(Boolean).join(",")
  return Array.from(new Set(raw.split(/[\s,]+/).map((k) => k.trim()).filter(Boolean)))
}

/** Round-robin start so load spreads across keys. */
function rotatedKeys(): string[] {
  const keys = groqKeys()
  if (keys.length <= 1) return keys
  const start = nextKey++ % keys.length
  return keys.slice(start).concat(keys.slice(0, start))
}

function client(apiKey: string): Groq {
  let c = clients.get(apiKey)
  if (!c) {
    c = new Groq({ apiKey, maxRetries: 0 })
    clients.set(apiKey, c)
  }
  return c
}

const mask = (k: string) => (k.length <= 8 ? "****" : `${k.slice(0, 4)}...${k.slice(-4)}`)

/** Only key problems (auth, per-key rate limit) are worth another key. Timeouts and outages are the model's: move on. */
const keyFault = (s: number | undefined) => s === 401 || s === 403 || s === 429

/**
 * Reasoning models spend completion tokens thinking. gpt-oss: lowest effort and no reasoning text in the reply.
 * qwen3: thinking off.
 */
function reasoningParams(model: string): { reasoning_effort?: "low" | "none" | "medium" | "high"; include_reasoning?: boolean } {
  if (model.startsWith("openai/gpt-oss")) return { reasoning_effort: "low", include_reasoning: false }
  if (model.startsWith("qwen/")) return { reasoning_effort: "none" }
  return {}
}

export async function groqComplete(p: ProviderCall): Promise<ProviderResult> {
  const keys = rotatedKeys()
  if (!keys.length) throw new LLMHttpError("GROQ_API_KEY or GROQ_API_KEYS is not configured", 503)

  const endAt = Date.now() + p.timeoutMs
  let last: LLMHttpError | null = null
  for (const apiKey of keys) {
    const left = endAt - Date.now()
    if (left < 500) break
    try {
      const completion = await client(apiKey).chat.completions.create(
        {
          model: p.model,
          messages: [
            { role: "system", content: p.system },
            { role: "user", content: p.user },
          ],
          temperature: p.temperature ?? 0.2,
          max_completion_tokens: p.maxTokens ?? 2000,
          ...reasoningParams(p.model),
          ...(p.jsonMode === false ? {} : { response_format: { type: "json_object" as const } }),
        },
        { timeout: left, maxRetries: 0, signal: p.signal }
      )
      const content = completion.choices[0]?.message?.content
      if (!content) throw new LLMHttpError("Empty completion from Groq", 502)
      const u = completion.usage
      return { content, usage: u ? { prompt: u.prompt_tokens ?? 0, completion: u.completion_tokens ?? 0 } : undefined }
    } catch (e: unknown) {
      const err = toLLMError(e, p.signal)
      if (!(err instanceof LLMHttpError)) throw err
      last = new LLMHttpError(`${err.message} (Groq key ${mask(apiKey)})`, err.status)
      if (!keyFault(err.status)) throw last
    }
  }
  throw last ?? new LLMHttpError("Groq: no time left for another key", 408)
}
