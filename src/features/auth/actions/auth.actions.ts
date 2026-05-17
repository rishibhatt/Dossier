"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { loginSchema, signupSchema } from "@/lib/validations/auth"
import { signInWithPassword, signOut, signUpWithPassword } from "@/services/api/auth.service"

import type { AuthFormState } from "@/features/auth/auth-form-state"

function firstErrorMessage(errors: Record<string, string[] | undefined> | undefined) {
  if (!errors) {
    return messages.auth.errors.generic
  }
  const firstKey = Object.keys(errors)[0]
  const first = firstKey ? errors[firstKey]?.[0] : undefined
  return first ?? messages.auth.errors.generic
}

export async function signInWithCredentialsAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error.flatten().fieldErrors) }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await signInWithPassword(supabase, parsed.data)

  if (error) {
    return { error: messages.auth.errors.invalidCredentials }
  }

  revalidatePath(ROUTES.dashboard, "layout")
  redirect(ROUTES.dashboard)
}

export async function signUpWithCredentialsAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error.flatten().fieldErrors) }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await signUpWithPassword(supabase, {
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: messages.auth.errors.generic }
  }

  revalidatePath(ROUTES.dashboard, "layout")
  redirect(ROUTES.dashboard)
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await signOut(supabase)
  revalidatePath("/", "layout")
  redirect(ROUTES.login)
}
