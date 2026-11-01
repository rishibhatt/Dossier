import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { PageHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { ROUTES } from "@/lib/constants/routes"
import { listGallerySites, type GallerySite } from "@/lib/portfolio/gallery"

import "@/styles/resume-site.css"

// Approvals revalidate this path at once (admin action); the hour is a backstop.
export const revalidate = 3600

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio website examples made from real resumes | Dossier",
  description:
    "Real portfolio sites that people built from their resume with Dossier and chose to share. Open any of them, then turn your own resume into a site, free for one site.",
  path: ROUTES.portfolioExamples,
})

const no = (i: number) => `No. ${String(i + 1).padStart(3, "0")}`

/** One real site as a ruled cell: its share card on a plate, the person's name, their role and the folio. */
function SiteCell({ site, index, priority }: { site: GallerySite; index: number; priority: boolean }) {
  return (
    <article className="rs-card min-w-0 border-b border-r border-[var(--site-rule)] bg-[var(--site-paper)]">
      <a href={`/p/${site.slug}`} target="_blank" rel="noopener" className="rs-card-link">
        <span className="rs-page aspect-[1200/630]">
          {/* eslint-disable-next-line @next/next/no-img-element -- generated share card, fixed 1200x630 */}
          <img
            src={`/og/site/${encodeURIComponent(site.slug)}`}
            width={1200}
            height={630}
            alt={`Share card of ${site.name}'s portfolio`}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="rs-card-name [overflow-wrap:anywhere]">{site.name}</span>
            {site.role ? <span className="text-sm text-[var(--site-ink-2)]">{site.role}</span> : null}
          </span>
          <span className="sp-data flex shrink-0 items-center gap-1 pt-1">
            {no(index)}
            <ArrowUpRight className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </span>
        </span>
      </a>
    </article>
  )
}

/** Before the first approval: say plainly that the page is empty and how a site gets onto it. */
function Empty() {
  return (
    <div className="grid gap-8 border-t border-[var(--site-ink)] pt-12 lg:grid-cols-12">
      <h2 className="site-h2 lg:col-span-6">No sites here yet</h2>
      <div className="grid gap-5 lg:col-span-6">
        <p className="site-body">
          This page shows real portfolios, and only ones whose owners asked to be here. We look at each one before it goes up, so it starts empty and fills as people
          publish.
        </p>
        <p className="site-body">
          Yours could be the first. Publish your site, tick <span className="font-semibold text-[var(--site-ink)]">Feature my site in Dossier&rsquo;s examples</span>,
          and it appears here once we have checked it.
        </p>
        <p className="site-body">
          Until then, the{" "}
          <Link href={ROUTES.looks} className="site-link-mark font-medium text-[var(--site-ink)]">
            looks
          </Link>{" "}
          page shows every design on a sample resume.
        </p>
      </div>
    </div>
  )
}

export default async function PortfolioExamplesPage() {
  const sites = await listGallerySites()

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Portfolio examples", item: `${siteConfig.url}${ROUTES.portfolioExamples}` },
      ],
    },
    ...(sites.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Portfolio sites made with Dossier",
            itemListElement: sites.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.role ? `${s.name}, ${s.role}` : s.name, url: `${siteConfig.url}/p/${s.slug}` })),
          },
        ]
      : []),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        running={["Portfolio examples", sites.length ? `${sites.length} ${sites.length === 1 ? "site" : "sites"}` : "Opening"]}
        title="Portfolio sites people made from their resume"
        lead={
          <p>
            Every site here belongs to a real person who built it with Dossier and asked to be shown. Open one, see how it reads, then make yours from the resume you
            already have.
          </p>
        }
      />

      <div className="site-wrap pb-24">
        {sites.length ? (
          <div className="grid grid-cols-1 border-l border-t border-[var(--site-rule)] sm:grid-cols-2 lg:grid-cols-3">
            {/* Ruled cells drawn per cell (not the hairline-gap grid), so a short last row leaves paper, not a grey hole. */}
            {sites.map((s, i) => (
              <SiteCell key={s.slug} site={s} index={i} priority={i < 3} />
            ))}
          </div>
        ) : (
          <Empty />
        )}

        <section aria-labelledby="yours-h" className="mt-16 grid gap-6 border-t border-[var(--site-ink)] pt-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="yours-h" className="site-h2">
              Make yours from your resume
            </h2>
            <p className="site-lead mt-4 max-w-[38rem]">Upload the PDF you already have. You get a site you can change line by line, and one site is free.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
            <SiteButton href={ROUTES.build} size="lg" arrow>
              Upload my resume
            </SiteButton>
          </div>
        </section>

        <p className="site-body mt-10 max-w-[65ch] border-t border-[var(--site-rule-strong)] pt-6">
          Featured your site and want it taken down? Untick the box in your site&rsquo;s Share panel and it leaves this page straight away, or{" "}
          <Link href="/contact" className="site-link-mark font-medium text-[var(--site-ink)]">
            write to us
          </Link>
          .
        </p>
      </div>
    </>
  )
}
