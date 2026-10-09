import "server-only"

import { randomInt } from "node:crypto"

import type { SupabaseClient, User } from "@supabase/supabase-js"

import { siteConfig } from "@/config/site"
import { hashIp } from "@/lib/api/guard"
import {
  REFERRAL_CODE_PATTERN,
  REFERRAL_COOKIE,
  REFERRAL_WINDOW_DAYS,
  REJECT_REASON_LABEL,
} from "@/lib/credits/constants"
import { getActiveShufflePacks, getCreditBalance } from "@/lib/credits/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import type { CreditReason, Database, ReferralStatus } from "@/types/database"

type Client = SupabaseClient<Database>

const DAY_MS = 24 * 60 * 60 * 1000
/** Allow for clock skew between the browser click, our server and Supabase auth. */
const CLOCK_SKEW_MS = 2 * 60 * 1000
/** Letters and digits that are hard to misread (no l, o, 0, 1). */
const CODE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"

/** Small hardcoded list of throwaway inbox providers. Extend as abuse shows up; keep it lowercase. */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tempmail.dev",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.net",
  "getnada.com",
  "nada.email",
  "trashmail.com",
  "maildrop.cc",
  "dispostable.com",
  "fakeinbox.com",
  "mintemail.com",
  "mohmal.com",
  "emailondeck.com",
  "moakt.com",
  "tempr.email",
  "burnermail.io",
  "spamgourmet.com",
  "mailnesia.com",
  "inboxkitten.com",
  "1secmail.com",
])

export function referralShareUrl(code: string) {
  return `${siteConfig.url}/r/${code}`
}

function generateCode(): string {
  let out = ""
  for (let i = 0; i < 8; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return out
}

/** The user's share code, created on first use. */
export async function ensureReferralCode(admin: Client, userId: string): Promise<string | null> {
  const { data: existing } = await admin.from("referral_codes").select("code").eq("user_id", userId).maybeSingle()
  if (existing?.code) return existing.code

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode()
    const { data, error } = await admin.from("referral_codes").insert({ user_id: userId, code }).select("code").single()
    if (!error && data) return data.code
    // 23505 = unique violation: either the code collided (retry) or a parallel request created this user's row.
    const { data: raced } = await admin.from("referral_codes").select("code").eq("user_id", userId).maybeSingle()
    if (raced?.code) return raced.code
  }
  return null
}

export type ReferralCookie = { code: string; clickedAt: number }

export function encodeReferralCookie(code: string, clickedAt = Date.now()) {
  return `${code}.${clickedAt}`
}

export function parseReferralCookie(value: string | undefined | null): ReferralCookie | null {
  if (!value) return null
  const [code, ts] = value.split(".")
  const clickedAt = Number(ts)
  if (!code || !REFERRAL_CODE_PATTERN.test(code) || !Number.isFinite(clickedAt)) return null
  if (Date.now() - clickedAt > REFERRAL_WINDOW_DAYS * DAY_MS) return null
  if (clickedAt - Date.now() > CLOCK_SKEW_MS) return null
  return { code, clickedAt }
}

/** Lowercase, drop "+tag", and drop dots for Gmail, so one inbox cannot pose as two people. */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const [localRaw, domainRaw] = email.trim().toLowerCase().split("@")
  if (!localRaw || !domainRaw) return null
  let local = localRaw.split("+")[0] ?? localRaw
  const domain = domainRaw === "googlemail.com" ? "gmail.com" : domainRaw
  if (domain === "gmail.com") local = local.replace(/\./g, "")
  return `${local}@${domain}`
}

function emailDomain(email: string | null | undefined) {
  return email?.trim().toLowerCase().split("@")[1] ?? null
}

type CookieJar = {
  get: (name: string) => { value: string } | undefined
  delete: (name: string) => unknown
}

/**
 * Runs after sign up, OAuth callback and sign in. Records the signup IP hash for brand-new accounts and,
 * when a `dx_ref` cookie is present, creates the `referrals` row (signed_up or rejected with a reason).
 * Clears the cookie either way. Never throws: a referral problem must not break sign in.
 */
export async function captureReferralAfterAuth({
  user,
  cookies,
  ip,
}: {
  user: User
  cookies: CookieJar
  ip: string
}): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    if (!admin) return

    const ipHash = ip && ip !== "unknown" ? hashIp(ip) : null
    const createdAt = new Date(user.created_at).getTime()
    const freshAccount = Number.isFinite(createdAt) && Date.now() - createdAt < DAY_MS

    if (freshAccount && ipHash) {
      await admin.from("users").update({ signup_ip_hash: ipHash }).eq("id", user.id).is("signup_ip_hash", null)
    }

    const raw = cookies.get(REFERRAL_COOKIE)?.value
    if (!raw) return
    cookies.delete(REFERRAL_COOKIE)

    const ref = parseReferralCookie(raw)
    if (!ref) return

    const { data: owner } = await admin.from("referral_codes").select("user_id").eq("code", ref.code).maybeSingle()
    if (!owner) return

    // One referral per referee, ever. An existing row (any status) wins.
    const { data: already } = await admin.from("referrals").select("id").eq("referee_id", user.id).maybeSingle()
    if (already) return

    const reject = await rejectReason(admin, { referrerId: owner.user_id, user, ref, createdAt, ipHash })

    // The table forbids referrer = referee, so a self-click is simply not recorded.
    if (reject === "self_referral") return

    await admin.from("referrals").insert({
      referrer_id: owner.user_id,
      referee_id: user.id,
      code: ref.code,
      status: reject ? "rejected" : "signed_up",
      reject_reason: reject,
      clicked_at: new Date(ref.clickedAt).toISOString(),
      referee_ip_hash: ipHash,
    })
  } catch {
    /* Swallowed on purpose: attribution is best effort. */
  }
}

