import type { Metadata } from "next"

import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import { ContactForm } from "@/features/contact/ContactForm"

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Dossier: questions, bugs and feedback",
  description: "Ask a question, report a problem or suggest a feature. A person reads every message and replies, usually within two working days.",
  path: "/contact",
})

export default function ContactPage() {
  return (
    <>
      <PageHead
        running={["Contact", "Write to us"]}
        title="Ask us anything."
        lead={<p>Questions about your site, your plan or a bug. A person reads every message.</p>}
      />
      <section className="site-wrap grid gap-12 pb-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="lg:col-span-5">
          <p className="site-h3">Prefer email?</p>
          <p className="site-body mt-2">
            Write to{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="underline decoration-[var(--site-accent)] underline-offset-4">
              {siteConfig.supportEmail}
            </a>
            . We reply within two working days.
          </p>
        </aside>
      </section>
    </>
  )
}
