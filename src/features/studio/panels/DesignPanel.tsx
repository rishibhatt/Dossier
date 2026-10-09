"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Shuffle } from "lucide-react"

import { PanelFrame, PanelGroup } from "@/features/studio/panels/PanelFrame"
import { changeDesign } from "@/features/studio/studioActions"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { TemplateThumb } from "@/features/studio/TemplateThumb"
import { getTemplate, recommendTemplates, TEMPLATES, type DesignTemplate } from "@/lib/design/templates"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

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
  const recommended = useMemo(() => (parsedResume ? recommendTemplates(parsedResume, undefined, 3) : []), [parsedResume])
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

      {recommended.length > 0 ? (
        <PanelGroup title="Suits your resume">
          <div className="ws-looks">{recommended.map((r) => card(r.template, r.reason))}</div>
        </PanelGroup>
      ) : null}

      <PanelGroup title={recommended.length > 0 ? "All looks" : "Looks"} aside={<span className="sp-data">{TEMPLATES.length}</span>}>
        <div className="ws-looks">{others.map((t) => card(t))}</div>
      </PanelGroup>

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
