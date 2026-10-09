"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Menu, X } from "lucide-react"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/marketing/motion/gsap"
import { Logo, SiteButton, siteBtnClass } from "@/components/marketing/primitives"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

/** `id` is the section id on the home page that makes the link "current" while it is on screen. */
const NAV = [
  { id: "how", label: "How it works", href: ROUTES.howItWorks, path: ROUTES.howItWorks },
  { id: "specimens", label: "Looks", href: `${ROUTES.home}#specimens`, path: null },
  { id: "tools", label: "Free tools", href: ROUTES.tools, path: ROUTES.tools },
  { id: "blog", label: "Blog", href: ROUTES.blog, path: ROUTES.blog },
  { id: "pricing", label: "Pricing", href: ROUTES.pricing, path: ROUTES.pricing },
] as const

/**
 * Full-screen menu body. It only mounts while the sheet is open, so the entrance runs on every open:
 * the big links rise out of masks one after another, the rules draw in, the bottom bar slides up.
 */
function MobileMenu() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ delay: 0.12 })
        tl.from("[data-menu-line]", { yPercent: 115, duration: 0.9, ease: "power4.out", stagger: 0.07 })
        tl.from("[data-menu-rule]", { scaleX: 0, transformOrigin: "left center", duration: 0.8, ease: "power3.out", stagger: 0.07 }, 0)
        tl.from("[data-menu-bar]", { yPercent: 100, duration: 0.7, ease: "power3.out" }, 0.25)
      })
    },
    { scope: root }
  )

  return (
    <div ref={root} className="flex h-dvh flex-col">
      <div className="flex h-[4.5rem] shrink-0 items-center justify-between px-5">
        <Logo />
        <SheetClose aria-label="Close menu" className={siteBtnClass({ variant: "secondary", size: "sm", className: "!px-0 aspect-square" })}>
          <X className="size-5" aria-hidden />
        </SheetClose>
      </div>

      <nav className="flex flex-1 flex-col justify-center overflow-y-auto px-5" aria-label="Mobile">
        {NAV.map((item) => (
          <SheetClose
            key={item.label}
            nativeButton={false}
            render={
              <Link
                href={item.href}
                className="group relative flex min-h-[4.5rem] items-center justify-between gap-4 py-4 text-[clamp(2rem,9.5vw,3rem)] font-bold leading-none tracking-[-0.04em] active:text-[var(--site-accent-ink)]"
              />
            }
          >
            <span className="block overflow-hidden py-1" style={{ fontFamily: "var(--site-display)" }}>
              <span data-menu-line className="block">
                {item.label}
              </span>
            </span>
            <ArrowUpRight
              className="size-6 shrink-0 text-[var(--site-ink-2)] transition-transform duration-300 [transition-timing-function:var(--site-ease)] group-active:translate-x-1 group-active:-translate-y-1"
              aria-hidden
            />
            <span data-menu-rule className="absolute inset-x-0 bottom-0 h-px bg-[var(--site-rule)]" aria-hidden />
          </SheetClose>
        ))}
      </nav>

      <div
        data-menu-bar
        className="shrink-0 border-t border-[var(--site-rule)] bg-[var(--site-paper)] p-5"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <SheetClose nativeButton={false} render={<Link href={ROUTES.login} className={siteBtnClass({ variant: "secondary", size: "lg" })} />}>
            <span className="site-btn-label">Log in</span>
          </SheetClose>
          <SheetClose nativeButton={false} render={<Link href={ROUTES.build} className={siteBtnClass({ variant: "primary", size: "lg", arrow: true })} />}>
            <span className="site-btn-label">Build my portfolio</span>
            <span className="site-btn-arrow" aria-hidden>
              <ArrowUpRight strokeWidth={2.25} />
            </span>
          </SheetClose>
        </div>
      </div>
    </div>
  )
}

/** Phone-only CTA that slides up once the hero is behind you and steps aside at the footer. */
function FloatingCta({ hidden }: { hidden: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [atFooter, setAtFooter] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 560))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const footer = document.querySelector("footer")
    const io = footer ? new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { rootMargin: "0px 0px 8% 0px" }) : null
    if (footer) io?.observe(footer)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      io?.disconnect()
    }
  }, [])

  const show = scrolled && !atFooter && !hidden
  return (
    <div className="site-float-cta" data-show={show} aria-hidden={!show}>
      <SiteButton href={ROUTES.build} size="lg" arrow className="shadow-[0_12px_28px_-10px_rgba(16,17,20,0.6)]">
        Upload my resume
      </SiteButton>
    </div>
  )
}

