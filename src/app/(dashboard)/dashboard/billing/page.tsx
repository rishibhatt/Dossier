import type { Metadata } from "next"
import Link from "next/link"
import { Check, Clock } from "lucide-react"

import { buildPageMetadata } from "@/config/seo"
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
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]" style={display}>
        {messages.dashboard.nav.billing}
      </h1>
      <p className="mt-2 max-w-xl text-[var(--site-ink-2)]">
        You are on the {PLAN_CARDS.find((p) => p.id === ctx.plan)!.name} plan. Compare what each plan includes below.
      </p>

      <p
        role="note"
        className="mt-6 flex items-start gap-2.5 rounded-xl border border-[var(--site-rule-strong)] bg-[var(--site-accent-wash)] px-4 py-3 text-sm text-[var(--site-ink)]"
      >
        <Clock className="mt-0.5 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
        <span>
          <strong className="font-semibold">Paid plans are not on sale yet.</strong> Checkout is still being built, so nothing here
          charges you. Your free portfolio keeps working in the meantime.
        </span>
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
                {current ? (
                  <p className="text-center text-sm font-medium text-[var(--site-ink-2)]">You are on this plan</p>
                ) : included ? (
                  <p className="text-center text-sm font-medium text-[var(--site-ink-2)]">Included in your plan</p>
                ) : (
                  <>
                    <button type="button" aria-disabled="true" aria-describedby={`${p.id}-soon`} className="dx-btn dx-btn-outline w-full">
                      {p.cta}: coming soon
                    </button>
                    <p id={`${p.id}-soon`} className="mt-2 text-center text-xs text-[var(--site-ink-2)]">
                      Not available to buy yet.
                    </p>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--site-rule)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--site-ink-2)]">
          {ctx.plan === "pro"
            ? "Want a different plan, or to stop paying? You can switch to Free and keep your link."
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
