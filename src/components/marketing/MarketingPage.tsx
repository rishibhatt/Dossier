import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Audience } from "@/components/marketing/Audience"
import { Faq } from "@/components/marketing/Faq"
import { FinalCta } from "@/components/marketing/FinalCta"
import { Hero } from "@/components/marketing/Hero"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { OnPhone } from "@/components/marketing/OnPhone"
import { Pricing } from "@/components/marketing/Pricing"
import { ResumeBuilder } from "@/components/marketing/ResumeBuilder"
import { SAMPLE_PEOPLE, SAMPLE_PERSON } from "@/components/marketing/sample"
import { LooksTrio } from "@/components/marketing/LooksTrio"
import { getSpecimens, specimenFontsHref } from "@/components/marketing/specimens"
import { getThumb } from "@/content/resume/evidence"
import { FREE_TOOLS } from "@/features/tools/catalog"
import { ROUTES } from "@/lib/constants/routes"

/** The hero cycles through a spread of looks: light and dark, serif and grotesque, quiet and loud. */
const HERO_LOOKS = ["ledger", "terminal", "studio", "chalk", "nocturne", "campaign", "chambers", "fresh-start"]

/** A quiet strip pointing at the free tools, for visitors not ready to upload. */
function ToolsStrip() {
  return (
    <section aria-labelledby="tools-strip-title" className="border-y border-[var(--site-rule-strong)]">
      <div className="site-wrap grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
        <h2 id="tools-strip-title" className="site-h3 lg:col-span-4">
          Not ready to build? Fix the resume first.
        </h2>
        <ul className="grid grid-cols-1 gap-px bg-[var(--site-rule)] sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
          {FREE_TOOLS.slice(0, 4).map((t) => (
            <li key={t.slug} className="bg-[var(--site-paper)]">
              <Link href={`${ROUTES.tools}/${t.slug}`} className="group flex h-full min-h-20 items-center justify-between gap-3 p-4 text-[0.9375rem] font-semibold hover:bg-[var(--site-sheet)]">
                {t.name}
                <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function MarketingPage() {
  const specimens = getSpecimens()
  const heroLooks = HERO_LOOKS.map((id) => specimens.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s))
  // The hero sample (Meera) also exists as a resume sample, so the PDF beside her site is her real render.
  const pdf = getThumb("r001-ledger", SAMPLE_PERSON.id, "a4")
  const resumePage = pdf ? { src: pdf.src, srcLarge: pdf.srcLarge, ratio: pdf.ratio, template: "R-001 Ledger" } : undefined
  const fontText = `${SAMPLE_PERSON.name}${SAMPLE_PERSON.role}${SAMPLE_PERSON.city}${SAMPLE_PERSON.jobs[0]!.line}, ${specimens.map((s) => s.name).join("")}${SAMPLE_PEOPLE.map((p) => p.name).join("")}`

  return (
    <>
      {/* Display faces for the specimen showings, bold only and subset to the letters on this page. */}
      <link rel="stylesheet" href={specimenFontsHref(specimens, fontText)} precedence="default" />
      <Hero specimens={heroLooks} person={SAMPLE_PERSON} total={specimens.length} resumePage={resumePage} />
      <ResumeBuilder />
      <HowItWorks person={SAMPLE_PERSON} />
      <LooksTrio specimens={specimens} person={SAMPLE_PERSON} />
      <Audience people={SAMPLE_PEOPLE} specimens={specimens} />
      <OnPhone person={SAMPLE_PERSON} />
      <Pricing />
      <ToolsStrip />
      <Faq />
      <FinalCta />
    </>
  )
}
