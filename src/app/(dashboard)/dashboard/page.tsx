import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, FilePlus2, Pencil } from "lucide-react"

import { CopyLinkButton } from "@/app/(dashboard)/dashboard/CopyLinkButton"
import { DashboardNudges } from "@/app/(dashboard)/dashboard/DashboardNudges"
import { NewPortfolioButton } from "@/app/(dashboard)/dashboard/NewPortfolioButton"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
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
const shortDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" })
const display = { fontFamily: "var(--site-display)" } as const

type Look = { bg: string; text: string; accent: string; muted: string; font: string }

/** The site's own palette and display face, so each site's plate is printed in its own look. */
function lookOf(payload: unknown): Look {
  const t = (payload as { designConfig?: { tokens?: { colors?: Record<string, unknown>; typography?: { displayFont?: unknown } } } } | null)?.designConfig?.tokens
  const c = t?.colors ?? {}
  const pick = (v: unknown, fallback: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fallback)
  const font = typeof t?.typography?.displayFont === "string" ? t.typography.displayFont : ""
  return { bg: pick(c.bg, "#fffefb"), text: pick(c.text, "#101114"), accent: pick(c.accent, "#6d5cf6"), muted: pick(c.textMuted, "#4f5562"), font }
}

function firstName(username: string | null, email: string | null) {
  const raw = username ?? email?.split("@")[0] ?? ""
  const word = raw.split(/[._-]/)[0] ?? ""
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : null
}

