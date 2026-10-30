"use client"

import type { WorkerRequest, WorkerResponse } from "./protocol"

type Pending = { resolve: (r: WorkerResponse) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }

/** First load downloads and compiles ~7 MB of wasm; after that every request should answer in milliseconds. */
const BOOT_TIMEOUT_MS = 90_000
/** A compile that runs longer than this is treated as stuck (an endless loop in custom code, say). */
const COMPILE_TIMEOUT_MS = 3_000

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never
type RequestBody = DistributiveOmit<WorkerRequest, "id">

/**
 * Talks to the typesetter worker. If a compile hangs past the watchdog, the worker is terminated and a fresh
 * one starts on the next request (the wasm module comes back from the HTTP cache in about 50 ms).
 */
class TypstClient {
  private worker: Worker | null = null
  private seq = 0
  private pending = new Map<number, Pending>()
  private booted = false

  private spawn() {
    const w = new Worker(new URL("./typst.worker.ts", import.meta.url), { type: "module", name: "dossier-typst" })
    w.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const p = this.pending.get(e.data.id)
      if (!p) return
      clearTimeout(p.timer)
      this.pending.delete(e.data.id)
      this.booted = true
      p.resolve(e.data)
    }
    w.onerror = (e) => this.crash(new Error(e.message || "The typesetter stopped."))
    this.worker = w
    return w
  }

  private crash(err: Error) {
    this.worker?.terminate()
    this.worker = null
    this.booted = false
    for (const p of this.pending.values()) {
      clearTimeout(p.timer)
      p.reject(err)
    }
    this.pending.clear()
  }

  get isBooted() {
    return this.booted
  }

  request(body: RequestBody): Promise<WorkerResponse> {
    const worker = this.worker ?? this.spawn()
    const id = ++this.seq
    // Reading someone's PDF or extracting text loads pdf.js the first time, so it gets longer than a compile.
    const timeout = !this.booted ? BOOT_TIMEOUT_MS : body.type === "extract" || body.type === "text" ? 20_000 : COMPILE_TIMEOUT_MS
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => this.crash(new Error(this.booted ? "This took too long to typeset, so it was stopped." : "The typesetter took too long to load. Check your connection and try again.")),
        timeout,
      )
      this.pending.set(id, { resolve, reject, timer })
      const msg = { ...body, id } as WorkerRequest
      worker.postMessage(msg, msg.type === "extract" ? [msg.bytes.buffer] : [])
    })
  }
}

let client: TypstClient | null = null

export function getTypstClient() {
  if (typeof window === "undefined") throw new Error("The typesetter only runs in the browser.")
  client ??= new TypstClient()
  return client
}
