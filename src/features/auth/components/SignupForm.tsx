"use client"

import { useActionState } from "react"
import Link from "next/link"

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { authFormInitialState } from "@/features/auth/auth-form-state"
import { signUpWithCredentialsAction } from "@/features/auth/actions/auth.actions"

export function SignupForm() {
  const [state, action, pending] = useActionState(signUpWithCredentialsAction, authFormInitialState)

  return (
    <form action={action} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{messages.auth.emailLabel}</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={messages.auth.emailPlaceholder}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">{messages.auth.passwordLabel}</FieldLabel>
          <FieldContent>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder={messages.auth.passwordPlaceholder}
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">{messages.auth.confirmPasswordLabel}</FieldLabel>
          <FieldContent>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder={messages.auth.passwordPlaceholder}
            />
          </FieldContent>
        </Field>
      </FieldGroup>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {messages.auth.signupSubmit}
      </Button>
      <p className="typo-body-md text-muted-foreground">
        {messages.auth.hasAccount}{" "}
        <Link href={ROUTES.login} className="text-primary underline-offset-4 hover:underline">
          {messages.auth.goLogin}
        </Link>
      </p>
    </form>
  )
}
