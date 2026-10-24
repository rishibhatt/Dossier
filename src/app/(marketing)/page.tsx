import type { Metadata } from "next"

import { FAQ_ITEMS } from "@/components/marketing/Faq"
import { MarketingPage } from "@/components/marketing/MarketingPage"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Free Resume Builder and Portfolio Website From Your Resume | Dossier",
  description:
    "Build a resume from tested templates and download the PDF free, or upload the resume you have and Dossier sets it as a portfolio website. Free to start.",
  path: ROUTES.home,
  openGraph: {
    title: "One resume. A PDF and a website.",
    description: "Tested resume templates with a free PDF download, and a portfolio site from the same resume. Free to start.",
  },
})

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dossier",
  url: siteConfig.url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Builds a resume PDF from tested templates and turns a resume into a portfolio website.",
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

const orgLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dossier",
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/email-logo.png`,
    email: siteConfig.supportEmail,
    founder: { "@type": "Person", name: "Rishab Bhatt", url: "https://rishieee.netlify.app" },
  },
  { "@context": "https://schema.org", "@type": "WebSite", name: "Dossier", url: siteConfig.url },
]

export default function MarketingHomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <MarketingPage />
    </>
  )
}
