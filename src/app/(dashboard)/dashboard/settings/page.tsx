import type { Metadata } from "next"
import Link from "next/link"

import { UsernameForm } from "@/app/(dashboard)/dashboard/settings/UsernameForm"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { PLAN_CARDS } from "@/lib/billing/pricing"
import { ROUTES } from "@/lib/constants/routes"
import { getDashboardContext } from "@/lib/dashboard/context"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.settingsTitle,
  description: messages.seo.settingsDescription,
  path: ROUTES.settings,
  indexable: false,
})

const display = { fontFamily: "var(--site-display)" } as const

export default async function SettingsPage() {
  const ctx = await getDashboardContext()
  const plan = PLAN_CARDS.find((p) => p.id === ctx.plan)!

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]" style={display}>
        {messages.dashboard.nav.settings}
      </h1>
      <p className="mt-2 text-[var(--site-ink-2)]">{messages.seo.settingsDescription}</p>

      <div className="mt-8 divide-y divide-[var(--site-rule)] overflow-hidden rounded-2xl border border-[var(--site-rule-strong)] bg-white">
        <section className="p-5 sm:p-7" aria-labelledby="account-h">
          <h2 id="account-h" className="text-lg font-bold tracking-[-0.02em]" style={display}>
            Account
          </h2>
          <dl className="mt-4 text-sm">
            <dt className="text-[var(--site-ink-2)]">Email</dt>
            <dd className="mt-1 break-all font-medium">{ctx.email ?? "Not signed in"}</dd>
          </dl>
          <div className="mt-6 border-t border-[var(--site-rule)] pt-6">
            <UsernameForm initial={ctx.username} />
          </div>
        </section>

        <section className="p-5 sm:p-7" aria-labelledby="plan-h">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="plan-h" className="text-lg font-bold tracking-[-0.02em]" style={display}>
              Plan
            </h2>
            <p className="text-sm text-[var(--site-ink-2)]">
              {plan.name} · {plan.price} {plan.cadence}
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--site-ink-2)]">
            {plan.features.map((f) => (
              <li key={f.text}>
                {f.text}
                {f.soon ? " (coming soon)" : ""}
              </li>
            ))}
          </ul>
          <Link href={ROUTES.billing} className="dx-btn dx-btn-outline mt-6">
            {ctx.plan === "pro" ? "Plan details" : "Compare plans"}
          </Link>
        </section>
      </div>
    </div>
  )
}
