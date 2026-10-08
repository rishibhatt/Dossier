"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Gift, Loader2, Mail, MessageCircle, Send, Share2 } from "lucide-react"
import { toast } from "sonner"

import { useAccountSummaryStore } from "@/features/billing/useAccountSummary"
import { track } from "@/lib/analytics/track"
import type { PlanId } from "@/lib/billing/plans"
import {
  SHUFFLE_PACK_BONUS,
  SHUFFLE_PACK_DAYS,
  STARTER_UNLOCK_COST,
  type CreditItem,
} from "@/lib/credits/constants"

const SHARE_TEXT =
  "I turned my resume into a portfolio site with Dossier. It took a few minutes. If you sign up with my link and publish yours, we both get a credit."

const noop = () => () => {}

/** True only in browsers with the native share sheet (most phones). False during server render. */
function useCanShare() {
  return useSyncExternalStore(
    noop,
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false
  )
}

export function InviteLinkCard({ shareUrl }: { shareUrl: string }) {
  const canShare = useCanShare()
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(`${SHARE_TEXT} ${shareUrl}`)

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      track("referral_link_copied", { source: "referrals_page" })
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Could not copy", { description: shareUrl })
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Dossier", text: SHARE_TEXT, url: shareUrl })
      track("referral_link_shared", { channel: "native" })
    } catch {
      /* Closing the share sheet is not an error. */
    }
  }

  const fallbacks = [
    { label: "WhatsApp", Icon: MessageCircle, href: `https://wa.me/?text=${encodedText}`, channel: "whatsapp" },
    { label: "LinkedIn", Icon: Send, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, channel: "linkedin" },
    {
      label: "Email",
      Icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("A quick way to make a portfolio site")}&body=${encodedText}`,
      channel: "email",
    },
  ]

  return (
    <div>
      <label htmlFor="invite-link" className="text-sm font-semibold">
        Your invite link
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="invite-link"
          readOnly
          value={shareUrl}
          onFocus={(e) => e.currentTarget.select()}
          className="dx-field site-mono min-w-0 flex-1"
        />
        <button type="button" onClick={() => void copy()} className="dx-btn dx-btn-primary" aria-live="polite">
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {canShare ? (
          <button type="button" onClick={() => void nativeShare()} className="dx-btn dx-btn-outline">
            <Share2 className="size-4" aria-hidden />
            Share
          </button>
        ) : null}
        {fallbacks.map(({ label, Icon, href, channel }) => (
          <a
            key={channel}
            href={href}
            target={channel === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            onClick={() => track("referral_link_shared", { channel })}
            className="dx-btn dx-btn-outline"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}

export function SpendCredits({ balance, plan }: { balance: number; plan: PlanId }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<CreditItem | null>(null)
  const [busy, setBusy] = useState<CreditItem | null>(null)
  const paid = plan !== "free"

  async function spend(item: CreditItem) {
    setBusy(item)
    try {
      const res = await fetch("/api/credits/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      })
      const body = (await res.json().catch(() => null)) as { message?: string } | null
      if (!res.ok) {
        toast.error(body?.message ?? "Credits could not be used. Nothing was taken.")
        return
      }
      track("credits_spent", { item, source: "referrals_page" })
      toast.success(
        item === "shuffle_pack"
          ? `Done. ${SHUFFLE_PACK_BONUS} more shuffles a day for the next ${SHUFFLE_PACK_DAYS} days.`
          : "Starter is unlocked. The badge comes off your page and ZIP downloads are on."
      )
      void useAccountSummaryStore.getState().refresh()
      router.refresh()
    } catch {
      toast.error("Could not reach the server. Nothing was taken.")
    } finally {
      setBusy(null)
      setConfirming(null)
    }
  }

  const items: { id: CreditItem; cost: number; title: string; detail: string }[] = [
    {
      id: "shuffle_pack",
      cost: 1,
      title: `${SHUFFLE_PACK_BONUS} more shuffles a day`,
      detail: `On top of your 3 free ones, for ${SHUFFLE_PACK_DAYS} days.`,
    },
    {
      id: "starter_unlock",
      cost: STARTER_UNLOCK_COST,
      title: "Starter, for good",
      detail: "No badge, shuffle as much as you like, ZIP downloads. Same as paying the $9 once.",
    },
  ]

  if (paid) {
    return (
      <p className="text-sm text-[var(--site-ink-2)]">
        Your plan already includes unlimited shuffles and everything Starter has, so your credits are kept for later. Nothing is
        spent automatically.
      </p>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const affordable = balance >= item.cost
        const isConfirming = confirming === item.id
        return (
          <li key={item.id} className="flex flex-col rounded-xl border border-[var(--site-rule-strong)] p-4">
            <p className="text-xs font-semibold text-[var(--site-ink-2)]">
              {item.cost} {item.cost === 1 ? "credit" : "credits"}
            </p>
            <p className="mt-1 font-semibold">{item.title}</p>
            <p className="mt-1 flex-1 text-sm text-[var(--site-ink-2)]">{item.detail}</p>
            {isConfirming ? (
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void spend(item.id)}
                  disabled={busy !== null}
                  className="dx-btn dx-btn-primary w-full"
                >
                  {busy === item.id ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
                  Use {item.cost} {item.cost === 1 ? "credit" : "credits"}
                </button>
                <button type="button" onClick={() => setConfirming(null)} disabled={busy !== null} className="dx-btn dx-btn-ghost w-full">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(item.id)}
                disabled={!affordable}
                aria-describedby={!affordable ? `${item.id}-need` : undefined}
                className="dx-btn dx-btn-outline mt-4 w-full"
              >
                <Gift className="size-4" aria-hidden />
                {affordable ? "Use credits" : "Not enough credits yet"}
              </button>
            )}
            {!affordable ? (
              <p id={`${item.id}-need`} className="mt-2 text-xs text-[var(--site-ink-2)]">
                You need {item.cost - balance} more.
              </p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
