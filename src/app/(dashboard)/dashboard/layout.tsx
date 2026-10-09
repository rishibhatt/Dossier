import { redirect } from "next/navigation"

import { DashboardShellTemplate } from "@/components/templates/DashboardShellTemplate"
import { devUser } from "@/config/devUser"
import { UpgradeSheet } from "@/features/billing/UpgradeSheet"
import { ROUTES } from "@/lib/constants/routes"
import { getDashboardContext } from "@/lib/dashboard/context"

export default async function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const ctx = await getDashboardContext()
  let email = ctx.email

  if (!email) {
    // The demo identity exists for local development without Supabase only.
    if (process.env.NODE_ENV === "production") redirect(ROUTES.login)
    email = devUser.email
  }

  return (
    <DashboardShellTemplate
      userEmail={email}
      plan={ctx.plan}
      shufflesUsed={ctx.shufflesUsed}
      shuffleLimit={ctx.limits.daily.regenerate + ctx.shuffleBonus}
    >
      {children}
      <UpgradeSheet />
    </DashboardShellTemplate>
  )
}
