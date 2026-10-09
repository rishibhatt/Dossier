import { groqComplete } from "@/lib/llm/providers/groq"
import { openrouterComplete } from "@/lib/llm/providers/openrouter"
import type { LLMProviderId, ProviderCall, ProviderResult } from "@/lib/llm/types"

export function dispatchProvider(provider: LLMProviderId, call: ProviderCall): Promise<ProviderResult> {
  switch (provider) {
    case "groq":
      return groqComplete(call)
    case "openrouter":
      return openrouterComplete(call)
    default: {
      const _exhaustive: never = provider
      return _exhaustive
    }
  }
}
