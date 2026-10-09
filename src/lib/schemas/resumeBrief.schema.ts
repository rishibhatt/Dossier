import { z } from "zod"

/**
 * Lenient coercions: free models return nulls, numbers and strings-for-arrays, so shape noise never fails.
 * Usability (is there a name and a body?) is judged separately by the router's `accept` check, which falls
 * through to the next model instead of keeping an empty answer.
 */
const str = z.unknown().transform((v) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : ""))

const strList = z.unknown().transform((v): string[] => {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x.trim() : typeof x === "number" ? String(x) : "")).filter(Boolean)
  if (typeof v === "string") return v.split(/\n|;|•/).map((x) => x.trim()).filter(Boolean)
  return []
})

const list = <T extends z.ZodType>(item: T) =>
  z.unknown().transform((v): z.output<T>[] => {
    if (!Array.isArray(v)) return []
    const out: z.output<T>[] = []
    for (const x of v) {
      const r = item.safeParse(x)
      if (r.success) out.push(r.data as z.output<T>)
    }
    return out
  })

const obj = <T extends z.ZodRawShape>(shape: T) => z.object(shape).catch(() => z.object(shape).parse({}))

/**
 * Compact single-call output (short keys, expanded in code):
 * n name, t title, loc location, ab about (first person), pitch hero line, k skills,
 * e experience {c company, r role, d dates, l location, b bullets}, p projects {n, d desc, t tech, u url},
 * ed education {i school, d degree, p period, x details}, cert {n name, i issuer, y year},
 * h highlights {v value, l label}, ct contact {e email, p phone, l links}, b brief {c category, t tone, m emphasis}.
 */
export const compactResumeSchema = z.object({
  n: str,
  t: str,
  loc: str,
  ab: str,
  pitch: str,
  k: strList,
  e: list(z.object({ c: str, r: str, d: str, l: str, b: strList })),
  p: list(z.object({ n: str, d: str, t: strList, u: str })),
  ed: list(z.object({ i: str, d: str, p: str, x: str })),
  cert: list(z.object({ n: str, i: str, y: str })),
  h: list(z.object({ v: str, l: str })),
  ct: obj({ e: str, p: str, l: strList }),
  b: obj({ c: str, t: str, m: str }),
})

export type CompactResume = z.output<typeof compactResumeSchema>
