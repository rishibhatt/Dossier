"use client"

import { useParams } from "next/navigation"
import { startTransition, useEffect, useState } from "react"

import { PortfolioView } from "@/components/portfolio/page/PortfolioView"
import { messages } from "@/config/messages"
import { readPreviewSession, type PreviewSessionPayload } from "@/lib/portfolio/previewSession"

export function PreviewPageClient() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const [payload, setPayload] = useState<PreviewSessionPayload | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    startTransition(() => setPayload(readPreviewSession(id) ?? null))
  }, [id])

  const note = (text: string) => <p className="p-8 text-center text-sm text-neutral-500">{text}</p>
  if (!id) return note(messages.dossier.studio.previewInvalid)
  if (payload === undefined) return note(messages.common.loading)
  if (!payload?.document || !payload.designConfig) return note(messages.dossier.studio.previewMissing)

  return (
    <PortfolioView
      document={payload.document}
      config={payload.designConfig}
      hidden={payload.hiddenSectionIds ?? []}
      surfaces={payload.sectionSurfaceOverrides}
      credit={{ show: payload.credit !== "none" }}
    />
  )
}
