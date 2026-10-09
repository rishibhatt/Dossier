import "server-only"

/**
 * Sends one transactional email through Brevo's API. Never throws: a failed email must not break sign in,
 * publishing or a contact form. Env: BREVO_API_KEY, BREVO_SENDER_EMAIL (a verified sender), BREVO_SENDER_NAME.
 */
export type SendInput = {
  to: string
  toName?: string
  subject: string
  html: string
  text: string
  replyTo?: { email: string; name?: string }
  /** Shows up in Brevo's logs so you can filter by kind. */
  tags?: string[]
}

export type SendResult = { ok: true } | { ok: false; error: string }

const ENDPOINT = "https://api.brevo.com/v3/smtp/email"

export function emailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL)
}

async function attempt(body: string, apiKey: string): Promise<{ status: number; text: string } | { error: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body,
      signal: controller.signal,
    })
    return { status: res.status, text: await res.text().catch(() => "") }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "network error" }
  } finally {
    clearTimeout(timer)
  }
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!apiKey || !senderEmail) return { ok: false, error: "brevo_not_configured" }

  const body = JSON.stringify({
    sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "Dossier" },
    to: [{ email: input.to, ...(input.toName ? { name: input.toName } : {}) }],
    subject: input.subject,
    htmlContent: input.html,
    textContent: input.text,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    ...(input.tags?.length ? { tags: input.tags } : {}),
  })

  let out = await attempt(body, apiKey)
  // One retry for a network failure or a 5xx. A 4xx (bad key, unverified sender) will not improve.
  if ("error" in out || out.status >= 500) out = await attempt(body, apiKey)

  if ("error" in out) {
    console.error("[email] send failed:", out.error)
    return { ok: false, error: out.error }
  }
  if (out.status >= 200 && out.status < 300) return { ok: true }
  console.error(`[email] Brevo ${out.status}:`, out.text.slice(0, 300))
  return { ok: false, error: `brevo_${out.status}` }
}
