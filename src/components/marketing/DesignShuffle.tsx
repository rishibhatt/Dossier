"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { ChevronLeft, ChevronRight, Pause, Play, Shuffle } from "lucide-react"

import { Highlight } from "@/components/marketing/Highlight"
import { SiteButton } from "@/components/marketing/primitives"
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/marketing/motion/gsap"
import { SAMPLE_PERSON as P } from "@/components/marketing/sample"
import { ROUTES } from "@/lib/constants/routes"
import { STYLE_PRESET_UI } from "@/lib/design/stylePresetsUi"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"

/** The same five starting styles the builder offers, plus the extra tokens the miniature sites need. */
const EXTRAS: Record<PortfolioStylePreset, { mute: string; rule: string; font: string; fontName: string; radius: string }> = {
  minimal_dev: { mute: "#525866", rule: "rgba(16,17,20,0.14)", font: "var(--site-display)", fontName: "Bricolage Grotesque", radius: "0.5em" },
  creative_dev: { mute: "#a9adb9", rule: "rgba(243,241,234,0.2)", font: "var(--font-inter), system-ui, sans-serif", fontName: "Inter", radius: "999px" },
  designer: { mute: "#41524a", rule: "rgba(23,35,27,0.16)", font: "var(--site-display)", fontName: "Bricolage Grotesque", radius: "0.35em" },
  editorial: { mute: "#4a4a4a", rule: "rgba(17,17,17,0.22)", font: "Georgia, 'Times New Roman', serif", fontName: "Georgia", radius: "0.1em" },
  experimental: { mute: "#3c4a40", rule: "rgba(16,17,20,0.9)", font: "var(--site-display)", fontName: "Bricolage Grotesque", radius: "0" },
}

const LOOKS = PORTFOLIO_STYLE_PRESETS.map((id) => ({ id, ...STYLE_PRESET_UI[id], ...EXTRAS[id] }))
type Look = (typeof LOOKS)[number]

const AUTOPLAY_SECONDS = 4.2

function vars(l: Look): CSSProperties {
  return {
    "--bg": l.bg,
    "--ink": l.ink,
    "--mute": l.mute,
    "--accent": l.accent,
    "--rule": l.rule,
    "--r": l.radius,
    "--f": l.font,
  } as CSSProperties
}

function Jobs({ big }: { big?: boolean }) {
  return (
    <div data-m>
      {P.jobs.map((j) => (
        <div key={j.org} className="lk-job">
          <span>
            <b>{j.org}</b>
            <small>{j.title}</small>
          </span>
          <time>{big ? j.years : j.years.replace(/\s/g, "")}</time>
        </div>
      ))}
    </div>
  )
}

function Chips() {
  return (
    <div data-m className="lk-chips">
      {P.skills.map((s) => (
        <span key={s}>{s}</span>
      ))}
    </div>
  )
}

