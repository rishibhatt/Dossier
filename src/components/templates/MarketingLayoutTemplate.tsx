"use client"

import { usePathname } from "next/navigation"

import { SiteFooter } from "@/components/marketing/SiteFooter"
import { SiteHeader } from "@/components/marketing/SiteHeader"
import { SmoothScroll } from "@/components/marketing/motion/SmoothScroll"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

type MarketingLayoutTemplateProps = {
  children: React.ReactNode
  className?: string
}

/** The builder (`/build`) has its own full-height chrome. Every other public page gets the site shell. */
export function MarketingLayoutTemplate({ children, className }: MarketingLayoutTemplateProps) {
  const pathname = usePathname()
  const builderOwnsChrome = pathname === ROUTES.build || pathname?.startsWith(`${ROUTES.build}/`)

  if (builderOwnsChrome) {
    return <div className={cn("min-h-dvh bg-background", className)}>{children}</div>
  }

  return (
    <div className={cn("site flex min-h-dvh flex-col", className)}>
      <SmoothScroll />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
