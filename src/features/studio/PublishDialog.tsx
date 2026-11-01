"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, Copy, ExternalLink, Gift, Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { GalleryOptIn } from "@/features/studio/share/GalleryOptIn"
import { HeardFrom } from "@/features/studio/share/HeardFrom"
import { NameLink } from "@/features/studio/share/NameLink"
import { ShareSteps, useStudioShareFacts } from "@/features/studio/share/ShareSteps"
import { copyText, persistNow } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { track } from "@/lib/analytics/track"
import { ROUTES } from "@/lib/constants/routes"
import { useStudioUiStore } from "@/store/useStudioUiStore"

/** Post-publish referral ask, framed as a gift: the person just got their own link, the best moment to pass one on. */
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
        <span>
          <span className="font-semibold">Give a friend a free credit.</span> Know someone job hunting? Send them your invite link. You get
          one too when they publish.
        </span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => void copyInvite()} disabled={state === "loading"} className="site-btn site-btn-ghost site-btn-sm sm:flex-1">
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : state === "copied" ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {state === "copied" ? "Invite link copied" : "Copy my invite link"}
        </button>
        <Link href={ROUTES.referrals} onClick={() => persistNow()} className="site-btn site-btn-quiet site-btn-sm sm:flex-1">
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

/**
 * Shown after a first publish, the proudest moment in the product: their share card, the link, then where to put
 * it (ShareSteps), the gallery opt-in, one optional "how did you hear" tap and the invite.
 */
export function PublishDialog() {
  const open = useStudioStatus((s) => s.publishDialogOpen)
  const setOpen = useStudioStatus((s) => s.setPublishDialogOpen)
  const path = useStudioUiStore((s) => s.publishedPath)
  const slug = useStudioUiStore((s) => s.publishedSlug)
  const [cardFailed, setCardFailed] = useState(false)
  const facts = useStudioShareFacts()
  const indexable = useStudioUiStore((s) => s.publishedIndexable)
  const [copied, setCopied] = useState(false)
  // Publishing requires an account, but check anyway: the invite prompt is for signed-in people only.
  const { summary, refresh } = useAccountSummary(false)

  // Re-check on every open: the person may have signed in since the summary was last loaded.
  useEffect(() => {
    if (open) void refresh()
  }, [open, refresh])

  const full = path && typeof window !== "undefined" ? `${window.location.origin}${path}` : ""

  return (
    <Dialog open={open && Boolean(full)} onOpenChange={(o) => (setOpen(o), o || (setCopied(false), setCardFailed(false)))}>
      <DialogContent className="site !min-h-0 overflow-y-auto overscroll-contain !bg-white p-4 text-[var(--site-ink)] sm:p-6 sm:max-w-[min(100%,32rem)]">
        <div className="flex items-start gap-3 pr-8">
          <span className="grid size-11 shrink-0 place-items-center rounded-[4px] bg-[var(--site-ink)] text-[var(--site-paper)]" aria-hidden>
            <Check className="size-5" strokeWidth={3} />
          </span>
          <div>
            <DialogTitle className="text-xl font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }}>
              Your page is live
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-[var(--site-ink-2)]">
              Anyone with the link can open it. Publish again after edits and the link stays the same.
            </DialogDescription>
          </div>
        </div>

        {slug && !cardFailed ? (
          <figure className="overflow-hidden border border-[var(--site-rule)] [border-radius:4px]">
            {/* The real share card (same image LinkedIn, WhatsApp and X show), so they see their work as others will. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/og/site/${encodeURIComponent(slug)}`} alt="" width={1200} height={630} className="block aspect-[1200/630] w-full bg-[var(--site-sheet)] object-cover" onError={() => setCardFailed(true)} />
            <figcaption className="sp-data border-t border-[var(--site-rule)] px-3 py-2">How your link looks when you share it</figcaption>
          </figure>
        ) : null}

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
            className="site-btn site-btn-primary site-btn-sm sm:flex-1"
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            <span className="site-btn-label">{copied ? "Copied" : "Copy link"}</span>
          </button>
          <a href={full} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-ghost site-btn-sm sm:flex-1">
            <ExternalLink className="size-4" aria-hidden />
            <span className="site-btn-label">Open page</span>
          </a>
        </div>
        {summary.signedIn && slug ? (
          <NameLink url={full} slug={slug} fullName={facts.name} onClaimed={(path) => useStudioUiStore.getState().setPublished({ path, slug, indexable })} />
        ) : null}

        <section aria-labelledby="share-h" className="border-t border-[var(--site-rule)] pt-4">
          <h3 id="share-h" className="mb-3 text-base font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--site-display)" }}>
            Put it where recruiters look
          </h3>
          <ShareSteps url={full} source="publish_dialog" facts={facts} />
        </section>

        {summary.signedIn && slug ? (
          <div className="grid gap-4 border-t border-[var(--site-rule)] pt-4">
            <GalleryOptIn slug={slug} source="publish_dialog" />
            <HeardFrom />
          </div>
        ) : null}
        {summary.signedIn ? <InvitePrompt /> : null}

        <button type="button" onClick={() => (setOpen(false), setCopied(false))} className="ws-quiet-btn self-center">
          Back to editing
        </button>
      </DialogContent>
    </Dialog>
  )
}
