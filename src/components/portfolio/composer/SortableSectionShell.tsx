"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"

import type { ReactNode } from "react"

type SortableSectionShellProps = {
  id: string
  children: (args: {
    dragAttributes: DraggableAttributes
    dragListeners: DraggableSyntheticListeners
  }) => ReactNode
}

export function SortableSectionShell({ id, children }: SortableSectionShellProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
  } as const

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-90 shadow-lg" : undefined}>
      {children({ dragAttributes: attributes, dragListeners: listeners })}
    </div>
  )
}
