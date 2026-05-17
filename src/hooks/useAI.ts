"use client"

import { useCallback, useMemo } from "react"

export type AIRequest = {
  prompt: string
  context?: Record<string, string>
}

export type AIResponse = {
  text: string
}

/**
 * Future-facing AI facade — keep orchestration here, not in presentational components.
 */
export function useAI() {
  const runPrompt = useCallback(async (request: AIRequest): Promise<AIResponse> => {
    void request
    throw new Error("AI provider not configured")
  }, [])

  return useMemo(() => ({ runPrompt }), [runPrompt])
}
