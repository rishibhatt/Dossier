"use client"

import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
} from "react"

import { cn } from "@/lib/utils"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import type { ExperienceEntry, PortfolioSectionType, ProjectEntry } from "@/types/dossier"

type CanvasTextProps = {
  sectionType: PortfolioSectionType
  field: string
  value: string
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** For `sectionType="experience"` — which row to patch. */
  experienceIndex?: number
  /** For `sectionType="projects"` — which project card. */
  projectIndex?: number
  /** For `sectionType="skills"` — which chip / list item. */
  skillIndex?: number
}

/**
 * In-place text edit when canvas edit mode is on (double-click).
 */
export function CanvasText({
  sectionType,
  field,
  value,
  as: Tag = "span",
  className,
  style,
  experienceIndex,
  projectIndex,
  skillIndex,
}: CanvasTextProps) {
  const editMode = usePortfolioStore((s) => s.editMode)
  const updateSection = usePortfolioStore((s) => s.updateSection)
  const updateExperienceItem = usePortfolioStore((s) => s.updateExperienceItem)
  const updateProjectItem = usePortfolioStore((s) => s.updateProjectItem)
  const updateSkillItem = usePortfolioStore((s) => s.updateSkillItem)
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.textContent = value
      ref.current.focus()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing, value])

  const commit = useCallback(() => {
    const el = ref.current
    if (!el) return
    const next = el.innerText.replace(/\n+$/, "").trim()

    if (sectionType === "hero" && (field === "name" || field === "title" || field === "tagline")) {
      updateSection("hero", { [field]: next } as { name?: string; title?: string; tagline?: string })
    } else if (sectionType === "about" && field === "body") {
      updateSection("about", { body: next })
    } else if (sectionType === "contact") {
      if (field === "email") updateSection("contact", { email: next })
      else if (field === "phone") updateSection("contact", { phone: next })
      else if (field === "headline") updateSection("contact", { headline: next })
    } else if (sectionType === "experience" && experienceIndex != null) {
      const key = field as keyof ExperienceEntry
      if (key === "company" || key === "role" || key === "duration" || key === "description") {
        updateExperienceItem(experienceIndex, { [key]: next } as Partial<ExperienceEntry>)
      }
    } else if (sectionType === "projects" && projectIndex != null) {
      if (field === "name") updateProjectItem(projectIndex, { name: next })
      else if (field === "description") updateProjectItem(projectIndex, { description: next })
      else if (field === "tech") {
        const tech = next
          .split(/\s*·\s*|,/g)
          .map((t) => t.trim())
          .filter(Boolean)
        updateProjectItem(projectIndex, { tech } as Partial<ProjectEntry>)
      }
    } else if (sectionType === "skills" && skillIndex != null) {
      updateSkillItem(skillIndex, next)
    }

    setEditing(false)
  }, [
    experienceIndex,
    field,
    projectIndex,
    sectionType,
    skillIndex,
    updateExperienceItem,
    updateProjectItem,
    updateSection,
    updateSkillItem,
  ])

  const ringClass = cn(
    "rounded-sm outline-none ring-offset-2 ring-offset-[var(--de-bg)]",
    editing ? "ring-2 ring-[var(--de-accent)]" : "cursor-text hover:ring-1 hover:ring-[var(--de-border)]"
  )

  if (!editMode) {
    return createElement(Tag, { className, style }, value)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      if (ref.current) ref.current.textContent = value
      setEditing(false)
    }
    if (e.key === "Enter" && !e.shiftKey && Tag !== "p") {
      e.preventDefault()
      commit()
    }
  }

  return createElement(Tag, {
    ref,
    suppressContentEditableWarning: true,
    contentEditable: editing,
    onDoubleClick: () => setEditing(true),
    onBlur: () => {
      if (editing) commit()
    },
    onKeyDown,
    className: cn(className, ringClass),
    style,
    children: !editing ? value : null,
  })
}
