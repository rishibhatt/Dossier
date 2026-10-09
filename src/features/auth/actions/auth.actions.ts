"use server"

import type { User } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { after } from "next/server"

import { messages } from "@/config/messages"
import { siteConfig } from "@/config/site"
import { clientIpFromHeaders } from "@/lib/api/guard"
import { safeNextPath } from "@/lib/auth/safeNext"
import { notifyAfterAuth, notifyPasswordChanged } from "@/lib/email/events"
import { captureReferralAfterAuth } from "@/lib/referrals/server"
import { ROUTES } from "@/lib/constants/routes"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { emailSchema, loginSchema, passwordSchema, signupSchema } from "@/lib/validations/auth"
import { signInWithPassword, signOut, signUpWithPassword } from "@/services/api/auth.service"

import type { AuthFormState } from "@/features/auth/auth-form-state"

const e = messages.auth.errors

type FieldErrors = Record<string, string[] | undefined> | undefined

/** First message per field, so each input can show its own problem. */
function toFieldErrors(errors: FieldErrors): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, list] of Object.entries(errors ?? {})) {
    if (list?.[0]) out[key] = list[0]
  }
  return out
}

function invalid(errors: FieldErrors, email?: string): AuthFormState {
  const fieldErrors = toFieldErrors(errors)
  return {
    error: Object.values(fieldErrors)[0] ?? e.generic,
    fieldErrors,
    email,
    nonce: Date.now(),
  }
}

type SupabaseLikeError = { message?: string; status?: number; code?: string } | null | undefined

/** Maps Supabase auth errors to plain-language messages. */
function describeAuthError(error: SupabaseLikeError, fallback: string): string {
  const msg = (error?.message ?? "").toLowerCase()
  const code = error?.code ?? ""
  if (error?.status === 429 || code === "over_request_rate_limit" || code === "over_email_send_rate_limit") return e.tooManyAttempts
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) return e.emailNotConfirmed
  if (code === "user_already_exists" || msg.includes("already registered") || msg.includes("already been registered")) return e.emailTaken
  if (code === "weak_password" || msg.includes("password should")) return e.weakPassword
  if (msg.includes("fetch failed") || msg.includes("network")) return e.network
  return fallback
}

/** Attach a pending invite (dx_ref cookie) to a freshly signed-in account. Best effort, never throws. */
async function captureReferral(user: User) {
  try {
    const [cookieStore, headerList] = await Promise.all([cookies(), headers()])
    await captureReferralAfterAuth({ user, cookies: cookieStore, ip: clientIpFromHeaders(headerList) })
  } catch {
    /* Sign in must succeed even if attribution fails. */
  }
}

async function getClientOrNull() {
  try {
    return await createServerSupabaseClient()
  } catch {
    return null
  }
}

export async function signInWithCredentialsAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim()
  const next = safeNextPath(String(formData.get("next") ?? ""))

  const parsed = loginSchema.safeParse({ email, password: formData.get("password") })
  if (!parsed.success) return invalid(parsed.error.flatten().fieldErrors, email)

  const supabase = await getClientOrNull()
  if (!supabase) return { error: e.notConfigured, email, nonce: Date.now() }

  let failure: string | null = null
  try {
    const { error } = await signInWithPassword(supabase, parsed.data)
    if (error) failure = describeAuthError(error as SupabaseLikeError, e.invalidCredentials)
  } catch {
    failure = e.network
  }
  if (failure) return { error: failure, email, nonce: Date.now() }

  // First sign in after confirming an email may still carry an invite cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await captureReferral(user)
    after(() => notifyAfterAuth(user))
  }

  revalidatePath(ROUTES.dashboard, "layout")
  redirect(next)
}

export async function signUpWithCredentialsAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim()
  const next = safeNextPath(String(formData.get("next") ?? ""))

  const parsed = signupSchema.safeParse({
    email,
    password: formData.get("password"),
  })
  if (!parsed.success) return invalid(parsed.error.flatten().fieldErrors, email)

  const supabase = await getClientOrNull()
  if (!supabase) return { error: e.notConfigured, email, nonce: Date.now() }

  try {
    const { error } = await signUpWithPassword(supabase, { email: parsed.data.email, password: parsed.data.password })
    if (error) return { error: describeAuthError(error as SupabaseLikeError, e.generic), email, nonce: Date.now() }
  } catch {
    return { error: e.network, email, nonce: Date.now() }
  }

  // With email confirmation on, there is no session yet: tell the person to check their inbox.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: null, success: messages.auth.successSignedUp, email, nonce: Date.now() }
  }

  await captureReferral(user)
  after(() => notifyAfterAuth(user))
  revalidatePath(ROUTES.dashboard, "layout")
  redirect(next)
}

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim()
  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    return { error: e.invalidEmail, fieldErrors: { email: e.invalidEmail }, email, nonce: Date.now() }
  }

  const supabase = await getClientOrNull()
  if (!supabase) return { error: e.notConfigured, email, nonce: Date.now() }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${siteConfig.url}${ROUTES.authCallback}?next=${encodeURIComponent(ROUTES.resetPassword)}`,
    })
    if (error) {
      const known = describeAuthError(error, "")
      // Anything except a rate limit gets the same answer, so the form never reveals which emails have accounts.
      if (known === e.tooManyAttempts || known === e.network) return { error: known, email, nonce: Date.now() }
    }
  } catch {
    return { error: e.network, email, nonce: Date.now() }
  }

  return { error: null, success: messages.auth.successResetSent, email, nonce: Date.now() }
}

export async function updatePasswordAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")

  const parsed = passwordSchema.safeParse(password)
  if (!parsed.success) {
    return { error: e.weakPassword, fieldErrors: { password: e.weakPassword }, nonce: Date.now() }
  }
  if (password !== confirm) {
    return { error: e.passwordMismatch, fieldErrors: { confirmPassword: e.passwordMismatch }, nonce: Date.now() }
  }

  const supabase = await getClientOrNull()
  if (!supabase) return { error: e.notConfigured, nonce: Date.now() }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: e.linkExpired, nonce: Date.now() }

  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: describeAuthError(error, e.generic), nonce: Date.now() }
  } catch {
    return { error: e.network, nonce: Date.now() }
  }

  after(() => notifyPasswordChanged(user))
  revalidatePath(ROUTES.dashboard, "layout")
  redirect(ROUTES.dashboard)
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await signOut(supabase)
  revalidatePath("/", "layout")
  redirect(ROUTES.login)
}
