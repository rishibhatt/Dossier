import covers from "../../../content/resume-templates/covers.json"

/**
 * One page-one image per template (its first showcase sample, A4), written by scripts/resume/thumbnails.ts.
 * Small on purpose: the editor's template picker imports it on the client.
 */
export const TEMPLATE_COVERS = covers as Record<string, { src: string; sample: string }>
