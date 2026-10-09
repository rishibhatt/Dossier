export type { DesignBrief, DesignTemplate, TemplateEmphasis, TemplateSpec, TemplateTone } from "./types"
export { TEMPLATES, getTemplate, normalizeCategory, recommendTemplates } from "./recommend"
export {
  DEFAULT_TEMPLATE_ID,
  buildConfigForDirection,
  buildConfigFromTemplate,
  templatesForDirection,
  getTemplateSpec,
  orderSectionsForTemplate,
  presentSectionTypes,
  reorderSectionsByTemplate,
  type BuildFromTemplateOptions,
} from "./build"
export { TEMPLATE_SPECS } from "./specs"
export { checkPaletteContrast, contrastRatio } from "./contrast"
export { STYLE_PRESET_TEMPLATE_BIAS } from "./presetBias"
