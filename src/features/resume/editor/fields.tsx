"use client"

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react"
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react"

import { newId, type Bullet } from "@/lib/resume/schema"

export function Field({
  label,
  hint,
  wide,
  children,
  htmlFor,
}: {
  label: string
  hint?: ReactNode
  wide?: boolean
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className={wide ? "rz-field rz-wide" : "rz-field"}>
      <label className="rz-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {hint ? <span className="rz-mono">{hint}</span> : null}
      </label>
      {children}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  wide,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  wide?: boolean
  type?: "text" | "email" | "tel" | "url"
  autoComplete?: string
  inputMode?: "text" | "email" | "tel" | "url" | "numeric"
  maxLength?: number
  error?: string
}) {
  const id = useId()
  return (
    <Field label={label} wide={wide} htmlFor={id}>
      <input
        id={id}
        className="rz-input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <span id={`${id}-err`} className="rz-field-error">
          {error}
        </span>
      ) : null}
    </Field>
  )
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength: number
  rows?: number
}) {
  const id = useId()
  return (
    <Field label={label} wide htmlFor={id} hint={value.length > maxLength * 0.7 ? `${value.length}/${maxLength}` : undefined}>
      <textarea
        id={id}
        className="rz-textarea"
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "2024-03" / "2024" / "". A month select plus a year box, because desktop Safari has no month picker. */
export function MonthField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const id = useId()
  const [year = "", month = ""] = value.split("-")
  const set = (y: string, m: string) => {
    const yy = y.replace(/\D/g, "").slice(0, 4)
    onChange(yy.length === 4 ? (m ? `${yy}-${m}` : yy) : yy ? yy : "")
  }
  return (
    <div className="rz-field">
      <span className="rz-label" id={`${id}-l`}>
        {label}
      </span>
      <div className="rz-month" role="group" aria-labelledby={`${id}-l`}>
        <select
          className="rz-select"
          aria-label={`${label} month`}
          value={month}
          disabled={disabled}
          onChange={(e) => set(year, e.target.value)}
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
        <input
          className="rz-input"
          aria-label={`${label} year`}
          inputMode="numeric"
          placeholder="Year"
          maxLength={4}
          value={year}
          disabled={disabled}
          onChange={(e) => set(e.target.value, month)}
        />
      </div>
    </div>
  )
}

export function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="rz-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

/**
 * Bullet lines. Enter at the end of a line starts a new bullet; Backspace in an empty bullet removes it and
 * moves up, the way a word processor behaves.
 */
export function BulletsField({
  label = "Bullet points",
  bullets,
  onChange,
  placeholder,
  max = 20,
}: {
  label?: string
  bullets: Bullet[]
  onChange: (b: Bullet[]) => void
  placeholder?: string
  max?: number
}) {
  const refs = useRef(new Map<string, HTMLTextAreaElement>())
  const focus = (id: string) => requestAnimationFrame(() => refs.current.get(id)?.focus())

  const add = (at: number) => {
    if (bullets.length >= max) return
    const b = { id: newId("b"), text: "" }
    const next = [...bullets]
    next.splice(at, 0, b)
    onChange(next)
    focus(b.id)
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>, i: number) => {
    const el = e.currentTarget
    if (e.key === "Enter" && !e.shiftKey && el.selectionStart === el.value.length) {
      e.preventDefault()
      add(i + 1)
    } else if (e.key === "Backspace" && el.value === "" && bullets.length > 0) {
      e.preventDefault()
      const prev = bullets[i - 1]
      onChange(bullets.filter((_, j) => j !== i))
      if (prev) focus(prev.id)
    }
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= bullets.length) return
    const next = [...bullets]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="rz-field rz-wide">
      <span className="rz-label">
        <span>{label}</span>
        <span className="rz-mono">Enter adds a line</span>
      </span>
      <div className="rz-bullets">
        {bullets.map((b, i) => (
          <div className="rz-bullet" key={b.id}>
            <span className="rz-bullet-mark" aria-hidden>
              •
            </span>
            <textarea
              ref={(el) => {
                if (el) refs.current.set(b.id, el)
                else refs.current.delete(b.id)
              }}
              className="rz-textarea"
              rows={1}
              maxLength={600}
              aria-label={`Bullet ${i + 1}`}
              value={b.text}
              placeholder={i === 0 ? placeholder : undefined}
              onKeyDown={(e) => onKey(e, i)}
              onChange={(e) => onChange(bullets.map((x) => (x.id === b.id ? { ...x, text: e.target.value.replace(/\n/g, " ") } : x)))}
            />
            <span style={{ display: "flex" }}>
              <button type="button" className="rz-icon-btn rz-hide-phone" aria-label={`Move bullet ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp />
              </button>
              <button
                type="button"
                className="rz-icon-btn rz-hide-phone"
                aria-label={`Move bullet ${i + 1} down`}
                disabled={i === bullets.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown />
              </button>
              <button type="button" className="rz-icon-btn" aria-label={`Remove bullet ${i + 1}`} onClick={() => onChange(bullets.filter((x) => x.id !== b.id))}>
                <X />
              </button>
            </span>
          </div>
        ))}
        {bullets.length < max ? (
          <div>
            <button type="button" className="rz-add" onClick={() => add(bullets.length)}>
              <Plus aria-hidden /> Add a bullet
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
