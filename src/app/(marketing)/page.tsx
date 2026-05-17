import type { Metadata } from "next"

import { MarketingPage } from "@/components/marketing/MarketingPage"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Dossier - Turn Your Resume Into a Portfolio Website",
  description:
    "Dossier turns your resume PDF into a polished, editable portfolio website. Upload your resume, generate structured content, customize the design, and share your work with confidence.",
  path: ROUTES.home,
  openGraph: {
    title: "Turn your resume into a portfolio that opens doors.",
    description:
      "Upload your resume and transform it into a clean, editable portfolio website with Dossier's portfolio studio.",
  },
})

export default function MarketingHomePage() {
  return <MarketingPage />
}
