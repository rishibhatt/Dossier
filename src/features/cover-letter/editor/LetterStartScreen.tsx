"use client"

import { AlertTriangle, ArrowRight, Check, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, useSyncExternalStore, type DragEvent } from "react"

import { siteBtnClass } from "@/components/marketing/primitives"
import { getTypstClient } from "@/features/resume/engine/client"
import { useSessionUser } from "@/features/resume/lib/useSessionUser"
import { LETTER_HANDOFF_KEY, runLetterScan } from "@/features/tools/letterScan"
import { cleanResumeLines } from "@/lib/ai/compactResumeText"
import { letterFonts } from "@/lib/cover-letter/looks"
import { PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { readResume } from "@/lib/pdf/extractSections"
import { resumeDataToDocument } from "@/lib/resume/mappers"
import { guessPreset, PRESETS } from "@/lib/resume/presets"
import { PRESET_IDS, resumeDocumentSchema, type PresetId } from "@/lib/resume/schema"
import { DEFAULT_TEMPLATE_ID, getTemplate, RESUME_TEMPLATES } from "@/lib/resume/templates"

import { listLetterDrafts, type LetterDraftSummary } from "../lib/drafts"
import { accountResumes, deviceResumes, loadResume, timeAgo, type LoadedResume, type ResumeOption } from "../lib/resumeSource"
import { startFromChecker, startLetter } from "../lib/startLetter"

const noSubscribe = () => () => {}
const param = (k: string) => new URLSearchParams(window.location.search).get(k)
/** Country aliases a guide may link with (?format=ie), mapped to the preset that covers them. Same as the resume. */
const FORMAT_ALIASES: Record<string, PresetId> = { gb: "uk", ie: "uk", ca: "us", nz: "au" }
const formatFromUrl = (): PresetId | null => {
  const raw = param("format")?.toLowerCase()
  if (!raw) return null
  return (PRESET_IDS as readonly string[]).includes(raw) ? (raw as PresetId) : (FORMAT_ALIASES[raw] ?? null)
}
const templateFromUrl = () => {
  const id = param("template")
  return id && RESUME_TEMPLATES.some((t) => t.id === id) ? id : null
}
let detectedPreset: PresetId | null = null
let resumeCache: ResumeOption[] | null = null
let letterCache: LetterDraftSummary[] | null = null
const NO_RESUMES: ResumeOption[] = []
const NO_LETTERS: LetterDraftSummary[] = []

const words = (s: string) => s.split(/\s+/).filter(Boolean).length
const AD_SHORT = "That ad is under 40 words. Paste the whole post, including the requirements, or skip it."
const AD_UNREADABLE = "We couldn't find a role or company in that text. You can still start, and fill them in yourself."

/** The job ad saved by the free ATS and letter checkers (useSaved("ats_jd")). */
function savedJobAd() {
  try {
    const raw = localStorage.getItem("dossier_tool_ats_jd")
    const v = raw ? (JSON.parse(raw) as unknown) : ""
    return typeof v === "string" ? v : ""
  } catch {
    return ""
  }
}

function resumeLabel(r: ResumeOption) {
  const who = [r.name, r.headline].filter(Boolean).join(", ")
  return who || r.title || "Untitled resume"
}

export function LetterStartScreen() {
  const router = useRouter()
  const user = useSessionUser()
  const fileInput = useRef<HTMLInputElement>(null)
  const ids = { role: useId(), company: useId(), ad: useId(), ad2: useId(), preset: useId() }

  const detected = useSyncExternalStore(noSubscribe, () => (detectedPreset ??= guessPreset()), () => "us" as PresetId)
  const formatParam = useSyncExternalStore(noSubscribe, formatFromUrl, () => null)
  const templateParam = useSyncExternalStore(noSubscribe, templateFromUrl, () => null)
  const resumeParam = useSyncExternalStore(noSubscribe, () => param("resume"), () => null)
  const fromChecker = useSyncExternalStore(noSubscribe, () => param("from") === "checker", () => false)
  const device = useSyncExternalStore(noSubscribe, () => (resumeCache ??= deviceResumes()), () => NO_RESUMES)
  const letters = useSyncExternalStore(noSubscribe, () => (letterCache ??= listLetterDrafts().slice(0, 5)), () => NO_LETTERS)

  const [account, setAccount] = useState<ResumeOption[]>([])
  const [pickedKey, setPickedKey] = useState<string | null>(null)
  const [pdf, setPdf] = useState<LoadedResume | null>(null)
  const [chosenPreset, setPreset] = useState<PresetId | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [company, setCompany] = useState("")
  const [ad, setAd] = useState("")
  const [adOnly, setAdOnly] = useState("")
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState<"" | "pdf" | "resume" | "ad" | "checker">("")
  const [adWarned, setAdWarned] = useState(false)
  const [importError, setImportError] = useState("")
  const [resumeError, setResumeError] = useState("")
  const [adError, setAdError] = useState("")

  // Signed in: add account resumes this device doesn't hold.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    void accountResumes().then((list) => {
      if (cancelled) return
      const onDevice = new Set(device.map((d) => d.remoteId).filter(Boolean))
      setAccount(list.filter((r) => !onDevice.has(r.remoteId)))
    })
    return () => {
      cancelled = true
    }
  }, [user, device])

  const options = [...device, ...account].slice(0, 6)
  // ?resume=<draftId or account id> picks that resume; otherwise the newest one is ready to use.
  const fromParam = resumeParam ? options.find((o) => o.draftId === resumeParam || o.remoteId === resumeParam) : undefined
  const selected = pdf ? null : (options.find((o) => o.key === pickedKey) ?? fromParam ?? options[0])
  const hasSource = Boolean(pdf || selected)
  const selectedPreset = pdf ? null : (selected?.preset ?? null)
  const preset = chosenPreset ?? formatParam ?? selectedPreset ?? detected
  const templateId = templateParam ?? (selected ? selected.templateId : DEFAULT_TEMPLATE_ID)
  const roleValue = role ?? (pdf ? pdf.doc.basics.headline : (selected?.headline ?? ""))

  useEffect(() => {
    // Start loading the typesetter now, so the editor opens ready.
    void getTypstClient()
      .request({ type: "warm", fonts: letterFonts(templateId) })
      .catch(() => {})
  }, [templateId])

  // From the free checker: open the pasted letter straight away (handed over in this tab only).
  const handled = useRef(false)
  useEffect(() => {
    if (!fromChecker || handled.current) return
    handled.current = true
    let text = ""
    try {
      text = sessionStorage.getItem(LETTER_HANDOFF_KEY) ?? ""
      sessionStorage.removeItem(LETTER_HANDOFF_KEY)
    } catch {
      /* storage blocked: start normally */
    }
    if (!text.trim()) return
    setBusy("checker")
    const id = startFromChecker(text, savedJobAd(), preset, templateId)
    router.replace(`/cover-letter/edit?id=${id}`)
  }, [fromChecker, preset, templateId, router])

  const go = (id: string) => router.push(`/cover-letter/edit?id=${id}`)

  const startFromResume = async (withAd: boolean) => {
    setResumeError("")
    const jobAd = withAd ? ad.trim() : ""
    if (jobAd && words(jobAd) < 40) {
      setResumeError(AD_SHORT)
      return
    }
    setBusy("resume")
    const loaded = pdf ?? (selected ? await loadResume({ draftId: selected.draftId, remoteId: selected.remoteId }) : null)
    if (!loaded) {
      setBusy("")
      setResumeError("We couldn't open that resume. Choose another one, or start blank.")
      return
    }
    const guess = jobAd ? runLetterScan("", jobAd).detected : null
    go(
      startLetter({
        how: pdf ? "pdf" : "resume",
        resume: loaded,
        role: roleValue || guess?.role || "",
        company: company || guess?.company || "",
        jobPost: jobAd,
        preset,
        templateId,
      }),
    )
  }

  const startFromAd = () => {
    setAdError("")
    const text = adOnly.trim()
    if (words(text) < 40) {
      setAdError(AD_SHORT)
      return
    }
    const guess = runLetterScan("", text).detected
    if (!guess.role && !guess.company && !adWarned) {
      // Say so once; a second press starts anyway.
      setAdError(AD_UNREADABLE)
      setAdWarned(true)
      return
    }
    setBusy("ad")
    go(startLetter({ how: "job_ad", role: guess.role ?? "", company: guess.company ?? "", jobPost: text, preset, templateId }))
  }

  const importFile = async (file: File | undefined) => {
    setImportError("")
    if (!file) return
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setImportError("That isn't a PDF. Export your resume as a PDF and try again, or start from a sample.")
      return
    }
    if (file.size > PDF_UPLOAD_MAX_BYTES) {
      setImportError("That PDF is over 4 MB. Resumes are usually under 1 MB; try exporting it again without images.")
      return
    }
    setBusy("pdf")
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const res = await getTypstClient().request({ type: "extract", bytes })
      if (res.type !== "text") throw new Error(res.type === "error" ? res.error : "Couldn't read that file.")
      if (res.text.replace(/\s/g, "").length < 80) {
        setImportError("We couldn't find any text in this PDF. It may be a scanned image. Start from a sample or blank instead.")
        return
      }
      const parsed = resumeDocumentSchema.safeParse(resumeDataToDocument(readResume(cleanResumeLines(res.text))))
      if (!parsed.success) {
        setImportError("We read the PDF but couldn't sort it into sections. Start from a sample or blank and paste your details in.")
        return
      }
      setPdf({ doc: parsed.data, design: { templateId, preset, paper: null, density: "standard", accent: "ink" }, draftId: null, remoteId: null })
      setRole(null)
    } catch (e) {
      setImportError(e instanceof Error ? `Couldn't read that PDF: ${e.message}` : "Couldn't read that PDF.")
    } finally {
      setBusy("")
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void importFile(e.dataTransfer.files?.[0])
  }

  if (busy === "checker") {
    return (
      <div className="site-wrap rz-start">
        <p className="rz-hint" role="status">
          Opening your letter from the checker…
        </p>
      </div>
    )
  }

  const dropSlot = (
    <div
      className="rz-drop"
      data-over={over}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <button type="button" className="rz-drop-btn" onClick={() => fileInput.current?.click()} disabled={busy === "pdf"}>
        <span className="rz-drop-icon" aria-hidden>
          <Upload width={20} height={20} />
        </span>
        <span>
          <strong>{busy === "pdf" ? "Reading your PDF…" : options.length ? "Use a resume PDF instead" : "Choose a PDF"}</strong>
          <span>or drop it here</span>
        </span>
      </button>
      <span className="rz-fine rz-mono">PDF · up to 4 MB · read on this device, never uploaded</span>
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          void importFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />
    </div>
  )

  return (
    <div className="site-wrap rz-start">
      <div className="rz-head rz-mono">
        <span>Dossier Cover Letter</span>
        <span>New letter</span>
      </div>

      <div className="rz-start-title">
        <h1>Start your cover letter</h1>
        <p>Start from your resume and the job ad, or begin blank. The letter uses your resume’s design, so the two match when you send them.</p>
      </div>

      <div className="rz-ways" data-layout="letter">
        <section className="rz-way" aria-labelledby="way-resume">
          <h2 id="way-resume">Use my resume</h2>
          <p>We copy your name, contact details, latest job and your results with numbers. Nothing is typed twice.</p>

          {options.length ? (
            <div className="rz-samples" role="radiogroup" aria-label="Resume to start from">
              {options.map((o) => {
                const on = !pdf && selected?.key === o.key
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className="rz-sample"
                    onClick={() => {
                      setPdf(null)
                      setPickedKey(o.key)
                      setRole(null)
                    }}
                  >
                    <span>
                      <strong>{resumeLabel(o)}</strong>
                      <br />
                      <span className="rz-mono">
                        {getTemplate(o.templateId).name} · {o.where === "account" ? "in your account" : timeAgo(o.updatedAt)}
                      </span>
                    </span>
                    {on ? <Check aria-hidden /> : <ArrowRight aria-hidden />}
                  </button>
                )
              })}
            </div>
          ) : null}

          {pdf ? (
            <p className="rz-hint" role="status">
              From your PDF: <strong>{pdf.doc.basics.name || "your resume"}</strong>.{" "}
              <button type="button" className="rz-inline-link" onClick={() => setPdf(null)}>
                Remove
              </button>
            </p>
          ) : null}

          {hasSource ? (
            <div className="rz-way-foot" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div className="rz-grid">
                <div className="rz-field">
                  <label className="rz-label" htmlFor={ids.role}>
                    Job title
                  </label>
                  <input id={ids.role} className="rz-input" value={roleValue} maxLength={120} onChange={(e) => setRole(e.target.value)} placeholder="Data Analyst" />
                </div>
                <div className="rz-field">
                  <label className="rz-label" htmlFor={ids.company}>
                    Company
                  </label>
                  <input id={ids.company} className="rz-input" value={company} maxLength={160} onChange={(e) => setCompany(e.target.value)} placeholder="Northwind" />
                </div>
                <div className="rz-field rz-wide">
                  <label className="rz-label" htmlFor={ids.ad}>
                    <span>Add the job ad</span>
                    <span className="rz-mono">Recommended</span>
                  </label>
                  <textarea
                    id={ids.ad}
                    className="rz-textarea"
                    rows={5}
                    maxLength={12000}
                    value={ad}
                    onChange={(e) => setAd(e.target.value)}
                    placeholder="Paste the whole post. We pick your results and skills that match it."
                  />
                </div>
              </div>
              {resumeError ? (
                <div className="rz-error" role="alert">
                  <AlertTriangle aria-hidden />
                  <span>{resumeError}</span>
                </div>
              ) : null}
              <div className="rz-dialog-actions">
                <button
                  type="button"
                  className={siteBtnClass({ variant: "primary" })}
                  onClick={() => void startFromResume(true)}
                  disabled={busy === "resume"}
                  data-loading={busy === "resume" || undefined}
                >
                  <span className="site-btn-label">{busy === "resume" ? "Writing your letter…" : "Start my letter"}</span>
                </button>
                {ad.trim() ? null : (
                  <button type="button" className={siteBtnClass({ variant: "quiet" })} onClick={() => void startFromResume(false)} disabled={busy === "resume"}>
                    <span className="site-btn-label">Skip the ad for now</span>
                  </button>
                )}
              </div>
              {dropSlot}
            </div>
          ) : (
            <div className="rz-way-foot">
              {options.length ? (
                <p className="rz-hint" style={{ marginBottom: "0.75rem" }}>
                  Choose a resume above, or read one from a PDF.
                </p>
              ) : null}
              {dropSlot}
            </div>
          )}
          {importError ? (
            <div className="rz-error" role="alert">
              <AlertTriangle aria-hidden />
              <span>{importError}</span>
            </div>
          ) : null}
          {!options.length && !pdf ? (
            <p className="rz-hint">
              No resume on this device yet.{" "}
              <Link className="rz-inline-link" href={`/resume/new?format=${preset}`}>
                Build one first
              </Link>{" "}
              and the letter copies it.
            </p>
          ) : null}
        </section>

        <section className="rz-way" aria-labelledby="way-ad">
          <h2 id="way-ad">Paste the job ad</h2>
          <p>We take the role and company from the ad and write a first draft with gaps for your own examples.</p>
          <div className="rz-way-foot" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="rz-field">
              <label className="rz-label" htmlFor={ids.ad2}>
                <span>Job ad</span>
                {adOnly.trim() ? <span className="rz-mono">{words(adOnly)} words</span> : null}
              </label>
              <textarea
                id={ids.ad2}
                className="rz-textarea"
                rows={6}
                maxLength={12000}
                value={adOnly}
                onChange={(e) => {
                  setAdOnly(e.target.value)
                  setAdWarned(false)
                }}
                placeholder="Paste the full job post here"
              />
            </div>
            {adError ? (
              <div className="rz-error" role="alert">
                <AlertTriangle aria-hidden />
                <span>{adError}</span>
              </div>
            ) : null}
            <div>
              <button type="button" className={siteBtnClass({ variant: "secondary" })} onClick={startFromAd} disabled={!adOnly.trim() || busy === "ad"}>
                <span className="site-btn-label">{adError === AD_UNREADABLE ? "Start anyway" : "Use this ad"}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="rz-way" aria-labelledby="way-blank">
          <h2 id="way-blank">Start blank</h2>
          <p>Four empty paragraphs, each with a note on what goes in it. Add your details as you go.</p>
          <div className="rz-way-foot">
            <button type="button" className={siteBtnClass({ variant: "secondary" })} onClick={() => go(startLetter({ how: "blank", preset, templateId }))}>
              <span className="site-btn-label">Start blank</span>
            </button>
          </div>
        </section>
      </div>

      <div className="rz-field" style={{ maxWidth: "26rem", marginTop: "1.25rem" }}>
        <label className="rz-label" htmlFor={ids.preset}>
          Where you’re applying
        </label>
        <select id={ids.preset} className="rz-select" value={preset} onChange={(e) => setPreset(e.target.value as PresetId)}>
          {PRESET_IDS.map((id) => (
            <option key={id} value={id}>
              {PRESETS[id].label}
            </option>
          ))}
        </select>
        <p className="rz-hint">Sets the date style, the greeting and sign-off, and A4 or US Letter. {PRESETS[preset].note}</p>
      </div>

      {letters.length ? (
        <>
          <div className="rz-section-head">
            <h2>On this device</h2>
            <span className="rz-mono">{letters.length} saved</span>
          </div>
          <div className="rz-recent">
            {letters.map((d) => (
              <Link key={d.id} href={`/cover-letter/edit?id=${d.id}`}>
                <strong>{d.title || [d.role, d.company].filter(Boolean).join(", ") || "Untitled letter"}</strong>
                <span className="rz-mono">
                  {getTemplate(d.templateId).name} · {timeAgo(d.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
