"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AtSign, Check, Loader2, X } from "lucide-react"

import { track } from "@/lib/analytics/track"
import { toUsername, USERNAME_PATTERN } from "@/lib/profile/username"

type Status = "available" | "yours" | "taken" | "held" | "reserved" | "invalid"
type Check = { name: string; status: Status | "checking"; suggestions: string[] }

// The dialog, the Share panel and the dashboard can all show this; once one claims a name the others hide.
const SYNC = "dossier:username-claimed"

/** While typing: lowercase, spaces to hyphens, other characters dropped (a trailing hyphen stays so "a-b" can be typed). */
const tidy = (v: string) => v.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+/, "").slice(0, 30)

const MESSAGE: Record<Exclude<Status, "available" | "yours">, (name: string) => string> = {
  taken: (n) => `Someone already has ${n}. Pick one of these, or try another.`,
  held: () => "Someone used this name until recently. It stays with them for 90 days so their old links keep working.",
  reserved: () => "That name is reserved for Dossier pages. Try another.",
  invalid: () => "Use 3 to 30 characters: letters, numbers and hyphens. Start with a letter or number.",
}

/**
 * "Get dossier-cv.com/u/your-name instead of /p/x8f2k": claim a username without leaving the share flow. Shown
 * only for a site still on a random /p/ link whose owner has no username yet. Checks the name while they type,
 * offers free alternatives when it is taken, and hands the new link back through `onClaimed`.
 */
