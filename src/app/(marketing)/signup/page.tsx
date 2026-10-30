import type { Metadata } from "next"
import { cookies } from "next/headers"

import { AuthShell } from "@/features/auth/components/AuthShell"
import { OAuthSection } from "@/features/auth/components/OAuthSection"
import { SignupForm } from "@/features/auth/components/SignupForm"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { safeNextPath } from "@/lib/auth/safeNext"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.signupTitle,
  description: messages.seo.signupDescription,
  path: ROUTES.signup,
})

type PageProps = { searchParams: Promise<{ next?: string; plan?: string }> }

/** One calm line above the form when the visitor arrived for a reason: a paid plan, or a friend's invite. */
function contextNote(plan: string | undefined, invited: boolean, next: string | undefined): string | undefined {
  if (next === ROUTES.build) {
    return invited
      ? "Create a free account and the builder opens with your resume ready. Publish your first site and you and the friend who invited you each get a credit."
      : "Create a free account and the builder opens with your resume ready. No card needed."
  }
  if (plan === "starter" || plan === "pro") {
    const name = plan === "starter" ? "Starter" : "Pro"
    return `Create a free account first. Then you can buy ${name} on the next page with UPI or a card.`
  }
  if (invited) return "You were invited by a friend. Publish your first portfolio and you both get a credit."
  return undefined
}

export default async function SignupPage({ searchParams }: PageProps) {
  const { next, plan } = await searchParams
  const safeNext = next ? safeNextPath(next) : undefined
  const invited = Boolean((await cookies()).get("dx_ref")?.value)
  const note = contextNote(plan, invited, safeNext)
  // Buying a plan: after signup, land on billing instead of the dashboard.
  const target = safeNext ?? (plan === "starter" || plan === "pro" ? ROUTES.billing : undefined)

  return (
    <AuthShell title={messages.auth.signupTitle} subtitle={messages.auth.signupSubtitle} info={note}>
      <OAuthSection next={target} />
      <SignupForm next={target} />
    </AuthShell>
  )
}
