const PREFIX = "dossier:live-jsx:v1:"
const TTL_MS = 1000 * 60 * 30

export type LiveJsxSessionPayload = {
  compiledExecutable: string
  componentProps: Record<string, unknown>
}

type Envelope = LiveJsxSessionPayload & { created: number }

export function writeLiveJsxSession(id: string, payload: LiveJsxSessionPayload): boolean {
  if (typeof window === "undefined") return false
  try {
    const env: Envelope = { ...payload, created: Date.now() }
    window.localStorage.setItem(PREFIX + id, JSON.stringify(env))
    return true
  } catch {
    return false
  }
}

export function readLiveJsxSession(id: string): LiveJsxSessionPayload | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(PREFIX + id)
    if (!raw) return null
    const env = JSON.parse(raw) as Envelope
    if (!env?.compiledExecutable) return null
    if (Date.now() - env.created > TTL_MS) {
      window.localStorage.removeItem(PREFIX + id)
      return null
    }
    const { compiledExecutable, componentProps } = env
    return { compiledExecutable, componentProps: componentProps ?? {} }
  } catch {
    return null
  }
}
