import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export type SiteButtonVariant = "primary" | "secondary" | "ghost" | "paper" | "quiet"
export type SiteButtonSize = "sm" | "md" | "lg" | "default"

/**
 * Class string for the Dossier button system (styles: `site.css`, "Button system").
 * Use it on any `<button>` or `<a>` so auth, builder and studio screens share the same look:
 *   <button className={siteBtnClass({ variant: "primary", size: "sm" })}><span className="site-btn-label">Save</span></button>
 */
export function siteBtnClass({
  variant = "primary",
  size = "md",
  arrow = false,
  className,
}: {
  variant?: SiteButtonVariant
  size?: SiteButtonSize
  arrow?: boolean
  className?: string
} = {}) {
  return cn(
    "site-btn",
    `site-btn-${variant}`,
    size === "sm" && "site-btn-sm",
    size === "lg" && "site-btn-lg",
    arrow && "site-btn-has-arrow",
    className
  )
}

/** Where the pointer entered the button, as percentages. The secondary/ghost wipe grows from there. */
function setEntryVars(btn: HTMLElement, e: PointerEvent) {
  const r = btn.getBoundingClientRect()
  if (!r.width || !r.height) return
  btn.style.setProperty("--px", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
  btn.style.setProperty("--py", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
}

// One delegated listener serves every .site-btn on the page, whether it is a SiteButton or a raw <button>.
if (typeof document !== "undefined") {
  const w = window as unknown as { __siteBtnPointer?: boolean }
  if (!w.__siteBtnPointer) {
    w.__siteBtnPointer = true
    const handle = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      const t = e.target
      if (!(t instanceof Element)) return
      const btn = t.closest<HTMLElement>(".site-btn")
      if (!btn) return
      const from = e.relatedTarget
      if (from instanceof Node && btn.contains(from)) return
      setEntryVars(btn, e)
    }
    document.addEventListener("pointerover", handle, { passive: true })
    document.addEventListener("pointerout", handle, { passive: true })
  }
}

/** Label with a duplicate under it. On hover the first slides out and the second slides in (CSS only). */
export function BtnLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="site-btn-label">
      <span className="site-btn-roll">{children}</span>
      <span className="site-btn-roll site-btn-roll-b" aria-hidden>
        {children}
      </span>
    </span>
  )
}

/** Arrow in a small chip. On hover the arrow leaves right and a second one arrives from the left. */
export function BtnArrow() {
  return (
    <span className="site-btn-arrow" aria-hidden>
      <ArrowRight className="site-btn-arrow-a" strokeWidth={2.25} />
      <ArrowRight className="site-btn-arrow-b" strokeWidth={2.25} />
    </span>
  )
}

type SiteButtonProps = {
  href: string
  children: React.ReactNode
  variant?: SiteButtonVariant
  size?: SiteButtonSize
  /** Adds the trailing arrow chip. */
  arrow?: boolean
  /** Kept for compatibility; no effect. */
  magnetic?: boolean
  className?: string
}

/** The one marketing link-button. */
export function SiteButton({ href, children, variant = "primary", size = "md", arrow = false, className }: SiteButtonProps) {
  return (
    <Link href={href} className={siteBtnClass({ variant, size, arrow, className })}>
      <BtnLabel>{children}</BtnLabel>
      {arrow ? <BtnArrow /> : null}
    </Link>
  )
}

/** The same look on a real <button>. Pass `type`, `onClick`, `disabled` as usual. */
export function SiteButtonBase({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  type = "button",
  ...rest
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: SiteButtonVariant
  size?: SiteButtonSize
  arrow?: boolean
  className?: string
}) {
  return (
    <button type={type} className={siteBtnClass({ variant, size, arrow, className })} {...rest}>
      <BtnLabel>{children}</BtnLabel>
      {arrow ? <BtnArrow /> : null}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Logo                                                                */
/* ------------------------------------------------------------------ */

/**
 * Dossier mark: the original black tile with three stacked layers.
 * `src/app/icon.tsx`, `apple-icon.tsx` and `opengraph-image.tsx` draw the same glyph.
 */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" role="img" aria-label="Dossier">
      <defs>
        <linearGradient id="dossier-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1b24" />
          <stop offset="1" stopColor="#07080d" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#dossier-tile)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" fill="none" stroke="rgba(255,255,255,0.14)" />
      <g stroke="#f5f3ff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 8.2 31.6 13.1 20 18 8.4 13.1 20 8.2Z" fill="#f5f3ff" strokeWidth="1.6" />
        <path d="M8.4 20.1 20 25l11.6-4.9" fill="none" strokeWidth="2.75" />
        <path d="M8.4 27.3 20 32.2l11.6-4.9" fill="none" strokeWidth="2.75" />
      </g>
    </svg>
  )
}

export const DOTLESS_I = "ı"

/** Splash lobes: angle (deg), reach, bulb radius, neck radius. Uneven on purpose. viewBox 100, centre 50,52. */
const LOBES = [
  [-82, 36, 8.5, 4.4],
  [-24, 28, 6.4, 3.8],
  [28, 34, 7.6, 4],
  [96, 26, 5.4, 3.4],
  [152, 35, 8.2, 4.2],
  [212, 28, 6, 3.6],
] as const

/** Circles that merge into one splash under the goo filter: body, then neck + bulb per lobe. */
const BLOBS: readonly (readonly [number, number, number])[] = [
  [50, 52, 22],
  [44, 57, 17],
  [57, 47, 16],
  ...LOBES.flatMap(([deg, reach, bulb, neck]) => {
    const a = (deg * Math.PI) / 180
    const at = (k: number) => [+(50 + Math.cos(a) * reach * k).toFixed(2), +(52 + Math.sin(a) * reach * k).toFixed(2)] as const
    return [[...at(0.62), neck], [...at(1), bulb]] as const
  }),
]

/**
 * The dot over the i: one violet ink splash, round lobes on narrow necks, blended by an SVG goo filter.
 * Once, on load, a drop falls and the splash spreads and settles (site.css "Ink splash"). No hover replay.
 */
export function InkDot() {
  return (
    <span className="wm-dot" data-dot>
      <svg className="wm-splash" viewBox="0 0 100 100" aria-hidden focusable="false">
        <defs>
          <filter id="wm-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
        <g className="wm-splat" filter="url(#wm-goo)">
          {BLOBS.map(([cx, cy, r], k) => (
            <circle key={k} cx={cx} cy={cy} r={r} />
          ))}
        </g>
        <path className="wm-fall" d="M50 20C50 20 43 33 43 38a7 7 0 0 0 14 0C57 33 50 20 50 20Z" />
      </svg>
    </span>
  )
}
/** The Dossier wordmark: signature script, a dotless i with an ink-drop dot. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark", className)}>
      <span aria-hidden="true">
        Doss
        <span className="wm-i">
          {DOTLESS_I}
          <InkDot />
        </span>
        er
      </span>
      <span className="sr-only">Dossier</span>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("wm-host inline-flex items-center gap-2.5", className)}>
      <LogoGlyph className="size-9 shrink-0" />
      <Wordmark />
    </span>
  )
}
