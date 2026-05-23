import Groq from "groq-sdk"

import { LLMHttpError } from "@/lib/llm/errors"

let nextGroqKeyIndex = 0

function parseGroqKeys(): string[] {
  const raw = [process.env.GROQ_API_KEYS, process.env.GROQ_API_KEY].filter(Boolean).join(",")
  const keys = raw
    .split(/[\s,]+/)
    .map((key) => key.trim())
    .filter(Boolean)
  return Array.from(new Set(keys))
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****"
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

function getRotatedGroqKeys(): string[] {
  const keys = parseGroqKeys()
  if (keys.length <= 1) return keys
  const start = nextGroqKeyIndex % keys.length
  nextGroqKeyIndex = (nextGroqKeyIndex + 1) % keys.length
  return keys.slice(start).concat(keys.slice(0, start))
}

function isKeyFailoverError(status: number | undefined, message: string): boolean {
  const msg = message.toLowerCase()
  return (
    status === 401 ||
    status === 403 ||
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("tokens per minute") ||
    msg.includes("timeout") ||
    msg.includes("fetch failed") ||
    msg.includes("api key")
  )
}

function normalizeGroqError(e: unknown): LLMHttpError {
  const msg = e instanceof Error ? e.message : "groq_error"
  let status: number | undefined
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>
    if (typeof o.status === "number") status = o.status
    else if (typeof o.statusCode === "number") status = o.statusCode
  }
  if (status === undefined && /^413\b/.test(msg)) status = 413
  if (status === undefined && /\b429\b/.test(msg)) status = 429
  if (status === undefined && msg.toLowerCase().includes("timeout")) status = 408
  return new LLMHttpError(msg, status)
}

export async function groqComplete(params: {
  model: string
  system: string
  user: string
  temperature?: number
  jsonMode?: boolean
  timeoutMs?: number
}): Promise<string> {
  const keys = getRotatedGroqKeys()
  if (!keys.length) {
    throw new LLMHttpError("GROQ_API_KEY or GROQ_API_KEYS is not configured", 503)
  }

  let lastError: LLMHttpError | null = null
  for (const apiKey of keys) {
    const client = new Groq({
      apiKey,
      timeout: params.timeoutMs ?? 12_000,
      maxRetries: 0,
    })
    try {
      const completion = await client.chat.completions.create(
        {
          model: params.model,
          messages: [
            { role: "system", content: params.system },
            { role: "user", content: params.user },
          ],
          temperature: params.temperature ?? 0.35,
          max_tokens: 8192,
          ...(params.jsonMode === false ? {} : { response_format: { type: "json_object" as const } }),
        },
        {
          timeout: params.timeoutMs ?? 12_000,
          maxRetries: 0,
        }
      )
      const text = completion.choices[0]?.message?.content
      if (!text) throw new LLMHttpError("Empty completion from Groq", 502)
      return text
    } catch (e: unknown) {
      const normalized = normalizeGroqError(e)
      lastError = new LLMHttpError(`${normalized.message} (Groq key ${maskKey(apiKey)})`, normalized.status)
      if (!isKeyFailoverError(normalized.status, normalized.message)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new LLMHttpError("All Groq keys failed", 503)
}
