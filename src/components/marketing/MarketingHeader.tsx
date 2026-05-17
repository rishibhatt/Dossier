import Link from "next/link"

import { LogoMark } from "@/components/marketing/MarketingPrimitives"
import { ROUTES } from "@/lib/constants/routes"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Studio", href: "#studio" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#F8F6F1]/80 backdrop-blur-xl">
      <div className="mk-container-wide flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link href={ROUTES.home} className="mk-focus rounded-xl" aria-label="Dossier home">
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-11 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mk-focus rounded-md text-sm font-semibold tracking-[-0.01em] text-[#24262D]/86 transition hover:text-[#24262D]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-5">
          <Link
            href={ROUTES.login}
            className="mk-focus hidden rounded-md text-sm font-semibold tracking-[-0.01em] text-[#24262D] transition hover:opacity-70 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href={ROUTES.build}
            className="mk-focus inline-flex h-11 items-center justify-center rounded-xl bg-[#080A0F] px-5 text-sm font-bold tracking-[-0.01em] text-white shadow-[0_12px_28px_rgba(8,10,15,0.18)] transition hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
