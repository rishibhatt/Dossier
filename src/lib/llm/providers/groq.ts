import Groq from "groq-sdk"

import { LLMHttpError } from "@/lib/llm/errors"

export async function groqComplete(params: {
  model: string
  system: string
  user: string
  temperature?: number
  jsonMode?: boolean
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new LLMHttpError("GROQ_API_KEY is not configured", 503)
  }

  const client = new Groq({ apiKey })
  try {
    const completion = await client.chat.completions.create({
      model: params.model,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      temperature: params.temperature ?? 0.35,
      max_tokens: 8192,
      ...(params.jsonMode === false ? {} : { response_format: { type: "json_object" as const } }),
    })
    const text = completion.choices[0]?.message?.content
    if (!text) throw new LLMHttpError("Empty completion from Groq", 502)
    return text
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "groq_error"
    let status: number | undefined
    if (e && typeof e === "object") {
      const o = e as Record<string, unknown>
      if (typeof o.status === "number") status = o.status
      else if (typeof o.statusCode === "number") status = o.statusCode
    }
    if (status === undefined && /^413\b/.test(msg)) status = 413
    if (status === undefined && /\b429\b/.test(msg)) status = 429
    throw new LLMHttpError(msg, status)
  }
}
