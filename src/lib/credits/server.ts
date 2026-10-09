import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { SHUFFLE_PACK_BONUS, SHUFFLE_PACK_DAYS, type CreditItem } from "@/lib/credits/constants"
import type { Database } from "@/types/database"

type Client = SupabaseClient<Database>

const DAY_MS = 24 * 60 * 60 * 1000

/** Current credit balance. Any read failure counts as 0, so a broken lookup can never let someone overspend. */
export async function getCreditBalance(client: Client, userId: string): Promise<number> {
  const { data, error } = await client.from("credit_balances").select("balance").eq("user_id", userId).maybeSingle()
  if (error || !data) return 0
  return Number(data.balance) || 0
}

/** Expiry dates of shuffle packs that are still adding their bonus, soonest first. */
export async function getActiveShufflePacks(client: Client, userId: string): Promise<string[]> {
  const since = new Date(Date.now() - SHUFFLE_PACK_DAYS * DAY_MS).toISOString()
  const { data, error } = await client
    .from("credit_ledger")
    .select("created_at")
    .eq("user_id", userId)
    .eq("reason", "spend_shuffle_pack")
    .gte("created_at", since)
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return data.map((row) => new Date(new Date(row.created_at).getTime() + SHUFFLE_PACK_DAYS * DAY_MS).toISOString())
}

/** Extra daily regenerations from active shuffle packs. */
export async function activeShufflePackBonus(client: Client, userId: string): Promise<number> {
  const since = new Date(Date.now() - SHUFFLE_PACK_DAYS * DAY_MS).toISOString()
  const { count, error } = await client
    .from("credit_ledger")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reason", "spend_shuffle_pack")
    .gte("created_at", since)
  if (error) return 0
  return (count ?? 0) * SHUFFLE_PACK_BONUS
}

export type SpendResult =
  | { ok: true; balance: number }
  | { ok: false; error: "invalid_item" | "no_user" | "already_included" | "insufficient_credits" | "spend_failed"; balance?: number }

/**
 * Debit credits and apply the item. Runs as one locked transaction in Postgres (`spend_credits`),
 * so two taps at once cannot spend the same credit twice. Service-role client only.
 */
export async function spendCredits(admin: Client, userId: string, item: CreditItem): Promise<SpendResult> {
  const { data, error } = await admin.rpc("spend_credits", { p_user: userId, p_item: item })
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "spend_failed" }
  const result = data as { ok?: boolean; error?: string; balance?: number }
  if (result.ok) return { ok: true, balance: Number(result.balance) || 0 }
  const known = ["invalid_item", "no_user", "already_included", "insufficient_credits"] as const
  const code = known.find((k) => k === result.error) ?? "spend_failed"
  return { ok: false, error: code, balance: typeof result.balance === "number" ? result.balance : undefined }
}
