"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { PlainText, paragraphs } from "@/components/portfolio/sections/PlainText"
import type { TextProps } from "@/components/portfolio/sections/types"
import { cx } from "@/components/portfolio/sections/primitives"
import { usePortfolioStore } from "@/store/usePortfolioStore"

/**
 * Studio text slot. Outside edit mode it is PlainText. In edit mode: double-click (or Enter when
 * focused) to edit in place; Enter commits single-line fields, Escape cancels. Writes by section id.
 */
export function EditableText(props: TextProps) {
  const { as: Tag = "span", value, className, paragraphs: paras, attrs, path } = props
  const editMode = usePortfolioStore((s) => s.editMode)
  const updateSectionField = usePortfolioStore((s) => s.updateSectionField)
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!editing || !el) return
    el.innerText = value
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [editing, value])

  if (!editMode) return <PlainText {...props} />

  const commit = () => {
    const next = (ref.current?.innerText ?? "").replace(/\n{3,}/g, "\n\n").trim()
    if (next !== value) updateSectionField(path, next)
    setEditing(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!editing) {
      if (e.key === "Enter") {
        e.preventDefault()
        setEditing(true)
      }
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      setEditing(false)
    } else if (e.key === "Enter" && !e.shiftKey && !paras) {
      e.preventDefault()
      commit()
    }
  }

  return (
    <Tag
      {...attrs}
      ref={ref}
      className={cx(className, "pf-edit")}
      contentEditable={editing}
      suppressContentEditableWarning
      tabIndex={0}
      role={editing ? "textbox" : undefined}
      aria-label={editing ? `Edit ${path.field}` : undefined}
      data-placeholder={`Add ${path.field}`}
      onDoubleClick={() => setEditing(true)}
      onBlur={() => editing && commit()}
      onKeyDown={onKeyDown}
    >
      {editing ? null : paras ? paragraphs(value) : value}
    </Tag>
  )
}
