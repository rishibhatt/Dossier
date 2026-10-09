"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { AlertCircle, ArrowUp, FileText, Loader2 } from "lucide-react"

import { gsap, MOTION_OK, useGSAP } from "@/components/marketing/motion/gsap"
import { checkPdfReadable, formatFileSize, MAX_MB, problemFromRejection, type ResumeFileProblem } from "@/features/dossier/lib/resumeFile"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { cn } from "@/lib/utils"

type UploadZoneProps = {
  className?: string
  onSelectFile: (file: File) => void
  disabled?: boolean
}

export function ProblemNote({ problem, className }: { problem: ResumeFileProblem; className?: string }) {
  return (
    <div role="alert" className={cn("flex gap-3 rounded-xl border border-[#f0b4ae] bg-[#fdf1f0] p-3.5 text-[#8a1c13] sm:p-4", className)}>
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{problem.title}</p>
        <p className="mt-1">{problem.fix}</p>
      </div>
    </div>
  )
}

/** A resume page with lines of text. Lifts when a file is dragged over it. */
function Sheet({ over, busy }: { over: boolean; busy: boolean }) {
  return (
    <span data-sheet className="relative block h-28 w-[5.25rem] shrink-0 sm:h-32 sm:w-24" aria-hidden>
      <span className="absolute inset-0 -rotate-6 rounded-lg border border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)]" />
      <span
        data-sheet-top
        className={cn(
          "absolute inset-0 rotate-3 rounded-lg border bg-white p-3 transition-colors duration-200",
          over ? "border-[var(--site-accent-ink)]" : "border-[var(--site-rule-strong)]"
        )}
      >
        <span className="block h-2 w-3/5 rounded-full bg-[var(--site-ink)]" />
        <span className="mt-2 block h-1 w-2/5 rounded-full bg-[var(--site-ink)]/30" />
        <span className="mt-3 block space-y-1.5">
          {[100, 86, 94, 62].map((w, i) => (
            <span key={i} className="block h-1 rounded-full bg-[var(--site-ink)]/15" style={{ width: `${w}%` }} />
          ))}
        </span>
        <span
          className={cn(
            "absolute -bottom-3 -right-3 grid size-9 place-items-center rounded-full border-2 border-[var(--site-paper)] text-white transition-colors duration-200",
            over ? "bg-[var(--site-accent-ink)]" : "bg-[var(--site-ink)]"
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <ArrowUp className="size-4" strokeWidth={2.5} />}
        </span>
      </span>
    </span>
  )
}

/**
 * First step: pick a PDF. The whole card is the target (drop, click, or Enter / Space),
 * so on a phone it is one large tap. Problems name the cause and the way out.
 */
export function UploadZone({ className, onSelectFile, disabled }: UploadZoneProps) {
  const [problem, setProblem] = useState<ResumeFileProblem | null>(null)
  const [checking, setChecking] = useState<{ name: string; size: number } | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const errRef = useRef<HTMLDivElement>(null)

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0]
      if (!file || disabled) return
      setChecking({ name: file.name, size: file.size })
      const bad = await checkPdfReadable(file)
      setChecking(null)
      if (bad) {
        setProblem(bad)
        return
      }
      setProblem(null)
      onSelectFile(file)
    },
    [disabled, onSelectFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (r) => setProblem(problemFromRejection(r)),
    accept: { [PDF_ALLOWED_MIME_TYPES[0]]: [".pdf"] },
    maxSize: PDF_UPLOAD_MAX_BYTES,
    multiple: false,
    disabled: disabled || Boolean(checking),
  })

  // The sheet lifts and straightens while a file hovers over the box.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.to("[data-sheet]", { y: isDragActive ? -10 : 0, scale: isDragActive ? 1.08 : 1, rotate: isDragActive ? -2 : 0, duration: 0.45, ease: "back.out(1.6)" })
      })
    },
    { scope: root, dependencies: [isDragActive] }
  )

  // Entrance, once.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.from("[data-sheet]", { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out", delay: 0.1 })
      })
    },
    { scope: root }
  )

  useEffect(() => {
    if (problem) errRef.current?.classList.add("bf-shake")
    const t = window.setTimeout(() => errRef.current?.classList.remove("bf-shake"), 450)
    return () => window.clearTimeout(t)
  }, [problem])

  return (
    <div ref={root} className={cn("flex min-h-0 flex-col", className)}>
      <div
        {...getRootProps({
          role: "button",
          "aria-label": "Choose a PDF resume. You can also drop a file here.",
          "data-over": isDragActive,
          "data-problem": Boolean(problem) && !isDragActive,
          className: cn(
            "bf-drop group flex min-h-[15rem] flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.5rem] px-5 py-6 text-center outline-none transition-[background-color,box-shadow] duration-300 sm:gap-5 sm:px-10 lg:max-h-[27rem]",
            isDragActive ? "bg-[var(--site-accent-wash)]" : "bg-white hover:bg-[var(--site-paper-deep)]/40",
            "focus-visible:ring-2 focus-visible:ring-[var(--site-accent-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--site-paper)]",
            (disabled || checking) && "pointer-events-none"
          ),
        })}
      >
        <svg className="bf-drop-border" aria-hidden>
          <rect rx="24" />
        </svg>
        <input {...getInputProps()} />

        <div className="[@media(max-height:620px)]:hidden">
          <Sheet over={isDragActive} busy={Boolean(checking)} />
        </div>

        {checking ? (
          <div className="flex w-full max-w-xs items-center gap-3 rounded-xl border border-[var(--site-rule-strong)] bg-white p-3 text-left" role="status">
            <FileText className="size-5 shrink-0 text-[var(--site-accent-ink)]" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{checking.name}</span>
              <span className="site-mono text-xs text-[var(--site-ink-2)]">{formatFileSize(checking.size)} · checking</span>
            </span>
          </div>
        ) : (
          <div>
            <p className="text-xl font-bold leading-tight tracking-[-0.025em] sm:text-2xl" style={{ fontFamily: "var(--site-display)" }}>
              {isDragActive ? "Let go to add it" : "Drop your resume here"}
            </p>
            <p className="mt-1.5 text-[0.9375rem] text-[var(--site-ink-2)]">{isDragActive ? "It stays on your device until you build." : "or choose a PDF from your device"}</p>
          </div>
        )}

        <span className={cn("site-btn site-btn-primary w-full max-w-xs sm:w-auto sm:min-w-52", (checking || isDragActive) && "invisible")} aria-hidden>
          <span className="site-btn-label">Choose a PDF</span>
        </span>

        <p className="text-sm text-[var(--site-ink-2)]">PDF only, up to {MAX_MB} MB. Text you can select works best.</p>
      </div>

      <div ref={errRef}>{problem ? <ProblemNote problem={problem} className="mt-3" /> : null}</div>
    </div>
  )
}
