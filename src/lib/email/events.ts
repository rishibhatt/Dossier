import "server-only"

import type { SupabaseClient, User } from "@supabase/supabase-js"

import { markTestAccount } from "@/lib/admin/data"
import { sendEmail, type SendResult } from "@/lib/email/brevo"
import { siteConfig } from "@/config/site"
import { creditEmail, lifecycleEmail, passwordChangedEmail, planEmail, purchaseEmail, signInEmail, welcomeEmail, type Mail } from "@/lib/email/templates"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

type Admin = SupabaseClient<Database>

const DAY_MS = 24 * 60 * 60 * 1000

function displayName(user: Pick<User, "email" | "user_metadata">): string | undefined {
  const full = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined
  return full?.split(" ")[0]?.trim() || undefined
}

/**
 * Sends a one-time email. The log row is inserted first, so two parallel requests cannot both send.
 * If sending fails the row is removed, so the next attempt can try again.
 */
async function sendOnce(admin: Admin, userId: string, kind: string, to: string, toName: string | undefined, mail: Mail, unsubscribe?: string): Promise<boolean> {
  const { error } = await admin.from("email_log").insert({ user_id: userId, kind })
  if (error) return false // 23505 = already sent
  const res: SendResult = await sendEmail({ to, toName, ...mail, tags: [kind.split(":")[0]], unsubscribe })
  if (!res.ok) await admin.from("email_log").delete().eq("user_id", userId).eq("kind", kind)
  return res.ok
}

/** One-click link that turns product emails off. The per-user token stops anyone else from flipping it. */
export const unsubscribeUrl = (userId: string, token: string) => `${siteConfig.url}/api/email/unsubscribe?u=${userId}&t=${token}`

/**
 * After any sign in or sign up. A new account (under a day old) gets the welcome email once. An older
 * account gets a sign-in notice at most once a day. Set EMAIL_SIGNIN_ALERTS=0 to turn the notice off.
 * Never throws.
 */
export async function notifyAfterAuth(user: User): Promise<void> {
  await markTestAccount(user)
  try {
    const admin = createAdminSupabaseClient()
    if (!admin || !user.email) return

    const age = Date.now() - new Date(user.created_at).getTime()
    if (Number.isFinite(age) && age < DAY_MS) {
      await sendOnce(admin, user.id, "welcome", user.email, displayName(user), welcomeEmail(displayName(user)))
      return
    }
    if (process.env.EMAIL_SIGNIN_ALERTS === "0") return

    const since = new Date(Date.now() - DAY_MS).toISOString()
    const { data: recent } = await admin.from("email_log").select("id").eq("user_id", user.id).eq("kind", "signin").gte("created_at", since).limit(1)
    if (recent?.length) return
    const { error } = await admin.from("email_log").insert({ user_id: user.id, kind: "signin" })
    if (error) return
    const res = await sendEmail({ to: user.email, toName: displayName(user), ...signInEmail(new Date()), tags: ["signin"] })
    if (!res.ok) await admin.from("email_log").delete().eq("user_id", user.id).eq("kind", "signin").gte("created_at", since)
  } catch {
    /* Email trouble must never break sign in. */
  }
}

export async function notifyPasswordChanged(user: User): Promise<void> {
  try {
    if (!user.email) return
    await sendEmail({ to: user.email, toName: displayName(user), ...passwordChangedEmail(), tags: ["password"] })
  } catch {
    /* ignore */
  }
}

