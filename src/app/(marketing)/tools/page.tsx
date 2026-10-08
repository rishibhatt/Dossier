import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { FinalCta } from "@/components/marketing/FinalCta"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Free resume and portfolio tools | Dossier",
  description:
    "Free tools for job seekers: a resume checker, a headline writer, a LinkedIn About builder and a link-in-bio page. They run in your browser and need no sign-up.",
  path: ROUTES.tools,
})

export default function ToolsPage() {
  return (
    <>
      <PageHead
        running={["Free tools", `${String(FREE_TOOLS.length).padStart(3, "0")} tools`]}
        title="Small tools for a better application."
        lead={<p>Each one does a single job, runs in your browser and asks for nothing. Use them on their own, or as the warm-up before you build your site.</p>}
      />
      <section aria-label="Tools" className="site-wrap pb-8">
        <ul className="border-t border-[var(--site-ink)]">
          {FREE_TOOLS.map((t) => (
            <li key={t.slug}>
              <Link
                href={`${ROUTES.tools}/${t.slug}`}
                className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-[var(--site-rule)] py-7 transition-colors hover:bg-[var(--site-sheet)] sm:grid-cols-[4rem_minmax(0,5fr)_minmax(0,5fr)_auto] sm:px-2"
              >
                <span className="sp-no text-sm text-[var(--site-ink-3)]">{t.no}</span>
                <span className="text-[clamp(1.375rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.025em]" style={{ fontFamily: "var(--site-display)" }}>
                  {t.name}
                </span>
                <span className="col-span-2 col-start-2 text-[0.9375rem] text-[var(--site-ink-2)] sm:col-span-1 sm:col-start-3">{t.output}</span>
                <ArrowUpRight
                  className="col-start-3 row-start-1 size-5 self-center transition-transform duration-300 [transition-timing-function:var(--site-ease)] group-hover:-translate-y-1 group-hover:translate-x-1 sm:col-start-4"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <FinalCta />
    </>
  )
}
