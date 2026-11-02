"use client"

import { ArrowLeft, Download, Eye, FileText, Gauge, Palette, Redo2, Undo2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { siteBtnClass } from "@/components/marketing/primitives"
import { typesetLetter, useLetterPreview } from "@/features/cover-letter/useLetterPreview"
import { DownloadDialog, type DownloadDialogState } from "@/features/resume/editor/DownloadDialog"
import { PreviewStage } from "@/features/resume/editor/PreviewStage"
import { listDrafts } from "@/features/resume/lib/drafts"
import { useSessionUser } from "@/features/resume/lib/useSessionUser"
import { track } from "@/lib/analytics"
import { letterFileName } from "@/lib/cover-letter/renderModel"
import { coverLetterDesignSchema, coverLetterDocumentSchema } from "@/lib/cover-letter/schema"
import { PRESETS } from "@/lib/resume/presets"

import { listLetterDrafts, loadLetterDraft, saveLetterDraft, type LetterDraft } from "../lib/drafts"
import { isUuid } from "../lib/resumeSource"
import { duplicateForAnotherJob } from "../lib/startLetter"
import { useLetterEditor } from "../lib/store"
import { useLetterAutosave } from "../lib/useAutosave"
import { LetterCheckPanel } from "./LetterCheckPanel"
import { LetterContentPanel } from "./LetterContentPanel"
import { LetterDesignPanel, matchLabel } from "./LetterDesignPanel"

type Tab = "content" | "design" | "check" | "preview"

const DESKTOP_TABS: { id: Exclude<Tab, "preview">; label: string }[] = [
  { id: "content", label: "Edit" },
  { id: "design", label: "Design" },
  { id: "check", label: "Check" },
]

const PHONE_TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "content", label: "Edit", icon: FileText },
  { id: "design", label: "Design", icon: Palette },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "check", label: "Check", icon: Gauge },
]

const dlKey = (id: string) => `dossier:letter:v1:dl:${id}`

function SaveStatus() {
  const state = useLetterEditor((s) => s.saveState)
  const message = useLetterEditor((s) => s.saveMessage)
  const words: Record<string, [string, string]> = {
    saving: ["Saving…", "Saving"],
    saved: ["Saved", "Saved"],
    local: ["Saved on this device", "On device"],
    offline: ["Offline · saved on this device", "Offline"],
    error: ["Couldn’t save", "Not saved"],
  }
  const w = words[state]
  if (!w) return null
  return (
    <span className="rz-save rz-mono" data-state={state} role="status" title={message || undefined}>
      <span className="rz-save-dot" aria-hidden />
      <span className="rz-hide-phone">{w[0]}</span>
      <span className="rz-only-phone">{w[1]}</span>
    </span>
  )
}

/**
 * Loads the letter named in ?id: a device draft, a device draft that holds that account copy, or (signed in) the
 * account copy itself. The dashboard links here with the account uuid.
 */
async function loadById(id: string): Promise<LetterDraft | null> {
  const local = loadLetterDraft(id)
  if (local) return local
  if (!isUuid(id)) return null
  const mirror = listLetterDrafts().find((d) => d.remoteId === id)
  const fromMirror = mirror ? loadLetterDraft(mirror.id) : null
  if (fromMirror) return fromMirror
  const res = await fetch(`/api/cover-letters/${id}`).catch(() => null)
  if (!res?.ok) return null
  const json = (await res.json().catch(() => ({}))) as {
    coverLetter?: { id: string; user_id?: string; title: string; data: unknown; design: unknown; updated_at: string }
  }
  const doc = coverLetterDocumentSchema.safeParse(json.coverLetter?.data)
  const design = coverLetterDesignSchema.safeParse(json.coverLetter?.design)
  if (!json.coverLetter || !doc.success || !design.success) return null
  const draft: LetterDraft = {
    id: json.coverLetter.id,
    title: json.coverLetter.title,
    doc: doc.data,
    design: design.data,
    updatedAt: Date.parse(json.coverLetter.updated_at) || Date.now(),
    remoteId: json.coverLetter.id,
    ownerId: json.coverLetter.user_id ?? null,
  }
  saveLetterDraft(draft)
  return draft
}

/** Where "Download the matching resume" goes: the linked resume's editor (it downloads on arrival), if it still exists. */
function linkedResumeHref(d: LetterDraft): string | null {
  const drafts = listDrafts()
  const { resumeDraftId, resumeRemoteId } = d.doc.source
  const local = drafts.find((x) => x.id === resumeDraftId) ?? (resumeRemoteId ? drafts.find((x) => x.remoteId === resumeRemoteId) : undefined)
  const id = local?.id ?? resumeRemoteId
  return id ? `/resume/edit?id=${encodeURIComponent(id)}&download=1` : null
}

