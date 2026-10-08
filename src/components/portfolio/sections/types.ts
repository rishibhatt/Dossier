import type { ComponentType, ElementType } from "react"

import type { DesignConfig } from "@/types/designEngine"
import type { PortfolioDocument, PortfolioSection, PortfolioSectionType } from "@/types/dossier"

/** Address of one editable string inside a section (item index / bullet index when the field lives in a list). */
export type TextPath = { sectionId: string; field: string; index?: number; sub?: number }

export type TextProps = {
  path: TextPath
  value: string
  as?: ElementType
  className?: string
  /** Split into word masks (hero line reveal). Ignored while editing. */
  split?: boolean
  /** Render `\n\n` paragraphs as <p> (as should be a block element). */
  paragraphs?: boolean
  /** Extra attributes for the element (data-*). */
  attrs?: Record<string, string>
}

/**
 * Text renderer slot. Pure `PlainText` on the server and in exports, `EditableText` in the studio.
 * Sections never import client code, so the same tree renders through react-dom/server.
 */
export type TextSlot = ComponentType<TextProps>

export type RenderCtx = {
  config: DesignConfig
  doc: PortfolioDocument
  T: TextSlot
  /** Studio edit mode: render empty fields as prompts instead of hiding them. */
  editing: boolean
}

export type SectionOf<K extends PortfolioSectionType> = Extract<PortfolioSection, { type: K }>

export type VariantProps<K extends PortfolioSectionType> = { section: SectionOf<K>; ctx: RenderCtx }

export type SectionModule<K extends PortfolioSectionType> = {
  /** Variant id -> renderer. Ids are exact; no substring matching. */
  variants: Record<string, ComponentType<VariantProps<K>>>
  fallback: string
  /** True when the section has nothing worth showing publicly. */
  isEmpty: (section: SectionOf<K>) => boolean
}
