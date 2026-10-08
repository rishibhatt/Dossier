"use client"

import { useRef, useState } from "react"
import { ArrowRight, Check, FileText, Shuffle, X } from "lucide-react"

import { gsap, MOTION_OK, useGSAP } from "@/components/marketing/motion/gsap"
import { LookThumb } from "@/features/dossier/components/LookThumb"
import { ProblemNote } from "@/features/dossier/components/UploadZone"
import { checkPdfReadable, formatFileSize, problemFromRejection, type ResumeFileProblem } from "@/features/dossier/lib/resumeFile"
import { PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { messages } from "@/config/messages"
import type { PortfolioGenerationContext } from "@/lib/design/generationContext"
import { STYLE_PRESET_UI } from "@/lib/design/stylePresetsUi"
import { PORTFOLIO_STYLE_PRESETS, type PortfolioStylePreset } from "@/lib/design/stylePrompts"
import { cn } from "@/lib/utils"

type Choice = "auto" | PortfolioStylePreset

type PortfolioStyleConfigureCardProps = {
  file: File
  onGenerate: (ctx: PortfolioGenerationContext, options: { auto: boolean }) => void
  onPickDifferent: () => void
  onReplaceFile: (file: File) => void
  busy: boolean
}

const AUTO_FAN = ["experimental", "creative_dev", "minimal_dev"] as const

/** "rishab-bhatt_resume_final.pdf" becomes "Rishab Bhatt". Falls back to a neutral name. */
function nameFromFile(fileName: string): string {
  const words = fileName
    .replace(/\.pdf$/i, "")
    .split(/[\s._\-()[\]]+/)
    .filter((w) => /^[a-z]{2,}$/i.test(w) && !/^(resume|cv|curriculum|vitae|final|updated|new|latest|copy|draft|profile|pdf)$/i.test(w))
    .slice(0, 3)
  if (words.length === 0) return "Your Name"
  const name = words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ")
  return name.length > 26 ? "Your Name" : name
}

/** Three looks fanned out: what "let Dossier choose" means. */
function AutoFan({ name, bare }: { name: string; bare?: boolean }) {
  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden [container-type:inline-size]", !bare && "bg-[var(--site-paper-deep)]")}>
      {AUTO_FAN.map((k, i) => (
        <span
          key={k}
          className="absolute left-1/2 top-1/2 block w-[58%] overflow-hidden rounded-[2cqw] border border-black/10 shadow-[0_2cqw_5cqw_-2cqw_rgba(16,17,20,0.45)]"
          style={{ transform: `translate(-50%, -50%) translateX(${(i - 1) * 26}%) rotate(${(i - 1) * 7}deg)`, zIndex: i === 2 ? 3 : i }}
        >
          <LookThumb preset={k} name={name} />
        </span>
      ))}
    </div>
  )
}

function Option({
  selected,
  title,
  note,
  onSelect,
  id,
  children,
}: {
  selected: boolean
  title: string
  note: string
  onSelect: () => void
  id: string
  children: React.ReactNode
}) {
  return (
    <label
      data-look
      data-look-id={id}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-1.5 transition-[border-color,box-shadow] duration-300 [transition-timing-function:var(--site-ease)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--site-accent-ink)] sm:p-2",
        selected ? "border-[var(--site-ink)] shadow-[0_0_0_1px_var(--site-ink)]" : "border-[var(--site-rule-strong)] hover:border-[var(--site-ink)]/50"
      )}
    >
      <input type="radio" name="portfolio-style" checked={selected} onChange={onSelect} className="sr-only" />
      <span className="relative block overflow-hidden rounded-xl border border-black/10">
        {children}
        <span
          className={cn(
            "absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[var(--site-ink)] text-[var(--site-paper)] transition-[opacity,transform] duration-300",
            selected ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
          aria-hidden
        >
          <Check className="size-3" strokeWidth={3.5} />
        </span>
      </span>
      <span className="mt-2 block px-1 pb-0.5">
        <span className="block truncate text-sm font-semibold tracking-[-0.01em]">{title}</span>
        <span className="mt-0.5 hidden text-xs leading-snug text-[var(--site-ink-2)] lg:block">{note}</span>
      </span>
    </label>
  )
}

