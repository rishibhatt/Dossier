import { Suspense } from "react"

import { LivePreviewClient } from "@/app/live-preview/live-preview-client"

export default function LivePreviewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>}>
      <LivePreviewClient />
    </Suspense>
  )
}