async function rejectReason(
  admin: Client,
  {
    referrerId,
    user,
    ref,
    createdAt,
    ipHash,
  }: { referrerId: string; user: User; ref: ReferralCookie; createdAt: number; ipHash: string | null }
): Promise<string | null> {
  if (referrerId === user.id) return "self_referral"

  // The account must be created after the click, and within the referral window.
  if (!Number.isFinite(createdAt) || createdAt + CLOCK_SKEW_MS < ref.clickedAt) return "existing_account"
  if (createdAt - ref.clickedAt > REFERRAL_WINDOW_DAYS * DAY_MS) return "expired"

  const domain = emailDomain(user.email)
  if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) return "disposable_email"

  const { data: referrer } = await admin
    .from("users")
    .select("email, signup_ip_hash")
    .eq("id", referrerId)
    .maybeSingle()

  const a = normalizeEmail(referrer?.email)
  const b = normalizeEmail(user.email)
  if (a && b && a === b) return "same_email"

  if (ipHash && referrer?.signup_ip_hash && referrer.signup_ip_hash === ipHash) return "same_network"

  return null
}

/**
 * Called after a user's first successful publish. Qualifies their referral (if any) and pays both sides
 * one credit, inside a Postgres function that is idempotent and enforces the referrer's monthly cap.
 */
export async function qualifyReferralAfterFirstPublish(userId: string): Promise<void> {
  try {
    const admin = createAdminSupabaseClient()
    if (!admin) return
    await admin.rpc("qualify_referral", { p_referee: userId })
  } catch {
    /* Best effort: a failed qualification can be re-run, the function is idempotent. */
  }
}

export type ReferralListItem = {
  id: string
  status: ReferralStatus
  statusLabel: string
  createdAt: string
  qualifiedAt: string | null
}

export type LedgerItem = { id: number; delta: number; reason: CreditReason; label: string; createdAt: string }

export type ReferralSummary = {
  code: string | null
  shareUrl: string | null
  counts: Record<ReferralStatus, number>
  balance: number
  ledger: LedgerItem[]
  referrals: ReferralListItem[]
  /** ISO expiry of each shuffle pack still active. */
  activePacks: string[]
}

const LEDGER_LABEL: Record<CreditReason, string> = {
  referral_referrer: "Someone you invited published their site",
  referral_referee: "Welcome credit for joining through an invite",
  spend_shuffle_pack: "Spent on 20 more shuffles a day for 7 days",
  spend_starter_unlock: "Spent on Starter",
  admin_adjustment: "Adjustment",
}

function statusLabel(status: ReferralStatus, reason: string | null) {
  if (status === "qualified") return "Published. You both got a credit"
  if (status === "signed_up") return "Signed up, not published yet"
  return `Not counted: ${(reason && REJECT_REASON_LABEL[reason]) || "did not meet the rules"}`
}

/** Everything the referrals page and GET /api/referrals show. Service-role client. */
export async function getReferralSummary(admin: Client, userId: string): Promise<ReferralSummary> {
  const [code, balance, activePacks, refRes, ledgerRes] = await Promise.all([
    ensureReferralCode(admin, userId),
    getCreditBalance(admin, userId),
    getActiveShufflePacks(admin, userId),
    admin
      .from("referrals")
      .select("id, status, reject_reason, created_at, qualified_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("credit_ledger")
      .select("id, delta, reason, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const rows = refRes.data ?? []
  const counts: Record<ReferralStatus, number> = { signed_up: 0, qualified: 0, rejected: 0 }
  for (const r of rows) counts[r.status] += 1

  return {
    code,
    shareUrl: code ? referralShareUrl(code) : null,
    counts,
    balance,
    activePacks,
    referrals: rows.map((r) => ({
      id: r.id,
      status: r.status,
      statusLabel: statusLabel(r.status, r.reject_reason),
      createdAt: r.created_at,
      qualifiedAt: r.qualified_at,
    })),
    ledger: (ledgerRes.data ?? []).map((l) => ({
      id: l.id,
      delta: l.delta,
      reason: l.reason,
      label: LEDGER_LABEL[l.reason] ?? "Credit change",
      createdAt: l.created_at,
    })),
  }
}
