import { ACTION_VERBS, toPast } from "@/features/tools/atsScan"

/**
 * Resume bullet generator: rule-based, runs in the browser. It cleans the opener of what the person did,
 * then joins the parts into the formulas recruiters expect (action then result, result first, short, tool named).
 * A part left blank is dropped, never printed as a placeholder.
 */
export type BulletInput = { action: string; tool: string; scale: string; result: string; number: string }
export type BulletOut = { formula: string; text: string }
export type BulletNote = { id: "weak" | "noverb" | "nonumber" | "long"; text: string }

export const BULLET_LIMIT = 200

/** The ATS scanner hands a weak bullet over through this sessionStorage key, so resume text never goes in a URL. */
export const BULLET_HANDOFF_KEY = "dossier:bullet-handoff"

const WEAK_OPENERS =
  /^(?:i\s+)?(?:was\s+)?(?:responsible\s+for|in\s+charge\s+of|tasked\s+with|involved\s+in|participated\s+in|helped(?:\s+(?:to|with))?|assisted(?:\s+(?:with|in))?|worked\s+on|duties\s+included|handled|utili[sz]ed)\s+/i

/** Past tense to -ing, for "result first" ("Raised conversion by 34% by rebuilding ..."). Null when unsure. */
const IRREGULAR_ING: Record<string, string> = {
  built: "building", rebuilt: "rebuilding", led: "leading", ran: "running", wrote: "writing", rewrote: "rewriting", cut: "cutting",
  grew: "growing", made: "making", sold: "selling", taught: "teaching", won: "winning", drove: "driving", set: "setting",
  kept: "keeping", held: "holding", oversaw: "overseeing", began: "beginning", chose: "choosing", gave: "giving", took: "taking",
  put: "putting", brought: "bringing", spoke: "speaking", met: "meeting", found: "finding", shipped: "shipping", planned: "planning",
}

function clean(s: string) {
  return s.trim().replace(/\s+/g, " ").replace(/[.;,\s]+$/, "")
}

const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s)
const low = (s: string) => (s && !/^[A-Z]{2,}/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s)

export function toGerund(past: string): string | null {
  const w = past.toLowerCase()
  if (IRREGULAR_ING[w]) return IRREGULAR_ING[w]
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}ying`
  if (w.endsWith("ed") && w.length > 4) return `${w.slice(0, -2)}ing`
  return null
}

const firstWord = (s: string) => (s.split(" ")[0] ?? "").toLowerCase().replace(/[^a-z]/g, "")
const isPastVerb = (w: string) => ACTION_VERBS.has(w) || Boolean(IRREGULAR_ING[w]) || /^[a-z]{3,}ed$/.test(w)

/** Strips a weak opener and turns a leading -ing verb into the past tense. Reports what it changed. */
export function cleanAction(raw: string): { text: string; weak: boolean; verb: boolean } {
  let t = clean(raw).replace(/^[-•*·▪]\s*/, "")
  const weak = WEAK_OPENERS.test(t)
  t = t.replace(WEAK_OPENERS, "")
  const w = firstWord(t)
  if (w.endsWith("ing")) {
    const past = toPast(w)
    if (past) t = `${past}${t.slice(w.length)}`
  }
  return { text: cap(t), weak, verb: isPastVerb(firstWord(t)) }
}

/** A bare "34%" or "3x" reads as "by 34%". Anything with words ("from 12 to 4 days", "about 3 hours a week") stays as written. */
function numberPhrase(n: string) {
  const x = clean(n)
  if (!x) return ""
  return /^~?[\d.,]+\s*(?:%|x|percent)$/i.test(x) ? `by ${x}` : x
}

export function buildBullets(raw: BulletInput): { bullets: BulletOut[]; notes: BulletNote[] } {
  const { text: action, weak, verb } = cleanAction(raw.action)
  if (!action) return { bullets: [], notes: [] }
  // Without a verb the formulas produce fragments ("Customer tickets using Zendesk."), so ask for one instead.
  if (!verb) return { bullets: [], notes: [{ id: "noverb", text: "Start with a past-tense verb for what you did. Tap one of the verbs under the box, or type your own." }] }
  const tool = clean(raw.tool)
  const scale = clean(raw.scale)
  const result = low(clean(raw.result))
  const num = numberPhrase(raw.number)
  const outcome = [result, num].filter(Boolean).join(" ")

  const withTool = tool ? `${action} ${/^(using|with|in|on|through|via)\b/i.test(tool) ? tool : `using ${tool}`}` : action
  const withScale = scale ? `${withTool} ${/^(for|across|at|with|over)\b/i.test(scale) ? scale : `for ${scale}`}` : withTool

  const out: BulletOut[] = []
  out.push({ formula: "Action, then result", text: outcome ? `${withScale}, which ${outcome}.` : `${withScale}.` })

  const gerund = toGerund(firstWord(action))
  if (outcome && gerund && result) {
    const rest = withScale.slice(firstWord(action).length)
    out.push({ formula: "Result first", text: `${cap(outcome)} after ${gerund}${rest}.` })
  }

  if (outcome) {
    // "Rebuilt the onboarding emails, raising conversion by 34%." Falls back to a semicolon when the result has no past verb to turn.
    const rv = firstWord(result)
    const rIng = result ? toGerund(rv) : null
    out.push({ formula: "Short", text: rIng ? `${action}, ${rIng}${outcome.slice(rv.length)}.` : `${action}; ${outcome}.` })
  }
  const toolName = tool.replace(/^(using|with|in|on|through|via)\s+/i, "")
  if (tool && outcome) out.push({ formula: "Tool named first", text: `Using ${toolName}, ${low(action)}${scale ? ` ${withScale.slice(withTool.length).trim()}` : ""}, which ${outcome}.` })

  const seen = new Set<string>()
  const bullets = out.filter((b) => {
    const k = b.text.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  const notes: BulletNote[] = []
  if (weak) notes.push({ id: "weak", text: "Removed a weak opener. The bullet now starts with what you did." })
  if (!num && !/\d/.test(action)) notes.push({ id: "nonumber", text: "Add a number. How many, how much, how fast? An honest estimate with \"about\" beats none." })
  if (bullets.some((b) => b.text.length > BULLET_LIMIT)) notes.push({ id: "long", text: `Some versions run past ${BULLET_LIMIT} characters. Use the short one, or trim the detail.` })
  return { bullets, notes }
}

/** Swap list shown under the form. Grouped loosely by the kind of work, each one a past tense ready to drop in. */
export const SWAP_VERBS = ["Built", "Launched", "Cut", "Grew", "Led", "Automated", "Negotiated", "Redesigned", "Resolved", "Trained"] as const

export function swapVerb(action: string, verb: string): string {
  const { text } = cleanAction(action)
  const w = text.split(" ")[0] ?? ""
  return isPastVerb(w.toLowerCase()) ? `${verb}${text.slice(w.length)}` : `${verb} ${low(text)}`
}
