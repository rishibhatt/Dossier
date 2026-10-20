import type { Metadata } from "next"
import Link from "next/link"

import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { exampleEntries } from "@/content/resume/examples"
import { ExampleCard } from "@/features/resume/marketing/ExampleCard"
import { ROUTES } from "@/lib/constants/routes"
import type { SampleDomain } from "@/lib/resume/samples"

import "@/styles/resume-site.css"

export const metadata: Metadata = buildPageMetadata({
  title: "Resume examples by role, set in tested templates | Dossier",
  description:
    "Resume examples for accountants, nurses, engineers, teachers, designers and more. Each is a fictional sample set in a real template, with notes on layout and bullets. Start from any of them free.",
  path: ROUTES.resumeExamples,
})

const DOMAIN_ORDER: SampleDomain[] = [
  "Technology",
  "Engineering",
  "Finance",
  "Business and operations",
  "Marketing and sales",
  "Design and writing",
  "Healthcare",
  "Education and research",
  "Law and HR",
  "Hospitality",
]

export default function ResumeExamplesPage() {
  const all = exampleEntries()
  const groups = DOMAIN_ORDER.map((d) => ({ domain: d, items: all.filter((e) => e.person.domain === d) })).filter((g) => g.items.length)
  const slug = (d: string) => d.toLowerCase().replace(/[^a-z]+/g, "-")

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume builder", item: `${siteConfig.url}${ROUTES.resume}` },
        { "@type": "ListItem", position: 3, name: "Resume examples", item: `${siteConfig.url}${ROUTES.resumeExamples}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Dossier resume examples",
      itemListElement: all.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: `${e.title} resume example`, url: `${siteConfig.url}${ROUTES.resumeExamples}/${e.slug}` })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        running={["Resume examples", `${all.length} roles`]}
        title="Resume examples by role"
        lead={
          <p>
            Each one is a fictional person set in one of our templates, with notes on how the page is laid out and how the bullets are built. Start from any of them and
            replace every line with your own.
          </p>
        }
      />

      <div className="site-wrap pb-24">
        <nav aria-label="Fields" className="flex flex-wrap gap-2 border-t border-[var(--site-ink)] pt-4">
          {groups.map((g) => (
            <a key={g.domain} href={`#${slug(g.domain)}`} className="sp-chip">
              {g.domain}
              <span className="rs-chip-count">{g.items.length}</span>
            </a>
          ))}
        </nav>

        {groups.map((g) => (
          <section key={g.domain} id={slug(g.domain)} aria-labelledby={`h-${slug(g.domain)}`} className="mt-14 scroll-mt-24">
            <h2 id={`h-${slug(g.domain)}`} className="site-h3 border-b border-[var(--site-ink)] pb-2">
              {g.domain}
            </h2>
            <div className="sp-cells mt-6 grid-cols-2 lg:grid-cols-3 min-[1400px]:grid-cols-4">
              {g.items.map((e, i) => (
                <ExampleCard key={e.slug} e={e} priority={g === groups[0] && i < 2} />
              ))}
            </div>
          </section>
        ))}

        <div className="mt-16 grid gap-6 border-t border-[var(--site-rule-strong)] pt-8 sm:grid-cols-2">
          <p className="site-body">
            Every person, employer and figure on these pages is made up. The numbers in the bullets show the shape of a strong line; they are not results anyone achieved,
            and they are not a promise about yours.
          </p>
          <p className="site-body">
            Looking for a layout rather than a role? Browse the{" "}
            <Link href={ROUTES.resumeTemplates} className="site-link-mark font-medium text-[var(--site-ink)]">
              resume templates
            </Link>
            . For the words to use, see the{" "}
            <Link href={ROUTES.resumeKeywords} className="site-link-mark font-medium text-[var(--site-ink)]">
              resume keywords by role
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
