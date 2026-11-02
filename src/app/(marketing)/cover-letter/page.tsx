import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Plus } from "lucide-react"

import { RunningHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { buildPageMetadata, SCHEMA_IDS } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { formatLetterDate, LETTER_CONVENTIONS } from "@/lib/cover-letter/renderModel"
import { ROUTES } from "@/lib/constants/routes"
import { PRESETS } from "@/lib/resume/presets"
import { PRESET_IDS } from "@/lib/resume/schema"

import "@/styles/resume-site.css"

export const metadata: Metadata = buildPageMetadata({
  title: "Free cover letter maker that matches your resume | Dossier",
  description:
    "Draft a cover letter from your resume and the job ad, in your country's format and your resume's design. Check it, and download the PDF free.",
  path: ROUTES.coverLetter,
  openGraph: {
    title: "One job ad, a matching resume and cover letter.",
    description: "Draft the letter from your resume, check it against the job ad, and download the PDF free, with no watermark.",
  },
})

/** Guides that cover a format in depth, keyed by preset. */
const FORMAT_GUIDES: Partial<Record<(typeof PRESET_IDS)[number], { label: string; href: string }>> = {
  de: { label: "Anschreiben guide", href: `${ROUTES.blog}/german-cover-letter-anschreiben` },
  in: { label: "Fresher guide", href: `${ROUTES.blog}/fresher-cover-letter-india` },
}

/** What the checker looks for, in the reader's words. Matches the checks in the cover letter checker. */
const CHECKS = [
  ["Company and role", "Both named in the letter, not only in the greeting."],
  ["A person to greet", "A name where you can find one, instead of a generic greeting."],
  ["Gaps left in", "Any [bracket] or template placeholder you forgot to fill."],
  ["Shape and length", "Paragraph count and word count for a one-page letter."],
  ["A result", "At least one example with a number someone could ask about."],
  ["Words from the ad", "How many of the job post's key words your letter uses."],
  ["Stock phrases", "“I am writing to apply”, “team player”, hedges and apologies."],
  ["A clear ask", "A closing line that asks for the next step."],
]

const FAQ = [
  {
    q: "Is the cover letter maker free?",
    a: "Yes. Drafting, editing and checking are free and need no account. To download the PDF, sign in or create a free account. The PDF has no watermark.",
  },
  {
    q: "Does AI write my cover letter?",
    a: "The first draft is built by rules, in your browser, from your resume and the job ad. Every number in it comes from your resume. Anything only you know, such as why you want this company, is left as a [bracketed note] for you to write.",
  },
  {
    q: "Will the letter match my resume?",
    a: "When you start from a Dossier resume, your name, contact details and results carry over, and the letterhead takes its type, name block and accent colour from your resume's template. The two PDFs read as a set.",
  },
  {
    q: "Which countries does it handle?",
    a: `${PRESET_IDS.length} formats: ${PRESET_IDS.map((id) => PRESETS[id].label).join(", ")}. Each sets the date style, paper size, sign-off and whether a subject line is added. Letters are in English.`,
  },
  {
    q: "Do I need a resume first?",
    a: "No. You can start blank and type your details. Starting from a resume is quicker: your details and results fill in, and the draft picks the results that match the job ad.",
  },
  {
    q: "Where is my letter saved?",
    a: "In this browser while you work. When you sign in to download, it is saved to your account too. The cover letter checker keeps your letter in the browser tab and does not send it to Dossier.",
  },
]

/** The hero plate: a sample draft for a fictional person, with the four parts the maker builds marked. */
function LetterPlate() {
  const mark = (n: number) => (
    <sup className="sp-no ml-0.5 font-[family-name:var(--site-mono-face)] text-[0.625rem] font-semibold text-[var(--site-accent-ink)]" aria-hidden>
      {n}
    </sup>
  )
  const marked = "underline decoration-[var(--site-accent)] decoration-2 underline-offset-[3px]"
  return (
    <figure className="min-w-0">
      <div className="rs-page px-5 py-6 text-[0.8125rem] leading-[1.6] text-[var(--site-ink)] sm:px-9 sm:py-9 sm:text-[0.875rem]">
        <div className="border-b border-[var(--site-ink)] pb-3">
          <p className="font-[family-name:var(--site-display)] text-[1.375rem] font-bold leading-none tracking-[-0.03em] sm:text-[1.625rem]">Meera Iyer</p>
          <p className="sp-data mt-2 break-words">Senior Accountant · meera@example.com · Pune, India</p>
        </div>
        <p className="mt-4 text-[var(--site-ink-2)]">3 November 2026</p>
        <p className="mt-3">Dear Hiring Manager,</p>
        <p className="mt-3">
          <span className={marked}>Your Senior Accountant post asks for someone to own month-end close and GST filing.</span>
          {mark(1)} That has been my job at Kulkarni &amp; Rao LLP in Pune since 2021.
        </p>
        <p className="mt-3">
          <span className={marked}>I close month-end for 14 clients in 4 working days, down from 7</span>
          {mark(2)}, and prepare GST returns and reconciliations for clients with ₹2–40 crore turnover.
        </p>
        <p className="mt-3">
          <span className="rounded-[2px] border border-dashed border-[var(--site-ink-3)] px-1 font-[family-name:var(--site-mono-face)] text-[0.75rem] text-[var(--site-ink-2)]">
            [Why Deccan Foods: add one specific thing]
          </span>
          {mark(3)}
        </p>
        <p className="mt-3">
          <span className={marked}>Could we talk next week about your close calendar?</span>
          {mark(4)}
        </p>
        <p className="mt-4">Sincerely,</p>
        <p>Meera Iyer</p>
      </div>
      <figcaption className="mt-4">
        <ol className="grid gap-x-6 gap-y-1.5 text-sm text-[var(--site-ink-2)] sm:grid-cols-2">
          {["Names the role, from the job ad", "A result with a number, from her resume", "Left for her: the one fact a draft can't know", "Asks for a next step"].map((t, i) => (
            <li key={t} className="flex gap-2">
              <span className="sp-no font-[family-name:var(--site-mono-face)] text-xs font-semibold text-[var(--site-accent-ink)]">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <p className="sp-data mt-3">Sample draft for Meera Iyer, a fictional senior accountant. Not a real person.</p>
      </figcaption>
    </figure>
  )
}

export default function CoverLetterLandingPage() {
  const exampleDate = "2026-11-03"

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Dossier Cover Letter",
      url: `${siteConfig.url}${ROUTES.coverLetter}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "A cover letter maker that runs in the browser. It drafts the letter from your resume and the job ad, in your country's format and your resume's design, and downloads as a PDF free with a free account.",
      isPartOf: { "@id": SCHEMA_IDS.website },
      publisher: { "@id": SCHEMA_IDS.org },
      featureList: [
        "First draft built from your own resume and the job ad",
        "Letterhead in the same design as your Dossier resume",
        `${PRESET_IDS.length} country formats: date style, paper size, sign-off and subject line`,
        "Cover letter checker for role, company, results, key words, stock phrases and length",
        "PDF download free with a free account, no watermark",
      ],
      offers: { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "PDF download with a free account, no watermark" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Cover letter maker", item: `${siteConfig.url}${ROUTES.coverLetter}` },
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
            <span>Dossier Cover Letter</span>
            <span className="hidden sm:inline">{PRESET_IDS.length} country formats · free PDF</span>
            <span className="sp-no">No. 003</span>
          </div>

          <div className="sp-columns grid grid-cols-1 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col justify-center gap-6 pb-10 pt-8 lg:col-span-6 lg:border-r lg:border-[var(--site-rule-strong)] lg:py-14 lg:pr-10 lg:[&>*]:bg-[var(--site-paper)]">
              <h1 id="hero-title" className="site-h1 max-w-[16ch] lg:text-[clamp(3rem,4.4vw,4.25rem)]">
                Write your cover letter from your resume and the job ad
              </h1>
              <p className="site-lead">
                Paste the job ad. The draft names the role, uses results from your own resume, follows your country&apos;s letter format, and
                comes out in the same design as your resume.
              </p>

              <div className="border border-dashed border-[var(--site-ink)] bg-[var(--site-sheet)] p-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <SiteButton href={ROUTES.coverLetterNew} size="lg" arrow className="sm:flex-1">
                    Write my cover letter
                  </SiteButton>
                  <SiteButton href={ROUTES.coverLetterChecker} variant="secondary" size="lg" className="sm:flex-1">
                    Check a letter I wrote
                  </SiteButton>
                </div>
                <p className="sp-data flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 pb-0.5 pt-2.5">
                  <span>Draft and check without an account</span>
                  <span>PDF free with a free account</span>
                </p>
              </div>

              <p className="text-sm text-[var(--site-ink-2)]">
                No watermark on the PDF. The draft never makes up a number.{" "}
                <Link href={ROUTES.resumeNew} className="site-link-mark font-medium text-[var(--site-ink)]">
                  No resume yet? Build that first
                </Link>
              </p>
            </div>

            <div className="min-w-0 pb-12 lg:col-span-6 lg:py-12 lg:pl-10">
              <LetterPlate />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="How it works" no="004" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="how-title" className="site-h2 lg:col-span-7">
              Three steps, and the facts come from you
            </h2>
            <p className="site-lead self-end lg:col-span-5">
              The draft is built from what is already on your resume. Where it needs something only you know, it leaves a note in brackets
              instead of guessing.
            </p>
          </div>

          <ol className="mt-12 grid border-y border-[var(--site-ink)] sm:grid-cols-3">
            {[
              ["Start from your resume", "Pick one of your Dossier resumes, or start blank and type your details."],
              ["Paste the job ad", "The draft names the role and the company, and picks the results from your resume that match the ad."],
              ["Edit, check, download", "Change any line, run the check, and download the PDF free once you sign in."],
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

      {/* Why it matches */}
      <section aria-labelledby="match-title" className="py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Matches your resume" no="005" />
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="match-title" className="site-h2">
                Same facts, same design, one set
              </h2>
              <p className="site-lead mt-6">
                The letter starts from your resume, so it already carries your details, your results and your template. Nothing is typed
                twice.
              </p>
            </div>
            <dl className="min-w-0 border-t border-[var(--site-ink)] lg:col-span-7">
              {[
                ["Your details", "Name, headline, email, phone, city and links come from the resume you pick."],
                ["Your results", "The proof paragraph uses lines from your resume that carry a number, ranked by how well they match the job ad. Nothing is estimated."],
                ["Your gaps, visible", "What only you know, such as why this company, stays as a [bracketed note]. The checker flags any you leave in."],
                ["Your design", "The letterhead takes its type, name block and accent colour from your resume's template."],
                ["Your format", "The country you choose sets the date style, paper size, sign-off and subject line."],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b border-[var(--site-rule)] py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
                  <dt className="font-semibold">{k}</dt>
                  <dd className="site-body">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Country formats */}
      <section aria-labelledby="formats-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Country formats" no="006" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="formats-title" className="site-h2 lg:col-span-7">
              A letter to Berlin is laid out differently from one to Boston
            </h2>
            <p className="site-lead self-end lg:col-span-5">
              Pick where you are applying. The date, sign-off, subject line and paper follow that country&apos;s convention, and you can change any
              of them.
            </p>
          </div>

          <p className="sp-data mt-12 pb-3">Defaults per format. Date shown for 3 November 2026.</p>
          {/* Phone: one ruled block per format. */}
          <ul className="border-t border-[var(--site-ink)] sm:hidden">
            {PRESET_IDS.map((id) => {
              const c = LETTER_CONVENTIONS[id]
              const guide = FORMAT_GUIDES[id]
              return (
                <li key={id} className="border-b border-[var(--site-rule)] py-4">
                  <p className="font-semibold">
                    {PRESETS[id].label}
                    {guide ? (
                      <Link href={guide.href} className="site-link-mark ml-2 text-sm font-medium text-[var(--site-ink-2)]">
                        {guide.label}
                      </Link>
                    ) : null}
                  </p>
                  <dl className="mt-2 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-[var(--site-ink-2)]">Date</dt>
                    <dd className="font-[family-name:var(--site-mono-face)]">{formatLetterDate(exampleDate, id)}</dd>
                    <dt className="text-[var(--site-ink-2)]">Sign-off, no name</dt>
                    <dd className="font-[family-name:var(--site-mono-face)]">{c.signOff.unnamed.replace(/,$/, "")}</dd>
                    <dt className="text-[var(--site-ink-2)]">Subject line</dt>
                    <dd>{c.autoSubject ? "Added for you" : "If you add one"}</dd>
                    <dt className="text-[var(--site-ink-2)]">Paper</dt>
                    <dd className="font-[family-name:var(--site-mono-face)]">{PRESETS[id].paper === "a4" ? "A4" : "US Letter"}</dd>
                  </dl>
                </li>
              )
            })}
          </ul>
          <div className="hidden min-w-0 overflow-x-auto sm:block">
            <table className="rs-table min-w-[36rem]">
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Date</th>
                  <th scope="col">Sign-off, no name</th>
                  <th scope="col">Subject line</th>
                  <th scope="col">Paper</th>
                </tr>
              </thead>
              <tbody>
                {PRESET_IDS.map((id) => {
                  const c = LETTER_CONVENTIONS[id]
                  const guide = FORMAT_GUIDES[id]
                  return (
                    <tr key={id}>
                      <th scope="row" className="!font-semibold">
                        {PRESETS[id].label}
                        {guide ? (
                          <Link href={guide.href} className="site-link-mark ml-2 text-sm font-medium text-[var(--site-ink-2)]">
                            {guide.label}
                          </Link>
                        ) : null}
                      </th>
                      <td className="rs-num whitespace-nowrap">{formatLetterDate(exampleDate, id)}</td>
                      <td className="rs-num whitespace-nowrap">{c.signOff.unnamed.replace(/,$/, "")}</td>
                      <td>{c.autoSubject ? "Added for you" : "If you add one"}</td>
                      <td className="rs-num whitespace-nowrap">{PRESETS[id].paper === "a4" ? "A4" : "US Letter"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="site-body mt-6 max-w-[42rem]">
            In the UK format the sign-off follows the greeting: &ldquo;Yours sincerely&rdquo; to a named person, &ldquo;Yours faithfully&rdquo;
            otherwise. Applying in Germany? Read the{" "}
            <Link href={`${ROUTES.blog}/german-cover-letter-anschreiben`} className="site-link-mark font-medium text-[var(--site-ink)]">
              Anschreiben format guide
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Checker */}
      <section aria-labelledby="check-title" className="py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Cover letter checker" no="007" />
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 id="check-title" className="site-h2 lg:col-span-7">
              Already wrote one? Check it against the job ad.
            </h2>
            <div className="self-end lg:col-span-5">
              <p className="site-lead">
                Paste your letter and the job post. You get a score and a list of fixes, most important first. Your letter stays in your browser
                tab.
              </p>
            </div>
          </div>

          <ul className="mt-12 grid border-t border-[var(--site-ink)] sm:grid-cols-2">
            {CHECKS.map(([k, v], i) => (
              <li key={k} className={`flex gap-3 border-b border-[var(--site-rule)] py-5 sm:px-1 ${i % 2 === 1 ? "sm:border-l sm:pl-6" : "sm:pr-6"}`}>
                <Check className="mt-1 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
                <div>
                  <p className="font-semibold">{k}</p>
                  <p className="site-body mt-0.5">{v}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--site-ink-2)]">It reads structure and wording. It does not check spelling or grammar.</p>
            <SiteButton href={ROUTES.coverLetterChecker} variant="secondary" size="lg" arrow>
              Check my cover letter
            </SiteButton>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section aria-labelledby="guides-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-20 sm:py-28">
        <div className="site-wrap">
          <RunningHead label="Guides" no="008" />
          <h2 id="guides-title" className="site-h2 max-w-[20ch]">
            Before you write it
          </h2>
          <ul className="mt-12 border-t border-[var(--site-ink)]">
            {[
              ["Cover letter for a fresher in India: format and 3 samples", "fresher-cover-letter-india"],
              ["German cover letter (Anschreiben): format guide in English", "german-cover-letter-anschreiben"],
              ["Cover letter vs resume: what each one must do", "cover-letter-vs-resume"],
              ["Cover letter mistakes: 10 checks before you send it", "cover-letter-mistakes"],
            ].map(([t, slug]) => (
              <li key={slug} className="border-b border-[var(--site-rule)]">
                <Link href={`${ROUTES.blog}/${slug}`} className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-4">
                  <span className="text-[1.0625rem] font-semibold leading-snug group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">{t}</span>
                  <ArrowRight className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="faq border-t border-[var(--site-rule-strong)] py-20 sm:py-28">
        <div className="site-wrap grid grid-cols-1 gap-10 lg:grid-cols-12">
          <RunningHead label="Questions" no="009" className="!mb-0 lg:col-span-12" />
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
            One job ad, a matching resume and cover letter.
          </h2>
          <div className="flex flex-col gap-4 self-end lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <SiteButton href={ROUTES.coverLetterNew} variant="paper" size="lg" arrow>
                Write my cover letter
              </SiteButton>
              <Link href={ROUTES.resume} className="inline-flex min-h-14 items-center px-2 font-semibold underline decoration-white/50 underline-offset-4 hover:decoration-2">
                Or build the resume first
              </Link>
            </div>
            <p className="sp-data !text-white/70">Free · drafts in your browser · sign in when you download</p>
          </div>
        </div>
      </section>
    </>
  )
}
