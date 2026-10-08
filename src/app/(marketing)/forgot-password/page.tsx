import type { Metadata } from "next"

import { AuthShell } from "@/features/auth/components/AuthShell"
import { ForgotPasswordForm } from "@/features/auth/components/PasswordResetForms"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Reset your password — Dossier",
  description: "Get a link to choose a new Dossier password.",
  path: ROUTES.forgotPassword,
  indexable: false,
})

export default function ForgotPasswordPage() {
  return (
    <AuthShell title={messages.auth.forgotTitle} subtitle={messages.auth.forgotSubtitle}>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
