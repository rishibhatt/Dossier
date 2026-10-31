import { siteConfig } from "@/config/site"

/**
 * Branded transactional email. Table layout and inline styles, because mail clients ignore most CSS.
 * Palette matches the site: paper, ink and the violet accent. The logo is a PNG served by /brand/email-logo.png.
 */
export type Mail = { subject: string; html: string; text: string }

const INK = "#101114"
const PAPER = "#f7f5f0"
const SHEET = "#fffefb"
const MUTED = "#4f5562"
const RULE = "#d9d5cb"
const ACCENT = "#6d5cf6"
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const url = (path: string) => `${siteConfig.url}${path}`

type Cta = { label: string; href: string }

function layout({ preheader, heading, paragraphs, cta, note }: { preheader: string; heading: string; paragraphs: string[]; cta?: Cta; note?: string }): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK};">${p}</p>`).join("")
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${INK};border-radius:2px;"><a href="${esc(cta.href)}" style="display:inline-block;padding:14px 22px;font-family:${FONT};font-size:15px;font-weight:600;color:${PAPER};text-decoration:none;">${esc(cta.label)}</a></td></tr></table>`
    : ""
  const noteHtml = note ? `<p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED};">${note}</p>` : ""
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;font-family:${FONT};">
<tr><td style="padding:0 0 20px;"><a href="${siteConfig.url}"><img src="${url("/brand/email-logo.png")}" width="150" height="35" alt="Dossier" style="display:block;border:0;"></a></td></tr>
<tr><td style="background:${SHEET};border-top:3px solid ${INK};border-left:1px solid ${RULE};border-right:1px solid ${RULE};border-bottom:1px solid ${RULE};padding:32px 28px;">
<h1 style="margin:0 0 20px;font-size:26px;line-height:1.2;letter-spacing:-0.02em;color:${INK};">${esc(heading)}</h1>
${body}${button}${noteHtml}
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:${MUTED};">
Dossier turns your resume into a portfolio website.<br>
<a href="${siteConfig.url}" style="color:${ACCENT};">dossier-cv.com</a> &middot; Questions? Write to <a href="mailto:${esc(siteConfig.supportEmail)}" style="color:${ACCENT};">${esc(siteConfig.supportEmail)}</a>
</td></tr>
</table></td></tr></table></body></html>`
}

function plain(heading: string, paragraphs: string[], cta?: Cta, note?: string): string {
  const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  return [heading, "", ...paragraphs.map(strip), ...(cta ? ["", `${cta.label}: ${cta.href}`] : []), ...(note ? ["", strip(note)] : []), "", `Dossier, ${siteConfig.url}`, `Questions? ${siteConfig.supportEmail}`].join("\n")
}

function build(subject: string, preheader: string, heading: string, paragraphs: string[], cta?: Cta, note?: string): Mail {
  return { subject, html: layout({ preheader, heading, paragraphs, cta, note }), text: plain(heading, paragraphs, cta, note) }
}

export function welcomeEmail(name?: string): Mail {
  const hi = name ? `Hi ${esc(name)},` : "Hi,"
  return build(
    "Welcome to Dossier",
    "Your account is ready. Upload a resume and publish a site in a few minutes.",
    "Welcome to Dossier",
    [
      hi,
      "Your account is ready. Here is the quickest way to a live site:",
      "1. Upload your resume as a PDF.<br>2. Pick a look and edit any line.<br>3. Press Publish and share your link.",
      "Not ready to build yet? Run your resume through the free ATS scanner first. It shows the keywords a job post wants and what a parser cannot read.",
    ],
    { label: "Open the builder", href: url("/build") },
    `Or try the <a href="${url("/tools/ats-checker")}" style="color:${ACCENT};">ATS scanner</a>.`
  )
}

export function signInEmail(whenUtc: Date): Mail {
  const when = `${whenUtc.toISOString().slice(0, 16).replace("T", " ")} UTC`
  return build(
    "New sign-in to your Dossier account",
    `Signed in at ${when}.`,
    "You signed in to Dossier",
    [`We saw a sign-in to your account at ${when}.`, "If that was you, there is nothing to do. If it was not, reset your password now and every other session is signed out."],
    { label: "Reset my password", href: url("/forgot-password") }
  )
}

export function passwordChangedEmail(): Mail {
  return build(
    "Your Dossier password was changed",
    "If you did not do this, reset it now.",
    "Your password was changed",
    ["The password on your Dossier account was just changed.", `If that was not you, reset it now and write to ${esc(siteConfig.supportEmail)}.`],
    { label: "Reset my password", href: url("/forgot-password") }
  )
}

export function creditEmail({ role, balance }: { role: "referrer" | "referee"; balance?: number }): Mail {
  const lead = role === "referrer" ? "Someone you invited just published their site, so you earned a credit." : "You joined through an invite and published your first site, so you earned a welcome credit."
  const bal = typeof balance === "number" ? `Your balance is now ${balance} credit${balance === 1 ? "" : "s"}.` : "Your credit is in your account."
  return build(
    "You earned a Dossier credit",
    bal,
    "You earned a credit",
    [lead, bal, "Spend credits on extra design shuffles, or save up three to unlock Starter."],
    { label: "See my credits", href: url("/dashboard/referrals") }
  )
}

const PLAN_NAME = { free: "Free", starter: "Starter", pro: "Pro" } as const

export function planEmail({ plan, expiresAt }: { plan: keyof typeof PLAN_NAME; expiresAt: string | null }): Mail {
  const name = PLAN_NAME[plan]
  const until = expiresAt ? ` It runs until ${new Date(expiresAt).toISOString().slice(0, 10)}.` : ""
  const body = plan === "free" ? "Your account is now on the Free plan. Your published site stays online." : `Your account is now on the ${name} plan.${until} Thank you for supporting Dossier.`
  return build(`Your Dossier plan: ${name}`, body, `You are on ${name}`, [body], { label: "Open my dashboard", href: url("/dashboard") })
}

/** Carries nothing the sender typed: the form can be pointed at any address, so this must not be usable for spam. */
export function contactAckEmail(): Mail {
  return build(
    "We got your message",
    "A person will reply, usually within two working days.",
    "We got your message",
    ["Hi,", "Thanks for writing. A person reads every message and will reply, usually within two working days.", "You can reply to this email if you want to add something."],
    undefined,
    "You are getting this because this address was entered on our contact form."
  )
}

export function contactNoticeEmail(m: { name: string; email: string; message: string; userId?: string | null }): Mail {
  const msg = esc(m.message).replace(/\n/g, "<br>")
  return build(
    `Contact form: ${m.name}`,
    m.message.slice(0, 90),
    "New contact message",
    [`<strong>${esc(m.name)}</strong> &lt;${esc(m.email)}&gt;${m.userId ? " (signed-in user)" : ""}`, msg],
    { label: `Reply to ${m.name}`, href: `mailto:${m.email}` }
  )
}

const RECEIPT: Record<string, string> = { starter: "Starter, owned for good", pro_month: "Pro for 30 days", pro_year: "Pro for 365 days" }

export function purchaseEmail({ product, expiresAt }: { product: string; expiresAt: string | null }): Mail {
  const until = expiresAt ? ` Pro runs until ${expiresAt.slice(0, 10)}. Nothing renews by itself; we will remind you before it ends.` : ""
  return build(
    "Thanks! Your Dossier purchase",
    `${RECEIPT[product] ?? product} is on.`,
    "Payment received",
    [`${RECEIPT[product] ?? product} is now on your account.${until}`, "The badge is off your site and ZIP export is unlocked. Razorpay emails you the payment receipt separately."],
    { label: "Open my dashboard", href: url("/dashboard") },
    `Something wrong with the payment? Reply to this email or write to ${esc(siteConfig.supportEmail)}.`
  )
}

/** Footer for product emails: why they got it and a one-click way out. */
const optOut = (unsubscribe: string) => `You get these because you have a Dossier account. <a href="${esc(unsubscribe)}" style="color:${ACCENT};">Stop these emails</a> (account emails like receipts still come).`

export type LifecycleInput = { kind: string; name?: string | null; views?: number | null; expiresAt?: string | null; unsubscribe: string; referralUrl?: string }

/** The email for one lifecycle kind (see lifecycle_candidates in the migration). Null for an unknown kind. */
export function lifecycleEmail({ kind, name, views, expiresAt, unsubscribe, referralUrl }: LifecycleInput): Mail | null {
  const hi = name ? `Hi ${esc(name)},` : "Hi,"
  const day = expiresAt ? expiresAt.slice(0, 10) : ""
  const k = kind.split(":")[0] === "life" ? kind : kind.split(":")[0]
  switch (k) {
    case "life:activate":
      return build("Your resume is two minutes from a website", "Upload the PDF you already have.", "Your site is two minutes away", [hi, "You made a Dossier account but have not built anything yet. Upload the resume PDF you already have and Dossier lays it out as a website. You can change every line before anyone sees it.", "No resume file? Start one in the free resume builder and turn it into a site later."], { label: "Upload my resume", href: url("/build") }, optOut(unsubscribe))
    case "life:resume_to_site":
      return build("Your resume can be a website too", "Same content, one link to share.", "Same resume, now a website", [hi, "You built a resume in Dossier. The same content can be a portfolio site with one link, which is easier to share on LinkedIn, in emails and on job forms than a PDF.", "It is free for one site, and you can unpublish it any time."], { label: "Make my site", href: url("/build") }, optOut(unsubscribe))
    case "life:published":
      return build("Your site is live. Here is how to get it seen", "Three places to put your new link.", "Your site is live", [hi, "Your portfolio is online. A link nobody sees does nothing, so put it in these three places today:", "1. <strong>LinkedIn</strong>: Profile, Add section, Featured, Add a link.<br>2. <strong>Your email signature</strong> and job applications (the \"website\" field).<br>3. <strong>Your resume header</strong>, next to your phone number.", "Your dashboard shows how many people open it."], { label: "Open my dashboard", href: url("/dashboard") }, optOut(unsubscribe))
    case "life:invite":
      return build("Know someone job hunting?", "You both earn a credit.", "Invite a friend, both of you earn a credit", [hi, "If a friend is job hunting, send them your invite link. When they publish their first site, you each get a credit. Three credits unlock Starter (no badge, ZIP download).", referralUrl ? `Your link: <a href="${esc(referralUrl)}" style="color:${ACCENT};">${esc(referralUrl)}</a>` : "Your invite link is on the referrals page."], { label: "Get my invite link", href: url("/dashboard/referrals") }, optOut(unsubscribe))
    case "views":
      return build(`Your site was opened ${views} times this week`, "See which days people looked.", `${views} visits this week`, [hi, `Your Dossier site was opened <strong>${views} times</strong> in the last 7 days. Sharing the link again in a post or an application usually brings a new spike.`], { label: "See my visits", href: url("/dashboard") }, optOut(unsubscribe))
    case "life:winback":
      return build("Your Dossier site is still here", "Update it in a minute when you need it.", "Still here when you need it", [hi, "It has been a while. Your account and anything you published are still here.", "When the next application comes, update a line or shuffle to a fresh look in a minute. The free ATS scanner also checks your resume against a job post."], { label: "Open Dossier", href: url("/dashboard") }, optOut(unsubscribe))
    case "renew":
      return build(`Your Dossier Pro ends on ${day}`, "Add more time if you still need it.", "Pro ends soon", [hi, `Your Pro pass ends on <strong>${day}</strong>. Nothing renews by itself, so nothing will be charged.`, "If you still need Pro, add a month or a year and it stacks on the days you have left. If not, do nothing: your site stays online on Free (or Starter, if you own it)."], { label: "Add more time", href: url("/dashboard/billing") })
    case "expired":
      return build("Your Dossier Pro has ended", "Your site is still online.", "Pro has ended", [hi, `Your Pro pass ended on ${day}. Your site is still online on your other plan, and nothing was charged.`, "Want Pro back? It takes a minute."], { label: "Get Pro again", href: url("/dashboard/billing") })
    default:
      return null
  }
}
