/**
 * Design engine public types — resolved concrete config (v2).
 * Legacy abstract enums were removed; all values live in `DesignConfig.tokens`.
 */

export type {
  DesignConfig,
  DesignConfigMeta,
  DesignDirectionId,
  DesignColorTokens,
  DesignGradientTokens,
  DesignTypographyTokens,
  DesignTypographyScale,
  DesignSpacingTokens,
  DesignEffectsTokens,
  DesignTokenBundle,
  DesignLayoutBlock,
  DesignMotionBlock,
  DesignComponentsBlock,
  ProfessionSpecifics,
  DesignSectionPlan,
  MotionVariantJson,
  LayoutType,
  HeroVariant,
  NavStyle,
  MotionPreset,
  ComponentCardStyle,
  ComponentButtonStyle,
  ComponentBadgeStyle,
  ComponentDividerStyle,
  ComponentCursorStyle,
  ComponentScrollIndicator,
} from "@/types/resolvedDesignConfig"

export type { DesignLayoutKey, DesignUserType } from "@/types/resolvedDesignConfig"