/** After a referral qualifies: tell both people about their credit. Idempotent per referral. */
export async function notifyCreditsEarned(refereeId: string): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    if (!admin) return
    const { data: ref } = await admin.from("referrals").select("id, referrer_id, referee_id, status").eq("referee_id", refereeId).maybeSingle()
    if (!ref || ref.status !== "qualified") return

    for (const [userId, role] of [
      [ref.referrer_id, "referrer"],
      [ref.referee_id, "referee"],
    ] as const) {
      const [{ data: u }, { data: bal }] = await Promise.all([
        admin.from("users").select("email, full_name").eq("id", userId).maybeSingle(),
        admin.from("credit_balances").select("balance").eq("user_id", userId).maybeSingle(),
      ])
      if (!u?.email) continue
      await sendOnce(admin, userId, `credit:${ref.id}`, u.email, u.full_name?.split(" ")[0] ?? undefined, creditEmail({ role, balance: bal?.balance }))
    }
  } catch {
    /* ignore */
  }
}

/** After an admin or a payment changes someone's plan. */
export async function notifyPlanChanged(userId: string, plan: "free" | "starter" | "pro", expiresAt: string | null): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    if (!admin) return
    const { data: u } = await admin.from("users").select("email, full_name").eq("id", userId).maybeSingle()
    if (!u?.email) return
    await sendEmail({ to: u.email, toName: u.full_name?.split(" ")[0] ?? undefined, ...planEmail({ plan, expiresAt }), tags: ["plan"] })
  } catch {
    /* ignore */
  }
}

/** Receipt after a Razorpay payment was granted (once per payment, see grant_purchase). */
export async function notifyPurchase(userId: string, product: string): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    if (!admin) return
    const { data: u } = await admin.from("users").select("email, full_name, plan_expires_at").eq("id", userId).maybeSingle()
    if (!u?.email) return
    await sendEmail({ to: u.email, toName: u.full_name?.split(" ")[0] ?? undefined, ...purchaseEmail({ product, expiresAt: product === "starter" ? null : u.plan_expires_at }), tags: ["purchase"] })
  } catch {
    /* ignore */
  }
}

/** After a first publish: the share kit. Once per account. */
export async function notifyPublished(userId: string): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    if (!admin) return
    const { data: u } = await admin.from("users").select("email, full_name, email_product, email_token, is_test").eq("id", userId).maybeSingle()
    if (!u?.email || !u.email_product || u.is_test) return
    const unsubscribe = unsubscribeUrl(userId, u.email_token)
    const mail = lifecycleEmail({ kind: "life:published", name: u.full_name?.split(" ")[0], unsubscribe })
    if (mail) await sendOnce(admin, userId, "life:published", u.email, u.full_name?.split(" ")[0] ?? undefined, mail, unsubscribe)
  } catch {
    /* ignore */
  }
}

/** The daily job: sends what lifecycle_candidates picks. Returns counts for the cron log. */
// 25 per run, 5 at a time, keeps the job well inside Netlify's function time limit. The rest go out on the next run.
export async function runLifecycleEmails(limit = 25): Promise<{ picked: number; sent: number }> {
  const admin = createAdminSupabaseClient()
  if (!admin) return { picked: 0, sent: 0 }
  const { data, error } = await admin.rpc("lifecycle_candidates", { p_limit: limit })
  if (error || !data) throw new Error(error?.message ?? "no candidates")
  const ids = data.map((c) => c.user_id)
  const { data: tokens } = ids.length ? await admin.from("users").select("id, email_token").in("id", ids) : { data: [] }
  const tokenOf = new Map((tokens ?? []).map((t) => [t.id, t.email_token]))
  let sent = 0
  for (let i = 0; i < data.length; i += 5) {
    const results = await Promise.all(
      data.slice(i, i + 5).map((c) => {
        const unsubscribe = unsubscribeUrl(c.user_id, tokenOf.get(c.user_id) ?? "")
        const mail = lifecycleEmail({ kind: c.kind, name: c.name, views: c.views, expiresAt: c.plan_expires_at, unsubscribe, referralUrl: undefined })
        return mail ? sendOnce(admin, c.user_id, c.kind, c.email, c.name ?? undefined, mail, c.kind.startsWith("life:") || c.kind.startsWith("views:") ? unsubscribe : undefined) : false
      })
    )
    sent += results.filter(Boolean).length
  }
  return { picked: data.length, sent }
}