export function SiteHeader() {
  const root = useRef<HTMLElement>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const indicator = useRef<HTMLSpanElement>(null)
  const pathname = usePathname()
  const [section, setSection] = useState<string | null>(null)

  // The bar condenses once you scroll (CSS does the transition), and a hairline tracks reading progress.
  useGSAP(
    () => {
      const header = root.current
      if (!header) return
      ScrollTrigger.create({
        start: 24,
        end: "max",
        onToggle: (self) => {
          header.dataset.condensed = self.isActive ? "true" : "false"
        },
      })
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.to(progress.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } })
      })
    },
    { scope: root }
  )

  // Which home-page section is under the middle of the screen.
  useEffect(() => {
    if (pathname !== ROUTES.home) return
    const targets = NAV.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => el !== null)
    if (!targets.length) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setSection(e.target.id)
          else setSection((cur) => (cur === e.target.id ? null : cur))
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [pathname])

  const current = NAV.find((n) => n.path && pathname?.startsWith(n.path))?.id ?? (pathname === ROUTES.home ? section : null)

  const moveTo = useCallback((el: HTMLElement, instant = false) => {
    const ind = indicator.current
    if (!ind) return
    gsap.to(ind, {
      x: el.offsetLeft,
      width: el.offsetWidth,
      autoAlpha: 1,
      duration: instant ? 0 : 0.4,
      ease: "power3.out",
      overwrite: "auto",
    })
  }, [])

  // Highlight rests on the current page/section when nothing is hovered.
  const rest = useCallback(() => {
    const active = navRef.current?.querySelector<HTMLElement>("[aria-current]")
    if (active) moveTo(active)
    else if (indicator.current) gsap.to(indicator.current, { autoAlpha: 0, duration: 0.25, overwrite: "auto" })
  }, [moveTo])

  // Re-measure once fonts land: link widths change when the display face swaps in.
  useEffect(() => {
    rest()
    void document.fonts?.ready.then(rest)
  }, [current, rest])

  const hideFloating = pathname === ROUTES.login || pathname === ROUTES.signup

  return (
    <>
      <header ref={root} data-condensed="false" className="sticky top-0 z-50">
        <div className="site-wrap">
          <div className="site-nav-bar">
            <Link href={ROUTES.home} aria-label="Dossier home" className="py-1">
              <Logo />
            </Link>

            <nav ref={navRef} className="relative hidden items-center lg:flex" aria-label="Primary" onPointerLeave={rest}>
              <span ref={indicator} className="site-nav-hl" aria-hidden />
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={current === item.id ? "location" : undefined}
                  onPointerEnter={(e) => moveTo(e.currentTarget)}
                  onFocus={(e) => moveTo(e.currentTarget)}
                  onBlur={rest}
                  className="site-nav-link"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <SiteButton href={ROUTES.login} variant="quiet" size="sm" className="hidden sm:inline-flex">
                Log in
              </SiteButton>
              <SiteButton href={ROUTES.build} size="sm" arrow className="hidden sm:inline-flex">
                <span className="xl:hidden">Build mine</span>
                <span className="hidden xl:inline">Build my portfolio</span>
              </SiteButton>

              <Sheet>
                <SheetTrigger aria-label="Open menu" className={siteBtnClass({ variant: "primary", size: "sm", className: "!px-0 aspect-square lg:hidden" })}>
                  <Menu className="size-5" aria-hidden />
                </SheetTrigger>
                <SheetContent side="top" showCloseButton={false} className={cn("site h-dvh w-full gap-0 border-0 bg-[var(--site-paper)] p-0")}>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <MobileMenu />
                </SheetContent>
              </Sheet>
            </div>

            <span ref={progress} className="site-nav-progress" aria-hidden />
          </div>
        </div>
      </header>
      <FloatingCta hidden={hideFloating} />
    </>
  )
}
