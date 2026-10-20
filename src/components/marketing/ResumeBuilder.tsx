import Link from "next/link"

import { RunningHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { getThumb, getVerification } from "@/content/resume/evidence"
import { templateEntries } from "@/content/resume/templates"
import { ROUTES } from "@/lib/constants/routes"

import "@/styles/resume-site.css"

/** How much of the page the plate shows, from the top: the sample's content ends a little past half way. */
const CROP = 0.57

/**
 * Where each note points on the real render of Meera's Ledger page, as % of the full page (x from the left,
 * y from the top). Measured on public/resume-templates/r001-ledger/meera-a4-p1-600.webp; re-measure if the
 * template or the sample changes.
 */
const NOTES = [
  { x: 3.6, y: 10.5, title: "Contact details in the page", body: "Name, email, phone and city sit in the body. Some parsers skip headers and footers entirely." },
  { x: 3.6, y: 19.3, title: "Headings a parser expects", body: "Experience, Education, Skills. Standard names, so each line lands in the right field." },
  { x: 96.4, y: 21.6, title: "Dates after the role", body: "Role, then dates on the right, then employer. Each job keeps its own dates." },
  { x: 3.6, y: 26.8, title: "Real text in every line", body: "Copy any line out of the PDF and it pastes as the same words. No images, no icon fonts." },
  { x: 3.6, y: 49.1, title: "Skills as words", body: "No bars or star ratings. A parser can't read a bar, and a recruiter can't search for one." },
] as const

/**
 * Home section for the resume builder: one real page, annotated with why it reads cleanly, instead of a
 * gallery of templates. The test numbers come from the verification files, so the claim matches the last run.
 */
export function ResumeBuilder() {
  const entries = templateEntries()
  const tested = entries.map((t) => getVerification(t.templateId)).filter((v): v is NonNullable<typeof v> => Boolean(v))
  const runs = tested.reduce((n, v) => n + v.runs, 0)
  const passed = tested.reduce((n, v) => n + v.passed, 0)
  const page = getThumb("r001-ledger", "meera", "a4")

  return (
    <section id="resume-builder" aria-labelledby="resume-builder-title" className="scroll-mt-20 border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-20 sm:py-28">
      <div className="site-wrap">
        <RunningHead label="Resume builder" no="002" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
          {page ? (
            <figure className="min-w-0 lg:col-span-6 lg:border-r lg:border-[var(--site-rule-strong)] lg:pr-10">
              <div className="rs-page relative" style={{ aspectRatio: `1 / ${(page.ratio * CROP).toFixed(4)}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static pre-rendered WebP with explicit sizes */}
                <img
                  src={page.srcLarge}
                  srcSet={`${page.src} 600w, ${page.srcLarge} 1200w`}
                  sizes="(min-width: 1024px) 34rem, 92vw"
                  width={1200}
                  height={Math.round(1200 * page.ratio)}
                  alt="Ledger resume template, sample for a fictional senior accountant, with five numbered notes"
                  loading="lazy"
                />
                {NOTES.map((n, i) => (
                  <span
                    key={n.title}
                    aria-hidden
                    className="sp-no absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2px] bg-[var(--site-ink)] text-[0.75rem] font-medium text-[var(--site-paper)] shadow-[0_0_0_3px_var(--site-paper)] sm:size-7"
                    style={{ left: `${n.x}%`, top: `${(n.y / CROP).toFixed(2)}%` }}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <figcaption className="sp-data mt-3">R-001 Ledger, A4 · Sample: Meera Iyer (sample). Not a real person.</figcaption>
            </figure>
          ) : null}

          <div className="flex min-w-0 flex-col lg:col-span-6 lg:pl-10">
            <h2 id="resume-builder-title" className="site-h2">
              A PDF that parsers read in the order you wrote it.
            </h2>
            <p className="site-lead mt-5">
              Applicant tracking systems read the text inside your PDF, not the picture of it. Every Dossier template is built for that read,
              and the download is free.
            </p>

            <ol className="mt-8 border-t border-[var(--site-ink)]">
              {NOTES.map((n, i) => (
                <li key={n.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-[var(--site-rule)] py-4">
                  <span className="sp-data sp-no pt-0.5 !text-[var(--site-ink)]">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">
                    <b className="font-semibold text-[var(--site-ink)]">{n.title}.</b> {n.body}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SiteButton href={ROUTES.resumeNew} size="lg" arrow>
                Build my resume
              </SiteButton>
              <Link href={ROUTES.resumeTemplates} className="site-link-mark self-start font-medium sm:self-center">
                Browse the {entries.length} templates
              </Link>
            </div>
            {tested[0] ? (
              <p className="sp-data mt-5">
                Tested {tested[0].testedLabel} · {passed.toLocaleString("en-US")}/{runs.toLocaleString("en-US")} test PDFs read back in full ·{" "}
                {tested[0].extractor} · free account to download
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
