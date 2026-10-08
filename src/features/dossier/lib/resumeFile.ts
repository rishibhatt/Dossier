import type { FileRejection } from "react-dropzone"

import { PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"

export type ResumeFileProblem = { title: string; fix: string }

export const MAX_MB = Math.round(PDF_UPLOAD_MAX_BYTES / (1024 * 1024))

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function problemFromRejection(rejections: FileRejection[]): ResumeFileProblem {
  const code = rejections[0]?.errors[0]?.code
  if (code === "file-too-large") {
    return { title: `That file is over ${MAX_MB} MB.`, fix: "Export a smaller PDF, or save it again without large images, then choose it here." }
  }
  if (code === "file-invalid-type") {
    return { title: "That is not a PDF.", fix: "Export your resume as a PDF from Word, Google Docs or Pages, then choose that file." }
  }
  if (code === "too-many-files") {
    return { title: "Only one file at a time.", fix: "Choose a single PDF." }
  }
  return { title: "That file could not be added.", fix: "Choose a PDF resume and try again." }
}

/** Checks the file really starts like a PDF, so a renamed or broken file fails here, not after a long wait. */
export async function checkPdfReadable(file: File): Promise<ResumeFileProblem | null> {
  if (file.size === 0) {
    return { title: "That file is empty.", fix: "Open it on your device to check it, then choose it again or export a fresh copy." }
  }
  try {
    const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
    const text = String.fromCharCode(...head)
    if (!text.includes("%PDF-")) {
      return { title: "We could not read that file as a PDF.", fix: "It may be damaged or renamed. Export your resume as a PDF again and choose the new file." }
    }
  } catch {
    return { title: "We could not open that file.", fix: "Check it still exists on your device, then choose it again." }
  }
  return null
}
