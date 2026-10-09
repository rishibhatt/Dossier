"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, CircleDot, ExternalLink, Loader2, Monitor, Redo2, Save, Send, Shuffle, Smartphone, Tablet, Undo2 } from "lucide-react"

import { OverflowMenu } from "@/features/studio/OverflowMenu"
import { changeDesign, openPreview, persistNow, publish, redo, saveDraft, undo } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { useStudioLayout } from "@/features/studio/useViewport"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore, type StudioViewport } from "@/store/useStudioShellStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

const DEVICES: { id: StudioViewport; label: string; Icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Phone", Icon: Smartphone },
]

function DeviceToggle() {
  const viewport = useStudioShellStore((s) => s.viewport)
  const setViewport = useStudioShellStore((s) => s.setViewport)
  return (
    <div role="radiogroup" aria-label="Preview size" className="ws-seg">
      {DEVICES.map(({ id, label, Icon }) => (
        <button key={id} type="button" role="radio" aria-checked={viewport === id} aria-label={`${label} preview`} title={`${label} preview`} onClick={() => setViewport(id)}>
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  )
}

/** Where the work lives: saving, saved on this device, or changed since publishing. */
function SaveState() {
  const savedAt = useStudioUiStore((s) => s.savedAt)
  const published = useStudioUiStore((s) => s.publishedPath)
  const pendingSave = useStudioStatus((s) => s.pendingSave)
  const unpublished = useStudioStatus((s) => s.unpublished)
  let Icon = Check
  let text = savedAt ? "Saved on this device" : "No changes yet"
  if (pendingSave) {
    Icon = Loader2
    text = "Saving"
  } else if (published && unpublished) {
    Icon = CircleDot
    text = "Not published yet"
  } else if (published) text = "Published"
  return (
    <p className="sp-data hidden items-center gap-1.5 whitespace-nowrap xl:flex" role="status">
      <Icon className={cn("size-3.5", pendingSave && "animate-spin motion-reduce:animate-none")} aria-hidden />
      {text}
    </p>
  )
}

export function StudioTopBar() {
  const router = useRouter()
  const layout = useStudioLayout()
  const title = usePortfolioStore((s) => s.document?.meta.title ?? "")
  const updateMeta = usePortfolioStore((s) => s.updateMeta)
  const publishing = useStudioUiStore((s) => s.busy.publish)
  const designBusy = useStudioUiStore((s) => s.busy.design)
  const published = useStudioUiStore((s) => s.publishedPath)
  const openTool = useStudioUiStore((s) => s.openTool)
  const canUndo = useStudioStatus((s) => s.history.length > 0)
  const canRedo = useStudioStatus((s) => s.future.length > 0)
  const phone = layout === "phone"

  return (
    <header className="ws-topbar">
      <Link href={ROUTES.dashboard} onClick={() => persistNow()} aria-label="Back to dashboard" title="Back to dashboard" className="ws-icon-btn">
        <ArrowLeft className="size-4" aria-hidden />
      </Link>

      <label className="min-w-0 flex-1 md:max-w-xs">
        <span className="sr-only">Site title</span>
        <input value={title} onChange={(e) => updateMeta({ title: e.target.value })} maxLength={120} placeholder="Untitled site" className="ws-title" />
      </label>

      <SaveState />

      <div className="ml-auto flex shrink-0 items-center">
        {layout === "desktop" ? (
          <>
            <DeviceToggle />
            <span className="mx-2 h-6 w-px bg-[var(--site-rule-strong)]" aria-hidden />
          </>
        ) : null}
        <button type="button" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo" className="ws-icon-btn">
          <Undo2 className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo" className="ws-icon-btn max-[359px]:hidden">
          <Redo2 className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={() => void changeDesign(router, { shuffle: true })} disabled={designBusy} aria-label="Shuffle the look" title="Shuffle the look" className="ws-icon-btn">
          {designBusy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Shuffle className="size-4" aria-hidden />}
        </button>
        <OverflowMenu
          items={[
            { label: "Preview in a new tab", Icon: ExternalLink, onSelect: openPreview },
            ...(canRedo ? [{ label: "Redo", Icon: Redo2, onSelect: redo, className: "min-[360px]:!hidden" }] : []),
            { label: "Save on this device", Icon: Save, onSelect: saveDraft },
            { label: "Share and download", Icon: Send, onSelect: () => openTool("share", "full") },
          ]}
        />
        {!phone ? (
          <button type="button" disabled={publishing} onClick={() => void publish(router)} className="site-btn site-btn-primary site-btn-sm ml-2">
            {publishing ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            <span className="site-btn-label">{published ? "Update" : "Publish"}</span>
          </button>
        ) : null}
      </div>
    </header>
  )
}
