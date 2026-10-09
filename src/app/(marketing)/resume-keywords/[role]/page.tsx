import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { getRole, ROLES } from "@/content/roles"
import { ROUTES } from "@/lib/constants/routes"

export const dynamicParams = false

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.slug }))
}

type Props = { params: Promise<{ role: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params
  const r = getRole(role)
  if (!r) return {}
  return buildPageMetadata({
    title: `${r.title} resume keywords and examples`,
    description: `Skills, tools and action verbs for a ${r.title.toLowerCase()} resume, ${r.bullets.length} example bullets and ${r.mistakes.length} common mistakes. Check your resume against a real job post for free.`,
    path: `${ROUTES.resumeKeywords}/${r.slug}`,
  })
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((k) => (
        <li key={k} className="border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] px-2.5 py-1 text-sm">
          {k}
        </li>
      ))}
    </ul>
  )
}

export default async function RolePage({ params }: Props) {
  const { role } = await params
  const r = getRole(role)
  if (!r) notFound()

  const url = `${siteConfig.url}${ROUTES.resumeKeywords}/${r.slug}`
  const related = r.related.map((s) => getRole(s)).filter((x): x is NonNullable<typeof x> => Boolean(x))
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume keywords", item: `${siteConfig.url}${ROUTES.resumeKeywords}` },
        { "@type": "ListItem", position: 3, name: r.title, item: url },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        running={["Resume keywords", r.title]}
        title={`${r.title} resume keywords`}
        lead={<p>{r.angle}</p>}
      />

      <div className="site-wrap grid gap-14 pb-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <section aria-labelledby="skills">
            <h2 id="skills" className="site-h3">
              Skills to show
            </h2>
            <p className="site-body mt-2">Use the exact phrase where it is true, inside a bullet and not only in a list.</p>
            <Chips items={r.skills} />
          </section>

          <section aria-labelledby="tools" className="mt-12">
            <h2 id="tools" className="site-h3">
              Tools and software
            </h2>
            <Chips items={r.tools} />
          </section>

          <section aria-labelledby="verbs" className="mt-12">
            <h2 id="verbs" className="site-h3">
              Verbs that fit {r.title.toLowerCase()} work
            </h2>
            <Chips items={r.verbs} />
          </section>

          <section aria-labelledby="bullets" className="mt-12">
            <h2 id="bullets" className="site-h3">
              Example bullets
            </h2>
            <p className="site-body mt-2">The numbers are examples. Replace them with your own and round honestly.</p>
            <ul className="mt-4 border-t border-[var(--site-rule)]">
              {r.bullets.map((b) => (
                <li key={b} className="border-b border-[var(--site-rule)] py-4 text-[1.0625rem] leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="mistakes" className="mt-12">
            <h2 id="mistakes" className="site-h3">
              Mistakes to avoid
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-[var(--site-ink-2)] marker:text-[var(--site-accent)]">
              {r.mistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-4" aria-label="Check your resume">
          <div className="border border-[var(--site-ink)] bg-[var(--site-sheet)] p-5 lg:sticky lg:top-24">
            <p className="sp-data">Free tool</p>
            <p className="site-h3 mt-1">Match a real job post</p>
            <p className="mt-2 text-[0.9375rem] text-[var(--site-ink-2)]">
              This list is a start. Paste your resume and the {r.title.toLowerCase()} job you want, and the scanner shows which of that post&apos;s keywords you are missing.
            </p>
            <Link href={`${ROUTES.tools}/ats-checker`} className="site-btn site-btn-primary mt-5 w-full">
              <span className="site-btn-label">Scan my resume</span>
            </Link>
            <Link href={ROUTES.build} className="mt-3 block text-sm underline underline-offset-4">
              Or turn it into a portfolio site
            </Link>
          </div>
        </aside>
      </div>

      <nav aria-label="Related roles" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-14">
        <div className="site-wrap">
          <p className="site-h3">Related roles</p>
          <ul className="mt-6 grid gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] sm:grid-cols-3">
            {related.map((x) => (
              <li key={x.slug} className="bg-[var(--site-paper)]">
                <Link href={`${ROUTES.resumeKeywords}/${x.slug}`} className="flex h-full min-h-24 items-end p-4 font-semibold hover:bg-[var(--site-sheet)]">
                  {x.title} resume keywords
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link href={ROUTES.blog} className="underline underline-offset-4">
              Read the guides
            </Link>
          </p>
        </div>
      </nav>
    </>
  )
}
