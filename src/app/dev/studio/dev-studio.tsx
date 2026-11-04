"use client"

import { useEffect, useState } from "react"

import { WORK_SECTIONS } from "@/app/dev/studio/workSample"
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
    // ?ask: open as if the build could not tell the profession, to check the field question.
    const ask = new URLSearchParams(window.location.search).has("ask")
    const base = ask ? { ...SAMPLE_RICH, portfolioMeta: { ...SAMPLE_RICH.portfolioMeta!, profession: "product-manager", professionAsk: true } } : SAMPLE_RICH
    // ?work: every profession section, filled, before Contact.
    const work = new URLSearchParams(window.location.search).has("work")
    const doc = work ? { ...base, sections: [...base.sections.slice(0, -1), ...WORK_SECTIONS, ...base.sections.slice(-1)] } : base
    usePortfolioStore.getState().hydratePortfolio(doc, config, undefined, parsed)
    useDossierStore.getState().updatePortfolio(doc)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
  }, [])

  return ready ? <PortfolioStudioView onStartOver={() => undefined} /> : null
}
