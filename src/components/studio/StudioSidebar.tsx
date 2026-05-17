"use client"

import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  ExternalLink,
  FolderOpen,
  Globe,
  GraduationCap,
  Image,
  Info,
  LayoutGrid,
  Mail,
  PanelLeftClose,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useState } from "react"

import { StudioSectionEditor } from "@/components/studio/StudioSectionEditor"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { openPortfolioPreviewInNewTab } from "@/lib/portfolio/openPortfolioPreview"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore } from "@/store/useStudioShellStore"
import type { DesignConfig } from "@/types/designEngine"
import { toast } from "sonner"

const SIDEBAR_SECTIONS = [
  { id: "site-seo", label: "Site & SEO", icon: Globe },
  { id: "hero", label: "Hero", icon: User },
  { id: "about", label: "About", icon: Info },
  { id: "skills", label: "Skills", icon: Zap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "sections", label: "Sections", icon: LayoutGrid },
  { id: "settings", label: "Settings", icon: Settings },
] as const

export function StudioSidebar() {
  const activeSection = useStudioShellStore((s) => s.activeSidebarSection)
  const setActiveSection = useStudioShellStore((s) => s.setActiveSidebarSection)
  const leftCollapsed = useStudioShellStore((s) => s.leftCollapsed)
  const toggleLeftCollapsed = useStudioShellStore((s) => s.toggleLeftCollapsed)
  const setEditMode = usePortfolioStore((s) => s.setEditMode)
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const portfolioStylePreset = usePortfolioStore((s) => s.portfolioStylePreset)
  const portfolioDesignNotes = usePortfolioStore((s) => s.portfolioDesignNotes)
  const generationVariation = usePortfolioStore((s) => s.generationVariation)
  const studio = messages.dossier.studio
  const dossierErrors = messages.dossier.errors

  const [aiPrompt, setAiPrompt] = useState("")
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [regenBusy, setRegenBusy] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)

  const submitAi = async () => {
    const text = aiPrompt.trim()
    if (!document || !designConfig || !text || aiBusy) return
    setAiBusy(true)
    setAiError(null)
    try {
      const res = await fetch("/api/portfolio-refine-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          designConfig,
          portfolioData: document,
        }),
      })
      const body = (await res.json()) as { error?: string; designConfig?: DesignConfig }
      if (!res.ok) {
        if (body.error === "groqMissing") setAiError(dossierErrors.groqMissing)
        else if (body.error === "invalidMessage") setAiError(studio.aiInvalidMessage)
        else setAiError(studio.aiRefineFailed)
        return
      }
      if (body.designConfig) {
        usePortfolioStore.getState().setDesignConfig(body.designConfig)
        setAiPrompt("")
      } else {
        setAiError(studio.aiRefineFailed)
      }
    } catch {
      setAiError(studio.aiRefineFailed)
    } finally {
      setAiBusy(false)
    }
  }

  const openPreview = useCallback(() => {
    if (!document || !designConfig) return
    const ok = openPortfolioPreviewInNewTab({ document, designConfig })
    if (!ok) toast.error(studio.previewStorageFailed)
  }, [document, designConfig, studio.previewStorageFailed])

  const regenerateDesign = useCallback(async () => {
    if (!document || regenBusy) return
    const nextSeed = generationVariation + 1
    setRegenBusy(true)
    try {
      const res = await fetch("/api/regenerate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioData: document,
          parsedResume: usePortfolioStore.getState().parsedResume,
          portfolioStylePreset,
          designNotes: portfolioDesignNotes,
          variationSeed: nextSeed,
        }),
      })
      const body = (await res.json()) as { designConfig?: DesignConfig; error?: string }
      if (!res.ok) {
        toast.error(body.error === "groqMissing" ? dossierErrors.groqMissing : studio.aiRefineFailed)
        return
      }
      if (body.designConfig) {
        usePortfolioStore.setState({ designConfig: body.designConfig, generationVariation: nextSeed })
        toast.success("Design regenerated")
      }
    } catch {
      toast.error(studio.aiRefineFailed)
    } finally {
      setRegenBusy(false)
    }
  }, [
    document,
    regenBusy,
    generationVariation,
    portfolioStylePreset,
    portfolioDesignNotes,
    studio.aiRefineFailed,
    dossierErrors.groqMissing,
  ])

  const exportProject = useCallback(async () => {
    if (!document || !designConfig || exportBusy) return
    setExportBusy(true)
    try {
      const res = await fetch("/api/export-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioData: document,
          designConfig,
          variationSeed: generationVariation,
        }),
      })
      if (!res.ok) {
        toast.error(studio.aiRefineFailed)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement("a")
      a.href = url
      a.download = `${document.meta.title.replace(/[^\w\d]+/g, "-").slice(0, 48) || "portfolio"}-export.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Export downloaded")
    } catch {
      toast.error(studio.aiRefineFailed)
    } finally {
      setExportBusy(false)
    }
  }, [document, designConfig, exportBusy, generationVariation, studio.aiRefineFailed])

  const publishPortfolio = useCallback(async () => {
    if (!document || !designConfig) return
    try {
      const res = await fetch("/api/publish-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioData: document, designConfig }),
      })
      const body = (await res.json()) as { url?: string; message?: string }
      if (!res.ok) {
        toast.error(body.message ?? studio.aiRefineFailed)
        return
      }
      if (body.url && typeof window !== "undefined") {
        window.open(`${window.location.origin}${body.url}`, "_blank", "noopener,noreferrer")
        toast.success("Published")
      }
    } catch {
      toast.error(studio.aiRefineFailed)
    }
  }, [document, designConfig, studio.aiRefineFailed])

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-4">
        {!leftCollapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <Link
                href={ROUTES.home}
                className="mb-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5 shrink-0" />
                Back to home
              </Link>
              <h2 className="font-semibold text-foreground">Editor</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Saved</span>
              <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" onClick={toggleLeftCollapsed} aria-label="Collapse sidebar">
                <PanelLeftClose className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <Button type="button" size="icon" variant="ghost" className="mx-auto size-8 shrink-0" onClick={toggleLeftCollapsed} aria-label="Expand sidebar">
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>

      {!leftCollapsed ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <nav className="border-b border-border py-2">
              {SIDEBAR_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 py-2.5 text-left text-sm transition-colors",
                    "px-4",
                    activeSection === section.id
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <section.icon className="size-4 shrink-0" />
                  {section.label}
                </button>
              ))}
            </nav>

            <StudioSectionEditor activeId={activeSection} />

            <div className="border-t border-border p-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="text-xs font-medium">AI assistant</span>
                  <span className="ml-auto text-xs text-muted-foreground">⌘K</span>
                </div>
                <p className="mb-2 text-xs text-muted-foreground">Improve your portfolio with AI</p>
                <Textarea
                  placeholder='Ask anything… e.g. "Make the hero more dramatic"'
                  className="min-h-[60px] resize-none bg-background text-xs"
                  value={aiPrompt}
                  disabled={aiBusy || !document || !designConfig}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      void submitAi()
                    }
                  }}
                />
                {aiError ? <p className="mt-1 text-xs text-destructive">{aiError}</p> : null}
                <Button type="button" size="sm" className="mt-2 h-7 w-full gap-1 text-xs" disabled={aiBusy || !aiPrompt.trim()} onClick={() => void submitAi()}>
                  <Send className="size-3" />
                  Apply
                </Button>
              </div>

              <div className="mt-3">
                <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Quick actions</p>
                {[
                  { icon: RefreshCw, label: regenBusy ? studio.regeneratingDesign : studio.regenerateDesign, onClick: () => void regenerateDesign() },
                  { icon: Edit3, label: studio.canvasEditMode, onClick: () => setEditMode(true) },
                  { icon: Image, label: "Import images", onClick: () => toast.message("Set image URLs on hero and project cards.") },
                  { icon: ExternalLink, label: studio.openPreview, onClick: openPreview },
                  { icon: Download, label: exportBusy ? studio.exportingProject : studio.exportReactProject, onClick: () => void exportProject() },
                  { icon: Globe, label: studio.publishSite, onClick: () => void publishPortfolio() },
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="group flex w-full items-center justify-between rounded px-1 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <action.icon className="size-3.5 shrink-0" />
                      {action.label}
                    </span>
                    <ChevronRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-3">
              <button type="button" className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-muted/50">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">RB</AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-medium">Rishab Bhatt</p>
                  <p className="text-xs text-muted-foreground">Pro plan</p>
                </div>
                <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <nav className="shrink-0 border-b border-border py-2">
            {SIDEBAR_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center justify-center py-2.5 text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                title={section.label}
              >
                <section.icon className="size-4 shrink-0" />
              </button>
            ))}
          </nav>
          <div className="mt-auto flex shrink-0 flex-col items-center gap-2 border-t border-border py-3">
            <Button type="button" size="icon" variant="ghost" className="size-8" onClick={toggleLeftCollapsed} aria-label="Expand sidebar">
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  )
}
