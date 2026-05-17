import { DashboardShellTemplate } from "@/components/templates/DashboardShellTemplate"
import { devUser } from "@/config/devUser"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let email: string = devUser.email

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.email) {
      email = user.email
    }
  } catch {
    /* Supabase optional while bypassing auth */
  }

  return <DashboardShellTemplate userEmail={email}>{children}</DashboardShellTemplate>
}
