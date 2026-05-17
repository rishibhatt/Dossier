"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { BrandLogo } from "@/components/atoms/BrandLogo"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { messages } from "@/config/messages"
import { dashboardNavItems } from "@/config/navigation"
import { cn } from "@/lib/utils"

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label={messages.dashboard.mobileNavTitle}>
      {dashboardNavItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "typo-body-md rounded-md px-3 py-2 transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

type AppSidebarProps = {
  footer?: React.ReactNode
}

export function AppSidebar({ footer }: AppSidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <BrandLogo className="typo-h3 text-sidebar-foreground" />
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <NavLinks />
        </ScrollArea>
        {footer ? (
          <div className="border-t border-sidebar-border p-3">
            <Separator className="mb-3 bg-sidebar-border" />
            {footer}
          </div>
        ) : null}
      </aside>

      <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
        <Sheet>
          <SheetTrigger
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            aria-label={messages.dashboard.sidebarToggle}
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border px-4 py-3 text-left">
              <SheetTitle className="typo-h3">{messages.common.appName}</SheetTitle>
            </SheetHeader>
            <div className="px-3 py-4">
              <NavLinks />
            </div>
            {footer ? <div className="border-t border-border px-3 py-4">{footer}</div> : null}
          </SheetContent>
        </Sheet>
        <BrandLogo className="min-w-0 flex-1 truncate" />
      </div>
    </>
  )
}
