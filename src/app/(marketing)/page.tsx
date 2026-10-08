import type { Metadata } from "next"

import { FAQ_ITEMS } from "@/components/marketing/Faq"
import { MarketingPage } from "@/components/marketing/MarketingPage"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Dossier: your resume, set as a portfolio website",
  description:
    "Upload the resume PDF you already have and Dossier sets it as a portfolio website. Try more than twenty looks without losing a word, then publish a link. Works on a phone. Free to start.",
  path: ROUTES.home,
  openGraph: {
    title: "Your resume, set as a website.",
    description: "Upload a PDF. Get a portfolio site you can restyle and publish. Free to start.",
  },
})

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dossier",
  url: siteConfig.url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Turns a resume PDF into a portfolio website.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter", price: "9", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "39", priceCurrency: "USD" },
  ],
}

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
}

export default function MarketingHomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <MarketingPage />
    </>
  )
}
