"use client"

import { AlertTriangle, ArrowRight, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type DragEvent } from "react"

import { siteBtnClass } from "@/components/marketing/primitives"
import { cleanResumeLines } from "@/lib/ai/compactResumeText"
import { track } from "@/lib/analytics"
import { PDF_UPLOAD_MAX_BYTES } from "@/lib/constants/upload"
import { readResume } from "@/lib/pdf/extractSections"
import { resumeDataToDocument } from "@/lib/resume/mappers"
import { PRESETS } from "@/lib/resume/presets"
import { blankResume, SAMPLE_RESUMES, type SampleResume } from "@/lib/resume/samples"
import { PRESET_IDS, resumeDocumentSchema, type PresetId, type ResumeDesign, type ResumeDocument } from "@/lib/resume/schema"
import { DEFAULT_TEMPLATE_ID, getTemplate, RESUME_TEMPLATES } from "@/lib/resume/templates"

import { getTypstClient } from "../engine/client"
import { createDraft, listDrafts, type DraftSummary } from "../lib/drafts"
import { useTemplateThumbs } from "../lib/useTemplateThumbs"
import { TemplateGrid } from "./DesignPanel"

/** A sensible first guess at the country format from the browser's language. The person can change it. */
function guessPreset(): PresetId {
  const lang = typeof navigator !== "undefined" ? navigator.language : "en-US"
  const region = lang.split("-")[1]?.toUpperCase() ?? ""
  if (["US", "CA"].includes(region)) return "us"
  if (["GB", "IE"].includes(region)) return "uk"
  if (region === "IN") return "in"
  if (region === "DE" || region === "AT" || region === "CH") return "de"
  if (["AE", "SA", "QA", "KW", "BH", "OM"].includes(region)) return "gulf"
  if (["AU", "NZ"].includes(region)) return "au"
  if (["FR", "ES", "IT", "NL", "BE", "PT", "PL", "SE", "DK", "FI", "NO"].includes(region)) return "eu"
  return "us"
}

function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })
}

const noSubscribe = () => () => {}
const templateFromUrl = () => {
  const id = new URLSearchParams(window.location.search).get("template")
  return id && RESUME_TEMPLATES.some((t) => t.id === id) ? id : null
}
let detectedPreset: PresetId | null = null
let recentCache: DraftSummary[] | null = null
const EMPTY: DraftSummary[] = []

/** Fields in the order the "More samples" list shows them; only fields with a sample appear. */
const SAMPLE_DOMAINS = [...new Set(SAMPLE_RESUMES.slice(4).map((x) => x.domain))].sort()

function SampleButton({ sample, onPick }: { sample: SampleResume; onPick: (x: SampleResume) => void }) {
  return (
    <button type="button" className="rz-sample" onClick={() => onPick(sample)}>
      <span>
        <strong>{sample.role}</strong>
        <br />
        <span className="rz-mono">{sample.label}</span>
      </span>
      <ArrowRight aria-hidden />
    </button>
  )
}

