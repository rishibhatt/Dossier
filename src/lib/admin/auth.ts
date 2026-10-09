import "server-only"

import type { SupabaseClient, User } from "@supabase/supabase-js"
import { notFound, redirect } from "next/navigation"

import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

/**
 * Who may open the admin console. ADMIN_USER_IDS is a comma-separated list of Supabase user ids (Authentication,
 * Users, the UUID column). It lives in the server environment only, so nobody can add themselves from the app.
 * With the variable empty, nobody is an admin.
 */
export function adminIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

export type AdminState =
  | { status: "anon" }
  | { status: "forbidden" }
  | { status: "needs_mfa"; user: User }
  | { status: "ok"; user: User; admin: SupabaseClient<Database> }

/**
 * The single check behind every admin page and action: a signed-in user, whose id is on the list, who has
 * passed the authenticator code (assurance level aal2) in this session. Checked on the server every time.
 */
export async function getAdminState(): Promise<AdminState> {
  let supabase
  try {
    supabase = await createServerSupabaseClient()
  } catch {
    return { status: "anon" }
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { status: "anon" }
  if (!adminIds().has(user.id.toLowerCase())) return { status: "forbidden" }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== "aal2") return { status: "needs_mfa", user }

  const admin = createAdminSupabaseClient()
  if (!admin) return { status: "forbidden" }
  return { status: "ok", user, admin }
}

/** For pages. Not an admin: a plain 404, so the console does not announce itself. */
export async function requireAdmin() {
  const state = await getAdminState()
  if (state.status === "anon") redirect("/admin/login")
  if (state.status === "forbidden") notFound()
  if (state.status === "needs_mfa") redirect("/admin/mfa")
  return state
}

/** For server actions. Throws instead of redirecting. */
export async function requireAdminAction() {
  const state = await getAdminState()
  if (state.status !== "ok") throw new Error("forbidden")
  return state
}
