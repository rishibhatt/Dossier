import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import { isReservedUsername, USERNAME_PATTERN, usernameIdeas } from "@/lib/profile/username"
import type { Database } from "@/types/database"

type Admin = SupabaseClient<Database>

/** How long a released username stays with its old owner: links they shared keep working, nobody else takes it. */
export const HOLD_DAYS = 90

export type UsernameStatus = "available" | "yours" | "taken" | "held" | "reserved" | "invalid"

const heldSince = () => new Date(Date.now() - HOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()

/** Whether `userId` may take `name` right now, and if not, why. */
export async function usernameStatus(admin: Admin, userId: string, name: string): Promise<UsernameStatus> {
  if (!USERNAME_PATTERN.test(name)) return "invalid"
  if (isReservedUsername(name)) return "reserved"
  const [{ data: owner }, { data: old }] = await Promise.all([
    admin.from("users").select("id").eq("username", name).maybeSingle(),
    admin.from("username_history").select("user_id, released_at").eq("username", name).maybeSingle(),
  ])
  if (owner) return owner.id === userId ? "yours" : "taken"
  if (old && old.user_id !== userId && old.released_at > heldSince()) return "held"
  return "available"
}

/** Up to `limit` free names built from their full name and what they typed. Two queries, whatever the count. */
export async function suggestUsernames(admin: Admin, userId: string, fullName: string, typed: string, limit = 3): Promise<string[]> {
  const ideas = usernameIdeas(fullName, typed)
  if (!ideas.length) return []
  const [{ data: owners }, { data: held }] = await Promise.all([
    admin.from("users").select("username").in("username", ideas),
    admin.from("username_history").select("username, user_id").in("username", ideas).gt("released_at", heldSince()),
  ])
  const blocked = new Set([...(owners ?? []).map((o) => o.username), ...(held ?? []).filter((h) => h.user_id !== userId).map((h) => h.username)])
  return ideas.filter((u) => !blocked.has(u)).slice(0, limit)
}

/** The current username of whoever used to be `oldName`, for redirecting old /u/ links. */
export async function renamedTo(admin: Admin, oldName: string): Promise<string | null> {
  if (!USERNAME_PATTERN.test(oldName)) return null
  const { data: old } = await admin.from("username_history").select("user_id").eq("username", oldName).maybeSingle()
  if (!old) return null
  const { data: user } = await admin.from("users").select("username").eq("id", old.user_id).maybeSingle()
  return user?.username && user.username !== oldName ? user.username : null
}
