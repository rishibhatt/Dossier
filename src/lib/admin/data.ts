import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { CreditReason, Database, Json, PlanId } from "@/types/database"

type Admin = SupabaseClient<Database>

export type Overview = {
  totals: {
    users: number
    users_7d: number
    users_30d: number
    paid: number
    starter: number
    pro: number
    portfolios: number
    publishers: number
    credits_outstanding: number
    messages_new: number
    active_subscriptions: number
  }
  referrals: Record<string, number>
  usage_by_kind: Record<string, number>
  daily: { day: string; signups: number; publishes: number; builds: number }[]
}

const EMPTY: Overview = {
  totals: { users: 0, users_7d: 0, users_30d: 0, paid: 0, starter: 0, pro: 0, portfolios: 0, publishers: 0, credits_outstanding: 0, messages_new: 0, active_subscriptions: 0 },
  referrals: {},
  usage_by_kind: {},
  daily: [],
}

export async function getOverview(admin: Admin, days = 30): Promise<Overview> {
  const { data, error } = await admin.rpc("admin_overview", { p_days: days })
  if (error || !data) return EMPTY
  const o = data as unknown as Partial<Overview>
  return { ...EMPTY, ...o, totals: { ...EMPTY.totals, ...(o.totals ?? {}) } }
}

export async function getRecentSignups(admin: Admin, limit = 8) {
  const { data } = await admin.from("users").select("id, email, plan, created_at").order("created_at", { ascending: false }).limit(limit)
  return data ?? []
}

export async function getRecentSubscriptions(admin: Admin, limit = 8) {
  const { data } = await admin.from("subscriptions").select("id, user_id, provider, plan, status, current_period_end, created_at").order("created_at", { ascending: false }).limit(limit)
  const rows = data ?? []
  const ids = [...new Set(rows.map((r) => r.user_id))]
  const emails = await emailsFor(admin, ids)
  return rows.map((r) => ({ ...r, email: emails.get(r.user_id) ?? null }))
}

export async function emailsFor(admin: Admin, ids: string[]): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>()
  if (!ids.length) return map
  const { data } = await admin.from("users").select("id, email").in("id", ids)
  for (const u of data ?? []) map.set(u.id, u.email)
  return map
}

export const PAGE_SIZE = 25

export type UserRow = {
  id: string
  email: string | null
  username: string | null
  plan: PlanId
  plan_expires_at: string | null
  created_at: string
  balance: number
  portfolios: number
}

/** Search text is cut down to characters that cannot change the meaning of the filter string. */
function cleanQuery(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9@._+-]/g, "").slice(0, 80)
}

export async function listUsers(admin: Admin, { q, page, plan }: { q: string; page: number; plan: string }) {
  let query = admin.from("users").select("id, email, username, plan, plan_expires_at, created_at", { count: "exact" }).order("created_at", { ascending: false })
  const s = cleanQuery(q)
  if (s) query = query.or(`email.ilike.%${s}%,username.ilike.%${s}%`)
  if (plan === "free" || plan === "starter" || plan === "pro") query = query.eq("plan", plan)
  const from = Math.max(0, page - 1) * PAGE_SIZE
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1)
  const rows = data ?? []
  const ids = rows.map((r) => r.id)

  const [bal, pub] = await Promise.all([
    ids.length ? admin.from("credit_balances").select("user_id, balance").in("user_id", ids) : Promise.resolve({ data: [] as { user_id: string; balance: number }[] }),
    ids.length ? admin.from("published_portfolios").select("user_id").in("user_id", ids) : Promise.resolve({ data: [] as { user_id: string | null }[] }),
  ])
  const balance = new Map((bal.data ?? []).map((b) => [b.user_id, b.balance]))
  const portfolios = new Map<string, number>()
  for (const p of pub.data ?? []) if (p.user_id) portfolios.set(p.user_id, (portfolios.get(p.user_id) ?? 0) + 1)

  const users: UserRow[] = rows.map((r) => ({ ...r, balance: balance.get(r.id) ?? 0, portfolios: portfolios.get(r.id) ?? 0 }))
  return { users, total: count ?? 0 }
}

export async function getUserDetail(admin: Admin, id: string) {
  const { data: user } = await admin.from("users").select("*").eq("id", id).maybeSingle()
  if (!user) return null
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [bal, ledger, portfolios, asReferrer, asReferee, subs, usage, emails] = await Promise.all([
    admin.from("credit_balances").select("balance").eq("user_id", id).maybeSingle(),
    admin.from("credit_ledger").select("id, delta, reason, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("published_portfolios").select("slug, indexable, created_at, updated_at").eq("user_id", id).order("updated_at", { ascending: false }),
    admin.from("referrals").select("status").eq("referrer_id", id),
    admin.from("referrals").select("status, reject_reason, created_at").eq("referee_id", id).maybeSingle(),
    admin.from("subscriptions").select("provider, plan, status, current_period_end, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    admin.from("usage_events").select("kind").eq("user_id", id).gte("created_at", weekAgo).limit(1000),
    admin.from("email_log").select("kind, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
  ])

  const usageByKind: Record<string, number> = {}
  for (const u of usage.data ?? []) usageByKind[u.kind] = (usageByKind[u.kind] ?? 0) + 1
  const referred: Record<string, number> = {}
  for (const r of asReferrer.data ?? []) referred[r.status] = (referred[r.status] ?? 0) + 1

  return {
    user,
    balance: bal.data?.balance ?? 0,
    ledger: (ledger.data ?? []) as { id: number; delta: number; reason: CreditReason; created_at: string }[],
    portfolios: portfolios.data ?? [],
    referred,
    referredBy: asReferee.data,
    subscriptions: subs.data ?? [],
    usageByKind,
    emails: emails.data ?? [],
  }
}

export async function listMessages(admin: Admin) {
  const { data } = await admin.from("contact_messages").select("id, name, email, message, status, user_id, created_at").order("created_at", { ascending: false }).limit(100)
  return data ?? []
}

export async function listAudit(admin: Admin) {
  const { data } = await admin.from("admin_audit").select("id, admin_id, action, target_user, details, created_at").order("created_at", { ascending: false }).limit(100)
  const rows = data ?? []
  const emails = await emailsFor(admin, [...new Set(rows.flatMap((r) => [r.target_user, r.admin_id]).filter((x): x is string => Boolean(x)))])
  return rows.map((r) => ({ ...r, targetEmail: r.target_user ? (emails.get(r.target_user) ?? null) : null, adminEmail: emails.get(r.admin_id) ?? null, details: r.details as Json }))
}
