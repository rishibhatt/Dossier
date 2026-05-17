import type { Metadata } from "next"

import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.projectsTitle,
  description: messages.seo.projectsDescription,
  path: ROUTES.projects,
  indexable: false,
})

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <h1 className="typo-h1">{messages.dashboard.nav.projects}</h1>
      <p className="typo-body-md text-muted-foreground">{messages.seo.projectsDescription}</p>
    </div>
  )
}
