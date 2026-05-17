"use client"

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Briefcase,
  Edit3,
  FolderOpen,
  Info,
  LayoutGrid,
  Mail,
  User,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getPortfolioSectionLabel } from "@/config/portfolioSections"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { PortfolioSectionType } from "@/types/dossier"

const SECTION_ICONS: Record<PortfolioSectionType, LucideIcon> = {
  hero: User,
  about: Info,
  skills: Zap,
  experience: Briefcase,
  projects: FolderOpen,
  contact: Mail,
}

function SortableSectionPill({ id, type }: { id: string; type: PortfolioSectionType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const Icon = SECTION_ICONS[type] ?? LayoutGrid
  const label = getPortfolioSectionLabel(type)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex cursor-grab select-none items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground active:cursor-grabbing",
        isDragging && "scale-95 opacity-60"
      )}
      {...attributes}
      {...listeners}
    >
      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      {label}
    </div>
  )
}

export function CanvasModeDock() {
  const editMode = usePortfolioStore((s) => s.editMode)
  const setEditMode = usePortfolioStore((s) => s.setEditMode)
  const document = usePortfolioStore((s) => s.document)
  const reorderSections = usePortfolioStore((s) => s.reorderSections)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorderSections(String(active.id), String(over.id))
  }

  if (!document) return null

  const ids = document.sections.map((s) => s.id)

  if (!editMode) {
    return (
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex w-full max-w-[95%] -translate-x-1/2 justify-center px-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto gap-2 bg-background/90 shadow-lg backdrop-blur-sm"
          onClick={() => setEditMode(true)}
        >
          <Edit3 className="size-3.5" />
          Canvas mode
          <span className="text-xs text-muted-foreground">Drag sections to reorder</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex w-full max-w-[98%] -translate-x-1/2 justify-center px-1">
      <div className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur-md">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
            {document.sections.map((s) => (
              <SortableSectionPill key={s.id} id={s.id} type={s.type} />
            ))}
          </SortableContext>
        </DndContext>
        <button
          type="button"
          className="ml-1 shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Exit canvas mode"
          onClick={() => setEditMode(false)}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
