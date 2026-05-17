/** Strips markdown code fences from model output before JSON.parse. */
export function stripJsonFence(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
  }
  return trimmed
}
