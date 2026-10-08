"use client"

import { useActionState } from "react"
import Link from "next/link"

import { AuthField, AuthSubmit, FormBanner, useAuthToast } from "@/features/auth/components/AuthFields"
import { signUpWithCredentialsAction } from "@/features/auth/actions/auth.actions"
import { authFormInitialState } from "@/features/auth/auth-form-state"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signUpWithCredentialsAction, authFormInitialState)
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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.fieldErrors?.password}
        hint="At least 8 characters. Tap the eye to check what you typed."
        disabled={pending}
      />
      <FormBanner state={state} />
      <AuthSubmit pending={pending} pendingLabel="Creating your account">
        {messages.auth.signupSubmit}
      </AuthSubmit>
      <p className="text-center text-sm text-[var(--site-ink-2)]">
        {messages.auth.hasAccount}{" "}
        <Link href={ROUTES.login} className="font-semibold text-[var(--site-accent-ink)] underline underline-offset-4 hover:text-[var(--site-ink)]">
          {messages.auth.goLogin}
        </Link>
      </p>
    </form>
  )
}
