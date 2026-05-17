import type { Metadata } from "next"

import { DossierPortfolioWorkspace } from "@/features/dossier/components/DossierPortfolioWorkspace"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.buildTitle,
  description: messages.seo.buildDescription,
  path: ROUTES.build,
})

export default function BuildPortfolioPage() {
  return (
    <main className="workspace-redesign">
      <DossierPortfolioWorkspace />
    </main>
  )
}
