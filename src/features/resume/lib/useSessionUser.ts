"use client"

import { useEffect, useState } from "react"
import { isAuthRetryableFetchError } from "@supabase/supabase-js"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"

import { clearAccountDrafts, clearResumeDrafts } from "./drafts"

export type SessionUser = { id: string; email: string | null }

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

/** undefined while checking, null when signed out. Works when Supabase isn't configured (always signed out). */
export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null | undefined>(configured ? undefined : null)

  useEffect(() => {
    if (!configured) return
    const client = createBrowserSupabaseClient()
    let active = true
    client.auth.getUser().then(({ data, error }) => {
      // A network failure is not a sign-out: keep the account's resumes until the server says nobody is signed in.
      if (!data.user && !isAuthRetryableFetchError(error)) clearAccountDrafts()
      if (active) setUser(data.user ? { id: data.user.id, email: data.user.email ?? null } : null)
    })
    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") clearResumeDrafts()
      if (active) setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return user
}
