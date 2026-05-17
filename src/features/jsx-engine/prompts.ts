import type { GenerationDesignIntent } from "@/features/jsx-engine/intentTransform"
import {
  getGenerationConstraintBlock,
  getStylePromptBlock,
  type PortfolioStylePreset,
} from "@/lib/design/stylePrompts"
import type { DesignSpec } from "@/types/design"

export type SectionKind = "projects" | "hero" | "about"

const AWWARD_RULES = `You are an award-winning web designer (Awwwards / Framer / siteInspire).

Design a high-end portfolio section.

STRICT rules:
- Avoid generic card grids unless there is a strong editorial or interactive reason
- Strong typography hierarchy — oversized headlines where appropriate
- Prefer asymmetrical layouts over perfectly centered tile grids
- Interaction is mandatory: hover, scroll, or view-based motion must change meaning (reveal content), not only decorate
- Clean spacing; intentional negative space

${getGenerationConstraintBlock()}`

const BASE_RULES = `Hard rules (violations = reject):
- Output ONE top-level function only: function GeneratedSection(props) { ... }
- NO import / export / require / dynamic
- NO hooks: useEffect, useLayoutEffect, useState, useReducer, useMemo, useCallback, useRef, useContext, useSyncExternalStore
- NO fetch, XMLHttpRequest, WebSocket, eval, Function constructor, dangerouslySetInnerHTML
- NO window, document, localStorage, sessionStorage, location, navigator
- Use only: React (global), motion (global from framer-motion), props, literals, Array/Object/Math methods
- Tailwind utility classes on className strings only (no arbitrary JS in className beyond template literals from safe props)
- Fully responsive: use sm/md/lg breakpoints where helpful
- Use motion.* for at least one animated element when motion profile is not subtle`

export function buildSectionJsxSystemPrompt(
  sectionType: SectionKind,
  intent: GenerationDesignIntent,
  portfolioStylePreset?: PortfolioStylePreset
): string {
  const sectionLabel =
    sectionType === "projects" ? "Projects" : sectionType === "hero" ? "Hero" : "About"

  const styleRef = portfolioStylePreset
    ? `\nDesign style (reference — obey closely):\n${getStylePromptBlock(portfolioStylePreset)}\n`
    : ""

  return `${AWWARD_RULES}
${styleRef}
You are also an expert React engineer. Generate a React function component using JSX that will run with React + framer-motion injected as globals (no imports).

Section: ${sectionLabel}

Design intent (motion/spacing from UI layer):
- Visual style: ${intent.styleLabel}
- Motion profile: ${intent.motionProfile} (${intent.motionProfile === "subtle" ? "barely-there transitions" : intent.motionProfile === "expressive" ? "smooth, confident motion" : "bold staggered / playful motion"})
- Spacing density: ${intent.density}

${BASE_RULES}

Return ONLY the raw source code of the function (no markdown fences, no commentary before or after).`
}

export function buildStrictRetrySystemPrompt(
  sectionType: SectionKind,
  intent: GenerationDesignIntent,
  portfolioStylePreset?: PortfolioStylePreset
): string {
  return `${buildSectionJsxSystemPrompt(sectionType, intent, portfolioStylePreset)}

Your previous output failed validation or compilation. Try again with a SMALLER component:
- Fewer nested elements
- Prefer motion.div with whileHover / whileInView / transition
- Still meet the design intent but simplify structure.`
}

/** User message for Groq: structured design contract + section data — no raw vague prompt field. */
export function buildDesignSpecSectionPayload(input: {
  sectionType: SectionKind
  sectionData: unknown
  designSpec: DesignSpec
}): string {
  return JSON.stringify(
    {
      sectionType: input.sectionType,
      sectionData: input.sectionData,
      designSpec: input.designSpec,
      /** Redundant copy for models that weigh top-level prose heavily */
      generationBrief: input.designSpec.enrichedPrompt,
    },
    null,
    2
  )
}

/** Compact system appendix so the model obeys tokens + layout even if JSON is long. */
export function summarizeDesignSpecForSystem(spec: DesignSpec): string {
  return [
    "## Structured design spec (authoritative)",
    `- style: ${spec.style}`,
    `- layout.strategy: ${spec.layout.strategy}; asymmetry: ${spec.layout.asymmetryBias}`,
    spec.layout.hero ? `- hero min vh: ${spec.layout.hero.minHeightVh}` : "",
    spec.layout.projectsPresentation ? `- projects mode: ${spec.layout.projectsPresentation}` : "",
    `- motion: ${spec.motion.type} (${spec.motion.duration}s, ${spec.motion.easing})`,
    `- colors: bg ${spec.color.background}, fg ${spec.color.foreground}, accent ${spec.color.accent}`,
    `- type: heading ${spec.typography.headingScale}, body ${spec.typography.bodyScale}`,
    "",
    "## Interaction + constraints",
    ...spec.interactionRules.map((r) => `- ${r}`),
    ...spec.constraints.map((r) => `- ${r}`),
  ]
    .filter(Boolean)
    .join("\n")
}
