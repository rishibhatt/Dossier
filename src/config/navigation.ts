import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export type DashboardNavItem = {
  id: string
  href: (typeof ROUTES)[keyof typeof ROUTES]
  label: string
}

export const dashboardNavItems: readonly DashboardNavItem[] = [
  { id: "portfolios", href: ROUTES.dashboard, label: messages.dashboard.nav.portfolios },
  { id: "referrals", href: ROUTES.referrals, label: messages.dashboard.nav.referrals },
  { id: "billing", href: ROUTES.billing, label: messages.dashboard.nav.billing },
  { id: "settings", href: ROUTES.settings, label: messages.dashboard.nav.settings },
] as const
