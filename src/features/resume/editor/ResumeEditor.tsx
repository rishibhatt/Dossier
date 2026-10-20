"use client"

import { ArrowLeft, Download, Eye, FileText, Gauge, Palette, Redo2, Undo2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { siteBtnClass } from "@/components/marketing/primitives"
import { setPendingUpload } from "@/features/dossier/lib/pendingUpload"
import { track } from "@/lib/analytics"
import { PRESETS } from "@/lib/resume/presets"
import { resumeDesignSchema, resumeDocumentSchema } from "@/lib/resume/schema"
import { getTemplate } from "@/lib/resume/templates"

import { loadDraft, saveDraft, type Draft } from "../lib/drafts"
import { useResumeEditor } from "../lib/store"
import { useAutosave } from "../lib/useAutosave"
import { pdfFileName, typeset, usePreview } from "../lib/usePreview"
import { useSessionUser } from "../lib/useSessionUser"
import { CheckPanel } from "./CheckPanel"
import { ContentPanel } from "./ContentPanel"
import { DesignPanel } from "./DesignPanel"
import { DownloadDialog, type DownloadDialogState } from "./DownloadDialog"
import { PreviewStage } from "./PreviewStage"

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const dlKey = (id: string) => `dossier:resume:v1:dl:${id}`

function SaveStatus() {
  const state = useResumeEditor((s) => s.saveState)
  const message = useResumeEditor((s) => s.saveMessage)
  // [full text, short text for phones]. The words carry the state; the dot only repeats it.
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

/** Loads the draft named in ?id: a device draft, or (signed in) one saved in the account on another device. */
async function loadById(id: string): Promise<Draft | null> {
  const local = loadDraft(id)
  if (local) return local
  if (!UUID.test(id)) return null
  const res = await fetch(`/api/resumes/${id}`).catch(() => null)
  if (!res?.ok) return null
  const json = (await res.json()) as { resume?: { id: string; user_id?: string; title: string; data: unknown; design: unknown; updated_at: string } }
  const doc = resumeDocumentSchema.safeParse(json.resume?.data)
  const design = resumeDesignSchema.safeParse(json.resume?.design)
  if (!json.resume || !doc.success || !design.success) return null
  const draft: Draft = {
    id: json.resume.id,
    title: json.resume.title,
    doc: doc.data,
    design: design.data,
    updatedAt: Date.parse(json.resume.updated_at) || Date.now(),
    remoteId: json.resume.id,
    ownerId: json.resume.user_id ?? null,
  }
  saveDraft(draft)
  return draft
}

export function ResumeEditor() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get("id") ?? ""
  const wantsDownload = params.get("download") === "1"

  const draft = useResumeEditor((s) => s.draft)
  const open = useResumeEditor((s) => s.open)
  const setTitle = useResumeEditor((s) => s.setTitle)
  const undo = useResumeEditor((s) => s.undo)
  const redo = useResumeEditor((s) => s.redo)
  const canUndo = useResumeEditor((s) => s.past.length > 0)
  const canRedo = useResumeEditor((s) => s.future.length > 0)

  const user = useSessionUser()
  const [tab, setTab] = useState<Tab>("content")
  const [missing, setMissing] = useState(false)
  const [dialog, setDialog] = useState<DownloadDialogState>({ kind: "closed" })
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [makingWebsite, setMakingWebsite] = useState(false)
  const lastPdf = useRef<Uint8Array | null>(null)
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

  useAutosave(user)
  const preview = usePreview(draft?.doc ?? null, draft?.design ?? null)

  // Open the draft named in the URL.
  useEffect(() => {
    let cancelled = false
    if (!id) {
      router.replace("/resume/new")
      return
    }
    if (useResumeEditor.getState().draft?.id === id) return
    loadById(id).then((d) => {
      if (cancelled) return
      if (d) {
        open(d)
        try {
          setDownloaded(localStorage.getItem(dlKey(d.id)) === "1")
        } catch {
          /* storage blocked */
        }
      } else setMissing(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, open, router])

  // After sign-in, save this device's draft to the account once (autosave runs on the next change otherwise).
  useEffect(() => {
    if (!user || !draft || draft.remoteId) return
    useResumeEditor.setState((s) => (s.draft ? { draft: { ...s.draft, updatedAt: Date.now() } } : s))
    // Only when the person signs in or a new draft opens.
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
    const d = useResumeEditor.getState().draft
    if (!d) return
    setDownloading(true)
    try {
      const bytes = await typeset(d.doc, d.design, "pdf")
      lastPdf.current = bytes
      const fileName = pdfFileName(d.doc, PRESETS[d.design.preset].docName)
      const url = URL.createObjectURL(new Blob([bytes.slice()], { type: "application/pdf" }))
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      setDownloaded(true)
      try {
        localStorage.setItem(dlKey(d.id), "1")
      } catch {
        /* storage blocked */
      }
      track("pdf_downloaded", { template: d.design.templateId, preset: d.design.preset })
      setDialog({ kind: "done", fileName })
    } catch (e) {
      toast.error(e instanceof Error ? `Couldn't make the PDF: ${e.message}` : "Couldn't make the PDF. Try again.")
    } finally {
      setDownloading(false)
    }
  }, [])

  const onDownload = useCallback(() => {
    if (!draft) return
    track("download_click", { signedIn: Boolean(user) })
    if (user) {
      void doDownload()
      return
    }
    // Signed out (or still checking): ask them to sign in, then come back here and download straight away.
    track("signin_prompt_shown", { from: "resume_download" })
    setDialog({ kind: "signin", next: `/resume/edit?id=${encodeURIComponent(draft.id)}&download=1` })
  }, [draft, user, doDownload])

  // Back from sign-in with ?download=1: download once, then drop the flag from the URL.
  useEffect(() => {
    if (!wantsDownload || !user || !draft || autoDownloaded.current) return
    if (preview.status === "booting") return
    autoDownloaded.current = true
    router.replace(`/resume/edit?id=${encodeURIComponent(draft.id)}`)
    // After this render, not inside it; the ref above makes sure it runs once.
    setTimeout(() => void doDownload(), 0)
  }, [wantsDownload, user, draft, preview.status, router, doDownload])

  const makeWebsite = useCallback(async () => {
    const d = useResumeEditor.getState().draft
    if (!d) return
    setMakingWebsite(true)
    try {
      const bytes = lastPdf.current ?? (await typeset(d.doc, d.design, "pdf"))
      // The portfolio builder reads a resume PDF; ours parses cleanly, so hand it the file we just made.
      setPendingUpload(new File([bytes.slice()], pdfFileName(d.doc, "Resume"), { type: "application/pdf" }))
      track("portfolio_cta_click", { from: "resume_download" })
      router.push("/build")
    } catch {
      setMakingWebsite(false)
      toast.error("Couldn't open the website builder. Try again.")
    }
  }, [router])

  if (missing) {
    return (
      <div className="site-wrap rz-start">
        <div className="rz-head rz-mono">
          <span>Resume</span>
          <span>Not found</span>
        </div>
        <div className="rz-start-title">
          <h1>This resume isn’t on this device</h1>
          <p>
            Resumes you build without an account stay in the browser you made them in. Sign in to see the ones saved to your account, or start a
            new one.
          </p>
        </div>
        <div className="rz-dialog-actions">
          <Link className={siteBtnClass({ variant: "primary" })} href="/resume/new">
            <span className="site-btn-label">Start a new resume</span>
          </Link>
          <Link className={siteBtnClass({ variant: "secondary" })} href={`/login?next=${encodeURIComponent(`/resume/edit?id=${encodeURIComponent(id)}`)}`}>
            <span className="site-btn-label">Sign in</span>
          </Link>
        </div>
      </div>
    )
  }

  const template = draft ? getTemplate(draft.design.templateId) : null
  const paper = draft ? (draft.design.paper ?? PRESETS[draft.design.preset].paper) : "a4"
  const desktopTab: Exclude<Tab, "preview"> = tab === "preview" ? "content" : tab
  const peekUrl = preview.status === "ready" ? preview.url : preview.status === "error" ? preview.lastUrl : null

  return (
    <>
      <header className="rz-bar">
        <Link href="/resume/new" className="rz-icon-btn" aria-label="All resumes">
          <ArrowLeft />
        </Link>
        <div className="rz-bar-title">
          <input
            className="rz-title-input"
            aria-label="Resume name (only you see this)"
            value={draft?.title ?? ""}
            placeholder={draft?.doc.basics.name ? `${draft.doc.basics.name}'s resume` : "Untitled resume"}
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
              {downloading ? "Making PDF…" : <><span className="rz-hide-phone">Download PDF</span><span className="rz-only-phone">Download</span></>}
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
              <p className="rz-hint">Opening your resume…</p>
            ) : desktopTab === "content" ? (
              <ContentPanel downloaded={downloaded} onDownload={onDownload} onOpenDesign={() => switchTab("design")} />
            ) : desktopTab === "design" ? (
              <DesignPanel active />
            ) : (
              <CheckPanel active />
            )}
          </div>
        </div>
        <PreviewStage state={preview} paperLabel={paper === "a4" ? "A4" : "US Letter"} templateLabel={template ? `${template.no} ${template.name}` : ""} />
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

      <DownloadDialog state={dialog} onClose={() => setDialog({ kind: "closed" })} onMakeWebsite={makeWebsite} makingWebsite={makingWebsite} />
    </>
  )
}
