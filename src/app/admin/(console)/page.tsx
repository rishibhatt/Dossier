import Link from "next/link"

import { BarList, LineChart, Stat } from "@/components/admin/Charts"
import { getOverview, getRecentSignups, getRecentSubscriptions, RANGES } from "@/lib/admin/data"
import { requireAdmin } from "@/lib/admin/auth"

import { sendTestEmailsAction } from "../actions"

export const dynamic = "force-dynamic"

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "0%")
const when = (iso: string) => iso.slice(0, 16).replace("T", " ")

type Props = { searchParams: Promise<{ days?: string; test?: string }> }
type Series = "signups" | "resumes" | "publishes" | "builds"

export default async function AdminOverview({ searchParams }: Props) {
  const { admin } = await requireAdmin()
  const sp = await searchParams
  const days = RANGES.find((r) => String(r) === sp.days) ?? 30
  const includeTest = sp.test === "1"
  const [o, signups, subs] = await Promise.all([getOverview(admin, days, includeTest), getRecentSignups(admin, 8, includeTest), getRecentSubscriptions(admin)])
  const t = o.totals
  const c = o.cohort
  const free = Math.max(0, t.users - t.paid)
  const sum = (k: Series) => o.daily.reduce((s, d) => s + (d[k] ?? 0), 0)
  const series = (k: Series) => o.daily.map((d) => ({ label: d.day, value: d[k] ?? 0 }))
  const href = (next: { days?: number; test?: boolean }) =>
    `/admin?${new URLSearchParams({ days: String(next.days ?? days), ...((next.test ?? includeTest) ? { test: "1" } : {}) })}`

  return (
    <div className="grid gap-12">
      <div>
        <p className="sp-data">Console / Overview</p>
        <h1 className="site-h2 mt-2">Overview</h1>
        <form action={sendTestEmailsAction} className="mt-3">
          <button type="submit" className="text-sm underline underline-offset-4">
            Email me one copy of every app email (to check them in a real inbox)
          </button>
        </form>
        <nav aria-label="Range and data" className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <span className="flex flex-wrap gap-3">
            {RANGES.map((r) => (
              <Link key={r} href={href({ days: r })} aria-current={r === days ? "page" : undefined} className={r === days ? "font-semibold underline underline-offset-4" : "text-[var(--site-ink-2)] underline decoration-[var(--site-rule-strong)] underline-offset-4"}>
                {r === 365 ? "1 year" : `${r} days`}
              </Link>
            ))}
          </span>
          <Link href={href({ test: !includeTest })} className="underline underline-offset-4">
            {includeTest ? "Hide test accounts" : `Include test accounts (${t.test_users})`}
          </Link>
        </nav>
      </div>

      <section aria-label="Totals">
        <div className="grid grid-cols-2 gap-px border border-[var(--site-rule-strong)] bg-[var(--site-rule)] sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Users" value={t.users} note={`${t.users_7d} in 7 days`} />
          <Stat label={`New, ${days} days`} value={t.users_range} note={`${t.users_30d} in 30 days`} />
          <Stat label="Paying" value={t.paid} note={`${pct(t.paid, t.users)} of users`} />
          <Stat label="Starter" value={t.starter} />
          <Stat label="Pro" value={t.pro} />
          <Stat label="Resumes saved" value={t.resumes} note={`by ${t.resume_makers} people`} />
          <Stat label="Sites published" value={t.portfolios} />
          <Stat label="People who published" value={t.publishers} note={`${pct(t.publishers, t.users)} of users`} />
          <Stat label="Credits outstanding" value={t.credits_outstanding} />
          <Stat label="Active subscriptions" value={t.active_subscriptions} />
          <Stat label="Open messages" value={t.messages_new} />
        </div>
      </section>

      <section aria-label={`Last ${days} days`} className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["signups", "Sign-ups per day"],
            ["resumes", "Resumes saved per day"],
            ["publishes", "Sites published per day"],
            ["builds", "Resume uploads read per day"],
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
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Activation, joined in {days} days</h2>
          <BarList
            label="Activation of people who joined in the range"
            className="mt-4"
            data={[
              { label: "Signed up", value: c.signed_up },
              { label: `Saved a resume (${pct(c.made_resume, c.signed_up)})`, value: c.made_resume },
              { label: `Published a site (${pct(c.published, c.signed_up)})`, value: c.published },
              { label: `Paying (${pct(c.paid, c.signed_up)})`, value: c.paid },
            ]}
          />
        </div>
        <div>
          <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Referrals</h2>
          <BarList label="Referrals by status" className="mt-4" data={Object.entries(o.referrals).map(([label, value]) => ({ label: label.replace("_", " "), value }))} />
        </div>
      </section>

      <section aria-label="Usage">
        <h2 className="site-h3 border-b border-[var(--site-ink)] pb-2">Actions in the last {days} days</h2>
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
            <p className="site-body mt-4">No payments yet. Razorpay purchases appear here.</p>
          )}
        </div>
      </section>
    </div>
  )
}
