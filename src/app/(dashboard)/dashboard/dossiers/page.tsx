import type { Metadata } from "next"

import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.dossiersTitle,
  description: messages.seo.dossiersDescription,
  path: ROUTES.dossiers,
  indexable: false,
})

export default function DossiersPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <h1 className="typo-h1">{messages.dashboard.nav.dossiers}</h1>
      <p className="typo-body-md text-muted-foreground">{messages.seo.dossiersDescription}</p>
    </div>
  )
}