export function CoverLetterEditor() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get("id") ?? ""
  const wantsDownload = params.get("download") === "1"

  const draft = useLetterEditor((s) => s.draft)
  const open = useLetterEditor((s) => s.open)
  const setTitle = useLetterEditor((s) => s.setTitle)
  const undo = useLetterEditor((s) => s.undo)
  const redo = useLetterEditor((s) => s.redo)
  const canUndo = useLetterEditor((s) => s.past.length > 0)
  const canRedo = useLetterEditor((s) => s.future.length > 0)

  const user = useSessionUser()
  const [tab, setTab] = useState<Tab>("content")
  const [missing, setMissing] = useState(false)
  const [dialog, setDialog] = useState<DownloadDialogState>({ kind: "closed" })
  const [downloading, setDownloading] = useState(false)
  const [resumeHref, setResumeHref] = useState<string | null>(null)
  const tabScroll = useRef<Partial<Record<Tab, number>>>({})
  const switchTab = useCallback(
    (next: Tab) => {
      // Phones scroll the page itself: remember where each tab was and come back to that spot.
      tabScroll.current[tab] = window.scrollY
      setTab(next)
      requestAnimationFrame(() => window.scrollTo({ top: tabScroll.current[next] ?? 0 }))
    },
    [tab],
  )
  const autoDownloaded = useRef(false)

  useLetterAutosave(user)
  const preview = useLetterPreview(draft?.doc ?? null, draft?.design ?? null)

  // Open the letter named in the URL.
  useEffect(() => {
    let cancelled = false
    if (!id) {
      router.replace("/cover-letter/new")
      return
    }
    const current = useLetterEditor.getState().draft
    if (current && (current.id === id || current.remoteId === id)) return
    loadById(id).then((d) => {
      if (cancelled) return
      if (d) open(d)
      else setMissing(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, open, router])

  // After sign-in, save this device's letter to the account once (autosave runs on the next change otherwise).
  useEffect(() => {
    if (!user || !draft || draft.remoteId) return
    useLetterEditor.setState((s) => (s.draft ? { draft: { ...s.draft, updatedAt: Date.now() } } : s))
    // Only when the person signs in or a new letter opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, draft?.id])

  // Undo / redo from the keyboard, everywhere in the editor.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo])

  const doDownload = useCallback(async () => {
    const d = useLetterEditor.getState().draft
    if (!d) return
    setDownloading(true)
    try {
      const bytes = await typesetLetter(d.doc, d.design, "pdf")
      const fileName = letterFileName(d.doc)
      const url = URL.createObjectURL(new Blob([bytes.slice()], { type: "application/pdf" }))
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      try {
        localStorage.setItem(dlKey(d.id), "1")
      } catch {
        /* storage blocked */
      }
      track("pdf_downloaded", { doc: "cover_letter", template: d.design.templateId, preset: d.design.preset })
      setResumeHref(linkedResumeHref(d))
      setDialog({ kind: "done", fileName })
    } catch {
      toast.error("Couldn't make the PDF. Try again.")
    } finally {
      setDownloading(false)
    }
  }, [])

  const onDownload = useCallback(() => {
    if (!draft) return
    track("download_click", { doc: "cover_letter", signedIn: Boolean(user) })
    if (user) {
      void doDownload()
      return
    }
    // Signed out (or still checking): ask them to sign in, then come back here and download straight away.
    track("signin_prompt_shown", { from: "letter_download" })
    setDialog({ kind: "signin", next: `/cover-letter/edit?id=${encodeURIComponent(draft.id)}&download=1` })
  }, [draft, user, doDownload])

  // Back from sign-in with ?download=1: download once, then drop the flag from the URL.
  useEffect(() => {
    if (!wantsDownload || !user || !draft || autoDownloaded.current) return
    if (preview.status === "booting") return
    autoDownloaded.current = true
    router.replace(`/cover-letter/edit?id=${encodeURIComponent(draft.id)}`)
    setTimeout(() => void doDownload(), 0)
  }, [wantsDownload, user, draft, preview.status, router, doDownload])

  const anotherJob = useCallback(() => {
    const d = useLetterEditor.getState().draft
    if (!d) return
    const next = duplicateForAnotherJob(d)
    setDialog({ kind: "closed" })
    router.push(`/cover-letter/edit?id=${next}`)
  }, [router])

  if (missing) {
    return (
      <div className="site-wrap rz-start">
        <div className="rz-head rz-mono">
          <span>Cover letter</span>
          <span>Not found</span>
        </div>
        <div className="rz-start-title">
          <h1>This letter isn’t on this device</h1>
          <p>Letters you write without an account stay in the browser you wrote them in. Sign in to see the ones saved to your account, or start a new one.</p>
        </div>
        <div className="rz-dialog-actions">
          <Link className={siteBtnClass({ variant: "primary" })} href="/cover-letter/new">
            <span className="site-btn-label">Start a new letter</span>
          </Link>
          <Link className={siteBtnClass({ variant: "secondary" })} href={`/login?next=${encodeURIComponent(`/cover-letter/edit?id=${encodeURIComponent(id)}`)}`}>
            <span className="site-btn-label">Sign in</span>
          </Link>
        </div>
      </div>
    )
  }

  const paper = draft ? (draft.design.paper ?? PRESETS[draft.design.preset].paper) : "a4"
  const desktopTab: Exclude<Tab, "preview"> = tab === "preview" ? "content" : tab
  const peekUrl = preview.status === "ready" ? preview.url : preview.status === "error" ? preview.lastUrl : null
  const buildResumeHref = draft ? `/resume/new?template=${encodeURIComponent(draft.design.templateId)}&format=${draft.design.preset}` : "/resume/new"

  const afterDownload = (
    <>
      <p>{resumeHref ? "It uses the same design as your resume, so they look like a set." : "Make the resume to go with it. It opens in the same design."}</p>
      <div className="rz-dialog-actions">
        <Link
          className={siteBtnClass({ variant: "primary" })}
          href={resumeHref ?? buildResumeHref}
          onClick={() => track("letter_to_resume_click", { linked: Boolean(resumeHref) })}
        >
          <span className="site-btn-label">
            {resumeHref ? (
              <>
                <span className="rz-hide-phone">Download the matching resume</span>
                <span className="rz-only-phone">Download resume</span>
              </>
            ) : (
              "Build the matching resume"
            )}
          </span>
        </Link>
        <button type="button" className={siteBtnClass({ variant: "secondary" })} onClick={anotherJob}>
          <span className="site-btn-label">
            <span className="rz-hide-phone">Write one for another job</span>
            <span className="rz-only-phone">Another job</span>
          </span>
        </button>
      </div>
      <button type="button" className={siteBtnClass({ variant: "quiet", size: "sm" })} onClick={() => setDialog({ kind: "closed" })} style={{ alignSelf: "flex-start" }}>
        <span className="site-btn-label">Back to editing</span>
      </button>
    </>
  )

  return (
    <>
      <header className="rz-bar">
        <Link href="/cover-letter/new" className="rz-icon-btn" aria-label="All cover letters">
          <ArrowLeft />
        </Link>
        <div className="rz-bar-title">
          <input
            className="rz-title-input"
            aria-label="Letter name (only you see this)"
            value={draft?.title ?? ""}
            placeholder={draft?.doc.recipient.company ? `Letter to ${draft.doc.recipient.company}` : "Untitled letter"}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!draft}
          />
          <SaveStatus />
        </div>
        <div className="rz-bar-actions">
          <button type="button" className="rz-icon-btn rz-hide-phone" aria-label="Undo" title="Undo (Ctrl/Cmd + Z)" disabled={!canUndo} onClick={undo}>
            <Undo2 />
          </button>
          <button type="button" className="rz-icon-btn rz-hide-phone" aria-label="Redo" title="Redo (Shift + Ctrl/Cmd + Z)" disabled={!canRedo} onClick={redo}>
            <Redo2 />
          </button>
          <button
            type="button"
            className={siteBtnClass({ variant: "primary", size: "sm" })}
            onClick={onDownload}
            disabled={!draft || downloading || preview.status === "booting"}
            data-loading={downloading || undefined}
          >
            <span className="site-btn-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              <Download aria-hidden className="rz-only-phone" width={16} height={16} />
              {downloading ? (
                "Making PDF…"
              ) : (
                <>
                  <span className="rz-hide-phone">Download PDF</span>
                  <span className="rz-only-phone">Download</span>
                </>
              )}
            </span>
          </button>
        </div>
      </header>

      <div className="rz-shell" data-mobile-tab={tab}>
        <div className="rz-pane">
          <div className="rz-tabs" role="tablist" aria-label="Editor panels">
            {DESKTOP_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`rz-tab-${t.id}`}
                aria-selected={desktopTab === t.id}
                aria-controls="rz-panel"
                className="rz-tab"
                onClick={() => switchTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="rz-pane-scroll" id="rz-panel" role="tabpanel" aria-labelledby={`rz-tab-${desktopTab}`}>
            {!draft ? (
              <p className="rz-hint">Opening your letter…</p>
            ) : desktopTab === "content" ? (
              <LetterContentPanel />
            ) : desktopTab === "design" ? (
              <LetterDesignPanel />
            ) : (
              <LetterCheckPanel active />
            )}
          </div>
        </div>
        <PreviewStage
          state={preview}
          paperLabel={paper === "a4" ? "A4" : "US Letter"}
          templateLabel={draft ? `Letter · ${matchLabel(draft.design.templateId)}` : "Letter"}
          alt="Preview of your cover letter, page 1"
        />
      </div>

      {peekUrl && tab === "content" ? (
        <button type="button" className="rz-peek" aria-label="Show preview" onClick={() => switchTab("preview")}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob: SVG from the typesetter */}
          <img src={peekUrl} alt="" />
        </button>
      ) : null}

      <nav className="rz-tabbar" role="tablist" aria-label="Editor views">
        {PHONE_TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} aria-controls={t.id === "preview" ? undefined : "rz-panel"} onClick={() => switchTab(t.id)}>
            <t.icon aria-hidden />
            {t.label}
          </button>
        ))}
      </nav>

      <DownloadDialog
        state={dialog}
        onClose={() => setDialog({ kind: "closed" })}
        noun="letter"
        doneTitle="Your letter is downloading"
        afterDownload={afterDownload}
      />
    </>
  )
}
