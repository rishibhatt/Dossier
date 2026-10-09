import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHead } from "@/components/marketing/PageHead"
import { UploadSlot } from "@/components/marketing/UploadSlot"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { AboutBuilder } from "@/features/tools/AboutBuilder"
import { AtsChecker } from "@/features/tools/AtsChecker"
import { FREE_TOOLS, getFreeTool, type FreeToolSlug } from "@/features/tools/catalog"
import { HeadlineWriter } from "@/features/tools/HeadlineWriter"
import { LinkInBio } from "@/features/tools/LinkInBio"
import { ROUTES } from "@/lib/constants/routes"

export const dynamicParams = false

export function generateStaticParams() {
  return FREE_TOOLS.map((t) => ({ slug: t.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tool = getFreeTool(slug)
  if (!tool) return {}
  return buildPageMetadata({
    title: tool.title,
    description: tool.description,
    path: `${ROUTES.tools}/${tool.slug}`,
    image: `/og/tools/${tool.slug}`,
  })
}

const HOW: Record<FreeToolSlug, string[]> = {
  "ats-checker": [
    "The scan splits your resume into sections the way a parser does, then checks the job post's keywords against it. Aliases count, so \"JS\" matches \"JavaScript\" and \"k8s\" matches \"Kubernetes\".",
    "Keywords in the requirements part of the post weigh more than nice-to-haves. A keyword used in a bullet under a role counts in full. A keyword that only sits in a skills list counts 70%.",
    "It also looks for what breaks parsing: columns, tables, symbols, mixed date formats and contact details outside the header. Treat the score as a guide to what to fix. No tool can promise how a given employer's system will rank you.",
  ],
  "headline-writer": [
    "A headline answers three questions quickly: what you do, what you are good at, and why someone should believe it.",
    "The six shapes cover the common cases. Pick the one that sounds most like you, then change words until it does.",
    "Keep it specific. \"Product designer for travel checkouts\" is easier to remember than \"Creative problem solver\".",
  ],
  "linkedin-about": [
    "Short works under a profile photo or in an email signature. Standard fits most LinkedIn profiles. Story leads with where you are going, which helps career switchers.",
    "Use your own words in the answers. The builder only orders and joins them, so the result still sounds like you.",
    "LinkedIn shows about three lines before \"see more\". Your first sentence carries the section.",
  ],
  "link-in-bio": [
    "Most bios allow one link. This page gives that link a name, a role and up to five places to go.",
    "Put the link you most want opened first. People rarely scroll a link page.",
    "On Dossier, your portfolio site can be that page, with your work one tap further.",
  ],
  "resume-to-website": [
    "Upload a PDF up to 10 MB. Dossier reads it into sections and suggests a look from your profession.",
    "Building needs a free account, with no card. Your PDF waits in this browser while you sign up, then the builder opens.",
    "Free includes one published portfolio with a small Dossier badge.",
  ],
}

function ToolBody({ slug }: { slug: FreeToolSlug }) {
  switch (slug) {
    case "ats-checker":
      return <AtsChecker />
    case "headline-writer":
      return <HeadlineWriter />
    case "linkedin-about":
      return <AboutBuilder />
    case "link-in-bio":
      return <LinkInBio />
    case "resume-to-website":
      return (
        <div className="grid gap-10 lg:grid-cols-12">
          <UploadSlot className="lg:col-span-6" label="Upload my resume" />
          <p className="text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)] lg:col-span-6">
            Your file goes to the builder in this tab. It is only sent to be read when you press the button to generate your site.
          </p>
        </div>
      )
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = getFreeTool(slug)
  if (!tool) notFound()

  const others = FREE_TOOLS.filter((t) => t.slug !== tool.slug)
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${tool.name} by Dossier`,
    url: `${siteConfig.url}${ROUTES.tools}/${tool.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead running={[`Free tools / ${tool.name}`, `No. ${tool.no}`]} title={tool.h1} lead={<p>{tool.intro}</p>} />
      <section aria-label={tool.name} className="site-wrap pb-20">
        <ToolBody slug={tool.slug} />
      </section>

      <section aria-labelledby="how-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-16 sm:py-20">
        <div className="site-wrap grid gap-8 lg:grid-cols-12">
          <h2 id="how-title" className="site-h3 lg:col-span-4">
            How this works
          </h2>
          <ul className="grid gap-5 lg:col-span-8">
            {HOW[tool.slug].map((p) => (
              <li key={p} className="site-body border-t border-[var(--site-rule)] pt-5">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Other tools" className="site-wrap py-16">
        <p className="site-h3">More free tools</p>
        <ul className="mt-6 grid grid-cols-1 gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {others.map((t) => (
            <li key={t.slug} className="bg-[var(--site-paper)]">
              <Link href={`${ROUTES.tools}/${t.slug}`} className="flex h-full min-h-24 flex-col justify-between gap-2 p-4 hover:bg-[var(--site-sheet)]">
                <span className="sp-no text-xs text-[var(--site-ink-3)]">No. {t.no}</span>
                <span className="font-semibold">{t.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
