import "server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

/**
 * Service-role client. Bypasses RLS: use only in server code for usage ledgers and payment webhooks.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
