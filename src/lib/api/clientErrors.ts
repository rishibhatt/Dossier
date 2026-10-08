/** Maps guard error codes from API routes to user-facing text. Safe to import in client components. */
export function describeApiError(
  status: number,
  body: { error?: string; message?: string } | null,
  fallback: string
): string {
  switch (body?.error) {
    case "unauthorized":
      return body.message ?? "Sign in to continue."
    case "plan_required":
      return body.message ?? "This feature needs a paid plan."
    case "quota_exceeded":
      return "Daily limit reached. Try again tomorrow or upgrade your plan."
    case "portfolio_limit":
      return body.message ?? "Portfolio limit reached for your plan."
    case "payload_too_large":
      return "This portfolio is too large to publish. Remove large images and retry."
    case "quota_unavailable":
      return "Service is temporarily unavailable. Try again shortly."
    default:
      return status === 401 ? "Sign in to continue." : (body?.message ?? fallback)
  }
}

export async function readApiError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
  return describeApiError(res.status, body, fallback)
}
