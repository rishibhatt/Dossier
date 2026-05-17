import { AppSidebar } from "@/components/organisms/AppSidebar"
import { Button } from "@/components/ui/button"
import { messages } from "@/config/messages"
import { signOutAction } from "@/features/auth/actions/auth.actions"
import { cn } from "@/lib/utils"

type DashboardShellTemplateProps = {
  userEmail: string | null
  children: React.ReactNode
  className?: string
}

export function DashboardShellTemplate({ userEmail, children, className }: DashboardShellTemplateProps) {
  const footer = (
    <div className="space-y-3">
      <div className="typo-body-md text-muted-foreground">{userEmail ?? messages.common.loading}</div>
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" className="w-full">
          {messages.common.signOut}
        </Button>
      </form>
    </div>
  )

  return (
    <div className={cn("flex min-h-screen w-full bg-background", className)}>
      <AppSidebar footer={footer} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  )
}
