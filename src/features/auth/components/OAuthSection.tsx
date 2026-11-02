"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { siteBtnClass } from "@/components/marketing/primitives"
import { messages } from "@/config/messages"
import { safeNextPath } from "@/lib/auth/safeNext"
import { ROUTES } from "@/lib/constants/routes"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

type OAuthProvider = "google"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.125rem]" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.35Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.42 13.92a6 6 0 0 1 0-3.84V7.5H3.07a10 10 0 0 0 0 9l3.35-2.58Z" />
      <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.07 7.5l3.35 2.58C7.2 7.72 9.4 5.96 12 5.96Z" />
    </svg>
  )
}

const PROVIDERS: { id: OAuthProvider; label: string; Mark: () => React.JSX.Element }[] = [
  { id: "google", label: messages.auth.oauthGoogle, Mark: GoogleMark },
]

/** `next`: where to land after sign-in. The page passes it when it knows more than the URL (a plan bought from pricing). */
export function OAuthSection({ next: target }: { next?: string } = {}) {
  const [pending, setPending] = useState<OAuthProvider | null>(null)

  async function signIn(provider: OAuthProvider) {
    setPending(provider)
    try {
      const requested = target ?? new URLSearchParams(window.location.search).get("next")
      const next = encodeURIComponent(safeNextPath(requested))
      // This tab's own origin, so localhost logins come back to localhost (Supabase still checks its allow-list).
      const redirectTo = `${window.location.origin}${ROUTES.authCallback}?next=${next}`
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      if (error) {
        toast.error(messages.auth.errors.oauthFailed)
        setPending(null)
      }
      // On success the browser leaves for the provider, so the buttons stay disabled.
    } catch {
      toast.error(messages.auth.errors.oauthFailed)
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2.5">
        {PROVIDERS.map(({ id, label, Mark }) => (
          <button
            key={id}
            type="button"
            disabled={pending !== null}
            aria-busy={pending === id}
            onClick={() => void signIn(id)}
            className={siteBtnClass({ variant: id === "google" ? "secondary" : "ghost", className: "w-full !justify-center" })}
          >
            {pending === id ? <Loader2 className="size-[1.125rem] animate-spin" aria-hidden /> : <Mark />}
            <span className="site-btn-label">{label}</span>
          </button>
        ))}
      </div>
      <div className="sp-data flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--site-rule-strong)]" />
        {messages.auth.oauthDivider}
        <span className="h-px flex-1 bg-[var(--site-rule-strong)]" />
      </div>
    </div>
  )
}