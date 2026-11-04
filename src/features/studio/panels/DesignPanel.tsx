"use client"

import { useId, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Lock, Shuffle } from "lucide-react"

import { useAccountSummary } from "@/features/billing/useAccountSummary"
import { openUpgrade } from "@/features/billing/useUpgrade"
import { PanelFrame, PanelGroup } from "@/features/studio/panels/PanelFrame"
import { ProfessionSelect } from "@/features/studio/ProfessionAsk"
import { changeDesign, persistNow } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { TemplateThumb } from "@/features/studio/TemplateThumb"
import { getTemplate, recommendTemplates, TEMPLATES, type DesignTemplate } from "@/lib/design/templates"
import { getProfession, PROFESSION_GROUPS } from "@/lib/portfolio/professions"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { MotionTier } from "@/types/resolvedDesignConfig"

const ACCENTS = ["#101114", "#2f6b45", "#b4361f", "#1d4ed8", "#7c3aed", "#0f766e", "#b45309", "#be185d"] as const

const CORNERS = [
  { label: "Sharp", value: "rounded-none" },
  { label: "Soft", value: "rounded-lg" },
  { label: "Round", value: "rounded-2xl" },
] as const

const HEADLINES = [
  { label: "Small", value: "clamp(2rem, 4.2vw, 3.35rem)" },
  { label: "Medium", value: "clamp(2.65rem, 5.5vw, 4.85rem)" },
  { label: "Large", value: "clamp(3.35rem, 7.5vw, 7rem)" },
] as const

/** Chip group: the chosen chip inverts to ink. */
function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T | null; options: readonly { label: string; value: T }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1.5">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className="sp-chip justify-center">
          {o.label}
        </button>
      ))}
    </div>
  )
}

const TIERS: { value: MotionTier; label: string; note: string }[] = [
  { value: "calm", label: "Calm", note: "Blocks fade in gently. Nothing else moves." },
  { value: "expressive", label: "Expressive", note: "Your name sets in word by word, lists stagger, numbers count up." },
  { value: "awwwards", label: "Award", note: "Scroll-driven: images open as you scroll and the intro drifts away. On phones it stays Expressive." },
]

function ProfessionPicker() {
  const id = useId()
  const meta = usePortfolioStore((s) => s.document?.portfolioMeta)
  const setProfession = usePortfolioStore((s) => s.setProfession)
  const current = getProfession(meta?.profession)
  const group = PROFESSION_GROUPS.find((g) => g.id === current?.group)
  return (
    <PanelGroup title="Your field">
      <label htmlFor={id} className="sr-only">
        Your field
      </label>
      <ProfessionSelect
        id={id}
        value={current?.id ?? ""}
        onChange={(v) => {
          useStudioStatus.getState().pushHistory()
          setProfession(v)
        }}
      />
      <p className="mt-1.5 text-xs text-[var(--site-ink-2)]">{group ? group.blurb : "Your field decides which looks and profile links come first."}</p>
    </PanelGroup>
  )
}

