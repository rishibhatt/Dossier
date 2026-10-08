"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Gift, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { useUpgrade, type UpgradeOptions, type UpgradeTrigger } from "@/features/billing/useUpgrade"
import { track } from "@/lib/analytics/track"
import type { PlanId } from "@/lib/billing/plans"
import { PLAN_CARDS } from "@/lib/billing/pricing"
import { ROUTES } from "@/lib/constants/routes"
import {
  SHUFFLE_PACK_BONUS,
  SHUFFLE_PACK_DAYS,
  STARTER_UNLOCK_COST,
  type CreditItem,
} from "@/lib/credits/constants"
import { cn } from "@/lib/utils"

const RANK: Record<PlanId, number> = { free: 0, starter: 1, pro: 2 }

type Copy = {
  headline: string
  value: string
  plan: Exclude<PlanId, "free">
  /** Shown instead when the person already has `plan` or better. */
  covered?: { headline: string; value: string }
}

function copyFor(trigger: UpgradeTrigger, options: UpgradeOptions): Copy {
  switch (trigger) {
    case "zip_export":
      return {
        headline: "Download your site as a ZIP",
        value: "Starter gives you the whole site as files you can host anywhere. You pay once and keep them.",
        plan: "starter",
      }
    case "shuffle_limit":
      return {
        headline: "You have used today's 3 shuffles",
        value: "Your current design stays as it is. Starter lets you shuffle as often as you like, or you get 3 more tomorrow.",
        plan: "starter",
      }
    case "remove_badge":
      return {
        headline: "Take the Dossier badge off your page",
        value: "Starter removes the small “Made with Dossier” line at the bottom. Your link stays the same.",
        plan: "starter",
      }
    case "portfolio_limit":
      return {
        headline: "Keep more than one portfolio",
        value: "Your plan holds one published portfolio, and publishing again replaces it at the same link. Pro keeps up to 5 side by side.",
        plan: "pro",
        covered: {
          headline: "You have 5 portfolios published",
          value: "That is the most Pro holds. Unpublish one from your dashboard to make room for a new one.",
        },
      }
    case "pro_feature":
      return {
        headline: `${options.feature ?? "This"} is planned for Pro`,
        value: "It is not built yet, so we will not charge for it. Pro today gives you up to 5 portfolios, no badge and ZIP downloads.",
        plan: "pro",
        covered: {
          headline: `${options.feature ?? "This"} is on the way`,
          value: "It is planned for Pro and not built yet. It will turn on for your account when it ships.",
        },
      }
  }
}

function subscribeWide(cb: () => void) {
  const mq = window.matchMedia("(min-width: 640px)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

/** Dialog from 640px up, bottom sheet below. Server render assumes the phone layout. */
function useIsWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia("(min-width: 640px)").matches,
    () => false
  )
}

