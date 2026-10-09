"use client"

import { useEffect, useRef } from "react"
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, Eye, EyeOff, Globe, GripVertical, Plus, Trash2 } from "lucide-react"

import { MetaEditor } from "@/components/studio/editors/blockEditors"
import { StudioSectionEditor } from "@/components/studio/StudioSectionEditor"
import { canvasRoot, revealSection } from "@/features/studio/canvasDom"
import { PanelFrame } from "@/features/studio/panels/PanelFrame"
import { countLabel, SECTION_CATALOG, sectionCount } from "@/features/studio/sectionCatalog"
import { removeSection, toggleHidden } from "@/features/studio/sectionOps"
import { useStudioStatus } from "@/features/studio/studioStatus"
import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useStudioUiStore } from "@/store/useStudioUiStore"
import type { PortfolioSection } from "@/types/dossier"

function SectionRow({ section, index }: { section: PortfolioSection; index: number }) {
  const hidden = usePortfolioStore((s) => Boolean(s.hiddenSectionIds[section.id]))
  const open = useStudioUiStore((s) => s.editorId === section.id)
  const selected = useStudioUiStore((s) => s.selectedId === section.id)
  const setEditorId = useStudioUiStore((s) => s.setEditorId)
  const select = useStudioUiStore((s) => s.select)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const row = useRef<HTMLLIElement | null>(null)
  const { label, Icon } = SECTION_CATALOG[section.type] ?? SECTION_CATALOG.about
  const count = countLabel(section.type, sectionCount(section))

  // Opened from the canvas: bring the row into view.
  useEffect(() => {
    if (open) row.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [open])

  return (
    <li
      ref={(n) => {
        setNodeRef(n)
        row.current = n
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-selected={selected}
      data-dragging={isDragging}
      className="ws-row"
    >
      <div className="flex items-center">
        <button type="button" className="ws-icon-btn cursor-grab touch-none active:cursor-grabbing" aria-label={`Move ${label}. Press space, then the arrow keys.`} {...attributes} {...listeners}>
          <GripVertical className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`editor-${section.id}`}
          onClick={() => {
            setEditorId(open ? null : section.id)
            if (!open) {
              select(section.id)
              revealSection(canvasRoot(), section.id)
            }
          }}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className="sp-no w-5 shrink-0 text-xs text-[var(--site-ink-3)]">{String(index + 1).padStart(2, "0")}</span>
          <Icon className={cn("size-4 shrink-0", hidden && "opacity-40")} aria-hidden />
          <span className={cn("shrink-0 text-sm font-semibold", hidden && "text-[var(--site-ink-3)] line-through")}>{label}</span>
          {count ? <span className="sp-data min-w-0 truncate">{count}</span> : null}
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-[var(--site-ink-2)] transition-transform duration-200", open && "rotate-180")} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => toggleHidden(section.id)}
          aria-pressed={hidden}
          aria-label={hidden ? `Show ${label} on the page` : `Hide ${label} from the page`}
          className="ws-icon-btn"
        >
          {hidden ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {open ? (
        <div id={`editor-${section.id}`} className="border-t border-[var(--site-rule)] bg-[var(--site-sheet)]">
          <StudioSectionEditor section={section} />
          {section.type !== "hero" ? (
            <div className="border-t border-[var(--site-rule)] px-2 py-1">
              <button type="button" onClick={() => removeSection(section.id)} className="ws-quiet-btn ws-danger">
                <Trash2 className="size-4" aria-hidden />
                Remove {label}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function ContentPanel() {
  const sections = usePortfolioStore((s) => s.document?.sections)
  const reorderSections = usePortfolioStore((s) => s.reorderSections)
  const metaOpen = useStudioUiStore((s) => s.editorId === "meta")
  const setEditorId = useStudioUiStore((s) => s.setEditorId)
  const setPanel = useStudioUiStore((s) => s.setPanel)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!sections) return <PanelFrame title="Edit">{null}</PanelFrame>

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    useStudioStatus.getState().pushHistory()
    reorderSections(String(e.active.id), String(e.over.id))
  }

  return (
    <PanelFrame title="Edit" hint="Tap a section to change its words. Drag the handle to reorder.">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ol className="ws-rows" aria-label="Sections on your page">
            {sections.map((s, i) => (
              <SectionRow key={s.id} section={s} index={i} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <button type="button" onClick={() => setPanel("add")} className="site-btn site-btn-secondary w-full">
        <Plus className="size-4" aria-hidden />
        <span className="site-btn-label">Add a section</span>
      </button>

      <div className="ws-rows">
        <div className="ws-row">
          <button type="button" aria-expanded={metaOpen} onClick={() => setEditorId(metaOpen ? null : "meta")} className="flex min-h-12 w-full items-center gap-2.5 px-3 text-left">
            <Globe className="size-4 shrink-0" aria-hidden />
            <span className="truncate text-sm font-semibold">Page title and preview text</span>
            <ChevronDown className={cn("ml-auto size-4 shrink-0 text-[var(--site-ink-2)] transition-transform duration-200", metaOpen && "rotate-180")} aria-hidden />
          </button>
          {metaOpen ? (
            <div className="border-t border-[var(--site-rule)] bg-[var(--site-sheet)]">
              <MetaEditor />
            </div>
          ) : null}
        </div>
      </div>
    </PanelFrame>
  )
}
