"use client"

import { useCallback, useState } from "react"

import { messages } from "@/config/messages"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type EditableFieldProps = {
  id: string
  label: string
  value: string
  onSave: (next: string) => void
  multiline?: boolean
  className?: string
}

export function EditableField({ id, label, value, onSave, multiline, className }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const commit = useCallback(() => {
    onSave(draft)
    setEditing(false)
  }, [draft, onSave])

  const cancel = useCallback(() => {
    setDraft(value)
    setEditing(false)
  }, [value])

  const empty = messages.common.emptyDisplay

  if (editing) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="typo-label-sm text-muted-foreground" htmlFor={id}>
          {label}
        </Label>
        {multiline ? (
          <Textarea
            id={id}
            className="min-h-28 resize-y"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel()
            }}
            autoFocus
          />
        ) : (
          <Input
            id={id}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") cancel()
            }}
            autoFocus
          />
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-muted/40",
        className
      )}
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
    >
      <span className="typo-label-sm text-muted-foreground block">{label}</span>
      <span className="typo-body-md text-foreground whitespace-pre-wrap">
        {value.trim() ? value : empty}
      </span>
    </button>
  )
}
