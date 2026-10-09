import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { FinalCta } from "@/components/marketing/FinalCta"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { ROLES } from "@/content/roles"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Resume keywords by job role, with examples | Dossier",
  description: "Skills, tools and action verbs for common job roles, with example bullets and mistakes to avoid. Then check your resume against a real job post.",
  path: ROUTES.resumeKeywords,
})

export default function ResumeKeywordsIndex() {
  return (
    <>
      <PageHead
        running={["Resume keywords", `${String(ROLES.length).padStart(3, "0")} roles`]}
        title="Resume keywords for your role."
        lead={<p>For each role: the skills and tools that recur in job posts, verbs that fit, example bullets and common mistakes. Use them as a starting list, then match the post you are applying to.</p>}
      />
      <section aria-label="Roles" className="site-wrap pb-12">
        <ul className="grid gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r, i) => (
            <li key={r.slug} className="bg-[var(--site-paper)]">
              <Link href={`${ROUTES.resumeKeywords}/${r.slug}`} className="group flex h-full min-h-32 flex-col justify-between gap-4 p-5 hover:bg-[var(--site-sheet)]">
                <span className="sp-no text-xs text-[var(--site-ink-3)]">No. {String(i + 1).padStart(3, "0")}</span>
                <span className="flex items-end justify-between gap-3">
                  <span className="text-lg font-semibold leading-tight">{r.title} resume keywords</span>
                  <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <FinalCta />
    </>
  )
}