export function NameLink({
  url,
  slug,
  fullName,
  onClaimed,
}: {
  url: string
  slug: string
  fullName: string
  onClaimed: (path: string) => void
}) {
  const origin = (() => {
    try {
      return new URL(url).host
    } catch {
      return "dossier-cv.com"
    }
  })()
  const onRandomLink = /\/p\/[^/]+$/.test(url)
  const [eligible, setEligible] = useState<boolean | null>(null)
  const [value, setValue] = useState(() => toUsername(fullName))
  // Only the server's answer is stored; empty, badly formed and "still checking" are worked out while rendering.
  const [remote, setRemote] = useState<Check | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState<{ name: string; path: string } | null>(null)
  const id = useId()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!onRandomLink) return
    let live = true
    fetch("/api/profile/username", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ username: string | null; siteCount: number }>) : null))
      .then((b) => live && setEligible(Boolean(b) && !b?.username))
      .catch(() => live && setEligible(false))
    const claimed = () => live && setEligible(false)
    window.addEventListener(SYNC, claimed)
    return () => {
      live = false
      window.removeEventListener(SYNC, claimed)
    }
  }, [onRandomLink])

  const name = value.replace(/-+$/, "")
  const wellFormed = USERNAME_PATTERN.test(name)
  const check: Check | null = !name
    ? null
    : !wellFormed
      ? { name, status: "invalid", suggestions: [] }
      : remote?.name === name
        ? remote
        : { name, status: "checking", suggestions: [] }

  // Ask the server 400ms after typing stops. Badly formed names never leave the browser.
  useEffect(() => {
    if (!eligible || !wellFormed) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/username?check=${encodeURIComponent(name)}&name=${encodeURIComponent(fullName)}`, { cache: "no-store" })
        const body = (await res.json()) as { status: Status; suggestions: string[] }
        setRemote({ name, status: body.status, suggestions: body.suggestions ?? [] })
      } catch {
        setRemote(null)
      }
    }, 400)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [name, wellFormed, eligible, fullName])

  async function claim() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile/username", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: name, slug }),
      })
      const body = (await res.json().catch(() => null)) as { path?: string; error?: string; message?: string } | null
      if (!res.ok || !body?.path) {
        if (body?.error === "username_taken") setRemote({ name, status: "taken", suggestions: check?.suggestions ?? [] })
        throw new Error(body?.message ?? (body?.error === "username_taken" ? `Someone took ${name} a moment ago. Try another.` : "That did not save. Try again."))
      }
      setDone({ name, path: body.path })
      onClaimed(body.path)
      window.dispatchEvent(new Event(SYNC))
      track("username_claimed", { from: "share", suggested: name === toUsername(fullName) })
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not save. Try again.")
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <p role="status" className="flex items-start gap-2 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-3 text-sm [border-radius:4px]">
        <Check className="mt-0.5 size-4 shrink-0 text-[var(--site-ok)]" aria-hidden />
        <span className="min-w-0">
          Your name is set: <span className="site-mono break-all font-semibold">{origin}/u/{done.name}</span>.{" "}
          {done.path.startsWith("/u/")
            ? "Share this one. The old /p/ link still works."
            : "You have more than one site, so /u/ opens your newest one and this site keeps its /p/ link."}
        </span>
      </p>
    )
  }
  if (!onRandomLink || !eligible) return null

  const ready = check?.status === "available" || check?.status === "yours"
  const randomPart = url.split("/p/")[1] ?? ""
  return (
    <div className="@container border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-3 [border-radius:4px]">
      <p className="text-sm font-semibold">Get a link with your name</p>
      <p className="mt-0.5 text-xs text-[var(--site-ink-2)]">
        Easier to say, type and remember than <span className="site-mono break-all">/p/{randomPart}</span>. It becomes your username.
      </p>

      <label htmlFor={id} className="sr-only">
        Your name for the link
      </label>
      <div className="mt-2.5 flex min-h-12 items-stretch overflow-hidden border border-[var(--site-rule-strong)] bg-white [border-radius:4px] focus-within:border-[var(--site-accent-ink)] focus-within:shadow-[0_0_0_3px_rgba(109,92,246,0.25)]">
        <span className="site-mono hidden shrink-0 items-center border-r border-[var(--site-rule)] bg-[var(--site-sheet)] px-2.5 text-xs text-[var(--site-ink-2)] @[20rem]:flex">
          {origin}/u/
        </span>
        <span className="flex shrink-0 items-center pl-2.5 text-[var(--site-ink-3)] @[20rem]:hidden" aria-hidden>
          <AtSign className="size-4" />
        </span>
        <input
          id={id}
          value={value}
          onChange={(e) => (setValue(tidy(e.target.value)), setError(""))}
          onKeyDown={(e) => e.key === "Enter" && ready && !saving && void claim()}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          aria-invalid={check?.status === "taken" || check?.status === "held" || check?.status === "reserved" || check?.status === "invalid" || undefined}
          aria-describedby={`${id}-status`}
          className="site-mono min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
        />
        <span className="flex w-9 shrink-0 items-center justify-center" aria-hidden>
          {check?.status === "checking" ? (
            <Loader2 className="size-4 animate-spin text-[var(--site-ink-3)] motion-reduce:animate-none" />
          ) : ready ? (
            <Check className="size-4 text-[var(--site-ok)]" />
          ) : check ? (
            <X className="size-4 text-[var(--site-danger)]" />
          ) : null}
        </span>
      </div>

      <div id={`${id}-status`} role="status" aria-live="polite" className="mt-2 min-h-5 text-xs">
        {!check ? (
          <span className="text-[var(--site-ink-2)]">Lowercase letters, numbers and hyphens.</span>
        ) : check.status === "checking" ? (
          <span className="text-[var(--site-ink-2)]">Checking {check.name}…</span>
        ) : ready ? (
          <span className="font-medium text-[var(--site-ok)]">
            <span className="site-mono break-all">{origin}/u/{check.name}</span> is free.
          </span>
        ) : (
          <span className="text-[var(--site-danger)]">{MESSAGE[check.status as keyof typeof MESSAGE](check.name)}</span>
        )}
      </div>

      {check && !ready && check.status !== "checking" && check.suggestions.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Free names">
          {check.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              className="site-mono inline-flex min-h-9 max-w-full items-center truncate border border-[var(--site-rule-strong)] bg-white px-2.5 text-xs transition-colors [border-radius:4px] hover:border-[var(--site-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-accent-ink)]"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-xs text-[var(--site-danger)]">
          {error}
        </p>
      ) : null}

      <button type="button" onClick={() => void claim()} disabled={!ready || saving} className="site-btn site-btn-primary site-btn-sm mt-3 w-full @[20rem]:w-auto">
        {saving ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
        <span className="site-btn-label">Use this link</span>
      </button>
    </div>
  )
}