function MotionPicker() {
  const tier = usePortfolioStore((s) => s.designConfig?.motion.tier ?? "expressive")
  const setMotionTier = usePortfolioStore((s) => s.setMotionTier)
  const { status, summary } = useAccountSummary()
  // Locked only once the plan is known; the publish route clamps the tier for anyone below Pro anyway.
  const locked = status !== "idle" && status !== "loading" && summary.plan !== "pro"
  const pick = (t: MotionTier) => {
    if (t === tier) return
    if (t === "awwwards" && locked) return openUpgrade("award_motion", { plan: summary.plan, beforeLeave: persistNow })
    useStudioStatus.getState().pushHistory()
    setMotionTier(t)
  }
  return (
    <PanelGroup title="Motion">
      <div role="radiogroup" aria-label="Motion" className="grid auto-cols-fr grid-flow-col gap-1.5">
        {TIERS.map((t) => (
          <button key={t.value} type="button" role="radio" aria-checked={tier === t.value} onClick={() => pick(t.value)} className="sp-chip justify-center">
            {t.value === "awwwards" && locked ? <Lock className="size-3.5 shrink-0" aria-hidden /> : null}
            {t.label}
            {t.value === "awwwards" && locked ? <span className="sr-only">(Pro)</span> : null}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-[var(--site-ink-2)]">{TIERS.find((t) => t.value === tier)?.note}</p>
    </PanelGroup>
  )
}

function TemplateCard({ t, active, pending, locked, onPick, note }: { t: DesignTemplate; active: boolean; pending: boolean; locked: boolean; onPick: () => void; note?: string }) {
  return (
    <button type="button" disabled={locked} onClick={onPick} aria-pressed={active} aria-busy={pending} className="ws-look group">
      <span className="relative block overflow-hidden">
        <TemplateThumb template={t} />
        {pending ? (
          <span className="absolute inset-0 grid place-items-center bg-[rgba(16,17,20,0.45)] text-white">
            <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
            <span className="sr-only">Applying {t.name}</span>
          </span>
        ) : null}
      </span>
      <span className="ws-look-cap">
        <span className="flex items-center gap-1.5">
          {active ? <Check className="size-3.5 shrink-0" strokeWidth={3} aria-hidden /> : null}
          <span className="truncate text-sm font-semibold">{t.name}</span>
        </span>
        <span className="ws-look-note mt-0.5 block truncate text-xs">{note ?? t.displayFont}</span>
      </span>
    </button>
  )
}

export function DesignPanel() {
  const router = useRouter()
  const designConfig = usePortfolioStore((s) => s.designConfig)
  const parsedResume = usePortfolioStore((s) => s.parsedResume)
  const patchDesignTokens = usePortfolioStore((s) => s.patchDesignTokens)
  const busy = useStudioUiStore((s) => s.busy.design)
  const pendingId = useStudioUiStore((s) => s.pendingTemplateId)

  const currentId = designConfig?.meta.templateId ?? null
  const current = currentId ? getTemplate(currentId) : undefined
  const profession = usePortfolioStore((s) => getProfession(s.document?.portfolioMeta?.profession))
  const recommended = useMemo(
    () => (parsedResume ? recommendTemplates(parsedResume, profession ? { category: profession.category, profession: profession.id, group: profession.group } : undefined, 3) : []),
    [parsedResume, profession]
  )
  const others = useMemo(() => TEMPLATES.filter((t) => !recommended.some((r) => r.template.id === t.id)), [recommended])

  const pick = (t: DesignTemplate) => {
    if (t.id !== currentId && !busy) void changeDesign(router, { templateId: t.id, templateName: t.name })
  }
  /** Fine-tune changes are undoable: record before each one. */
  const tune = (patch: Parameters<typeof patchDesignTokens>[0]) => {
    useStudioStatus.getState().pushHistory()
    patchDesignTokens(patch)
  }

  const tokens = designConfig?.tokens
  const corner = CORNERS.find((c) => c.value === tokens?.effects.borderRadius)?.value ?? null
  const headline = HEADLINES.find((h) => h.value === tokens?.typography.scale.hero)?.value ?? null
  const card = (t: DesignTemplate, note?: string) => (
    <TemplateCard key={t.id} t={t} note={note} active={t.id === currentId} pending={pendingId === t.id} locked={busy} onPick={() => pick(t)} />
  )

  return (
    <PanelFrame title="Design" hint="Change the look. Your words stay the same.">
      <div className="flex items-center gap-3 border border-[var(--site-rule-strong)] bg-[var(--site-sheet)] p-2 [border-radius:4px]">
        {current ? (
          <span className="w-20 shrink-0 overflow-hidden rounded-[2px] border border-[var(--site-rule)]">
            <TemplateThumb template={current} />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="sp-data block">Current look</span>
          <span className="block truncate font-semibold">{current?.name ?? "Custom"}</span>
        </span>
        <button type="button" disabled={busy} onClick={() => void changeDesign(router, { shuffle: true })} className="site-btn site-btn-primary site-btn-sm shrink-0">
          {busy && !pendingId ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Shuffle className="size-4" aria-hidden />}
          <span className="site-btn-label">Shuffle</span>
        </button>
      </div>

      <ProfessionPicker />

      {recommended.length > 0 ? (
        <PanelGroup title={profession ? "Suits your field" : "Suits your resume"}>
          <div className="ws-looks">{recommended.map((r) => card(r.template, r.reason))}</div>
        </PanelGroup>
      ) : null}

      <PanelGroup title={recommended.length > 0 ? "All looks" : "Looks"} aside={<span className="sp-data">{TEMPLATES.length}</span>}>
        <div className="ws-looks">{others.map((t) => card(t))}</div>
      </PanelGroup>

      {tokens ? <MotionPicker /> : null}

      {tokens ? (
        <PanelGroup title="Fine-tune">
          <div className="space-y-5">
            <div>
              <p className="sp-label !text-[0.8125rem]">Accent colour</p>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Accent colour">
                {ACCENTS.map((c) => {
                  const on = tokens.colors.accent.toLowerCase() === c
                  return (
                    <button key={c} type="button" role="radio" aria-checked={on} aria-label={`Accent ${c}`} onClick={() => tune({ colors: { accent: c, primary: c } })} className="ws-swatch">
                      <span style={{ background: c }}>{on ? <Check className="size-4 text-white" strokeWidth={3} aria-hidden /> : null}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="sp-label !text-[0.8125rem]">Corners</p>
              <Choice label="Corners" value={corner} options={CORNERS} onChange={(v) => tune({ effects: { borderRadius: v } })} />
            </div>
            <div>
              <p className="sp-label !text-[0.8125rem]">Headline size</p>
              <Choice label="Headline size" value={headline} options={HEADLINES} onChange={(v) => tune({ typography: { scale: { ...tokens.typography.scale, hero: v } } })} />
            </div>
          </div>
        </PanelGroup>
      ) : null}
    </PanelFrame>
  )
}
