"use client"

import { useActionState } from "react"
import Link from "next/link"

import { AuthField, AuthSubmit, FormBanner, useAuthToast } from "@/features/auth/components/AuthFields"
import { requestPasswordResetAction, updatePasswordAction } from "@/features/auth/actions/auth.actions"
import { authFormInitialState } from "@/features/auth/auth-form-state"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, authFormInitialState)
  useAuthToast(state)

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <AuthField
        name="email"
        label={messages.auth.emailLabel}
        type="email"
        autoComplete="email"
        placeholder={messages.auth.emailPlaceholder}
        defaultValue={state.email}
        error={state.fieldErrors?.email}
        disabled={pending}
      />
      <FormBanner state={state} />
      <AuthSubmit pending={pending} pendingLabel="Sending…">
        {messages.auth.forgotSubmit}
      </AuthSubmit>
      <p className="text-center text-sm">
        <Link href={ROUTES.login} className="font-semibold text-[var(--site-accent-ink)] underline underline-offset-4 hover:text-[var(--site-ink)]">
          {messages.auth.backToLogin}
        </Link>
      </p>
    </form>
  )
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, authFormInitialState)
  useAuthToast(state)

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <AuthField
        name="password"
        label={messages.auth.newPasswordLabel}
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.fieldErrors?.password}
        disabled={pending}
      />
      <AuthField
        name="confirmPassword"
        label={messages.auth.confirmPasswordLabel}
        type="password"
        autoComplete="new-password"
        placeholder="Type it again"
        error={state.fieldErrors?.confirmPassword}
        disabled={pending}
      />
      <FormBanner state={state} />
      <AuthSubmit pending={pending} pendingLabel="Saving…">
        {messages.auth.resetSubmit}
      </AuthSubmit>
    </form>
  )
}
