import { Check, ChevronLeft, ChevronRight, Layers } from "lucide-react"

import { LogoMark } from "@/components/marketing/MarketingPrimitives"

function BrowserDots() {
  return (
    <div className="mk-browser-chrome" aria-hidden>
      <span className="mk-browser-dot bg-[#F1A9A0]" />
      <span className="mk-browser-dot bg-[#E9D28B]" />
      <span className="mk-browser-dot bg-[#9AC7B4]" />
    </div>
  )
}

export function HeroPortfolioMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] lg:max-w-none">
      <div className="mk-browser-card">
        <BrowserDots />
        <div className="relative min-h-[calc(35rem-2.25rem)] overflow-hidden bg-[#F4F0E8] px-7 py-8 sm:px-12 sm:py-10">
          <div className="mk-abstract-blob" aria-hidden />
          <div className="relative z-[1] flex items-center justify-between text-[11px] font-bold">
            <span>ALEX CHEN</span>
            <div className="hidden items-center gap-6 sm:flex">
              <span>Work</span>
              <span>About</span>
              <span>Contact</span>
            </div>
          </div>
          <div className="relative z-[1] mt-20 max-w-[28rem] sm:mt-24">
            <p className="mk-serif-title">Product Designer &amp; Researcher</p>
            <p className="mt-7 max-w-[18rem] text-sm leading-7 text-[#363940]">
              I design digital products that create clarity, drive impact, and solve real problems.
            </p>
            <button className="mt-7 rounded-lg border border-black/20 bg-white/40 px-5 py-3 text-xs font-bold text-[#101114]">
              View my work
            </button>
          </div>
          <div className="relative z-[1] mt-24 flex items-center gap-7 text-[11px] font-bold">
            <span>Selected work</span>
            <span className="text-black/35">01 / 06</span>
          </div>
        </div>
      </div>

      <div className="mk-phone-card p-5">
        <div className="mb-12 flex items-center justify-between text-[10px] font-bold">
          <span>ALEX CHEN</span>
          <span className="h-2 w-4 border-y border-black/70" aria-hidden />
        </div>
        <p className="font-serif text-[28px] leading-[0.98] tracking-[-0.06em]">Product Designer &amp; Researcher</p>
        <p className="mt-5 text-[11px] leading-5 text-[#4f5560]">
          I design digital products that create clarity, drive impact, and solve real problems.
        </p>
        <button className="mt-5 rounded-lg border border-black/20 px-4 py-2 text-[10px] font-bold">View my work</button>
      </div>

      <div className="mk-studio-peek">
        <div className="flex h-9 items-center justify-between border-b border-white/10 px-4 text-[9px] text-white/70">
          <span>Dossier Studio</span>
          <span>Saved</span>
        </div>
        <div className="grid grid-cols-[72px_1fr_92px] gap-2 p-3">
          <div className="space-y-2">
            {["Hero", "Work", "Skills"].map((item) => (
              <div key={item} className="rounded-md bg-white/[0.06] px-2 py-2 text-[9px] text-white/60">
                {item}
              </div>
            ))}
          </div>
          <div className="min-h-28 rounded-lg bg-[#EEE8DD]" />
          <div className="space-y-2">
            <div className="h-7 rounded-md bg-white/[0.08]" />
            <div className="h-12 rounded-md bg-white/[0.08]" />
            <div className="h-7 rounded-md bg-white/[0.08]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudioMockup() {
  const sections = ["Hero", "About", "Experience", "Projects", "Skills", "Case Studies", "Contact"]
  return (
    <div className="mk-studio-mockup">
      <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#090C13] px-4 text-xs text-white/60">
        <div className="flex items-center gap-3">
          <span className="[&_.mk-brand-mark]:size-7 [&_.mk-brand-mark]:rounded-lg [&_.mk-brand-icon]:size-5 [&_span:last-child]:text-sm [&_span:last-child]:text-white">
            <LogoMark />
          </span>
          <span>/ My Portfolio</span>
          <span className="rounded-full bg-white/5 px-2 py-1">Saved</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-md border border-white/10 px-3 py-1.5">Preview</span>
          <span className="rounded-md bg-[var(--mk-accent)] px-3 py-1.5 font-bold text-white">Publish</span>
        </div>
      </div>
      <div className="grid min-h-[29.5rem] grid-cols-1 lg:grid-cols-[180px_1fr_210px]">
        <aside className="hidden border-r border-white/10 bg-[#0B0E16] p-4 lg:block">
          <p className="mb-4 text-xs font-semibold text-white/70">Sections</p>
          <div className="space-y-2">
            {sections.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg bg-white/[0.045] px-3 py-2.5 text-xs text-white/70">
                <span>{item}</span>
                <Layers className="size-3" />
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg bg-white/[0.06] py-2.5 text-xs font-semibold text-white/75">+ Add section</button>
        </aside>
        <div className="bg-[#111520] p-4 sm:p-6">
          <div className="relative mx-auto min-h-[26rem] max-w-[620px] overflow-hidden rounded-sm bg-[#F4F0E8] px-7 py-8 text-[#101114] shadow-2xl">
            <div className="mk-abstract-blob scale-75 opacity-75" aria-hidden />
            <div className="relative z-[1] flex items-center justify-between text-[10px] font-bold">
              <span>ALEX CHEN</span>
              <span className="text-black/30">01</span>
            </div>
            <div className="relative z-[1] mt-20 max-w-[26rem]">
              <p className="font-serif text-[52px] leading-[0.98] tracking-[-0.06em]">Product Designer &amp; Researcher</p>
              <p className="mt-6 max-w-[18rem] text-xs leading-6 text-[#4f5560]">
                I design digital products that create clarity, drive impact, and solve real problems.
              </p>
              <button className="mt-6 rounded-md border border-black/20 px-4 py-2 text-[10px] font-bold">View my work</button>
            </div>
          </div>
        </div>
        <aside className="hidden border-l border-white/10 bg-[#0B0E16] p-4 lg:block">
          <div className="mb-4 flex gap-2 text-[11px] font-semibold">
            <span className="text-white">Design</span>
            <span className="text-white/35">Content</span>
          </div>
          <p className="mb-2 text-xs text-white/50">Theme</p>
          <div className="rounded-lg bg-white/[0.05] px-3 py-3 text-xs text-white">Minimal Editorial</div>
          <div className="mt-4 flex gap-2">
            {["#f4f0e8", "#111520", "#6d5cf6", "#d8d1ff"].map((color) => (
              <span key={color} className="size-5 rounded-full border border-white/20" style={{ background: color }} />
            ))}
          </div>
          <p className="mb-2 mt-6 text-xs text-white/50">Typography</p>
          <div className="space-y-2">
            <div className="rounded-lg bg-white/[0.05] px-3 py-3 text-xs text-white">Recoleta</div>
            <div className="rounded-lg bg-white/[0.05] px-3 py-3 text-xs text-white">Inter</div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export function ModeComparisonMockup() {
  return (
    <div className="mk-mode-card relative grid grid-cols-1 md:grid-cols-2">
      <div className="relative min-h-[20rem] overflow-hidden bg-[#F5F0E8] p-6">
        <div className="mb-8 flex h-8 items-center justify-between rounded-t-xl bg-[#22252C] px-3 text-[9px] text-white/70">
          <span className="font-bold">Dossier</span>
          <span>Classic</span>
        </div>
        <p className="max-w-[15rem] font-serif text-[30px] leading-[1] tracking-[-0.05em]">Hi, I am Alex Chen Product Designer &amp; Researcher</p>
        <div className="absolute bottom-7 left-12 w-[250px] rounded-xl bg-white p-5 shadow-xl">
          <p className="mb-3 text-xs font-bold">About me</p>
          <p className="text-[10px] leading-5 text-[#59606B]">
            Portfolio sections stay clear, structured, and ready for professional review.
          </p>
        </div>
      </div>
      <div className="relative min-h-[20rem] overflow-hidden bg-[#070A12] p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(109,92,246,0.28),transparent_30%),linear-gradient(145deg,#070A12,#111827)]" />
        <div className="absolute bottom-0 right-0 h-52 w-72 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.18)_26%,transparent_42%),linear-gradient(145deg,#111827,#05070D)] opacity-80" />
        <div className="relative z-[1] flex h-full flex-col justify-center">
          <p className="font-serif text-[64px] leading-[0.84] tracking-[-0.08em] text-white/90">ALEX CHEN</p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-white/45">Product designer &amp; researcher</p>
        </div>
      </div>
      <div className="absolute left-1/2 top-1/2 hidden size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--mk-accent)] shadow-xl md:flex">
        <ChevronLeft className="size-4" />
        <ChevronRight className="size-4" />
      </div>
    </div>
  )
}

export function ProcessIcon({ type }: { type: "upload" | "structure" | "design" | "live" }) {
  if (type === "upload") {
    return (
      <div className="mk-process-visual">
        <div className="relative grid size-20 place-items-center rounded-2xl border border-black/10 bg-white/72 shadow-[0_14px_34px_rgba(23,24,31,0.07)]">
          <div className="h-14 w-12 rounded-xl border border-black/10 bg-[#FBFAF7] p-3">
            <span className="block h-1 w-7 rounded-full bg-black/14" />
            <span className="mt-2 block h-1 w-8 rounded-full bg-black/12" />
            <span className="mt-2 block h-1 w-6 rounded-full bg-black/12" />
          </div>
          <span className="absolute bottom-4 right-3 rounded-md bg-[var(--mk-accent)] px-2 py-1 text-[10px] font-extrabold text-white shadow-[0_10px_24px_rgba(109,92,246,0.28)]">
            PDF
          </span>
        </div>
      </div>
    )
  }

  if (type === "structure") {
    return (
      <div className="mk-process-visual">
        <div className="grid size-20 place-items-center rounded-2xl border border-black/10 bg-white/72 shadow-[0_14px_34px_rgba(23,24,31,0.07)]">
          <div className="w-12 space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="grid size-4 place-items-center rounded bg-[var(--mk-accent)] text-white">
                  <Check className="size-2.5" aria-hidden />
                </span>
                <span className="h-1.5 flex-1 rounded-full bg-[var(--mk-accent)]/25" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === "design") {
    return (
      <div className="mk-process-visual">
        <div className="grid size-20 grid-cols-2 gap-2 rounded-2xl border border-black/10 bg-white/72 p-2 shadow-[0_14px_34px_rgba(23,24,31,0.07)]">
          <span className="rounded-lg bg-[#56515D]" />
          <span className="rounded-lg bg-[#0B0E16]" />
          <span className="grid place-items-center rounded-lg bg-white text-lg font-semibold shadow-sm">Aa</span>
          <span className="rounded-lg bg-[#EEE9DF]" />
        </div>
      </div>
    )
  }

  return (
    <div className="mk-process-visual">
      <div className="grid size-20 place-items-center rounded-2xl border border-black/10 bg-white/72 shadow-[0_14px_34px_rgba(23,24,31,0.07)]">
        <div className="h-12 w-16 rounded-lg border border-black/10 bg-[#F8F6F1] p-1">
          <div className="flex h-2 items-center gap-1 border-b border-black/10">
            <span className="size-1 rounded-full bg-black/30" />
            <span className="size-1 rounded-full bg-black/20" />
          </div>
          <div className="mt-2 grid grid-cols-[1fr_1.1fr] gap-1">
            <div>
              <span className="block h-1 w-6 rounded-full bg-black/20" />
              <span className="mt-1 block h-1 w-5 rounded-full bg-black/12" />
              <span className="mt-1 block h-1 w-4 rounded-full bg-black/12" />
            </div>
            <div className="h-7 rounded bg-[linear-gradient(135deg,#E9DFD1,#111521)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
