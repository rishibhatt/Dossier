import type { SectionKind } from "@/features/jsx-engine/prompts"

export type JsxQualityResult = { ok: true } | { ok: false; reason: string }

/**
 * Lightweight static heuristics — rejects obviously generic / static output before runtime compile.
 */
export function assessGeneratedJsxQuality(source: string, sectionType: SectionKind): JsxQualityResult {
  const lower = source.toLowerCase()

  if (!/motion\.\w+/.test(source)) {
    return { ok: false, reason: "missing_motion_primitives" }
  }

  const hasHoverReveal =
    /whilehover|whilehover|whileinview|group-hover|opacity-|translate-|clip-|height:\s*\[|max-h-0|overflow-hidden/.test(
      lower
    )
  const hasTypography =
    /text-(?:3xl|4xl|5xl|6xl|7xl|8xl|\[)|text-2xl|font-(black|bold|semibold|extrabold)|tracking-tight|leading-none/.test(
      lower
    )

  if (!hasTypography) {
    return { ok: false, reason: "weak_typographic_hierarchy" }
  }

  if (sectionType === "projects") {
    if (/grid-cols-[3-6]/.test(lower)) {
      const hasRichInteraction = /whilehover|whileinview|group-hover|opacity-0|translate|overflow-x-auto|snap-|mask-|clip-/.test(
        lower
      )
      if (!hasRichInteraction) {
        return { ok: false, reason: "static_dense_project_grid" }
      }
    }

    if (
      !hasHoverReveal &&
      !/horizontal|snap|overflow-x|flex-nowrap|basis-|min-w-\[|split|overlay|scrim|gradient|md:grid-cols-\[|lg:col-span/.test(
        lower
      )
    ) {
      return { ok: false, reason: "projects_missing_interaction_or_layout_depth" }
    }
  }

  return { ok: true }
}
