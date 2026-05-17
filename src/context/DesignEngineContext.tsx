"use client"

import { createContext, useContext, type PropsWithChildren } from "react"

import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument } from "@/types/dossier"

export type DesignEngineValue = {
  document: PortfolioDocument
  designConfig: DesignConfig
}

const DesignEngineContext = createContext<DesignEngineValue | null>(null)

export function DesignEngineProvider({
  value,
  children,
}: PropsWithChildren<{ value: DesignEngineValue }>) {
  return <DesignEngineContext.Provider value={value}>{children}</DesignEngineContext.Provider>
}

export function useDesignEngine(): DesignEngineValue {
  const ctx = useContext(DesignEngineContext)
  if (!ctx) {
    throw new Error("useDesignEngine must be used within DesignEngineProvider")
  }
  return ctx
}
