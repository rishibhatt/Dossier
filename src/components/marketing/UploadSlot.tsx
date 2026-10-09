"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { AlertCircle, ArrowUp, Loader2 } from "lucide-react"

import { setPendingUpload } from "@/features/dossier/lib/pendingUpload"
import { checkPdfReadable, MAX_MB, problemFromRejection, type ResumeFileProblem } from "@/features/dossier/lib/resumeFile"
import { ROUTES } from "@/lib/constants/routes"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { cn } from "@/lib/utils"

/**
 * The primary action, printed into the sheet as a ruled cell. Drop or tap a PDF; it is checked here,
 * handed to the builder in memory, and the builder opens on the "pick a look" step.
 */
export function UploadSlot({ className, label = "Upload your resume", id = "upload" }: { className?: string; label?: string; id?: string }) {
  const router = useRouter()
  const [problem, setProblem] = useState<ResumeFileProblem | null>(null)
  const [busy, setBusy] = useState(false)

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return
      setBusy(true)
      setProblem(null)
      const bad = await checkPdfReadable(file)
      if (bad) {
        setProblem(bad)
        setBusy(false)
        return
      }
      setPendingUpload(file)
      router.push(ROUTES.build)
    },
    [router]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (files) => void onDrop(files),
    onDropRejected: (r) => setProblem(problemFromRejection(r)),
    accept: Object.fromEntries(PDF_ALLOWED_MIME_TYPES.map((m) => [m, [".pdf"]])),
    maxSize: PDF_UPLOAD_MAX_BYTES,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: busy,
  })

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        data-over={isDragActive || undefined}
        className="sp-slot group relative border border-dashed border-[var(--site-ink)] bg-[var(--site-sheet)] p-2 transition-colors data-[over]:bg-[var(--site-accent-wash)]"
      >
        <input {...getInputProps()} id={`${id}-input`} aria-label={label} />
        <button
          type="button"
          onClick={open}
          disabled={busy}
          aria-describedby={`${id}-hint`}
          className="flex min-h-[4.5rem] w-full items-center gap-4 bg-[var(--site-ink)] px-4 text-left text-[var(--site-paper)] transition-[background-color,color] duration-150 active:bg-[var(--site-paper)] active:text-[var(--site-ink)] enabled:hover:bg-[#24262e] disabled:cursor-progress"
          style={{ borderRadius: "var(--site-radius)" }}
        >
          <span className="grid size-10 shrink-0 place-items-center border border-current/30" style={{ borderRadius: "2px" }}>
            {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ArrowUp className="size-5" aria-hidden />}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold tracking-[-0.01em]">{busy ? "Opening the builder" : label}</span>
            <span className="block text-sm opacity-75">
              <span className="hidden sm:inline">Drop a PDF here, or tap to choose</span>
              <span className="sm:hidden">Tap to choose a PDF</span>
            </span>
          </span>
        </button>
        <p id={`${id}-hint`} className="sp-data flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 pt-2">
          <span>PDF up to {MAX_MB} MB</span>
          <span>Free account, no card</span>
        </p>
      </div>
      {problem ? (
        <p role="alert" className={cn("mt-3 flex gap-2 text-sm text-[var(--site-danger)]")}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <b className="font-semibold">{problem.title}</b> {problem.fix}
          </span>
        </p>
      ) : null}
    </div>
  )
}
