"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, Lock } from "lucide-react"

import { toast } from "sonner"

import { gsap, MOTION_OK, REDUCED_MOTION, useGSAP } from "@/components/marketing/motion/gsap"
import { Logo } from "@/components/marketing/primitives"
import { ParsingLoader } from "@/features/dossier/components/ParsingLoader"
import { PortfolioBuildStepper, type BuildVisualStep } from "@/features/dossier/components/PortfolioBuildStepper"
import { PortfolioStudioView } from "@/features/dossier/components/PortfolioStudioView"
import { PortfolioStyleConfigureCard } from "@/features/dossier/components/PortfolioStyleConfigureCard"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { ResumeSessionCard } from "@/features/dossier/components/ResumeSessionCard"
import { UploadZone } from "@/features/dossier/components/UploadZone"
import { usePortfolioParse } from "@/features/dossier/hooks/usePortfolioParse"
import { clearPendingUpload, peekPendingUpload, restorePendingUpload } from "@/features/dossier/lib/pendingUpload"
import { messages } from "@/config/messages"
import { ROUTES } from "@/lib/constants/routes"
import { clearLastSession } from "@/lib/portfolio/lastSession"
import { cn } from "@/lib/utils"
import { useDossierStore } from "@/store/useDossierStore"
import { buildProgress, useParseProgressStore } from "@/store/useParseProgressStore"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"

function clearWorkspaceStorage() {
  if (typeof window === "undefined") return
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const key = window.localStorage.key(i)
    if (key?.startsWith("dossier:canvas:v1:") || key?.startsWith("dossier:preview:v1:")) {
      window.localStorage.removeItem(key)
    }
  }
}

function BuilderHeader({
  visualStep,
  progress,
  showStartOver,
  onStartOver,
}: {
  visualStep: BuildVisualStep
  progress?: number
  showStartOver: boolean
  onStartOver: () => void
}) {
  return (
    <header className="shrink-0 border-b border-[var(--site-rule)] bg-[var(--site-paper)]">
      <div className="site-wrap flex flex-wrap items-center gap-x-6 gap-y-1.5 py-1.5 sm:py-2.5">
        <Link href={ROUTES.home} aria-label={messages.build.backHome} className="order-1 rounded-lg">
          <Logo />
        </Link>
        <div className="order-3 w-full pb-1 md:order-2 md:mx-auto md:w-full md:max-w-md md:flex-1 md:pb-0">
          <PortfolioBuildStepper visualStep={visualStep} progress={progress} />
        </div>
        <div className="order-2 ml-auto flex h-10 items-center md:order-3 md:min-w-24 md:justify-end">
          {showStartOver ? (
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-[var(--site-ink-2)] hover:bg-black/[0.05] hover:text-[var(--site-ink)]"
            >
              {messages.build.startOver}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function ParseFailure({ message, onRetry, onChooseAnother }: { message: string; onRetry: () => void; onChooseAnother: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#f0b4ae] bg-[#fdf1f0] p-3.5 text-[#8a1c13] sm:p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="font-semibold">We could not build your site.</p>
          <p className="mt-0.5 text-sm">{message}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onRetry} className="site-btn site-btn-primary site-btn-sm">
          <span className="site-btn-label">Try again</span>
        </button>
        <button type="button" onClick={onChooseAnother} className="site-btn site-btn-ghost site-btn-sm bg-white">
          <span className="site-btn-label">Choose a different PDF</span>
        </button>
      </div>
    </div>
  )
}

/** Wraps one step. When the step changes it slides up and opens with a clip-path wipe; reduced motion just swaps. */
function StepFrame({ stepKey, className, children }: { stepKey: string; className?: string; children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          el.current,
          { autoAlpha: 0, y: 22, clipPath: "inset(0 0 12% 0 round 16px)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0 round 16px)", duration: 0.7, ease: "power3.out", clearProps: "clipPath,transform" }
        )
      })
    },
    { dependencies: [stepKey] }
  )
  return (
    <div ref={el} className={cn("bf-step site-wrap py-3 sm:py-6", className)}>
      {children}
    </div>
  )
}

/**
 * The hand-off from build to studio: the finished plate sits over the real studio, then fades off it,
 * so the page seems to settle into the editor. The intro section is selected; a fallback read is flagged.
 */
