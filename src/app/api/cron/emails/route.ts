import { timingSafeEqual } from "node:crypto"

import { runLifecycleEmails } from "@/lib/email/events"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Daily lifecycle emails (activation, resume to site, invite, weekly visits, win-back, Pro renewal).
 * Called once a day by netlify/functions/daily-emails.mts with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const given = Buffer.from(request.headers.get("authorization") ?? "")
  const want = Buffer.from(`Bearer ${secret}`)
  if (!secret || given.length !== want.length || !timingSafeEqual(given, want)) return new Response("unauthorized", { status: 401 })

  try {
    const result = await runLifecycleEmails()
    console.log("[cron] lifecycle emails:", result)
    return Response.json(result)
  } catch (e) {
    console.error("[cron] lifecycle emails failed:", e)
    return new Response("failed", { status: 500 })
  }
}
