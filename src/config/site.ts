import { messages } from "@/config/messages"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"

export const siteConfig = {
  url: siteUrl,
  name: messages.common.appName,
  locale: "en",
  /** Where "write to us" links go (cancel flow, help offers). Set NEXT_PUBLIC_SUPPORT_EMAIL to a real inbox. */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "help@dossier-cv.com",
  /** Links resolved at runtime — swap for CMS later without touching components */
  links: {
    support: `${siteUrl}/support`,
    privacy: `${siteUrl}/privacy`,
    terms: `${siteUrl}/terms`,
    security: `${siteUrl}/security`,
    /** Replace with your brand profiles when ready */
    socialTwitter: "https://x.com",
    socialGithub: "https://github.com",
    socialLinkedin: "https://linkedin.com",
  },
} as const
