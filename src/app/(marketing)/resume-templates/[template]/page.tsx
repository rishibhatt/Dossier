import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, Minus, Plus } from "lucide-react"

import { SiteButton } from "@/components/marketing/primitives"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { getThumb, getVerification, stampText } from "@/content/resume/evidence"
import { getRole } from "@/content/roles"
import { FORMAT_FACETS, getTemplatePage, templateEntries } from "@/content/resume/templates"
import { dataLine, TemplateCard, TestStamp } from "@/features/resume/marketing/TemplateCard"
import { TemplatePreview, type PreviewSample } from "@/features/resume/marketing/TemplatePreview"
import { ROUTES } from "@/lib/constants/routes"
import { ACCENTS } from "@/lib/resume/schema"
import { SAMPLE_RESUMES } from "@/lib/resume/samples"

import "@/styles/resume-site.css"

export const dynamicParams = false

export function generateStaticParams() {
  return templateEntries().map((t) => ({ template: t.slug }))
}

type Props = { params: Promise<{ template: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { template } = await params
  const t = getTemplatePage(template)
  if (!t) return {}
  const v = getVerification(t.templateId)
  return buildPageMetadata({
    title: `${t.engine.name} resume template (${t.engine.layout.toLowerCase()}), free PDF | Dossier`,
    description: `${t.engine.name} is a free ${t.engine.columns === 2 ? "two-column" : "one-column"} resume template. ${t.engine.bestFor}${v ? ` ${stampText(v)}.` : ""} Edit it in your browser and download the PDF free.`,
    path: `${ROUTES.resumeTemplates}/${t.slug}`,
    image: `/og/resume-templates/${t.slug}`,
    openGraph: { title: `${t.engine.name}: a tested resume template`, description: t.tagline },
  })
}

/** Plain names for the checks the verification script writes. */
const CHECK_LABEL: Record<string, string> = {
  compiles: "Sets as a PDF without errors",
  "all fields extracted": "Every field read back",
  "reading order": "Fields come out in order",
  "no broken glyphs": "No broken characters",
  "links clickable": "Links are clickable",
  "title metadata": "PDF title set to name and headline",
  "contact near top": "Contact details near the top",
}

export default async function TemplatePage({ params }: Props) {
  const { template } = await params
  const t = getTemplatePage(template)
  if (!t) notFound()

  const v = getVerification(t.templateId)
  const url = `${siteConfig.url}${ROUTES.resumeTemplates}/${t.slug}`
  const useHref = `${ROUTES.resumeNew}?template=${t.templateId}`
  // The template's showcase samples (templates.ts), each rendered at build time.
  const showcase = t.engine.showcase.map((id) => SAMPLE_RESUMES.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s))
  const samples: PreviewSample[] = showcase.map((s) => ({
    id: s.id,
    label: s.label,
    role: s.role,
    renders: { a4: getThumb(t.templateId, s.id, "a4"), "us-letter": getThumb(t.templateId, s.id, "us-letter") },
  }))
  const keywordRoles = t.keywordRoles.map((slug) => getRole(slug)).filter((r): r is NonNullable<typeof r> => Boolean(r))
  const others = templateEntries().filter((x) => x.slug !== t.slug)
  const formats = FORMAT_FACETS.filter((f) => t.facets.format.includes(f.id))
  const ogThumb = getThumb(t.templateId, t.sample, "a4")

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume templates", item: `${siteConfig.url}${ROUTES.resumeTemplates}` },
        { "@type": "ListItem", position: 3, name: t.engine.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${t.engine.name} resume template`,
      description: t.answer,
      url,
      isAccessibleForFree: true,
      inLanguage: "en",
      genre: "Resume template",
      ...(ogThumb ? { image: `${siteConfig.url}${ogThumb.srcLarge}` } : {}),
      ...(v ? { dateModified: v.testedAt } : {}),
      creator: { "@type": "Organization", name: "Dossier", url: siteConfig.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="site-wrap pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="sp-data flex items-center justify-between gap-4 border-b border-[var(--site-ink)] pb-2">
          <ol className="flex min-w-0 flex-wrap items-center gap-x-2">
            <li>
              <Link href={ROUTES.resume} className="hover:text-[var(--site-ink)] hover:underline">
                Resume
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={ROUTES.resumeTemplates} className="hover:text-[var(--site-ink)] hover:underline">
                Templates
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="truncate">
              {t.engine.name}
            </li>
          </ol>
          <span className="sp-no shrink-0">No. {t.engine.no}</span>
        </nav>
      </div>

      <div className="site-wrap grid gap-10 pb-16 pt-8 sm:pt-10 lg:grid-cols-12 lg:gap-0">
        {/* Right column first on phones would hide the preview; the preview leads, as on the landing. */}
        <div className="min-w-0 lg:col-span-7 lg:border-r lg:border-[var(--site-rule-strong)] lg:pr-10">
          <TemplatePreview name={t.engine.name} samples={samples} initialSample={t.sample} />
        </div>

        <aside className="min-w-0 lg:col-span-5 lg:pl-10" aria-labelledby="tpl-title">
          <div className="lg:sticky lg:top-24">
            <h1 id="tpl-title" className="site-h1 lg:text-[clamp(3rem,5vw,4.5rem)]">
              {t.engine.name}
            </h1>
            <p className="sp-data mt-3">{dataLine(t)}</p>
            <p className="site-lead mt-5">{t.answer}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SiteButton href={useHref} size="lg" arrow>
                Use this template
              </SiteButton>
              <SiteButton href={useHref} variant="secondary" size="lg">
                Import my resume into this
              </SiteButton>
            </div>
            <p className="mt-3 text-sm text-[var(--site-ink-2)]">Start without an account. Sign in when you download the PDF, which is free.</p>

            {v ? <TestStamp v={v} id="detail" className="mt-6" /> : null}

            <details className="group mt-8 border-t border-[var(--site-ink)] lg:open:border-t" open>
              <summary className="flex min-h-12 cursor-pointer items-center justify-between py-3 font-semibold">
                Specifications
                <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
              </summary>
              <table className="rs-table mb-4">
                <tbody>
                  <tr>
                    <th scope="row">Layout</th>
                    <td>{t.engine.layout}</td>
                  </tr>
                  <tr>
                    <th scope="row">Body type</th>
                    <td className="rs-num">{t.body.face}, 9.5 / 10 / 10.5 pt by density</td>
                  </tr>
                  <tr>
                    <th scope="row">Paper</th>
                    <td>A4 and US Letter</td>
                  </tr>
                  <tr>
                    <th scope="row">Country formats</th>
                    <td>All 7 presets; suits {formats.map((f) => f.label).join(", ")}</td>
                  </tr>
                  <tr>
                    <th scope="row">Accent colours</th>
                    <td className="rs-num">{ACCENTS.length}, each 4.5:1 or better on white</td>
                  </tr>
                  <tr>
                    <th scope="row">Photo</th>
                    <td>Not supported yet</td>
                  </tr>
                  <tr>
                    <th scope="row">Export</th>
                    <td>PDF with selectable text, embedded fonts, title metadata</td>
                  </tr>
                  <tr>
                    <th scope="row">Price</th>
                    <td>Free, including the PDF download</td>
                  </tr>
                </tbody>
              </table>
            </details>

            {v ? (
              <details className="group border-t border-[var(--site-ink)]" open>
                <summary className="flex min-h-12 cursor-pointer items-center justify-between py-3 font-semibold">
                  Test results, {v.testedLabel}
                  <Plus className="size-4 transition-transform group-open:rotate-45" aria-hidden />
                </summary>
                <table className="rs-table">
                  <thead>
                    <tr>
                      <th scope="col">Check</th>
                      <th scope="col" className="text-right">
                        Passed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.checks.map((c) => (
                      <tr key={c.name}>
                        <th scope="row" className="!font-normal !text-[var(--site-ink-2)]">
                          {CHECK_LABEL[c.name] ?? c.name}
                        </th>
                        <td className="rs-num whitespace-nowrap !pr-0 text-right">
                          <span className={c.passed === c.runs ? "rs-ok inline-flex items-center gap-1" : "inline-flex items-center gap-1 text-[var(--site-danger)]"}>
                            {c.passed === c.runs ? <Check className="size-3.5" aria-hidden /> : <Minus className="size-3.5" aria-hidden />}
                            {c.passed}/{c.runs}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="sp-data mt-3 pb-2">
                  {v.samples} sample resumes × 3 densities × 2 paper sizes. {v.engine}, text read back with {v.extractor}. Automated test; not yet run
                  through a commercial ATS.
                </p>
              </details>
            ) : null}
          </div>
        </aside>
      </div>

      <section aria-labelledby="guide" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-16 sm:py-24">
        <div className="site-wrap grid gap-10 lg:grid-cols-12">
          <h2 id="guide" className="site-h2 lg:col-span-4">
            Using {t.engine.name}
          </h2>
          <div className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-8">
            {t.guidance.map((g) => (
              <div key={g.heading} className="grid gap-2 border-b border-[var(--site-rule)] py-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
                <h3 className="site-h3 !text-[1.125rem]">{g.heading}</h3>
                <p className="site-body">{g.body}</p>
              </div>
            ))}
            {keywordRoles.length ? (
              <div className="grid gap-2 py-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
                <h3 className="site-h3 !text-[1.125rem]">Words to use</h3>
                <p className="site-body">
                  The layout is half of it. For the terms recruiters search for, see the keyword lists for{" "}
                  {keywordRoles.map((r, i) => (
                    <span key={r.slug}>
                      <Link href={`${ROUTES.resumeKeywords}/${r.slug}`} className="site-link-mark font-medium text-[var(--site-ink)]">
                        {r.title.toLowerCase()}
                      </Link>
                      {i < keywordRoles.length - 2 ? ", " : i === keywordRoles.length - 2 ? " and " : ""}
                    </span>
                  ))}{" "}
                  resumes.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="tpl-faq" className="faq py-16 sm:py-24">
        <div className="site-wrap grid gap-10 lg:grid-cols-12">
          <h2 id="tpl-faq" className="site-h2 lg:col-span-4">
            About {t.engine.name}
          </h2>
          <div className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-8">
            {t.faqs.map((f) => (
              <details key={f.q} className="group border-b border-[var(--site-rule)]">
                <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-4 text-left">
                  <span className="faq-q text-lg font-semibold tracking-[-0.015em]">{f.q}</span>
                  <Plus className="faq-plus size-5 shrink-0 transition-transform duration-300" aria-hidden />
                </summary>
                <div>
                  <div>
                    <p className="site-body pb-6">{f.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <nav aria-labelledby="other-tpl" className="border-t border-[var(--site-rule-strong)] pb-28 pt-16 sm:pb-24 sm:pt-20">
        <div className="site-wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="other-tpl" className="site-h2">
              Other templates
            </h2>
            <Link href={ROUTES.resumeTemplates} className="site-link-mark font-medium">
              See all {templateEntries().length} with filters
            </Link>
          </div>
          <div className="sp-cells mt-8 grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <TemplateCard key={o.slug} t={o} idPrefix="other" />
            ))}
          </div>
        </div>
      </nav>

      {/* Phones: the action stays in the thumb zone. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--site-ink)] bg-[var(--site-paper)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <SiteButton href={useHref} size="lg" arrow className="w-full">
          Use {t.engine.name}
        </SiteButton>
      </div>
    </>
  )
}
