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
import { signInWithCredentialsAction } from "@/features/auth/actions/auth.actions"

export function LoginForm() {
  const [state, action, pending] = useActionState(signInWithCredentialsAction, authFormInitialState)

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
              autoComplete="current-password"
              required
              placeholder={messages.auth.passwordPlaceholder}
            />
          </FieldContent>
        </Field>
      </FieldGroup>
      {state.error ? <FieldError>{state.error}</FieldError> : null}
      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {messages.auth.loginSubmit}
      </Button>
      <p className="typo-body-md text-muted-foreground">
        {messages.auth.noAccount}{" "}
        <Link href={ROUTES.signup} className="text-primary underline-offset-4 hover:underline">
          {messages.auth.goSignup}
        </Link>
      </p>
    </form>
  )
}
