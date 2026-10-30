import type { AuthError } from "@supabase/supabase-js"

import { siteConfig } from "@/config/site"
import { ROUTES } from "@/lib/constants/routes"
import type { PublicSupabaseClient } from "@/services/repositories/user.repository"

export type AuthResult<T> = { data: T | null; error: AuthError | Error | null }

export async function signInWithPassword(
  client: PublicSupabaseClient,
  params: { email: string; password: string }
): Promise<AuthResult<{ userId: string }>> {
  const { data, error } = await client.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  })

  if (error || !data.user) {
    return { data: null, error: error ?? new Error("sign_in_failed") }
  }

  return { data: { userId: data.user.id }, error: null }
}

export async function signUpWithPassword(
  client: PublicSupabaseClient,
  params: { email: string; password: string; fullName?: string | null }
): Promise<AuthResult<{ userId: string | null }>> {
  const { data, error } = await client.auth.signUp({
    email: params.email,
    password: params.password,
    // The confirm link returns to this deployment (localhost in dev), not the Supabase Site URL.
    options: { data: { full_name: params.fullName ?? null }, emailRedirectTo: `${siteConfig.url}${ROUTES.authCallback}` },
  })

  if (error) {
    return { data: null, error }
  }

  const userId = data.user?.id ?? null

  return { data: { userId }, error: null }
}

export async function signOut(client: PublicSupabaseClient): Promise<AuthResult<null>> {
  const { error } = await client.auth.signOut()
  return { data: null, error }
}