export function StartScreen() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  // A template page links here as /resume/new?template=<id>; that counts as a choice already made.
  const fromUrl = useSyncExternalStore(noSubscribe, templateFromUrl, () => null)
  const [picked, setTemplateId] = useState<string | null>(null)
  const templateId = picked ?? fromUrl ?? DEFAULT_TEMPLATE_ID
  const templateChosen = Boolean(picked ?? fromUrl)
  const detected = useSyncExternalStore(noSubscribe, () => (detectedPreset ??= guessPreset()), () => "us" as PresetId)
  const [chosenPreset, setPreset] = useState<PresetId | null>(null)
  const preset = chosenPreset ?? detected
  const [over, setOver] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState("")
  const recent = useSyncExternalStore(noSubscribe, () => (recentCache ??= listDrafts().slice(0, 5)), () => EMPTY)

  useEffect(() => {
    // Start loading the typesetter now, so the editor opens ready.
    void getTypstClient()
      .request({ type: "warm", fonts: [...getTemplate(DEFAULT_TEMPLATE_ID).fonts] })
      .catch(() => {})
  }, [])

  const design = useMemo<ResumeDesign>(() => ({ templateId, preset, paper: null, density: "standard", accent: "ink" }), [templateId, preset])
  // Thumbnails depend on the format only; each one sets its own template.
  const thumbDesign = useMemo<ResumeDesign>(() => ({ templateId: DEFAULT_TEMPLATE_ID, preset, paper: null, density: "standard", accent: "ink" }), [preset])
  const thumbs = useTemplateThumbs(SAMPLE_RESUMES[0].doc, thumbDesign, true, 0)

  const start = (doc: ResumeDocument, how: "import" | "sample" | "blank", title = "", sampleId: string | null = null) => {
    const id = createDraft({ doc, design, title, sampleId, templateChosen })
    track("editor_start", { how, template: templateId, preset })
    router.push(`/resume/edit?id=${id}`)
  }

  const pickSample = (x: SampleResume) => start(structuredClone(x.doc), "sample", "", x.id)

  const importFile = async (file: File | undefined) => {
    setImportError("")
    if (!file) return
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setImportError("That isn't a PDF. Export your resume as a PDF and try again, or start from a sample.")
      return
    }
    if (file.size > PDF_UPLOAD_MAX_BYTES) {
      setImportError("That PDF is over 10 MB. Resumes are usually under 1 MB; try exporting it again without images.")
      return
    }
    setImporting(true)
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
      start(parsed.data, "import", file.name.replace(/\.pdf$/i, "").slice(0, 120))
    } catch (e) {
      setImportError(e instanceof Error ? `Couldn't read that PDF: ${e.message}` : "Couldn't read that PDF.")
    } finally {
      setImporting(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void importFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="site-wrap rz-start">
      <div className="rz-head rz-mono">
        <span>Dossier Resume</span>
        <span>New resume</span>
      </div>

      <div className="rz-start-title">
        <h1>Start your resume</h1>
        <p>Bring your old resume, edit a sample, or begin blank. The preview updates as you type, and the PDF you download matches it exactly.</p>
      </div>

      <div className="rz-field" style={{ maxWidth: "26rem", marginBottom: "1.25rem" }}>
        <label className="rz-label" htmlFor="start-preset">
          Where you’re applying
        </label>
        <select id="start-preset" className="rz-select" value={preset} onChange={(e) => setPreset(e.target.value as PresetId)}>
          {PRESET_IDS.map((id) => (
            <option key={id} value={id}>
              {PRESETS[id].label}
            </option>
          ))}
        </select>
        <p className="rz-hint">{PRESETS[preset].note}</p>
      </div>

      <div className="rz-ways">
        <section className="rz-way" aria-labelledby="way-import">
          <h2 id="way-import">Bring your old resume</h2>
          <p>We read the text in your PDF and fill in the form. Check it, then fix anything we missed.</p>
          <div
            className="rz-drop rz-way-foot"
            data-over={over}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(true)
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
          >
            <button type="button" className="rz-drop-btn" onClick={() => fileInput.current?.click()} disabled={importing}>
              <span className="rz-drop-icon" aria-hidden>
                <Upload width={20} height={20} />
              </span>
              <span>
                <strong>{importing ? "Reading your PDF…" : "Choose a PDF"}</strong>
                <span>or drop it here</span>
              </span>
            </button>
            <span className="rz-fine rz-mono">PDF · up to 10 MB · read on this device, never uploaded</span>
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
          {importError ? (
            <div className="rz-error" role="alert">
              <AlertTriangle aria-hidden />
              <span>{importError}</span>
            </div>
          ) : null}
        </section>

        <section className="rz-way" aria-labelledby="way-sample">
          <h2 id="way-sample">Start from a sample</h2>
          <p>A filled-in resume for a made-up person. Swap in your own details line by line.</p>
          <div className="rz-samples rz-way-foot">
            {SAMPLE_RESUMES.slice(0, 4).map((x) => (
              <SampleButton key={x.id} sample={x} onPick={pickSample} />
            ))}
            <details className="rz-more-samples">
              <summary>
                More samples · {SAMPLE_RESUMES.length - 4} roles
              </summary>
              {SAMPLE_DOMAINS.map((d) => (
                <div key={d} className="rz-sample-group">
                  <p className="rz-mono">{d}</p>
                  {SAMPLE_RESUMES.slice(4)
                    .filter((x) => x.domain === d)
                    .map((x) => (
                      <SampleButton key={x.id} sample={x} onPick={pickSample} />
                    ))}
                </div>
              ))}
            </details>
          </div>
        </section>

        <section className="rz-way" aria-labelledby="way-blank">
          <h2 id="way-blank">Start blank</h2>
          <p>Empty sections for experience, education and skills. Add more as you go.</p>
          <div className="rz-way-foot">
            <button type="button" className={siteBtnClass({ variant: "secondary" })} onClick={() => start(blankResume(), "blank")}>
              <span className="site-btn-label">Start blank</span>
            </button>
          </div>
        </section>
      </div>

      <div className="rz-section-head">
        <h2>Template</h2>
        <span className="rz-mono">Pick one now or later in Design</span>
      </div>
      <TemplateGrid thumbs={thumbs} value={templateId} onChange={setTemplateId} className="rz-start-templates" chosenLabel={templateChosen ? "Chosen" : "Default"} />
      <p className="rz-hint rz-mono" style={{ marginTop: "0.625rem" }}>
        Shown with {SAMPLE_RESUMES[0].label}. Not a real person.
      </p>

      {recent.length ? (
        <>
          <div className="rz-section-head">
            <h2>On this device</h2>
            <span className="rz-mono">{recent.length} saved</span>
          </div>
          <div className="rz-recent">
            {recent.map((d) => (
              <Link key={d.id} href={`/resume/edit?id=${d.id}`}>
                <strong>{d.title || "Untitled resume"}</strong>
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
