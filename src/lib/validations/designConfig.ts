import { z } from "zod"

import type { DesignConfig } from "@/types/designEngine"

function isResolvedDesign(v: unknown): v is DesignConfig {
  const c = v as DesignConfig
  return Boolean(
    c &&
      typeof c === "object" &&
      typeof c.meta?.direction === "string" &&
      (c.meta.templateId === undefined || typeof c.meta.templateId === "string") &&
      typeof c.tokens?.colors?.bg === "string" &&
      Array.isArray(c.sections)
  )
}

export const designConfigSchema = z.custom<DesignConfig>(isResolvedDesign, {
  message: "invalid_resolved_design_config",
})

export type DesignConfigParsed = z.infer<typeof designConfigSchema>
