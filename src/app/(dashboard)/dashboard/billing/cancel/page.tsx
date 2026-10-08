import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { CancelFlow } from "@/app/(dashboard)/dashboard/billing/cancel/CancelFlow"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { siteConfig } from "@/config/site"
import { ROUTES } from "@/lib/constants/routes"
import { getDashboardContext } from "@/lib/dashboard/context"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.cancelTitle,
  description: messages.seo.cancelDescription,
  path: ROUTES.billingCancel,
  indexable: false,
})

export default async function CancelPlanPage() {
  const ctx = await getDashboardContext()

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={ROUTES.billing}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-[var(--site-ink-2)] hover:text-[var(--site-ink)]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Plan &amp; billing
      </Link>
      <CancelFlow plan={ctx.plan} supportEmail={siteConfig.supportEmail} />
    </div>
  )
}
