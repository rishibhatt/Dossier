import type { LLMProviderId } from "@/lib/llm/types"
import { groqComplete } from "@/lib/llm/providers/groq"
import { openrouterComplete } from "@/lib/llm/providers/openrouter"

export async function dispatchProvider(
  provider: LLMProviderId,
  args: { model: string; system: string; user: string; temperature?: number; jsonMode?: boolean }
): Promise<string> {
  switch (provider) {
    case "groq":
      return groqComplete(args)
    case "openrouter":
      return openrouterComplete(args)
    default: {
      const _exhaustive: never = provider
      return _exhaustive
    }
  }
}
