import type { Metadata } from "next"

import { Prose } from "@/components/blog/Prose"
import { PageHead } from "@/components/marketing/PageHead"
import { buildPageMetadata } from "@/config/seo"
import { siteConfig } from "@/config/site"
import type { Block } from "@/content/blog/posts"

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy policy | Dossier",
  description: "What Dossier collects when you build a portfolio, why we collect it, who processes it, and how to ask us to export or delete your data.",
  path: "/privacy",
})

const UPDATED = "9 October 2026"

const BODY: Block[] = [
  { t: "p", text: `This page explains what Dossier collects and why. Last updated ${UPDATED}. Questions: ${siteConfig.supportEmail}.` },
  { t: "h2", text: "What we collect" },
  { t: "ul", items: [
    "Account details: your email address, and your name and photo if you sign in with Google.",
    "Your resume and portfolio: the PDF you upload is read to build your site. The text and the site you create are stored so you can edit and publish them.",
    "Usage: which actions you run (for example a resume read or a publish) and a salted, one-way hash of your IP address. We use these for daily limits and to stop abuse. We do not store your raw IP address.",
    "Messages you send us through the contact form.",
    "Analytics: page views and clicks through Google Analytics and Microsoft Clarity, to learn which pages help.",
  ] },
  { t: "h2", text: "The free tools" },
  { t: "p", text: "The ATS scanner and the other free tools run in your browser. The text you paste is not sent to our servers." },
  { t: "h2", text: "Published sites" },
  { t: "p", text: "A site you publish is public to anyone with its link. It can include the contact details from your resume. Search engines are asked not to index published sites unless you opt in. Unpublish or delete the site and it stops being served." },
  { t: "h2", text: "Who processes your data" },
  { t: "ul", items: [
    "Supabase: stores accounts and data.",
    "Netlify: hosts the site.",
    "Groq and OpenRouter: language models that read the text of your resume to structure it. They receive the resume text, not your account details.",
    "Brevo: sends our emails (welcome, sign-in notices, credits, replies to your messages).",
    "Google and Microsoft: analytics.",
  ] },
  { t: "h2", text: "Cookies" },
  { t: "p", text: "We use a cookie to keep you signed in and a short-lived cookie to remember an invite link. Analytics tools set their own cookies." },
  { t: "h2", text: "Your choices" },
  { t: "p", text: `You can ask us to export or delete your account and data at any time by writing to ${siteConfig.supportEmail}. We act within 30 days. You can also stop emails by deleting your account.` },
  { t: "h2", text: "Changes" },
  { t: "p", text: "If we change this policy in a way that matters, we will update the date above and tell account holders by email." },
]

export default function PrivacyPage() {
  return (
    <>
      <PageHead running={["Legal", "Privacy"]} title="Privacy policy" lead={<p>Plain terms about your data.</p>} />
      <section className="site-wrap pb-20">
        <Prose blocks={BODY} />
      </section>
    </>
  )
}