function BuildCurtain({ onDone }: { onDone: () => void }) {
  const el = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    const first = usePortfolioStore.getState().document?.sections[0]?.id
    if (first) useStudioUiStore.getState().select(first)
    if (useParseProgressStore.getState().preview.source === "fallback")
      toast.warning("Read without AI", { description: "Check names, dates and links in Edit.", duration: 8000 })
    const finish = () => {
      useParseProgressStore.getState().reset()
      onDone()
    }
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.to(el.current, { autoAlpha: 0, scale: 1.015, duration: 0.6, delay: 0.35, ease: "power2.inOut", onComplete: finish })
    })
    mm.add(REDUCED_MOTION, finish)
  })
  return (
    <div ref={el} className="lb-curtain bf-root" aria-hidden>
      <BuilderHeader visualStep={2} progress={1} showStartOver={false} onStartOver={onDone} />
      <div className="bf-main">
        <div className="bf-step site-wrap max-w-3xl py-3 sm:py-6">
          <ParsingLoader frozen />
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
  const stageIndex = useParseProgressStore((s) => s.stageIndex)
  const build = messages.build
  const { submit, cancel, retry } = usePortfolioParse()
  // A file picked on the home page or a free tool skips straight to the look step.
  const [draftFile, setDraftFile] = useState<File | null>(() => (typeof window === "undefined" ? null : peekPendingUpload()))
  useEffect(() => {
    // A file in memory is consumed now. After a sign-up or Google round trip memory is empty, so restore the saved copy.
    if (peekPendingUpload()) {
      clearPendingUpload()
      return
    }
    let alive = true
    void restorePendingUpload().then((f) => {
      if (alive && f) {
        setDraftFile(f)
        clearPendingUpload()
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const visualStep: BuildVisualStep = loading ? 2 : draftFile ? 1 : 0
  const progress = loading ? buildProgress(stageIndex) : undefined

  // Build finished: keep the live plate over the studio for a moment and fade it off (see BuildCurtain).
  const [wasLoading, setWasLoading] = useState(loading)
  const [curtain, setCurtain] = useState(false)
  if (wasLoading !== loading) {
    setWasLoading(loading)
    if (!loading && portfolioData) setCurtain(true)
  }

  useEffect(() => {
    return () => {
      document.title = messages.seo.buildTitle
    }
  }, [])

  const startOver = () => {
    cancel()
    setDraftFile(null)
    useDossierStore.getState().reset()
    usePortfolioStore.getState().reset()
    useStudioUiStore.getState().reset()
    useStudioStatus.getState().reset()
    useParseProgressStore.getState().reset()
    clearLastSession()
    clearWorkspaceStorage()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Editor: the studio owns the whole screen once a portfolio exists.
  if (portfolioData && !loading) {
    return (
      <>
        <PortfolioStudioView onStartOver={startOver} />
        {curtain ? <BuildCurtain onDone={() => setCurtain(false)} /> : null}
      </>
    )
  }

  const stepKey = loading ? "parse" : draftFile ? "look" : "upload"

  return (
    <div className="bf-root" data-fit={loading}>
      <BuilderHeader visualStep={visualStep} progress={progress} showStartOver={Boolean(draftFile) || loading} onStartOver={startOver} />

      <div className="bf-main">
        {loading ? (
          <StepFrame stepKey={stepKey} className="max-w-3xl">
            <ParsingLoader key={file ? `${file.name}-${file.size}` : "parse"} onCancel={cancel} />
          </StepFrame>
        ) : !draftFile ? (
          <StepFrame stepKey={stepKey} className="max-w-2xl gap-3 sm:gap-4">
            <div>
              <h1 className="text-[1.5rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[2.25rem]" style={{ fontFamily: "var(--site-display)" }}>
                {build.uploadHeading}
              </h1>
              <p className="mt-1.5 text-sm text-[var(--site-ink-2)] sm:mt-2 sm:text-base">{build.uploadSub}</p>
            </div>
            <ResumeSessionCard />
            <UploadZone className="flex-1" onSelectFile={setDraftFile} disabled={loading} />
            <p className="flex gap-2 pb-1 text-xs text-[var(--site-ink-2)] sm:text-sm">
              <Lock className="mt-0.5 size-3.5 shrink-0 sm:size-4" aria-hidden />
              {build.privacyNote}
            </p>
          </StepFrame>
        ) : (
          <StepFrame stepKey={stepKey} className="max-w-[72rem] gap-3">
            {error ? (
              <ParseFailure
                message={error}
                onRetry={retry}
                onChooseAnother={() => {
                  useDossierStore.getState().setError(null)
                  setDraftFile(null)
                }}
              />
            ) : null}
            <PortfolioStyleConfigureCard
              file={draftFile}
              busy={loading}
              onPickDifferent={() => {
                useDossierStore.getState().setError(null)
                setDraftFile(null)
              }}
              onReplaceFile={(next) => {
                useDossierStore.getState().setError(null)
                setDraftFile(next)
              }}
              onGenerate={(ctx, options) => void submit(draftFile, ctx, options)}
            />
          </StepFrame>
        )}
      </div>
    </div>
  )
}
