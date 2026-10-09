import type { Metadata } from "next"

import { InviteLinkCard, SpendCredits } from "@/app/(dashboard)/dashboard/referrals/ReferralsClient"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { REFERRAL_WINDOW_DAYS, SHUFFLE_PACK_BONUS, STARTER_UNLOCK_COST } from "@/lib/credits/constants"
import { getDashboardContext } from "@/lib/dashboard/context"
import { getReferralSummary, type ReferralSummary } from "@/lib/referrals/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { cn } from "@/lib/utils"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.referralsTitle,
  description: messages.seo.referralsDescription,
  path: ROUTES.referrals,
  indexable: false,
})

const display = { fontFamily: "var(--site-display)" } as const
const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" })

const STATUS_DOT: Record<string, string> = {
  qualified: "bg-[var(--site-ok)]",
  signed_up: "bg-[var(--site-accent)]",
  rejected: "bg-[var(--site-ink-3)]",
}

export default async function ReferralsPage() {
  const ctx = await getDashboardContext()
  const admin = createAdminSupabaseClient()

  let summary: ReferralSummary | null = null
  if (admin && ctx.userId) summary = await getReferralSummary(admin, ctx.userId)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]" style={display}>
        Invite friends
      </h1>
      <p className="mt-2 max-w-xl text-[var(--site-ink-2)]">
        Send your link to someone who needs a portfolio. When they sign up and publish their first site, you both get a credit.
      </p>

      {!summary || !summary.shareUrl ? (
        <p role="note" className="mt-8 rounded-xl border border-[var(--site-rule-strong)] bg-white px-4 py-3 text-sm">
          Invite links are not set up on this server yet. Check back soon.
        </p>
      ) : (
        <>
          <section aria-labelledby="link-h" className="mt-8 rounded-2xl border border-[var(--site-rule-strong)] bg-white p-5 sm:p-6">
            <h2 id="link-h" className="sr-only">
              Your link
            </h2>
            <InviteLinkCard shareUrl={summary.shareUrl} />
          </section>

          <section aria-labelledby="credits-h" className="mt-6 rounded-2xl border border-[var(--site-rule-strong)] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="credits-h" className="text-lg font-bold tracking-[-0.02em]" style={display}>
                Your credits
              </h2>
              <p className="text-sm">
                <span className="text-2xl font-bold tabular-nums">{summary.balance}</span>{" "}
                <span className="text-[var(--site-ink-2)]">{summary.balance === 1 ? "credit" : "credits"}</span>
              </p>
            </div>

            {ctx.plan === "free" ? <StarterProgress balance={summary.balance} /> : null}

            {summary.activePacks.length > 0 ? (
              <ul className="mt-4 space-y-1 text-sm">
                {summary.activePacks.map((until, i) => (
                  <li key={`${until}-${i}`}>
                    {SHUFFLE_PACK_BONUS} extra shuffles a day until {dateFormat.format(new Date(until))}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5">
              <SpendCredits balance={summary.balance} plan={ctx.plan} />
            </div>
          </section>

          <section aria-labelledby="how-h" className="mt-6 rounded-2xl border border-[var(--site-rule-strong)] bg-white p-5 sm:p-6">
            <h2 id="how-h" className="text-lg font-bold tracking-[-0.02em]" style={display}>
              How it works
            </h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                "Share your link with a friend.",
                "They create a Dossier account from that link.",
                "When they publish their first portfolio, you get 1 credit and so do they.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--site-ink)] text-xs font-bold text-[var(--site-paper)]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <h3 className="mt-6 text-sm font-semibold">What counts</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[var(--site-ink-2)]">
              <li>A new account made within {REFERRAL_WINDOW_DAYS} days of opening your link. People who already had an account do not count.</li>
              <li>One credit each, once per person, paid when they publish. Signing up alone does not count.</li>
              <li>Your own second account, temporary email addresses and sign ups from your own network are not counted.</li>
              <li>Up to 20 credited invites in any 30 days.</li>
              <li>1 credit buys {SHUFFLE_PACK_BONUS} more shuffles a day for a week. {STARTER_UNLOCK_COST} credits unlock Starter for good.</li>
            </ul>
          </section>

          <section aria-labelledby="list-h" className="mt-6">
            <h2 id="list-h" className="text-lg font-bold tracking-[-0.02em]" style={display}>
              People you invited
            </h2>
            <p className="mt-1 text-sm text-[var(--site-ink-2)]">
              {summary.counts.qualified} published, {summary.counts.signed_up} signed up, {summary.counts.rejected} not counted.
            </p>
            {summary.referrals.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-[var(--site-rule-strong)] bg-white px-5 py-8 text-center text-sm text-[var(--site-ink-2)]">
                No one yet. When someone signs up with your link, they show up here. We never show their name or email.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[var(--site-rule)] overflow-hidden rounded-2xl border border-[var(--site-rule-strong)] bg-white">
                {summary.referrals.map((r) => (
                  <li key={r.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Someone you invited</p>
                      <p className="mt-0.5 flex items-center gap-2 text-sm text-[var(--site-ink-2)]">
                        <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[r.status])} aria-hidden />
                        {r.statusLabel}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--site-ink-2)]">Joined {dateFormat.format(new Date(r.createdAt))}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {summary.ledger.length > 0 ? (
            <section aria-labelledby="ledger-h" className="mt-6">
              <h2 id="ledger-h" className="text-lg font-bold tracking-[-0.02em]" style={display}>
                Credit history
              </h2>
              <ul className="mt-4 divide-y divide-[var(--site-rule)] overflow-hidden rounded-2xl border border-[var(--site-rule-strong)] bg-white">
                {summary.ledger.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div className="min-w-0">
                      <p>{l.label}</p>
                      <p className="text-xs text-[var(--site-ink-2)]">{dateFormat.format(new Date(l.createdAt))}</p>
                    </div>
                    <p className={cn("shrink-0 font-semibold tabular-nums", l.delta > 0 ? "text-[var(--site-ok)]" : "text-[var(--site-ink)]")}>
                      {l.delta > 0 ? `+${l.delta}` : l.delta}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

function StarterProgress({ balance }: { balance: number }) {
  const shown = Math.min(balance, STARTER_UNLOCK_COST)
  const left = STARTER_UNLOCK_COST - shown
  return (
    <div className="mt-4">
      <p className="text-sm text-[var(--site-ink-2)]">
        {left === 0
          ? "You have enough credits to unlock Starter."
          : `${left} more ${left === 1 ? "credit" : "credits"} to unlock Starter for good.`}
      </p>
      <div
        className="mt-2 flex gap-1.5"
        role="progressbar"
        aria-label="Credits toward Starter"
        aria-valuemin={0}
        aria-valuemax={STARTER_UNLOCK_COST}
        aria-valuenow={shown}
      >
        {Array.from({ length: STARTER_UNLOCK_COST }, (_, i) => (
          <span key={i} className={cn("h-2 flex-1 rounded-full", i < shown ? "bg-[var(--site-accent-ink)]" : "bg-black/10")} />
        ))}
      </div>
    </div>
  )
}
