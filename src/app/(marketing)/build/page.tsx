import type { Metadata } from "next"

import "@/styles/build-flow.css"
import { DossierPortfolioWorkspace } from "@/features/dossier/components/DossierPortfolioWorkspace"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.buildTitle,
  description: messages.seo.buildDescription,
  path: ROUTES.build,
  // Behind sign-in: a visitor from search would land on the signup wall. Not disallowed in robots.txt, so
  // crawlers can still see this and drop the URL Google indexed earlier.
  indexable: false,
})

export default function BuildPortfolioPage() {
  return (
    <main className="workspace-redesign site">
      <DossierPortfolioWorkspace />
    </main>
  )
}
