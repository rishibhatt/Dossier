import { LLMHttpError } from "@/lib/llm/errors"

type ChatMessage = { role: "system" | "user" | "assistant"; content: string }

export async function openrouterComplete(params: {
  model: string
  system: string
  user: string
  temperature?: number
  jsonMode?: boolean
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new LLMHttpError("OPENROUTER_API_KEY is not configured", 503)

  const referer = process.env.OPENROUTER_SITE_URL ?? "https://localhost"
  const title = process.env.OPENROUTER_APP_NAME ?? "Dossier"

  const messages: ChatMessage[] = [
    { role: "system", content: params.system },
    { role: "user", content: params.user },
  ]

  const body: Record<string, unknown> = {
    model: params.model,
    messages,
    temperature: params.temperature ?? 0.35,
    max_tokens: 8192,
  }
  if (params.jsonMode !== false) {
    body.response_format = { type: "json_object" }
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": referer,
      "X-Title": title,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new LLMHttpError(`OpenRouter HTTP ${res.status}: ${t.slice(0, 400)}`, res.status)
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string | null } }[] }
  const text = json.choices?.[0]?.message?.content
  if (!text) throw new LLMHttpError("Empty completion from OpenRouter", 502)
  return text
}
