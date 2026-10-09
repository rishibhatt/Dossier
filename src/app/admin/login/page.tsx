import { redirect } from "next/navigation"

import { Logo } from "@/components/marketing/primitives"
import { getAdminState } from "@/lib/admin/auth"

import { AdminLoginForm } from "./AdminLoginForm"

export default async function AdminLoginPage() {
  const state = await getAdminState()
  if (state.status === "ok") redirect("/admin")
  if (state.status === "needs_mfa") redirect("/admin/mfa")

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-md content-center gap-8 px-5 py-12">
      <Logo />
      <div>
        <p className="sp-data">Admin / Sign in</p>
        <h1 className="site-h2 mt-2">Console</h1>
        <p className="site-body mt-2">Admins only. After your password you will be asked for the code from your authenticator app.</p>
      </div>
      <AdminLoginForm />
    </main>
  )
}
