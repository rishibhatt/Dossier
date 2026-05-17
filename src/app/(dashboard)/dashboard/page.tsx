import type { Metadata } from "next"

import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.dashboardTitle,
  description: messages.seo.dashboardDescription,
  path: ROUTES.dashboard,
  indexable: false,
})

export default function DashboardHomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="typo-h1">{messages.dashboard.overviewTitle}</h1>
        <p className="typo-body-md text-muted-foreground">{messages.dashboard.overviewDescription}</p>
      </div>
    </div>
  )
}
