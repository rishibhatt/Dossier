"use client"

import { usePathname } from "next/navigation"

import { MarketingNavbar } from "@/components/organisms/MarketingNavbar"
import { MarketingSiteFooter } from "@/features/landing/components/MarketingSiteFooter"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

type MarketingLayoutTemplateProps = {
  children: React.ReactNode
  className?: string
}

/** Portfolio studio (`/build`) uses its own full-height chrome — skip marketing nav + footer. */
export function MarketingLayoutTemplate({ children, className }: MarketingLayoutTemplateProps) {
  const pathname = usePathname()
  const pageOwnsChrome =
    pathname === ROUTES.home || pathname === ROUTES.build || pathname?.startsWith(`${ROUTES.build}/`)

  if (pageOwnsChrome) {
    return <div className={cn("min-h-dvh bg-background", className)}>{children}</div>
  }

  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <MarketingNavbar />
      <div className="flex flex-1 flex-col pt-[var(--marketing-nav-height)]">{children}</div>
      <MarketingSiteFooter />
    </div>
  )
}
