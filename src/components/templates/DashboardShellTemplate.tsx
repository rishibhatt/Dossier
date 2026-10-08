import Link from "next/link"

import { Logo } from "@/components/marketing/primitives"
import { AccountMenu } from "@/components/organisms/AccountMenu"
import { AppSidebar } from "@/components/organisms/AppSidebar"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import type { PlanId } from "@/lib/billing/plans"

type DashboardShellTemplateProps = {
  userEmail: string | null
  plan: PlanId
  shufflesUsed: number | null
  shuffleLimit: number
  children: React.ReactNode
  className?: string
}

const PLAN_NAME: Record<PlanId, string> = { free: "Free", starter: "Starter", pro: "Pro" }

function PlanChip({ plan, used, limit }: { plan: PlanId; used: number | null; limit: number }) {
  const pct = used === null ? 0 : Math.min(100, Math.round((used / limit) * 100))
  // Paid plans have caps in the hundreds; a free cap plus shuffle packs stays well under 100.
  const unlimited = limit >= 100

  return (
    <div className="rounded-xl border border-[var(--site-rule-strong)] bg-white p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{PLAN_NAME[plan]} plan</p>
        {plan !== "pro" ? (
          <Link
            href={ROUTES.billing}
            className="rounded-md text-xs font-semibold text-[var(--site-accent-ink)] underline underline-offset-4 hover:text-[var(--site-ink)]"
          >
            {plan === "free" ? "Upgrade" : "See plans"}
          </Link>
        ) : null}
      </div>
      {used !== null && !unlimited ? (
        <>
          <p className="mt-2 text-xs text-[var(--site-ink-2)]">
            Regenerations used today: <span className="font-semibold tabular-nums text-[var(--site-ink)]">{used}</span> of {limit}
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10"
            role="progressbar"
            aria-label="Regenerations used today"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(used, limit)}
          >
            <div className="h-full rounded-full bg-[var(--site-accent-ink)]" style={{ width: `${pct}%` }} />
          </div>
        </>
      ) : (
        <p className="mt-2 text-xs text-[var(--site-ink-2)]">
          {unlimited ? "Regenerate designs as often as you like." : `${limit} design regenerations a day.`}
        </p>
      )}
    </div>
  )
}

export function DashboardShellTemplate({ userEmail, plan, shufflesUsed, shuffleLimit, children, className }: DashboardShellTemplateProps) {
  return (
    <div className={cn("site flex min-h-dvh w-full flex-col", className)}>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--site-rule)] bg-[var(--site-paper)]/95 px-4 backdrop-blur sm:px-6">
        <Link href={ROUTES.home} aria-label="Dossier home" className="rounded-lg">
          <Logo />
        </Link>
        <AccountMenu email={userEmail} planName={PLAN_NAME[plan]} />
      </header>
      <div className="flex min-w-0 flex-1">
        <AppSidebar footer={<PlanChip plan={plan} used={shufflesUsed} limit={shuffleLimit} />} />
        <main className="min-w-0 flex-1 px-4 pb-28 pt-8 sm:px-8 md:pb-12 lg:px-12 lg:pt-10">{children}</main>
      </div>
    </div>
  )
}
