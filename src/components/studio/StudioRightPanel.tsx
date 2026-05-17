"use client"

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  FolderOpen,
  Globe,
  Image,
  Info,
  Link,
  Mail,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
  Zap,
  Lightbulb,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { messages } from "@/config/messages"
import { suggestDesignDirection } from "@/lib/parseResume"
import { writePreviewSession } from "@/lib/portfolio/previewSession"
import { STUDIO_DESIGN_PRESETS, type StudioDesignPresetId } from "@/lib/portfolio/designTokenPresets"
import { SECTION_VARIANT_CYCLE } from "@/lib/portfolio/sectionVariantPools"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioShellStore } from "@/store/useStudioShellStore"
import type { DesignConfig, DesignSectionPlan } from "@/types/designEngine"
import type { PortfolioSectionType } from "@/types/dossier"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"
import { toast } from "sonner"

const DIRECTION_SWATCHES: { id: DesignDirectionId; label: string; preview: string }[] = [
  { id: "EDITORIAL_MONO", label: "Editorial Mono", preview: "linear-gradient(135deg, #F4F0E8 0%, #101114 100%)" },
  { id: "LUMINOUS_DARK", label: "Luminous Dark", preview: "linear-gradient(135deg, #080A0F 0%, #10131B 62%, #6D5CF6 100%)" },
  { id: "ORGANIC_GRADIENT", label: "Organic Gradient", preview: "linear-gradient(135deg, #F8F6F1 0%, #D8D1FF 58%, #6D5CF6 100%)" },
  {
    id: "BRUTALIST_GRID",
    label: "Brutalist Grid",
    preview: "repeating-linear-gradient(90deg, #EEE9DF 0px, #EEE9DF 1px, #FFFFFF 1px, #FFFFFF 18px)",
  },
  { id: "LIQUID_ENTERPRISE", label: "Liquid Enterprise", preview: "linear-gradient(135deg, #101114 0%, #525866 100%)" },
  { id: "CHROMATIC_CHAOS", label: "Chromatic Chaos", preview: "linear-gradient(135deg, #080A0F 0%, #6D5CF6 54%, #F3F0EA 100%)" },
]

type PanelProps = { number: string; title: string; badge?: string; children: ReactNode; defaultOpen?: boolean }

