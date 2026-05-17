import type { Metadata } from "next"

import { PreviewPageClient } from "@/app/preview/[id]/preview-client"
import { messages } from "@/config/messages"

export const metadata: Metadata = {
  title: messages.dossier.studio.previewTitle,
  robots: { index: false, follow: false },
}

export default function PreviewPortfolioPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <PreviewPageClient />
    </main>
  )
}
