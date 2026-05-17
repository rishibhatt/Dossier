import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export type DashboardNavItem = {
  id: string
  href: (typeof ROUTES)[keyof typeof ROUTES]
  label: string
}

export const marketingNav = [
  { id: "features", href: `${ROUTES.home}#features`, label: messages.marketing.navFeatures },
  { id: "how", href: `${ROUTES.home}#how-it-works`, label: messages.marketing.navHowItWorks },
  { id: "about", href: `${ROUTES.home}#about`, label: messages.marketing.navAbout },
] as const satisfies readonly { id: string; href: string; label: string }[]

export const dashboardNavItems: readonly DashboardNavItem[] = [
  { id: "overview", href: ROUTES.dashboard, label: messages.dashboard.nav.overview },
  { id: "dossiers", href: ROUTES.dossiers, label: messages.dashboard.nav.dossiers },
  { id: "projects", href: ROUTES.projects, label: messages.dashboard.nav.projects },
  { id: "activity", href: ROUTES.activity, label: messages.dashboard.nav.activity },
  { id: "settings", href: ROUTES.settings, label: messages.dashboard.nav.settings },
] as const
