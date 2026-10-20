import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Plus } from "lucide-react"

import { RunningHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { getThumb, getVerification, PARSE_SAMPLE } from "@/content/resume/evidence"
import { getTemplatePage, templateEntries } from "@/content/resume/templates"
import { HeroPlate, type HeroSlide } from "@/features/resume/marketing/HeroPlate"
import { sampleOf } from "@/features/resume/marketing/TemplateCard"
import { ROUTES } from "@/lib/constants/routes"
import { PRESET_IDS } from "@/lib/resume/schema"

import "@/styles/resume-site.css"

export const metadata: Metadata = buildPageMetadata({
  title: "Free resume builder with a free PDF download | Dossier Resume",
  description:
    "Build your resume in the browser and download the PDF free, with no watermark. Templates are tested by reading their PDFs back with a parser, and the dated results are published.",
  path: ROUTES.resume,
  openGraph: {
    title: "Build your resume and download the PDF free.",
    description: "Tested templates, a preview that updates as you type, and a PDF that matches it.",
  },
})

const HERO_SAMPLE = "meera"
const HERO_TEMPLATES = ["ledger", "column", "modern"]
/** The chooser: a situation in the reader's words, and the template made for it. */
const SITUATIONS: [string, string][] = [
  ["Not sure. I want the safest choice for any job", "ledger"],
  ["Student or fresher, first proper resume", "fresher"],
  ["Software engineer, everything on one page", "plain"],
  ["A long list of skills, tools or certifications", "column"],
  ["Product, marketing or business role", "modern"],
  ["Fifteen years of history, and they want one page", "compact"],
  ["Director or VP, applying through a search firm", "executive"],
  ["Changing careers or coming back after a gap", "switcher"],
  ["Academic, research or medical post", "scholar"],
  ["Applying in the EU or Germany", "europa"],
  ["Applying in the UAE, Saudi Arabia or Qatar", "gulf"],
  ["Designer or writer who wants the type to show", "specimen"],
]

const FAQ = [
  {
    q: "Is the PDF download really free?",
    a: "Yes. Create a free account and the full PDF downloads, with no watermark, from every template. A free account keeps 2 resumes; Starter and Pro keep up to 200.",
  },
  {
    q: "Do I need an account to start?",
    a: "No. Your draft is saved in this browser while you work. You sign in when you download, and the draft moves to your account then, so nothing you typed is lost.",
  },
  {
    q: "Will my resume get past an ATS?",
    a: "No builder can promise that, because each employer's system is different. What we can show: every template is set as a PDF with real, selectable text, and our tests read each PDF back with a parser to check every field comes out in order. The results and their dates are on each template's page. We have not yet run them through commercial ATS products.",
  },
  {
    q: "Can I bring in my old resume?",
    a: "Yes, as a PDF up to 10 MB. It is read on your device and never uploaded. We fill in the form from its text; check it and fix anything we missed. Scanned images have no text to read.",
  },
  {
    q: "Which countries does it handle?",
    a: "Seven formats: US and Canada, UK and Ireland, Europe, Germany, India, the Gulf, and Australia and New Zealand. Each sets the paper size, date style, whether it is called a CV or a resume, and which personal details appear. English only for now.",
  },
  {
    q: "Does AI write my resume?",
    a: "No. You write it, or import it. The ATS check compares the text of your own PDF with a job post you paste, in your browser, and lists the missing keywords. AI-assisted tailoring is planned and will be labelled when it arrives.",
  },
]

export default function ResumeLandingPage() {
  const entries = templateEntries()
  const sample = sampleOf(HERO_SAMPLE)
  const slides: HeroSlide[] = HERO_TEMPLATES.map((slug) => getTemplatePage(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .flatMap((t) => {
      const th = getThumb(t.templateId, HERO_SAMPLE, "a4")
      return th
        ? [{ no: t.engine.no, name: t.engine.name, layout: t.engine.layout, src: th.src, srcLarge: th.srcLarge, ratio: th.ratio, alt: `${t.engine.name} resume template, sample for a fictional ${sample.role.toLowerCase()}` }]
        : []
    })
  const tested = entries.map((t) => getVerification(t.templateId)).filter((v): v is NonNullable<typeof v> => Boolean(v))
  const runs = tested.reduce((n, v) => n + v.runs, 0)
  const passed = tested.reduce((n, v) => n + v.passed, 0)
  const lastTested = tested.map((v) => v.testedLabel)[0]
  const parseThumb = getThumb(PARSE_SAMPLE.template, HERO_SAMPLE, "a4")
  const parseFound = PARSE_SAMPLE.fields.filter((f) => f.found).length

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Dossier Resume",
      url: `${siteConfig.url}${ROUTES.resume}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "A resume builder that runs in the browser. Pick a tested template, see the PDF as you type, download it free.",
      offers: { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "PDF download included, no watermark" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Resume builder", item: `${siteConfig.url}${ROUTES.resume}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* Hero */}
      <section aria-labelledby="hero-title">
        <div className="site-wrap pt-6 sm:pt-10">
          <div className="sp-data flex items-center justify-between gap-4 border-b border-[var(--site-ink)] pb-2">
            <span>Dossier Resume</span>
            <span className="hidden sm:inline">{entries.length} tested templates · 7 country formats</span>
            <span className="sp-no">No. 002</span>
          </div>

          <div className="sp-columns grid grid-cols-1 lg:grid-cols-12">
            <div className="min-w-0 border-[var(--site-rule-strong)] pt-6 lg:col-span-7 lg:border-r lg:py-12 lg:pr-10">
              <HeroPlate slides={slides} sampleLabel={sample.label} />
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-6 pb-12 pt-8 lg:col-span-5 lg:py-14 lg:pl-10 lg:[&>*]:bg-[var(--site-paper)]">
              <h1 id="hero-title" className="site-h1 max-w-[15ch] lg:text-[clamp(3rem,4.4vw,4.25rem)]">
                Build your resume and download the PDF free
              </h1>
              <p className="site-lead">
                Pick a template we test by reading its PDF back with a parser. The preview updates as you type, and the PDF you download matches it
                exactly.
              </p>

              <div className="border border-dashed border-[var(--site-ink)] bg-[var(--site-sheet)] p-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <SiteButton href={ROUTES.resumeTemplates} size="lg" arrow className="flex-1">
                    Pick a template
                  </SiteButton>
                  <SiteButton href={ROUTES.resumeNew} variant="secondary" size="lg" className="flex-1">
                    Import my old resume
                  </SiteButton>
                </div>
                <p className="sp-data flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 pb-0.5 pt-2.5">
                  <span>Start without an account</span>
                  <span>Sign in when you download</span>
                </p>
              </div>

              <p className="text-sm text-[var(--site-ink-2)]">
                Your old resume is read on your device, never uploaded.{" "}
                <Link href={ROUTES.resumeNew} className="site-link-mark font-medium text-[var(--site-ink)]">
                  Or start from a sample
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pick by situation */}
      <section aria-labelledby="tpl-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Templates" no="003" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="tpl-title" className="site-h2 lg:col-span-7">
              Start from where you are, not from a gallery.
            </h2>
            <p className="site-lead self-end lg:col-span-5">
              {entries.length} templates, each tested before it ships: {passed.toLocaleString("en-US")} of {runs.toLocaleString("en-US")} test
              PDFs read back in full{lastTested ? ` on ${lastTested}` : ""}. Pick the line that sounds like you.
            </p>
          </div>

          <ul className="mt-12 border-t border-[var(--site-ink)]">
            {SITUATIONS.map(([situation, slug]) => {
              const t = entries.find((x) => x.slug === slug)
              if (!t) return null
              return (
                <li key={slug} className="border-b border-[var(--site-rule)]">
                  <Link
                    href={`${ROUTES.resumeTemplates}/${t.slug}`}
                    className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,1fr)_14rem_auto]"
                  >
                    <span className="text-[1.0625rem] font-semibold leading-snug group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                      {situation}
                    </span>
                    <span className="sp-data col-start-1 row-start-2 sm:col-start-2 sm:row-start-1">
                      {t.engine.no} {t.engine.name} · {t.engine.layout.toLowerCase()}
                    </span>
                    <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 sm:col-start-3" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="mt-6">
            <Link href={ROUTES.resumeTemplates} className="site-link-mark font-medium">
              Compare all {entries.length}, with filters for role, country and career stage
            </Link>
          </p>
        </div>
      </section>

      {/* What a parser reads */}
      <section aria-labelledby="parse-title" className="py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Parse-back" no="004" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="parse-title" className="site-h2 lg:col-span-7">
              What a parser reads from your PDF
            </h2>
            <p className="site-lead self-end lg:col-span-5">
              An applicant tracking system reads the text in your PDF, not the picture of it. This is what pdf.js pulled out of one sample, field by
              field.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            {parseThumb ? (
              <figure className="hidden min-w-0 lg:col-span-4 lg:block">
                <div className="rs-page" style={{ aspectRatio: `1 / ${parseThumb.ratio}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static pre-rendered WebP with explicit sizes */}
                  <img src={parseThumb.src} width={600} height={Math.round(600 * parseThumb.ratio)} alt={`Ledger resume template, sample for a fictional ${sample.role.toLowerCase()}`} loading="lazy" />
                </div>
                <figcaption className="sp-data mt-3">The PDF that was read. Sample: {PARSE_SAMPLE.sample}. Not a real person.</figcaption>
              </figure>
            ) : null}
            <div className="min-w-0 overflow-x-auto lg:col-span-8">
              <table className="rs-table">
                <caption className="sp-data pb-3 text-left">
                  R-001 Ledger · A4 · read {PARSE_SAMPLE.testedAt} with {PARSE_SAMPLE.extractor} · {parseFound}/{PARSE_SAMPLE.fields.length} fields found
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Text read from the PDF</th>
                    <th scope="col" className="text-right">
                      Found
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PARSE_SAMPLE.fields.map((f) => (
                    <tr key={f.field + f.value}>
                      <th scope="row" className="whitespace-nowrap">
                        {f.field}
                      </th>
                      <td className="rs-num !whitespace-normal">{f.value}</td>
                      <td className="!pr-0 text-right">
                        {f.found ? (
                          <span className="rs-ok inline-flex items-center gap-1 text-sm">
                            <Check className="size-3.5" aria-hidden />
                            <span className="max-sm:sr-only">Yes</span>
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--site-danger)]">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">PDF title</th>
                    <td className="rs-num !whitespace-normal">{PARSE_SAMPLE.pdfTitle}</td>
                    <td className="!pr-0 text-right">
                      <span className="rs-ok inline-flex items-center gap-1 text-sm">
                        <Check className="size-3.5" aria-hidden />
                        <span className="max-sm:sr-only">Set</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="site-body mt-6">
                In the editor, the Check tab runs the same kind of read on your own resume and compares it with a job post you paste. It all runs in
                your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The editor */}
      <section aria-labelledby="editor-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="The editor" no="005" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="editor-title" className="site-h2 lg:col-span-7">
              Type on the left. The page sets on the right.
            </h2>
            <p className="site-lead self-end lg:col-span-5">
              Form fields for every section, a checklist to a finished PDF, and the page itself beside them. Your words stay put when you
              switch template.
            </p>
          </div>

          <figure className="mt-12">
            <div className="rs-page !bg-[var(--site-paper)]" style={{ aspectRatio: "16 / 10" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static screenshot with explicit sizes */}
              <img
                src="/resume-landing/editor-1440.webp"
                srcSet="/resume-landing/editor-1440.webp 1440w, /resume-landing/editor-2880.webp 2880w"
                sizes="(min-width: 1248px) 1184px, 100vw"
                width={1440}
                height={900}
                alt="The Dossier resume editor: form fields for Meera Iyer on the left, her resume set in the Ledger template on the right"
                loading="lazy"
              />
            </div>
            <figcaption className="sp-data mt-3">Screenshot of the editor at 1440 px. Sample: Meera Iyer (sample). Not a real person.</figcaption>
          </figure>

          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <h3 className="site-h3 lg:col-span-5">What you get in the editor</h3>
            <dl className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-7">
              {[
                ["Preview as you type", "The preview is set by the same typesetter that makes your PDF, again a moment after each keystroke, so the download matches it line for line."],
                ["Switch templates", "Your words stay put when you change template, paper size, density or accent colour."],
                ["Country formats", `${PRESET_IDS.length} presets set the paper, date style and personal details for where you are applying.`],
                ["Import", "Drop in your old PDF and we fill the form from its text, on your device."],
                ["Check", "Read your PDF back the way a parser would, and match it against a job post."],
                ["Saves itself", "Drafts save in your browser as you go, and to your account once you sign in."],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b border-[var(--site-rule)] py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="site-body">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Resume to website */}
      <section aria-labelledby="site-title" className="py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Resume to website" no="006" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="site-title" className="site-h2 lg:col-span-7">
              Then turn the same resume into a website
            </h2>
            <div className="self-end lg:col-span-5">
              <p className="site-lead">
                After you download, one button hands the PDF to Dossier&apos;s portfolio builder. It reads the resume and sets it as a site you can
                restyle and publish at a Dossier link.
              </p>
              <p className="mt-5">
                <Link href={ROUTES.looks} className="site-link-mark font-medium">
                  See the website looks
                </Link>
              </p>
            </div>
          </div>

          <ol className="mt-12 grid border-y border-[var(--site-ink)] sm:grid-cols-3">
            {[
              ["Download your PDF", "Free with a free account. The file is yours to send anywhere."],
              ["Press “Turn it into a website”", "The editor hands the PDF straight to the website builder. Nothing to upload again."],
              ["Pick a look and publish", "Shuffle through the looks, then publish at a Dossier link you can put on the resume itself."],
            ].map(([k, v], i) => (
              <li key={k} className={`p-6 sm:p-8 ${i > 0 ? "border-t border-[var(--site-rule-strong)] sm:border-l sm:border-t-0" : ""}`}>
                <span className="sp-data sp-no">Step {i + 1} of 3</span>
                <p className="site-h3 mt-3 !text-[1.25rem]">{k}</p>
                <p className="site-body mt-2">{v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Price */}
      <section aria-labelledby="price-title" className="border-t border-[var(--site-rule-strong)] py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Price" no="007" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="price-title" className="site-h2 lg:col-span-7">
              The PDF download is free on every plan
            </h2>
            <p className="site-lead self-end lg:col-span-5">
              Paid plans are for the portfolio site. If you already have one, it covers more resumes too.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 border-y border-[var(--site-ink)] lg:grid-cols-2">
            <div className="bg-[var(--site-ink)] p-6 text-[var(--site-paper)] sm:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="site-h3">Free</h3>
                <span className="sp-data !text-white/70">No card</span>
              </div>
              <p className="mt-4 font-[family-name:var(--site-display)] text-[3.5rem] font-bold leading-none tracking-[-0.04em]">$0</p>
              <ul className="mt-6 space-y-2.5 text-[0.9375rem]">
                {["Full PDF download, no watermark", "Every template and country format", "2 saved resumes", "ATS check with a job post"].map((x) => (
                  <li key={x} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <SiteButton href={ROUTES.resumeTemplates} variant="paper" size="lg" arrow className="mt-8">
                Pick a template
              </SiteButton>
            </div>
            <div className="border-t border-[var(--site-rule-strong)] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="site-h3">Starter or Pro</h3>
                <span className="sp-data">Portfolio plans</span>
              </div>
              <p className="site-body mt-4">
                Starter ($9 once) and Pro ($39 a year) are the portfolio plans. Either one also lets you keep up to 200 resumes. The resume download
                costs the same as on Free: nothing.
              </p>
              <p className="mt-6">
                <Link href={ROUTES.pricing} className="site-link-mark font-medium">
                  Compare the plans
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="faq border-t border-[var(--site-rule-strong)] py-20 sm:py-28">
        <div className="site-wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <RunningHead label="Questions" no="008" className="!mb-0 lg:col-span-12" />
          <h2 id="faq-title" className="site-h2 lg:col-span-4">
            Fair questions.
          </h2>
          <div className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-8">
            {FAQ.map((f) => (
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

      {/* Close: the page's one ink band */}
      <section aria-labelledby="close-title" className="bg-[var(--site-ink)] py-20 text-[var(--site-paper)] sm:py-28">
        <div className="site-wrap grid gap-8 lg:grid-cols-12">
          <h2 id="close-title" className="site-h2 lg:col-span-7">
            Start with the resume you already have.
          </h2>
          <div className="flex flex-col gap-4 self-end lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <SiteButton href={ROUTES.resumeNew} variant="paper" size="lg" arrow>
                Import my old resume
              </SiteButton>
              <Link href={ROUTES.resumeTemplates} className="inline-flex min-h-14 items-center px-2 font-semibold underline decoration-white/50 underline-offset-4 hover:decoration-2">
                Or pick a template
              </Link>
            </div>
            <p className="sp-data !text-white/70">Free · PDF · read on your device · sign in when you download</p>
          </div>
        </div>
      </section>
    </>
  )
}
