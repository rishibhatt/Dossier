import { notFound, redirect } from "next/navigation"

import { Logo } from "@/components/marketing/primitives"
import { getAdminState } from "@/lib/admin/auth"

import { MfaPanel } from "./MfaPanel"

export default async function AdminMfaPage() {
  const state = await getAdminState()
  if (state.status === "anon") redirect("/admin/login")
  if (state.status === "forbidden") notFound()
  if (state.status === "ok") redirect("/admin")

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-md content-center gap-8 px-5 py-12">
      <Logo />
      <div>
        <p className="sp-data">Admin / Second step</p>
        <h1 className="site-h2 mt-2">Authenticator code</h1>
      </div>
      <MfaPanel />
    </main>
  )
}
