"use client"

import { useCallback, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

function ClassicPanel() {
  return (
    <div className="absolute inset-0 bg-[#F5F0E8] p-4 sm:p-6">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#F8F4ED] shadow-[0_18px_48px_rgba(23,24,31,0.12)]">
        <div className="flex h-9 items-center justify-between border-b border-black/10 bg-white/45 px-4">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-1.5 rounded-full bg-[#F3A7A1]" />
            <span className="size-1.5 rounded-full bg-[#EACB72]" />
            <span className="size-1.5 rounded-full bg-[#A9D4B7]" />
          </div>
          <div className="flex gap-2">
            <span className="size-2 rounded-sm bg-black/30" />
            <span className="size-2 rounded-sm bg-black/20" />
            <span className="size-2 rounded-sm bg-black/20" />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 p-5 sm:p-7">
          <div
            className="absolute right-[-5rem] top-[3.5rem] h-64 w-80 rounded-[48%_52%_42%_58%] opacity-85"
            style={{
              background:
                "radial-gradient(circle at 30% 55%, rgba(8,10,15,.62), transparent 28%), radial-gradient(circle at 62% 28%, rgba(199,188,173,.82), transparent 42%), linear-gradient(135deg, #ded5c8, #918575)",
            }}
            aria-hidden
          />
          <div className="relative z-10 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.04em]">
            <span>Alex Chen</span>
            <span className="h-px w-10 bg-black/20" aria-hidden />
          </div>
          <div className="relative z-10 mt-12 max-w-[13rem] sm:max-w-[16rem] md:mt-14 md:max-w-[21rem]">
            <p className="font-serif text-[clamp(2rem,4.4vw,4.8rem)] leading-[.96] tracking-[-0.055em] text-[#111318]">
              Product Designer
              <br />& Researcher
            </p>
            <p className="mt-5 hidden max-w-[12rem] text-xs leading-6 text-[#4f5560] sm:block md:max-w-[15rem]">
              Clear structure, refined typography, and a calm portfolio flow.
            </p>
          </div>
          <div className="absolute bottom-8 left-5 z-10 flex items-center gap-7 text-[11px] font-bold sm:left-7">
            <span>Selected work</span>
            <span className="text-black/35">01 / 06</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreativePanel() {
  return (
    <div className="absolute inset-0 bg-[#090B12] p-4 sm:p-6">
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/12 bg-[#080A0F] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 76% 78%, rgba(109,92,246,.42), transparent 30%), radial-gradient(circle at 58% 38%, rgba(255,255,255,.16), transparent 20%), linear-gradient(180deg, #070911 0%, #111521 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute bottom-0 right-0 h-[72%] w-[74%] opacity-85"
          style={{
            clipPath: "polygon(8% 100%, 42% 18%, 58% 58%, 72% 30%, 100% 100%)",
            background: "linear-gradient(135deg, rgba(255,255,255,.82), rgba(83,89,112,.28) 50%, rgba(7,9,16,.96))",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-white/62">
            <span>Dossier</span>
            <span className="h-px w-10 bg-white/20" aria-hidden />
          </div>
          <div>
            <p className="font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.82] tracking-[-0.06em] text-[#F3EEE5] drop-shadow">
              ALEX
              <br />
              CHEN
            </p>
            <p className="mt-5 max-w-[18rem] text-[11px] font-bold uppercase tracking-[0.24em] text-[#B8B0FF]">
              Product designer & researcher
            </p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <p className="max-w-[18rem] text-xs leading-6 text-white/58">
              A more cinematic presentation for work that benefits from motion, mood, and expression.
            </p>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/18 bg-white/8 text-white">
              +
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ModeCompareSlider() {
  const [split, setSplit] = useState(50)
  const [dragging, setDragging] = useState(false)

  const updateFromPointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const next = ((event.clientX - rect.left) / rect.width) * 100
    setSplit(Math.min(82, Math.max(18, Math.round(next))))
  }, [])

  return (
    <div
      className="mk-mode-card relative select-none touch-pan-y"
      aria-label="Drag to compare Classic and Creative portfolio modes"
      onPointerDownCapture={(event) => {
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
        updateFromPointer(event)
      }}
      onPointerMoveCapture={(event) => {
        if (dragging) updateFromPointer(event)
      }}
      onPointerUpCapture={() => setDragging(false)}
      onPointerCancelCapture={() => setDragging(false)}
    >
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        <ClassicPanel />
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
        <CreativePanel />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/85 shadow-[0_0_18px_rgba(8,10,15,0.24)]"
        style={{ left: `${split}%` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/92 text-[var(--mk-accent)] shadow-[0_16px_44px_rgba(23,24,31,0.22)]"
        style={{ left: `${split}%` }}
        aria-hidden
      >
        <span className="flex items-center gap-0.5">
          <ChevronLeft className="size-5" />
          <ChevronRight className="size-5" />
        </span>
      </div>
      <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-full bg-white/82 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#111318] shadow-sm">
        Classic
      </div>
      <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-full border border-white/14 bg-black/42 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm">
        Creative
      </div>
      <input
        aria-label="Compare Classic and Creative modes"
        className="mk-compare-range"
        max={82}
        min={18}
        type="range"
        value={split}
        onInput={(event) => setSplit(Number(event.currentTarget.value))}
        onChange={(event) => setSplit(Number(event.target.value))}
      />
    </div>
  )
}
