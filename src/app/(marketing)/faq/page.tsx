import type { Metadata } from "next"

import { FAQ_ITEMS, FaqFull } from "@/components/marketing/Faq"
import { FinalCta } from "@/components/marketing/FinalCta"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Questions about Dossier, answered",
  description: "What happens to your resume, whether Google can find your site, how shuffling works, what the plans include and how invite credits work.",
  path: ROUTES.faq,
})

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
}

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <PageHead
        running={["Questions", `${String(FAQ_ITEMS.length).padStart(3, "0")} answers`]}
        title="Straight answers before you upload."
        lead={<p>About your data, the design engine, publishing and plans. If something is planned and not built yet, it says so.</p>}
      />
      <FaqFull />
      <FinalCta />
    </>
  )
}
