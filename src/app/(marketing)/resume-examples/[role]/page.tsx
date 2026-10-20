import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Plus } from "lucide-react"

import { SiteButton } from "@/components/marketing/primitives"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { getThumb } from "@/content/resume/evidence"
import { exampleEntries, getExample, rendersFor } from "@/content/resume/examples"
import { getAnyVerification } from "@/content/resume/examples/evidence"
import { FORMAT_FACETS, STAGE_FACETS, TEMPLATE_PAGES } from "@/content/resume/templates"
import { getRole } from "@/content/roles"
import { ExampleCard } from "@/features/resume/marketing/ExampleCard"
import { ExamplePreview, type ExampleRender } from "@/features/resume/marketing/ExamplePreview"
import { TestStamp } from "@/features/resume/marketing/TemplateCard"
import { ROUTES } from "@/lib/constants/routes"
import { PRESETS } from "@/lib/resume/presets"
import { getTemplate } from "@/lib/resume/templates"

import "@/styles/resume-site.css"

export const dynamicParams = false

export function generateStaticParams() {
  return exampleEntries().map((e) => ({ role: e.slug }))
}

type Props = { params: Promise<{ role: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params
  const e = getExample(role)
  if (!e) return {}
  const template = getTemplate(e.templateId)
  const templateSlug = TEMPLATE_PAGES.find((t) => t.templateId === e.templateId)?.slug
  return buildPageMetadata({
    title: `${e.title} resume example (${template.name} template) | Dossier`,
    description: `${e.answer} Fictional sample in ${template.name}, free to start from.`,
    path: `${ROUTES.resumeExamples}/${e.slug}`,
    ...(templateSlug ? { image: `/og/resume-templates/${templateSlug}` } : {}),
    openGraph: { title: `${e.title} resume example`, description: e.answer },
  })
}

export default async function ExamplePage({ params }: Props) {
  const { role } = await params
  const e = getExample(role)
  if (!e) notFound()

  const template = getTemplate(e.templateId)
  const templatePage = TEMPLATE_PAGES.find((t) => t.templateId === e.templateId)
  const v = getAnyVerification(e.templateId)
  const preset = PRESETS[e.person.preset]
  const stage = STAGE_FACETS.find((s) => s.id === e.person.stage)?.label ?? e.person.stage
  const format = FORMAT_FACETS.find((f) => f.id === e.person.preset)?.label ?? preset.label
  const keywordRole = e.keywordRole ? getRole(e.keywordRole) : undefined
  const url = `${siteConfig.url}${ROUTES.resumeExamples}/${e.slug}`
  const startHref = `${ROUTES.resumeNew}?template=${e.templateId}`
  const firstName = e.person.doc.basics.name.replace(/^Dr\. /, "").split(" ")[0]

  const renders: ExampleRender[] = rendersFor(e).map((t) => ({
    templateId: t.id,
    name: t.name,
    renders: { a4: getThumb(t.id, e.sample, "a4"), "us-letter": getThumb(t.id, e.sample, "us-letter") },
  }))
  const lead = getThumb(e.templateId, e.sample, "a4")

  // Same field first, then everyone else, so the strip stays relevant without repeating this page.
  const all = exampleEntries().filter((x) => x.slug !== e.slug)
  const others = [...all.filter((x) => x.person.domain === e.person.domain), ...all.filter((x) => x.person.domain !== e.person.domain)].slice(0, 6)

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume examples", item: `${siteConfig.url}${ROUTES.resumeExamples}` },
        { "@type": "ListItem", position: 3, name: `${e.title} resume example`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: e.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
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
              <Link href={ROUTES.resumeExamples} className="hover:text-[var(--site-ink)] hover:underline">
                Examples
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="truncate">
              {e.title}
            </li>
          </ol>
          <span className="sp-no shrink-0">Fictional sample</span>
        </nav>
      </div>

      <div className="site-wrap grid gap-10 pb-16 pt-8 sm:pt-10 lg:grid-cols-12 lg:gap-0">
        <div className="order-2 min-w-0 lg:order-1 lg:col-span-7 lg:border-r lg:border-[var(--site-rule-strong)] lg:pr-10">
          <ExamplePreview sampleLabel={e.person.label} role={e.title} templates={renders} initialPaper={preset.paper} />
        </div>

        <aside className="order-1 min-w-0 lg:order-2 lg:col-span-5 lg:pl-10" aria-labelledby="ex-title">
          <div className="lg:sticky lg:top-24">
            <h1 id="ex-title" className="site-h1 lg:text-[clamp(2.25rem,3.6vw,3.5rem)]">
              {e.title} resume example
            </h1>
            <p className="sp-data mt-3">
              {stage} · {format} format · {template.name} template
            </p>
            <p className="site-lead mt-5">{e.answer}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {/* Phones get the same action in the fixed bar below, so it is not shown twice on one screen. */}
              <SiteButton href={startHref} size="lg" arrow className="max-lg:hidden">
                Start from this sample
              </SiteButton>
              {templatePage ? (
                <SiteButton href={`${ROUTES.resumeTemplates}/${templatePage.slug}`} variant="secondary" size="lg">
                  About the {template.name} template
                </SiteButton>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-[var(--site-ink-2)]">
              Opens the builder in {template.name}. Pick {e.person.label.replace(" (sample)", "")} under “Start from a sample”, then replace each line with your own. No account
              until you download the PDF, which is free.
            </p>

            {v ? <TestStamp v={v} id="example" className="mt-6" /> : null}

            <table className="rs-table mt-8 border-t border-[var(--site-ink)]">
              <caption className="sr-only">About this sample</caption>
              <tbody>
                <tr>
                  <th scope="row">Person</th>
                  <td>{e.person.doc.basics.name}, a fictional sample. Employers and figures are made up.</td>
                </tr>
                <tr>
                  <th scope="row">Headline</th>
                  <td>{e.person.doc.basics.headline}</td>
                </tr>
                <tr>
                  <th scope="row">Country format</th>
                  <td>
                    {preset.label}, {preset.docName === "CV" ? "called a CV" : "called a resume"}, {preset.paper === "a4" ? "A4" : "US Letter"}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Length</th>
                  <td className="rs-num">
                    {lead?.pages.length ?? 1} {lead?.pages.length === 1 ? "page" : "pages"} in {template.name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>
      </div>

      <section aria-labelledby="guide" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-16 sm:py-24">
        <div className="site-wrap grid gap-10 lg:grid-cols-12">
          <h2 id="guide" className="site-h2 lg:col-span-4">
            How {firstName}’s resume is built
          </h2>
          <div className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-8">
            {e.guidance.map((g) => (
              <div key={g.heading} className="grid gap-2 border-b border-[var(--site-rule)] py-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
                <h3 className="site-h3 !text-[1.125rem]">{g.heading}</h3>
                <p className="site-body">{g.body}</p>
              </div>
            ))}
            {keywordRole ? (
              <div className="grid gap-2 py-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
                <h3 className="site-h3 !text-[1.125rem]">Words to use</h3>
                <p className="site-body">
                  This page is about layout and bullets. For the skills, tools and verbs that recur in job posts, see the{" "}
                  <Link href={`${ROUTES.resumeKeywords}/${keywordRole.slug}`} className="site-link-mark font-medium text-[var(--site-ink)]">
                    {keywordRole.title.toLowerCase()} resume keywords
                  </Link>
                  .
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="ex-faq" className="faq py-16 sm:py-24">
        <div className="site-wrap grid gap-10 lg:grid-cols-12">
          <h2 id="ex-faq" className="site-h2 lg:col-span-4">
            {e.title} resume questions
          </h2>
          <div className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-8">
            {e.faqs.map((f) => (
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

      <nav aria-labelledby="other-ex" className="border-t border-[var(--site-rule-strong)] pb-28 pt-16 sm:pb-24 sm:pt-20">
        <div className="site-wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="other-ex" className="site-h2">
              More resume examples
            </h2>
            <Link href={ROUTES.resumeExamples} className="site-link-mark font-medium">
              See all {exampleEntries().length}
            </Link>
          </div>
          <div className="sp-cells mt-8 grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <ExampleCard key={o.slug} e={o} />
            ))}
          </div>
        </div>
      </nav>

      {/* Phones: the action stays in the thumb zone. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--site-ink)] bg-[var(--site-paper)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <SiteButton href={startHref} size="lg" arrow className="w-full">
          Start from this sample
        </SiteButton>
      </div>
    </>
  )
}
