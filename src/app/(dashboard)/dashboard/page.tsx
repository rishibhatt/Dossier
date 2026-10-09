import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, FilePlus2, Pencil } from "lucide-react"

import { CopyLinkButton } from "@/app/(dashboard)/dashboard/CopyLinkButton"
import { DashboardNudges } from "@/app/(dashboard)/dashboard/DashboardNudges"
import { NewPortfolioButton } from "@/app/(dashboard)/dashboard/NewPortfolioButton"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { PLAN_CARDS } from "@/lib/billing/pricing"
import { ROUTES } from "@/lib/constants/routes"
import { getDashboardContext } from "@/lib/dashboard/context"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.dashboardTitle,
  description: messages.seo.dashboardDescription,
  path: ROUTES.dashboard,
  indexable: false,
})

function portfolioTitle(payload: unknown): string {
  const doc = (payload as { document?: { meta?: { title?: unknown } } } | null)?.document
  const title = doc?.meta?.title
  return typeof title === "string" && title.trim() ? title : "Untitled portfolio"
}

/** "Role at Company" from the first experience entry, for the refresh nudge. */
function latestJob(payload: unknown): string | null {
  const sections = (payload as { document?: { sections?: unknown } } | null)?.document?.sections
  if (!Array.isArray(sections)) return null
  const exp = sections.find((s): s is { type: "experience"; data: { items?: { role?: unknown; company?: unknown }[] } } =>
    Boolean(s && typeof s === "object" && (s as { type?: unknown }).type === "experience")
  )
  const first = exp?.data?.items?.[0]
  const role = typeof first?.role === "string" ? first.role.trim() : ""
  const company = typeof first?.company === "string" ? first.company.trim() : ""
  if (role && company) return `${role} at ${company}`
  return role || company || null
}

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" })
const display = { fontFamily: "var(--site-display)" } as const

function firstName(username: string | null, email: string | null) {
  const raw = username ?? email?.split("@")[0] ?? ""
  const word = raw.split(/[._-]/)[0] ?? ""
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : null
}

export default async function DashboardHomePage() {
  const ctx = await getDashboardContext()

  const { data: portfolios } =
    ctx.supabase && ctx.userId
      ? await ctx.supabase
          .from("published_portfolios")
          .select("slug, payload, updated_at, indexable")
          .eq("user_id", ctx.userId)
          .order("updated_at", { ascending: false })
      : { data: [] }

  const rows = portfolios ?? []
  const limit = ctx.limits.portfolios
  const atLimit = rows.length >= limit
  const plan = PLAN_CARDS.find((p) => p.id === ctx.plan)!
  const name = firstName(ctx.username, ctx.email)
  const shuffleLimit = ctx.limits.daily.regenerate + ctx.shuffleBonus

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]" style={display}>
            {name ? `Hello, ${name}` : messages.dashboard.overviewTitle}
          </h1>
          <p className="mt-2 text-[var(--site-ink-2)]">
            {rows.length === 0
              ? "Build your first portfolio from your resume."
              : `You have ${rows.length} published ${rows.length === 1 ? "portfolio" : "portfolios"}.`}
          </p>
        </div>
        <NewPortfolioButton atLimit={atLimit && rows.length > 0} plan={ctx.plan} />
      </div>

      <DashboardNudges
        latest={
          rows[0]
            ? { slug: rows[0].slug, updatedAt: rows[0].updated_at, latestJob: latestJob(rows[0].payload) }
            : null
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <section aria-labelledby="portfolios-h">
          <h2 id="portfolios-h" className="sr-only">
            Your portfolios
          </h2>
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--site-rule-strong)] bg-white px-6 py-12 text-center sm:px-10">
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[var(--site-accent-wash)] text-[var(--site-accent-ink)]">
                <FilePlus2 className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-[-0.03em]" style={display}>
                Nothing published yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--site-ink-2)]">
                Upload your resume, pick a look and publish. Your portfolio will show up here with its link.
              </p>
              <Link href={ROUTES.build} className="dx-btn dx-btn-primary mt-6">
                Build from my resume
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--site-rule)] overflow-hidden rounded-2xl border border-[var(--site-rule-strong)] bg-white">
              {rows.map((row) => {
                const path = `/p/${row.slug}`
                return (
                  <li key={row.slug} className="flex flex-col gap-4 p-4 sm:p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="truncate text-base font-semibold">{portfolioTitle(row.payload)}</h3>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f5ec] px-2 py-0.5 text-xs font-semibold text-[#14613a]">
                          <span className="size-1.5 rounded-full bg-[#14613a]" aria-hidden />
                          Published
                        </span>
                      </div>
                      <p className="site-mono mt-1 truncate text-sm text-[var(--site-ink-2)]">{path}</p>
                      <p className="mt-1 text-xs text-[var(--site-ink-2)]">
                        Updated {dateFormat.format(new Date(row.updated_at))}
                        {" · "}
                        {row.indexable ? "Visible in search" : "Hidden from search"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyLinkButton path={path} />
                      <Link href={path} target="_blank" rel="noopener noreferrer" className="dx-btn dx-btn-outline dx-btn-sm">
                        <ExternalLink className="size-4" aria-hidden />
                        Open
                      </Link>
                      <Link href={ROUTES.build} className="dx-btn dx-btn-outline dx-btn-sm">
                        <Pencil className="size-4" aria-hidden />
                        Edit
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {atLimit && rows.length > 0 && ctx.plan !== "pro" ? (
            <p className="mt-4 text-sm text-[var(--site-ink-2)]">
              Your plan includes {limit} published {limit === 1 ? "portfolio" : "portfolios"}.
              {limit === 1 ? " Publishing again replaces it, and the link stays the same." : ""}{" "}
              <Link href={ROUTES.billing} className="font-semibold text-[var(--site-accent-ink)] underline underline-offset-4 hover:text-[var(--site-ink)]">
                See plans
              </Link>
            </p>
          ) : null}
        </section>

        <aside aria-labelledby="plan-h" className="rounded-2xl border border-[var(--site-rule-strong)] bg-white p-5">
          <h2 id="plan-h" className="text-sm font-semibold text-[var(--site-ink-2)]">
            Your plan
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-[-0.03em]" style={display}>
            {plan.name}
          </p>
          <p className="text-sm text-[var(--site-ink-2)]">
            {plan.price} {plan.cadence}
          </p>
          <dl className="mt-4 space-y-2 border-t border-[var(--site-rule)] pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--site-ink-2)]">Portfolios</dt>
              <dd className="font-semibold tabular-nums">
                {rows.length} of {limit}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--site-ink-2)]">Regenerations today</dt>
              <dd className="font-semibold tabular-nums">
                {shuffleLimit >= 100
                  ? "Unlimited"
                  : ctx.shufflesUsed === null
                    ? `${shuffleLimit} a day`
                    : `${ctx.shufflesUsed} of ${shuffleLimit}`}
              </dd>
            </div>
          </dl>
          <Link href={ROUTES.billing} className="dx-btn dx-btn-outline dx-btn-sm mt-5 w-full">
            {ctx.plan === "pro" ? "Plan details" : "See plans"}
          </Link>
        </aside>
      </div>
    </div>
  )
}
