"use client"

import Link from "next/link"
import { Menu } from "lucide-react"

import { BrandMark } from "@/components/atoms/BrandMark"
import { LinkButton } from "@/components/atoms/LinkButton"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { messages } from "@/config/messages"
import { marketingNav } from "@/config/navigation"
import { LandingAnchorNav } from "@/features/landing/components/LandingAnchorNav"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

type MarketingNavbarProps = {
  className?: string
}

export function MarketingNavbar({ className }: MarketingNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 z-50 flex min-h-[var(--marketing-nav-height)] w-full items-center border-b border-outline-variant bg-surface-container-lowest/92 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-surface-container-lowest/86",
        className
      )}
    >
      <div className="mx-auto flex min-h-[var(--marketing-nav-height)] w-full max-w-(--container-landing) items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-8">
          <Sheet>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "shrink-0 md:hidden")}
              aria-label={messages.dashboard.sidebarToggle}
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-4 py-4 text-left">
                <SheetTitle className="typo-h3">{messages.common.appName}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4" aria-label={messages.common.primaryNavAria}>
                {marketingNav.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-md px-3 py-2 typo-body-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <BrandMark priority variant="marketing" />
          <LandingAnchorNav />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LinkButton href={ROUTES.login} variant="ghost" size="sm" className="max-sm:hidden">
            {messages.marketing.navSignIn}
          </LinkButton>
          <LinkButton href={ROUTES.signup} size="sm">
            {messages.marketing.navGetStarted}
          </LinkButton>
        </div>
      </div>
    </header>
  )
}
