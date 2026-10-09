"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type Mode =
  | { kind: "loading" }
  | { kind: "verify"; factorId: string }
  | { kind: "enroll"; factorId: string; qr: string; secret: string }
  | { kind: "error"; message: string }

/**
 * Supabase's built-in TOTP factor (free). First visit: scan the QR code with an authenticator app (Google
 * Authenticator, Authy, 1Password) and confirm one code. Later visits: just enter the current code.
 */
export function MfaPanel() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>({ kind: "loading" })
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const supabase = createBrowserSupabaseClient()
      const { data, error: listErr } = await supabase.auth.mfa.listFactors()
      if (!alive) return
      if (listErr || !data) return setMode({ kind: "error", message: "Could not load your authenticator settings. Turn on MFA (TOTP) in Supabase, Authentication, Sign In / Providers." })

      const verified = data.totp[0]
      if (verified) return setMode({ kind: "verify", factorId: verified.id })

      // Remove half-finished enrollments so a fresh QR code can be made.
      for (const f of data.all.filter((x) => x.factor_type === "totp" && x.status === "unverified")) await supabase.auth.mfa.unenroll({ factorId: f.id })
      const { data: enrolled, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Dossier admin ${new Date().toISOString().slice(0, 10)}` })
      if (!alive) return
      if (enrollErr || !enrolled) return setMode({ kind: "error", message: "Could not start authenticator setup. Check that MFA (TOTP) is enabled in Supabase." })
      setMode({ kind: "enroll", factorId: enrolled.id, qr: enrolled.totp.qr_code, secret: enrolled.totp.secret })
    })()
    return () => {
      alive = false
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode.kind !== "verify" && mode.kind !== "enroll") return
    setBusy(true)
    setError(null)
    const supabase = createBrowserSupabaseClient()
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: mode.factorId })
    if (cErr || !challenge) {
      setError("Could not start the check. Try again.")
      setBusy(false)
      return
    }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: mode.factorId, challengeId: challenge.id, code: code.trim() })
    if (vErr) {
      setError("That code is wrong or has expired. Enter the current code.")
      setBusy(false)
      setCode("")
      return
    }
    router.replace("/admin")
    router.refresh()
  }

  if (mode.kind === "loading") return <p className="site-body">Loading</p>
  if (mode.kind === "error") return <p role="alert" className="text-sm text-[var(--site-danger)]">{mode.message}</p>

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {mode.kind === "enroll" ? (
        <div className="grid gap-3 border border-[var(--site-ink)] bg-[var(--site-sheet)] p-4">
          <p className="text-sm font-semibold">Set up your authenticator</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--site-ink-2)]">
            <li>Open an authenticator app on your phone.</li>
            <li>Scan this code, or type the key below.</li>
            <li>Enter the 6-digit code it shows.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mode.qr} alt="QR code for your authenticator app" width={176} height={176} className="size-44 bg-white p-2" />
          <p className="sp-data break-all">Key: {mode.secret}</p>
        </div>
      ) : (
        <p className="site-body">Enter the 6-digit code from your authenticator app.</p>
      )}
      <div>
        <label htmlFor="mfa-code" className="sp-label">
          6-digit code
        </label>
        <input id="mfa-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="sp-field text-center text-2xl tracking-[0.4em]" disabled={busy} />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-[var(--site-danger)]">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy || code.length !== 6} className="site-btn site-btn-primary w-full">
        <span className="site-btn-label">{busy ? "Checking" : mode.kind === "enroll" ? "Confirm and sign in" : "Verify"}</span>
      </button>
    </form>
  )
}
