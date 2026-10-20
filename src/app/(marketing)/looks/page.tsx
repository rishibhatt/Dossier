import type { Metadata } from "next"

import { FinalCta } from "@/components/marketing/FinalCta"
import { PageHead } from "@/components/marketing/PageHead"
import { SAMPLE_PEOPLE, SAMPLE_PERSON } from "@/components/marketing/sample"
import { SpecimenIndex } from "@/components/marketing/SpecimenIndex"
import { getSpecimens, specimenFontsHref } from "@/components/marketing/specimens"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Every portfolio look in the Dossier design engine",
  description:
    "Each look is a full design for your portfolio site: type pairing, palette, layout and hero. Filter by field, see who each one suits, and switch any time without retyping.",
  path: ROUTES.looks,
})

/** The full catalogue of website looks, moved off the home page so it is there for people who want to browse. */
export default function LooksPage() {
  const specimens = getSpecimens()
  const fontText = `${SAMPLE_PERSON.name}${SAMPLE_PERSON.role}${specimens.map((s) => s.name).join("")}${SAMPLE_PEOPLE.map((p) => p.name).join("")}`
  return (
    <>
      <link rel="stylesheet" href={specimenFontsHref(specimens, fontText)} precedence="default" />
      <PageHead
        running={["Website looks", `${specimens.length} in the engine`]}
        title="Every look, set with the same sample resume"
        lead={<p>Dossier suggests a look from your resume. You can switch to any of these at any time, and every word stays where you put it.</p>}
      />
      <SpecimenIndex specimens={specimens} sample={`${SAMPLE_PERSON.name}, ${SAMPLE_PERSON.role}`} head={false} />
      <FinalCta title="Pick a look after you see your own resume in it." />
    </>
  )
}
