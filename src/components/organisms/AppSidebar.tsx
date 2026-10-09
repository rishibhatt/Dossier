"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, Gift, LayoutGrid, Settings } from "lucide-react"

import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const NAV = [
  { id: "portfolios", href: ROUTES.dashboard, label: messages.dashboard.nav.portfolios, Icon: LayoutGrid },
  { id: "referrals", href: ROUTES.referrals, label: messages.dashboard.nav.referrals, Icon: Gift },
  { id: "billing", href: ROUTES.billing, label: messages.dashboard.nav.billing, Icon: CreditCard },
  { id: "settings", href: ROUTES.settings, label: messages.dashboard.nav.settings, Icon: Settings },
] as const

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => (href === ROUTES.dashboard ? pathname === href : pathname.startsWith(href))
}

type AppSidebarProps = {
  /** Plan chip and usage, shown at the foot of the desktop sidebar. */
  footer?: React.ReactNode
}

/** Desktop: sticky sidebar. Below `md`: a fixed bottom tab bar (the top bar lives in the shell). */
export function AppSidebar({ footer }: AppSidebarProps) {
  const isActive = useIsActive()

  return (
    <>
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col border-r border-[var(--site-rule)] bg-[var(--site-paper-deep)]/60 md:flex">
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ id, href, label, Icon }) => {
              const active = isActive(href)
              return (
                <li key={id}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-white text-[var(--site-ink)] shadow-[inset_0_0_0_1px_var(--site-rule-strong)]"
                        : "text-[var(--site-ink-2)] hover:bg-black/[0.05] hover:text-[var(--site-ink)]"
                    )}
                  >
                    <Icon className={cn("size-[1.125rem] shrink-0", active && "text-[var(--site-accent-ink)]")} aria-hidden />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        {footer ? <div className="p-3">{footer}</div> : null}
      </aside>

      <nav
        aria-label="Dashboard"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--site-rule-strong)] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ id, href, label, Icon }) => {
            const active = isActive(href)
            return (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors",
                    active ? "text-[var(--site-accent-ink)]" : "text-[var(--site-ink-2)] hover:text-[var(--site-ink)]"
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
