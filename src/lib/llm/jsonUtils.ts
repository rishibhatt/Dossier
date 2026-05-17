export function stripJsonFence(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
  }
  return trimmed
}

export function safeJsonParse(text: string): unknown {
  const cleaned = stripJsonFence(text)
  return JSON.parse(cleaned) as unknown
}
