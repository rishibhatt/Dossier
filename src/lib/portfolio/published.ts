import "server-only"

import { resolveEffectivePlan } from "@/lib/billing/plans"
import { USERNAME_PATTERN } from "@/lib/profile/username"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type PublishedRow = { slug: string; payload: unknown; user_id: string | null; indexable: boolean | null }

export async function loadPublishedBySlug(slug: string): Promise<PublishedRow | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.from("published_portfolios").select("slug, payload, user_id, indexable").eq("slug", slug).maybeSingle()
    return (data as PublishedRow | null) ?? null
  } catch {
    return null
  }
}

/**
 * `/u/<username>` shows that person's most recently updated published portfolio. Visitors cannot read the
 * `users` table (row level security), so the username is resolved with the service-role client. Only the
 * portfolio row, which is public anyway, is returned.
 */
export async function loadPublishedByUsername(username: string): Promise<PublishedRow | null> {
  const name = username.toLowerCase()
  if (!USERNAME_PATTERN.test(name)) return null
  const admin = createAdminSupabaseClient()
  if (!admin) return null
  try {
    const { data: user } = await admin.from("users").select("id").eq("username", name).maybeSingle()
    if (!user) return null
    const { data } = await admin
      .from("published_portfolios")
      .select("slug, payload, user_id, indexable")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    return (data as PublishedRow | null) ?? null
  } catch {
    return null
  }
}

/**
 * Free plans carry "Made with Dossier"; Starter and Pro do not. The owner's plan is read with the
 * service-role client (the visitor's RLS client cannot read other users). Without that client, or
 * on any lookup failure, the plan cannot be verified and the credit shows (fail closed).
 */
export async function shouldShowCredit(userId: string | null): Promise<boolean> {
  if (!userId) return true
  const admin = createAdminSupabaseClient()
  if (!admin) return true
  try {
    const { data } = await admin.from("users").select("plan, plan_expires_at").eq("id", userId).maybeSingle()
    return !data || resolveEffectivePlan(data.plan, data.plan_expires_at) === "free"
  } catch {
    return true
  }
}
