import { after } from "next/server"
import { z } from "zod"

import { siteConfig } from "@/config/site"
import { apiError, clientIpFromHeaders, hashIp, resolveCaller } from "@/lib/api/guard"
import { sendEmail } from "@/lib/email/brevo"
import { contactAckEmail, contactNoticeEmail } from "@/lib/email/templates"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(5).max(4000),
  /** Honeypot. People never see this field, so any value means a bot. */
  website: z.string().max(200).optional(),
})

const PER_IP_PER_HOUR = 3
const PER_EMAIL_PER_DAY = 5

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return apiError("invalid_json", 400)
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return apiError("invalid_body", 400, { message: "Check your name, email and message, then try again." })

  // A bot filled the hidden field. Answer as if it worked so it learns nothing.
  if (parsed.data.website) return Response.json({ ok: true })

  const admin = createAdminSupabaseClient()
  if (!admin) return apiError("unavailable", 503, { message: "The form is not available right now. Email us instead." })

  const ipHash = hashIp(clientIpFromHeaders(request.headers))
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [byIp, byEmail] = await Promise.all([
    admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo),
    admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("email", parsed.data.email).gte("created_at", dayAgo),
  ])
  if ((byIp.count ?? 0) >= PER_IP_PER_HOUR || (byEmail.count ?? 0) >= PER_EMAIL_PER_DAY) {
    return apiError("rate_limited", 429, { message: "You have sent a few messages already. Please wait a while, or email us directly." })
  }

  const caller = await resolveCaller()
  const { name, email, message } = parsed.data
  const { error } = await admin.from("contact_messages").insert({ name, email, message, ip_hash: ipHash, user_id: caller.user?.id ?? null })
  if (error) return apiError("save_failed", 503, { message: "We could not save your message. Please email us instead." })

  const inbox = process.env.CONTACT_INBOX || siteConfig.supportEmail
  after(async () => {
    await sendEmail({ to: inbox, ...contactNoticeEmail({ name, email, message, userId: caller.user?.id }), replyTo: { email, name }, tags: ["contact"] })
    await sendEmail({ to: email, toName: name, ...contactAckEmail(name), tags: ["contact-ack"] })
  })

  return Response.json({ ok: true })
}
