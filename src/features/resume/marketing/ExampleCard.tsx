import Link from "next/link"

import { getThumb } from "@/content/resume/evidence"
import type { ExampleEntry } from "@/content/resume/examples"
import { ROUTES } from "@/lib/constants/routes"
import { getTemplate } from "@/lib/resume/templates"

/** One resume example as a ruled cell: the sample's real render, the role, and who the fictional person is. */
export function ExampleCard({ e, headingLevel: H = "h3", priority = false }: { e: ExampleEntry; headingLevel?: "h2" | "h3"; priority?: boolean }) {
  const thumb = getThumb(e.templateId, e.sample, "a4")
  const template = getTemplate(e.templateId)
  return (
    <article className="rs-card bg-[var(--site-paper)]">
      <Link href={`${ROUTES.resumeExamples}/${e.slug}`} className="rs-card-link">
        <span className="rs-page" style={{ aspectRatio: thumb ? `1 / ${thumb.ratio}` : "1 / 1.414" }}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element -- static pre-rendered WebP with explicit sizes
            <img
              src={thumb.src}
              srcSet={`${thumb.src} 600w, ${thumb.srcLarge} 1200w`}
              sizes="(min-width: 1440px) 280px, (min-width: 1024px) 30vw, 50vw"
              width={600}
              height={Math.round(600 * thumb.ratio)}
              alt={`${e.title} resume example in ${template.name}, for a fictional person`}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
            />
          ) : null}
        </span>
        <span className="flex flex-col gap-1">
          <H className="rs-card-name">{e.title}</H>
          <span className="sp-data">
            {e.person.label} · {template.name}
          </span>
        </span>
      </Link>
    </article>
  )
}
