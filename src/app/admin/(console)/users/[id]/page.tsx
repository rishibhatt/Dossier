import Link from "next/link"
import { notFound } from "next/navigation"
import { z } from "zod"

import { BarList } from "@/components/admin/Charts"
import { requireAdmin } from "@/lib/admin/auth"
import { getUserDetail } from "@/lib/admin/data"
import { resolveEffectivePlan } from "@/lib/billing/plans"

import { CreditsForm, PlanForm } from "./UserForms"

export const dynamic = "force-dynamic"

const when = (iso: string) => iso.slice(0, 16).replace("T", " ")

export default async function AdminUser({ params }: { params: Promise<{ id: string }> }) {
  const { admin } = await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const d = await getUserDetail(admin, id)
  if (!d) notFound()
  const { user } = d
  const expires = user.plan_expires_at ? user.plan_expires_at.slice(0, 10) : ""
  const expired = user.plan !== "free" && resolveEffectivePlan(user.plan, user.plan_expires_at) === "free"

  return (
    <div className="grid gap-12">
      <div>
        <p className="sp-data">
          <Link href="/admin/users" className="underline underline-offset-4">
            Users
          </Link>{" "}
          / Detail
        </p>
        <h1 className="site-h2 mt-2 break-all">{user.email ?? user.id}</h1>
        <p className="sp-data mt-2 break-all">
          {user.id} · joined {when(user.created_at)}
          {user.username ? ` · /u/${user.username}` : ""}
        </p>
      </div>

      <section className="grid gap-px border border-[var(--site-rule-strong)] bg-[var(--site-rule)] sm:grid-cols-2 lg:grid-cols-4" aria-label="Summary">
        <div className="bg-[var(--site-paper)] p-4">
          <p className="sp-data">Plan</p>
          <p className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--site-display)" }}>
            {expired ? "free (expired)" : user.plan}
          </p>
          <p className="mt-1 text-xs text-[var(--site-ink-3)]">{user.plan_expires_at ? `ends ${user.plan_expires_at.slice(0, 10)}` : "no end date"}</p>
        </div>
        <div className="bg-[var(--site-paper)] p-4">
          <p className="sp-data">Credits</p>
          <p className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--site-display)" }}>
            {d.balance}
          </p>
        </div>
        <div className="bg-[var(--site-paper)] p-4">
          <p className="sp-data">Sites published</p>
          <p className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--site-display)" }}>
            {d.portfolios.length}
          </p>
        </div>
        <div className="bg-[var(--site-paper)] p-4">
          <p className="sp-data">Invited</p>
          <p className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--site-display)" }}>
            {d.referred.qualified ?? 0}
          </p>
          <p className="mt-1 text-xs text-[var(--site-ink-3)]">
            {d.referredBy ? `joined via invite (${d.referredBy.status})` : "not invited"}
          </p>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="plan-h">
          <h2 id="plan-h" className="site-h3 border-b border-[var(--site-ink)] pb-2">
            Change plan
          </h2>
          <div className="mt-5">
            <PlanForm userId={user.id} plan={user.plan} expires={expires} />
          </div>
        </section>
        <section aria-labelledby="credits-h">
          <h2 id="credits-h" className="site-h3 border-b border-[var(--site-ink)] pb-2">
            Add or remove credits
          </h2>
          <div className="mt-5">
            <CreditsForm userId={user.id} />
          </div>
        </section>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="ledger-h">
          <h2 id="ledger-h" className="site-h3 border-b border-[var(--site-ink)] pb-2">
            Credit history
          </h2>
          <ul className="mt-2">
            {d.ledger.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 border-b border-[var(--site-rule)] py-3 text-sm">
                <span>{l.reason.replace(/_/g, " ")}</span>
                <span className="sp-data">
                  <b className={l.delta > 0 ? "text-[var(--site-ok)]" : "text-[var(--site-danger)]"}>{l.delta > 0 ? `+${l.delta}` : l.delta}</b> · {when(l.created_at)}
                </span>
              </li>
            ))}
            {d.ledger.length === 0 ? <li className="py-3 text-sm text-[var(--site-ink-3)]">No credit activity.</li> : null}
          </ul>
        </section>
        <section aria-labelledby="use-h">
          <h2 id="use-h" className="site-h3 border-b border-[var(--site-ink)] pb-2">
            Actions in the last 7 days
          </h2>
          <BarList label="Usage" className="mt-4" data={Object.entries(d.usageByKind).map(([label, value]) => ({ label, value }))} />
        </section>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="sites-h">
          <h2 id="sites-h" className="site-h3 border-b border-[var(--site-ink)] pb-2">
            Published sites
          </h2>
          <ul className="mt-2">
            {d.portfolios.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-3 border-b border-[var(--site-rule)] py-3 text-sm">
                <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  /p/{p.slug}
                </a>
                <span className="sp-data">
                  {p.indexable ? "indexable · " : ""}updated {when(p.updated_at)}
                </span>
              </li>
            ))}
            {d.portfolios.length === 0 ? <li className="py-3 text-sm text-[var(--site-ink-3)]">Nothing published.</li> : null}
          </ul>
        </section>
        <section aria-labelledby="subs-h">
          <h2 id="subs-h" className="site-h3 border-b border-[var(--site-ink)] pb-2">
            Payments and emails
          </h2>
          <ul className="mt-2">
            {d.subscriptions.map((s) => (
              <li key={`${s.provider}-${s.created_at}`} className="flex items-center justify-between gap-3 border-b border-[var(--site-rule)] py-3 text-sm">
                <span>
                  {s.plan} · {s.status}
                </span>
                <span className="sp-data">{s.provider}</span>
              </li>
            ))}
            {d.subscriptions.length === 0 ? <li className="py-3 text-sm text-[var(--site-ink-3)]">No payments.</li> : null}
            {d.emails.map((m) => (
              <li key={`${m.kind}-${m.created_at}`} className="flex items-center justify-between gap-3 border-b border-[var(--site-rule)] py-3 text-sm">
                <span className="text-[var(--site-ink-2)]">email: {m.kind.split(":")[0]}</span>
                <span className="sp-data">{when(m.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
