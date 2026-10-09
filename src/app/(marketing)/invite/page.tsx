import type { Metadata } from "next"
import Link from "next/link"

import { PageHead } from "@/components/marketing/PageHead"
import { SiteButton } from "@/components/marketing/primitives"
import { UploadSlot } from "@/components/marketing/UploadSlot"
import { buildPageMetadata } from "@/config/seo"
import { ROUTES } from "@/lib/constants/routes"

export const metadata: Metadata = buildPageMetadata({
  title: "You were invited to Dossier",
  description: "A friend sent you Dossier. Turn your resume into a portfolio website, publish it, and you both get a credit.",
  path: ROUTES.invite,
  indexable: false,
  openGraph: {
    title: "A friend thinks your resume should be a website.",
    description: "Upload your PDF, see it as a site, publish a link. Free to start. You both get a credit when you publish.",
  },
})

const STEPS = [
  { k: "You", v: "Upload your resume, pick a look and publish your first portfolio. Free." },
  { k: "Both of you", v: "Get one credit each, as soon as your first portfolio is live." },
  { k: "Credits", v: "One credit adds 20 extra shuffles for a week. Three credits unlock Starter for good." },
] as const

type Props = { searchParams: Promise<{ code?: string }> }

export default async function InvitePage({ searchParams }: Props) {
  const { code } = await searchParams
  const valid = typeof code === "string" && /^[A-Za-z0-9]{4,16}$/.test(code)

  return (
    <>
      <PageHead
        running={["Invitation", valid ? `Code ${code.toUpperCase()}` : "Dossier"]}
        title="Someone thinks your resume deserves a website."
        lead={<p>Dossier sets your resume as a portfolio site you can send as a link. Publish your first one and you and your friend each get a credit.</p>}
      >
        <div className="grid gap-10 border-t border-[var(--site-ink)] py-10 lg:grid-cols-12">
          <UploadSlot className="lg:col-span-5" label="Upload my resume" id="invite-upload" />
          <dl className="lg:col-span-6 lg:col-start-7">
            {STEPS.map((s) => (
              <div key={s.k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-[var(--site-rule)] py-4 first:pt-0">
                <dt className="sp-no text-sm text-[var(--site-accent-ink)]">{s.k}</dt>
                <dd className="text-[0.9375rem] leading-relaxed">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </PageHead>

      <section aria-labelledby="rules-title" className="border-t border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)] py-16">
        <div className="site-wrap grid gap-8 lg:grid-cols-12">
          <h2 id="rules-title" className="site-h3 lg:col-span-4">
            The small print, in large print
          </h2>
          <ul className="site-body grid gap-3 lg:col-span-8">
            <li>The invite counts when you create a new account from this link within 30 days, then publish a portfolio.</li>
            <li>Each person can be invited once. You cannot invite yourself.</li>
            <li>Credits have no cash value and cannot be transferred.</li>
          </ul>
        </div>
      </section>

      <div className="site-wrap flex flex-col gap-3 py-14 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9375rem] text-[var(--site-ink-2)]">
          Already have an account?{" "}
          <Link href={ROUTES.login} className="site-link-mark font-medium text-[var(--site-ink)]">
            Log in
          </Link>
          . Invites only count for new accounts.
        </p>
        <SiteButton href={ROUTES.signup} variant="secondary" arrow>
          Create my account
        </SiteButton>
      </div>
    </>
  )
}
