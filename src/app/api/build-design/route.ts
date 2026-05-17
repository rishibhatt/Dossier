import { z } from "zod"

import { applyNlDesignHints } from "@/lib/design/applyNlDesignHints"
import { buildDesignConfig } from "@/lib/designEngine"
import { DESIGN_DIRECTION_IDS } from "@/lib/design/designDirectionIds"
import type { ParsedResume } from "@/lib/parseResume"
import type { DesignDirectionId } from "@/types/resolvedDesignConfig"

export const runtime = "nodejs"

const bodySchema = z.object({
  parsedResume: z.unknown(),
  direction: z.string(),
  variationSeed: z.number().int().min(0).max(2_000_000_000).optional(),
  visionNote: z.string().max(2000).optional(),
})

function isParsedResume(v: unknown): v is ParsedResume {
  return Boolean(v && typeof v === "object" && "signals" in (v as ParsedResume) && "name" in (v as ParsedResume))
}

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success || !isParsedResume(parsed.data.parsedResume)) {
    return Response.json({ error: "invalid_body" }, { status: 400 })
  }

  const dir = parsed.data.direction
  if (!(DESIGN_DIRECTION_IDS as readonly string[]).includes(dir)) {
    return Response.json({ error: "invalid_direction" }, { status: 400 })
  }

  const seed = parsed.data.variationSeed ?? 0
  let designConfig = buildDesignConfig(parsed.data.parsedResume, dir as DesignDirectionId, seed)
  const note = parsed.data.visionNote?.trim()
  if (note) {
    designConfig = applyNlDesignHints(designConfig, note)
  }
  return Response.json({ designConfig })
}
