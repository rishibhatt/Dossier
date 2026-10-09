"use client"

import { useActionState } from "react"
import Link from "next/link"

import { AuthField, AuthSubmit, FormBanner, useAuthToast } from "@/features/auth/components/AuthFields"
import { signInWithCredentialsAction } from "@/features/auth/actions/auth.actions"
import { authFormInitialState } from "@/features/auth/auth-form-state"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInWithCredentialsAction, authFormInitialState)
  useAuthToast(state)

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
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
      <AuthField
        name="password"
        label={messages.auth.passwordLabel}
        type="password"
        autoComplete="current-password"
        placeholder={messages.auth.passwordPlaceholder}
        error={state.fieldErrors?.password}
        disabled={pending}
        labelAside={
          <Link href={ROUTES.forgotPassword} className="text-sm font-medium text-[var(--site-ink-2)] underline underline-offset-4 decoration-[var(--site-rule-strong)] hover:text-[var(--site-ink)] hover:decoration-[var(--site-ink)]">
            {messages.auth.forgotLink}
          </Link>
        }
      />
      <FormBanner state={state} />
      <AuthSubmit pending={pending} pendingLabel="Signing in…">
        {messages.auth.loginSubmit}
      </AuthSubmit>
      <p className="text-center text-sm text-[var(--site-ink-2)]">
        {messages.auth.noAccount}{" "}
        <Link href={ROUTES.signup} className="font-semibold text-[var(--site-accent-ink)] underline underline-offset-4 hover:text-[var(--site-ink)]">
          {messages.auth.goSignup}
        </Link>
      </p>
    </form>
  )
}
