import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { buildPageMetadata } from "@/config/seo"
import { PlanBuy } from "@/features/billing/BuyButton"
import { OfferBar } from "@/features/billing/OfferBar"
import { messages } from "@/config/messages"
import { PLAN_CARDS } from "@/lib/billing/pricing"
import type { PlanId } from "@/lib/billing/plans"
import { ROUTES } from "@/lib/constants/routes"
import { getDashboardContext } from "@/lib/dashboard/context"
import { cn } from "@/lib/utils"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.billingTitle,
  description: messages.seo.billingDescription,
  path: ROUTES.billing,
  indexable: false,
})

const display = { fontFamily: "var(--site-display)" } as const
const RANK: Record<PlanId, number> = { free: 0, starter: 1, pro: 2 }

export default async function BillingPage() {
  const ctx = await getDashboardContext()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <OfferBar cta={false} />
      </div>
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]" style={display}>
        {messages.dashboard.nav.billing}
      </h1>
      <p className="mt-2 max-w-xl text-[var(--site-ink-2)]">
        You are on the {PLAN_CARDS.find((p) => p.id === ctx.plan)!.name} plan
        {ctx.plan === "pro" && ctx.planExpiresAt ? `, paid until ${ctx.planExpiresAt.slice(0, 10)}` : ""}. Payments are one time: nothing renews or charges you again by itself.
      </p>


      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {PLAN_CARDS.map((p) => {
          const current = p.id === ctx.plan
          const included = RANK[p.id] < RANK[ctx.plan]
          return (
            <li
              key={p.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-5 sm:p-6",
                current ? "border-[var(--site-ink)] shadow-[inset_0_0_0_1px_var(--site-ink)]" : "border-[var(--site-rule-strong)]"
              )}
              aria-label={`${p.name} plan${current ? ", your current plan" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold tracking-[-0.02em]" style={display}>
                  {p.name}
                </h2>
                {current ? (
                  <span className="rounded-full bg-[var(--site-ink)] px-2.5 py-0.5 text-xs font-semibold text-[var(--site-paper)]">
                    Current plan
                  </span>
                ) : null}
              </div>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-[-0.04em]" style={display}>
                  {p.price}
                </span>
                <span className="text-sm text-[var(--site-ink-2)]">{p.cadence}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--site-ink-2)]">{p.inr}</p>
              <p className="mt-2 text-sm text-[var(--site-ink-2)]">{p.summary}</p>
              <ul className="mt-5 flex-1 space-y-2.5 border-t border-[var(--site-rule)] pt-5 text-sm">
                {p.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
                    <span>
                      {f.text}
                      {f.soon ? <span className="text-[var(--site-ink-2)]"> (coming soon)</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {current && p.id === "pro" ? (
                  <PlanBuy plan="pro" />
                ) : current ? (
                  <p className="text-center text-sm font-medium text-[var(--site-ink-2)]">You are on this plan</p>
                ) : included || p.id === "free" ? (
                  <p className="text-center text-sm font-medium text-[var(--site-ink-2)]">Included in your plan</p>
                ) : (
                  <PlanBuy plan={p.id} />
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--site-rule)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--site-ink-2)]">
          {ctx.plan === "pro"
            ? "Pro is a pass, so nothing renews. When it ends you keep your link on Free (or Starter, if you bought it). Leaving early? Tell us why."
            : ctx.plan === "starter"
              ? "Starter is a one-time purchase, so nothing renews. Leaving? Tell us why."
              : "Free never charges you. Done with Dossier? Tell us why before you go."}
        </p>
        <Link href={ROUTES.billingCancel} className="dx-btn dx-btn-outline shrink-0">
          Cancel or change plan
        </Link>
      </div>
    </div>
  )
}
