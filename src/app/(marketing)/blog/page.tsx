import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Byline } from "@/components/blog/Byline"
import { FinalCta } from "@/components/marketing/FinalCta"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { formatDate, POSTS, readingMinutes } from "@/content/blog/posts"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Resume, ATS and portfolio guides | Dossier blog",
  description: "Plain guides on getting past applicant tracking systems, writing stronger resume bullets and turning your resume into a portfolio website.",
  path: ROUTES.blog,
})

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => b.published.localeCompare(a.published))
  return (
    <>
      <PageHead
        running={["Blog", `${String(posts.length).padStart(3, "0")} guides`]}
        title="Guides for getting hired."
        lead={<p>Short, specific write-ups on resumes, applicant systems and portfolios. Each one ends with a free tool you can try on your own resume.</p>}
      />
      <section aria-label="Posts" className="site-wrap pb-12">
        <ul className="border-t border-[var(--site-ink)]">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`${ROUTES.blog}/${p.slug}`}
                className="group grid gap-3 border-b border-[var(--site-rule)] py-7 transition-colors hover:bg-[var(--site-sheet)] sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:px-2"
              >
                <span className="sp-data">
                  {p.category}
                  <span className="block normal-case">{formatDate(p.published)}</span>
                </span>
                <span>
                  <span className="block text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold leading-tight tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }}>
                    {p.title}
                  </span>
                  <span className="mt-2 block max-w-[46rem] text-[0.9375rem] text-[var(--site-ink-2)]">{p.description}</span>
                  <span className="sp-data mt-2 block">{readingMinutes(p)} min read</span>
                </span>
                <ArrowUpRight className="hidden size-5 self-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:block" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Byline className="mt-10" meta="Writes the guides and builds the tools" />
      </section>
      <FinalCta />
    </>
  )
}