function Mini({ id }: { id: PortfolioStylePreset }) {
  if (id === "creative_dev") {
    return (
      <div className="lk lk-creative">
        <span data-m className="lk-pill">
          {P.role}
        </span>
        <h3 data-m className="lk-name">
          {P.name}
        </h3>
        <p data-m className="lk-mute lk-n">
          {P.city}
        </p>
        <div data-m className="lk-ticker" aria-hidden>
          {[...P.skills, ...P.skills].map((s, i) => (
            <span key={`${s}-${i}`}>{s} /</span>
          ))}
        </div>
        <div className="lk-cols">
          <Jobs />
          <div className="lk-s lk-mute" data-m>
            <p>{P.bio}</p>
          </div>
        </div>
        <span data-m className="lk-btn">
          Email Meera
        </span>
      </div>
    )
  }

  if (id === "designer") {
    const tiles = [
      { label: P.jobs[0].org, bg: "#dfeee4", dot: "#2f6b45", size: "70%", pos: { right: "-10%", top: "-20%" } },
      { label: P.jobs[1].org, bg: "#2f6b45", dot: "#bcd9c6", size: "60%", pos: { left: "-15%", top: "-10%" }, light: true },
      { label: P.credential, bg: "#bcd9c6", dot: "#ffffff", size: "55%", pos: { right: "5%", top: "10%" } },
    ]
    return (
      <div className="lk lk-designer">
        <div className="lk-head" data-m>
          <div>
            <h3 className="lk-name">{P.name}</h3>
            <p className="lk-mute">
              {P.role}, {P.city}
            </p>
          </div>
          <span className="lk-btn">Email Meera</span>
        </div>
        <div className="lk-tiles">
          {tiles.map((t) => (
            <div key={t.label} data-m className="lk-tile" style={{ background: t.bg, color: t.light ? "#fff" : "#17231b" }}>
              <i style={{ background: t.dot, width: t.size, aspectRatio: "1", ...t.pos }} />
              <span style={{ position: "relative" }}>{t.label}</span>
            </div>
          ))}
        </div>
        <div className="lk-s" data-m>
          <Chips />
        </div>
      </div>
    )
  }

  if (id === "editorial") {
    return (
      <div className="lk lk-editorial">
        <div data-m className="lk-mast">
          <span>Portfolio</span>
          <span>{P.city}</span>
        </div>
        <h3 data-m className="lk-name">
          {P.name}
        </h3>
        <p data-m className="lk-dek">
          <span className="lk-sq" />
          {P.role}. {P.bio}
        </p>
        <div className="lk-cols">
          <Jobs />
          <div className="lk-s" data-m>
            <p className="lk-mute">{P.jobs[0].line}</p>
            <p style={{ marginTop: "0.6em" }}>{P.skills.join(", ")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (id === "experimental") {
    const [first, last] = P.name.split(" ")
    return (
      <div className="lk lk-experimental">
        <div className="lk-frame">
          <h3 data-m className="lk-name">
            {first}
            <br />
            {last}.
          </h3>
          <div data-m className="lk-band">
            {P.role} / {P.city} / {P.skills[0]} / {P.skills[2]} / {P.role}
          </div>
          <div className="lk-cols">
            <Jobs />
            <span data-m className="lk-btn lk-s">
              Email Meera
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lk lk-minimal">
      <div data-m className="lk-nav">
        <b>{P.name}</b>
        <span>
          <span>Work</span>
          <span>Skills</span>
          <span>Contact</span>
        </span>
      </div>
      <div className="lk-cols">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
          <h3 data-m className="lk-name">
            {P.name}
          </h3>
          <p data-m className="lk-mute">
            {P.role} in {P.city}. {P.bio}
          </p>
          <span data-m className="lk-btn">
            Email Meera
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9em" }}>
          <Jobs />
          <div className="lk-s">
            <Chips />
          </div>
        </div>
      </div>
    </div>
  )
}

function ThumbArt({ l }: { l: Look }) {
  return (
    <span className="ds-thumb-art" style={{ background: l.bg, display: "block" }} aria-hidden>
      <span className="block h-[10%] w-[55%] rounded-full" style={{ background: l.ink }} />
      <span className="mt-[9%] block h-[7%] w-[80%] rounded-full opacity-35" style={{ background: l.ink }} />
      <span className="mt-[6%] block h-[7%] w-[60%] rounded-full opacity-35" style={{ background: l.ink }} />
      <span className="mt-[12%] block h-[16%] w-[30%] rounded-sm" style={{ background: l.accent }} />
    </span>
  )
}

export function DesignShuffle() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLUListElement>(null)
  const note = useRef<HTMLDivElement>(null)
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])

  const cur = useRef(0)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const auto = useRef<gsap.core.Tween | null>(null)
  const runningRef = useRef(true)
  const goRef = useRef<(to: number, origin?: [number, number]) => void>(() => {})

  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(false)
  const [held, setHeld] = useState(false)

  const go = useCallback((to: number, origin: [number, number] = [50, 100]) => {
    const n = LOOKS.length
    const next = ((to % n) + n) % n
    const from = cur.current
    if (next === from) return
    tl.current?.progress(1)
    const a = layers.current[from]
    const b = layers.current[next]
    cur.current = next
    setActive(next)
    if (!a || !b) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      a.removeAttribute("data-on")
      b.setAttribute("data-on", "")
      return
    }

    const [ox, oy] = origin
    gsap.set(b, { visibility: "visible", zIndex: 3, clipPath: `circle(0% at ${ox}% ${oy}%)` })
    gsap.set(a, { zIndex: 2 })
    const items = b.querySelectorAll("[data-m]")
    tl.current = gsap
      .timeline({
        onComplete: () => {
          a.removeAttribute("data-on")
          gsap.set(a, { visibility: "hidden", zIndex: 0, scale: 1, clearProps: "clipPath" })
          b.setAttribute("data-on", "")
          gsap.set(b, { zIndex: 2, clearProps: "clipPath,visibility" })
        },
      })
      .to(b, { clipPath: `circle(145% at ${ox}% ${oy}%)`, duration: 0.95, ease: "power3.inOut" }, 0)
      .to(a, { scale: 0.96, duration: 0.95, ease: "power2.inOut" }, 0)
      .fromTo(items, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: "power3.out" }, 0.25)
  }, [])

  useEffect(() => {
    goRef.current = go
  }, [go])

  // Entrance, scroll parallax on the sheets behind the stage, and in-view tracking.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from("[data-ds-in]", {
          y: 56,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 72%", once: true },
        })
        gsap.fromTo(
          "[data-ds-back='a']",
          { yPercent: 6, rotate: 0.5 },
          { yPercent: -6, rotate: 2.2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } }
        )
        gsap.fromTo(
          "[data-ds-back='b']",
          { yPercent: 9, rotate: -0.5 },
          { yPercent: -3, rotate: -3, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.9 } }
        )
      })
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => setInView(self.isActive),
      })
      return () => trigger.kill()
    },
    { scope: root }
  )

  // Autoplay is off for people who ask for reduced motion.
  useEffect(() => {
    // The media query only exists in the browser, so it is read after mount to keep server and client markup identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false)
  }, [])

  const running = playing && inView && !held
  useEffect(() => {
    runningRef.current = running
    auto.current?.paused(!running)
  }, [running])

  // One progress bar per look. It fills while the look is on screen, then the next look wipes in.
  useEffect(() => {
    gsap.set(bars.current, { scaleX: 0 })
    const bar = bars.current[active]
    if (!bar || !playing) return
    const t = gsap.to(bar, {
      scaleX: 1,
      duration: AUTOPLAY_SECONDS,
      ease: "none",
      paused: !runningRef.current,
      onComplete: () => goRef.current(cur.current + 1, [50, 100]),
    })
    auto.current = t
    return () => {
      t.kill()
    }
  }, [active, playing])

  // Active thumbnail stays in view inside the strip, and the caption swaps.
  useEffect(() => {
    const s = strip.current
    const t = thumbs.current[active]
    if (s && t && s.scrollWidth > s.clientWidth + 2) {
      s.scrollTo({ left: t.offsetLeft - (s.clientWidth - t.offsetWidth) / 2, behavior: "smooth" })
    }
    const n = note.current
    if (n && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(n, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", overwrite: true })
    }
  }, [active])

  const pick = (i: number, origin?: [number, number]) => {
    setPlaying(false)
    go(i, origin)
  }

  const shuffle = () => {
    setPlaying(false)
    const others = LOOKS.map((_, i) => i).filter((i) => i !== cur.current)
    go(others[Math.floor(Math.random() * others.length)]!, [50, 50])
  }

  // Tap the stage for the next look (the wipe starts where you tapped); swipe to move either way.
  const down = useRef<{ x: number; y: number } | null>(null)
  const onStageDown = (e: ReactPointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY }
  }
  const onStageUp = (e: ReactPointerEvent) => {
    const d = down.current
    down.current = null
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      pick(cur.current + (dx < 0 ? 1 : -1), [dx < 0 ? 100 : 0, 50])
      return
    }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const r = canvas.current?.getBoundingClientRect()
      const origin: [number, number] = r ? [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100] : [50, 50]
      pick(cur.current + 1, origin)
    }
  }

  // Mouse drag on the look strip (touch scrolls it natively).
  const stripDrag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const onStripDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || !strip.current) return
    stripDrag.current = { x: e.clientX, left: strip.current.scrollLeft, moved: false }
  }
  const onStripMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = stripDrag.current
    const s = strip.current
    if (!d || !s) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) {
      d.moved = true
      s.setAttribute("data-drag", "")
    }
    if (d.moved) s.scrollLeft = d.left - dx
  }
  const onStripUp = () => {
    strip.current?.removeAttribute("data-drag")
    window.setTimeout(() => {
      stripDrag.current = null
    }, 0)
  }

  const look = LOOKS[active]!

  return (
    <section
      ref={root}
      id="designs"
      aria-labelledby="designs-title"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
      className="scroll-mt-24 overflow-x-clip border-t border-[var(--site-rule)] bg-[var(--site-paper-deep)] py-20 sm:py-28"
    >
      <div className="site-wrap grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <div data-ds-in className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
          <h2 id="designs-title" className="site-h2">
            Same resume. <Highlight>Different site.</Highlight>
          </h2>
          <p className="site-lead mt-5">
            Tap a look and the colours, type and layout change together. Shuffling never touches your words.
          </p>
        </div>

        <div data-ds-in className="ds-wrap lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <span data-ds-back="b" className="ds-back ds-back-b" aria-hidden />
          <span data-ds-back="a" className="ds-back" aria-hidden />
          <div
            ref={stage}
            className="ds-stage cursor-pointer"
            role="group"
            aria-roledescription="carousel"
            aria-label="Sample portfolio in five looks. Tap to see the next look."
            onPointerDown={onStageDown}
            onPointerUp={onStageUp}
            onPointerCancel={() => (down.current = null)}
          >
            <div className="frame-bar">
              <span className="frame-dot" />
              <span className="frame-dot" />
              <span className="frame-dot" />
              <span className="ml-2 min-w-0 truncate text-xs text-[var(--site-ink-2)]">Sample portfolio, made up for this demo</span>
              <span className="ml-auto shrink-0 pl-2 text-xs font-medium">{look.name}</span>
            </div>
            <div ref={canvas} className="ds-canvas">
              {LOOKS.map((l, i) => (
                <div
                  key={l.id}
                  ref={(el) => {
                    layers.current[i] = el
                  }}
                  className="ds-layer"
                  style={vars(l)}
                  {...(i === 0 ? { "data-on": "" } : {})}
                  aria-hidden
                >
                  <Mini id={l.id} />
                </div>
              ))}
            </div>
          </div>

          <ul
            ref={strip}
            className="ds-strip relative mt-5"
            aria-label="Choose a look"
            onPointerDown={onStripDown}
            onPointerMove={onStripMove}
            onPointerUp={onStripUp}
            onPointerLeave={onStripUp}
          >
            {LOOKS.map((l, i) => (
              <li key={l.id} className="contents">
                <button
                  ref={(el) => {
                    thumbs.current[i] = el
                  }}
                  type="button"
                  className="ds-thumb"
                  aria-pressed={i === active}
                  onClick={(e) => {
                    if (stripDrag.current?.moved) return
                    const r = canvas.current?.getBoundingClientRect()
                    pick(i, r ? [50, 50] : undefined)
                    e.currentTarget.blur()
                  }}
                >
                  <ThumbArt l={l} />
                  <span className="mt-2 block truncate text-xs font-semibold">{l.name}</span>
                  <span
                    ref={(el) => {
                      bars.current[i] = el
                    }}
                    className="ds-bar-fill"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div data-ds-in className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div ref={note} className="min-h-[4.5rem] border-l-2 border-[var(--site-ink)] pl-4">
            <p className="text-lg font-bold tracking-[-0.02em]" style={{ fontFamily: "var(--site-display)" }}>
              {look.name}
            </p>
            <p className="mt-1 text-[0.9375rem] text-[var(--site-ink-2)]">
              {look.note} Type: {look.fontName}.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => pick(cur.current - 1, [0, 50])}
              aria-label="Previous look"
              className="site-btn site-btn-ghost site-btn-sm !px-0 w-11"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              aria-label={playing ? "Pause autoplay" : "Start autoplay"}
              className="site-btn site-btn-ghost site-btn-sm !px-0 w-11"
            >
              {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => pick(cur.current + 1, [100, 50])}
              aria-label="Next look"
              className="site-btn site-btn-ghost site-btn-sm !px-0 w-11"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={shuffle} className="site-btn site-btn-quiet site-btn-sm">
              <Shuffle className="size-4" aria-hidden />
              <span className="site-btn-label">Shuffle</span>
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SiteButton href={ROUTES.build} arrow>
              Build my portfolio
            </SiteButton>
            <p className="text-sm text-[var(--site-ink-2)]">Free plan: 3 shuffles a day.</p>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {look.name}
      </p>
    </section>
  )
}
