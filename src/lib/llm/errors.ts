export class LLMHttpError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "LLMHttpError"
    this.status = status
  }
}
