import type { Metadata } from "next"

import { OAuthSection } from "@/features/auth/components/OAuthSection"
import { SignupForm } from "@/features/auth/components/SignupForm"
import { buildPageMetadata } from "@/config/seo"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = buildPageMetadata({
  title: messages.seo.signupTitle,
  description: messages.seo.signupDescription,
  path: ROUTES.signup,
})

export default function SignupPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="typo-h2">{messages.auth.signupTitle}</CardTitle>
          <CardDescription className="typo-body-md">{messages.auth.signupSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <SignupForm />
          <OAuthSection />
        </CardContent>
      </Card>
    </div>
  )
}
