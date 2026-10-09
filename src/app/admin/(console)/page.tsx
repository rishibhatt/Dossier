import Link from "next/link"

import { BarList, LineChart, Stat } from "@/components/admin/Charts"
import { getOverview, getRecentSignups, getRecentSubscriptions } from "@/lib/admin/data"
import { requireAdmin } from "@/lib/admin/auth"

export const dynamic = "force-dynamic"

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "0%")
const when = (iso: string) => iso.slice(0, 16).replace("T", " ")

export default async function AdminOverview() {
  const { admin } = await requireAdmin()
  const [o, signups, subs] = await Promise.all([getOverview(admin, 30), getRecentSignups(admin), getRecentSubscriptions(admin)])
  const t = o.totals
  const free = Math.max(0, t.users - t.paid)
  const sum = (k: "signups" | "publishes" | "builds") => o.daily.reduce((s, d) => s + d[k], 0)
  const series = (k: "signups" | "publishes" | "builds") => o.daily.map((d) => ({ label: d.day, value: d[k] }))

  return (
    <div className="grid gap-12">
      <div>
        <p className="sp-data">Console / Overview</p>
        <h1 className="site-h2 mt-2">Overview</h1>
      </div>

      <section aria-label="Totals">
        <div className="grid grid-cols-2 gap-px border border-[var(--site-rule-strong)] bg-[var(--site-rule)] sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Users" value={t.users} note={`${t.users_7d} in 7 days`} />
          <Stat label="New, 30 days" value={t.users_30d} />
          <Stat label="Paying" value={t.paid} note={`${pct(t.paid, t.users)} of users`} />
          <Stat label="Starter" value={t.starter} />
          <Stat label="Pro" value={t.pro} />
          <Stat label="Sites published" value={t.portfolios} />
          <Stat label="People who published" value={t.publishers} note={`${pct(t.publishers, t.users)} of users`} />
          <Stat label="Credits outstanding" value={t.credits_outstanding} />
          <Stat label="Active subscriptions" value={t.active_subscriptions} />
          <Stat label="Open messages" value={t.messages_new} />
        </div>
      </section>

      <section aria-label="Last 30 days" className="grid gap-10 lg:grid-cols-3">
        {(
          [
            ["signups", "Sign-ups per day"],
            ["publishes", "Sites published per day"],
            ["builds", "Resume builds per day"],
          ] as const
        ).map(([k, title]) => (
          <div key={k}>
            <div className="flex items-baseline justify-between border-b border-[var(--site-ink)] pb-2">
              <h2 className="site-h3">{title}</h2>
              <span className="sp-no">{sum(k)}</span>
            </div>
            <LineChart data={series(k)} label={title} className="mt-3" />
          </div>
        ))}
      </section>

      <section aria-label="Mix and funnel" className="grid gap-10 lg:grid-cols-3">
        <div>
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Plan mix</h2>
          <BarList label="Users by plan" className="mt-4" data={[{ label: "Free", value: free }, { label: "Starter", value: t.starter }, { label: "Pro", value: t.pro }]} />
        </div>
        <div>
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Funnel</h2>
          <BarList label="Funnel" className="mt-4" data={[{ label: "Signed up", value: t.users }, { label: "Published", value: t.publishers }, { label: "Paying", value: t.paid }]} />
        </div>
        <div>
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Referrals</h2>
          <BarList label="Referrals by status" className="mt-4" data={Object.entries(o.referrals).map(([label, value]) => ({ label: label.replace("_", " "), value }))} />
        </div>
      </section>

      <section aria-label="Usage">
        <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Actions in the last 30 days</h2>
        <BarList label="Usage by action" className="mt-4 max-w-xl" data={Object.entries(o.usage_by_kind).map(([label, value]) => ({ label, value }))} />
      </section>

      <section aria-label="Recent" className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Newest users</h2>
          <ul className="mt-2">
            {signups.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 border-b border-[var(--site-rule)] py-3 text-sm">
                <Link href={`/admin/users/${u.id}`} className="min-w-0 truncate underline decoration-[var(--site-rule-strong)] underline-offset-4 hover:decoration-[var(--site-ink)]">
                  {u.email ?? u.id}
                </Link>
                <span className="sp-data shrink-0">
                  {u.plan} · {when(u.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Latest subscriptions</h2>
          {subs.length ? (
            <ul className="mt-2">
              {subs.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 border-b border-[var(--site-rule)] py-3 text-sm">
                  <Link href={`/admin/users/${s.user_id}`} className="min-w-0 truncate underline decoration-[var(--site-rule-strong)] underline-offset-4">
                    {s.email ?? s.user_id}
                  </Link>
                  <span className="sp-data shrink-0">
                    {s.plan} · {s.status} · {s.provider}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="site-body mt-4">No payments yet. Subscriptions and purchases appear here once checkout is live.</p>
          )}
        </div>
      </section>
    </div>
  )
}
