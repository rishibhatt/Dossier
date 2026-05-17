import type { PublicSupabaseClient } from "@/services/repositories/user.repository"

export async function listDossiersForUser(client: PublicSupabaseClient, userId: string) {
  const { data, error } = await client
    .from("dossiers")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  return { data, error }
}
