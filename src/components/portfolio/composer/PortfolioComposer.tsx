"use client"

import type { ReactNode } from "react"

import { PortfolioDesignSurface } from "@/components/portfolio/composer/PortfolioDesignSurface"
import type { CreditMode } from "@/components/portfolio/DossierCredit"
import { DesignEngineProvider } from "@/context/DesignEngineContext"
import { usePortfolioStore } from "@/store/usePortfolioStore"

type PortfolioComposerProps = {
  standalone?: boolean
  /** Legacy slot after the last section. Prefer `credit`. */
  footer?: ReactNode
  /** "free" (default) shows "Made with Dossier"; "none" hides it (paid plans). */
  credit?: CreditMode
  /** Studio: open the upgrade sheet when the credit is clicked. */
  onCreditClick?: () => void
}

/** Store-bound portfolio renderer used by the studio canvas. */
export function PortfolioComposer({ standalone, footer, credit, onCreditClick }: PortfolioComposerProps) {
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  if (!document || !designConfig) return null
  return (
    <DesignEngineProvider value={{ document, designConfig }}>
      <PortfolioDesignSurface standalone={standalone} footer={footer} credit={credit} onCreditClick={onCreditClick} />
    </DesignEngineProvider>
  )
}
