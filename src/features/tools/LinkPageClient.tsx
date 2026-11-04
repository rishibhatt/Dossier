"use client"

import { useRef, useState, type ReactNode } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"
import { Check, Share } from "lucide-react"

import type { ThemeId } from "@/features/tools/linkPage"

gsap.registerPlugin(useGSAP, SplitText)

const MOTION_OK = "(prefers-reduced-motion: no-preference)"

/**
 * The page's one authored moment, per look. Every look: name, links and logos rise into place in reading order.
 * Marquee: the bio runs as a ticker strip that slows and stops under the pointer or a finger. Highlight: the name's
 * letters rise from the baseline, a violet marker sweeps behind it, and the links wipe in. Reduced motion: nothing
 * moves and the still state is complete (the marker drawn, the ticker still).
 */
export function LinkPageMotion({ theme, name, children }: { theme: ThemeId; name: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // A background tab draws no frames: the entrance would hold the page hidden until it is opened. Skip it there.
        if (document.visibilityState !== "visible") return
        const root = ref.current
        if (!root) return

        if (theme === "highlight") {
          const el = root.querySelector<HTMLElement>("[data-lp-name]")
          if (!el) return
          const split = SplitText.create(el, { type: "chars", mask: "chars" })
          gsap
            .timeline()
            .fromTo(root.querySelectorAll(".lp-photo, .lp-bio, .lp-icons"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0)
            .fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.025 }, 0.1)
            .fromTo(el, { backgroundSize: "0% 0.38em" }, { backgroundSize: "100% 0.38em", duration: 0.9, ease: "power3.inOut" }, 0.55)
            .fromTo(root.querySelectorAll(".lp-links > li"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "expo.out", stagger: 0.07 }, 0.7)
          return () => split.revert()
        }

        gsap.fromTo(root.querySelectorAll("[data-lp-rise]"), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.05 })

        if (theme === "marquee") {
          const strip = root.querySelector<HTMLElement>(".lp-ticker")
          const track = root.querySelector<HTMLElement>(".lp-ticker-track")
          if (!strip || !track) return
          const tick = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 28, ease: "none", repeat: -1 })
          const hold = contextSafe!(() => gsap.to(tick, { timeScale: 0, duration: 0.5, ease: "power2.out" }))
          const go = contextSafe!(() => gsap.to(tick, { timeScale: 1, duration: 0.6, ease: "power2.in" }))
          strip.addEventListener("pointerenter", hold)
          strip.addEventListener("pointerleave", go)
          strip.addEventListener("pointercancel", go)
          return () => {
            strip.removeEventListener("pointerenter", hold)
            strip.removeEventListener("pointerleave", go)
            strip.removeEventListener("pointercancel", go)
          }
        }
      })
    },
    { scope: ref, dependencies: [theme, name], revertOnUpdate: true }
  )
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  )
}

/** Native share sheet on phones; copies the link elsewhere. */
export function LinkShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ url, title })
        return
      } catch (e) {
        if ((e as Error).name === "AbortError") return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt("Copy this link", url)
    }
  }
  return (
    <button type="button" className="lp-share" onClick={share}>
      {copied ? <Check aria-hidden /> : <Share aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
    </button>
  )
}

/** A remote image (photo or favicon) that quietly becomes the fallback when its host does not serve it. */
export function RemoteImage({ src, size, className, fallback }: { src: string; size: number; className: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState<string | null>(null)
  if (failed === src) return <>{fallback}</>
  return (
    // eslint-disable-next-line @next/next/no-img-element -- hotlinked from the owner's chosen host; nothing is stored or proxied
    <img className={className} src={src} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(src)} />
  )
}
