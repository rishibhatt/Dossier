"use client"

import Link from "next/link"

import { BtnArrow, BtnLabel, siteBtnClass, type SiteButtonVariant } from "@/components/marketing/primitives"
import { PlanBuy } from "@/features/billing/BuyButton"
import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { track } from "@/lib/analytics"
import type { PlanId } from "@/lib/billing/plans"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const RANK: Record<PlanId, number> = { free: 0, starter: 1, pro: 2 }

/**
 * The button at the foot of a pricing card. Signed in, a paid card opens Razorpay checkout right here.
 * Signed out (or before the account check returns), it links to signup, which sends the person on to billing
 * with the same checkout open. Every click is tracked as `pricing_cta_click`.
 */
export function PricingCta({
  plan,
  label,
  variant,
  onInk = false,
  position,
}: {
  plan: PlanId
  label: string
  variant: SiteButtonVariant
  onInk?: boolean
  /** Where the cards sit: the /pricing page or the pricing section on the home page. */
  position: string
}) {
  const { status, summary } = useAccountSummary(true)
  const signedIn = status === "ready" && summary.signedIn
  const clicked = (product?: string) => track("pricing_cta_click", { plan, product, signedIn, position })

  if (plan !== "free" && signedIn) {
    if (plan === "starter" && RANK[summary.plan] >= RANK.starter) {
      return (
        <p className={cn("mt-8 text-center text-sm font-medium", onInk ? "text-white/70" : "text-[var(--site-ink-2)]")}>
          {summary.plan === "starter" ? "You are on this plan" : "Included in your plan"}
        </p>
      )
    }
    return (
      <div className="mt-8">
        <PlanBuy
          plan={plan}
          onStart={clicked}
          primaryClass={siteBtnClass({ variant, className: "w-full" })}
          secondaryClass={siteBtnClass({ variant: "ghost", className: "w-full" })}
          switchClass={onInk ? "text-white/70" : "text-[var(--site-ink-2)]"}
        />
      </div>
    )
  }

  return (
    <Link
      href={plan === "free" ? ROUTES.build : `${ROUTES.signup}?plan=${plan}`}
      onClick={() => clicked()}
      className={siteBtnClass({ variant, arrow: true, className: "mt-8 w-full justify-between" })}
    >
      <BtnLabel>{label}</BtnLabel>
      <BtnArrow />
    </Link>
  )
}
