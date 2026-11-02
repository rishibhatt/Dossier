import type { Metadata } from "next"

import { FAQ_ITEMS } from "@/components/marketing/Faq"
import { MarketingPage } from "@/components/marketing/MarketingPage"
import { BRAND, buildPageMetadata, SCHEMA_IDS } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { type ProductId, PRODUCTS } from "@/lib/billing/pricing"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Dossier Resume: Free Resume Builder and Portfolio Website",
  description:
    "Build a resume from tested templates and download the PDF free, or upload the resume you have and Dossier sets it as a portfolio website. Free to start.",
  path: ROUTES.home,
  openGraph: {
    title: "One resume. A PDF and a website.",
    description: "Tested resume templates with a free PDF download, and a portfolio site from the same resume. Free to start.",
  },
})

/** Dollar price of a paid product, as schema.org wants it ("9", "39"). Same numbers checkout charges. */
const usd = (id: ProductId) => String(PRODUCTS[id].price.USD / 100)

/** A price per period (ANN = year, MON = month in UN/CEFACT codes), so "$39" never reads as monthly. */
const perPeriod = (id: ProductId, unitCode: "ANN" | "MON") => ({
  "@type": "UnitPriceSpecification",
  price: usd(id),
  priceCurrency: "USD",
  referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode },
})

/** One graph for the brand: the organisation, the site and the app, linked by `@id`. No `sameAs` until real brand profiles exist. */
const brandLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SCHEMA_IDS.org,
      name: siteConfig.name,
      alternateName: [...BRAND.alternateNames],
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/brand/email-logo.png` },
      description: BRAND.oneLiner,
      email: siteConfig.supportEmail,
      founder: { "@type": "Person", name: "Rishab Bhatt", url: "https://rishieee.netlify.app" },
    },
    {
      "@type": "WebSite",
      "@id": SCHEMA_IDS.website,
      name: siteConfig.name,
      alternateName: [...BRAND.alternateNames],
      url: siteConfig.url,
      description: BRAND.oneLiner,
      publisher: { "@id": SCHEMA_IDS.org },
      inLanguage: siteConfig.locale,
    },
    {
      "@type": "SoftwareApplication",
      "@id": SCHEMA_IDS.app,
      name: "Dossier Resume Builder",
      alternateName: siteConfig.name,
      url: siteConfig.url,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Resume builder",
      operatingSystem: "Web",
      description: `${BRAND.whatItDoes} ${BRAND.alsoFree}`,
      featureList: [
        "Resume builder with tested templates and a free PDF download, no watermark",
        "Resume to portfolio website, restyle and publish at a link",
        "Cover letter maker that drafts from your resume and the job ad, in the same design as your resume",
        "Cover letter checker for role, company, results, key words, stock phrases and length",
        "Country formats for resumes and cover letters",
      ],
      publisher: { "@id": SCHEMA_IDS.org },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
          description: "Free forever. Resume PDF download with no watermark, 2 saved resumes, 1 published portfolio.",
        },
        {
          "@type": "Offer",
          name: "Starter",
          price: usd("starter"),
          priceCurrency: "USD",
          description: "One-time payment, no subscription. Badge removed, unlimited design shuffles, site download as a ZIP.",
        },
        {
          "@type": "Offer",
          name: "Pro, 1 year",
          price: usd("pro_year"),
          priceCurrency: "USD",
          priceSpecification: perPeriod("pro_year", "ANN"),
          description: "Paid once for a year of Pro. Does not renew automatically. Up to 5 portfolios and visit counts.",
        },
        {
          "@type": "Offer",
          name: "Pro, 1 month",
          price: usd("pro_month"),
          priceCurrency: "USD",
          priceSpecification: perPeriod("pro_month", "MON"),
          description: "Paid once for a month of Pro. Does not renew automatically. Up to 5 portfolios and visit counts.",
        },
      ],
    },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <MarketingPage />
    </>
  )
}
