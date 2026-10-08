"use client"

import { useEffect, useId, useState } from "react"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import type { AuthFormState } from "@/features/auth/auth-form-state"
import { cn } from "@/lib/utils"

type AuthFieldProps = {
  name: string
  label: string
  type?: React.HTMLInputTypeAttribute
  autoComplete?: string
  placeholder?: string
  defaultValue?: string
  error?: string
  hint?: React.ReactNode
  labelAside?: React.ReactNode
  required?: boolean
  disabled?: boolean
}

const inputClass = "dx-field"

export function AuthField({ name, label, type = "text", autoComplete, placeholder, defaultValue, error, hint, labelAside, required = true, disabled }: AuthFieldProps) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-[var(--site-ink)]">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(inputClass, isPassword && "pr-12")}
          autoCapitalize={type === "email" ? "none" : undefined}
          spellCheck={type === "email" ? false : undefined}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-lg text-[var(--site-ink-2)] transition-colors hover:bg-black/[0.06] hover:text-[var(--site-ink)] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[var(--site-accent-ink)]"
          >
            {revealed ? <EyeOff className="size-[1.125rem]" aria-hidden /> : <Eye className="size-[1.125rem]" aria-hidden />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-[#b42318]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm text-[var(--site-ink-2)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function AuthSubmit({ pending, children, pendingLabel }: { pending: boolean; children: React.ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className="dx-btn dx-btn-primary h-12 w-full text-base disabled:cursor-wait">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  )
}

/** Inline result for the whole form. Errors are red, success is calm and neutral. */
export function FormBanner({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <p role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#efb4ad] bg-[#fff5f3] px-4 py-3 text-sm font-medium text-[#7a2a22]">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#b42318]" aria-hidden />
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p role="status" className="flex items-start gap-2.5 rounded-xl border border-[var(--site-rule-strong)] bg-white px-4 py-3 text-sm font-medium">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
        {state.success}
      </p>
    )
  }
  return null
}

/** Fires one toast per server result (the nonce changes on every submit). */
export function useAuthToast(state: AuthFormState) {
  useEffect(() => {
    if (!state.nonce) return
    if (state.error) toast.error(state.error)
    else if (state.success) toast.success(state.success)
  }, [state.nonce, state.error, state.success])
}
