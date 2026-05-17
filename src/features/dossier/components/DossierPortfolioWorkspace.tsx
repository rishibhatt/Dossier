"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Layers3, Lock, Sparkles, Zap } from "lucide-react"

import { LogoMark } from "@/components/marketing/MarketingPrimitives"
import { Button } from "@/components/ui/button"
import { ParsingLoader } from "@/features/dossier/components/ParsingLoader"
import { PortfolioBuildStepper, type BuildVisualStep } from "@/features/dossier/components/PortfolioBuildStepper"
import { PortfolioStudioView } from "@/features/dossier/components/PortfolioStudioView"
import { PortfolioStyleConfigureCard } from "@/features/dossier/components/PortfolioStyleConfigureCard"
import { UploadZone } from "@/features/dossier/components/UploadZone"
import { usePortfolioParse } from "@/features/dossier/hooks/usePortfolioParse"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { useDossierStore } from "@/store/useDossierStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"

function clearWorkspaceStorage() {
  if (typeof window === "undefined") return
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const key = window.localStorage.key(i)
    if (key?.startsWith("dossier:canvas:v1:") || key?.startsWith("dossier:preview:v1:")) {
      window.localStorage.removeItem(key)
    }
  }
}

function WorkspaceToolbar({ onClearDraft, visualStep }: { onClearDraft: () => void; visualStep: BuildVisualStep }) {
  const dossier = messages.dossier

  return (
    <header className="border-b border-black/[0.06] bg-[#F8F6F1]/80 px-5 py-4 backdrop-blur-xl sm:px-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={ROUTES.home}
          className="mk-focus inline-flex items-center rounded-2xl pr-3 text-foreground transition hover:text-foreground/80"
          aria-label="Back to Dossier home"
        >
          <LogoMark />
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-xl bg-[#101114] px-4 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(8,10,15,0.16)] hover:bg-[#1d2028]"
          onClick={() => {
            onClearDraft()
            useDossierStore.getState().reset()
            usePortfolioStore.getState().reset()
            clearWorkspaceStorage()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        >
          {dossier.resetWorkspace}
        </Button>
      </div>
      <div className="mx-auto mt-5 max-w-[42rem]">
        <PortfolioBuildStepper visualStep={visualStep} />
      </div>
    </header>
  )
}

function BuildTrustStrip() {
  const build = messages.build
  const trust = build.trust
  const cards = [
    { title: trust.secureTitle, body: trust.secureBody, icon: Lock },
    { title: trust.speedTitle, body: trust.speedBody, icon: Zap },
    { title: trust.templatesTitle, body: trust.templatesBody, icon: Sparkles },
  ] as const

  return (
    <ul className="workspace-trust-strip grid gap-3 p-3 sm:grid-cols-3">
      {cards.map(({ title, body, icon: Icon }, i) => (
        <motion.li
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.35 }}
          className="workspace-trust-card group relative overflow-hidden rounded-xl p-4"
        >
          <div className="relative z-10 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#101114] text-white shadow-[0_12px_28px_rgba(8,10,15,0.18)]">
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/45">0{i + 1}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  )
}

function DirectionSystemPanel() {
  const cards = [
    {
      title: "Structure",
      kicker: "Section rhythm",
      body: "Your resume is mapped into a readable portfolio order with room for edits.",
      visual: "linear-gradient(135deg,#F4F0E8 0 48%,#FFFFFF 48% 100%)",
    },
    {
      title: "Typography",
      kicker: "Editorial hierarchy",
      body: "Headlines, labels, and body copy get a polished scale before the studio opens.",
      visual: "linear-gradient(135deg,#101114 0 36%,#F8F6F1 36% 68%,#EEE9DF 68% 100%)",
    },
    {
      title: "Interaction",
      kicker: "Motion cues",
      body: "Subtle motion and section variants are prepared without locking you into a template.",
      visual: "radial-gradient(circle at 70% 30%,rgba(109,92,246,.35),transparent 22%),linear-gradient(135deg,#080A0F,#31333A)",
    },
  ] as const
  const [active, setActive] = useState(0)
  const card = cards[active]!
  const next = () => setActive((i) => (i + 1) % cards.length)
  const prev = () => setActive((i) => (i + cards.length - 1) % cards.length)

  return (
    <div className="workspace-panel relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(16,17,20,0.08),transparent_30%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-foreground/55">Direction board</p>
          <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-[-0.045em] text-foreground">
            See what your style choice changes.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Each direction tunes structure, type, spacing, and motion before the editable studio opens.
          </p>
        </div>
        <div className="hidden rounded-2xl bg-[#101114] p-3 text-white shadow-[0_18px_44px_rgba(8,10,15,0.18)] sm:block">
          <Layers3 className="size-5" aria-hidden />
        </div>
      </div>

      <div className="relative mt-8 grid gap-4 lg:grid-cols-[0.8fr_1fr]">
        <div className="relative min-h-72 overflow-hidden rounded-2xl border border-black/10 bg-[#F4F0E8] p-6">
          <motion.div
            key={card.title}
            className="absolute inset-6 rounded-2xl shadow-[0_24px_70px_rgba(23,24,31,0.16)]"
            style={{ background: card.visual }}
            initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute left-10 top-10 h-2 w-24 rounded-full bg-black/18" />
          <div className="absolute left-10 top-16 h-2 w-36 rounded-full bg-black/10" />
          <div className="absolute bottom-10 right-10 h-24 w-32 rounded-xl bg-white/52 shadow-lg" />
        </div>

        <div className="flex min-h-72 flex-col justify-between rounded-2xl border border-black/10 bg-white/62 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{card.kicker}</p>
            <motion.h3
              key={`${card.title}-title`}
              className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {card.title}
            </motion.h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{card.body}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {cards.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={`h-1.5 rounded-full transition-all ${index === active ? "w-8 bg-[#101114]" : "w-3 bg-black/15"}`}
                  onClick={() => setActive(index)}
                  aria-label={`Show ${item.title}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" className="grid size-10 place-items-center rounded-full border border-black/10 bg-white text-foreground shadow-sm" onClick={prev} aria-label="Previous direction detail">
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button type="button" className="grid size-10 place-items-center rounded-full bg-[#101114] text-white shadow-[0_14px_34px_rgba(8,10,15,0.18)]" onClick={next} aria-label="Next direction detail">
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DossierPortfolioWorkspace() {
  const loading = useDossierStore((s) => s.loading)
  const error = useDossierStore((s) => s.error)
  const file = useDossierStore((s) => s.file)
  const portfolioData = useDossierStore((s) => s.portfolioData)
  const build = messages.build
  const { submit } = usePortfolioParse()
  const [draftFile, setDraftFile] = useState<File | null>(null)

  const visualStep: BuildVisualStep = loading ? 2 : draftFile ? 1 : 0

  useEffect(() => {
    return () => {
      document.title = messages.seo.buildTitle
    }
  }, [])

  if (portfolioData) {
    return (
      <div className={loading ? "mx-auto w-full max-w-[96rem] px-4 py-4 sm:px-6 lg:px-8" : "flex min-h-[100dvh] flex-col"}>
        {loading ? <WorkspaceToolbar visualStep={2} onClearDraft={() => setDraftFile(null)} /> : null}
        {error ? (
          <p
            className={`mb-4 rounded-lg border border-destructive/40 bg-destructive/10 py-3 typo-body-md text-destructive ${
              loading ? "px-4" : "mx-4 px-4 sm:mx-6"
            }`}
          >
            {error}
          </p>
        ) : null}
        {loading ? (
          <ParsingLoader key={file ? `${file.name}-${file.size}` : "parse"} className="min-h-[28rem]" />
        ) : (
          <PortfolioStudioView />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="workspace-shell">
          <WorkspaceToolbar visualStep={2} onClearDraft={() => setDraftFile(null)} />
          <ParsingLoader key={file ? `${file.name}-${file.size}` : "parse"} className="min-h-[32rem] border-0 bg-transparent shadow-none" />
        </div>
      ) : (
        <div className="workspace-shell">
          <WorkspaceToolbar visualStep={visualStep} onClearDraft={() => setDraftFile(null)} />

          {!draftFile ? (
            <div className="grid gap-8 px-5 pb-5 sm:px-7 sm:pb-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
              <section className="relative min-h-[28rem] overflow-hidden rounded-3xl p-3 sm:p-6">
                <div className="absolute bottom-[-8rem] left-[-5rem] h-72 w-96 rounded-[52%_48%_40%_60%] bg-[#101114]/[0.035] blur-2xl" aria-hidden />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground/55">{build.stepLabel}</span>
                <h1 className="workspace-serif mt-5 max-w-[28rem] text-[clamp(2.75rem,5vw,4.25rem)] leading-[0.96] text-foreground">
                  Let&apos;s start with your resume.
                </h1>
                <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                  Upload your PDF and Dossier will structure your experience into a polished portfolio draft you can refine inside the studio.
                </p>
                <div className="mt-10 flex max-w-sm gap-3 text-xs leading-6 text-muted-foreground">
                  <Lock className="mt-1 size-4 shrink-0 text-foreground/70" aria-hidden />
                  <p>Private by default. Your resume is only used to generate your portfolio.</p>
                </div>
              </section>
              <section className="workspace-panel p-4 sm:p-6">
                <UploadZone onSelectFile={setDraftFile} disabled={loading} />
              </section>
              <div className="lg:col-span-2">
                <BuildTrustStrip />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 px-5 pb-5 sm:px-7 sm:pb-7 xl:grid-cols-[0.58fr_1fr]">
              <section className="flex flex-col">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground/55">{build.stepLabel}</span>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground">Choose a direction.</h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  These styles shape typography, layout rhythm, spacing, and atmosphere. You can refine everything later inside the studio.
                </p>
              {!draftFile ? (
                <UploadZone onSelectFile={setDraftFile} disabled={loading} />
              ) : (
                <PortfolioStyleConfigureCard
                  file={draftFile}
                  busy={loading}
                  onPickDifferent={() => setDraftFile(null)}
                  onGenerate={(ctx) => void submit(draftFile, ctx)}
                />
              )}

              {error ? (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 typo-body-md text-destructive">
                  {error}
                </p>
              ) : null}
              </section>
              <DirectionSystemPanel />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
