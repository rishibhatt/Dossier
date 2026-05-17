import Link from "next/link"
import { Code2, MessageCircle, Share2 } from "lucide-react"

import { BrandMark } from "@/components/atoms/BrandMark"
import { messages } from "@/config/messages"
import { marketingNav } from "@/config/navigation"
import { siteConfig } from "@/config/site"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

export function MarketingSiteFooter({ className }: { className?: string }) {
  const m = messages.marketing
  const year = new Date().getFullYear()

  const resourceLinks = [
    { href: ROUTES.build, label: m.footerDocLink },
    { href: `${ROUTES.home}#features`, label: m.footerBlogLink },
    { href: `${ROUTES.home}#how-it-works`, label: m.footerChangelogLink },
  ] as const

  const companyLinks = [
    { href: `${ROUTES.home}#about`, label: m.footerAboutLink },
    { href: `${ROUTES.home}#about`, label: m.footerCareersLink },
    { href: siteConfig.links.support, label: m.footerContactLink },
  ] as const

  const socials = [
    { href: siteConfig.links.socialTwitter, label: m.socialTwitterAria, Icon: MessageCircle },
    { href: siteConfig.links.socialLinkedin, label: m.socialLinkedinAria, Icon: Share2 },
    { href: siteConfig.links.socialGithub, label: m.socialGithubAria, Icon: Code2 },
  ] as const

  return (
    <footer className={cn("border-t border-outline-variant bg-card py-12 sm:py-14", className)}>
      <div className="mx-auto grid max-w-(--container-landing) gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left lg:col-span-4">
          <BrandMark variant="marketing" className="justify-center sm:justify-start" />
          <p className="typo-body-md max-w-xs text-muted-foreground">{m.footerTagline}</p>
          <div className="flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-outline-variant text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-fixed/50 hover:text-primary"
              >
                <Icon className="size-4" aria-hidden />
              </Link>
            ))}
          </div>
          <p className="typo-label-sm text-muted-foreground">
            {m.footerCopyrightPrefix} {year} {m.footerCompanyLine} {m.footerRights}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:col-span-2 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <p className="typo-label-sm font-bold text-foreground">{m.footerProductHeading}</p>
            {marketingNav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="typo-label-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <Link href={ROUTES.login} className="typo-label-sm text-muted-foreground transition-colors hover:text-primary">
              {m.navSignIn}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="typo-label-sm font-bold text-foreground">{m.footerResourcesHeading}</p>
            {resourceLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="typo-label-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <p className="typo-label-sm font-bold text-foreground">{m.footerCompanyHeading}</p>
            {companyLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="typo-label-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <p className="typo-label-sm pt-2 text-muted-foreground">{siteConfig.url}</p>
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
              <p className="typo-label-sm font-bold text-foreground">{m.footerLegalHeading}</p>
              <Link href={siteConfig.links.privacy} className="typo-label-sm text-muted-foreground hover:text-primary">
                {m.footerPrivacy}
              </Link>
              <Link href={siteConfig.links.terms} className="typo-label-sm text-muted-foreground hover:text-primary">
                {m.footerTerms}
              </Link>
              <Link href={siteConfig.links.security} className="typo-label-sm text-muted-foreground hover:text-primary">
                {m.footerLinkSecurity}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
