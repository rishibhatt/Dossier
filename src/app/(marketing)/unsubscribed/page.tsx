import type { Metadata } from "next"

import { PageHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "Email preferences | Dossier",
  description: "Your Dossier email preferences.",
  path: "/unsubscribed",
  indexable: false,
})

type Props = { searchParams: Promise<{ u?: string; t?: string; done?: string; error?: string }> }

const UUID = /^[0-9a-f-]{36}$/i

export default async function UnsubscribedPage({ searchParams }: Props) {
  const { u, t, done, error } = await searchParams
  const confirm = !done && !error && u && t && UUID.test(u) && UUID.test(t)

  if (confirm) {
    return (
      <PageHead
        running={["Email", "Preferences"]}
        title="Stop tips and offer emails?"
        lead={<p>You will still get receipts and security emails about your account. You can turn tips back on any time in Settings.</p>}
      >
        <form method="post" action={`/api/email/unsubscribe?${new URLSearchParams({ u, t })}`} className="border-t border-[var(--site-ink)] py-10">
          <button type="submit" className="site-btn site-btn-primary">
            <span className="site-btn-label">Stop these emails</span>
          </button>
        </form>
      </PageHead>
    )
  }

  return (
    <PageHead
      running={["Email", "Preferences"]}
      title={error || !done ? "That link did not work." : "You will not get these emails again."}
      lead={
        <p>
          {error || !done
            ? "The link may be old. Sign in and change your email choices in Settings instead."
            : "Tips and offers are off. Receipts and security emails about your account still come. You can turn them back on any time in Settings."}
        </p>
      }
    >
      <div className="border-t border-[var(--site-ink)] py-10">
        <SiteButton href={ROUTES.settings}>Open settings</SiteButton>
      </div>
    </PageHead>
  )
}
