"use client"

import { useId, useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"

/** Labelled text field. Writes on every keystroke so the canvas stays live. */
export function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  type = "text",
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
  type?: "text" | "email" | "tel" | "url"
  rows?: number
}) {
  const id = useId()
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="sp-label !text-[0.8125rem]">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="sp-field resize-y" />
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="sp-field" />
      )}
    </div>
  )
}

export function EditorStack({ children }: { children: ReactNode }) {
  return <div className="space-y-4 p-4">{children}</div>
}

export function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="site-btn site-btn-ghost site-btn-sm w-full">
      <Plus className="size-4" aria-hidden />
      <span className="site-btn-label">{label}</span>
    </button>
  )
}

const move = <T,>(list: T[], i: number, d: -1 | 1) => {
  const j = i + d
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  return next
}

/**
 * Repeating entries (roles, projects, schools...). Each entry is a ruled row that opens to its fields,
 * with move up, move down and remove. New entries open straight away.
 */
export function ItemList<T>({
  items,
  onChange,
  make,
  title,
  addLabel,
  noun,
  render,
}: {
  items: T[]
  onChange: (items: T[]) => void
  make: () => T
  title: (item: T) => string
  addLabel: string
  noun: string
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode
}) {
  const [open, setOpen] = useState<number | null>(items.length === 1 ? 0 : null)
  const update = (i: number) => (patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)))

  return (
    <div className="space-y-3 p-4">
      {items.length === 0 ? <p className="text-sm text-[var(--site-ink-2)]">No {noun}s yet. Add the first one.</p> : null}
      <ol className="sp-cells !rounded-[4px] overflow-hidden">
        {items.map((it, i) => {
          const isOpen = open === i
          const name = title(it).trim() || `Untitled ${noun}`
          return (
            <li key={i} className="!bg-[var(--site-sheet)]">
              <div className="flex items-center">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 px-3 text-left"
                >
                  <span className="sp-no shrink-0 text-xs text-[var(--site-ink-3)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate text-sm font-semibold">{name}</span>
                  <ChevronDown className={cn("ml-auto size-4 shrink-0 text-[var(--site-ink-2)] transition-transform duration-200", isOpen && "rotate-180")} aria-hidden />
                </button>
                <button type="button" disabled={i === 0} onClick={() => (onChange(move(items, i, -1)), setOpen(isOpen ? i - 1 : open))} aria-label={`Move ${name} up`} className="ws-icon-btn">
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={i === items.length - 1}
                  onClick={() => (onChange(move(items, i, 1)), setOpen(isOpen ? i + 1 : open))}
                  aria-label={`Move ${name} down`}
                  className="ws-icon-btn"
                >
                  <ArrowDown className="size-4" aria-hidden />
                </button>
              </div>
              {isOpen ? (
                <div className="space-y-4 border-t border-[var(--site-rule)] p-3">
                  {render(it, update(i))}
                  <button
                    type="button"
                    onClick={() => (onChange(items.filter((_, j) => j !== i)), setOpen(null))}
                    className="ws-quiet-btn ws-danger -ml-2"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Remove this {noun}
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
      <AddRowButton
        label={addLabel}
        onClick={() => {
          onChange([...items, make()])
          setOpen(items.length)
        }}
      />
    </div>
  )
}

/** Tags with remove buttons and one field to add more. Enter or a comma adds; pasting a list adds each. */
export function ChipsField({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const id = useId()
  const [draft, setDraft] = useState("")
  const add = (raw: string) => {
    const next = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s && !items.some((x) => x.toLowerCase() === s.toLowerCase()))
    if (next.length) onChange([...items, ...next])
    setDraft("")
  }
  return (
    <div className="space-y-3 p-4">
      <ul className="flex flex-wrap gap-2" aria-label={label}>
        {items.map((s, i) => (
          <li key={`${s}-${i}`} className="sp-chip !min-h-9 !pr-0">
            <span className="max-w-[14rem] truncate">{s}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove ${s}`} className="grid size-9 place-items-center rounded-[4px] text-[var(--site-ink-2)] hover:text-[var(--site-ink)]">
              <X className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
        {items.length === 0 ? <li className="text-sm text-[var(--site-ink-2)]">No skills yet.</li> : null}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add(draft)
        }}
        className="flex gap-2"
      >
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text")
            if (/[,\n]/.test(t)) {
              e.preventDefault()
              add(t)
            }
          }}
          className="sp-field min-w-0 flex-1"
        />
        <button type="submit" disabled={!draft.trim()} className="site-btn site-btn-primary site-btn-sm !h-12 shrink-0">
          <span className="site-btn-label">Add</span>
        </button>
      </form>
    </div>
  )
}

/**
 * A list typed as text: one item per line, or comma separated. The raw text stays local while typing,
 * so a new empty line or a trailing comma is not swallowed; the store gets the clean list.
 */
export function SplitField({ label, values, onChange, sep, hint }: { label: string; values: string[]; onChange: (v: string[]) => void; sep: "\n" | ","; hint: string }) {
  const id = useId()
  const join = (v: string[]) => v.join(sep === "," ? ", " : "\n")
  const [raw, setRaw] = useState(join(values))
  const [seen, setSeen] = useState(values)
  const clean = (t: string) => t.split(sep).map((s) => s.trim()).filter(Boolean)
  if (seen !== values) {
    setSeen(values)
    if (join(values) !== join(clean(raw))) setRaw(join(values))
  }
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="sp-label !text-[0.8125rem]">
        {label}
      </label>
      {sep === "\n" ? (
        <textarea id={id} rows={4} value={raw} onChange={(e) => (setRaw(e.target.value), onChange(clean(e.target.value)))} className="sp-field resize-y" />
      ) : (
        <input id={id} value={raw} onChange={(e) => (setRaw(e.target.value), onChange(clean(e.target.value)))} className="sp-field" />
      )}
      <p className="sp-data mt-1.5">{hint}</p>
    </div>
  )
}

const MAX_IMAGE = 1_500_000

/** Picks an image from the device instead of asking for a URL. Stored inline, so it is capped at 1.5 MB. */
export function ImageField({ label, value, onChange }: { label: string; value: string | null | undefined; onChange: (v: string | null) => void }) {
  const id = useId()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="min-w-0">
      <p className="sp-label !text-[0.8125rem]">{label}</p>
      <div className="flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-[2px] border border-[var(--site-rule-strong)] bg-[var(--site-paper-deep)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="size-full object-cover" /> : <span className="sp-data">None</span>}
        </span>
        <label htmlFor={id} className="site-btn site-btn-ghost site-btn-sm cursor-pointer">
          <span className="site-btn-label">{value ? "Replace" : "Choose image"}</span>
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ""
            if (!f) return
            if (f.size > MAX_IMAGE) return setError("That image is over 1.5 MB. Pick a smaller one.")
            setError(null)
            const r = new FileReader()
            r.onload = () => typeof r.result === "string" && onChange(r.result)
            r.readAsDataURL(f)
          }}
        />
        {value ? (
          <button type="button" onClick={() => onChange(null)} className="ws-quiet-btn">
            Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-[var(--site-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** One input per line item (links), each removable. */
export function RowsField({ label, rows: saved, onChange: save, placeholder, addLabel }: { label: string; rows: string[]; onChange: (rows: string[]) => void; placeholder: string; addLabel: string }) {
  // Empty rows live only here, so a fresh "Add link" row never shows up as a blank link on the page.
  const [rows, setRows] = useState(saved)
  const [seen, setSeen] = useState(saved)
  if (seen !== saved) {
    setSeen(saved)
    if (saved.join("\n") !== rows.filter((r) => r.trim()).join("\n")) setRows(saved)
  }
  const onChange = (next: string[]) => {
    setRows(next)
    save(next.filter((r) => r.trim()))
  }
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="sp-label !text-[0.8125rem]">{label}</legend>
      {rows.map((v, i) => (
        <div key={i} className="flex gap-1">
          <input
            aria-label={`${label} ${i + 1}`}
            type="url"
            inputMode="url"
            value={v}
            placeholder={placeholder}
            onChange={(e) => onChange(rows.map((r, j) => (j === i ? e.target.value : r)))}
            className="sp-field min-w-0 flex-1"
          />
          <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove link ${i + 1}`} className="ws-icon-btn !size-12">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <AddRowButton label={addLabel} onClick={() => onChange([...rows, ""])} />
    </fieldset>
  )
}
