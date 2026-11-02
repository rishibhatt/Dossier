"use client"

import { ArrowDown, ArrowUp, Check, Plus, RefreshCw, Trash2, X } from "lucide-react"
import { useId, useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { buildLetter, hasPlaceholder, toLetterParagraphs, type LetterVariantId } from "@/features/cover-letter/letterGen"
import { AreaField, TextField } from "@/features/resume/editor/fields"
import { PolishButton } from "@/features/tools/PolishButton"
import { runLetterScan } from "@/features/tools/letterScan"
import { track } from "@/lib/analytics"
import { resumeFacts, type ResumeFacts } from "@/lib/cover-letter/fromResume"
import { defaultGreeting, defaultSignOff, defaultSubject, formatLetterDate, isNamedRecipient, LETTER_CONVENTIONS } from "@/lib/cover-letter/renderModel"
import { LETTER_LIMITS, letterParagraph, type CoverLetterDocument, type ParagraphKind } from "@/lib/cover-letter/schema"
import { newId } from "@/lib/resume/schema"

import { loadResume } from "../lib/resumeSource"
import { useLetterEditor } from "../lib/store"

const KIND_LABEL: Record<ParagraphKind, string> = {
  opening: "Opening",
  proof: "Example",
  fit: "Why you fit",
  closing: "Closing",
  custom: "Paragraph",
}

const KIND_PLACEHOLDER: Record<ParagraphKind, string> = {
  opening: "Name the role and why this company, in two sentences.",
  proof: "What you did, with a number, that matters for this job.",
  fit: "The skills from the ad you have used, and one specific reason you want this company.",
  closing: "Thank them and ask for a next step, such as a short call.",
  custom: "One point, in a few sentences.",
}

const countWords = (s: string) => s.split(/\s+/).filter(Boolean).length

/** The letter as plain text, the way the checker reads it. */
export function letterPlainText(doc: CoverLetterDocument, preset: keyof typeof LETTER_CONVENTIONS) {
  return [
    doc.greeting.trim() || defaultGreeting(doc.recipient.name),
    ...doc.paragraphs.map((p) => p.text.trim()).filter(Boolean),
    doc.signOff.trim() || defaultSignOff(preset, isNamedRecipient(doc)),
    doc.signature.trim() || doc.sender.name.trim(),
  ].join("\n\n")
}

function Block({ id, title, hint, children, aside }: { id?: string; title: string; hint?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rz-block" id={id} aria-label={title} style={{ scrollMarginTop: "1rem" }}>
      <div className="rz-block-head" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0, flex: "1 1 14rem" }}>
          <h2 className="rz-h">{title}</h2>
          {hint ? <p className="rz-hint">{hint}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

/* -------------------------------------------------------------------------------------------- */

const STEPS_KEY = "dossier:letter:v1:steps-dismissed"

function Checklist({ doc }: { doc: CoverLetterDocument }) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(STEPS_KEY) === "1"
    } catch {
      return false
    }
  })
  if (hidden) return null

  const texts = doc.paragraphs.map((p) => p.text.trim()).filter(Boolean)
  const first = texts[0] ?? ""
  const last = texts[texts.length - 1] ?? ""
  const role = doc.job.role.trim().toLowerCase()
  const firstTwo = first.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ").toLowerCase()
  const withoutGaps = (s: string) => s.replace(/\[[^\]]*\]/g, "")
  const steps = [
    { id: "to", text: "Say who it’s to", done: Boolean(doc.recipient.name.trim() || doc.recipient.company.trim()), go: "lt-to" },
    { id: "role", text: "Opening line names the role", done: Boolean(role && firstTwo.includes(role)), go: "lt-letter" },
    { id: "number", text: "One example with a number", done: texts.some((t) => /\d/.test(withoutGaps(t))), go: "lt-letter" },
    {
      id: "ask",
      text: "Closing asks for a next step",
      done: texts.length > 1 && /\?|\b(call|talk|meet|meeting|interview|discuss|hear from you|next step)\b/i.test(last),
      go: "lt-letter",
    },
    { id: "gaps", text: "No [gaps] left to fill", done: texts.length > 0 && !texts.some(hasPlaceholder), go: "lt-letter" },
  ]
  const done = steps.filter((s) => s.done).length
  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem(STEPS_KEY, "1")
    } catch {
      /* storage blocked */
    }
  }

  return (
    <section className="rz-steps" aria-label="Steps to a finished letter">
      <div className="rz-steps-head">
        <strong>{done === steps.length ? "Your letter is ready." : "Steps to a finished letter"}</strong>
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span className="rz-mono">
            {done} of {steps.length}
          </span>
          <button type="button" className="rz-icon-btn" aria-label="Hide these steps" onClick={dismiss}>
            <X />
          </button>
        </span>
      </div>
      <div className="rz-steps-meter" aria-hidden>
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol>
        {steps.map((s) => (
          <li key={s.id} className="rz-step" data-done={s.done}>
            <span className="rz-step-mark" aria-hidden>
              {s.done ? <Check /> : null}
            </span>
            <span className="rz-step-text">
              {s.text}
              <span className="sr-only">{s.done ? " (done)" : ""}</span>
            </span>
            {!s.done ? (
              <button type="button" onClick={() => document.getElementById(s.go)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                Go there
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

/* -------------------------------------------------------------------------------------------- */

function JobAdField({ doc }: { doc: CoverLetterDocument }) {
  const edit = useLetterEditor((s) => s.edit)
  const preset = useLetterEditor((s) => s.draft?.design.preset ?? "us")
  const report = useMemo(
    () => (doc.jobPost.trim().length >= 120 ? runLetterScan(letterPlainText(doc, preset), doc.jobPost, { company: doc.recipient.company, role: doc.job.role }) : null),
    [doc, preset],
  )
  const kws = report?.keywords ?? null
  const found = kws?.filter((k) => k.found).length ?? 0

  return (
    <>
      <AreaField
        label="Job ad"
        value={doc.jobPost}
        onChange={(v) =>
          edit("jobPost", (d) => {
            d.jobPost = v
          })
        }
        maxLength={12000}
        rows={5}
        placeholder="Paste the whole post. It stays on this device and is never printed."
      />
      {kws && kws.length ? (
        <div className="rz-wide" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <p className="rz-hint" aria-live="polite">
            <span className="rz-mono" style={{ color: "var(--site-ink)" }}>
              {found} of {kws.length}
            </span>{" "}
            words from the ad are in your letter. Solid ones are in, dashed ones are missing. Add only what is true for you.
          </p>
          <div className="rz-chips">
            {kws.map((k) => (
              <span key={k.term} className="rz-kw" data-hit={k.found}>
                {k.term}
                <span className="sr-only">{k.found ? " (in your letter)" : " (missing)"}</span>
              </span>
            ))}
          </div>
        </div>
      ) : doc.jobPost.trim() ? (
        <p className="rz-hint rz-wide">Paste a little more of the ad to see which of its words your letter uses.</p>
      ) : null}
    </>
  )
}

/* -------------------------------------------------------------------------------------------- */

function Paragraphs({ doc }: { doc: CoverLetterDocument }) {
  const edit = useLetterEditor((s) => s.edit)
  const undo = useLetterEditor((s) => s.undo)
  const list = doc.paragraphs

  const move = (i: number, d: -1 | 1) =>
    edit("move-paragraph", (x) => {
      const j = i + d
      if (j < 0 || j >= x.paragraphs.length) return
      ;[x.paragraphs[i], x.paragraphs[j]] = [x.paragraphs[j]!, x.paragraphs[i]!]
    })

  return (
    <div className="rz-items">
      {list.map((p, i) => (
        <ParagraphItem
          key={p.id}
          index={i}
          count={list.length}
          kind={p.kind}
          text={p.text}
          role={doc.job.role}
          onChange={(text, key = `para:${p.id}`) =>
            edit(key, (x) => {
              const t = x.paragraphs.find((y) => y.id === p.id)
              if (t) t.text = text
            })
          }
          onMove={(d) => move(i, d)}
          onRemove={() => {
            edit("remove-paragraph", (x) => {
              x.paragraphs = x.paragraphs.filter((y) => y.id !== p.id)
            })
            toast("Paragraph removed", { action: { label: "Undo", onClick: () => undo() } })
          }}
        />
      ))}
    </div>
  )
}

function ParagraphItem({
  index,
  count,
  kind,
  text,
  role,
  onChange,
  onMove,
  onRemove,
}: {
  index: number
  count: number
  kind: ParagraphKind
  text: string
  role: string
  onChange: (text: string, key?: string) => void
  onMove: (d: -1 | 1) => void
  onRemove: () => void
}) {
  const id = useId()
  const label = `${KIND_LABEL[kind]}${kind === "custom" ? ` ${index + 1}` : ""}`
  const n = countWords(text)
  const gap = hasPlaceholder(text)
  return (
    <div className="rz-item">
      <div className="rz-item-row">
        <label className="rz-item-toggle" htmlFor={id} style={{ cursor: "text" }}>
          <strong>{label}</strong>
          <span className="rz-mono">{n ? `${n} words` : "Empty"}</span>
        </label>
        <button type="button" className="rz-icon-btn" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp />
        </button>
        <button type="button" className="rz-icon-btn" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(1)}>
          <ArrowDown />
        </button>
        <button type="button" className="rz-icon-btn" aria-label={`Remove ${label}`} onClick={onRemove}>
          <Trash2 />
        </button>
      </div>
      <div className="rz-item-body" style={{ paddingTop: 0 }}>
        <textarea
          id={id}
          className="rz-textarea"
          rows={Math.min(9, Math.max(3, Math.ceil(text.length / 70)))}
          value={text}
          maxLength={LETTER_LIMITS.paragraphChars}
          placeholder={KIND_PLACEHOLDER[kind]}
          aria-describedby={gap ? `${id}-gap` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {gap ? (
          <p id={`${id}-gap`} className="rz-hint" style={{ marginTop: "0.375rem" }}>
            Replace the part in [brackets] with your own words before you send it.
          </p>
        ) : null}
        {n >= 12 && !gap ? (
          <PolishButton
            kind="letter"
            text={text}
            role={role || undefined}
            onAccept={(t) => {
              onChange(t, "polish")
              track("letter_polish_accept", { kind })
              toast("Rewrite added", { action: { label: "Undo", onClick: () => useLetterEditor.getState().undo() } })
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------- */

function VariantPicker({ doc, facts }: { doc: CoverLetterDocument; facts: ResumeFacts | null }) {
  const edit = useLetterEditor((s) => s.edit)
  const undo = useLetterEditor((s) => s.undo)
  const preset = useLetterEditor((s) => s.draft?.design.preset ?? "us")
  const [picked, setPicked] = useState<LetterVariantId | null>(null)
  const [rebuilding, setRebuilding] = useState(false)
  const linked = Boolean(doc.source.resumeDraftId || doc.source.resumeRemoteId || facts)

  const input = (f: ResumeFacts | null) => ({
    facts: f,
    role: doc.job.role,
    company: doc.recipient.company,
    recipientName: doc.recipient.name,
    source: doc.job.source,
    jobPost: doc.jobPost,
    preset,
  })
  const built = useMemo(() => buildLetter(input(facts)), [facts, doc.job.role, doc.recipient.company, doc.recipient.name, doc.job.source, doc.jobPost, preset]) // eslint-disable-line react-hooks/exhaustive-deps
  const current = picked && built.variants.some((v) => v.id === picked) ? picked : built.variant

  const apply = (id: LetterVariantId, f: ResumeFacts | null, message: string) => {
    const b = f === facts ? built : buildLetter(input(f))
    const v = b.variants.find((x) => x.id === id) ?? b.variants[0]!
    edit("variant", (d) => {
      d.paragraphs = toLetterParagraphs(v.paragraphs)
    })
    setPicked(v.id)
    toast(message, { action: { label: "Undo", onClick: () => undo() } })
  }

  const rebuild = async () => {
    setRebuilding(true)
    // Read the resume again so this week's edits count; fall back to the facts saved with the letter.
    const r = await loadResume({ draftId: doc.source.resumeDraftId, remoteId: doc.source.resumeRemoteId })
    const fresh = r ? resumeFacts(r.doc) : facts
    if (r) {
      useLetterEditor.setState((s) => (s.draft ? { draft: { ...s.draft, facts: fresh } } : s))
    }
    setRebuilding(false)
    apply(current, fresh, r ? "Rebuilt from your resume" : "Rebuilt from the resume details saved with this letter")
    track("letter_generated", { variant: current, has_job_post: Boolean(doc.jobPost.trim()), from_resume: Boolean(fresh) })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1rem" }}>
      <span className="rz-label" id="lt-variant-label">
        <span>Draft shape</span>
        <span className="rz-mono">Replaces the paragraphs below</span>
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <div className="rz-segment" role="radiogroup" aria-labelledby="lt-variant-label">
          {built.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={current === v.id}
              onClick={() => {
                track("letter_variant_pick", { variant: v.id })
                apply(v.id, facts, `${v.label} draft in place`)
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        {linked ? (
          <button type="button" className="rz-chip" onClick={() => void rebuild()} disabled={rebuilding} aria-busy={rebuilding}>
            <RefreshCw aria-hidden /> {rebuilding ? "Reading your resume…" : "Rebuild from resume"}
          </button>
        ) : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------- */

export function LetterContentPanel() {
  const draft = useLetterEditor((s) => s.draft)
  const edit = useLetterEditor((s) => s.edit)
  const [showAddress, setShowAddress] = useState(false)
  const dateId = useId()
  if (!draft) return null
  const { doc, design } = draft
  const preset = design.preset
  const named = isNamedRecipient(doc)
  const words = doc.paragraphs.reduce((n, p) => n + countWords(p.text), 0)
  const set =
    <S extends "job" | "recipient" | "sender">(part: S, key: keyof CoverLetterDocument[S]) =>
    (v: string) =>
      edit(`${part}:${String(key)}`, (d) => {
        ;(d[part] as Record<string, unknown>)[key as string] = v
      })
  const setTop = (key: "greeting" | "subject" | "signOff" | "signature") => (v: string) =>
    edit(key, (d) => {
      d[key] = v
    })
  const autoSubject = defaultSubject(doc, preset)

  return (
    <>
      <Checklist doc={doc} />

      <Block id="lt-job" title="The job" hint="The role and company appear in the letter. The ad picks which of your results and skills to mention.">
        <div className="rz-grid">
          <TextField label="Job title" value={doc.job.role} onChange={set("job", "role")} placeholder="Data Analyst" maxLength={120} />
          <TextField label="Company" value={doc.recipient.company} onChange={set("recipient", "company")} placeholder="Northwind" maxLength={160} />
          <TextField label="Job reference (optional)" value={doc.job.reference} onChange={set("job", "reference")} placeholder="REQ-4471" maxLength={80} />
          <TextField label="Where you saw it (optional)" value={doc.job.source} onChange={set("job", "source")} placeholder="LinkedIn" maxLength={120} />
          <JobAdField doc={doc} />
        </div>
      </Block>

      <Block id="lt-to" title="To" hint="A named person gets a named greeting. Leave the name blank to write to the hiring team.">
        <div className="rz-grid">
          <TextField label="Contact name (optional)" value={doc.recipient.name} onChange={set("recipient", "name")} placeholder="Ms Ana Ortiz" maxLength={120} />
          <TextField label="Their title (optional)" value={doc.recipient.title} onChange={set("recipient", "title")} placeholder="Head of Analytics" maxLength={120} />
          {showAddress || doc.recipient.address ? (
            <AreaField label="Company address (optional)" value={doc.recipient.address} onChange={set("recipient", "address")} maxLength={300} rows={3} placeholder={"12 Market Street\nLondon EC2A 4BX"} />
          ) : (
            <div className="rz-wide">
              <button type="button" className="rz-add" onClick={() => setShowAddress(true)}>
                <Plus aria-hidden /> Add address
              </button>
            </div>
          )}
          <div className="rz-field">
            <label className="rz-label" htmlFor={dateId}>
              <span>Date</span>
              <span className="rz-mono">{formatLetterDate(doc.date, preset)}</span>
            </label>
            <input
              id={dateId}
              className="rz-input"
              type="date"
              value={doc.date}
              onChange={(e) =>
                edit("date", (d) => {
                  d.date = /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) ? e.target.value : ""
                })
              }
            />
            <p className="rz-hint">{doc.date ? "Clear it to use the day you download." : "Blank uses the day you download."}</p>
          </div>
        </div>
      </Block>

      <Block id="lt-letter" title="Letter" hint="Built only from your resume and the ad. Anything we could not find is left in [brackets] for you to fill.">
        <VariantPicker doc={doc} facts={draft.facts ?? null} />
        <div className="rz-grid" style={{ marginBottom: "1rem" }}>
          <TextField label="Greeting" value={doc.greeting} onChange={setTop("greeting")} placeholder={defaultGreeting(doc.recipient.name)} maxLength={120} />
          <TextField
            label={LETTER_CONVENTIONS[preset].autoSubject ? "Subject line" : "Subject line (optional)"}
            value={doc.subject}
            onChange={setTop("subject")}
            placeholder={autoSubject || (doc.job.role ? `Application for ${doc.job.role}` : "Application for the role")}
            maxLength={200}
          />
        </div>
        <Paragraphs doc={doc} />
        {doc.paragraphs.length < LETTER_LIMITS.paragraphs ? (
          <div style={{ marginTop: "0.875rem" }}>
            <button
              type="button"
              className="rz-add"
              onClick={() =>
                edit("add-paragraph", (d) => {
                  // A new paragraph goes before the closing, where body text belongs.
                  const at = d.paragraphs.length && d.paragraphs[d.paragraphs.length - 1]!.kind === "closing" ? d.paragraphs.length - 1 : d.paragraphs.length
                  d.paragraphs.splice(at, 0, letterParagraph("custom"))
                })
              }
            >
              <Plus aria-hidden /> Add a paragraph
            </button>
          </div>
        ) : null}
        <div className="rz-grid" style={{ marginTop: "1rem" }}>
          <TextField label="Sign-off" value={doc.signOff} onChange={setTop("signOff")} placeholder={defaultSignOff(preset, named)} maxLength={60} />
          <TextField label="Signature" value={doc.signature} onChange={setTop("signature")} placeholder={doc.sender.name || "Your name"} maxLength={100} />
        </div>
        <p className="rz-hint rz-mono" style={{ marginTop: "0.875rem" }} aria-live="polite">
          {words} words · most letters land between 250 and 400
        </p>
      </Block>

      <Block
        id="lt-from"
        title="From"
        hint={doc.source.resumeDraftId || doc.source.resumeRemoteId ? "Copied from your resume when you started. Changes here stay in this letter." : "Printed at the top, as on your resume."}
      >
        <div className="rz-grid">
          <TextField label="Full name" value={doc.sender.name} onChange={set("sender", "name")} autoComplete="name" maxLength={100} />
          <TextField label="Headline (optional)" value={doc.sender.headline} onChange={set("sender", "headline")} maxLength={140} />
          <TextField label="Email" value={doc.sender.email} onChange={set("sender", "email")} type="email" inputMode="email" autoComplete="email" maxLength={160} />
          <TextField label="Phone" value={doc.sender.phone} onChange={set("sender", "phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={40} />
          <TextField label="City and country" value={doc.sender.location} onChange={set("sender", "location")} autoComplete="address-level2" wide maxLength={120} />
          <SenderLinks />
        </div>
      </Block>
    </>
  )
}

function SenderLinks() {
  const links = useLetterEditor((s) => s.draft?.doc.sender.links ?? [])
  const edit = useLetterEditor((s) => s.edit)
  const set = (fn: (l: CoverLetterDocument["sender"]["links"]) => CoverLetterDocument["sender"]["links"], key = "links") =>
    edit(key, (d) => {
      d.sender.links = fn(d.sender.links)
    })
  return (
    <div className="rz-field rz-wide">
      <span className="rz-label">
        <span>Links</span>
        <span className="rz-mono">Up to 3, such as LinkedIn or a portfolio</span>
      </span>
      <div className="rz-bullets">
        {links.map((l, i) => (
          <div key={l.id} className="rz-link-row">
            <input
              className="rz-input"
              aria-label={`Link ${i + 1} text`}
              placeholder="Text (e.g. LinkedIn)"
              value={l.label}
              maxLength={40}
              onChange={(e) => set((ls) => ls.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)), `link-label:${l.id}`)}
            />
            <input
              className="rz-input"
              aria-label={`Link ${i + 1} URL`}
              inputMode="url"
              placeholder="https://..."
              value={l.url}
              maxLength={300}
              onChange={(e) => set((ls) => ls.map((x) => (x.id === l.id ? { ...x, url: e.target.value.trim() } : x)), `link:${l.id}`)}
            />
            <button type="button" className="rz-icon-btn" aria-label={`Remove link ${i + 1}`} onClick={() => set((ls) => ls.filter((x) => x.id !== l.id))}>
              <X />
            </button>
          </div>
        ))}
        {links.length < 3 ? (
          <div>
            <button type="button" className="rz-add" onClick={() => set((ls) => [...ls, { id: newId("l"), label: "", url: "" }])}>
              <Plus aria-hidden /> Add a link
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
