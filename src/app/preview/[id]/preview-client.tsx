"use client"

import { useParams } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

import { DesignEngineProvider } from "@/context/DesignEngineContext"
import { PortfolioDesignSurface } from "@/components/portfolio/composer/PortfolioDesignSurface"
import { messages } from "@/config/messages"
import { readPreviewSession } from "@/lib/portfolio/previewSession"
import type { PreviewSessionPayload } from "@/lib/portfolio/previewSession"

export function PreviewPageClient() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const [payload, setPayload] = useState<PreviewSessionPayload | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    startTransition(() => {
      setPayload(readPreviewSession(id) ?? null)
    })
  }, [id])

  if (!id) {
    return <p className="p-8 text-center text-sm text-neutral-500">{messages.dossier.studio.previewInvalid}</p>
  }

  if (payload === undefined) {
    return <p className="p-8 text-center text-sm text-neutral-500">{messages.common.loading}</p>
  }

  if (payload === null || !payload.document || !payload.designConfig) {
    return <p className="p-8 text-center text-sm text-neutral-500">{messages.dossier.studio.previewMissing}</p>
  }

  return (
    <DesignEngineProvider value={{ document: payload.document, designConfig: payload.designConfig }}>
      <PortfolioDesignSurface standalone />
    </DesignEngineProvider>
  )
}