/** Mount once per surface (studio, dashboard). Open it with `openUpgrade(trigger)` from anywhere. */
export function UpgradeSheet() {
  const open = useUpgrade((s) => s.open)
  const trigger = useUpgrade((s) => s.trigger)
  const options = useUpgrade((s) => s.options)
  const close = useUpgrade((s) => s.close)
  const wide = useIsWide()

  const onOpenChange = (next: boolean) => {
    if (!next) {
      if (trigger) track("upgrade_sheet_dismissed", { trigger })
      close()
    }
  }

  if (!trigger) return null

  if (wide) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="site !min-h-0 !bg-white text-[var(--site-ink)]">
          <UpgradeBody trigger={trigger} options={options} wide onClose={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="site !min-h-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl !bg-white pb-[env(safe-area-inset-bottom)] text-[var(--site-ink)] motion-reduce:transition-none"
      >
        <UpgradeBody trigger={trigger} options={options} wide={false} onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}

function UpgradeBody({
  trigger,
  options,
  wide,
  onClose,
}: {
  trigger: UpgradeTrigger
  options: UpgradeOptions
  wide: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { summary, refresh, status } = useAccountSummary(true)
  const [spending, setSpending] = useState<CreditItem | null>(null)

  // Fresh numbers each time the sheet opens: the balance may have changed in another tab.
  useEffect(() => {
    void refresh()
  }, [refresh])

  const currentPlan: PlanId = summary.signedIn ? summary.plan : (options.plan ?? "free")
  const copy = copyFor(trigger, options)
  const covered = RANK[currentPlan] >= RANK[copy.plan]
  const headline = covered && copy.covered ? copy.covered.headline : copy.headline
  const value = covered && copy.covered ? copy.covered.value : copy.value
  const card = PLAN_CARDS.find((p) => p.id === copy.plan)!
  const points = card.features.filter((f) => !f.text.startsWith("Everything in"))

  const creditTrigger = trigger === "shuffle_limit" || trigger === "zip_export" || trigger === "remove_badge"
  const canCredit = summary.signedIn && currentPlan === "free" && creditTrigger
  const canShufflePack = canCredit && trigger === "shuffle_limit" && summary.balance >= 1
  const canStarter = canCredit && summary.balance >= STARTER_UNLOCK_COST

  const ctaHref = summary.signedIn ? ROUTES.billing : `${ROUTES.signup}?next=${encodeURIComponent(ROUTES.billing)}`
  const Title = wide ? DialogTitle : SheetTitle
  const Description = wide ? DialogDescription : SheetDescription

  async function spend(item: CreditItem) {
    setSpending(item)
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
      track("credits_spent", { item, source: trigger })
      toast.success(
        item === "shuffle_pack"
          ? `Done. You have ${SHUFFLE_PACK_BONUS} more shuffles a day for the next ${SHUFFLE_PACK_DAYS} days.`
          : "Starter is unlocked on your account."
      )
      await refresh()
      options.onCreditSpent?.(item)
      onClose()
      router.refresh()
    } catch {
      toast.error("Could not reach the server. Nothing was taken.")
    } finally {
      setSpending(null)
    }
  }

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="pr-10">
        <Title className="text-xl font-bold leading-tight tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }}>
          {headline}
        </Title>
        <Description className="mt-1.5 text-sm text-[var(--site-ink-2)]">{value}</Description>
      </div>

      {!covered ? (
        <section aria-label={`${card.name} plan`} className="rounded-xl border border-[var(--site-rule-strong)] p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-base font-bold">{card.name}</p>
            <p className="text-sm">
              <span className="text-lg font-bold tabular-nums">{card.price}</span>{" "}
              <span className="text-[var(--site-ink-2)]">{card.cadence}</span>
            </p>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {points.map((f) => (
              <li key={f.text} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
                <span>
                  {f.text}
                  {f.soon ? <span className="text-[var(--site-ink-2)]"> (coming soon)</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-[var(--site-rule)] pt-3 text-xs text-[var(--site-ink-2)]">
            You are on {PLAN_CARDS.find((p) => p.id === currentPlan)!.name} now.
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-2">
        {!covered ? (
          <>
            <Link
              href={ctaHref}
              onClick={() => {
                options.beforeLeave?.()
                track("upgrade_sheet_cta", { trigger, plan: copy.plan, signedIn: summary.signedIn })
                onClose()
              }}
              className="dx-btn dx-btn-primary w-full"
            >
              {summary.signedIn ? `See ${card.name}` : "Create a free account to see plans"}
            </Link>
            <p className="text-center text-xs text-[var(--site-ink-2)]">
              Checkout is not open yet, so nothing is charged today. The plans page shows what each one includes.
            </p>
          </>
        ) : (
          <Link href={ROUTES.dashboard} onClick={() => { options.beforeLeave?.(); onClose() }} className="dx-btn dx-btn-primary w-full">
            Go to my portfolios
          </Link>
        )}

        {canShufflePack ? (
          <CreditButton busy={spending === "shuffle_pack"} disabled={spending !== null} onClick={() => void spend("shuffle_pack")}>
            Use 1 credit: {SHUFFLE_PACK_BONUS} more shuffles a day for {SHUFFLE_PACK_DAYS} days
          </CreditButton>
        ) : null}
        {canStarter ? (
          <CreditButton busy={spending === "starter_unlock"} disabled={spending !== null} onClick={() => void spend("starter_unlock")}>
            Use {STARTER_UNLOCK_COST} credits: unlock Starter for good
          </CreditButton>
        ) : null}
        {canCredit && !canShufflePack && !canStarter && summary.balance > 0 ? (
          <p className="text-center text-xs text-[var(--site-ink-2)]">
            You have {summary.balance} {summary.balance === 1 ? "credit" : "credits"}. {STARTER_UNLOCK_COST} unlock Starter.{" "}
            <Link href={ROUTES.referrals} onClick={() => options.beforeLeave?.()} className="font-semibold text-[var(--site-accent-ink)] underline underline-offset-4">
              Earn more
            </Link>
          </p>
        ) : null}

        {options.secondary ? (
          <Link
            href={options.secondary.href}
            onClick={() => {
              options.beforeLeave?.()
              onClose()
            }}
            className="dx-btn dx-btn-outline w-full"
          >
            {options.secondary.label}
          </Link>
        ) : null}

        <button type="button" onClick={onClose} className="dx-btn dx-btn-ghost w-full">
          {trigger === "shuffle_limit" ? "Keep this design" : "Not now"}
        </button>
        {status === "loading" ? <span className="sr-only" role="status">Checking your plan</span> : null}
      </div>
    </div>
  )
}

function CreditButton({
  children,
  busy,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  busy: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("dx-btn dx-btn-outline h-auto min-h-11 w-full whitespace-normal py-2.5 text-left leading-snug")}
    >
      {busy ? (
        <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        <Gift className="size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
      )}
      {children}
    </button>
  )
}
