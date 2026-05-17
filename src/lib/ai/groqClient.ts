import Groq from "groq-sdk"

const MODEL = "llama-3.3-70b-versatile" as const

export type CompletionParams = {
  system: string
  user: string
  temperature?: number
  /** When false, Groq returns free text (e.g. JSX source). Default true for structured JSON APIs. */
  jsonMode?: boolean
}

/**
 * Thin Groq wrapper — swap provider by changing this module only.
 */
export async function generateCompletion(params: CompletionParams): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const client = new Groq({ apiKey })

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
    temperature: params.temperature ?? 0.35,
    max_tokens: 8192,
    ...(params.jsonMode === false ? {} : { response_format: { type: "json_object" as const } }),
  })

  const text = completion.choices[0]?.message?.content
  if (!text) {
    throw new Error("Empty completion from Groq")
  }

  return text
}
