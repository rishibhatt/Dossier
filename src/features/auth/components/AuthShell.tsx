import { AlertCircle, Info } from "lucide-react"

import { AuthArt } from "@/features/auth/components/AuthArt"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
  /** Heads-up from a redirect, such as an expired link. */
  notice?: string
  /** Neutral context, such as "checkout is not open yet" or an invite. */
  info?: string
  className?: string
}

const display = { fontFamily: "var(--site-display)" } as const

/** Shared frame for sign in, sign up and password reset: one ruled sheet, form left, reminder of the value right. */
export function AuthShell({ title, subtitle, children, notice, info, className }: AuthShellProps) {
  return (
    <div className={cn("site-wrap py-6 sm:py-10 lg:py-14", className)}>
      <div className="mx-auto grid max-w-[68rem] border border-[var(--site-ink)] bg-[var(--site-sheet)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12">
          <div className="w-full max-w-sm">
            <h1 className="text-[clamp(1.875rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]" style={display}>
              {title}
            </h1>
            <p className="mt-3 text-[0.9375rem] text-[var(--site-ink-2)]">{subtitle}</p>
            {notice ? (
              <p role="alert" className="mt-6 flex gap-2.5 border border-[#efb4ad] bg-[#fff5f3] px-4 py-3 text-sm font-medium text-[#7a2a22]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {notice}
              </p>
            ) : null}
            {info ? (
              <p role="status" className="mt-6 flex gap-2.5 border border-[var(--site-rule-strong)] bg-[var(--site-accent-wash)] px-4 py-3 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
                {info}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-6">{children}</div>
          </div>
        </div>
        <AuthArt />
      </div>
    </div>
  )
}