/** Day strings (UTC) for the visit counts: 30 days back, 7 days back, and the last 14 days in order. */
function viewWindow() {
  const day = (back: number) => new Date(Date.now() - back * 86_400_000).toISOString().slice(0, 10)
  return { since: day(29), weekAgo: day(6), days14: Array.from({ length: 14 }, (_, i) => day(13 - i)) }
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

  const { data: resumeRows } =
    ctx.supabase && ctx.userId
      ? await ctx.supabase
          .from("resumes")
          .select("id, title, template_id, updated_at")
          .eq("user_id", ctx.userId)
          .order("updated_at", { ascending: false })
          .limit(50)
      : { data: [] }
  const resumes = resumeRows ?? []
  const resumeLimit = ctx.plan === "free" ? 2 : null

  const rows = portfolios ?? []
  // Visits per site per day for the last 30 days (row level security returns only this owner's sites).
  const { since, weekAgo, days14 } = viewWindow()
  const { data: viewRows } =
    ctx.supabase && rows.length
      ? await ctx.supabase.from("portfolio_views").select("slug, day, views").in("slug", rows.map((r) => r.slug)).gte("day", since)
      : { data: [] }
  const visits = (slug: string, from: string) => (viewRows ?? []).filter((v) => v.slug === slug && v.day >= from).reduce((n, v) => n + v.views, 0)
  const perDay = (slug: string) => days14.map((d) => (viewRows ?? []).find((v) => v.slug === slug && v.day === d)?.views ?? 0)
  const limit = ctx.limits.portfolios
  const atLimit = rows.length >= limit
  const plan = PLAN_CARDS.find((p) => p.id === ctx.plan)!
  const name = firstName(ctx.username, ctx.email)
  const shuffleLimit = ctx.limits.daily.regenerate + ctx.shuffleBonus
  const isPro = ctx.plan === "pro"

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--site-ink)] pb-2">
        <p className="sp-data">Dashboard</p>
        <p className="sp-data">
          {plan.name} plan{ctx.planExpiresAt ? ` · until ${shortDate.format(new Date(ctx.planExpiresAt))}` : ""}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-[1] tracking-[-0.04em] [text-wrap:balance]" style={display}>
            {name ? `Hello, ${name}` : messages.dashboard.overviewTitle}
          </h1>
          <p className="mt-3 max-w-[38rem] text-[var(--site-ink-2)]">
            {rows.length === 0
              ? "Upload the resume you already have. Dossier sets it as a website you can share with one link."
              : rows.length === 1
                ? "Your site is live. Share the link, and come back to update it whenever your resume changes."
                : `You have ${rows.length} sites live. Each one has its own link and visit count.`}
          </p>
        </div>
        <NewPortfolioButton atLimit={atLimit && rows.length > 0} plan={ctx.plan} />
      </div>

      <DashboardNudges latest={rows[0] ? { slug: rows[0].slug, updatedAt: rows[0].updated_at, latestJob: latestJob(rows[0].payload) } : null} />

      <section aria-labelledby="sites-h" className="mt-8">
        <h2 id="sites-h" className="sr-only">
          Your sites
        </h2>
        {rows.length === 0 ? (
          <div className="border border-dashed border-[var(--site-ink)] bg-[var(--site-sheet)] p-6 sm:p-10">
            <p className="text-[clamp(1.25rem,2vw,1.625rem)] font-[650] leading-[1.15] tracking-[-0.025em]" style={display}>
              Your site is two minutes away
            </p>
            <ol className="mt-4 grid gap-2 text-[var(--site-ink-2)] sm:grid-cols-3 sm:gap-6">
              <li>
                <span className="sp-data mr-2">1</span>Upload your resume PDF.
              </li>
              <li>
                <span className="sp-data mr-2">2</span>Pick a look, edit any line.
              </li>
              <li>
                <span className="sp-data mr-2">3</span>Publish and share the link.
              </li>
            </ol>
            <Link href={ROUTES.build} className="dx-btn dx-btn-primary mt-6 w-full sm:w-auto">
              Build my site
            </Link>
            <p className="mt-4 text-sm text-[var(--site-ink-2)]">
              No resume file? On LinkedIn press <strong className="font-semibold text-[var(--site-ink)]">More</strong>, then{" "}
              <strong className="font-semibold text-[var(--site-ink)]">Save to PDF</strong>, and upload that.
            </p>
          </div>
        ) : (
          <ul className="grid gap-6">
            {rows.map((row) => {
              const path = `/p/${row.slug}`
              const url = `${siteConfig.url}${path}`
              const look = lookOf(row.payload)
              const title = portfolioTitle(row.payload)
              const job = latestJob(row.payload)
              const week = visits(row.slug, weekAgo)
              const days = perDay(row.slug)
              const max = Math.max(1, ...days)
              return (
                <li key={row.slug} className="grid border border-[var(--site-rule-strong)] bg-white md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  <Link
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${title} in a new tab`}
                    className="group flex min-h-48 flex-col justify-between gap-6 p-5 sm:p-6"
                    style={{ background: look.bg, color: look.text }}
                  >
                    <span className="flex items-center justify-between font-mono text-xs" style={{ color: look.muted }}>
                      <span>Live</span>
                      <ArrowUpRight
                        className="size-4 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                    <span>
                      <span
                        className="block break-words text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[0.95] tracking-[-0.035em]"
                        style={{ fontFamily: look.font ? `"${look.font}", var(--site-display)` : "var(--site-display)" }}
                      >
                        {title}
                      </span>
                      {job ? (
                        <span className="mt-2 block text-sm" style={{ color: look.muted }}>
                          {job}
                        </span>
                      ) : null}
                      <span className="mt-4 block h-1 w-12" style={{ background: look.accent }} aria-hidden />
                    </span>
                  </Link>

                  <div className="flex min-w-0 flex-col border-t border-[var(--site-rule-strong)] md:border-l md:border-t-0">
                    <dl className="grid grid-cols-2 gap-px bg-[var(--site-rule)]">
                      <div className="col-span-2 bg-white p-4">
                        <dt className="sp-data">Link</dt>
                        <dd className="site-mono mt-1 truncate text-sm">{url.replace(/^https?:\/\//, "")}</dd>
                      </div>
                      <div className="bg-white p-4">
                        <dt className="sp-data">Visits, 7 days</dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums tracking-[-0.03em]" style={display}>
                          {week}
                        </dd>
                      </div>
                      <div className="bg-white p-4">
                        <dt className="sp-data">Updated</dt>
                        <dd className="mt-1 text-sm font-semibold">{dateFormat.format(new Date(row.updated_at))}</dd>
                        <dd className="text-xs text-[var(--site-ink-2)]">{row.indexable ? "Shown in Google" : "Hidden from Google"}</dd>
                      </div>
                      <div className="col-span-2 bg-white p-4">
                        {isPro ? (
                          <>
                            <p className="sp-data">Visits per day, last 14 days · {visits(row.slug, since)} in 30 days</p>
                            <div className="mt-2 flex h-10 items-end gap-1" role="img" aria-label={`Visits per day, last 14 days, oldest first: ${days.join(", ")}`}>
                              {days.map((n, i) => (
                                <span
                                  key={days14[i]}
                                  title={`${days14[i]}: ${n}`}
                                  className="flex-1 bg-[var(--site-ink)]"
                                  style={{ height: `${Math.max(4, (n / max) * 100)}%`, opacity: n ? 1 : 0.15 }}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-[var(--site-ink-2)]">
                            See visits day by day with{" "}
                            <Link href={ROUTES.billing} className="font-semibold text-[var(--site-ink)] underline underline-offset-4">
                              Pro
                            </Link>
                            .
                          </p>
                        )}
                      </div>
                    </dl>
                    <div className="grid grid-cols-2 gap-2 border-t border-[var(--site-rule)] p-4 sm:flex sm:flex-wrap">
                      <Link href={ROUTES.build} className="dx-btn dx-btn-primary dx-btn-sm col-span-2 sm:col-span-1">
                        <Pencil className="size-4" aria-hidden />
                        Edit site
                      </Link>
                      <CopyLinkButton path={path} />
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dx-btn dx-btn-outline dx-btn-sm"
                      >
                        LinkedIn
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`My portfolio: ${url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dx-btn dx-btn-outline dx-btn-sm col-span-2 sm:col-span-1"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {atLimit && rows.length > 0 && !isPro ? (
          <p className="mt-3 text-sm text-[var(--site-ink-2)]">
            Your plan includes {limit} {limit === 1 ? "site" : "sites"}.{limit === 1 ? " Publishing again updates it, and the link stays the same." : ""}{" "}
            <Link href={ROUTES.billing} className="font-semibold text-[var(--site-ink)] underline underline-offset-4">
              More with Pro
            </Link>
          </p>
        ) : null}
      </section>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-labelledby="resumes-h">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--site-ink)] pb-2">
            <h2 id="resumes-h" className="text-[clamp(1.25rem,2vw,1.625rem)] font-[650] tracking-[-0.025em]" style={display}>
              Resumes
            </h2>
            <span className="sp-data">{resumeLimit ? `${resumes.length} of ${resumeLimit}` : resumes.length}</span>
          </div>
          {resumes.length === 0 ? (
            <p className="py-4 text-sm text-[var(--site-ink-2)]">Make a resume from a tested template. The PDF download is free on every plan.</p>
          ) : (
            <ul className="divide-y divide-[var(--site-rule)]">
              {resumes.map((r) => (
                <li key={r.id}>
                  <Link href={`${ROUTES.resumeEdit}?id=${r.id}`} className="flex min-h-14 items-center justify-between gap-4 py-3 transition-colors hover:bg-[var(--site-sheet)]">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.title || "Untitled resume"}</span>
                      <span className="sp-data">Edited {dateFormat.format(new Date(r.updated_at))}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                      <Pencil className="size-4" aria-hidden />
                      Edit
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href={ROUTES.resumeNew} className="dx-btn dx-btn-outline dx-btn-sm mt-4 w-full sm:w-auto">
            <FilePlus2 className="size-4" aria-hidden />
            New resume
          </Link>
        </section>

        <section aria-labelledby="plan-h">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--site-ink)] pb-2">
            <h2 id="plan-h" className="text-[clamp(1.25rem,2vw,1.625rem)] font-[650] tracking-[-0.025em]" style={display}>
              Plan and usage
            </h2>
            <span className="sp-data">{plan.name}</span>
          </div>
          <dl className="divide-y divide-[var(--site-rule)] text-sm">
            {(
              [
                ["Sites", `${rows.length} of ${limit}`],
                ["Saved resumes", resumeLimit ? `${resumes.length} of ${resumeLimit}` : `${resumes.length}`],
                ["Design shuffles today", shuffleLimit >= 100 ? "Unlimited" : ctx.shufflesUsed === null ? `${shuffleLimit} a day` : `${ctx.shufflesUsed} of ${shuffleLimit}`],
                ["Dossier badge", ctx.plan === "free" ? "Shown" : "Removed"],
                ["ZIP download", ctx.limits.zipExport ? "Included" : "Starter and Pro"],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex min-h-12 items-center justify-between gap-3">
                <dt className="text-[var(--site-ink-2)]">{k}</dt>
                <dd className="font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid gap-2 sm:flex">
            <Link href={ROUTES.billing} className={isPro ? "dx-btn dx-btn-outline dx-btn-sm" : "dx-btn dx-btn-primary dx-btn-sm"}>
              {ctx.plan === "free" ? "Remove the badge" : isPro ? "Plan details" : "See Pro"}
            </Link>
            <Link href={ROUTES.referrals} className="dx-btn dx-btn-outline dx-btn-sm">
              Invite a friend, earn credit
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
