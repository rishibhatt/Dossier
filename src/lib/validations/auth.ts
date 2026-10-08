import { z } from "zod"

import { messages } from "@/config/messages"

export const emailSchema = z
  .string()
  .trim()
  .min(1, messages.auth.errors.invalidEmail)
  .email(messages.auth.errors.invalidEmail)

export const passwordSchema = z
  .string()
  .min(8, messages.auth.errors.weakPassword)

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, messages.auth.errors.generic),
})

/** One password field with a show toggle: no confirm field to retype. */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
