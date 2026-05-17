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

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, messages.auth.errors.generic),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: messages.auth.errors.passwordMismatch,
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
