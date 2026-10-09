"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function AdminLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    try {
      const supabase = createBrowserSupabaseClient()
      const { error: err } = await supabase.auth.signInWithPassword({ email: String(data.get("email")), password: String(data.get("password")) })
      if (err) {
        // The same message for every failure, so the form never says which part was wrong.
        setError("Those details did not work.")
        setBusy(false)
        return
      }
      router.replace("/admin/mfa")
      router.refresh()
    } catch {
      setError("Could not reach the server. Try again.")
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <label htmlFor="a-email" className="sp-label">
          Email
        </label>
        <input id="a-email" name="email" type="email" required autoComplete="username" className="sp-field" disabled={busy} />
      </div>
      <div>
        <label htmlFor="a-pass" className="sp-label">
          Password
        </label>
        <input id="a-pass" name="password" type="password" required autoComplete="current-password" className="sp-field" disabled={busy} />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-[var(--site-danger)]">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="site-btn site-btn-primary w-full">
        <span className="site-btn-label">{busy ? "Signing in" : "Continue"}</span>
      </button>
    </form>
  )
}
