import { buildDesignConfig } from "@/lib/designEngine"
import type { DesignConfig } from "@/types/designEngine"
import type { ParsedResume } from "@/lib/parseResume"

function isResolvedDesign(c: DesignConfig): boolean {
  return Boolean(c.tokens?.colors?.bg && c.meta?.direction)
}

/**
 * Re-runs the resolved design engine with a new seed (and optional resume context).
 * Without `parsed`, only updates meta.variationSeed (no-op structurally).
 */
export function applyDesignVariation(
  config: DesignConfig,
  variationSeed: number,
  parsed?: ParsedResume | null
): DesignConfig {
  if (isResolvedDesign(config) && parsed) {
    return buildDesignConfig(parsed, config.meta.direction, variationSeed)
  }
  return {
    ...config,
    meta: { ...config.meta, variationSeed },
  }
}
