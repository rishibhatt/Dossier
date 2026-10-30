import type { Metadata } from "next"

import { Prose } from "@/components/blog/Prose"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import type { Block } from "@/content/blog/posts"

export const metadata: Metadata = buildPageMetadata({
  title: "Refund and cancellation policy | Dossier",
  description: "How refunds work for Dossier Starter and Pro: one-time payments, no auto-renewal, a full refund within 7 days of paying, and how long the money takes to reach you.",
  path: "/refund-policy",
})

const UPDATED = "31 October 2026"

const BODY: Block[] = [
  { t: "p", text: `Last updated ${UPDATED}. Questions: ${siteConfig.supportEmail}.` },
  { t: "h2", text: "What you pay for" },
  { t: "p", text: "Every Dossier purchase is a one-time payment, made through Razorpay. Starter is yours for good. Pro is a pass for 30 or 365 days that adds to any Pro time you have left. Nothing renews on its own, and we never charge your card or UPI again without you choosing to pay." },
  { t: "h2", text: "Cancelling" },
  { t: "p", text: "There is nothing to cancel. When a Pro pass ends, your account goes back to Starter if you own it, or to Free if you do not. Your resume and your published site stay." },
  { t: "h2", text: "Refunds" },
  { t: "p", text: `If a purchase does not work for you, write to ${siteConfig.supportEmail} within 7 days of paying. Send the email address on your account and, if you have it, the Razorpay payment ID from your receipt. You do not need to give a reason. We refund the full amount.` },
  { t: "ul", items: [
    "A refunded Starter purchase removes Starter from your account, unless you unlocked it with credits.",
    "A refunded Pro pass takes back the days that pass added. Any other Pro time you paid for stays.",
    "After 7 days we look at each request on its own. If you were charged twice or charged for something you did not get, we refund it whenever you tell us.",
    "Credits are earned, not bought, so they have no cash value and cannot be refunded.",
  ] },
  { t: "h2", text: "How long it takes" },
  { t: "p", text: "We reply within 2 working days and start the refund the same day we approve it. The money goes back to the card, bank account or UPI ID you paid with. Razorpay and your bank usually take 5 to 7 working days to show it." },
  { t: "h2", text: "Failed or pending payments" },
  { t: "p", text: "If money left your account but Dossier does not show your plan, do not pay again. Razorpay returns failed payments to you automatically, usually within 5 to 7 working days. If it does not, write to us with the payment ID and we will sort it out." },
  { t: "h2", text: "Changes" },
  { t: "p", text: "We may update this policy. A change never applies to a payment made before it." },
]

export default function RefundPolicyPage() {
  return (
    <>
      <PageHead running={["Legal", "Refunds"]} title="Refund and cancellation policy" lead={<p>One-time payments, no auto-renewal, and a full refund within 7 days.</p>} />
      <section className="site-wrap pb-20">
        <Prose blocks={BODY} />
      </section>
    </>
  )
}
