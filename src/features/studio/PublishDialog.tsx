"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Copy, ExternalLink, Gift, Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { copyText, persistNow } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { track } from "@/lib/analytics/track"
import { ROUTES } from "@/lib/constants/routes"
import { useStudioUiStore } from "@/store/useStudioUiStore"

/** Post-publish referral ask: the person just got their own link, the best moment to pass one on. */
function InvitePrompt() {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle")

  async function copyInvite() {
    setState("loading")
    try {
      const res = await fetch("/api/referrals", { cache: "no-store" })
      const body = (await res.json().catch(() => null)) as { shareUrl?: string | null } | null
      if (!res.ok || !body?.shareUrl) throw new Error("no_link")
      await copyText(body.shareUrl, "Invite link copied")
      track("referral_link_copied", { source: "publish_dialog" })
      setState("copied")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="border border-[var(--site-rule-strong)] p-3 [border-radius:4px]">
      <p className="flex items-start gap-2 text-sm">
        <Gift className="mt-0.5 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
        <span>Know someone job hunting? Send them your invite link: you both get a credit when they publish.</span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => void copyInvite()} disabled={state === "loading"} className="site-btn site-btn-ghost site-btn-sm flex-1">
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : state === "copied" ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {state === "copied" ? "Invite link copied" : "Copy my invite link"}
        </button>
        <Link href={ROUTES.referrals} onClick={() => persistNow()} className="site-btn site-btn-quiet site-btn-sm flex-1">
          How invites work
        </Link>
      </div>
      {state === "error" ? (
        <p role="status" className="mt-2 text-xs text-[var(--site-ink-2)]">
          The invite link did not load. You can find it on the Invite page in your dashboard.
        </p>
      ) : null}
    </div>
  )
}

/** Shown after a successful publish: the link, a copy button and a way to open it. */
export function PublishDialog() {
  const open = useStudioStatus((s) => s.publishDialogOpen)
  const setOpen = useStudioStatus((s) => s.setPublishDialogOpen)
  const path = useStudioUiStore((s) => s.publishedPath)
  const [copied, setCopied] = useState(false)
  // Publishing requires an account, but check anyway: the invite prompt is for signed-in people only.
  const { summary, refresh } = useAccountSummary(false)

  // Re-check on every open: the person may have signed in since the summary was last loaded.
  useEffect(() => {
    if (open) void refresh()
  }, [open, refresh])

  const full = path && typeof window !== "undefined" ? `${window.location.origin}${path}` : ""

  return (
    <Dialog open={open && Boolean(full)} onOpenChange={(o) => (setOpen(o), o || setCopied(false))}>
      <DialogContent className="site !bg-white p-6 text-[var(--site-ink)]">
        <span className="grid size-11 place-items-center rounded-[4px] bg-[var(--site-ink)] text-[var(--site-paper)]" aria-hidden>
          <Check className="size-5" strokeWidth={3} />
        </span>
        <div>
          <DialogTitle className="text-xl font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }}>
            Your page is live
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[var(--site-ink-2)]">
            Anyone with this link can open it. Publish again after edits and the link stays the same.
          </DialogDescription>
        </div>

        <div className="border border-[var(--site-rule)] bg-[var(--site-sheet)] p-3 [border-radius:4px]">
          <p className="sp-data">Your link</p>
          <p className="site-mono mt-1 break-all text-sm">{full.replace(/^https?:\/\//, "")}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={async () => {
              await copyText(full)
              setCopied(true)
            }}
            className="site-btn site-btn-primary site-btn-sm flex-1"
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            <span className="site-btn-label">{copied ? "Copied" : "Copy link"}</span>
          </button>
          <a href={full} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-ghost site-btn-sm flex-1">
            <ExternalLink className="size-4" aria-hidden />
            <span className="site-btn-label">Open page</span>
          </a>
        </div>
        {summary.signedIn ? <InvitePrompt /> : null}

        <button type="button" onClick={() => (setOpen(false), setCopied(false))} className="ws-quiet-btn self-center">
          Back to editing
        </button>
      </DialogContent>
    </Dialog>
  )
}
