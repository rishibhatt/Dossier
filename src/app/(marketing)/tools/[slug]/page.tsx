import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHead } from "@/components/marketing/PageHead"
import { UploadSlot } from "@/components/marketing/UploadSlot"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { AboutBuilder } from "@/features/tools/AboutBuilder"
import { AtsChecker } from "@/features/tools/AtsChecker"
import { BulletGenerator } from "@/features/tools/BulletGenerator"
import { FREE_TOOLS, getFreeTool, type FreeToolSlug } from "@/features/tools/catalog"
import { HeadlineWriter } from "@/features/tools/HeadlineWriter"
import { LinkInBio } from "@/features/tools/LinkInBio"
import { SummaryGenerator } from "@/features/tools/SummaryGenerator"
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
  "resume-summary-generator": [
    "Each summary follows the order a recruiter reads in: who you are, one result, then the skills the job asks for. The shapes change the order, so you can pick the one that leads with your strongest point.",
    "The career stage changes the wording. Students lead with what they study and a project, career changers name the field they come from, and senior people lead with scope.",
    "Type a common job title and the tool offers skills and tools from our keyword lists for that role. Only add the ones you can talk about in an interview.",
    "The drafts are written in your browser from your own words. Polish with AI sends one draft to a language model for a smoother rewrite. It keeps your facts, and any rewrite with a number you did not type is thrown away.",
  ],
  "resume-bullet-point-generator": [
    "Weak openers such as \"responsible for\", \"helped with\" and \"worked on\" are removed, and a leading -ing verb becomes past tense, so every bullet starts with what you did.",
    "The same facts are then arranged four ways: action then result, result first (the XYZ formula), a short version under one line, and a version that names the tool first for keyword searches.",
    "No number? The tool says so. Recruiters skim, and a number is what stops the skim. An honest estimate is fine.",
    "Everything runs in your browser. Polish with AI is optional, capped per day, and rejects any rewrite that adds a number you did not give it.",
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
    case "resume-summary-generator":
      return <SummaryGenerator />
    case "resume-bullet-point-generator":
      return <BulletGenerator />
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

  const faqLd = tool.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tool.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} /> : null}
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

      {tool.examples?.length ? (
        <section aria-labelledby="examples-title" className="site-wrap py-16 sm:py-20">
          <h2 id="examples-title" className="site-h3">
            Before and after
          </h2>
          <ol className="mt-6 grid gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] lg:grid-cols-3">
            {tool.examples.map((x, k) => (
              <li key={x.label} className="flex flex-col gap-4 bg-[var(--site-paper)] p-5 sm:p-6">
                <p className="sp-data">
                  <span className="sp-no">{String(k + 1).padStart(2, "0")}</span> {x.label}
                </p>
                <div>
                  <p className="sp-data text-[var(--site-ink-3)]">Before</p>
                  <p className="mt-1 text-[0.9375rem] text-[var(--site-ink-2)] line-through decoration-[var(--site-rule-strong)]">{x.before}</p>
                </div>
                <div className="border-t border-[var(--site-rule)] pt-4">
                  <p className="sp-data text-[var(--site-accent-ink)]">After</p>
                  <p className="mt-1 font-medium leading-relaxed">{x.after}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {tool.faq?.length ? (
        <section aria-labelledby="faq-title" className="border-t border-[var(--site-rule-strong)] py-16 sm:py-20">
          <div className="site-wrap grid gap-8 lg:grid-cols-12">
            <h2 id="faq-title" className="site-h3 lg:col-span-4">
              Questions
            </h2>
            <dl className="grid gap-5 lg:col-span-8">
              {tool.faq.map((f) => (
                <div key={f.q} className="border-t border-[var(--site-rule)] pt-5">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="site-body mt-2 text-[var(--site-ink-2)]">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <nav aria-label="Other tools" className="site-wrap py-16">
        <p className="site-h3">More free tools</p>
        <ul className="mt-6 grid grid-cols-1 gap-px border border-[var(--site-rule)] bg-[var(--site-rule)] sm:grid-cols-2 lg:grid-cols-3">
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
