import type { Metadata } from "next"

import { Faq } from "@/components/marketing/Faq"
import { FinalCta } from "@/components/marketing/FinalCta"
import { Pricing } from "@/components/marketing/Pricing"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing: free, $9 once, or $39 a year | Dossier",
  description:
    "Free to publish one portfolio. Starter is $9 once: no badge, unlimited shuffles, ZIP download. Pro is $39 a year for up to five portfolios.",
  path: ROUTES.pricing,
})

export default function PricingPage() {
  return (
    <>
      <Pricing as="h1" full />
      <Faq ids={[11, 10, 12, 9, 0]} />
      <FinalCta />
    </>
  )
}
