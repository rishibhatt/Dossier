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
}

export type RunLLMResult<T = string> = LLMResponse & {
  parsed?: T
  fromCache?: boolean
}
