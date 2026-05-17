"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ExternalLink,
  Eye,
  FileText,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Rocket,
  Save,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import { LogoMark } from "@/components/marketing/MarketingPrimitives"
import { Button } from "@/components/ui/button"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { openPortfolioPreviewInNewTab } from "@/lib/portfolio/openPortfolioPreview"
import { saveEditorDraft } from "@/lib/portfolio/editorPersistence"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore } from "@/store/useStudioShellStore"
import { useDossierStore } from "@/store/useDossierStore"
import { useCreativeModeStore } from "@/store/useCreativeModeStore"
import { toast } from "sonner"

const STEP_ICONS: LucideIcon[] = [Eye, Palette, FileText, Rocket]

export function StudioTopNav() {
  const router = useRouter()
  const leftCollapsed = useStudioShellStore((s) => s.leftCollapsed)
  const rightCollapsed = useStudioShellStore((s) => s.rightCollapsed)
  const currentStep = useStudioShellStore((s) => s.currentStep)
  const setCurrentStep = useStudioShellStore((s) => s.setCurrentStep)
  const toggleLeftCollapsed = useStudioShellStore((s) => s.toggleLeftCollapsed)
  const toggleRightCollapsed = useStudioShellStore((s) => s.toggleRightCollapsed)
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const hiddenSectionIds = usePortfolioStore((s) => s.hiddenSectionIds)
  const sectionSurfaceOverrides = usePortfolioStore((s) => s.sectionSurfaceOverrides)
  const studio = messages.dossier.studio
  const workflowSteps = [studio.stepOverview, studio.stepDesign, studio.stepContent, studio.stepPublish]

  const clearWorkspace = () => {
    if (typeof window !== "undefined") {
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const key = window.localStorage.key(i)
        if (key?.startsWith("dossier:canvas:v1:") || key?.startsWith("dossier:preview:v1:")) {
          window.localStorage.removeItem(key)
        }
      }
    }
    useCreativeModeStore.getState().resetCreative()
    usePortfolioStore.getState().reset()
    useDossierStore.getState().reset()
    toast.success("Workspace cleared")
    router.push(ROUTES.home)
  }

  const openPreview = () => {
    if (!document || !designConfig) return
    const ok = openPortfolioPreviewInNewTab({ document, designConfig })
    if (!ok) toast.error(studio.previewStorageFailed)
  }

  const saveDraft = () => {
    if (!document || !designConfig) return
    saveEditorDraft({
      document,
      designConfig,
      hiddenSectionIds,
      sectionSurfaceOverrides,
      savedAt: new Date().toISOString(),
    })
    toast.success("Draft saved")
  }

  return (
    <nav className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-black/[0.06] bg-[#F8F6F1]/90 px-3 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <Link
          href={ROUTES.home}
          className="mk-focus group flex shrink-0 items-center gap-2 rounded-xl p-1"
          aria-label={messages.common.appName}
        >
          <LogoMark />
        </Link>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center px-1 sm:flex sm:px-2">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-black/[0.08] bg-white/58 p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {workflowSteps.map((label, index) => {
            const Icon = STEP_ICONS[index] ?? Eye
            const active = currentStep === index
            const done = currentStep > index
            return (
              <button
                key={label}
                type="button"
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                  active && "bg-[#101114] text-white shadow-sm",
                  done && !active && "text-foreground hover:bg-white/70",
                  !active && !done && "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                )}
                onClick={() => setCurrentStep(index)}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-md border text-[10px]",
                    active ? "border-white/20 bg-white/10 text-white" : "border-black/10 bg-white/60"
                  )}
                >
                  <Icon className="size-3" aria-hidden />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hidden sm:inline-flex"
          aria-label={leftCollapsed ? "Show sidebar" : "Hide sidebar"}
          onClick={toggleLeftCollapsed}
        >
          {leftCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hidden sm:inline-flex"
          aria-label={rightCollapsed ? "Show design panel" : "Hide design panel"}
          onClick={toggleRightCollapsed}
        >
          {rightCollapsed ? <PanelRightOpen className="size-4" /> : <PanelRightClose className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden gap-1.5 lg:inline-flex"
          onClick={openPreview}
        >
          <ExternalLink className="size-3.5" aria-hidden />
          {studio.openPreview}
        </Button>
        <Button type="button" variant="outline" size="sm" className="hidden md:inline-flex" onClick={saveDraft}>
          <Save className="mr-1.5 size-3.5" aria-hidden />
          Save draft
        </Button>
        <Button type="button" variant="outline" size="sm" className="hidden border-black/10 bg-[#101114] text-white hover:bg-[#1d2028] md:inline-flex" onClick={clearWorkspace}>
          <Trash2 className="mr-1.5 size-3.5" aria-hidden />
          Clear workspace
        </Button>
      </div>
    </nav>
  )
}
