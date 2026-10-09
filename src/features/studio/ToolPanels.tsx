"use client"

import { ArrowLeft, Layers, MessageSquareText, Palette, Send, type LucideIcon } from "lucide-react"

import { AddSectionPanel } from "@/features/studio/panels/AddSectionPanel"
import { AiPanel } from "@/features/studio/panels/AiPanel"
import { ContentPanel } from "@/features/studio/panels/ContentPanel"
import { DesignPanel } from "@/features/studio/panels/DesignPanel"
import { SharePanel } from "@/features/studio/panels/SharePanel"
import { cn } from "@/lib/utils"
import { useStudioUiStore, type StudioPanelId } from "@/store/useStudioUiStore"

export const TOOL_TABS: { id: Exclude<StudioPanelId, "add">; label: string; Icon: LucideIcon }[] = [
  { id: "content", label: "Edit", Icon: Layers },
  { id: "design", label: "Design", Icon: Palette },
  { id: "ai", label: "Ask", Icon: MessageSquareText },
  { id: "share", label: "Share", Icon: Send },
]

/** Ruled tab row. The chosen tab inverts to ink. The gallery has no tab; it shows a way back instead. */
export function ToolTabs({ trailing }: { trailing?: React.ReactNode }) {
  const panel = useStudioUiStore((s) => s.panel)
  const setPanel = useStudioUiStore((s) => s.setPanel)

  if (panel === "add") {
    return (
      <div className="flex h-13 items-center gap-1 border-b border-[var(--site-rule-strong)] px-1.5">
        <button type="button" onClick={() => setPanel("content")} className="ws-quiet-btn">
          <ArrowLeft className="size-4" aria-hidden />
          Back to edit
        </button>
        <span className="sp-data ml-auto truncate pr-2">Add a section</span>
        {trailing}
      </div>
    )
  }

  return (
    <div className="flex items-stretch border-b border-[var(--site-rule-strong)]">
      <div role="tablist" aria-label="Studio tools" className="ws-tabs grid flex-1 grid-cols-4">
        {TOOL_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`studio-tab-${id}`}
            aria-selected={panel === id}
            aria-controls={`studio-panel-${id}`}
            onClick={() => setPanel(id)}
            className="ws-tab"
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
      {trailing}
    </div>
  )
}

const PANELS: { id: StudioPanelId; node: (onStartOver: () => void) => React.ReactNode }[] = [
  { id: "content", node: () => <ContentPanel /> },
  { id: "design", node: () => <DesignPanel /> },
  { id: "ai", node: () => <AiPanel /> },
  { id: "share", node: (go) => <SharePanel onStartOver={go} /> },
  { id: "add", node: () => <AddSectionPanel /> },
]

/** Every panel stays mounted, each with its own scroll, so switching tabs keeps place and drafts. */
export function ToolPanelBodies({ onStartOver, className }: { onStartOver: () => void; className?: string }) {
  const panel = useStudioUiStore((s) => s.panel)
  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      {PANELS.map(({ id, node }) => (
        <div
          key={id}
          id={`studio-panel-${id}`}
          role={id === "add" ? "region" : "tabpanel"}
          aria-labelledby={id === "add" ? undefined : `studio-tab-${id}`}
          aria-label={id === "add" ? "Add a section" : undefined}
          hidden={panel !== id}
          data-panel-scroll
          className="absolute inset-0 overflow-y-auto overscroll-contain"
        >
          {node(onStartOver)}
        </div>
      ))}
    </div>
  )
}