export function PortfolioStyleConfigureCard({ file, onGenerate, onPickDifferent, onReplaceFile, busy }: PortfolioStyleConfigureCardProps) {
  const copy = messages.dossier.buildStyle
  const root = useRef<HTMLDivElement>(null)
  const [choice, setChoice] = useState<Choice>("auto")
  const [problem, setProblem] = useState<ResumeFileProblem | null>(null)
  const picker = useRef<HTMLInputElement>(null)
  const name = nameFromFile(file.name)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from("[data-look]", { y: 14, autoAlpha: 0, duration: 0.6, ease: "power3.out", stagger: 0.05 })
      })
    },
    { scope: root }
  )

  // New look: the preview wipes in from the left.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo("[data-preview-in]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power3.out", clearProps: "clipPath" })
        gsap.fromTo("[data-preview-meta]", { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out", delay: 0.1 })
      })
    },
    { scope: root, dependencies: [choice] }
  )

  const select = (next: Choice) => {
    setChoice(next)
    requestAnimationFrame(() => {
      root.current?.querySelector(`[data-look-id="${next}"]`)?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" })
    })
  }

  const shuffle = () => {
    const pool = PORTFOLIO_STYLE_PRESETS.filter((k) => k !== choice)
    select(pool[Math.floor(Math.random() * pool.length)])
  }

  const meta = choice === "auto" ? { name: "Let Dossier choose", note: "We read your resume and pick the style that suits your kind of work." } : STYLE_PRESET_UI[choice]

  return (
    <div ref={root} className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-[1.5rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[2rem]" style={{ fontFamily: "var(--site-display)" }}>
            {messages.build.styleHeading}
          </h1>
          <p className="mt-1.5 hidden text-sm text-[var(--site-ink-2)] sm:block">{messages.build.styleSub}</p>
        </div>

        <div className="flex w-full min-w-0 items-center gap-1 rounded-xl border border-[var(--site-rule-strong)] bg-white py-1 pl-3 pr-1 sm:w-auto sm:max-w-sm">
          <FileText className="size-4 shrink-0 text-[var(--site-ink-2)]" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">
            {file.name} <span className="site-mono ml-1 text-xs font-normal text-[var(--site-ink-2)]">{formatFileSize(file.size)}</span>
          </p>
          <input
            ref={picker}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={async (e) => {
              const next = e.target.files?.[0]
              e.target.value = ""
              if (!next) return
              if (next.size > PDF_UPLOAD_MAX_BYTES) {
                setProblem(problemFromRejection([{ file: next, errors: [{ code: "file-too-large", message: "" }] }]))
                return
              }
              const bad = await checkPdfReadable(next)
              if (bad) {
                setProblem(bad)
                return
              }
              setProblem(null)
              onReplaceFile(next)
            }}
          />
          <button type="button" disabled={busy} onClick={() => picker.current?.click()} className="ws-quiet-btn shrink-0">
            Replace
          </button>
          <button type="button" disabled={busy} onClick={onPickDifferent} aria-label="Remove this file" title="Remove" className="ws-icon-btn shrink-0">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
      {problem ? <ProblemNote problem={problem} /> : null}

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8">
        {/* Preview: the chosen look with your name on it */}
        <section aria-label="Preview of the selected look" className="flex min-h-[6.5rem] min-w-0 flex-1 flex-col gap-2 lg:min-h-0">
          <div className="bf-preview-box rounded-2xl bg-[var(--site-paper-deep)] p-3 sm:p-6">
            <div className="bf-preview">
              <div
                data-preview-in
                className={cn(choice !== "auto" && "overflow-hidden rounded-xl border border-black/15 bg-white shadow-[0_24px_50px_-30px_rgba(16,17,20,0.5)]")}
              >
                {choice === "auto" ? <AutoFan name={name} bare /> : <LookThumb key={choice} preset={choice} name={name} />}
              </div>
            </div>
          </div>
          <div data-preview-meta className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-sm">
              <span className="font-semibold">{meta.name}</span>
              <span className="hidden text-[var(--site-ink-2)] sm:inline"> / {meta.note}</span>
              <span className="sr-only"> Sample layout using your file name, not your resume content.</span>
            </p>
            <button type="button" disabled={busy} onClick={shuffle} className="ws-quiet-btn !h-9 shrink-0 border border-[var(--site-rule-strong)] bg-white">
              <Shuffle className="size-4" aria-hidden />
              Shuffle
            </button>
          </div>
        </section>

        <fieldset disabled={busy} className="flex min-h-0 min-w-0 flex-col">
          <legend className="sr-only">{copy.presetHeading}</legend>
          <p className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold">
            <span className="hidden lg:inline">{copy.presetHeading}</span>
            {/* Paging cue for the phone carousel, whose scrollbar is hidden. */}
            <span className="sp-data lg:hidden">Swipe for more looks</span>
            <span className="sp-data">{PORTFOLIO_STYLE_PRESETS.length + 1} looks</span>
          </p>
          <div className="bf-looks min-h-0 lg:flex-1">
            <Option
              id="auto"
              selected={choice === "auto"}
              title="Let Dossier choose"
              note="We read your resume and pick the style that suits your kind of work."
              onSelect={() => select("auto")}
            >
              <AutoFan name={name} />
            </Option>
            {PORTFOLIO_STYLE_PRESETS.map((key) => (
              <Option key={key} id={key} selected={choice === key} title={STYLE_PRESET_UI[key].name} note={STYLE_PRESET_UI[key].note} onSelect={() => select(key)}>
                <LookThumb preset={key} name={name} />
              </Option>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-[var(--site-rule)] bg-[var(--site-paper)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-1 sm:pt-0">
        <div className="flex items-center justify-between gap-4">
          <p className="hidden text-sm text-[var(--site-ink-2)] sm:block">Nothing is public until you publish. You can change the look in the studio.</p>
          <button
            type="button"
            disabled={busy}
            className="site-btn site-btn-primary site-btn-has-arrow w-full justify-between sm:ml-auto sm:w-auto sm:min-w-64"
            onClick={() =>
              onGenerate(
                {
                  portfolioStylePreset: choice === "auto" ? "minimal_dev" : choice,
                  designNotes: "",
                  variationSeed: Math.floor(Math.random() * 1_000_000),
                },
                { auto: choice === "auto" }
              )
            }
          >
            <span className="site-btn-label">Continue to studio</span>
            <span className="site-btn-arrow" aria-hidden>
              <ArrowRight className="size-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
