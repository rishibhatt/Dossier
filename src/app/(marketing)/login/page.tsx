import type { Metadata } from "next"

import { AuthShell } from "@/features/auth/components/AuthShell"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { OAuthSection } from "@/features/auth/components/OAuthSection"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { safeNextPath } from "@/lib/auth/safeNext"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.loginTitle,
  description: messages.seo.loginDescription,
  path: ROUTES.login,
})

const NOTICES: Record<string, string> = {
  callback: messages.auth.errors.linkExpired,
  oauth: messages.auth.errors.oauthFailed,
}

type PageProps = { searchParams: Promise<{ next?: string; error?: string }> }

export default async function LoginPage({ searchParams }: PageProps) {
  const { next, error } = await searchParams
  const safeNext = next ? safeNextPath(next) : undefined

  return (
    <AuthShell title={messages.auth.loginTitle} subtitle={messages.auth.loginSubtitle} notice={error ? NOTICES[error] : undefined}>
      <OAuthSection />
      <LoginForm next={safeNext} />
    </AuthShell>
  )
}
