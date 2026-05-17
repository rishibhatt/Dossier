"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Component, type ErrorInfo, type ReactNode, useMemo } from "react"

export type JsxRendererProps = {
  compiledExecutable: string
  /** Passed as props to GeneratedSection — shape should match what the prompt described. */
  componentProps: Record<string, unknown>
}

type InnerProps = {
  compiledExecutable: string
  componentProps: Record<string, unknown>
}

function createRuntimeComponent(compiledExecutable: string): React.ComponentType<Record<string, unknown>> | null {
  try {
    const factory = new Function(
      "React",
      "motion",
      `"use strict";\n${compiledExecutable}\nreturn GeneratedSection;`
    ) as (r: typeof React, m: typeof motion) => React.ComponentType<Record<string, unknown>>
    return factory(React, motion)
  } catch {
    return null
  }
}

class JsxRenderErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[JsxRenderer]", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Runtime error in generated UI</p>
          <p className="mt-1 opacity-90">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

function JsxRendererInner({ compiledExecutable, componentProps }: InnerProps) {
  const Comp = useMemo(() => createRuntimeComponent(compiledExecutable), [compiledExecutable])

  if (!Comp) {
    return (
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
        Could not load generated component (compile or sandbox error).
      </p>
    )
  }

  /* Dynamic component from controlled server compile + new Function — not a stable module declaration. */
  return React.createElement(Comp, componentProps)
}

export function JsxRenderer({ compiledExecutable, componentProps }: JsxRendererProps) {
  return (
    <JsxRenderErrorBoundary key={compiledExecutable}>
      <JsxRendererInner compiledExecutable={compiledExecutable} componentProps={componentProps} />
    </JsxRenderErrorBoundary>
  )
}
