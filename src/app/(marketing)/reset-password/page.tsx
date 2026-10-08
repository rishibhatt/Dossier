import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/features/auth/components/AuthShell"
import { ResetPasswordForm } from "@/features/auth/components/PasswordResetForms"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const metadata: Metadata = buildPageMetadata({
  title: "Choose a new password — Dossier",
  description: "Set a new password for your Dossier account.",
  path: ROUTES.resetPassword,
  indexable: false,
})

export default async function ResetPasswordPage() {
  let signedIn = false
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    signedIn = Boolean(user)
  } catch {
    signedIn = false
  }

  // The reset link signs the person in for a moment. Without that session there is nothing to update.
  if (!signedIn) {
    return (
      <AuthShell title="That link has expired" subtitle={messages.auth.errors.linkExpired}>
        <Link href={ROUTES.forgotPassword} className="dx-btn dx-btn-primary h-12 w-full text-base">
          <span>{messages.auth.forgotSubmit}</span>
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={messages.auth.resetTitle} subtitle={messages.auth.resetSubtitle}>
      <ResetPasswordForm />
    </AuthShell>
  )
}
