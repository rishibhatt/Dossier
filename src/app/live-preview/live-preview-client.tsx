"use client"

import { useSearchParams } from "next/navigation"
import { startTransition, useCallback, useEffect, useMemo, useState } from "react"

import { LinkButton } from "@/components/atoms/LinkButton"
import { JsxRenderer } from "@/features/jsx-engine/jsxRenderer"
import { readLiveJsxSession, writeLiveJsxSession } from "@/features/jsx-engine/livePreviewSession"
import type { GenerationDesignIntent } from "@/features/jsx-engine/intentTransform"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const SAMPLE_PROJECTS = {
  items: [
    {
      name: "Atlas Console",
      description: "Real-time observability surface for platform teams.",
      tech: ["Next.js", "TypeScript", "Framer Motion"],
    },
    {
      name: "Northwind Ledger",
      description: "Composable billing primitives with audit-grade trails.",
      tech: ["React", "Postgres", "Edge"],
    },
  ],
}

const SAMPLE_HERO = {
  name: "Jordan Lee",
  title: "Product engineer",
  tagline: "Shipping interfaces that feel inevitable.",
}

const SAMPLE_ABOUT = {
  body: "I build design-led software at the intersection of systems thinking and craft.",
}

type ApiOk = {
  ok: true
  fallback: boolean
  compiledExecutable: string
  intent?: GenerationDesignIntent
  attempts?: number
}

type ApiErr = { error: string }

export function LivePreviewClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("s")

  const [sectionType, setSectionType] = useState<"projects" | "hero" | "about">("projects")
  const [dataJson, setDataJson] = useState(() => JSON.stringify(SAMPLE_PROJECTS, null, 2))
  const [userPrompt, setUserPrompt] = useState(
    "Make projects section where on hover each card expands slightly and reveals description with a soft blur panel behind the text."
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compiled, setCompiled] = useState<string | null>(null)
  const [fallback, setFallback] = useState(false)
  const [intent, setIntent] = useState<GenerationDesignIntent | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const payload = readLiveJsxSession(sessionId)
    if (payload) {
      startTransition(() => {
        setCompiled(payload.compiledExecutable)
        setError(null)
      })
    }
  }, [sessionId])

  const componentProps = useMemo(() => {
    try {
      return { data: JSON.parse(dataJson) as unknown }
    } catch {
      return { data: null, parseError: true }
    }
  }, [dataJson])

  const generate = useCallback(async () => {
    let sectionData: unknown
    try {
      sectionData = JSON.parse(dataJson)
    } catch {
      setError("Section data must be valid JSON.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/jsx-engine/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType,
          sectionData,
          userPrompt,
        }),
      })
      const body = (await res.json()) as ApiOk | ApiErr
      if (!res.ok) {
        if ("error" in body && body.error === "groq_missing") {
          setError("GROQ_API_KEY is not configured on the server.")
        } else {
          setError("Request failed.")
        }
        return
      }
      if (!("compiledExecutable" in body) || !body.compiledExecutable) {
        setError("Empty response.")
        return
      }
      setCompiled(body.compiledExecutable)
      setFallback(Boolean(body.fallback))
      setIntent(body.intent ?? null)
    } catch {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }, [dataJson, sectionType, userPrompt])

  const openNewTab = useCallback(() => {
    if (!compiled || typeof window === "undefined") return
    const id = crypto.randomUUID()
    const ok = writeLiveJsxSession(id, { compiledExecutable: compiled, componentProps })
    if (!ok) {
      setError("Could not save preview session (storage blocked).")
      return
    }
    window.open(`/live-preview?s=${encodeURIComponent(id)}`, "_blank", "noopener,noreferrer")
  }, [compiled, componentProps])

  return (
    <div className="mx-auto max-w-6xl px-gutter py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="typo-label-sm text-muted-foreground">Experimental</p>
          <h1 className="typo-h1 mt-1">Live JSX engine</h1>
          <p className="mt-2 max-w-xl typo-body-md text-muted-foreground">
            Groq generates a sandboxed React function; the server transpiles JSX, then the client runs it with React +
            Framer Motion only.
          </p>
        </div>
        <LinkButton href={ROUTES.build} variant="outline" size="sm">
          Back to build
        </LinkButton>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <div className="space-y-2">
            <Label>Section</Label>
            <div className="flex flex-wrap gap-2">
              {(["projects", "hero", "about"] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={sectionType === t ? "default" : "outline"}
                  onClick={() => {
                    setSectionType(t)
                    if (t === "projects") setDataJson(JSON.stringify(SAMPLE_PROJECTS, null, 2))
                    if (t === "hero") setDataJson(JSON.stringify(SAMPLE_HERO, null, 2))
                    if (t === "about") setDataJson(JSON.stringify(SAMPLE_ABOUT, null, 2))
                  }}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsx-data">Section data (JSON)</Label>
            <Textarea id="jsx-data" value={dataJson} onChange={(e) => setDataJson(e.target.value)} className="min-h-40 font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsx-prompt">Interaction + style instructions</Label>
            <Textarea
              id="jsx-prompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-32 text-sm"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void generate()} disabled={loading}>
              {loading ? "Generating…" : "Generate JSX"}
            </Button>
            <Button type="button" variant="secondary" disabled={!compiled} onClick={openNewTab}>
              Open in new tab
            </Button>
          </div>

          {intent ? (
            <p className="text-xs text-muted-foreground">
              Intent: {intent.styleLabel} · motion {intent.motionProfile} · {intent.density}
              {fallback ? " · used fallback component" : ""}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "min-h-[24rem] rounded-xl border border-border bg-background p-4",
            sessionId ? "ring-1 ring-primary/30" : ""
          )}
        >
          {sessionId && !compiled ? (
            <p className="text-sm text-muted-foreground">Loading shared session…</p>
          ) : null}
          {compiled ? <JsxRenderer compiledExecutable={compiled} componentProps={componentProps} /> : null}
          {!compiled && !sessionId ? (
            <p className="text-sm text-muted-foreground">Generate to preview AI output here.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
