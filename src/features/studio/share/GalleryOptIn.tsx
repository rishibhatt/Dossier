"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { track } from "@/lib/analytics/track"
import type { GalleryStatus } from "@/lib/growth"

const NOTE: Record<Exclude<GalleryStatus, null>, string> = {
  pending: "Thanks. We review every site before it appears, usually within a few days.",
  approved: "Your site is in the examples gallery.",
  rejected: "We did not add this one to the gallery. Your site itself is not affected.",
}

// The dialog and the Share panel each show this box; a change in one tells the other.
const SYNC = "dossier:gallery-status"

/** "Feature my site in Dossier's examples": opt-in, reviewed by hand before anything is shown. */
export function GalleryOptIn({ slug, source }: { slug: string; source: "publish_dialog" | "share_panel" | "dashboard" }) {
  const [status, setStatus] = useState<GalleryStatus | "loading">("loading")
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    fetch(`/api/gallery?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ status: GalleryStatus }>) : { status: null }))
      .then((b) => live && setStatus(b.status ?? null))
      .catch(() => live && setStatus(null))
    const sync = (e: Event) => {
      const d = (e as CustomEvent<{ slug: string; status: GalleryStatus }>).detail
      if (live && d.slug === slug) setStatus(d.status)
    }
    window.addEventListener(SYNC, sync)
    return () => {
      live = false
      window.removeEventListener(SYNC, sync)
    }
  }, [slug])

  async function toggle(optIn: boolean) {
    setSaving(true)
    setFailed(false)
    const prev = status
    setStatus(optIn ? "pending" : null)
    try {
      const res = await fetch("/api/gallery", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, optIn }) })
      const body = (await res.json().catch(() => null)) as { status?: GalleryStatus } | null
      if (!res.ok) throw new Error("save")
      const next = body?.status ?? null
      setStatus(next)
      window.dispatchEvent(new CustomEvent(SYNC, { detail: { slug, status: next } }))
      track("gallery_opt_in", { opt_in: optIn, source })
    } catch {
      setStatus(prev)
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  const checked = status === "pending" || status === "approved" || status === "rejected"
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-[var(--site-ink)]"
          checked={checked}
          disabled={status === "loading" || saving}
          onChange={(e) => void toggle(e.target.checked)}
        />
        <span>
          <span className="font-semibold">Feature my site in Dossier&rsquo;s examples</span>
          <span className="block text-[var(--site-ink-2)]">
            Your site appears on{" "}
            <Link href="/portfolio-examples" target="_blank" className="underline underline-offset-2">
              portfolio examples
            </Link>
            , where other job seekers browse, after a quick review. Untick any time to remove it.
          </span>
        </span>
      </label>
      {failed ? (
        <p role="alert" className="mt-1.5 pl-[1.625rem] text-xs text-[var(--site-danger)]">
          That did not save. Check your connection and try again.
        </p>
      ) : null}
      {!failed && status !== "loading" && status ? (
        <p role="status" className="mt-1.5 pl-[1.625rem] text-xs text-[var(--site-ink-2)]">
          {NOTE[status]}
        </p>
      ) : null}
    </div>
  )
}