function RightPanelSection({ number, title, badge, children, defaultOpen = true }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/50"
      >
        <span className="font-mono text-xs text-muted-foreground">{number}</span>
        <span className="flex-1 text-sm font-medium">{title}</span>
        {badge ? <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs text-primary">{badge}</span> : null}
        <ChevronDown className={cn("size-3.5 shrink-0 transition-transform", !open && "-rotate-90")} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function LookVariationRow({ base, seedRef }: { base: number; seedRef: MutableRefObject<string> }) {
  const studio = messages.dossier.studio
  const [, bump] = useState(0)
  const force = () => bump((n) => n + 1)

  useEffect(() => {
    seedRef.current = String(base)
  }, [base, seedRef])

  return (
    <div className="mt-4 space-y-2 rounded-lg border border-border/60 bg-muted/25 p-3">
      <div>
        <p className="text-xs font-medium text-foreground">{studio.lookVariationLabel}</p>
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{studio.lookVariationHint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => {
            seedRef.current = String(base)
            force()
          }}
        >
          {studio.lookFromResume}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          className="h-8 gap-1 text-xs"
          onClick={() => {
            seedRef.current = String(Math.floor(Math.random() * 1_000_000))
            force()
          }}
        >
          <RefreshCw className="size-3" aria-hidden />
          {studio.lookShuffle}
        </Button>
      </div>
    </div>
  )
}

function StudioTipsPanel() {
  const st = messages.dossier.studio
  const tips = [st.tipOpenPreview, st.tipSaveDraft, st.tipDesignPanel, st.tipExport] as const
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">{st.studioTipsBody}</p>
      <ul className="space-y-2">
        {tips.map((text) => (
          <li
            key={text}
            className="flex gap-2.5 rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 text-xs leading-snug text-foreground shadow-sm"
          >
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DesignDirectionPanel() {
  const parsedResume = usePortfolioStore((s) => s.parsedResume)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const setDesignConfig = usePortfolioStore((s) => s.setDesignConfig)
  const generationVariation = usePortfolioStore((s) => s.generationVariation)
  const [styleNotes, setStyleNotes] = useState("")
  const seedRef = useRef(String(generationVariation))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeDirection = designConfig?.meta.direction ?? "EDITORIAL_MONO"
  const suggested = useMemo(() => (parsedResume ? suggestDesignDirection(parsedResume.signals) : "EDITORIAL_MONO"), [parsedResume])

  const applyDirection = async (direction: DesignDirectionId) => {
    if (!parsedResume) {
      setError("Missing parsed resume.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const variationSeed = Number.parseInt(seedRef.current, 10) || generationVariation
      const res = await fetch("/api/build-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedResume,
          direction,
          variationSeed,
          visionNote: styleNotes.trim() || undefined,
        }),
      })
      const body = (await res.json()) as { designConfig?: unknown; error?: string }
      if (!res.ok || !body.designConfig) {
        setError(body.error ?? "Could not apply design.")
        return
      }
      usePortfolioStore.setState({ generationVariation: variationSeed })
      setDesignConfig(body.designConfig as DesignConfig)
      toast.success("Design updated")
    } catch {
      setError("Network error.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {DIRECTION_SWATCHES.map((dir) => (
          <button
            key={dir.id}
            type="button"
            disabled={busy || !parsedResume}
            onClick={() => void applyDirection(dir.id)}
            className={cn(
              "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
              activeDirection === dir.id ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"
            )}
          >
            <div className="absolute inset-0" style={{ background: dir.preview }} />
            {activeDirection === dir.id ? (
              <div className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary">
                <Check className="size-2.5 text-primary-foreground" />
              </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: "rgba(0,0,0,0.45)" }}>
              <p className="text-[9px] font-medium leading-tight text-white">{dir.label}</p>
            </div>
          </button>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mb-3 w-full gap-1.5"
        disabled={busy || !parsedResume}
        onClick={() => void applyDirection(suggested)}
      >
        <Sparkles className="size-3.5" />
        AI suggest
        <span className="ml-auto text-[10px] text-muted-foreground">Based on profile</span>
      </Button>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Style notes (optional)</label>
        <Textarea
          placeholder="e.g. Minimal, bold typography, dark theme…"
          className="min-h-[80px] resize-none text-xs"
          maxLength={300}
          value={styleNotes}
          onChange={(e) => setStyleNotes(e.target.value)}
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {styleNotes.length}/300
        </div>
      </div>

      <LookVariationRow key={generationVariation} base={generationVariation} seedRef={seedRef} />

      <Button type="button" className="mt-4 w-full gap-2" disabled={busy || !parsedResume} onClick={() => void applyDirection(activeDirection)}>
        <Sparkles className="size-3.5" />
        Apply design
      </Button>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

const SWATCH_CYCLE = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"]

const SECTION_ICONS: Record<PortfolioSectionType, LucideIcon> = {
  hero: User,
  about: Info,
  skills: Zap,
  experience: Briefcase,
  projects: FolderOpen,
  contact: Mail,
}

const SECTION_LABEL: Record<PortfolioSectionType, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  contact: "Contact",
}

function sidebarIdForType(type: PortfolioSectionType): string {
  return type
}

function formatVariant(variant: string): string {
  return variant
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
}

function LayoutMinimapBlock({ type }: { type: PortfolioSectionType }) {
  switch (type) {
    case "hero":
      return (
        <div className="flex h-4 gap-0.5">
          <div className="min-h-0 flex-[1.1] rounded-sm bg-purple-400/55" />
          <div className="min-h-0 flex-1 rounded-sm bg-purple-300/45" />
        </div>
      )
    case "about":
      return <div className="h-4 rounded-sm bg-blue-300/50" />
    case "skills":
      return (
        <div className="flex gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 flex-1 rounded-sm bg-emerald-300/50" />
          ))}
        </div>
      )
    case "experience":
      return (
        <div className="space-y-0.5">
          <div className="h-1.5 rounded-sm bg-slate-300/60" />
          <div className="h-1.5 rounded-sm bg-slate-300/40" />
        </div>
      )
    case "projects":
      return (
        <div className="grid grid-cols-3 gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square rounded-sm bg-violet-300/55" />
          ))}
        </div>
      )
    case "contact":
      return <div className="h-2 rounded-sm bg-amber-300/55" />
  }
}

function toHexForPicker(value: string | undefined, fallback: string) {
  const v = (value ?? "").trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  return fallback
}

function AIInterpretationPanel() {
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const document = usePortfolioStore((s) => s.document)
  const sectionNicknames = usePortfolioStore((s) => s.sectionNicknames)
  const setSectionVariantBySectionId = usePortfolioStore((s) => s.setSectionVariantBySectionId)
  const setSectionNickname = usePortfolioStore((s) => s.setSectionNickname)
  const deleteSection = usePortfolioStore((s) => s.deleteSection)
  const moveSectionById = usePortfolioStore((s) => s.moveSectionById)
  const addSection = usePortfolioStore((s) => s.addSection)
  const mockRegenerateSection = usePortfolioStore((s) => s.mockRegenerateSection)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [addType, setAddType] = useState<PortfolioSectionType>("skills")
  const [addVariant, setAddVariant] = useState<string>(SECTION_VARIANT_CYCLE.skills[0]!)

  const pairs = useMemo(() => {
    if (!document || !designConfig) return []
    const out: { plan: DesignSectionPlan; section: (typeof document.sections)[number]; index: number }[] = []
    const n = Math.min(document.sections.length, designConfig.sections.length)
    for (let i = 0; i < n; i++) {
      const plan = designConfig.sections[i]!
      const section = document.sections[i]!
      if (plan.type === section.type) out.push({ plan, section, index: i })
    }
    return out
  }, [document, designConfig])

  const plans = designConfig?.sections ?? []
  const selected = selectedIndex !== null ? pairs[selectedIndex] : null

  const addVariantOptions = SECTION_VARIANT_CYCLE[addType]
  const normalizedAddVariant = addVariantOptions.includes(addVariant) ? addVariant : addVariantOptions[0]!

  return (
    <div>
      {!designConfig || !document ? (
        <p className="text-xs text-muted-foreground">Upload and parse your resume to see detected structure.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold text-foreground">{messages.dossier.studio.structurePanelTitle}</p>
            <p className="mb-2 text-[10px] text-muted-foreground">{messages.dossier.studio.structurePanelHint}</p>
            <div className="space-y-1.5">
              {pairs.map(({ plan, section, index }) => {
                const Icon = SECTION_ICONS[plan.type]
                const color = SWATCH_CYCLE[index % SWATCH_CYCLE.length]
                const nick = sectionNicknames[section.id]?.trim()
                const label = nick || `${SECTION_LABEL[plan.type]} section`
                const isSel = selectedIndex === index
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-lg bg-muted/50 p-2 text-left hover:bg-muted",
                      isSel && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    onClick={() => {
                      setSelectedIndex(index)
                      useStudioShellStore.getState().setActiveSidebarSection(sidebarIdForType(plan.type))
                    }}
                  >
                    <Icon className="size-3.5 shrink-0" style={{ color }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{label}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{formatVariant(plan.variant)}</p>
                    </div>
                    <ChevronRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-foreground">{messages.dossier.studio.layoutStripLabel}</p>
            <p className="mb-2 text-[10px] text-muted-foreground">{messages.dossier.studio.layoutStripHint}</p>
            <div className="relative max-h-[160px] overflow-y-auto rounded-xl border border-border/80 bg-muted/50 p-2">
              <div className="space-y-1">
                {plans.map((plan, i) => (
                  <button
                    key={`${plan.type}-${i}`}
                    type="button"
                    className={cn("block w-full text-left", selectedIndex === i && "ring-1 ring-primary")}
                    onClick={() => setSelectedIndex(i)}
                  >
                    <LayoutMinimapBlock type={plan.type} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selected ? (
            <div className="col-span-1 space-y-2 rounded-xl border border-border bg-muted/30 p-3 md:col-span-2">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Layout variant</label>
                <select
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                  value={selected.plan.variant}
                  onChange={(e) => setSectionVariantBySectionId(selected.section.id, e.target.value)}
                >
                  {SECTION_VARIANT_CYCLE[selected.plan.type].map((v) => (
                    <option key={v} value={v}>
                      {formatVariant(v)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Rename section</label>
                <Input
                  className="h-8 text-xs"
                  placeholder={SECTION_LABEL[selected.plan.type]}
                  value={sectionNicknames[selected.section.id] ?? ""}
                  onChange={(e) => setSectionNickname(selected.section.id, e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => {
                    mockRegenerateSection(selected.section.id)
                    toast.message("Mock regeneration applied")
                  }}
                >
                  <Sparkles className="size-3" />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="size-7 p-0"
                  disabled={selected.index <= 0}
                  onClick={() => moveSectionById(selected.section.id, -1)}
                  aria-label="Move section up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="size-7 p-0"
                  disabled={selected.index >= pairs.length - 1}
                  onClick={() => moveSectionById(selected.section.id, 1)}
                  aria-label="Move section down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-7 gap-1 text-xs"
                  disabled={pairs.length <= 1}
                  onClick={() => {
                    deleteSection(selected.section.id)
                    setSelectedIndex(null)
                    toast.success("Section removed")
                  }}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}

          <div className="col-span-1 flex flex-col gap-2 border-t border-border/60 pt-3 md:col-span-2 md:flex-row md:flex-wrap md:items-end">
            <div className="min-w-[100px] flex-1">
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Add section</label>
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={addType}
                onChange={(e) => setAddType(e.target.value as PortfolioSectionType)}
              >
                {(Object.keys(SECTION_LABEL) as PortfolioSectionType[]).map((t) => (
                  <option key={t} value={t}>
                    {SECTION_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[120px] flex-[1.2]">
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Layout</label>
              <select
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={normalizedAddVariant}
                onChange={(e) => setAddVariant(e.target.value)}
              >
                {addVariantOptions.map((v) => (
                  <option key={v} value={v}>
                    {formatVariant(v)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => {
                addSection(addType, normalizedAddVariant)
                toast.success("Section added")
              }}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20">
        <p className="text-xs text-green-800 dark:text-green-300">Looks good — refine tokens or continue.</p>
        <Button type="button" size="sm" className="h-7 shrink-0 text-xs" onClick={() => useStudioShellStore.getState().setCurrentStep(1)}>
          Continue to design
        </Button>
      </div>
    </div>
  )
}

const FONT_OPTIONS = ["Inter", "Poppins", "Syne", "Space Grotesk", "DM Sans", "IBM Plex Mono"] as const

const RADIUS_OPTIONS = ["rounded-none", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl"] as const

function DesignSystemPreviewPanel() {
  const studio = messages.dossier.studio
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const patchDesignTokens = usePortfolioStore((s) => s.patchDesignTokens)
  const applyDesignPreset = usePortfolioStore((s) => s.applyDesignPreset)
  const [activeTab, setActiveTab] = useState<"tokens" | "typography" | "more">("tokens")
  const tokens = designConfig?.tokens

  const tabs = [
    { id: "tokens" as const, label: studio.designSystemTokensTab },
    { id: "typography" as const, label: studio.designSystemTypeTab },
    { id: "more" as const, label: studio.designSystemMoreTab },
  ]

  const rawRi = tokens ? RADIUS_OPTIONS.indexOf(tokens.effects.borderRadius as (typeof RADIUS_OPTIONS)[number]) : -1
  const radiusIndex = rawRi >= 0 ? rawRi : 3

  return (
    <div key={designConfig?.meta.generatedAt ?? "none"} className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">Your design system</p>
      <div className="flex flex-wrap gap-1 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md px-2.5 py-1.5 transition-colors",
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "tokens" && tokens ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{studio.designSystemPresetsLabel}</p>
            <div className="mt-2 flex max-w-full gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(Object.keys(STUDIO_DESIGN_PRESETS) as StudioDesignPresetId[]).map((id) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 whitespace-nowrap text-[10px] capitalize"
                  onClick={() => {
                    applyDesignPreset(id)
                    toast.success(`Applied ${id}`)
                  }}
                >
                  {id}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">{studio.designSystemColorsLabel}</p>
            <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["Primary", "primary", tokens.colors.primary],
                ["Accent", "accent", tokens.colors.accent],
                ["Background", "bg", tokens.colors.bg],
                ["Text", "text", tokens.colors.text],
              ] as const
            ).map(([label, key, val]) => (
              <label key={key} className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                <span className="w-16 shrink-0">{label}</span>
                <input
                  type="color"
                  className="size-7 cursor-pointer rounded border border-input bg-background p-0"
                  value={toHexForPicker(val, key === "primary" ? "#6366f1" : "#000000")}
                  onChange={(e) => {
                    const hex = e.target.value
                    if (key === "primary" || key === "accent" || key === "bg" || key === "text") {
                      patchDesignTokens({ colors: { [key]: hex } })
                    }
                  }}
                />
              </label>
            ))}
            </div>
          </div>

          <details className="rounded-lg border border-border/70 bg-muted/10 open:bg-muted/20">
            <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-foreground marker:text-muted-foreground">
              {studio.designSystemSpacingLabel}
            </summary>
            <div className="space-y-3 border-t border-border/60 px-3 pb-3 pt-3">
              <p className="text-[10px] font-medium text-muted-foreground">Spacing scale</p>
              <div className="flex items-end gap-1 overflow-x-auto pb-1">
                {[4, 8, 12, 16, 24, 32, 48, 80].map((size) => (
                  <div key={size} className="flex flex-col items-center gap-0.5">
                    <div
                      className={cn("rounded-sm bg-primary/40", size === 16 && "ring-2 ring-primary")}
                      style={{ width: "12px", height: `${size * 0.35}px` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{size}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-medium text-muted-foreground">Border radius</p>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={RADIUS_OPTIONS.length - 1}
                  value={radiusIndex >= 0 ? radiusIndex : 3}
                  className="h-1.5 min-w-[6rem] flex-1 accent-primary"
                  onChange={(e) => {
                    const i = Number.parseInt(e.target.value, 10)
                    const br = RADIUS_OPTIONS[i] ?? "rounded-lg"
                    patchDesignTokens({ effects: { borderRadius: br } })
                  }}
                />
                <span className="w-20 text-[10px] text-muted-foreground">{tokens.effects.borderRadius}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["None", "rounded-none"],
                    ["SM", "rounded-sm"],
                    ["MD", "rounded-md"],
                    ["LG", "rounded-lg ring-2 ring-primary"],
                    ["XL", "rounded-xl"],
                    ["Full", "rounded-full"],
                  ] as const
                ).map(([r, cls]) => (
                  <div key={r} className="flex flex-col items-center gap-0.5">
                    <div className={cn("size-6 border border-border bg-muted", cls)} />
                    <span className="text-[9px] text-muted-foreground">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      ) : null}

      {activeTab === "typography" && tokens ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] font-medium text-muted-foreground">
              Display font
              <select
                className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={tokens.typography.displayFont}
                onChange={(e) => patchDesignTokens({ typography: { displayFont: e.target.value } })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[10px] font-medium text-muted-foreground">
              Body font
              <select
                className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={tokens.typography.bodyFont}
                onChange={(e) => patchDesignTokens({ typography: { bodyFont: e.target.value } })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={`b-${f}`} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-xs text-muted-foreground">{tokens.typography.displayFont}</p>
            <p className="text-4xl font-black" style={{ fontFamily: tokens.typography.displayFont }}>
              Aa
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tokens.typography.displayFont} · {tokens.typography.bodyFont}
            </p>
            <p className="mt-2 text-sm" style={{ fontFamily: tokens.typography.bodyFont }}>
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
      ) : null}

      {activeTab === "more" ? (
        <p className="text-xs text-muted-foreground">
          Motion curves and component tokens stay wired to your design direction — deeper controls ship in a later pass.
        </p>
      ) : null}
    </div>
  )
}

function ExportPublishPanel() {
  const studio = messages.dossier.studio
  const document = usePortfolioStore((s) => s.document)
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const generationVariation = usePortfolioStore((s) => s.generationVariation)
  const [exportBusy, setExportBusy] = useState(false)
  const [publishBusy, setPublishBusy] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const copyPreviewLink = async () => {
    setPreviewError(null)
    if (!document || !designConfig || typeof window === "undefined") return
    const id = crypto.randomUUID()
    const ok = writePreviewSession(id, { document, designConfig })
    if (!ok) {
      setPreviewError(studio.previewStorageFailed)
      return
    }
    const url = `${window.location.origin}/preview/${id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Preview link copied")
    } catch {
      setPreviewError("Could not copy link")
    }
  }

  const exportProject = async () => {
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
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement("a")
      a.href = url
      a.download = `${document.meta.title.replace(/[^\w\d]+/g, "-").slice(0, 48) || "portfolio"}-export.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Export started")
    } finally {
      setExportBusy(false)
    }
  }

  const publishPortfolio = async () => {
    if (!document || !designConfig || publishBusy) return
    setPublishBusy(true)
    try {
      const res = await fetch("/api/publish-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioData: document, designConfig }),
      })
      const body = (await res.json()) as { url?: string; message?: string }
      if (res.ok && body.url && typeof window !== "undefined") {
        window.open(`${window.location.origin}${body.url}`, "_blank", "noopener,noreferrer")
        toast.success("Published")
      }
    } finally {
      setPublishBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/15 p-3 shadow-sm dark:bg-card/40">
      <div className="mb-1 flex h-[100px] items-center justify-center rounded-lg border border-border/80 bg-background text-center text-[10px] text-muted-foreground">
        Live preview in the center reflects these exports.
      </div>
      {previewError ? <p className="text-xs text-destructive">{previewError}</p> : null}
      <p className="text-xs font-medium text-foreground">Export options</p>
      <div className="space-y-2">
        {[
          { icon: Download, label: studio.exportReactProject, sub: "Complete source", color: "text-blue-500", onClick: () => void exportProject() },
          { icon: Image, label: "Download assets", sub: "Images & fonts", color: "text-green-500", onClick: () => toast.message("Bundled in ZIP export") },
          { icon: Link, label: "Copy preview link", sub: "Shareable URL", color: "text-purple-500", onClick: () => void copyPreviewLink() },
          { icon: Globe, label: studio.publishSite, sub: "Go live", color: "text-orange-500", onClick: () => void publishPortfolio() },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            disabled={(opt.label === studio.exportReactProject && exportBusy) || (opt.label === studio.publishSite && publishBusy)}
            onClick={opt.onClick}
            className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-muted/50"
          >
            <div className={opt.color}>
              <opt.icon className="size-4" />
            </div>
            <div>
              <p className="text-xs font-medium">{opt.label}</p>
              <p className="text-[10px] text-muted-foreground">{opt.sub}</p>
            </div>
          </button>
        ))}
      </div>
      <Button type="button" className="w-full gap-2" disabled={publishBusy} onClick={() => void publishPortfolio()}>
        <Globe className="size-3.5" />
        Publish now
      </Button>
    </div>
  )
}

export function StudioRightPanel() {
  const currentStep = useStudioShellStore((s) => s.currentStep)

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 shrink-0 flex-col overflow-y-auto border-l border-border bg-background">
      <RightPanelSection number="01" title="Design direction">
        <DesignDirectionPanel />
      </RightPanelSection>
      <RightPanelSection number="02" title={messages.dossier.studio.studioTipsTitle}>
        <StudioTipsPanel />
      </RightPanelSection>
      <RightPanelSection number="03" title={messages.dossier.studio.aiInterpretationTitle}>
        <AIInterpretationPanel />
      </RightPanelSection>
      <RightPanelSection number="04" title="Design system preview">
        <DesignSystemPreviewPanel />
      </RightPanelSection>
      {currentStep >= 3 ? (
        <RightPanelSection number="05" title="Preview & export" defaultOpen={currentStep >= 3}>
          <ExportPublishPanel />
        </RightPanelSection>
      ) : null}
    </aside>
  )
}
