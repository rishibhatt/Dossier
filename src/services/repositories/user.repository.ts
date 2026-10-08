import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

/** `plan` and `plan_expires_at` are service-role only (see phase0 migration column grants). */
type UserInsert = Omit<Database["public"]["Tables"]["users"]["Insert"], "plan" | "plan_expires_at">


export type PublicSupabaseClient = SupabaseClient<Database>

export async function getUserProfileById(client: PublicSupabaseClient, userId: string) {
  const { data, error } = await client.from("users").select("*").eq("id", userId).maybeSingle()

  return { data, error }
}

export async function upsertUserProfile(client: PublicSupabaseClient, payload: UserInsert) {
  const { data, error } = await client.from("users").upsert(payload).select("*").single()

  return { data, error }
}
