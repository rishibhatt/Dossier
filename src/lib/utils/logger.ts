/**
 * Lightweight structured logging for LLM / pipeline paths.
 * Enable with `LLM_DEBUG=1` in env.
 */
const enabled = () => process.env.LLM_DEBUG === "1" || process.env.NODE_ENV === "development"

export const llmLogger = {
  info(event: string, fields: Record<string, unknown> = {}) {
    if (!enabled()) return
    // eslint-disable-next-line no-console -- intentional debug channel
    console.info(`[llm] ${event}`, fields)
  },
  warn(event: string, fields: Record<string, unknown> = {}) {
    if (!enabled()) return
    // eslint-disable-next-line no-console
    console.warn(`[llm] ${event}`, fields)
  },
  error(event: string, fields: Record<string, unknown> = {}) {
    // eslint-disable-next-line no-console
    console.error(`[llm] ${event}`, fields)
  },
}
