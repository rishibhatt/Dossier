"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/** Per-site owner controls on the dashboard: whether Google may list it, and taking it offline. */
export function SiteSettings({ slug, indexable }: { slug: string; indexable: boolean }) {
  const router = useRouter()
  const [listed, setListed] = useState(indexable)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function call(method: "PATCH" | "DELETE", body?: unknown): Promise<boolean> {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/portfolios/${encodeURIComponent(slug)}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { message?: string } | null
        setError(b?.message ?? "That did not save. Try again.")
        return false
      }
      return true
    } catch {
      setError("Could not reach Dossier. Check your connection and try again.")
      return false
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2 border-t border-[var(--site-rule)] p-4">
      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-[var(--site-ink)]"
          checked={listed}
          disabled={busy}
          onChange={async (e) => {
            const next = e.target.checked
            if (await call("PATCH", { indexable: next })) {
              setListed(next)
              router.refresh()
            }
          }}
        />
        <span>
          <span className="font-semibold">Show in Google search</span>
          <span className="block text-[var(--site-ink-2)]">Off: only people with the link find it.</span>
        </span>
      </label>

      {confirming ? (
        <div role="group" aria-label="Confirm taking the site offline" className="border border-[var(--site-danger)] p-3 text-sm">
          <p>The link stops working for everyone, and its visit count is cleared. Your work stays in the editor on this device.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="dx-btn dx-btn-outline dx-btn-sm flex-1" onClick={() => setConfirming(false)} disabled={busy}>
              Keep it online
            </button>
            <button
              type="button"
              className="dx-btn dx-btn-primary dx-btn-sm flex-1"
              disabled={busy}
              onClick={async () => {
                if (await call("DELETE")) router.refresh()
              }}
            >
              Take offline
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="justify-self-start text-sm text-[var(--site-ink-2)] underline underline-offset-4 hover:text-[var(--site-ink)]" onClick={() => setConfirming(true)}>
          Take this site offline
        </button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-[var(--site-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}
