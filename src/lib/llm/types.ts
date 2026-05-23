import type { z } from "zod"

export type LLMTask = "extract" | "intent" | "enhance" | "layout" | "design" | "code" | "refine"

export type LLMProviderId = "groq" | "openrouter"

export type Mode = "fast" | "balanced" | "quality"

export type ModelRef = {
  provider: LLMProviderId
  model: string
}

export type LLMResponse = {
  content: string
  provider: LLMProviderId
  model: string
  /** Round-trip latency in milliseconds. */
  latency: number
}

export type RunLLMOptions<T = unknown> = {
  systemPrompt: string
  mode?: Mode
  temperature?: number
  /** When true (default), providers request JSON object mode where supported. */
  jsonMode?: boolean
  /** When set, parsed JSON is validated; failures trigger retry / fallback. */
  zodSchema?: z.ZodType<T>
  skipCache?: boolean
  /** Cache TTL override (ms). */
  cacheTtlMs?: number
  /** Per-provider request timeout. Keeps serverless requests inside platform limits. */
  timeoutMs?: number
  /** Transport retry attempts per provider. */
  maxAttempts?: number
  /** JSON/schema validation attempts per provider. */
  maxJsonAttempts?: number
  /** Whether to try the registry fallback provider after the primary fails. */
  useFallback?: boolean
}

export type RunLLMResult<T = string> = LLMResponse & {
  parsed?: T
  fromCache?: boolean
}
