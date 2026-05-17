"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FileCheck2, FileUp, MousePointer2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { messages } from "@/config/messages"
import { PDF_ALLOWED_MIME_TYPES, PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { cn } from "@/lib/utils"

type UploadZoneProps = {
  className?: string
  onSelectFile: (file: File) => void
  disabled?: boolean
}

export function UploadZone({ className, onSelectFile, disabled }: UploadZoneProps) {
  const copy = messages.dossier

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (!file || disabled) return
      onSelectFile(file)
    },
    [disabled, onSelectFile]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { [PDF_ALLOWED_MIME_TYPES[0]]: [".pdf"] },
    maxSize: PDF_UPLOAD_MAX_BYTES,
    multiple: false,
    noClick: true,
    disabled,
  })

  return (
    <div
      {...getRootProps({
        className: cn(
          "workspace-upload-zone group relative flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden px-6 py-10 text-center transition-all",
          isDragActive && "workspace-upload-zone-active",
          disabled && "pointer-events-none opacity-50",
          className
        ),
      })}
    >
      <input {...getInputProps()} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute left-1/2 top-8 h-24 w-64 -translate-x-1/2 rounded-full bg-black/[0.035] blur-2xl" />
      </div>
      <div className="relative">
        <span className="absolute inset-[-1.1rem] rounded-full border border-black/[0.06]" aria-hidden />
        <span className="absolute inset-[-2rem] rounded-full border border-black/[0.035]" aria-hidden />
        <div className="relative flex size-24 items-center justify-center rounded-full bg-white shadow-[0_22px_54px_rgba(23,24,31,0.12)] ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_70px_rgba(23,24,31,0.16)]">
          {isDragActive ? <FileCheck2 className="size-9 text-[#101114]" aria-hidden /> : <FileUp className="size-9 text-[#101114]" aria-hidden />}
        </div>
        <div className="absolute -right-3 bottom-0 grid size-9 place-items-center rounded-full bg-[#101114] text-white shadow-[0_12px_28px_rgba(8,10,15,0.18)]">
          <MousePointer2 className="size-4" aria-hidden />
        </div>
      </div>
      <div>
        <p className="text-xl font-semibold tracking-[-0.025em] text-foreground">
          {isDragActive ? "Release to add your resume" : copy.uploadTitle}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{copy.uploadSubtitle}</p>
        <p className="text-xs text-muted-foreground">or</p>
      </div>
      <Button
        type="button"
        size="sm"
        disabled={disabled}
        onClick={open}
        className="rounded-xl bg-[#101114] px-6 text-white shadow-[0_16px_34px_rgba(8,10,15,0.2)] hover:bg-[#1d2028]"
      >
        {copy.uploadCta}
      </Button>
      <div className="flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-muted-foreground">
        <span className="rounded-full border border-black/[0.08] bg-white/60 px-3 py-1">PDF only</span>
        <span className="rounded-full border border-black/[0.08] bg-white/60 px-3 py-1">Up to 10 MB</span>
        <span className="rounded-full border border-black/[0.08] bg-white/60 px-3 py-1">Private parse</span>
      </div>
    </div>
  )
}
