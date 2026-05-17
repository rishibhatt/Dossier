import type { PublicSupabaseClient } from "@/services/repositories/user.repository"

export async function listActivityLogsForUser(
  client: PublicSupabaseClient,
  userId: string,
  limit: number
) {
  const { data, error } = await client
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return { data, error }
}
