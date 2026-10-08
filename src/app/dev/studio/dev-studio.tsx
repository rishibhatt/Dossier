"use client"

import { useEffect, useState } from "react"

import { SAMPLE_RICH } from "@/app/dev/templates/sampleDocument"
import { PortfolioStudioView } from "@/features/dossier/components/PortfolioStudioView"
import { buildConfigFromTemplate, recommendTemplates } from "@/lib/design/templates"
import { inferUserType } from "@/lib/design/inferType"
import { portfolioDocumentToParsedResume } from "@/lib/parseResume"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"

export function DevStudio() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const parsed = portfolioDocumentToParsedResume(SAMPLE_RICH, inferUserType(SAMPLE_RICH))
    const top = recommendTemplates(parsed, undefined, 1)[0]
    const config = buildConfigFromTemplate(parsed, top!.template.id, 7)
    usePortfolioStore.getState().hydratePortfolio(SAMPLE_RICH, config, undefined, parsed)
    useDossierStore.getState().updatePortfolio(SAMPLE_RICH)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
  }, [])

  return ready ? <PortfolioStudioView onStartOver={() => undefined} /> : null
}
