import type { Metadata } from "next"

import { LoginForm } from "@/features/auth/components/LoginForm"
import { OAuthSection } from "@/features/auth/components/OAuthSection"
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
  title: messages.seo.loginTitle,
  description: messages.seo.loginDescription,
  path: ROUTES.login,
})

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="typo-h2">{messages.auth.loginTitle}</CardTitle>
          <CardDescription className="typo-body-md">{messages.auth.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <LoginForm />
          <OAuthSection />
        </CardContent>
      </Card>
    </div>
  )
}
