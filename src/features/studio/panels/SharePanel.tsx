"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Download, ExternalLink, Globe, Link2, Loader2, Lock, Save, Trash2 } from "lucide-react"

import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { openUpgrade } from "@/features/billing/useUpgrade"
import { PanelFrame, PanelGroup } from "@/features/studio/panels/PanelFrame"
import { copyText, exportZip, openPreview, persistNow, publish, saveDraft } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { useStudioUiStore } from "@/store/useStudioUiStore"

function StartOver({ onStartOver }: { onStartOver: () => void }) {
  const [asking, setAsking] = useState(false)
  if (!asking)
    return (
      <button type="button" onClick={() => setAsking(true)} className="ws-quiet-btn ws-danger justify-start">
        <Trash2 className="size-4" aria-hidden />
        Start over with a new resume
      </button>
    )
  return (
    <div role="group" aria-label="Confirm start over" className="border border-[var(--site-danger)] p-3 [border-radius:4px]">
      <p className="text-sm">This clears the site you are editing on this device. Published pages stay online.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setAsking(false)} className="site-btn site-btn-ghost site-btn-sm">
          <span className="site-btn-label">Keep editing</span>
        </button>
        <button type="button" onClick={onStartOver} className="site-btn site-btn-primary site-btn-sm ws-btn-danger">
          <span className="site-btn-label">Clear it</span>
        </button>
      </div>
    </div>
  )
}

export function SharePanel({ onStartOver }: { onStartOver: () => void }) {
  const router = useRouter()
  const publishedPath = useStudioUiStore((s) => s.publishedPath)
  const busy = useStudioUiStore((s) => s.busy)
  const unpublished = useStudioStatus((s) => s.unpublished)
  const { status, summary } = useAccountSummary()
  const loading = status === "idle" || status === "loading"
  const free = !loading && summary.plan === "free"
  const full = publishedPath && typeof window !== "undefined" ? `${window.location.origin}${publishedPath}` : null

  return (
    <PanelFrame title="Share" hint="Publish a link, or take the files with you.">
      <PanelGroup title="Your link" aside={full ? <span className="sp-data">{unpublished ? "Changes waiting" : "Up to date"}</span> : null}>
        {full ? (
          <div className="mb-3 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-3 [border-radius:4px]">
            <p className="sp-data !text-[0.8125rem] !text-[var(--site-ink)] break-all">{full.replace(/^https?:\/\//, "")}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void copyText(full)} className="site-btn site-btn-ghost site-btn-sm">
                <Copy className="size-4" aria-hidden />
                <span className="site-btn-label">Copy</span>
              </button>
              <a href={full} target="_blank" rel="noopener noreferrer" className="site-btn site-btn-ghost site-btn-sm">
                <ExternalLink className="size-4" aria-hidden />
                <span className="site-btn-label">Open</span>
              </a>
            </div>
          </div>
        ) : (
          <p className="mb-3 text-sm text-[var(--site-ink-2)]">Publishing makes a link anyone can open. Publish again after edits and the link stays the same.</p>
        )}
        <button type="button" disabled={busy.publish} onClick={() => void publish(router)} className="site-btn site-btn-primary w-full">
          {busy.publish ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Globe className="size-4" aria-hidden />}
          <span className="site-btn-label">{publishedPath ? "Publish changes" : "Publish"}</span>
        </button>
        <p className="sp-data mt-2">Search engines are asked to skip the page.</p>
      </PanelGroup>

      <PanelGroup title="Download" aside={loading ? <span className="sp-data">Checking plan</span> : free ? <span className="sp-data">Starter and Pro</span> : null}>
        <p className="mb-3 text-sm text-[var(--site-ink-2)]">The whole site as a ZIP, to host anywhere.</p>
        {free ? (
          <button type="button" onClick={() => openUpgrade("zip_export", { plan: summary.plan, beforeLeave: persistNow })} className="site-btn site-btn-ghost site-btn-sm w-full">
            <Lock className="size-4" aria-hidden />
            <span className="site-btn-label">Unlock ZIP download</span>
          </button>
        ) : (
          <button type="button" disabled={busy.export || loading} onClick={() => void exportZip(router)} className="site-btn site-btn-ghost site-btn-sm w-full">
            {busy.export || loading ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Download className="size-4" aria-hidden />}
            <span className="site-btn-label">Download ZIP</span>
          </button>
        )}
      </PanelGroup>

      {free ? (
        <PanelGroup title="Badge">
          <p className="mb-3 text-sm text-[var(--site-ink-2)]">Free pages end with a small &ldquo;Made with Dossier&rdquo; line.</p>
          <button type="button" onClick={() => openUpgrade("remove_badge", { plan: summary.plan, beforeLeave: persistNow })} className="site-btn site-btn-ghost site-btn-sm w-full">
            <span className="site-btn-label">Remove the badge</span>
          </button>
        </PanelGroup>
      ) : null}

      {!loading && summary.plan !== "pro" ? (
        <PanelGroup title="Coming to Pro">
          <button
            type="button"
            onClick={() => openUpgrade("pro_feature", { plan: summary.plan, feature: "Your own domain", beforeLeave: persistNow })}
            className="site-btn site-btn-ghost site-btn-sm w-full !justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <Link2 className="size-4" aria-hidden />
              <span className="site-btn-label">Your own domain</span>
            </span>
            <span className="sp-data">Soon</span>
          </button>
        </PanelGroup>
      ) : null}

      <PanelGroup title="More">
        <div className="grid gap-2">
          <button type="button" onClick={openPreview} className="site-btn site-btn-ghost site-btn-sm !justify-start">
            <ExternalLink className="size-4" aria-hidden />
            <span className="site-btn-label">Preview in a new tab</span>
          </button>
          <button type="button" onClick={saveDraft} className="site-btn site-btn-ghost site-btn-sm !justify-start">
            <Save className="size-4" aria-hidden />
            <span className="site-btn-label">Save on this device</span>
          </button>
          <StartOver onStartOver={onStartOver} />
        </div>
      </PanelGroup>
    </PanelFrame>
  )
}
