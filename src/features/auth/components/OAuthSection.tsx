"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { messages } from "@/config/messages"
import { siteConfig } from "@/config/site"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { ROUTES } from "@/lib/constants/routes"

type OAuthProvider = "google" | "github"

export function OAuthSection() {
  const [pending, setPending] = useState<OAuthProvider | null>(null)

  async function signIn(provider: OAuthProvider) {
    setPending(provider)
    try {
      const supabase = createBrowserSupabaseClient()
      const next = encodeURIComponent(ROUTES.dashboard)
      const redirectTo = `${siteConfig.url}${ROUTES.authCallback}?next=${next}`
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="typo-label-sm text-muted-foreground">{messages.auth.oauthDivider}</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={() => void signIn("google")}
        >
          {messages.auth.oauthGoogle}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending !== null}
          onClick={() => void signIn("github")}
        >
          {messages.auth.oauthGithub}
        </Button>
      </div>
    </div>
  )
}
