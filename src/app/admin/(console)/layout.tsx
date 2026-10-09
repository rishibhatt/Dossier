import { Logo } from "@/components/marketing/primitives"
import { requireAdmin } from "@/lib/admin/auth"

import { adminSignOutAction } from "../actions"
import { AdminNav } from "./AdminNav"

/** Every console page passes through here: signed in, on the admin list, and past the authenticator code. */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-[var(--site-ink)] bg-[var(--site-paper)]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="sp-data border border-[var(--site-ink)] px-1.5 py-0.5">Admin</span>
          </div>
          <form action={adminSignOutAction} className="flex items-center gap-3 text-sm">
            <span className="hidden text-[var(--site-ink-2)] sm:inline">{user.email}</span>
            <button type="submit" className="min-h-11 underline underline-offset-4 hover:text-[var(--site-accent-ink)]">
              Sign out
            </button>
          </form>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
