/** Maximum PDF upload size (bytes). Netlify functions accept about 4.5 MB of request body, so stay under it. */
export const PDF_UPLOAD_MAX_BYTES = 4 * 1024 * 1024

export const PDF_ALLOWED_MIME_TYPES = ["application/pdf"] as const
