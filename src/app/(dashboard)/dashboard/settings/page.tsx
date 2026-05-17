import type { Metadata } from "next"

import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.settingsTitle,
  description: messages.seo.settingsDescription,
  path: ROUTES.settings,
  indexable: false,
})

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <h1 className="typo-h1">{messages.dashboard.nav.settings}</h1>
      <p className="typo-body-md text-muted-foreground">{messages.seo.settingsDescription}</p>
    </div>
  )
}
