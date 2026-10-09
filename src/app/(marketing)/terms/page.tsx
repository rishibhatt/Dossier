import type { Metadata } from "next"

import { Prose } from "@/components/blog/Prose"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import type { Block } from "@/content/blog/posts"

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of service | Dossier",
  description: "The rules for using Dossier: who owns your content, acceptable use, how plans and refunds work, and how to close your account.",
  path: "/terms",
})

const UPDATED = "9 October 2026"

const BODY: Block[] = [
  { t: "p", text: `By using Dossier you agree to these terms. Last updated ${UPDATED}. Questions: ${siteConfig.supportEmail}.` },
  { t: "h2", text: "Your account" },
  { t: "p", text: "You need an account to build and publish. Keep your sign-in details private. You are responsible for what happens under your account." },
  { t: "h2", text: "Your content" },
  { t: "p", text: "You own your resume and the site made from it. You give Dossier permission to store, process and display it so the service works, including showing a published site to anyone with its link. Upload only content you have the right to use." },
  { t: "h2", text: "Acceptable use" },
  { t: "ul", items: [
    "Do not publish anything illegal, hateful, misleading about who you are, or that infringes someone else's rights.",
    "Do not try to break, overload or bypass the limits of the service.",
    "Do not use another person's resume or identity.",
  ] },
  { t: "p", text: "We may remove content or suspend an account that breaks these rules." },
  { t: "h2", text: "Plans and payments" },
  { t: "p", text: "Free, Starter and Pro are described on the pricing page. Limits apply to each plan. Prices may change for new purchases, and we will not charge you a new price without telling you first." },
  { t: "h2", text: "Refunds" },
  { t: "p", text: "If a paid plan does not work for you, write to us within 7 days of paying and we will refund you." },
  { t: "h2", text: "The service" },
  { t: "p", text: "We work to keep Dossier available, but we do not promise it will never be interrupted. Generated text and designs can contain mistakes, so check your site before you publish it. Dossier is provided as is, and to the extent the law allows we are not liable for indirect losses." },
  { t: "h2", text: "Ending your account" },
  { t: "p", text: `You can stop using Dossier at any time, and ask us to delete your account at ${siteConfig.supportEmail}.` },
  { t: "h2", text: "Changes" },
  { t: "p", text: "We may update these terms. If a change matters, we will update the date above and tell account holders by email." },
]

export default function TermsPage() {
  return (
    <>
      <PageHead running={["Legal", "Terms"]} title="Terms of service" lead={<p>The short version of the rules.</p>} />
      <section className="site-wrap pb-20">
        <Prose blocks={BODY} />
      </section>
    </>
  )
}
