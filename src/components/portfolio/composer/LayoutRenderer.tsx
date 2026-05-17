"use client"

import type { PropsWithChildren } from "react"

import { AsymmetricLayout } from "@/components/layouts/AsymmetricLayout"
import { CenteredLayout } from "@/components/layouts/CenteredLayout"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { useDesignEngine } from "@/context/DesignEngineContext"
import { layoutTypeToShellKey } from "@/lib/designEngine"

const map = {
  sidebar: SidebarLayout,
  centered: CenteredLayout,
  asymmetric: AsymmetricLayout,
} as const

export function LayoutRenderer({ children }: PropsWithChildren) {
  const { designConfig } = useDesignEngine()
  const shell = layoutTypeToShellKey(designConfig.layout.type)
  const Layout = map[shell] ?? CenteredLayout
  return <Layout>{children}</Layout>
}
