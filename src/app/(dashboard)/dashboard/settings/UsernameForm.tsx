"use client"

import { useState } from "react"

import { USERNAME_PATTERN } from "@/lib/profile/username"

const ERRORS: Record<string, string> = {
  invalid_username: "Use 3 to 30 characters: lowercase letters, numbers and hyphens. Start with a letter or number.",
  username_reserved: "That name is reserved. Try another.",
  username_taken: "Someone already has that username. Try another.",
  unauthorized: "Sign in again to change your username.",
}

export function UsernameForm({ initial }: { initial: string | null }) {
  const [value, setValue] = useState(initial ?? "")
  const [saved, setSaved] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null)

  const normalized = value.trim().toLowerCase()
  const valid = USERNAME_PATTERN.test(normalized)
  const changed = normalized !== (saved ?? "")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || !changed || busy) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch("/api/profile/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized }),
      })
      const body = (await res.json().catch(() => null)) as { error?: string; message?: string; username?: string } | null
      if (!res.ok) {
        setMessage({ kind: "error", text: ERRORS[body?.error ?? ""] ?? body?.message ?? "Could not save. Try again." })
        return
      }
      setSaved(body?.username ?? normalized)
      setMessage({ kind: "ok", text: "Username saved." })
    } catch {
      setMessage({ kind: "error", text: "Could not save. Check your connection and try again." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="username" className="text-sm font-semibold">Username</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="username"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setMessage(null)
          }}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="your-name"
          aria-describedby="username-help"
          aria-invalid={value !== "" && !valid}
          className="dx-field sm:max-w-xs"
        />
        <button type="submit" className="dx-btn dx-btn-primary" disabled={!valid || !changed || busy}>
          {busy ? "Saving…" : "Save username"}
        </button>
      </div>
      <p id="username-help" className="text-sm text-[var(--site-ink-2)]">
        Used for the personal links coming to Pro. 3 to 30 characters: letters, numbers and hyphens.
      </p>
      {message ? (
        <p role="status" className={message.kind === "ok" ? "text-sm font-medium text-[var(--site-ink)]" : "text-sm font-medium text-[#b42318]"}>
          {message.text}
        </p>
      ) : null}
    </form>
  )
}
