import type { Metadata } from "next"
import Link from "next/link"
import { X } from "lucide-react"

import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { getVerification } from "@/content/resume/evidence"
import { FACET_GROUPS, templateEntries, type FacetKey, type TemplateEntry } from "@/content/resume/templates"
import { FilterSheet } from "@/features/resume/marketing/FilterSheet"
import { TemplateCard } from "@/features/resume/marketing/TemplateCard"
import { ROUTES } from "@/lib/constants/routes"

import "@/styles/resume-site.css"

type Search = Promise<Record<string, string | string[] | undefined>>
type Filters = Partial<Record<FacetKey, string>>

/** Only known facet values count; anything else in the query is ignored. One value per group. */
function readFilters(sp: Awaited<Search>): Filters {
  const out: Filters = {}
  for (const g of FACET_GROUPS) {
    const raw = sp[g.key]
    const v = Array.isArray(raw) ? raw[0] : raw
    if (v && g.options.some((o) => o.id === v)) out[g.key] = v
  }
  return out
}

const matches = (t: TemplateEntry, f: Filters) =>
  FACET_GROUPS.every((g) => !f[g.key] || (t.facets[g.key] as readonly string[]).includes(f[g.key]!))

function hrefFor(f: Filters) {
  const q = new URLSearchParams()
  for (const g of FACET_GROUPS) if (f[g.key]) q.set(g.key, f[g.key]!)
  const s = q.toString()
  return s ? `${ROUTES.resumeTemplates}?${s}` : ROUTES.resumeTemplates
}

const labelOf = (key: FacetKey, id: string) => (FACET_GROUPS.find((g) => g.key === key)!.options as readonly { id: string; label: string }[]).find((o) => o.id === id)?.label ?? id

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const filtered = Object.keys(readFilters(await searchParams)).length > 0
  const base = buildPageMetadata({
    title: "Free resume templates, tested with a PDF parser | Dossier",
    description:
      `${templateEntries().length} free resume templates set in Typst, each tested by reading its PDF back with a parser, with the dated results on every page. Filter by role, country format, career stage and style. Download the PDF free.`,
    path: ROUTES.resumeTemplates,
  })
  // Filtered views are for sharing, not ranking: the canonical stays on the unfiltered hub.
  return filtered ? { ...base, robots: { index: false, follow: true } } : base
}

export default async function ResumeTemplatesPage({ searchParams }: { searchParams: Search }) {
  const filters = readFilters(await searchParams)
  const all = templateEntries()
  const results = all.filter((t) => matches(t, filters))
  const active = Object.keys(filters).length as number
  const activeList = FACET_GROUPS.filter((g) => filters[g.key]).map((g) => ({ key: g.key, id: filters[g.key]!, label: labelOf(g.key, filters[g.key]!) }))

  // Nearest matches for an empty result: most filters satisfied first, then catalogue order.
  const score = (t: TemplateEntry) => FACET_GROUPS.filter((g) => filters[g.key] && (t.facets[g.key] as readonly string[]).includes(filters[g.key]!)).length
  const nearest = results.length ? [] : [...all].sort((a, b) => score(b) - score(a)).slice(0, 3)
  const tested = getVerification(all[0]!.templateId)

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume builder", item: `${siteConfig.url}${ROUTES.resume}` },
        { "@type": "ListItem", position: 3, name: "Resume templates", item: `${siteConfig.url}${ROUTES.resumeTemplates}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Dossier resume templates",
      itemListElement: all.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: `${t.engine.name} resume template`, url: `${siteConfig.url}${ROUTES.resumeTemplates}/${t.slug}` })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        running={["Resume templates", `${all.length} in the library`]}
        title="Resume templates, each with its test results"
        lead={
          <p>
            Every template here is set by the same typesetter as the editor and tested by reading its PDF back with a parser
            {tested ? `, most recently on ${tested.testedLabel}` : ""}. All of them are free, including the PDF.
          </p>
        }
      />

      <div className="site-wrap relative pb-24 lg:grid lg:grid-cols-12">
        <FilterSheet active={active} results={results.length} clearHref={ROUTES.resumeTemplates}>
          <div className="flex flex-col gap-7">
            {FACET_GROUPS.map((g) => (
              <fieldset key={g.key} className="min-w-0">
                <legend className="mb-3 w-full border-b border-[var(--site-ink)] pb-2 text-[0.9375rem] font-semibold">{g.label}</legend>
                <ul className="flex flex-wrap gap-2">
                  {(g.options as readonly { id: string; label: string }[]).map((o) => {
                    const on = filters[g.key] === o.id
                    const next = { ...filters, [g.key]: on ? undefined : o.id }
                    const count = all.filter((t) => matches(t, next)).length
                    return (
                      <li key={o.id}>
                        <Link
                          href={hrefFor(next)}
                          scroll={false}
                          className="sp-chip"
                          aria-current={on ? "true" : undefined}
                          aria-disabled={!on && count === 0 ? "true" : undefined}
                          tabIndex={!on && count === 0 ? -1 : undefined}
                          rel="nofollow"
                        >
                          {o.label}
                          <span className="rs-chip-count">{on ? <X className="size-3.5" aria-label="remove" /> : count}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            ))}
            {active ? (
              <Link href={ROUTES.resumeTemplates} scroll={false} className="site-link-mark hidden self-start text-sm font-medium lg:inline">
                Clear all filters
              </Link>
            ) : null}
          </div>
        </FilterSheet>

        <section aria-labelledby="results-title" className="mt-6 min-w-0 lg:col-span-9 lg:mt-0">
          <h2 id="results-title" className="sr-only">
            Templates
          </h2>
          <p className="sp-data mb-3 hidden lg:block" aria-live="polite">
            {results.length} of {all.length} templates{activeList.length ? ` · ${activeList.map((a) => a.label).join(" + ")}` : ""}
          </p>

          {results.length ? (
            <div className="sp-cells grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4">
              {results.map((t, i) => (
                <TemplateCard key={t.slug} t={t} priority={i < 2} />
              ))}
            </div>
          ) : (
            <div className="border-t border-[var(--site-ink)] pt-6" aria-live="polite">
              <p className="site-h3">No templates match {activeList.map((a) => a.label).join(" + ")}.</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {activeList.map((a) => (
                  <li key={a.key}>
                    <Link href={hrefFor({ ...filters, [a.key]: undefined })} scroll={false} className="sp-chip" rel="nofollow">
                      Remove {a.label}
                      <X className="size-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="site-body mt-8">The closest matches:</p>
              <div className="sp-cells mt-3 grid-cols-2 lg:grid-cols-3">
                {nearest.map((t) => (
                  <TemplateCard key={t.slug} t={t} idPrefix="near" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 grid gap-6 border-t border-[var(--site-rule-strong)] pt-8 sm:grid-cols-2">
            <p className="site-body">
              Each template is tested the same way before it appears here, with {all[0] ? getVerification(all[0].templateId)?.samples : ""} fictional
              sample resumes from different fields. Every template takes all seven country formats, so the paper size, date style and personal
              details follow where you are applying.
            </p>
            <p className="site-body">
              Not sure which to pick? Start with{" "}
              <Link href={`${ROUTES.resumeTemplates}/ledger`} className="site-link-mark font-medium text-[var(--site-ink)]">
                Ledger
              </Link>
              . You can switch templates in the editor at any time without retyping anything. For the words to use, see the{" "}
              <Link href={ROUTES.resumeKeywords} className="site-link-mark font-medium text-[var(--site-ink)]">
                resume keywords by role
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
