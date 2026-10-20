import Link from "next/link"
import { CircleCheck } from "lucide-react"

import { getThumb, getVerification, stampText, type Verification } from "@/content/resume/evidence"
import type { TemplateEntry } from "@/content/resume/templates"
import { ROUTES } from "@/lib/constants/routes"
import { SAMPLE_RESUMES } from "@/lib/resume/samples"

export function sampleOf(id: string) {
  return SAMPLE_RESUMES.find((s) => s.id === id) ?? SAMPLE_RESUMES[0]!
}

/** Mono data line: number, paper, columns, body face and size. */
export function dataLine(t: TemplateEntry) {
  return `${t.engine.no} · A4 / Letter · ${t.engine.columns} col · ${t.body.face} ${t.body.size}`
}

export function thumbAlt(t: TemplateEntry, sampleId = t.sample) {
  return `${t.engine.name} resume template, sample for a fictional ${sampleOf(sampleId).role.toLowerCase()}`
}

/**
 * The test stamp: date and exact counts in ok green, with an icon and words. It opens a native popover that
 * says what was tested and what was not, so the badge never claims more than the test.
 */
export function TestStamp({ v, id, className, compact = false }: { v: Verification; id: string; className?: string; compact?: boolean }) {
  const popId = `test-${id}`
  return (
    <>
      <button type="button" popoverTarget={popId} className={`rs-stamp ${className ?? ""}`}>
        <CircleCheck aria-hidden strokeWidth={2.25} />
        <span>{stampText(v, compact)}</span>
      </button>
      <div id={popId} popover="auto" className="rs-pop" role="dialog" aria-label="How this template was tested">
        <p className="site-h3 !text-[1.125rem]">What “tested” means here</p>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">
          On {v.testedLabel} we set this template with {v.samples} fictional sample resumes, at 3 densities and on A4 and US
          Letter ({v.runs} PDFs), then read each PDF back with {v.extractor}. {v.passed} of {v.runs} returned every field in
          order, with working links and no broken characters.
        </p>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--site-ink-2)]">
          This is an automated parse-back test. It has not yet been run through a commercial applicant tracking system.
        </p>
        <button type="button" popoverTarget={popId} popoverTargetAction="hide" className="site-btn site-btn-secondary site-btn-sm mt-4">
          <span className="site-btn-label">Close</span>
        </button>
      </div>
    </>
  )
}

/** One template as a ruled cell: a real render on a white plate, name, data line, and the dated test stamp. */
export function TemplateCard({
  t,
  headingLevel: H = "h3",
  priority = false,
  idPrefix = "card",
}: {
  t: TemplateEntry
  headingLevel?: "h2" | "h3"
  priority?: boolean
  idPrefix?: string
}) {
  const thumb = getThumb(t.templateId, t.sample, "a4")
  const v = getVerification(t.templateId)
  return (
    <article className="rs-card bg-[var(--site-paper)]">
      <Link href={`${ROUTES.resumeTemplates}/${t.slug}`} className="rs-card-link">
        <span className="rs-page" style={{ aspectRatio: thumb ? `1 / ${thumb.ratio}` : "1 / 1.414" }}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- static pre-rendered WebP with explicit sizes
            <img
              src={thumb.src}
              srcSet={`${thumb.src} 600w, ${thumb.srcLarge} 1200w`}
              sizes="(min-width: 1440px) 280px, (min-width: 1024px) 30vw, 50vw"
              width={600}
              height={Math.round(600 * thumb.ratio)}
              alt={thumbAlt(t)}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
            />
          ) : null}
        </span>
        <span className="flex flex-col gap-1">
          <H className="rs-card-name">{t.engine.name}</H>
          <span className="sp-data">
            <span className="sm:hidden">
              {t.engine.no} · {t.engine.columns} col · {t.body.face}
            </span>
            <span className="hidden sm:inline">{dataLine(t)}</span>
          </span>
          <span className="text-[0.9375rem] leading-snug text-[var(--site-ink-2)]">{t.tagline}</span>
        </span>
      </Link>
      {v ? <TestStamp v={v} id={`${idPrefix}-${t.slug}`} className="self-start" compact /> : null}
    </article>
  )
}
